import type { MetadataRoute } from "next";

import { getCategories, getPosts } from "@/lib/wordpress";

/**
 * Dynamic sitemap — `/sitemap.xml` (`src/app/sitemap.ts`).
 *
 * Lists every indexable public URL of the magazine: the static routes (home,
 * archive, newsroom pages, legal pages, pricing), the desk archives resolved
 * live from WordPress (`getCategories()`) and every published article slug
 * (`getPosts()`), with the CMS publication date as `lastModified`.
 *
 * The CMS dependency is non-blocking: both data calls honour the never-throw
 * contract of the data layer, so a WordPress outage degrades the sitemap to
 * the static entries instead of failing the build. Member surfaces
 * (`/dashboard`, `/login`, `/register`) and private areas (`/admin/*`,
 * `/api/*`) are deliberately absent — they are disallowed in `robots.ts` too.
 *
 * The base URL follows the same resolution as the root `metadataBase` in
 * `src/app/layout.tsx`: `NEXT_PUBLIC_SITE_URL` first (set on Vercel, see
 * `DEPLOYMENT.md`), localhost fallback otherwise.
 */
const BASE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
).replace(/\/+$/, "");

/** Every public, indexable static route of the magazine. */
const STATIC_ROUTES = [
  { path: "/", changeFrequency: "daily", priority: 1 },
  { path: "/blog", changeFrequency: "daily", priority: 0.9 },
  { path: "/about", changeFrequency: "monthly", priority: 0.5 },
  { path: "/contact", changeFrequency: "monthly", priority: 0.4 },
  { path: "/subscribe", changeFrequency: "monthly", priority: 0.5 },
  { path: "/privacy", changeFrequency: "yearly", priority: 0.3 },
  { path: "/terms", changeFrequency: "yearly", priority: 0.3 },
] as const;

/** Hourly refresh so a newly published CMS story joins the sitemap quickly. */
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
    url: `${BASE_URL}${route.path}`,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  const [postsResult, categories] = await Promise.all([
    getPosts({ first: 100 }),
    getCategories(),
  ]);

  const categoryEntries: MetadataRoute.Sitemap = categories
    .filter((category) => Boolean(category.slug))
    .map((category) => ({
      url: `${BASE_URL}/blog/category/${category.slug}`,
      changeFrequency: "daily",
      priority: 0.7,
    }));

  const postEntries: MetadataRoute.Sitemap = postsResult.posts.map((post) => {
    const lastModified = new Date(post.date);
    return {
      url: `${BASE_URL}${post.href}`,
      ...(Number.isNaN(lastModified.getTime()) ? {} : { lastModified }),
      changeFrequency: "weekly",
      priority: 0.6,
    };
  });

  return [...staticEntries, ...categoryEntries, ...postEntries];
}
