import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock, TriangleAlert } from "lucide-react";

import { SiteFooter } from "@/components/blog/footer";
import { SiteHeader } from "@/components/blog/header";
import { PostCard } from "@/components/blog/post-card";
import { Sidebar } from "@/components/blog/sidebar";
import { T } from "@/components/blog/t";
import { getAuthorBySlug, getCategories, getPostsByAuthor, toPostSummaries } from "@/lib/wordpress";

type AuthorPageProps = { params: Promise<{ slug: string }> };

/** Hourly refresh, mirroring the data-layer cache window. */
export const revalidate = 3600;

/** Stories pulled for the archive. */
const AUTHOR_POST_COUNT = 50;

export async function generateMetadata({ params }: AuthorPageProps): Promise<Metadata> {
  const { slug } = await params;
  const { author } = await getAuthorBySlug(slug);

  if (!author) {
    return { title: "Auteur introuvable — TechPulse" };
  }

  return { title: `${author.name} — TechPulse`, description: `Articles de ${author.name}.` };
}

/**
 * Author archive — `/blog/author/[slug]`.
 *
 * Reuses the shared 12-column reading grid the rest of the magazine uses: the
 * editorial profile card and the `PostCard` grid live in the 8-column track and
 * the shared `<Sidebar />` (recommended-reading rail omitted, Premium upsell,
 * desk index, Premium picks, sponsor slot) owns the 4-column track. Below `lg`
 * the grid collapses and the sidebar simply flows under the stories.
 *
 * A CMS outage renders the designed empty state with the error text instead of
 * failing; an unknown slug that the CMS *did* answer for resolves to `notFound()`.
 */
export default async function AuthorPage({ params }: AuthorPageProps) {
  const { slug } = await params;
  const [{ author, error: authorError }, { posts, error: postsError }, categories] =
    await Promise.all([
      getAuthorBySlug(slug),
      getPostsByAuthor(slug, AUTHOR_POST_COUNT),
      getCategories(),
    ]);
  const error = authorError ?? postsError;

  if (!author && !error) {
    notFound();
  }

  return (
    <div className="flex min-h-full flex-col">
      <SiteHeader />

      <main className="mx-auto w-full max-w-[1600px] flex-1 px-4 pt-10 pb-24 sm:px-8 sm:pt-14 lg:px-16">
        <Link
          href="/blog"
          className="inline-flex w-fit items-center gap-2 rounded-lg text-sm text-muted-foreground transition-colors duration-300 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          <T k="common.allStories" />
        </Link>

        <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div className="flex min-w-0 flex-col lg:col-span-8">
            {author ? (
              <header className="flex flex-col gap-5 rounded-3xl border border-border bg-card p-6 sm:flex-row sm:items-center sm:gap-6 sm:p-8">
                {author.avatarUrl ? (
                  <span className="relative block size-20 shrink-0 overflow-hidden rounded-full border border-border bg-surface">
                    <Image
                      src={author.avatarUrl}
                      alt={author.name}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  </span>
                ) : (
                  <span
                    aria-hidden="true"
                    className="flex size-20 shrink-0 items-center justify-center rounded-full bg-primary/15 text-2xl font-semibold text-link"
                  >
                    {authorMonogram(author.name)}
                  </span>
                )}

                <div className="flex min-w-0 flex-col gap-2">
                  <span className="text-[0.7rem] font-semibold tracking-[0.22em] text-primary uppercase">
                    <T k="blog.author.eyebrow" />
                  </span>
                  <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                    {author.name}
                  </h1>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {author.bio || (
                      <T k="blog.author.bioFallback" params={{ name: author.name }} />
                    )}
                  </p>
                  <p className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="size-3.5" aria-hidden="true" />
                    <T k="blog.author.count" params={{ count: posts.length }} />
                  </p>
                </div>
              </header>
            ) : null}

            {posts.length > 0 ? (
              <div className="mt-8 grid grid-cols-1 items-stretch gap-6 md:grid-cols-2 2xl:grid-cols-3">
                {toPostSummaries(posts).map((post, index) => (
                  <PostCard key={post.id} post={post} index={index} />
                ))}
              </div>
            ) : (
              <section
                aria-labelledby="author-empty-heading"
                className="mt-8 flex flex-col items-center gap-4 rounded-3xl border border-border bg-card px-6 py-20 text-center"
              >
                <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/15 text-link">
                  <TriangleAlert className="size-5" aria-hidden="true" />
                </span>

                <h2
                  id="author-empty-heading"
                  className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl"
                >
                  <T k="blog.author.emptyHeading" />
                </h2>

                <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
                  {error ?? <T k="blog.author.countEmpty" />}
                </p>
              </section>
            )}
          </div>

          <Sidebar categories={categories} posts={toPostSummaries(posts)} />
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}

/** Byline monogram, e.g. `"Ada Lovelace"` -> `"AL"`. */
function authorMonogram(name: string): string {
  const monogram = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");

  return monogram || "TP";
}