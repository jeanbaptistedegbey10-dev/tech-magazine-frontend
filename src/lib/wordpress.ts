/**
 * WordPress (WPGraphQL) data access layer for TechPulse Magazine.
 *
 * Design goals:
 * - Every CMS response is validated and normalised before it reaches a component,
 *   so the UI only ever deals with the `Post` shape defined below.
 * - Nothing in this module throws. A CMS outage, a GraphQL error or an empty
 *   response degrade to an empty/`null` result plus a human readable `error`
 *   string that the UI can surface, instead of crashing the render.
 * - Responses are cached with the Next.js data cache (`revalidate` + tag), which
 *   keeps the magazine fast while still refreshing hourly.
 *
 * Caching / revalidation:
 *   fetch(..., { next: { revalidate: POSTS_REVALIDATE_SECONDS, tags: [POSTS_CACHE_TAG] } })
 *   Invalidate on demand with `revalidateTag(POSTS_CACHE_TAG)` (e.g. from a webhook).
 */

const DEFAULT_GRAPHQL_ENDPOINT =
  "https://dev-tech-pulse-cms.pantheonsite.io/graphql";

/**
 * WPGraphQL endpoint. Override with the `NEXT_PUBLIC_WORDPRESS_API_URL`
 * environment variable (the one configured on Vercel, see `DEPLOYMENT.md`),
 * falling back to the legacy `WORDPRESS_GRAPHQL_ENDPOINT` variable and finally
 * to the built-in Pantheon default.
 *
 * Good to know: when pointing at a different host, add that host to
 * `images.remotePatterns` in `next.config.ts` so featured images stay optimisable.
 */
export const WORDPRESS_GRAPHQL_ENDPOINT =
  process.env.NEXT_PUBLIC_WORDPRESS_API_URL?.trim() ||
  process.env.WORDPRESS_GRAPHQL_ENDPOINT?.trim() ||
  DEFAULT_GRAPHQL_ENDPOINT;

/** Origin of the headless WordPress install (every article originates here). */
export const WORDPRESS_SITE_URL = new URL(WORDPRESS_GRAPHQL_ENDPOINT).origin;

/** Cache tag attached to every request, usable with `revalidateTag`. */
export const POSTS_CACHE_TAG = "wordpress:posts";

/** Seconds a CMS response stays fresh in the Next.js data cache. */
export const POSTS_REVALIDATE_SECONDS = 3600;

/** Hard timeout so an unresponsive CMS can never block a page render. */
const REQUEST_TIMEOUT_MS = 10_000;

/** Pause before the single transport-failure retry in `fetchGraphQL`. */
const RETRY_DELAY_MS = 800;

/** Reading speed (words per minute) used for the "x min read" badge. */
const WORDS_PER_MINUTE = 200;

/** Number of posts rendered on the magazine home page. */
export const HOME_PAGE_POST_COUNT = 9;

export type PostCategory = {
  /** WP term id (`databaseId`), present when the CMS exposes it. */
  id?: number;
  name: string;
  slug: string;
  /** Published post count from WP (`count`), zero when the CMS omits it. */
  count: number;
};

export type PostImage = {
  src: string;
  alt: string;
  width: number;
  height: number;
  /** `true` when the CMS post has no featured image and an editorial fallback is used. */
  isFallback: boolean;
};

export type Post = {
  /** Global GraphQL id (`cG9zdDoxNA==`), stable across requests. */
  id: string;
  /** WordPress numeric id, handy for analytics and keys. */
  databaseId: number;
  slug: string;
  title: string;
  /** Plain text excerpt, HTML tags and entities resolved. */
  excerpt: string;
  /** Raw editorial HTML from the CMS, rendered on the article route. */
  content: string;
  /** ISO 8601 timestamp exactly as returned by the CMS. */
  date: string;
  /** Pre-formatted label for the UI, e.g. "Sep 15, 2026". */
  publishedAt: string;
  /** Absolute permalink on the headless WordPress install. */
  sourceUrl: string;
  author: string;
  /** URL-safe author identifier for the `/blog/author/[slug]` route. */
  authorSlug: string;
  category: PostCategory;
  /** All tags attached to the post (the `premium` slug drives the paywall). */
  tags: PostCategory[];
  /** `true` when the post carries the Premium tag (Phase 1 seeding). */
  isPremium: boolean;
  image: PostImage;
  /** Estimated reading time in minutes (minimum 1). */
  readingTime: number;
  /** Internal App Router path for the article page. */
  href: string;
};

