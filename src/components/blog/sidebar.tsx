"use client";

import { RelatedPosts } from "@/components/blog/related-posts";
import { SidebarWidgets } from "@/components/blog/sidebar-widgets";
import type { PostCategory, PostSummary } from "@/lib/wordpress";
import { useTranslation } from "@/lib/i18n";

export type SidebarProps = {
  /** Desk index feeding the category card (live WP terms with counts). */
  categories: PostCategory[];
  /** Pool feeding the Premium picks card. */
  posts: PostSummary[];
  /** Recommended stories rendered above the widgets (article page only). */
  related?: PostSummary[];
  /** Extra utilities for the column — callers normally only pass the grid span. */
  className?: string;
};

/**
 * Shared editorial sidebar — `src/components/blog/sidebar.tsx`.
 *
 * The single column contract used by **every** reading surface (`/blog`,
 * `/blog/category/[slug]`, `/blog/author/[slug]` and `/blog/[slug]`):
 * optionally the recommended-reading rail, then the widgets stack.
 *
 * Two rules hold this component together:
 *
 * 1. **No `sticky` anywhere in the column.** The cards are tall (upsell,
 *    category index, picks, sponsor slot) and a sticky child inside the same
 *    scroll container overlapped the cards below it. Scrolling now moves the
 *    whole column like any other block.
 * 2. **The column carries its own grid span** (`lg:col-span-4`), so callers
 *    only have to place `<Sidebar />` inside a `lg:grid-cols-12` grid. Below
 *    `lg` the grid collapses to one column and the sidebar simply flows under
 *    the main content.
 */
export function Sidebar({ categories, posts, related, className }: SidebarProps) {
  const { t } = useTranslation();

  return (
    <aside
      aria-label={t("blog.sidebar.ariaLabel")}
      className={`flex w-full min-w-0 flex-col gap-6 lg:col-span-4 ${className || ""}`}
    >
      {related && related.length > 0 ? <RelatedPosts posts={related} /> : null}
      <SidebarWidgets categories={categories} posts={posts} />
    </aside>
  );
}