# Deployment — TechPulse Magazine on Vercel

TechPulse Magazine is a Next.js App Router frontend reading from a headless
WordPress (WPGraphQL) CMS. Any GitHub push to the tracked branch redeploys
automatically once the repository is linked to Vercel.

## 1. Link the GitHub repository to Vercel

1. Log in to [Vercel](https://vercel.com) and click **Add New → Project**.
2. Choose **Import Git Repository** and select the
   `tech-magazine-frontend` repository (grant access to the GitHub
   organisation first if it is not listed).
3. Keep the detected defaults:
   - Framework Preset: **Next.js**
   - Build Command: `next build` (see `package.json`, script `build`)
   - Output Directory: managed automatically by the Next.js preset
   - Install Command: `npm install`
   - Node.js version: 20 or later
4. Do **not** click Deploy yet — configure the environment variable below
   first, then click **Deploy**.

## 2. Required environment variable

Set this variable for the **Production** environment (and Preview too if
preview deployments should read the same CMS):

| Name | Value |
| ---- | ----- |
| `NEXT_PUBLIC_WORDPRESS_API_URL` | `https://dev-tech-pulse-cms.pantheonsite.io/graphql` |

Vercel dashboard path: **Project → Settings → Environment Variables**.
Paste the name and value exactly, select the Production (and Preview)
environments, save, then trigger a redeploy so the value is baked into the
build.

Local development equivalent: create a `.env.local` file at the project
root containing the same pair:

```bash
NEXT_PUBLIC_WORDPRESS_API_URL=https://dev-tech-pulse-cms.pantheonsite.io/graphql
```

Notes:

- The data layer (`src/lib/wordpress.ts`) reads
  `NEXT_PUBLIC_WORDPRESS_API_URL` first, then falls back to the legacy
  `WORDPRESS_GRAPHQL_ENDPOINT` variable, then to the built-in Pantheon
  default above — so existing local setups keep working.
- Pointing the variable at a different CMS host also requires adding that
  host to `images.remotePatterns` in `next.config.ts`, otherwise the image
  optimizer rejects the new featured-image URLs.
- No other environment variable is required. No `vercel.json` file is
  needed: the zero-config Next.js preset handles routing, including the
  permanent redirect from the retired article path to the current one.

## 4. On-Demand Revalidation webhook

To keep the live site fresh when WordPress content changes — without
waiting for the 1-hour ISR window to expire — configure an On-Demand
Revalidation webhook.

### 4.1 Environment variable

Set `REVALIDATION_SECRET` to a strong, random shared secret for both the
**Production** and **Preview** environments:

| Name | Value |
| ---- | ----- |
| `REVALIDATION_SECRET` | `<a-strong-random-secret-string>` |

Vercel dashboard path: **Project → Settings → Environment Variables**.

Local development equivalent: add to `.env.local`:

```bash
REVALIDATION_SECRET=your-local-dev-secret
```

### 4.2 WordPress webhook URL

Configure the webhook in WordPress (via the WP Webhooks or Headless
Revalidate plugin) to call:

```
https://<your-vercel-domain>.app/api/revalidate?secret=<REVALIDATION_SECRET>
```

The secret matches against either a `secret` query parameter or an
`Authorization: Bearer <secret>` header. On a mismatch the endpoint
returns `401 Unauthorized`; on success it revalidates `/`, `/blog`, all
desk/category archives, `/blog/author/[slug]` and `/blog/[slug]`, then
returns `{ revalidated: true, now: <timestamp> }`.

### 4.3 What gets invalidated

The data layer tags every WPGraphQL `fetch()` call with the
`wordpress:posts` cache tag. The webhook calls `revalidateTag("wordpress:posts")`
which clears that tag across all statically and dynamically rendered pages
that depend on WordPress data, so a single webhook POST refreshes the
entire magazine.

## 3. Verify the deployment

1. Open the production URL and check that the hero story and the card grid
   render with real CMS content (not the degraded empty state).
2. Open any article page and confirm the body, the related-stories rail and
   the back link all render.
3. In the Vercel dashboard, confirm the latest deployment log shows a clean
   `next build` with all static pages generated (home page + one page per
   published post).