/**
 * A `Post` without the raw CMS body — the **only** shape a client component may
 * receive.
 *
 * Why this exists: every prop handed to a client component is serialised into
 * the RSC payload, so passing a full `Post` shipped the article HTML to the
 * browser twice — bloating each archive page by the whole newsroom's markup and,
 * worse, handing the gated Premium body to any reader who opened the payload
 * inspector. `toPostSummary()` is the gate that keeps the body server-side; the
 * article route renders it and never passes it on.
 */
export type PostSummary = Omit<Post, "content"> & {
  /**
   * Compile-time guard: `never` makes a full `Post` unassignable to
   * `PostSummary`, so TypeScript — not code review — is what keeps the CMS body
   * on the server. Passing `post` straight into a client component is a type
   * error; call `toPostSummary()` instead.
   */
  content?: never;
};

/** Drops the CMS body before a post crosses into the client bundle. */
export function toPostSummary(post: Post): PostSummary {
  return {
    id: post.id,
    databaseId: post.databaseId,
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    date: post.date,
    publishedAt: post.publishedAt,
    sourceUrl: post.sourceUrl,
    author: post.author,
    authorSlug: post.authorSlug,
    category: post.category,
    tags: post.tags,
    isPremium: post.isPremium,
    image: post.image,
    readingTime: post.readingTime,
    href: post.href,
  };
}

/** `toPostSummary()` over a list, for grids and sidebars. */
export function toPostSummaries(posts: Post[]): PostSummary[] {
  return posts.map(toPostSummary);
}

export type PostsResult = {
  posts: Post[];
  hasNextPage: boolean;
  endCursor: string | null;
  /** `null` on success, otherwise a short description of what went wrong. */
  error: string | null;
};

export type PostResult = {
  post: Post | null;
  /** `null` on success or plain "not found", otherwise the CMS failure reason. */
  error: string | null;
};

export type HomePageData = {
  heroPost: Post | null;
  latestPosts: Post[];
  /** Total number of stories rendered (hero included). */
  total: number;
  error: string | null;
};

export type AuthorProfile = {
  name: string;
  slug: string;
  /** Plain-text bio (WP description stripped of markup, empty when unset). */
  bio: string;
  avatarUrl: string | null;
};

export type AuthorResult = {
  author: AuthorProfile | null;
  /** `null` on success or plain "not found", otherwise the CMS failure reason. */
  error: string | null;
};

export type GetPostsOptions = {
  /** Number of posts to request (defaults to the home page count). */
  first?: number;
  /** Optional WPGraphQL `categoryName` filter. */
  categoryName?: string;
  /**
   * Optional WP term-id filter (`categoryId` where arg). Preferred over
   * `categoryName`: WordPress stores `&` in term names in an encoded form, so
   * the name lookup misses desks like "AI & Cloud" while the id lookup hits.
   */
  categoryId?: number;
  /** Optional full-text query, mapped onto the WPGraphQL `search` where arg. */
  search?: string;
  /**
   * Optional author filter, mapped onto the WPGraphQL `authorName` where arg.
   * Accepts a display name, login or nicename — trimmed, dropped when empty.
   */
  authorName?: string;
  /**
   * Optional content language (`fr` / `en` / `de`).
   *
   * Mapped onto the WPGraphQL `language` where arg exposed by the WPML /
   * Polylang GraphQL bridges (`wp-graphql-wpml`, `wp-graphql-polylang`).
   * Trimmed and uppercased (`fr` -> `FR`) to match the enum those plugins
   * declare; dropped when empty. Installs without the bridge simply ignore an
   * unknown where arg as a GraphQL validation error — see `fetchGraphQL` for
   * the automatic retry-without-language fallback.
   */
  language?: string;
};

/* ─────────────────────────── raw WPGraphQL shapes ─────────────────────────── */

type WPConnection<TNode> = { nodes: TNode[] } | null;

type WPRawMedia = {
  sourceUrl: string | null;
  altText: string | null;
  mediaDetails: { width: number | null; height: number | null } | null;
};

type WPRawTerm = {
  databaseId?: number | null;
  name: string | null;
  slug: string | null;
  count?: number | null;
};

type WPRawPost = {
  id: string;
  databaseId: number;
  slug: string;
  uri: string | null;
  title: string | null;
  date: string | null;
  excerpt: string | null;
  content: string | null;
  author: {
    node: {
      name: string | null;
      slug: string | null;
      description: string | null;
      avatar: { url: string | null } | null;
    } | null;
  } | null;
  categories: WPConnection<WPRawTerm>;
  tags: WPConnection<WPRawTerm>;
  featuredImage: { node: WPRawMedia | null } | null;
};

type WPRawPosts = {
  pageInfo: { hasNextPage: boolean; endCursor: string | null };
  nodes: WPRawPost[];
};

