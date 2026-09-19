/**
 * Primary navigation of the magazine — `src/components/blog/navigation.ts`.
 *
 * Plain data module (no `"use client"`, no server-only imports) so both the
 * client masthead and the server footer can import the same tuple and the two
 * can never drift apart. `labelKey` points at the matching entry in
 * `src/lib/i18n/locales/*.json`, resolved by the calling component.
 * Also exports two pure path helpers (`isNavActive`, `resolveActiveNavHref`)
 * with zero imports, so the module stays safe for server components.
 */
export const PRIMARY_NAV = [
  { href: "/", labelKey: "nav.home" },
  { href: "/blog", labelKey: "nav.allStories" },
  { href: "/blog/category/tech-news", labelKey: "nav.techNews" },
  { href: "/blog/category/development", labelKey: "nav.development" },
  /**
   * The AI & Cloud desk. The slug is `ai-and-cloud` (WP term id 13) — never the
   * short `ai-cloud`, which only exists as a permanent 308 in `next.config.ts`.
   */
  { href: "/blog/category/ai-and-cloud", labelKey: "nav.aiCloud" },
  { href: "/about", labelKey: "nav.about" },
  { href: "/contact", labelKey: "nav.contact" },
] as const;

export type PrimaryNavEntry = (typeof PRIMARY_NAV)[number];

/**
 * Returns `true` when `pathname` corresponds to the nav `href` — either an
 * exact match or a nested route under it (`/blog` matches `/blog/mon-article`
 * and `/blog/category/tech-news`). The root `/` only ever matches exactly,
 * otherwise every page would highlight it. Trailing slashes are ignored on
 * both sides.
 */
export function isNavActive(
  href: string,
  pathname: string | null | undefined,
): boolean {
  if (!pathname) return false;
  const current =
    pathname !== "/" && pathname.endsWith("/")
      ? pathname.slice(0, -1)
      : pathname;
  const target =
    href !== "/" && href.endsWith("/") ? href.slice(0, -1) : href;
  if (target === "/") return current === "/";
  return current === target || current.startsWith(`${target}/`);
}

/**
 * Resolves the single active nav href for a pathname: the longest matching
 * entry wins. Without this, `/blog/category/tech-news` would highlight both
 * `/blog` and the desk link. Returns `null` when nothing matches (unknown
 * routes, member pages…).
 */
export function resolveActiveNavHref(
  pathname: string | null | undefined,
  entries: readonly { href: string }[] = PRIMARY_NAV,
): string | null {
  let best: string | null = null;
  for (const entry of entries) {
    if (
      isNavActive(entry.href, pathname) &&
      (best === null || entry.href.length > best.length)
    ) {
      best = entry.href;
    }
  }
  return best;
}