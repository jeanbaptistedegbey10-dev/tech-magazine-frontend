"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Clock } from "lucide-react";

import type { Post } from "@/lib/wordpress";

export type ArticleHeaderProps = {
  /** Story being read — drives the badge, headline, standfirst and byline. */
  post: Post;
};

/** Reveal props, collapsed to `{}` so `prefers-reduced-motion` users see static content. */
type RevealProps = {
  initial?: { opacity: number; y: number };
  animate?: { opacity: number; y: number };
};

function reveal(prefersReducedMotion: boolean | null): RevealProps {
  if (prefersReducedMotion) {
    return {};
  }

  return { initial: { opacity: 0, y: 24 }, animate: { opacity: 1, y: 0 } };
}

/**
 * Editorial article masthead: indigo category badge, oversized tightly tracked
 * headline, standfirst and the author / date / reading-time byline.
 *
 * Mirrors `hero-section.tsx` on purpose — same `reveal()` helper, same easing and
 * the same `prefers-reduced-motion` escape hatch — so an article animates in with
 * exactly the motion language of the front page.
 */
export function ArticleHeader({ post }: ArticleHeaderProps) {
  const prefersReducedMotion = useReducedMotion();
  const animation = reveal(prefersReducedMotion);

  return (
    <header className="flex flex-col gap-5">
      <motion.div
        {...animation}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="flex flex-wrap items-center gap-3"
      >
        <span className="rounded-full bg-primary px-3 py-1 text-[0.65rem] font-semibold tracking-[0.18em] text-primary-foreground uppercase">
          {post.category.name}
        </span>
        <span className="text-[0.7rem] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
          {post.readingTime} min read
        </span>
      </motion.div>

      <motion.h1
        {...animation}
        transition={{ duration: 0.55, delay: 0.06, ease: "easeOut" }}
        className="text-3xl leading-[1.08] font-semibold tracking-tight text-balance text-foreground sm:text-4xl lg:text-5xl"
      >
        {post.title}
      </motion.h1>

      <motion.p
        {...animation}
        transition={{ duration: 0.55, delay: 0.12, ease: "easeOut" }}
        className="text-base leading-relaxed text-muted-foreground sm:text-lg"
      >
        {post.excerpt}
      </motion.p>

      <motion.div
        {...animation}
        transition={{ duration: 0.55, delay: 0.18, ease: "easeOut" }}
        className="flex flex-wrap items-center gap-4 border-y border-border py-4"
      >
        <span
          aria-hidden="true"
          className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/15 text-sm font-semibold text-[#a5b4fc]"
        >
          {authorMonogram(post.author)}
        </span>

        <span className="flex min-w-0 flex-col gap-1">
          <span className="text-sm font-medium text-foreground">{post.author}</span>
          <span className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <time dateTime={post.date}>{post.publishedAt}</time>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="size-3.5" aria-hidden="true" />
              {post.readingTime} min read
            </span>
          </span>
        </span>
      </motion.div>
    </header>
  );
}

/** Byline monogram, e.g. `"Ada Lovelace"` -> `"AL"`. */
function authorMonogram(author: string): string {
  const monogram = author
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");

  return monogram || "TP";
}
