import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, TriangleAlert } from "lucide-react";

import { ArticleHeader } from "@/components/blog/article-header";
import { CommentsSection } from "@/components/blog/comments-section";
import { SiteFooter } from "@/components/blog/footer";
import { SiteHeader } from "@/components/blog/header";
import { PaywallBanner } from "@/components/blog/paywall-banner";
import { ShareButtons } from "@/components/blog/share-buttons";
import { Sidebar } from "@/components/blog/sidebar";
import { T } from "@/components/blog/t";
import {
  GATED_INTRO_MAX_CHARS,
  GATED_INTRO_PARAGRAPHS,
  INTRO_PARAGRAPHS,
  hasDistinctExcerpt,
  splitArticleContent,
} from "@/lib/article";
import type { Post } from "@/lib/wordpress";
import { getCategories, getPostBySlug, getPosts, toPostSummary, toPostSummaries, WORDPRESS_GRAPHQL_ENDPOINT } from "@/lib/wordpress";

/** Route params, shared by the page and `generateMetadata`. */
type ArticlePageParams = {
  params: Promise<{ slug: string }>;
};

type ArticlePageProps = ArticlePageParams & {
  /** `?success=true` comes straight from the mocked checkout confirmation. */
  searchParams: Promise<{ success?: string }>;
};

/** Slugs pre-rendered at build time; matches the data layer's per-request cap. */
const STATIC_PARAMS_LIMIT = 50;

/** Size of the recommended rail. */
const RELATED_POST_COUNT = 3;

/**
 * Cookies minted by the mocked Stripe sandbox (`src/app/api/stripe/checkout`).
 *
 * `techpulse_premium` is httpOnly and long-lived; `techpulse_premium_success`
 * only marks the redirect that follows a checkout, so it counts as access too.
 */
const PREMIUM_COOKIE = "techpulse_premium";
const PREMIUM_SUCCESS_COOKIE = "techpulse_premium_success";

/** `cookies()` is async in Next 16 — this is the store the page receives. */
type CookieStore = Awaited<ReturnType<typeof cookies>>;

/**
 * Tailwind Typography recipe for the WordPress body.
 *
 * `prose` + `dark:prose-invert` typesets the CMS markup on **both** themes: the
 * plugin's default rules are the light palette, and `dark:` switches to the
 * inverted one — which is what the magazine renders by default, since the raw
 * Figma canvas on `:root` is dark and `next-themes` marks `<html>` with `.dark`.
 * A hard-coded `prose-invert` would have left the body light-on-light for
 * readers who pick the light theme.
 *
 * `prose-indigo` keeps the accent in the brand hue; the `prose-*` modifiers then
 * snap the editorial rules onto the Figma tokens (headings/strong on
 * `text-foreground`, body copy on `text-muted-foreground`, `bg-surface` code and
 * pre blocks, `text-link` links) and drop the backticks the plugin wraps inline
 * code in.
 *
 * No `marker` variant appears here on purpose — pairing it with a `prose-*` element
 * modifier makes Tailwind Typography emit a malformed marker pseudo-element selector
 * that the CSS parser rejects. The indigo bullet/ordinal colour is declared on the
 * `article-prose` hook in `src/app/globals.css` through the plugin's own
 * `--tw-prose-bullets` / `--tw-prose-counters` custom properties.
 */
const ARTICLE_PROSE_CLASSES = [
  "prose dark:prose-invert prose-indigo article-prose max-w-none",
  "prose-headings:font-semibold prose-headings:tracking-tight prose-headings:text-foreground",
  "prose-p:text-muted-foreground prose-lead:text-muted-foreground",
  "prose-a:font-medium prose-a:text-link prose-a:no-underline hover:prose-a:text-foreground",
  "prose-strong:text-foreground",
  "prose-ul:text-muted-foreground prose-ol:text-muted-foreground prose-li:text-muted-foreground",
  "prose-code:rounded prose-code:bg-surface prose-code:px-1.5 prose-code:py-0.5 prose-code:text-foreground",
  "prose-code:before:content-none prose-code:after:content-none",
  "prose-pre:rounded-xl prose-pre:border prose-pre:border-border prose-pre:bg-surface",
  "prose-blockquote:border-l-2 prose-blockquote:border-brand prose-blockquote:bg-surface/70",
  "prose-blockquote:px-5 prose-blockquote:not-italic prose-blockquote:text-foreground",
  "prose-hr:border-border",
  "prose-img:rounded-xl prose-img:border prose-img:border-border",
  "prose-figcaption:text-center prose-figcaption:text-muted-foreground",
  "prose-th:border-border prose-th:text-foreground prose-td:border-border",
].join(" ");

/**
 * Article route — `/blog/[slug]`.
 *
 * Every `PostCard` / `HeroSection` link lands here through `post.href`. The
 * headless WordPress install only exposes `/graphql` publicly (its themed front
 * end answers 403), so the magazine renders the story itself from the `content`
 * field returned by WPGraphQL, typeset with Tailwind Typography.
 *
 * Rendering contract (Phase 11): the page reads the Premium cookies and
 * `?success=true`, which opts the route into dynamic rendering — the same
 * reasoning as `/dashboard`. A statically cached article cannot be gated: the
 * cached HTML would hand a subscriber's unlocked body to anonymous readers.
 * The CMS calls themselves stay cached for an hour, so the extra cost is the
 * React render, not a WordPress round-trip.
 */