type WPRawCategoriesData = {
  categories: WPConnection<{
    databaseId?: number | null;
    name: string | null;
    slug: string | null;
    count?: number | null;
  }>;
};

type WPRawAuthor = {
  name: string | null;
  slug: string | null;
  description: string | null;
  avatar: { url: string | null } | null;
};

/* ────────────────────────────── GraphQL queries ───────────────────────────── */

/**
 * Selection set shared by every post query.
 *
 * `content` is requested in listings on purpose: it is the only reliable source
 * for the reading-time estimate (WPGraphQL exposes no word count). The payload is
 * cached for {@link POSTS_REVALIDATE_SECONDS}, so the cost is paid once per hour.
 */
const POST_FIELDS = `
  id
  databaseId
  slug
  uri
  title
  date
  excerpt
  content
  author { node { name slug description avatar { url } } }
  categories(first: 1) { nodes { databaseId name slug count } }
  tags(first: 20) { nodes { databaseId name slug count } }
  featuredImage {
    node {
      sourceUrl
      altText
      mediaDetails { width height }
    }
  }
`;

const POST_BY_SLUG_QUERY = `
  query PostBySlug($slug: ID!) {
    post(id: $slug, idType: SLUG) {
      ${POST_FIELDS}
    }
  }
`;

/**
 * Translated variant of the single-post query for installs carrying a WPML /
 * Polylang GraphQL bridge. `translation(language: $language)` resolves the
 * requested locale and falls back to the default language inside the helper
 * when the bridge is missing (see `isMissingLanguageBridgeError`).
 */
const POST_BY_SLUG_TRANSLATED_QUERY = `
  query PostBySlugTranslated($slug: ID!, $language: LanguageCodeEnum!) {
    post(id: $slug, idType: SLUG) {
      translation(language: $language) {
        ... on Post {
          ${POST_FIELDS}
        }
      }
      ${POST_FIELDS}
    }
  }
`;

const AUTHOR_BY_SLUG_QUERY = `
  query AuthorBySlug($slug: ID!) {
    user(id: $slug, idType: SLUG) {
      name
      slug
      description
      avatar { url }
    }
  }
`;

/**
 * Builds the listing query dynamically so every combination of filters stays
 * supported (`categoryId` / `categoryName` / `search` / `authorName` /
 * `language`) without maintaining a matrix of static documents. Each filter is
 * a non-empty trimmed value; the matching `where` arg and `$variable` are
 * emitted only when present. `language` uses the `LanguageCodeEnum` exposed by
 * the WPML / Polylang GraphQL bridges.
 */
function buildPostsQuery(filters: {
  categoryId?: number;
  categoryName?: string;
  search?: string;
  authorName?: string;
  language?: string;
}): string {
  const declarations: string[] = ["$first: Int!"];
  const where: string[] = ["status: PUBLISH", "orderby: { field: DATE, order: DESC }"];

  if (typeof filters.categoryId === "number") {
    declarations.push("$categoryId: Int!");
    where.push("categoryId: $categoryId");
  }

  if (filters.categoryName) {
    declarations.push("$categoryName: String!");
    where.push("categoryName: $categoryName");
  }

  if (filters.search) {
    declarations.push("$search: String!");
    where.push("search: $search");
  }

  if (filters.authorName) {
    declarations.push("$authorName: String!");
    where.push("authorName: $authorName");
  }

  if (filters.language) {
    declarations.push("$language: LanguageCodeEnum!");
    where.push("language: $language");
  }

  return `
  query FilteredPosts(${declarations.join(", ")}) {
    posts(first: $first, where: { ${where.join(" ")} }) {
      pageInfo { hasNextPage endCursor }
      nodes { ${POST_FIELDS} }
    }
  }
`;
}

const CATEGORIES_QUERY = `
  query PostCategories {
    categories(first: 50, where: { orderby: COUNT, order: DESC }) {
      nodes { databaseId name slug count }
    }
  }
`;

/* ────────────────────────── editorial fallback images ─────────────────────── */

/**
 * Curated Unsplash photography used when a CMS post has no featured image.
 * Every URL was verified to resolve with `200 image/*` from `images.unsplash.com`,
 * which is whitelisted in `next.config.ts`.
 */
