import type { NextConfig } from "next";

/**
 * Remote hosts the built-in Image Optimization API is allowed to fetch from.
 *
 * - `images.unsplash.com` -> curated editorial fallbacks used whenever a CMS
 *   post has no featured image (see `src/lib/wordpress.ts`).
 * - `dev-tech-pulse-cms.pantheonsite.io` -> WordPress media library URLs
 *   returned by WPGraphQL (`featuredImage.node.sourceUrl`).
 *
 * The `/**` path pattern is required because both hosts append transformation and
 * cache-busting query strings to their URLs.
 *
 * `search` is deliberately omitted: it defaults to "any query string", whereas the
 * `new URL()` shorthand would infer `search: ""` and reject every Unsplash URL
 * (they all carry `?auto=format&fit=...` parameters).
 */
const nextConfig: NextConfig = {
  /**
   * The article route moved from `/posts/[slug]` to `/blog/[slug]`. Any link,
   * bookmark or crawler that still points at the old shape is answered with a
   * permanent 308 instead of a 404, so the URL change costs no ranking.
   */
  async redirects() {
    return [
      {
        source: "/posts/:slug",
        destination: "/blog/:slug",
        permanent: true,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "dev-tech-pulse-cms.pantheonsite.io",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