/** Pre-renders every published story at build time; ISR refreshes it hourly. */
export async function generateStaticParams() {
  const { posts } = await getPosts({ first: STATIC_PARAMS_LIMIT });

  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: ArticlePageParams): Promise<Metadata> {
  const { slug } = await params;
  const { post } = await getPostBySlug(slug);

  if (!post) {
    return { title: "Article non trouvé | TechPulse" };
  }

  const title = `${post.title} | TechPulse`;
  const description = buildMetaDescription(post.excerpt);
  const url = `https://techpulse.dev/blog/${slug}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: "TechPulse",
      type: "article",
      publishedTime: post.date || undefined,
      authors: [post.author],
      section: post.category.name,
      images: [
        {
          url: post.image.src,
          width: 1200,
          height: 630,
          alt: post.image.alt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [post.image.src],
    },
  };
}

/**
 * Meta description helper: the data layer already returns a plain-text
 * excerpt, but this defensively strips any residual HTML tag and clamps the
 * copy to ~160 characters (word boundary + ellipsis) for SERP snippets.
 */
function buildMetaDescription(excerpt: string): string {
  const plain = excerpt.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  if (plain.length <= 160) return plain;
  const cut = plain.slice(0, 157);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > 100 ? cut.slice(0, lastSpace) : cut).trim()}…`;
}

export default async function ArticlePage({ params, searchParams }: ArticlePageProps) {
  const { slug } = await params;
  const { post, error } = await getPostBySlug(slug);

  if (!post) {
    // A CMS outage must never be reported as a missing story.
    // Both branches keep the magazine chrome so the reader never loses the nav.
    if (error) {
      return (
        <div className="flex min-h-full flex-col">
          <SiteHeader />
          <main className="mx-auto w-full max-w-[1600px] flex-1 px-4 py-8 sm:px-8 lg:px-16">
            <CmsUnavailable error={error} />
          </main>
          <SiteFooter />
        </div>
      );
    }

    notFound();
  }

  const [relatedPosts, categories, cookieStore, query] = await Promise.all([
    getRelatedPosts(post),
    getCategories(),
    cookies(),
    searchParams,
  ]);

  const unlocked = hasPremiumAccess(cookieStore, query);

  /** Locked Premium story: one free paragraph, then the paywall. */
  const gated = post.isPremium && !unlocked;
  const { intro, body } = splitArticleContent(post.content, {
    paragraphCount: gated ? GATED_INTRO_PARAGRAPHS : INTRO_PARAGRAPHS,
    maxChars: gated ? GATED_INTRO_MAX_CHARS : 0,
  });

  return (
    <div className="flex min-h-full flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-[1600px] flex-1 px-4 py-8 sm:px-8 lg:px-16">
      <Link
        href="/blog"
        className="inline-flex w-fit items-center gap-2 rounded-lg text-sm text-muted-foreground transition-colors duration-300 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        <T k="blog.article.backLink" />
      </Link>

      <article className="mt-6 grid w-full grid-cols-1 items-start gap-8 lg:grid-cols-12">
        {/*
         * Editorial order: desk + reading time, headline, compact featured image,
         * then the byline row carrying author, date and the share pills. The
         * image and the share row are *slotted into* the header instead of being
         * laid out around it, so the whole masthead stays a single
         * `lg:col-span-12` grid child (see `article-header.tsx`).
         */}
        <ArticleHeader
          post={toPostSummary(post)}
          className="lg:col-span-12"
          showStandfirst={hasDistinctExcerpt(post.excerpt, intro || post.content)}
          media={
            <figure className="relative w-full overflow-hidden rounded-xl border border-border bg-surface">
              {/*
               * Compact hero: the intrinsic ratio is capped at 380px and
               * `object-cover` crops the overflow, so a portrait or a 4/3 CMS
               * image can never push the byline below the fold.
               */}
              <Image
                src={post.image.src}
                alt={post.image.alt}
                width={post.image.width}
                height={post.image.height}
                preload
                unoptimized={post.image.unoptimized}
                sizes="(max-width: 1600px) 100vw, 1472px"
                className="max-h-[380px] w-full rounded-xl object-cover"
              />

              {/* The picture desk caption doubles as an honesty note when the CMS has no artwork. */}
              <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent px-4 py-3 text-xs text-slate-200">
                {post.image.isFallback ? <T k="blog.article.pictureCredit" /> : post.image.alt}
              </figcaption>
            </figure>
          }
          actions={<ShareButtons title={post.title} path={post.href} />}
        />

        <div className="lg:col-span-8 lg:pr-12">
          {post.content ? (
            <>
              {/*
               * Trusted markup: the body is authored in the headless WordPress
               * install owned by the editorial team and typeset by Tailwind
               * Typography (see ARTICLE_PROSE_CLASSES above). The intro renders
               * for every reader; what follows it depends on the access check.
               */}
              <div
                className={ARTICLE_PROSE_CLASSES}
                dangerouslySetInnerHTML={{ __html: intro }}
              />

              {gated ? (
                /* The gate sits directly under the first paragraph — never above the body. */
                <div className="mt-8">
                  <PaywallBanner />
                </div>
              ) : body ? (
                /* Free story or Premium subscriber: 100% of the article, no banner. */
                <div
                  className={ARTICLE_PROSE_CLASSES}
                  dangerouslySetInnerHTML={{ __html: body }}
                />
              ) : null}
            </>
          ) : (
            <>
              <p className="text-base leading-relaxed text-muted-foreground">{post.excerpt}</p>

              {gated ? (
                <div className="mt-8">
                  <PaywallBanner />
                </div>
              ) : null}
            </>
          )}

          <ShareButtons title={post.title} path={post.href} className="mt-10" />

          <CommentsSection postSlug={post.slug} postTitle={post.title} />
        </div>

        {/*
         * `toPostSummaries` is the paywall's backstop: the sidebar is a client
         * component, so passing full `Post` objects would serialise the body of
         * every recommended story — Premium ones included — into the RSC payload.
         */}
        <Sidebar
          categories={categories}
          posts={toPostSummaries(relatedPosts)}
          related={toPostSummaries(relatedPosts)}
        />

        <footer className="lg:col-span-12 mt-12 flex flex-col gap-4 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">
            <T k="blog.article.filedIn" />{" "}
            <span className="text-foreground">{post.category.name}</span> &middot;{" "}
            <T k="blog.article.reportedBy" />{" "}
            <span className="text-foreground">{post.author}</span> &middot;{" "}
            <time dateTime={post.date}>{post.publishedAt}</time>
          </p>

          <Link
            href="/blog"
            className="inline-flex w-fit items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-medium text-foreground transition-colors duration-300 hover:border-primary/60 hover:text-link focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            <T k="blog.article.moreStories" />
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </footer>
      </article>
      </main>
      <SiteFooter />
    </div>
  );
}

