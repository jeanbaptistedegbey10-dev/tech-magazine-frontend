import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
export const revalidate = 3600;
const CATEGORY_POST_COUNT = 50;
import { ArrowLeft, ArrowRight, TriangleAlert } from "lucide-react";
import { SiteFooter } from "@/components/blog/footer";
import { SiteHeader } from "@/components/blog/header";
import { PostCard } from "@/components/blog/post-card";
import { Sidebar } from "@/components/blog/sidebar";
import { T } from "@/components/blog/t";
import { getCategories, getPosts, toPostSummaries, WORDPRESS_GRAPHQL_ENDPOINT } from "@/lib/wordpress";
type CategoryPageProps = { params: Promise<{ slug: string }> };
type CategoryEntry = { slug: string; name: string; description: string; id?: number };
const CATEGORY_INDEX: CategoryEntry[] = [
  {
    slug: "tech-news",
    name: "Tech News",
    description:
      "Product launches, platform moves and the people shaping modern technology — the day-to-day pulse of the industry.",
  },
  {
    slug: "development",
    name: "Development",
    description:
      "Languages, frameworks, workflows and tooling for people who build software — practical stories for working developers.",
  },
];
export async function generateStaticParams() {
  return CATEGORY_INDEX.map((entry) => ({ slug: entry.slug }));
}
export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const entry = await resolveCategory(slug);
  if (!entry) return { title: "Article non trouvé | TechPulse" };
  const title = `Catégorie : ${entry.name} | TechPulse`;
  const description = entry.description;
  const url = `https://techpulse.dev/blog/category/${entry.slug}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: "TechPulse",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}
export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const entry = await resolveCategory(slug);
  if (!entry) notFound();
  const categories = await getCategories();
  // Prefer the WP term id: the `categoryName` lookup misses desks whose name
  // contains `&` (WordPress stores it encoded, e.g. "AI & Cloud" → 0 posts),
  // while the id lookup always hits. The live category list resolves the id
  // even for slugs absent from the static index (e.g. `ai-and-cloud`,
  // which `getCategories()` reports with count 6).
  const liveMatch = categories.find(
    (category) => category.slug.toLowerCase() === entry.slug.toLowerCase()
  );
  const categoryId =
    typeof liveMatch?.id === "number"
      ? liveMatch.id
      : typeof entry.id === "number"
        ? entry.id
        : undefined;
  const { posts, error } =
    typeof categoryId === "number"
      ? await getPosts({ first: CATEGORY_POST_COUNT, categoryId })
      : await getPosts({ first: CATEGORY_POST_COUNT, categoryName: entry.name });
  const siblings = CATEGORY_INDEX.filter((candidate) => candidate.slug !== entry.slug);
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
        <div className="mt-6 flex flex-wrap items-end justify-between gap-4 border-b border-border pb-5">
          <div className="flex max-w-2xl flex-col gap-2">
            <span className="text-[0.7rem] font-semibold tracking-[0.22em] text-primary uppercase">
              <T k="blog.category.eyebrow" />
            </span>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              {entry.name}
            </h1>
            <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
              {entry.description}
            </p>
          </div>
          <p className="text-sm text-muted-foreground">
            {posts.length > 0 ? (
              <T k="blog.category.count" params={{ count: posts.length, name: entry.name }} />
            ) : (
              <T k="blog.category.countEmpty" params={{ name: entry.name }} />
            )}
          </p>
        </div>
        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div className="lg:col-span-8">
            {/*
             * Sidebar companion grid: two columns from `md`, three from
             * `2xl` — never more, so each card keeps a comfortable measure
             * next to the four-column sidebar track.
             */}
            {posts.length > 0 ? (
              <div className="mt-8 grid grid-cols-1 items-stretch gap-6 md:grid-cols-2 2xl:grid-cols-3">
                {toPostSummaries(posts).map((post, index) => (
                  <PostCard key={post.id} post={post} index={index} />
                ))}
              </div>
            ) : (
              <section
                aria-labelledby="category-empty-heading"
                className="mt-8 flex flex-col items-center gap-4 rounded-3xl border border-border bg-card px-6 py-20 text-center"
              >
                <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/15 text-link">
                  <TriangleAlert className="size-5" aria-hidden="true" />
                </span>
                <h2
                  id="category-empty-heading"
                  className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl"
                >
                  <T k="blog.category.emptyHeading" />
                </h2>
                <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
                  {error ? (
                    <T k="blog.category.emptyBodyCms" params={{ error }} />
                  ) : (
                    <T k="blog.category.emptyBodyNoPosts" params={{ name: entry.name }} />
                  )}
                </p>
                <code className="rounded-lg bg-surface px-3 py-1.5 font-mono text-xs break-all text-muted-foreground">
                  {WORDPRESS_GRAPHQL_ENDPOINT}
                </code>
              </section>
            )}
            {siblings.length > 0 ? (
              <nav
                aria-label="Other desks"
                className="mt-12 flex flex-wrap items-center gap-3 border-t border-border pt-6"
              >
                <span className="text-sm text-muted-foreground">
                  <T k="blog.category.siblings" />
                </span>
                {siblings.map((sibling) => (
                  <Link
                    key={sibling.slug}
                    href={`/blog/category/${sibling.slug}`}
                    className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors duration-300 hover:border-primary/60 hover:text-link focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                  >
                    {sibling.name}
                    <ArrowRight className="size-4" aria-hidden="true" />
                  </Link>
                ))}
              </nav>
            ) : null}
          </div>
          <Sidebar categories={categories} posts={toPostSummaries(posts)} />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
async function resolveCategory(slug: string): Promise<CategoryEntry | null> {
  const cleanSlug = slug.trim().toLowerCase();
  // Legacy short shape kept as an alias: the canonical WP slug is
  // `ai-and-cloud` (term id 13), but `/blog/category/ai-cloud` still reaches
  // this page via the permanent 308 in `next.config.ts`.
  const canonicalSlug = cleanSlug === "ai-cloud" ? "ai-and-cloud" : cleanSlug;
  const indexed = CATEGORY_INDEX.find((entry) => entry.slug === canonicalSlug);
  const categories = await getCategories();
  const match = categories.find(
    (category) => category.slug.toLowerCase() === canonicalSlug
  );
  if (indexed) {
    // Attach the live term id when available so the caller can filter by id
    // (the only lookup that hits `&`-containing desks).
    return typeof match?.id === "number" ? { ...indexed, id: match.id } : indexed;
  }
  if (!match) return null;
  return {
    slug: match.slug,
    name: match.name,
    description: `The latest ${match.name} stories from the TechPulse newsroom, newest first.`,
    id: typeof match.id === "number" ? match.id : undefined,
  };
}