const FALLBACK_IMAGES: readonly Omit<PostImage, "isFallback">[] = [
  {
    src: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1600&q=80",
    alt: "Close-up of a circuit board with glowing traces",
    width: 1600,
    height: 1067,
  },
  {
    src: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1600&q=80",
    alt: "Green code raining across a dark display",
    width: 1600,
    height: 1067,
  },
  {
    src: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1600&q=80",
    alt: "Earth seen from orbit wrapped in a network of light",
    width: 1600,
    height: 1067,
  },
  {
    src: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1600&q=80",
    alt: "Engineers collaborating around laptops in a studio",
    width: 1600,
    height: 1067,
  },
  {
    src: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1600&q=80",
    alt: "Laptop displaying source code on a wooden desk",
    width: 1600,
    height: 1067,
  },
  {
    src: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1600&q=80",
    alt: "Retro computer hardware on a neon-lit shelf",
    width: 1600,
    height: 1067,
  },
  {
    src: "https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&w=1600&q=80",
    alt: "Sleek laptop on a dark surface lit from the side",
    width: 1600,
    height: 1067,
  },
  {
    src: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1600&q=80",
    alt: "White humanoid robot seen in profile",
    width: 1600,
    height: 1067,
  },
  {
    src: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=1600&q=80",
    alt: "Computer screen filled with JavaScript source code",
    width: 1600,
    height: 1067,
  },
  {
    src: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1600&q=80",
    alt: "Security operations dashboard on a dark monitor",
    width: 1600,
    height: 1067,
  },
  {
    src: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1600&q=80",
    alt: "Open-plan technology office with developers at work",
    width: 1600,
    height: 1067,
  },
  {
    src: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1600&q=80",
    alt: "Minimal desk setup with a laptop and notebook",
    width: 1600,
    height: 1067,
  },
];

/* ────────────────────────────── transformations ───────────────────────────── */

const DATE_FORMATTER = new Intl.DateTimeFormat("en-US", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

const FALLBACK_CATEGORY: PostCategory = { name: "Technology", slug: "technology", count: 0 };

/** Tag slug that marks a story as Premium (see `scripts/seed-wordpress.js`). */
const PREMIUM_TAG_SLUG = "premium";

/** Named entities the WordPress excerpt/title fields commonly emit. */
const NAMED_ENTITIES: Record<string, string> = {
  nbsp: " ",
  rsquo: "\u2019",
  lsquo: "\u2018",
  rdquo: "\u201D",
  ldquo: "\u201C",
  hellip: "\u2026",
  mdash: "\u2014",
  ndash: "\u2013",
  laquo: "\u00AB",
  raquo: "\u00BB",
  middot: "\u00B7",
  bull: "\u2022",
  copy: "\u00A9",
  reg: "\u00AE",
  trade: "\u2122",
  deg: "\u00B0",
  times: "\u00D7",
  eacute: "\u00E9",
  egrave: "\u00E8",
  agrave: "\u00E0",
  ccedil: "\u00E7",
};

/** Resolves HTML entities. `&amp;` is decoded last to avoid double decoding. */
function decodeHtmlEntities(value: string): string {
  return value
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCodePoint(Number(code)))
    .replace(/&#x([\da-f]+);/gi, (_, code: string) =>
      String.fromCodePoint(Number.parseInt(code, 16))
    )
    .replace(/&([a-z]+);/gi, (match, name: string) => {
      const decoded = NAMED_ENTITIES[name.toLowerCase()];
      return decoded ?? (name.toLowerCase() === "amp" ? "&" : match);
    });
}

/** Strips markup and collapses whitespace, turning CMS HTML into plain text. */
function cleanText(value: string | null | undefined): string {
  if (!value) {
    return "";
  }

  return decodeHtmlEntities(value.replace(/<[^>]*>/g, " "))
    .replace(/\s+/g, " ")
    .trim();
}

/** Shortens plain text on a word boundary so UI copy never breaks mid-word. */
function truncate(value: string, maxLength: number): string {
  if (value.length <= maxLength) {
    return value;
  }

  const clipped = value.slice(0, maxLength);
  const lastSpace = clipped.lastIndexOf(" ");

  return `${(lastSpace > maxLength / 2 ? clipped.slice(0, lastSpace) : clipped).trimEnd()}\u2026`;
}

/**
 * Estimates reading time at {@link WORDS_PER_MINUTE} words per minute.
 * Falls back gracefully when the CMS only returns a one-line body.
 */
function estimateReadingTime(...sources: (string | null | undefined)[]): number {
  const text = sources.map((source) => cleanText(source)).join(" ");
  const words = text.split(/\s+/).filter((word) => /[\p{L}\p{N}]/u.test(word)).length;

  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
}

/** Forces `http://` CMS URLs onto `https://` so `next/image` never mixes content. */
function forceHttpsUrl(value: string): string {
  return value.toLowerCase().startsWith("http://") ? `https://${value.slice(7)}` : value;
}

/** Trims, forces HTTPS and rejects anything that is not a valid absolute `https://` URL. */
function sanitizeImageUrl(value: string | null | undefined): string | null {
  const trimmed = value?.trim();

  if (!trimmed) {
    return null;
  }

  const upgraded = forceHttpsUrl(trimmed);

  if (!upgraded.toLowerCase().startsWith("https://")) {
    return null;
  }

  try {
    new URL(upgraded);
  } catch {
    return null;
  }

  return upgraded;
}

