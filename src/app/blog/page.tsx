import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, TriangleAlert } from "lucide-react";

import { SiteFooter } from "@/components/blog/footer";
import { SiteHeader } from "@/components/blog/header";
import { PostCard } from "@/components/blog/post-card";
import { Sidebar } from "@/components/blog/sidebar";
import { T } from "@/components/blog/t";
import { getCategories, getPosts, toPostSummaries, WORDPRESS_GRAPHQL_ENDPOINT } from "@/lib/wordpress";

export const metadata: Metadata = {
  title: "All stories — TechPulse",
  description:
    "Browse every story published by TechPulse Magazine: AI, infrastructure, security and developer tooling, newest first.",
};

/** Hourly refresh, mirroring the data-layer cache window. */
export const revalidate = 3600;

/** Stories pulled for the archive; matches the article `generateStaticParams` cap. */
const ARCHIVE_POST_COUNT = 50;

/**
 * Blog archive — `/blog`.
 *
 * The full newsroom feed, newest first, rendered beside the sidebar widgets on
 * the 12-column layout (1 / `md:2` / `2xl:3` columns, `items-stretch`) — never
 * more than 3 columns so each card keeps a comfortable measure next to the
 * sidebar. A CMS outage degrades to a designed empty state instead of failing
 * the build.
 */
export default async function BlogIndexPage() {
  const [{ posts, error }, categories] = await Promise.all([
    getPosts({ first: ARCHIVE_POST_COUNT }),
    getCategories(),
  ]);

  return (
    <div className="flex min-h-full flex-col">
      <SiteHeader />

      <main className="mx-auto w-full max-w-[1600px] flex-1 px-4 pt-10 pb-24 sm:px-8 sm:pt-14 lg:px-16">
        <Link
          href="/"
          className="inline-flex w-fit items-center gap-2 rounded-lg text-sm text-muted-foreground transition-colors duration-300 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to the front page
        </Link>

        <div className="mt-6 flex flex-wrap items-end justify-between gap-4 border-b border-border pb-5">
          <div className="flex flex-col gap-2">
            <span className="text-[0.7rem] font-semibold tracking-[0.22em] text-primary uppercase">
              <T k="blog.archive.eyebrow" />
            </span>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              <T k="blog.archive.title" />
            </h1>
          </div>

          <p className="text-sm text-muted-foreground">
            {posts.length > 0 ? (
              <T k="blog.archive.count" params={{ count: posts.length }} />
            ) : (
              <T k="blog.archive.countLoading" />
            )}
          </p>
        </div>

        {posts.length > 0 ? (
          <div className="mt-8 grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
            {/* Sidebar companion grid — capped at two columns, three from `2xl`. */}
            <div className="grid grid-cols-1 items-stretch gap-6 md:grid-cols-2 2xl:grid-cols-3 lg:col-span-8">
              {toPostSummaries(posts).map((post, index) => (
                <PostCard key={post.id} post={post} index={index} />
              ))}
            </div>
            <Sidebar categories={categories} posts={toPostSummaries(posts)} />
          </div>
        ) : (
          <section
            aria-labelledby="archive-empty-heading"
            className="mt-8 flex flex-col items-center gap-4 rounded-3xl border border-border bg-card px-6 py-20 text-center"
          >
            <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/15 text-link">
              <TriangleAlert className="size-5" aria-hidden="true" />
            </span>

            <h2
              id="archive-empty-heading"
              className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl"
            >
              <T k="blog.archive.emptyHeading" />
            </h2>

            <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
              {error
                ? <T k="common.cmsUnavailableBody" params={{ error }} />
                : <T k="blog.archive.emptyBody" />}
            </p>

            <code className="rounded-lg bg-surface px-3 py-1.5 font-mono text-xs break-all text-muted-foreground">
              {WORDPRESS_GRAPHQL_ENDPOINT}
            </code>
          </section>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}
