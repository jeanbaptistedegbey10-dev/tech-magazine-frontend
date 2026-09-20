import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { getPosts } from "@/lib/wordpress";

/** The live-feed dialog is a digest, not an archive dump. */
const DEFAULT_FEED_LIMIT = 10;
const MAX_FEED_LIMIT = 20;

/** Always resolved dynamically — a live feed is a per-open server call. */
export const dynamic = "force-dynamic";

/**
 * Live-feed endpoint for the masthead `LiveFeedDialog`.
 *
 * `GET /api/live-feed?limit=10` → `{ posts: [...], error: string | null }`,
 * listing the newest published stories. The payload shape mirrors
 * `/api/search` (light: no CMS body, no image), plus the ISO `date` field so
 * the dialog can print relative "il y a 3 jours" stamps. The contract mirrors
 * the data layer: the handler never throws, so a CMS outage resolves to an
 * empty list plus an `error` string instead of a 500.
 */
export async function GET(request: NextRequest) {
  const rawLimit = Number.parseInt(
    request.nextUrl.searchParams.get("limit") ?? "",
    10
  );
  const limit = Number.isFinite(rawLimit)
    ? Math.min(Math.max(rawLimit, 1), MAX_FEED_LIMIT)
    : DEFAULT_FEED_LIMIT;

  try {
    const { posts, error } = await getPosts({ first: limit });

    return NextResponse.json({
      posts: posts.map((post) => ({
        id: post.id,
        href: post.href,
        title: post.title,
        excerpt: post.excerpt,
        date: post.date,
        publishedAt: post.publishedAt,
        readingTime: post.readingTime,
        category: { name: post.category.name, slug: post.category.slug },
      })),
      error,
    });
  } catch {
    return NextResponse.json({
      posts: [],
      error: "Le flux en direct est momentanément indisponible.",
    });
  }
}
