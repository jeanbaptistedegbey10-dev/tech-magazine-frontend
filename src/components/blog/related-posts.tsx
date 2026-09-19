"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";

import type { PostSummary } from "@/lib/wordpress";
import { useTranslation } from "@/lib/i18n";

export type RelatedPostsProps = {
  /** Up to three recommended stories (the caller decides how they are picked). */
  posts: PostSummary[];
};

/**
 * Recommended-reading rail for the article page.
 *
 * Client component so the eyebrow, the heading, the reading time and the
 * "All stories" CTA follow the reader's language. Micro-interactions stay pure
 * CSS (image zoom + border tint).
 *
 * The rail is a **plain, non-sticky column**: it stacks under the story on
 * phones and sits in the `lg:col-span-4` sidebar track beside the article body.
 * An earlier revision made it `lg:sticky lg:top-8`; inside a column that also
 * holds the sidebar widgets, that pinned card scrolled over the widgets below
 * it and produced an overlap, so the sticky is gone for good — page scrolling
 * never repositions any sidebar card. See `src/components/blog/sidebar.tsx` for
 * the column contract.
 */
export function RelatedPosts({ posts }: RelatedPostsProps) {
  const { t } = useTranslation();

  if (posts.length === 0) {
    return null;
  }

  return (
    <aside
      aria-labelledby="related-posts-heading"
      className="flex flex-col gap-5"
    >
      <div className="flex flex-col gap-1.5 border-b border-border pb-3">
        <span className="text-[0.65rem] font-semibold tracking-[0.2em] text-primary uppercase">
          {t("blog.article.recommendedEyebrow")}
        </span>
        <h2
          id="related-posts-heading"
          className="text-xl font-semibold tracking-tight text-foreground"
        >
          {t("blog.article.recommendedHeading")}
        </h2>
      </div>

      <ul className="flex flex-col gap-4">
        {posts.map((post) => (
          <li key={post.id}>
            <Link
              href={post.href}
              className="group flex gap-4 rounded-2xl border border-border bg-card p-3 transition-colors duration-300 hover:border-primary/60 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none"
            >
              <div className="relative size-20 shrink-0 overflow-hidden rounded-xl bg-surface">
                <Image
                  src={post.image.src}
                  alt={post.image.alt}
                  fill
                  sizes="80px"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>

              <div className="flex min-w-0 flex-col gap-1">
                <span className="text-[0.6rem] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
                  {post.category.name}
                </span>

                <h3 className="line-clamp-2 text-sm leading-snug font-semibold tracking-tight text-foreground transition-colors duration-300 group-hover:text-link">
                  {post.title}
                </h3>

                <span className="mt-auto inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Clock className="size-3.5" aria-hidden="true" />
                  {t("common.minutesRead", { count: post.readingTime })}
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ul>

      <Link
        href="/blog"
        className="inline-flex items-center gap-2 self-start rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors duration-300 hover:border-primary/60 hover:text-link focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
      >
        {t("blog.article.recommendedCta")}
        <ArrowRight className="size-4" aria-hidden="true" />
      </Link>
    </aside>
  );
}
