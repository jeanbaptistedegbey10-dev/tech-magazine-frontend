import type { MetadataRoute } from "next";

/**
 * robots.txt — `/robots.txt` (`src/app/robots.ts`).
 *
 * Public reading surfaces stay crawlable (`Allow: /`); the back-office and
 * every API route are fenced off. Robots matching is prefix-based, so
 * `Disallow: /admin` covers `/admin/login` + `/admin/dashboard` and
 * `Disallow: /api` covers every route handler (`/api/search`,
 * `/api/live-feed`, `/api/auth/*`, `/api/admin/*`, `/api/stripe/checkout`).
 *
 * The base URL follows the same resolution as the root `metadataBase` in
 * `src/app/layout.tsx`: `NEXT_PUBLIC_SITE_URL` first (set on Vercel, see
 * `DEPLOYMENT.md`), localhost fallback otherwise.
 */
const BASE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
).replace(/\/+$/, "");

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api"],
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
