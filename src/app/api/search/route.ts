import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { getPosts } from "@/lib/wordpress";

/** The search dialog never needs more than a handful of hits. */
const DEFAULT_RESULT_LIMIT = 8;
const MAX_RESULT_LIMIT = 20;

/** Always resolved dynamically — a search is a per-query server call. */
export const dynamic = "force-dynamic";

/**
 * Live-search endpoint for the masthead `SearchDialog`.
 *
 * `GET /api/search?q=ia&limit=8` → `{ posts: [...], error: string | null }`.
 * The contract mirrors the data layer: the handler never throws, so a CMS
 * outage resolves to an empty list plus an `error` string instead of a 500.
 */
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const query = params.get("q")?.trim() ?? "";

  const rawLimit = Number.parseInt(params.get("limit") ?? "", 10);
  const limit = Number.isFinite(rawLimit)
    ? Math.min(Math.max(rawLimit, 1), MAX_RESULT_LIMIT)
    : DEFAULT_RESULT_LIMIT;

  if (query.length < 2) {
    return NextResponse.json({ posts: [], error: null });
  }

  try {
    const { posts, error } = await getPosts({ first: limit, search: query });

    return NextResponse.json({
      posts: posts.map((post) => ({
        id: post.id,
        slug: post.slug,
        href: post.href,
        title: post.title,
        excerpt: post.excerpt,
        publishedAt: post.publishedAt,
        readingTime: post.readingTime,
        category: post.category,
      })),
      error,
    });
  } catch {
    return NextResponse.json({
      posts: [],
      error: "La recherche est momentanément indisponible.",
    });
  }
}