/**
 * Premium access, decided from the request — never from the client.
 *
 * Either of the two sandbox cookies unlocks the story (`techpulse_premium` is
 * the long-lived httpOnly marker, `techpulse_premium_success` the short-lived
 * confirmation left by the checkout redirect), and `?success=true` is honoured
 * so a reader who lands here straight from the confirmation sees the full body
 * while the cookie is still being written.
 */
function hasPremiumAccess(cookieStore: CookieStore, query: { success?: string }): boolean {
  return (
    Boolean(cookieStore.get(PREMIUM_COOKIE)) ||
    Boolean(cookieStore.get(PREMIUM_SUCCESS_COOKIE)) ||
    query.success === "true"
  );
}

/**
 * Picks the three recommended stories: the rest of the current desk first, then
 * the newest posts from the rest of the newsroom, so the rail is never short and
 * can never show the story the reader is already on.
 *
 * The desk is resolved by **term id** whenever the CMS exposes one, falling back
 * to the display name: WPGraphQL's `categoryName` filter misses terms whose name
 * contains `&` (verified on *AI & Cloud*), which would silently degrade those
 * stories to the newsroom-wide fallback.
 *
 * Both requests carry the `wordpress:posts` cache tag, so the fallback costs
 * nothing when it repeats the front-page query.
 */
async function getRelatedPosts(post: Post): Promise<Post[]> {
  const { posts: sameCategory } = await getPosts({
    first: STATIC_PARAMS_LIMIT,
    categoryId: post.category.id,
    categoryName: post.category.id ? undefined : post.category.name,
  });

  const related = sameCategory
    .filter((entry) => entry.id !== post.id)
    .slice(0, RELATED_POST_COUNT);

  if (related.length >= RELATED_POST_COUNT) {
    return related;
  }

  const { posts: latest } = await getPosts({ first: STATIC_PARAMS_LIMIT });
  const alreadyListed = new Set([post.id, ...related.map((entry) => entry.id)]);

  return [...related, ...latest.filter((entry) => !alreadyListed.has(entry.id))].slice(
    0,
    RELATED_POST_COUNT
  );
}

/** Degraded state when the CMS cannot be reached for a known slug. */
function CmsUnavailable({ error }: { error: string }) {
  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 py-8">
      <div className="flex flex-col items-center gap-4 rounded-3xl border border-border bg-card px-6 py-20 text-center">
        <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/15 text-link">
          <TriangleAlert className="size-5" aria-hidden="true" />
        </span>

        <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          <T k="common.cmsUnavailable" />
        </h1>

        <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
          <T k="common.cmsUnavailableBody" params={{ error }} />
        </p>

        <code className="rounded-lg bg-surface px-3 py-1.5 font-mono text-xs break-all text-muted-foreground">
          {WORDPRESS_GRAPHQL_ENDPOINT}
        </code>

        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors duration-300 hover:bg-primary/85 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          <T k="common.cmsUnavailableCta" />
        </Link>
      </div>
    </div>
  );
}