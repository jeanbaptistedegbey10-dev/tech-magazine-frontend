"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight, Clock } from "lucide-react";
import { cn } from "cn";

import type { Post } from "@/lib/wordpress";

export type PostCardProps = {
  post: Post;
  /** Position inside the grid — drives the fade-in stagger. */
  index?: number;
  /** Extra layout utilities merged onto the card root (kept for callers that need them). */
  className?: string;
};

/**
 * Reusable editorial post card: indigo category badge, hover image zoom,
 * reading-time badge and a Framer Motion fade-up as the card enters the viewport.
 */
export function PostCard({ post, index = 0, className }: PostCardProps) {
  const prefersReducedMotion = useReducedMotion();
  const delay = Math.min(index * 0.08, 0.4);

  return (
    <motion.article
      initial={prefersReducedMotion ? false : { opacity: 0, y: 28 }}
      whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.55, delay, ease: "easeOut" }}
      className={cn(
        /* Strict grid alignment: every card fills its row track and pins its footer. */
        "group relative flex h-full w-full flex-col justify-between overflow-hidden rounded-2xl border border-border bg-card",
        "transition-colors duration-300 hover:border-primary/60",
        className
      )}
    >
      <Link
        href={post.href}
        className="flex h-full w-full flex-col rounded-2xl focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none"
      >
        <div className="relative aspect-[16/9] w-full shrink-0 overflow-hidden bg-surface">
          <Image
            src={post.image.src}
            alt={post.image.alt}
            fill
            /*
             * Mirrors the grid: 1 column up to `md`, 2 up to `lg`, 3 up to `2xl` and
             * 4 columns from 1536px — so the optimizer never serves a ~33vw candidate
             * (≈490px) for the ~350px cards of the 4-column ultrawide layout.
             */
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (min-width: 1536px) 25vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/25 to-transparent"
          />
          <span className="absolute top-4 left-4 rounded-full bg-primary px-3 py-1 text-[0.65rem] font-semibold tracking-[0.14em] text-primary-foreground uppercase">
            {post.category.name}
          </span>
        </div>

        {/* Fixed-height text blocks keep titles, excerpts and footers on a shared baseline. */}
        <div className="flex flex-1 flex-col gap-3 p-5">
          <h3 className="line-clamp-2 h-[3.5rem] text-lg font-semibold tracking-tight text-balance text-foreground transition-colors duration-300 group-hover:text-[#a5b4fc]">
            {post.title}
          </h3>

          <p className="line-clamp-3 h-[4.5rem] text-sm leading-relaxed text-muted-foreground">
            {post.excerpt}
          </p>

          <div className="mt-auto flex items-center justify-between gap-3 border-t border-border pt-4 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Clock className="size-3.5" aria-hidden="true" />
              {post.readingTime} min read
            </span>

            <span className="inline-flex items-center gap-1.5">
              <time dateTime={post.date}>{post.publishedAt}</time>
              <ArrowUpRight
                aria-hidden="true"
                className="size-3.5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              />
            </span>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}