/** Deterministic fallback image so a given post keeps the same artwork. */
function pickFallbackImage(seed: string): PostImage {
  // FNV-1a: spreads slugs evenly across the pool so neighbouring posts differ.
  let hash = 0x811c9dc5;

  for (let index = 0; index < seed.length; index += 1) {
    hash ^= seed.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }

  const image = FALLBACK_IMAGES[hash % FALLBACK_IMAGES.length] ?? FALLBACK_IMAGES[0];

  return { ...image, isFallback: true };
}

function toPostImage(raw: WPRawPost, title: string): PostImage {
  const media = raw.featuredImage?.node;
  const src = sanitizeImageUrl(media?.sourceUrl);

  if (!src) {
    return pickFallbackImage(raw.slug || title);
  }

  return {
    src,
    alt: media?.altText?.trim() || title,
    width: media?.mediaDetails?.width || 1600,
    height: media?.mediaDetails?.height || 1067,
    isFallback: false,
  };
}

function toPostCategory(raw: WPRawPost): PostCategory {
  const category = raw.categories?.nodes?.[0];
  const name = category?.name?.trim();

  if (!name) {
    return FALLBACK_CATEGORY;
  }

  return {
    id: typeof category?.databaseId === "number" ? category.databaseId : undefined,
    name,
    slug: category?.slug?.trim() || FALLBACK_CATEGORY.slug,
    count: typeof category?.count === "number" ? category.count : 0,
  };
}

/** Normalised tag list; empty when the CMS exposes no tags on the post. */
function toPostTags(raw: WPRawPost): PostCategory[] {
  const nodes = raw.tags?.nodes ?? [];
  const seen = new Set<string>();
  const tags: PostCategory[] = [];

  for (const node of nodes) {
    const name = node?.name?.trim();
    if (!name) continue;
    const slug =
      node?.slug?.trim() || name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    if (seen.has(slug)) continue;
    seen.add(slug);
    tags.push({
      id: typeof node?.databaseId === "number" ? node.databaseId : undefined,
      name,
      slug,
      count: typeof node?.count === "number" ? node.count : 0,
    });
  }

  return tags;
}

/** Premium = explicit `premium` tag (Phase 1 seeding contract). */
function toPostPremium(tags: PostCategory[]): boolean {
  return tags.some((tag) => tag.slug.toLowerCase() === PREMIUM_TAG_SLUG);
}

function formatPublishDate(value: string | null | undefined): string {
  const timestamp = Date.parse(value ?? "");

  return Number.isNaN(timestamp) ? "Date unavailable" : DATE_FORMATTER.format(timestamp);
}

