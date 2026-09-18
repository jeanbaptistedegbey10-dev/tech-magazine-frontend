import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";

import type { Post } from "@/lib/wordpress";

export type RelatedPostsProps = {
  /** Up to three recommended stories (the caller decides how they are picked). */
  posts: Post[];
  /** Section title, kept overridable so the rail can be reused elsewhere. */
  heading?: string;
  /** Small indigo eyebrow above the title. */
  eyebrow?: string;
};

/**
 * Recommended-reading rail for the article page.
 *
 * Server component: the micro-interactions are pure CSS (image zoom + border tint),
 * so the rail ships no JavaScript of its own. From `lg` up it sits next to the
 * article body as a sticky sidebar (`lg:sticky lg:top-8`); below `lg` the page grid
 * collapses and the very same markup becomes the "keep reading" section under the
 * story — one implementation for both placements.
 */
export function RelatedPosts({
  posts,
  heading = "Recommended reading",
  eyebrow = "Keep reading",
}: RelatedPostsProps) {
  if (posts.length === 0) {
    return null;
  }

  return (
    <aside
      aria-labelledby="related-posts-heading"
      className="flex flex-col gap-5 lg:sticky lg:top-8 lg:self-start"
    >
      <div className="flex flex-col gap-1.5 border-b border-border pb-3">
        <span className="text-[0.65rem] font-semibold tracking-[0.2em] text-primary uppercase">
          {eyebrow}
        </span>
        <h2
          id="related-posts-heading"
          className="text-xl font-semibold tracking-tight text-foreground"
        >
          {heading}
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

                <h3 className="line-clamp-2 text-sm leading-snug font-semibold tracking-tight text-foreground transition-colors duration-300 group-hover:text-[#a5b4fc]">
                  {post.title}
                </h3>

                <span className="mt-auto inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Clock className="size-3.5" aria-hidden="true" />
                  {post.readingTime} min read
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ul>

      <Link
        href="/"
        className="inline-flex items-center gap-2 self-start rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors duration-300 hover:border-primary/60 hover:text-[#a5b4fc] focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
      >
        All stories
        <ArrowRight className="size-4" aria-hidden="true" />
      </Link>
    </aside>
  );
}
