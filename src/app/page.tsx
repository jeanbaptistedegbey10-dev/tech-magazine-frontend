import type { Metadata } from "next";
import { Rss, TriangleAlert, Zap } from "lucide-react";

import { HeroSection } from "@/components/blog/hero-section";
import { PostCard } from "@/components/blog/post-card";
import { getHomePageData, WORDPRESS_GRAPHQL_ENDPOINT } from "@/lib/wordpress";

export const metadata: Metadata = {
  title: "TechPulse — Tech news, engineered",
  description:
    "TechPulse Magazine covers the products, platforms and people shaping modern technology: AI, infrastructure, security and developer tooling.",
};

/**
 * TechPulse Magazine home page.
 *
 * Server component: the WPGraphQL feed is fetched once per revalidation window
 * and handed to the Framer Motion powered hero and card grid as plain data.
 */
export default async function Home() {
  const { heroPost, latestPosts, total, error } = await getHomePageData();

  return (
    <div id="top" className="flex min-h-full flex-col">
      <SiteHeader />

      {/*
       * Global container: centered and capped at 1600px so ultrawide monitors get a
       * very comfortable measure instead of an infinitely stretched grid. The masthead
       * and footer use the same container so every edge stays aligned.
       */}
      <main className="mx-auto flex w-full max-w-[1600px] flex-1 flex-col gap-14 px-4 pt-10 pb-24 sm:px-8 sm:pt-14 lg:px-16">
        {heroPost ? <HeroSection post={heroPost} /> : <EmptyState error={error} />}

        {latestPosts.length > 0 ? (
          <section id="latest" aria-labelledby="latest-heading" className="flex flex-col gap-8">
            <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-5">
              <div className="flex flex-col gap-2">
                <span className="text-[0.7rem] font-semibold tracking-[0.22em] text-primary uppercase">
                  The feed
                </span>
                <h2
                  id="latest-heading"
                  className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl"
                >
                  Latest stories
                </h2>
              </div>

              <p className="text-sm text-muted-foreground">
                {total} {total === 1 ? "story" : "stories"} published from the WordPress GraphQL
                feed
              </p>
            </div>

            <div className="grid grid-cols-1 items-stretch gap-6 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
              {latestPosts.map((post, index) => (
                /*
                 * No per-card vertical offset here: with `items-stretch` (and the
                 * fixed card internals) a margin would shorten the card inside its
                 * row track and break the strict alignment of the grid.
                 */
                <PostCard key={post.id} post={post} index={index} />
              ))}
            </div>
          </section>
        ) : null}
      </main>

      <SiteFooter />
    </div>
  );
}

/** Sticky masthead: brand mark plus the primary in-page navigation. */
function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-[1600px] items-center justify-between gap-4 px-4 py-4 sm:px-8 lg:px-16">
        <a
          href="#top"
          className="inline-flex items-center gap-3 rounded-xl focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none"
        >
          <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/30">
            <Zap className="size-4" aria-hidden="true" />
          </span>
          <span className="flex flex-col leading-tight">
            <span className="text-base font-semibold tracking-tight text-foreground">TechPulse</span>
            <span className="text-[0.6rem] font-semibold tracking-[0.24em] text-muted-foreground uppercase">
              Magazine
            </span>
          </span>
        </a>

        <nav aria-label="Primary" className="flex items-center gap-6 text-sm">
          <a href="#latest" className="text-muted-foreground transition-colors hover:text-foreground">
            Latest
          </a>
          <span className="hidden items-center gap-2 rounded-full border border-border px-3 py-1 text-xs text-muted-foreground sm:inline-flex">
            <span className="size-1.5 rounded-full bg-primary" aria-hidden="true" />
            Live feed
          </span>
        </nav>
      </div>
    </header>
  );
}

/** Graceful fallback shown when the CMS is unreachable or has no published stories. */
function EmptyState({ error }: { error: string | null }) {
  return (
    <section
      aria-labelledby="empty-heading"
      className="flex flex-col items-center gap-4 rounded-3xl border border-border bg-card px-6 py-20 text-center"
    >
      <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/15 text-[#a5b4fc]">
        <TriangleAlert className="size-5" aria-hidden="true" />
      </span>

      <h1
        id="empty-heading"
        className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl"
      >
        No stories on the wire yet
      </h1>

      <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
        {error
          ? `The magazine could not reach the WordPress GraphQL feed. ${error}`
          : "The WordPress GraphQL feed returned no published articles. Publish a story in the CMS, then reload this page."}
      </p>

      <code className="rounded-lg bg-surface px-3 py-1.5 font-mono text-xs break-all text-muted-foreground">
        {WORDPRESS_GRAPHQL_ENDPOINT}
      </code>
    </section>
  );
}

function SiteFooter() {
  return (
    <footer className="border-t border-border bg-card/40">
      <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-3 px-4 py-10 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-16">
        <p>
          &copy; {new Date().getFullYear()} TechPulse Magazine &mdash; headless WordPress, delivered
          with Next.js.
        </p>
        <p className="inline-flex items-center gap-2 break-all">
          <Rss className="size-3.5 shrink-0" aria-hidden="true" />
          {WORDPRESS_GRAPHQL_ENDPOINT.replace(/^https?:\/\//, "")}
        </p>
      </div>
    </footer>
  );
}