/** URL-safe author identifier (WP nicename, falls back to a slugified display name). */
export function slugifyAuthorName(value: string): string {
  const fallback = (value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return fallback || "techpulse-editorial";
}

/** URL-safe author identifier (WP nicename, falls back to a slugified display name). */
function toAuthorSlug(rawName: string | null | undefined, rawSlug: string | null | undefined): string {
  const explicit = rawSlug?.trim().toLowerCase();
  if (explicit) return explicit;
  return slugifyAuthorName(rawName ?? "");
}

/** Normalises a raw WPGraphQL post into the UI-facing `Post` shape. */
function toPost(raw: WPRawPost): Post {
  const title = cleanText(raw.title) || "Untitled story";
  const excerpt = truncate(cleanText(raw.excerpt), 220);
  const slug = raw.slug?.trim() || `post-${raw.databaseId}`;
  const uri = raw.uri?.trim();
  const tags = toPostTags(raw);
  const authorName = cleanText(raw.author?.node?.name) || "TechPulse Editorial";

  return {
    id: raw.id || `post-${raw.databaseId}`,
    databaseId: raw.databaseId,
    slug,
    title,
    excerpt: excerpt || "Open the story to read the full report.",
    content: raw.content?.trim() ?? "",
    date: raw.date ?? "",
    publishedAt: formatPublishDate(raw.date),
    sourceUrl: uri
      ? new URL(uri, WORDPRESS_SITE_URL).toString()
      : `${WORDPRESS_SITE_URL}/?p=${raw.databaseId}`,
    author: authorName,
    authorSlug: toAuthorSlug(authorName, raw.author?.node?.slug),
    category: toPostCategory(raw),
    tags,
    isPremium: toPostPremium(tags),
    image: toPostImage(raw, title),
    readingTime: estimateReadingTime(raw.content, raw.excerpt, title),
    href: `/blog/${slug}`,
  };
}

/** Newest first, tolerating posts whose date could not be parsed. */
function byDateDescending(a: Post, b: Post): number {
  const aTime = Date.parse(a.date);
  const bTime = Date.parse(b.date);

  return (Number.isNaN(bTime) ? 0 : bTime) - (Number.isNaN(aTime) ? 0 : aTime);
}

/* ──────────────────────────────── transport ───────────────────────────────── */

/** WPGraphQL refuses unbounded connections; keep requests within a sane window. */
const MAX_POSTS_PER_REQUEST = 50;

/**
 * Normalises a UI locale (`fr` / `en` / `de`, case-insensitive) to the
 * `LanguageCodeEnum` value the WPML / Polylang GraphQL bridges declare (`FR` /
 * `EN` / `DE`). Returns `undefined` for empty / malformed input so callers can
 * simply drop the filter and keep the unfiltered query.
 */
export function normalizeLanguageCode(language?: string | null): string | undefined {
  const clean = language?.trim().toUpperCase();

  if (!clean) {
    return undefined;
  }

  // WPML / Polylang expect ISO 639-1 codes; accept `fr`, `FR`, `fr-FR` shapes.
  const base = clean.split(/[-_]/)[0];

  if (!/^[A-Z]{2,3}$/.test(base ?? "")) {
    return undefined;
  }

  return base;
}

/**
 * `true` when a GraphQL failure is the bridge-missing signature: the install
 * has no WPML / Polylang GraphQL extension, so `language` / `translation` /
 * `LanguageCodeEnum` are unknown to its schema. Callers retry the same request
 * without the language filter instead of surfacing an error.
 */
function isMissingLanguageBridgeError(error: string | null): boolean {
  if (!error) {
    return false;
  }

  return /languagecodeenum|unknown argument.*language|unknown field.*translation|translation\(/i.test(
    error
  );
}

type GraphQLResponse<TData> = {
  data?: TData | null;
  errors?: { message?: string | null }[];
};

type GraphQLResult<TData> = {
  data: TData | null;
  error: string | null;
};

function describeError(error: unknown): string {
  if (error instanceof Error) {
    return error.name === "TimeoutError"
      ? `request timed out after ${REQUEST_TIMEOUT_MS}ms`
      : error.message;
  }

  return "unknown error";
}

/**
 * Executes one WPGraphQL request against the Next.js data cache.
 * Never throws: transport, HTTP and GraphQL failures all resolve to `error`.
 */
async function fetchGraphQLOnce<TData>(
  query: string,
  variables: Record<string, unknown>
): Promise<GraphQLResult<TData>> {
  try {
    const response = await fetch(WORDPRESS_GRAPHQL_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ query, variables }),
      // Hourly ISR window, invalidatable through `revalidateTag(POSTS_CACHE_TAG)`.
      next: { revalidate: POSTS_REVALIDATE_SECONDS, tags: [POSTS_CACHE_TAG] },
      // A stalled CMS must never hold a render open.
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });

    if (!response.ok) {
      const reason = `HTTP ${response.status} ${response.statusText}`.trim();
      console.error(`[techpulse/wordpress] ${reason} from ${WORDPRESS_GRAPHQL_ENDPOINT}`);

      return { data: null, error: `WordPress responded with ${reason}.` };
    }

    const payload = (await response.json()) as GraphQLResponse<TData>;
    const messages = (payload.errors ?? [])
      .map((entry) => entry?.message?.trim())
      .filter((message): message is string => Boolean(message));

    if (messages.length > 0) {
      console.error(`[techpulse/wordpress] GraphQL errors: ${messages.join(" | ")}`);

      return { data: null, error: `WordPress GraphQL error: ${messages[0]}` };
    }

    if (!payload.data) {
      return { data: null, error: "WordPress returned an empty payload." };
    }

    return { data: payload.data, error: null };
  } catch (error) {
    const reason = describeError(error);
    console.error(`[techpulse/wordpress] request to ${WORDPRESS_GRAPHQL_ENDPOINT} failed: ${reason}`);

    return { data: null, error: `WordPress is unreachable (${reason}).` };
  }
}

/**
 * Same contract as `fetchGraphQLOnce`, with one quick retry so a transient
 * transport hiccup (Pantheon cold start, build-time burst) does not bake an
 * empty state into a statically rendered page. GraphQL-level errors are NOT
 * retried — they are deterministic responses, not transport failures.
 */
async function fetchGraphQL<TData>(
  query: string,
  variables: Record<string, unknown>
): Promise<GraphQLResult<TData>> {
  const first = await fetchGraphQLOnce<TData>(query, variables);

  const retryable =
    first.error !== null &&
    (first.error.startsWith("WordPress is unreachable") ||
      first.error.startsWith("WordPress responded with"));

  if (!retryable) {
    return first;
  }

  await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));

  return fetchGraphQLOnce<TData>(query, variables);
}

