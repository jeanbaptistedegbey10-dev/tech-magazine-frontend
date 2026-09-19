"use client";

import { useTranslation } from "@/lib/i18n";

/**
 * Inline translation helper — `src/components/blog/t.tsx`.
 *
 * Lets a *server* component render a translated string without being converted
 * to a client component itself: only this tiny leaf crosses the boundary.
 *
 * ```tsx
 * <T k="blog.article.backLink" />
 * <T k="common.minutesRead" params={{ count: post.readingTime }} />
 * ```
 */
export function T({
  k,
  params,
}: {
  k: string;
  params?: Record<string, string | number>;
}) {
  const { t } = useTranslation();

  return <>{t(k, params)}</>;
}