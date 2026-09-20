"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Clock } from "lucide-react";

import type { PostSummary } from "@/lib/wordpress";

export type HeroSectionProps = {
  /** Lead story of the issue (summary — the CMS body never leaves the server). */
  post: PostSummary;
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
 * Lead-story hero: full-bleed imagery behind a dark overlay with oversized,
 * tightly tracked typography for the magazine's front page.
 *
 * Contrast contract: the copy sits on a photo + dark gradient scrim, so it
 * always uses FIXED light inks (`text-white` / `text-slate-*`) — never the
 * theme tokens (`text-foreground` / `text-muted-foreground`). The tokens flip
 * to dark ink in the light theme (see `globals.css` `.light`), which would
 * render dark-on-dark over the scrim and become unreadable.
 */
export function HeroSection({ post }: HeroSectionProps) {
  const prefersReducedMotion = useReducedMotion();
  const animation = reveal(prefersReducedMotion);

  return (
    <section className="relative isolate w-full overflow-hidden rounded-3xl border border-border">
      <div className="absolute inset-0">
        <Image
          src={post.image.src}
          alt={post.image.alt}
          fill
          preload
          unoptimized={post.image.unoptimized}
          sizes="100vw"
          className="object-cover"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-[#0F172A]/75 to-[#0F172A]/25"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(65%_65%_at_12%_8%,rgba(79,70,229,0.38),transparent_72%)]"
        />
      </div>

      {/*
       * Controlled hero box — large-screen tuning (2K / 4K / ultrawide).
       *
       * - base → sm: only a 380px floor, the height stays content-driven, so phones and
       *   tablets can never clip the badge or the headline.
       * - lg → xl: the box is clamped to `50vh` and capped at 500px (460px from `xl`),
       *   so the hero no longer eats the whole viewport on tall monitors and the
       *   "Latest stories" heading plus the top of the card grid stay above the fold.
       * - `lg:min-h-[440px]` / `xl:min-h-[460px]` are the content floors that make the
       *   cap deterministic: combined with `lg:gap-4`, `lg:p-10` and the line clamps
       *   below, the worst-case content (~452px at `xl`) always fits inside the cap,
       *   even though content is bottom-pinned inside an `overflow-hidden` frame.
       *
       * Content stays pinned to the bottom of the box.
       */}
      <div className="relative flex min-h-[380px] w-full flex-col justify-end gap-5 p-6 sm:p-10 lg:h-[50vh] lg:min-h-[440px] lg:max-h-[500px] lg:gap-4 lg:p-10 xl:min-h-[460px] xl:max-h-[460px]">
        <motion.div
          {...animation}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="flex flex-wrap items-center gap-3"
        >
          <span className="rounded-full bg-primary px-3 py-1 text-[0.65rem] font-semibold tracking-[0.18em] text-primary-foreground uppercase">
            {post.category.name}
          </span>
          <span className="text-[0.7rem] font-semibold tracking-[0.18em] text-slate-300 uppercase">
            Featured story
          </span>
        </motion.div>

        <motion.h1
          {...animation}
          transition={{ duration: 0.6, delay: 0.08, ease: "easeOut" }}
          className="max-w-4xl text-4xl leading-[1.05] font-semibold tracking-tight text-balance text-white sm:text-5xl lg:line-clamp-3 lg:text-5xl xl:text-6xl"
        >
          {post.title}
        </motion.h1>

        <motion.p
          {...animation}
          transition={{ duration: 0.6, delay: 0.16, ease: "easeOut" }}
          className="max-w-2xl text-base leading-relaxed text-slate-200 sm:text-lg lg:line-clamp-2"
        >
          {post.excerpt}
        </motion.p>

        <motion.div
          {...animation}
          transition={{ duration: 0.6, delay: 0.24, ease: "easeOut" }}
          className="mt-1 flex flex-wrap items-center gap-x-5 gap-y-3"
        >
          <Link
            href={post.href}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors duration-300 hover:bg-primary/85 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none"
          >
            Read the story
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>

          <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-300">
            <Link
              href={`/blog/author/${post.authorSlug}`}
              className="font-medium text-white transition-colors duration-300 hover:text-slate-200 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
              {post.author}
            </Link>
            <time dateTime={post.date}>{post.publishedAt}</time>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="size-3.5" aria-hidden="true" />
              {post.readingTime} min read
            </span>
          </p>
        </motion.div>
      </div>
    </section>
  );
}