"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Clock } from "lucide-react";

import { T } from "@/components/blog/t";
import type { PostSummary } from "@/lib/wordpress";

export type ArticleHeaderProps = {
  /** Summary (no CMS body): `content` is rendered by the article route only. */
  post: PostSummary;
  /**
   * Optional extra classes for the wrapping `<header>`.
   *
   * The article route places this component inside a 12-column grid, so it
   * passes `lg:col-span-12`: without an explicit span the header would be
   * auto-placed into a single 1/12 track and the headline/standfirst would
   * wrap to about one word per line.
   */
  className?: string;
  /**
   * Media slot rendered between the headline block and the byline row.
   *
   * The article route passes its compact featured-image `<figure>` here, which
   * is what produces the editorial order the newsroom asked for:
   * `[desk + reading time] -> [h1] -> [image] -> [author + date + share]`.
   */
  media?: React.ReactNode;
  /** Action slot rendered at the end of the byline row (the share buttons). */
  actions?: React.ReactNode;
  /**
   * Renders the CMS standfirst under the headline.
   *
   * The article route turns it off when the CMS excerpt is nothing but the
   * opening of the body (WordPress auto-excerpts), so the reader never sees the
   * same sentence twice.
   */
  showStandfirst?: boolean;
};

/**
 * Reveal contract (hydration-safe — see also `src/app/globals.css`).
 *
 * The entrance props on the `motion.*` elements below are **deterministic**:
 * identical on the server and during the hydration render. `useReducedMotion()`
 * was removed from render on purpose — framer-motion 13 resolves it by reading
 * `window.matchMedia("(prefers-reduced-motion)")` during the first client
 * render, so a reader with reduced motion enabled hydrated collapsed props
 * (`{}`) into markup the server had rendered with animation props (the
 * `style="opacity:0…"` attribute) — the React #418 hydration mismatch.
 *
 * The reduced-motion preference is honoured instead by
 * `<MotionConfig reducedMotion="user">` (mounted in `src/app/layout.tsx`,
 * suppresses positional transforms at the animation level) plus the
 * `[data-motion-reveal]` CSS guard in `src/app/globals.css`, which forces fully
 * static content. Neither mechanism changes the rendered markup, so nothing
 * can differ between SSR and hydration.
 */

/**
 * Editorial article masthead: indigo category badge, reading-time eyebrow,
 * oversized tightly tracked headline, optional standfirst, an optional media
 * slot (the compact featured image) and the author / date / reading-time byline
 * with the share actions on its trailing edge.
 *
 * Mirrors `hero-section.tsx` on purpose — same deterministic reveal props, same
 * easing and the same hydration-safe `prefers-reduced-motion` handling
 * (`MotionConfig` + the `data-motion-reveal` CSS guard, never a render-time
 * browser read) — so an article animates in with exactly the motion language of
 * the front page.
 */
export function ArticleHeader({
  post,
  className,
  media,
  actions,
  showStandfirst = true,
}: ArticleHeaderProps) {
  return (
    <header className={`flex w-full min-w-0 flex-col gap-5 ${className || ""}`}>
      <motion.div
        data-motion-reveal
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="flex w-full flex-wrap items-center gap-3"
      >
        <span className="rounded-full bg-primary px-3 py-1 text-[0.65rem] font-semibold tracking-[0.18em] text-primary-foreground uppercase">
          {post.category.name}
        </span>
        <span className="text-[0.7rem] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
          <T k="common.minutesRead" params={{ count: post.readingTime }} />
        </span>
      </motion.div>

      <motion.h1
        data-motion-reveal
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.06, ease: "easeOut" }}
        className="w-full text-3xl leading-[1.08] font-semibold tracking-tight text-balance text-foreground sm:text-4xl lg:text-5xl"
      >
        {post.title}
      </motion.h1>

      {showStandfirst ? (
        <motion.p
          data-motion-reveal
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.12, ease: "easeOut" }}
          className="w-full text-base leading-relaxed text-muted-foreground sm:text-lg"
        >
          {post.excerpt}
        </motion.p>
      ) : null}

      {media ? (
        <motion.div
          data-motion-reveal
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.16, ease: "easeOut" }}
          className="w-full"
        >
          {media}
        </motion.div>
      ) : null}

      <motion.div
        data-motion-reveal
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.22, ease: "easeOut" }}
        className="flex w-full flex-wrap items-center gap-4 border-y border-border py-4"
      >
        <span
          aria-hidden="true"
          className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/15 text-sm font-semibold text-link"
        >
          {authorMonogram(post.author)}
        </span>

        <span className="flex min-w-0 flex-col gap-1">
          <Link
            href={`/blog/author/${post.authorSlug}`}
            className="w-fit text-sm font-medium text-foreground transition-colors duration-300 hover:text-link focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            {post.author}
          </Link>
          <span className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <time dateTime={post.date}>{post.publishedAt}</time>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="size-3.5" aria-hidden="true" />
              <T k="common.minutesRead" params={{ count: post.readingTime }} />
            </span>
          </span>
        </span>

        {/*
         * Share actions live on the byline row (author + date + share) and drop
         * to their own line below `lg`, where the author block and the four
         * share pills cannot share the width.
         */}
        {actions ? <div className="w-full lg:ml-auto lg:w-auto">{actions}</div> : null}
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