/* ────────────────────────────── public API ────────────────────────────────── */

/**
 * Fetches published posts, newest first.
 *
 * Pass `language` (a UI locale such as `fr` / `en` / `de`) to request the
 * translated version of each story through the WPML / Polylang GraphQL bridge
 * (`language: $language` where arg, normalised to `LanguageCodeEnum`). When
 * the install has no translation bridge, the language filter is retried away
 * automatically and the unfiltered feed is returned instead of an error.
 *
 * @example
 * const { posts, error } = await getPosts({ first: 6 });
 * const dev = await getPosts({ categoryName: "development" });
 * const ai = await getPosts({ search: "intelligence artificielle" });
 * const byAuthor = await getPosts({ authorName: "ada-lovelace" });
 * const inGerman = await getPosts({ first: 6, language: "de" });
 */
export async function getPosts(options: GetPostsOptions = {}): Promise<PostsResult> {
  const first = Math.min(
    Math.max(Math.trunc(options.first ?? HOME_PAGE_POST_COUNT), 1),
    MAX_POSTS_PER_REQUEST
  );
  const categoryName = options.categoryName?.trim() || undefined;
  const search = options.search?.trim() || undefined;
  const authorName = options.authorName?.trim() || undefined;
  const language = normalizeLanguageCode(options.language);
  const categoryId =
    typeof options.categoryId === "number" && Number.isFinite(options.categoryId)
      ? Math.trunc(options.categoryId)
      : undefined;

  const query = buildPostsQuery({ categoryId, categoryName, search, authorName, language });

  const variables: Record<string, unknown> = { first };

  if (typeof categoryId === "number") {
    variables.categoryId = categoryId;
  }

  if (categoryName) {
    variables.categoryName = categoryName;
  }

  if (search) {
    variables.search = search;
  }

  if (authorName) {
    variables.authorName = authorName;
  }

  if (language) {
    variables.language = language;
  }

  const { data, error } = await fetchGraphQL<{ posts: WPRawPosts | null }>(query, variables);

  if (error && language && isMissingLanguageBridgeError(error)) {
    // No WPML / Polylang bridge on this install: retry unfiltered so the
    // language-aware callers degrade to the default feed instead of an error.
    return getPosts({ ...options, language: undefined });
  }

  const connection = data?.posts;

  if (error || !connection) {
    return {
      posts: [],
      hasNextPage: false,
      endCursor: null,
      error: error ?? "WordPress returned no posts connection.",
    };
  }

  const posts = connection.nodes
    .filter((node): node is WPRawPost => Boolean(node?.slug))
    .map(toPost)
    .sort(byDateDescending);

  return {
    posts,
    hasNextPage: Boolean(connection.pageInfo?.hasNextPage),
    endCursor: connection.pageInfo?.endCursor ?? null,
    error: null,
  };
}

/**
 * Fetches a single post by slug.
 *
 * `post: null` with `error: null` means the slug genuinely does not exist (the
 * article route should render `notFound()`), while a non-null `error` means the
 * CMS could not be reached and the caller should degrade gracefully instead.
 * Pass `language` (a UI locale) to resolve the translated version through the
 * WPML / Polylang bridge (`translation(language: $language)`); installs
 * without the bridge fall back to the default-language post automatically.
 */
export async function getPostBySlug(slug: string, language?: string | null): Promise<PostResult> {
  const cleanSlug = slug?.trim();

  if (!cleanSlug) {
    return { post: null, error: null };
  }

  const normalizedLanguage = normalizeLanguageCode(language);
  const query = normalizedLanguage ? POST_BY_SLUG_TRANSLATED_QUERY : POST_BY_SLUG_QUERY;
  const variables: Record<string, unknown> = { slug: cleanSlug };

  if (normalizedLanguage) {
    variables.language = normalizedLanguage;
  }

  const { data, error } = await fetchGraphQL<{ post: (WPRawPost & { translation?: WPRawPost | null }) | null }>(query, variables);

  if (error && normalizedLanguage && isMissingLanguageBridgeError(error)) {
    // No translation bridge on this install: retry without the language filter.
    return getPostBySlug(cleanSlug);
  }

  if (error) {
    return { post: null, error };
  }

  const raw = data?.post?.translation?.slug ? data.post.translation : data?.post;

  if (!raw?.slug) {
    return { post: null, error: null };
  }

  return { post: toPost(raw), error: null };
}

