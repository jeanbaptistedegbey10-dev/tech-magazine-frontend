import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, TriangleAlert } from "lucide-react";

import { ArticleHeader } from "@/components/blog/article-header";
import { RelatedPosts } from "@/components/blog/related-posts";
import type { Post } from "@/lib/wordpress";
import { getPostBySlug, getPosts, WORDPRESS_GRAPHQL_ENDPOINT } from "@/lib/wordpress";

type ArticlePageProps = {
  params: Promise<{ slug: string }>;
};

/** Slugs pre-rendered at build time; matches the data layer's per-request cap. */
const STATIC_PARAMS_LIMIT = 50;

/** Size of the recommended rail. */
const RELATED_POST_COUNT = 3;

/**
 * Tailwind Typography recipe for the WordPress body.
 *
 * `prose-invert` renders the CMS markup on the dark canvas and `prose-indigo` keeps
 * the accent in the brand hue; the `prose-*` modifiers then snap the editorial rules
 * onto the Figma palette (#F8FAFC headings, #94A3B8 body copy, #1E293B code
 * surfaces, indigo-300 links) and drop the backticks the plugin wraps inline code in.
 *
 * No `marker` variant appears here on purpose — pairing it with a `prose-*` element
 * modifier makes Tailwind Typography emit a malformed marker pseudo-element selector
 * that the CSS parser rejects. The indigo bullet/ordinal colour is declared on the
 * `article-prose` hook in `src/app/globals.css` through the plugin's own
 * `--tw-prose-bullets` / `--tw-prose-counters` custom properties.
 */
const ARTICLE_PROSE_CLASSES = [
  "prose prose-invert prose-indigo article-prose max-w-none",
  "prose-headings:font-semibold prose-headings:tracking-tight prose-headings:text-foreground",
  "prose-p:text-muted-foreground prose-lead:text-muted-foreground",
  "prose-a:font-medium prose-a:text-[#a5b4fc] prose-a:no-underline hover:prose-a:text-foreground",
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
 * Every `PostCard` / `HeroSection` link lands here through `post.href`. The headless
 * WordPress install only exposes `/graphql` publicly (its themed front end answers
 * 403), so the magazine renders the story itself from the `content` field returned by
 * WPGraphQL, typeset with Tailwind Typography.
 */

/** Pre-renders every published story at build time; ISR refreshes it hourly. */
export async function generateStaticParams() {
  const { posts } = await getPosts({ first: STATIC_PARAMS_LIMIT });

  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const { post } = await getPostBySlug(slug);

  if (!post) {
    return { title: "Story unavailable — TechPulse" };
  }

  return {
    title: `${post.title} — TechPulse`,
    description: post.excerpt,
    alternates: { canonical: post.href },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.excerpt,
      url: post.href,
      publishedTime: post.date || undefined,
      authors: [post.author],
      section: post.category.name,
      images: [
        {
          url: post.image.src,
          width: post.image.width,
          height: post.image.height,
          alt: post.image.alt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
      images: [post.image.src],
    },
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const { post, error } = await getPostBySlug(slug);

  if (!post) {
    // A CMS outage must never be reported as a missing story.
    if (error) {
      return <CmsUnavailable error={error} />;
    }

    notFound();
  }

  const relatedPosts = await getRelatedPosts(post);

  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 py-8">
      <Link
        href="/"
        className="inline-flex w-fit items-center gap-2 rounded-lg text-sm text-muted-foreground transition-colors duration-300 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Back to the front page
      </Link>

      <article className="mt-6 flex flex-col">
        <ArticleHeader post={post} />

        <figure className="mt-8 flex flex-col gap-3">
          <div className="relative aspect-16/9 w-full overflow-hidden rounded-3xl border border-border bg-surface">
            <Image
              src={post.image.src}
              alt={post.image.alt}
              fill
              preload
              sizes="(max-width: 1232px) 100vw, 1168px"
              className="object-cover"
            />
          </div>

          {/* The picture desk caption doubles as an honesty note when the CMS has no artwork. */}
          <figcaption className="text-xs text-muted-foreground">
            {post.image.isFallback
              ? "Editorial image from the TechPulse picture desk."
              : post.image.alt}
          </figcaption>
        </figure>

        <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start lg:gap-12">
          <div className="min-w-0">
            {post.content ? (
              /*
               * Trusted markup: the body is authored in the headless WordPress install
               * owned by the editorial team, and typeset by Tailwind Typography (see
               * ARTICLE_PROSE_CLASSES above).
               */
              <div
                className={ARTICLE_PROSE_CLASSES}
                dangerouslySetInnerHTML={{ __html: post.content }}
              />
            ) : (
              <p className="text-base leading-relaxed text-muted-foreground">{post.excerpt}</p>
            )}
          </div>

          <RelatedPosts posts={relatedPosts} />
        </div>

        <footer className="mt-12 flex flex-col gap-4 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">
            Filed in <span className="text-foreground">{post.category.name}</span> &middot; Reported
            by <span className="text-foreground">{post.author}</span> &middot;{" "}
            <time dateTime={post.date}>{post.publishedAt}</time>
          </p>

          <Link
            href="/"
            className="inline-flex w-fit items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-medium text-foreground transition-colors duration-300 hover:border-primary/60 hover:text-[#a5b4fc] focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            More stories from TechPulse
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </footer>
      </article>
    </div>
  );
}

/**
 * Picks the three recommended stories: the rest of the current category first, then
 * the newest posts from the rest of the newsroom, so the rail is never short and can
 * never show the story the reader is already on.
 *
 * Both requests carry the `wordpress:posts` cache tag, so the fallback costs nothing
 * when it repeats the front-page query. A category filter that fails (or matches
 * nothing) simply degrades to the latest stories instead of breaking the rail.
 */
async function getRelatedPosts(post: Post): Promise<Post[]> {
  const { posts: sameCategory } = await getPosts({
    first: STATIC_PARAMS_LIMIT,
    categoryName: post.category.name,
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
        <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/15 text-[#a5b4fc]">
          <TriangleAlert className="size-5" aria-hidden="true" />
        </span>

        <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          This story is temporarily unavailable
        </h1>

        <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
          The magazine could not reach the WordPress GraphQL feed. {error}
        </p>

        <code className="rounded-lg bg-surface px-3 py-1.5 font-mono text-xs break-all text-muted-foreground">
          {WORDPRESS_GRAPHQL_ENDPOINT}
        </code>

        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors duration-300 hover:bg-primary/85 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to the front page
        </Link>
      </div>
    </div>
  );
}