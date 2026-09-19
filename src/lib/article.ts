/**
 * Article body helpers — `src/lib/article.ts`.
 *
 * Pure functions (no React, no data layer) that the article route uses to split
 * the WordPress body into a free preview and the rest, and to decide how much of
 * a Premium story a reader gets before the paywall. Kept free of HTML parsers on
 * purpose: WPGraphQL returns well-formed block markup where every paragraph is a
 * top-level `<p>` element that cannot be nested, so counting `</p>` markers is a
 * reliable, dependency-free way to cut the body.
 */

/** Free paragraphs shown when a Premium story is locked. */
export const GATED_INTRO_PARAGRAPHS = 1;

/** Intro paragraphs kept at the top of an unlocked story. */
export const INTRO_PARAGRAPHS = 2;

/**
 * Character ceiling for the locked preview.
 *
 * WordPress auto-excerpts mean plenty of stories are a *single* paragraph, and
 * for those "the first paragraph" would be the whole article — the gate would
 * then reveal everything. The preview is therefore also capped in characters,
 * trimmed at a word boundary and closed with an ellipsis.
 */
export const GATED_INTRO_MAX_CHARS = 700;

export type ArticleSplit = {
  /** Opening block(s) rendered for every reader (the free preview). */
  intro: string;
  /** Remainder of the body, rendered only when the story is unlocked. */
  body: string;
};

type SplitOptions = {
  /** How many top-level paragraphs belong to the intro (minimum 1). */
  paragraphCount: number;
  /** Character ceiling for the intro — `0` (default) disables the ceiling. */
  maxChars?: number;
};

/**
 * Splits the CMS body after the n-th top-level paragraph.
 *
 * - Fewer paragraphs than requested (or none at all) -> the whole body becomes
 *   the intro and `body` stays empty, so nothing is ever dropped silently.
 * - With `maxChars`, an oversized intro is reduced to plain text on a word
 *   boundary so a locked story can never leak in full.
 */
export function splitArticleContent(
  html: string,
  { paragraphCount, maxChars = 0 }: SplitOptions
): ArticleSplit {
  const content = html.trim();

  if (!content) {
    return { intro: "", body: "" };
  }

  const limit = Math.max(1, Math.floor(paragraphCount));
  const closingTags = [...content.matchAll(/<\/p\s*>/gi)];
  const marker = closingTags[limit - 1] ?? closingTags[closingTags.length - 1];
  const cut = marker ? (marker.index ?? 0) + marker[0].length : 0;
  const intro = cut > 0 ? content.slice(0, cut) : content;
  const body = cut > 0 ? content.slice(cut) : "";

  return { intro: capIntro(intro, maxChars), body };
}

/**
 * Tells whether the CMS excerpt adds information on top of the body.
 *
 * WPGraphQL hands back WordPress' auto-excerpt (the opening words of the post)
 * whenever the editors did not write one, so rendering both the standfirst and
 * the intro paragraphs would print the same sentence twice. The excerpt is only
 * kept when it is not a prefix of the body.
 */
export function hasDistinctExcerpt(excerpt: string, introHtml: string): boolean {
  const excerptText = normaliseText(excerpt);

  if (!excerptText) {
    return false;
  }

  const introText = normaliseText(introHtml);

  if (!introText) {
    return true;
  }

  return !introText.includes(excerptText.slice(0, 60));
}

/** Applies the character ceiling, rebuilding a single safe paragraph. */
function capIntro(intro: string, maxChars: number): string {
  if (maxChars <= 0 || intro.length <= maxChars) {
    return intro;
  }

  const text = decodeEntities(intro.replace(/<[^>]*>/g, " ")).replace(/\s+/g, " ").trim();
  const clipped = text.slice(0, maxChars);
  /*
   * Drop a trailing partial word — but only when the clip actually became the
   * whole text: for a single long word the boundary trim would erase it
   * entirely, so the clipped text is kept instead.
   */
  const trimmed = clipped.replace(/\s+\S*$/, "").trim();

  return `<p>${escapeHtml(trimmed || clipped)}…</p>`;
}

/** Strips tags, entities and punctuation so two blocks can be compared. */
function normaliseText(value: string): string {
  return decodeEntities(value.replace(/<[^>]*>/g, " "))
    .replace(/[^a-z0-9\u00c0-\u024f]+/gi, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

/** Resolves the handful of entities WordPress actually emits in prose. */
function decodeEntities(value: string): string {
  return value
    .replace(/&nbsp;/gi, " ")
    .replace(/&hellip;/gi, "…")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#0?39;|&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">");
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}