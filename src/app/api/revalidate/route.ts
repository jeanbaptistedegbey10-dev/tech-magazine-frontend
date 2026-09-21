import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";

/**
 * On-Demand Revalidation webhook for TechPulse Magazine.
 *
 * Called by WordPress (Pantheon) after a post / category / media update, so
 * Vercel drops the stale Next.js data cache without waiting for the ISR
 * window to expire.
 *
 * Authentication: a shared secret, checked either as a query parameter
 * (`?secret=…`) or as an `Authorization` header (`Bearer <secret>`). The same
 * value must be set in the `REVALIDATION_SECRET` environment variable on Vercel.
 *
 * This route honours the project auth contract: it never throws and never
 * exposes internals. Unknown or missing secrets get a 401; valid requests get
 * a 200 with `{ revalidated: true, now: Date.now() }`.
 */

const SECRET = process.env.REVALIDATION_SECRET?.trim() || "";

type RevalidationPayload = {
  revalidated: boolean;
  now: number;
  paths?: string[];
  error?: string;
};

function normalizeBearer(raw: string | null | undefined): string | null {
  if (!raw) return null;
  if (raw.startsWith("Bearer ")) return raw.slice("Bearer ".length).trim();
  if (raw.startsWith("Basic ")) return raw.slice("Basic ".length).trim();
  return raw.trim();
}

function resolveSecret(request: NextRequest): string | null {
  const querySecret = request.nextUrl.searchParams.get("secret");
  const headerSecret = normalizeBearer(request.headers.get("authorization"));
  if (querySecret && querySecret === SECRET) return querySecret;
  if (headerSecret && headerSecret === SECRET) return headerSecret;
  return null;
}

function buildPayload(result: { revalidated: boolean; now: number; paths?: string[]; error?: string }): RevalidationPayload {
  return result as RevalidationPayload;
}

/**
 * Revalidates the surfaces a WordPress update can affect:
 *   - home page (`/`)
 *   - every post ranking / desk listing (`/blog`)
 *   - desk archives (`/blog/category/[slug]`)
 *   - author archives (`/blog/author/[slug]`)
 *   - tagged posts (when the CMS changes tags, e.g. Premium toggling)
 *
 * The data layer tags every WPGraphQL request with `POSTS_CACHE_TAG`
 * (`"wordpress:posts"`). Invalidating that single tag is the safest "invalidate
 * everything WordPress-flavoured" action. `revalidateTag("wordpress")` is also
 * accepted for readers who prefer the broader generic tag.
 */
function revalidateSurfaces(): { revalidated: boolean; now: number; paths: string[] } {
  const now = Date.now();
  const paths: string[] = [];

  revalidatePath("/");
  paths.push("/");

  revalidatePath("/blog");
  paths.push("/blog");

  revalidatePath("/blog/category/tech-news");
  revalidatePath("/blog/category/development");
  revalidatePath("/blog/category/design");
  revalidatePath("/blog/category/ai-and-cloud");
  revalidatePath("/blog/category/non-classe");
  paths.push("/blog/category/tech-news");
  paths.push("/blog/category/development");
  paths.push("/blog/category/design");
  paths.push("/blog/category/ai-and-cloud");
  paths.push("/blog/category/non-classe");

  revalidatePath("/blog/author/[slug]");
  paths.push("/blog/author/[slug]");

  revalidatePath("/blog/[slug]");
  paths.push("/blog/[slug]");

  revalidateTag("wordpress", {});
  revalidateTag("wordpress:posts", {});

  return { revalidated: true, now, paths };
}

export async function GET(request: NextRequest): Promise<NextResponse<RevalidationPayload>> {
  const secret = resolveSecret(request);
  if (!secret) {
    return NextResponse.json(
      { revalidated: false, now: Date.now(), error: "secret invalide ou absent" },
      { status: 401 }
    );
  }

  const payload = revalidateSurfaces();
  return NextResponse.json(buildPayload(payload), { status: 200 });
}

export async function POST(request: NextRequest): Promise<NextResponse<RevalidationPayload>> {
  const secret = resolveSecret(request);

  if (!secret) {
    return NextResponse.json(
      { revalidated: false, now: Date.now(), error: "secret invalide ou absent" },
      { status: 401 }
    );
  }

  let paths: string[] = [];

  try {
    const body = await request.json().catch(() => null);
    const target = (body as { type?: string; path?: string | null | undefined } | null)?.type?.trim()
      || (body as { path?: string | null | undefined })?.path?.trim()
      || "";

    if (target === "home" || target === "/") {
      revalidatePath("/");
      paths.push("/");
    } else if (target === "posts" || target === "/blog") {
      revalidatePath("/blog");
      paths.push("/blog");
    } else if (target === "categories") {
      revalidatePath("/blog/category/tech-news");
      revalidatePath("/blog/category/development");
      revalidatePath("/blog/category/design");
      revalidatePath("/blog/category/ai-and-cloud");
      revalidatePath("/blog/category/non-classe");
      paths.push(
        "/blog/category/tech-news",
        "/blog/category/development",
        "/blog/category/design",
        "/blog/category/ai-and-cloud",
        "/blog/category/non-classe"
      );
    } else if (target === "authors") {
      revalidatePath("/blog/author/[slug]");
      paths.push("/blog/author/[slug]");
    } else if (target === "posts_by_tag") {
      revalidateTag("wordpress", {});
      revalidateTag("wordpress:posts", {});
      paths.push("tags");
    } else if (target.startsWith("/")) {
      revalidatePath(target);
      paths.push(target);
    } else {
      // Unknown content type / path: fall back to a full surface revalidation.
      const full = revalidateSurfaces();
      paths = full.paths;
    }
  } catch {
    // Body parse failure: fall back to a full surface revalidation too.
    const full = revalidateSurfaces();
    paths = full.paths;
  }

  const now = Date.now();
  return NextResponse.json(
    { revalidated: true, now, paths },
    { status: 200 }
  );
}