/** Category index, ordered by post count. Returns an empty list on failure. */
export async function getCategories(): Promise<PostCategory[]> {
  const { data, error } = await fetchGraphQL<WPRawCategoriesData>(CATEGORIES_QUERY, {});

  if (error || !data?.categories?.nodes) {
    return [];
  }

  const bySlug = new Map<string, PostCategory>();

  for (const node of data.categories.nodes) {
    const name = node?.name?.trim();

    if (!name) {
      continue;
    }

    const slug = node?.slug?.trim() || name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

    if (!bySlug.has(slug)) {
      bySlug.set(slug, {
        id: typeof node?.databaseId === "number" ? node.databaseId : undefined,
        name,
        slug,
        count: typeof node?.count === "number" ? node.count : 0,
      });
    }
  }

  return [...bySlug.values()];
}

/**
 * Resolves an author profile by WP nicename/slug.
 *
 * `author: null` with `error: null` means the slug genuinely does not exist
 * (the author route should render `notFound()`), while a non-null `error`
 * means the CMS could not be reached. When the `user` query is unavailable
 * (restricted roles), the profile is rebuilt from the author's latest post.
 */
export async function getAuthorBySlug(slug: string): Promise<AuthorResult> {
  const cleanSlug = slug?.trim().toLowerCase();

  if (!cleanSlug) {
    return { author: null, error: null };
  }

  const { data, error } = await fetchGraphQL<{ user: WPRawAuthor | null }>(AUTHOR_BY_SLUG_QUERY, {
    slug: cleanSlug,
  });

  const raw = data?.user;

  if (raw?.name?.trim() || raw?.slug?.trim()) {
    const name = raw.name?.trim() || cleanSlug;
    return {
      author: {
        name,
        slug: raw.slug?.trim().toLowerCase() || slugifyAuthorName(name),
        bio: cleanText(raw.description),
        avatarUrl: sanitizeImageUrl(raw.avatar?.url),
      },
      error: null,
    };
  }

  // Fallback: derive the profile from the author's latest story. An authorName
  // filter failure degrades to a name-based scan of the newest posts so an
  // unknown nicename still resolves when WPGraphQL hides the user node.
  const direct = await getPosts({ first: MAX_POSTS_PER_REQUEST, authorName: cleanSlug });
  const scanned = direct.posts.length > 0 ? direct : await getPosts({ first: MAX_POSTS_PER_REQUEST });
  const match = scanned.posts.find(
    (post) => post.authorSlug.toLowerCase() === cleanSlug || slugifyAuthorName(post.author) === cleanSlug
  );

  if (match) {
    return {
      author: {
        name: match.author,
        slug: match.authorSlug.toLowerCase(),
        bio: "",
        avatarUrl: null,
      },
      error: null,
    };
  }

  if (error || direct.error) {
    // When the CMS itself is down the page shows a degraded notice; callers
    // check `error` first, so surface it even if the scan came back empty.
    if (error && !raw) {
      const probe = await getPosts({ first: 1 });
      if (probe.error) return { author: null, error };
    }
    if (direct.error && scanned === direct) return { author: null, error: direct.error };
  }

  return { author: null, error: null };
}

/**
 * Stories filed by one author, newest first. Tries the WPGraphQL `authorName`
 * filter, then falls back to a name-based scan of the newest posts so the
 * author page never renders empty when the filter is unavailable.
 */
export async function getPostsByAuthor(slug: string, first = MAX_POSTS_PER_REQUEST): Promise<PostsResult> {
  const cleanSlug = slug?.trim().toLowerCase();

  if (!cleanSlug) {
    return { posts: [], hasNextPage: false, endCursor: null, error: null };
  }

  const direct = await getPosts({ first, authorName: cleanSlug });
  if (direct.posts.length > 0 || direct.error) {
    return direct;
  }

  const fallback = await getPosts({ first: MAX_POSTS_PER_REQUEST });
  if (fallback.error) {
    return fallback;
  }

  const posts = fallback.posts
    .filter(
      (post) => post.authorSlug.toLowerCase() === cleanSlug || slugifyAuthorName(post.author) === cleanSlug
    )
    .slice(0, Math.min(Math.max(Math.trunc(first), 1), MAX_POSTS_PER_REQUEST));

  return { posts, hasNextPage: false, endCursor: null, error: null };
}

/**
 * Everything the magazine home page needs, resolved in a single request:
 * the lead story plus the staggered grid that follows it.
 */
export async function getHomePageData(): Promise<HomePageData> {
  const { posts, error } = await getPosts({ first: HOME_PAGE_POST_COUNT });

  if (posts.length === 0) {
    return { heroPost: null, latestPosts: [], total: 0, error };
  }

  const [heroPost, ...latestPosts] = posts;

  return { heroPost, latestPosts, total: posts.length, error: null };
}