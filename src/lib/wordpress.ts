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

/** Reading speed (words per minute) used for the "x min read" badge. */
const WORDS_PER_MINUTE = 200;

/** Number of posts rendered on the magazine home page. */
export const HOME_PAGE_POST_COUNT = 9;

export type PostCategory = {
  name: string;
  slug: string;
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
  category: PostCategory;
  image: PostImage;
  /** Estimated reading time in minutes (minimum 1). */
  readingTime: number;
  /** Internal App Router path for the article page. */
  href: string;
};

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

export type GetPostsOptions = {
  /** Number of posts to request (defaults to the home page count). */
  first?: number;
  /** Optional WPGraphQL `categoryName` filter. */
  categoryName?: string;
};

/* ─────────────────────────── raw WPGraphQL shapes ─────────────────────────── */

type WPConnection<TNode> = { nodes: TNode[] } | null;

type WPRawMedia = {
  sourceUrl: string | null;
  altText: string | null;
  mediaDetails: { width: number | null; height: number | null } | null;
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
  author: { node: { name: string | null } | null } | null;
  categories: WPConnection<{ name: string | null; slug: string | null }>;
  featuredImage: { node: WPRawMedia | null } | null;
};

type WPRawPosts = {
  pageInfo: { hasNextPage: boolean; endCursor: string | null };
  nodes: WPRawPost[];
};

type WPRawCategoriesData = {
  categories: WPConnection<{ name: string | null; slug: string | null }>;
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
  author { node { name } }
  categories(first: 1) { nodes { name slug } }
  featuredImage {
    node {
      sourceUrl
      altText
      mediaDetails { width height }
    }
  }
`;

const POSTS_QUERY = `
  query LatestPosts($first: Int!) {
    posts(
      first: $first
      where: { status: PUBLISH, orderby: { field: DATE, order: DESC } }
    ) {
      pageInfo { hasNextPage endCursor }
      nodes { ${POST_FIELDS} }
    }
  }
`;

const POSTS_BY_CATEGORY_QUERY = `
  query PostsByCategory($first: Int!, $categoryName: String!) {
    posts(
      first: $first
      where: {
        status: PUBLISH
        orderby: { field: DATE, order: DESC }
        categoryName: $categoryName
      }
    ) {
      pageInfo { hasNextPage endCursor }
      nodes { ${POST_FIELDS} }
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

const CATEGORIES_QUERY = `
  query PostCategories {
    categories(first: 50, where: { orderby: COUNT, order: DESC }) {
      nodes { name slug }
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

const FALLBACK_CATEGORY: PostCategory = { name: "Technology", slug: "technology" };

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
  const src = media?.sourceUrl?.trim();

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

  return { name, slug: category?.slug?.trim() || FALLBACK_CATEGORY.slug };
}

function formatPublishDate(value: string | null | undefined): string {
  const timestamp = Date.parse(value ?? "");

  return Number.isNaN(timestamp) ? "Date unavailable" : DATE_FORMATTER.format(timestamp);
}

/** Normalises a raw WPGraphQL post into the UI-facing `Post` shape. */
function toPost(raw: WPRawPost): Post {
  const title = cleanText(raw.title) || "Untitled story";
  const excerpt = truncate(cleanText(raw.excerpt), 220);
  const slug = raw.slug?.trim() || `post-${raw.databaseId}`;
  const uri = raw.uri?.trim();

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
    author: cleanText(raw.author?.node?.name) || "TechPulse Editorial",
    category: toPostCategory(raw),
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
 * Executes a WPGraphQL request against the Next.js data cache.
 * Never throws: transport, HTTP and GraphQL failures all resolve to `error`.
 */
async function fetchGraphQL<TData>(
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

/* ────────────────────────────── public API ────────────────────────────────── */

/**
 * Fetches published posts, newest first.
 *
 * @example
 * const { posts, error } = await getPosts({ first: 6 });
 * const dev = await getPosts({ categoryName: "development" });
 */
export async function getPosts(options: GetPostsOptions = {}): Promise<PostsResult> {
  const first = Math.min(
    Math.max(Math.trunc(options.first ?? HOME_PAGE_POST_COUNT), 1),
    MAX_POSTS_PER_REQUEST
  );
  const categoryName = options.categoryName?.trim();

  const { data, error } = await fetchGraphQL<{ posts: WPRawPosts | null }>(
    categoryName ? POSTS_BY_CATEGORY_QUERY : POSTS_QUERY,
    categoryName ? { first, categoryName } : { first }
  );

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
 */
export async function getPostBySlug(slug: string): Promise<PostResult> {
  const cleanSlug = slug?.trim();

  if (!cleanSlug) {
    return { post: null, error: null };
  }

  const { data, error } = await fetchGraphQL<{ post: WPRawPost | null }>(
    POST_BY_SLUG_QUERY,
    { slug: cleanSlug }
  );

  if (error) {
    return { post: null, error };
  }

  const raw = data?.post;

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
      bySlug.set(slug, { name, slug });
    }
  }

  return [...bySlug.values()];
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