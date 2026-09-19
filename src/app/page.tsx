import type { Metadata } from "next";
import { TriangleAlert } from "lucide-react";

import { SiteFooter } from "@/components/blog/footer";
import { SiteHeader } from "@/components/blog/header";
import { HeroSection } from "@/components/blog/hero-section";
import { PostCard } from "@/components/blog/post-card";
import { CategorySection, HomeSponsorBanner } from "@/components/blog/category-section";
import { getCategories, getHomePageData, getPosts, toPostSummary, toPostSummaries, WORDPRESS_GRAPHQL_ENDPOINT } from "@/lib/wordpress";

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
  // Desk bands below the feed. Categories are resolved first so the desks can
  // be filtered by WP term id: the `categoryName` lookup misses desks whose
  // name contains "&" (WordPress stores it encoded, e.g. "AI & Cloud"), while
  // the id lookup always hits. A failing desk simply renders nothing.
  const categories = await getCategories();
  const deskPosts = async (slug: string, name: string) => {
    const category = categories.find((entry) => entry.slug === slug);
    if (typeof category?.id === "number") {
      return getPosts({ first: 3, categoryId: category.id });
    }
    return getPosts({ first: 3, categoryName: name });
  };

  const [techNews, development, aiCloud] = await Promise.all([
    deskPosts("tech-news", "Tech News"),
    deskPosts("development", "Development"),
    deskPosts("ai-and-cloud", "AI & Cloud"),
  ]);

  return (
    <div id="top" className="flex min-h-full flex-col">
      <SiteHeader />

      {/*
       * Global container: centered and capped at 1600px so ultrawide monitors get a
       * very comfortable measure instead of an infinitely stretched grid. The masthead
       * and footer use the same container so every edge stays aligned.
       */}
      <main className="mx-auto flex w-full max-w-[1600px] flex-1 flex-col gap-14 px-4 pt-10 pb-24 sm:px-8 sm:pt-14 lg:px-16">
        {/* `toPostSummary`/`toPostSummaries` keep the CMS bodies out of the payload. */}
        {heroPost ? <HeroSection post={toPostSummary(heroPost)} /> : <EmptyState error={error} />}

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
              {toPostSummaries(latestPosts).map((post, index) => (
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

        <CategorySection
          eyebrow="The desk"
          title="Tech News"
          description="Product launches, platform moves and the people shaping modern technology."
          categorySlug="tech-news"
          posts={techNews.posts}
        />

        <HomeSponsorBanner
          title="TechPulse Partner Zone — Cloud Summit 2026"
          body="Votre produit devant 40 000 lecteurs tech : bannière partenaire, sans traceurs publicitaires."
        />

        <CategorySection
          eyebrow="The desk"
          title="Development"
          description="Languages, frameworks and workflows for people who build software."
          categorySlug="development"
          posts={development.posts}
        />

        <CategorySection
          eyebrow="The desk"
          title="AI & Cloud"
          description="Models, infrastructure and the platforms scaling machine intelligence."
          categorySlug="ai-and-cloud"
          posts={aiCloud.posts}
        />

        <HomeSponsorBanner
          title="Recrutez les meilleurs profils tech"
          body="Espace sponsorisé — diffusez vos offres d'emploi auprès de la communauté TechPulse."
        />
      </main>

      <SiteFooter />
    </div>
  );
}

/** Graceful fallback shown when the CMS is unreachable or has no published stories. */
function EmptyState({ error }: { error: string | null }) {
  return (
    <section
      aria-labelledby="empty-heading"
      className="flex flex-col items-center gap-4 rounded-3xl border border-border bg-card px-6 py-20 text-center"
    >
      <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/15 text-link">
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