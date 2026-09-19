import type { NextConfig } from "next";

/**
 * Remote hosts the built-in Image Optimization API is allowed to fetch from.
 *
 * - `images.unsplash.com` -> curated editorial fallbacks used whenever a CMS
 *   post has no featured image (see `src/lib/wordpress.ts`).
 * - Pantheon WordPress hosts -> media library URLs returned by WPGraphQL
 *   (`featuredImage.node.sourceUrl`): the exact dev host plus a wildcard
 *   covering every Pantheon environment (dev / test / live / renamed
 *   project), in both `https` and `http`.
 * - `secure.gravatar.com` -> WordPress author portraits.
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
      {
        /**
         * The AI & Cloud desk lives at the WordPress slug `ai-and-cloud`
         * (term id 13). The home page once linked `/blog/category/ai-cloud`,
         * which fell through `resolveCategory` to `notFound()`; any link,
         * bookmark or crawler still carrying the short shape gets a permanent
         * 308 instead of a 404.
         */
        source: "/blog/category/ai-cloud",
        destination: "/blog/category/ai-and-cloud",
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
      {
        /**
         * Pantheon WordPress hosts (all environments). The CMS endpoint is
         * overridable via `NEXT_PUBLIC_WORDPRESS_API_URL` (see DEPLOYMENT.md),
         * so any `*.pantheonsite.io` host — dev, test, live or a renamed
         * project — must stay optimisable. The wildcard also covers the
         * exact host above; both entries are kept so the intent stays explicit.
         * The `http` entry only matters for local Pantheon mirrors; production
         * traffic is `https`.
         */
        protocol: "https",
        hostname: "**.pantheonsite.io",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "**.pantheonsite.io",
        pathname: "/**",
      },
      {
        /**
         * Google account avatars returned by Auth.js
         * (`session.user.image`) and rendered by the masthead `UserMenu`.
         */
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "/**",
      },
      {
        /**
         * WordPress author portraits. WPGraphQL resolves `user.avatar.url`
         * through the site's avatar service, which on the Pantheon install
         * answers with `https://secure.gravatar.com/avatar/<hash>?s=96&d=mm&r=g`
         * — rendered by the `/blog/author/[slug]` header card. Without this
         * entry the optimizer rejects the URL and the route falls back to the
         * monogram disc.
         */
        protocol: "https",
        hostname: "secure.gravatar.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
