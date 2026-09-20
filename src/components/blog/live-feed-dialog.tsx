"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AlertCircle, Loader2, RefreshCw, X } from "lucide-react";

import { useTranslation } from "@/lib/i18n";

/**
 * Live feed modal — the functional "Flux en direct" trigger of the masthead.
 *
 * Replaces the former decorative pill: the trigger is now a real button that
 * opens a dialog listing the latest stories of the newsroom, fetched from
 * `GET /api/live-feed` (the same light payload shape as `/api/search`, with
 * the ISO `date` added so stamps can be relative — "il y a 3 jours").
 *
 * Dialog semantics mirror `search-dialog.tsx`: `role="dialog"` + `aria-modal`,
 * Escape / backdrop click close, body scroll lock, focus moved to the close
 * button on mount, a refresh action re-running the fetch, and every result
 * link closing the dialog. The trigger stays a desktop-only rail item
 * (`xl:inline-flex`): mounting a dialog inside the `MobileMenu` drawer would
 * unmount an open overlay when the drawer closes (same documented constraint
 * as the search trigger).
 */

type LiveFeedItem = {
  id: string;
  href: string;
  title: string;
  excerpt: string;
  /** ISO 8601 timestamp from the CMS — feeds the relative-time stamp. */
  date: string;
  /** Pre-formatted fallback label when the ISO date cannot be parsed. */
  publishedAt: string;
  readingTime: number;
  category: { name: string; slug: string };
};

type LiveFeedResponse = {
  posts: LiveFeedItem[];
  error: string | null;
};

/** Stories pulled per open — enough to feel live without a heavy payload. */
const FEED_LIMIT = 10;

/** Coarse subdivisions consumed by the relative-time formatter, largest last. */
const RELATIVE_DIVISIONS: { amount: number; unit: Intl.RelativeTimeFormatUnit }[] = [
  { amount: 60, unit: "second" },
  { amount: 60, unit: "minute" },
  { amount: 24, unit: "hour" },
  { amount: 7, unit: "day" },
  { amount: 4.34524, unit: "week" },
  { amount: 12, unit: "month" },
  { amount: Number.POSITIVE_INFINITY, unit: "year" },
];

/**
 * "il y a 3 jours"-style stamp from the CMS ISO date, localised through
 * `Intl.RelativeTimeFormat` with the reader's UI locale. Only ever rendered
 * after a user interaction (the dialog never renders on the server), so the
 * `Date.now()` read can never cause a hydration mismatch.
 */
function formatRelativeTime(isoDate: string, locale: string): string | null {
  const timestamp = Date.parse(isoDate);
  if (!Number.isFinite(timestamp)) {
    return null;
  }

  let duration = (timestamp - Date.now()) / 1000;
  const formatter = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });

  for (const division of RELATIVE_DIVISIONS) {
    if (Math.abs(duration) < division.amount) {
      return formatter.format(Math.round(duration), division.unit);
    }
    duration /= division.amount;
  }

  return null;
}

export function LiveFeedDialog() {
  const { t, locale } = useTranslation();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<LiveFeedItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  /** Bumped by the refresh button to re-run the fetch effect. */
  const [reloadToken, setReloadToken] = useState(0);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Dialog semantics: body scroll lock while open, focus moved to the close
  // button on mount.
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      closeButtonRef.current?.focus();
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleKeydown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handleKeydown);
    return () => document.removeEventListener("keydown", handleKeydown);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  // The pending states are set by the *event handlers* that open the dialog
  // or trigger a refresh (never synchronously inside this effect body — the
  // `react-hooks/set-state-in-effect` rule). This effect only fetches and
  // resolves; its AbortController cancels a request whose dialog closed
  // mid-flight.
  useEffect(() => {
    if (!open) return;
    let active = true;
    const controller = new AbortController();

    fetch(`/api/live-feed?limit=${FEED_LIMIT}`, { signal: controller.signal })
      .then((response) =>
        response.ok ? response.json() : Promise.reject(new Error("bad status"))
      )
      .then((data: LiveFeedResponse) => {
        if (!active) return;
        setItems(Array.isArray(data.posts) ? data.posts : []);
        setError(data.error ?? null);
      })
      .catch(() => {
        if (!active || controller.signal.aborted) return;
        setItems([]);
        setError(t("header.feedError"));
      })
      .finally(() => {
        if (!active || controller.signal.aborted) return;
        setLoading(false);
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [open, reloadToken, t]);

  /**
   * Opening the dialog and refreshing both arm the pending state before the
   * fetch effect runs — event handlers, so a synchronous `setState` is the
   * sanctioned pattern here.
   */
  const openFeed = () => {
    setLoading(true);
    setError(null);
    setOpen(true);
  };

  const refreshFeed = () => {
    setLoading(true);
    setError(null);
    setReloadToken((token) => token + 1);
  };

  const close = () => setOpen(false);

  return (
    <>
      <button
        type="button"
        onClick={openFeed}
        aria-haspopup="dialog"
        aria-expanded={open}
        className="hidden items-center gap-2 rounded-full border border-border px-3 py-1 text-xs text-muted-foreground transition-colors duration-300 hover:border-primary/50 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none xl:inline-flex"
      >
        <span className="relative flex size-1.5" aria-hidden="true">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />
          <span className="relative inline-flex size-1.5 rounded-full bg-primary" />
        </span>
        {t("nav.liveFeed")}
      </button>

      {open ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={t("nav.liveFeed")}
          className="fixed inset-0 z-50 flex min-h-screen items-end justify-center bg-black/60 p-4 backdrop-blur-sm sm:items-center"
        >
          <div
            ref={panelRef}
            className="w-full max-w-xl animate-in slide-in-from-bottom duration-300 overflow-hidden rounded-2xl border border-border bg-card shadow-2xl shadow-black/40"
          >
            <div className="flex items-center gap-3 border-b border-border p-4">
              <span className="relative flex size-2.5 shrink-0" aria-hidden="true">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />
                <span className="relative inline-flex size-2.5 rounded-full bg-primary" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold tracking-tight text-foreground">
                  {t("nav.liveFeed")}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t("header.feedSubtitle")}
                </p>
              </div>
              <button
                type="button"
                onClick={refreshFeed}
                disabled={loading}
                title={t("header.feedRefresh")}
                aria-label={t("header.feedRefresh")}
                className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-surface hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none disabled:opacity-50"
              >
                <RefreshCw
                  className={loading ? "size-4 animate-spin" : "size-4"}
                  aria-hidden="true"
                />
              </button>
              <button
                ref={closeButtonRef}
                type="button"
                onClick={close}
                aria-label={t("header.close")}
                className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-surface hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              >
                <X className="size-5" aria-hidden="true" />
              </button>
            </div>

            <div className="max-h-[55vh] overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center gap-2 p-8 text-sm text-muted-foreground">
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  {t("header.feedLoading")}
                </div>
              ) : error && items.length === 0 ? (
                <div className="flex items-start gap-3 p-8 text-sm">
                  <AlertCircle className="mt-0.5 size-4 text-destructive" aria-hidden="true" />
                  <span className="text-muted-foreground">{error}</span>
                </div>
              ) : items.length === 0 ? (
                <p className="p-8 text-sm text-muted-foreground">
                  {t("header.feedEmpty")}
                </p>
              ) : (
                <ul className="divide-y divide-border">
                  {items.map((item) => {
                    const stamp =
                      formatRelativeTime(item.date, locale) ?? item.publishedAt;
                    return (
                      <li key={item.id}>
                        <Link
                          href={item.href}
                          onClick={close}
                          className="block px-5 py-4 transition-colors hover:bg-surface focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring focus-visible:outline-none"
                        >
                          <span className="flex items-center justify-between gap-3">
                            <span className="truncate text-xs font-semibold tracking-[0.14em] text-primary uppercase">
                              {item.category.name}
                            </span>
                            <span className="shrink-0 text-xs text-muted-foreground">
                              {stamp}
                            </span>
                          </span>
                          <span className="mt-1.5 line-clamp-2 block font-semibold text-foreground">
                            {item.title}
                          </span>
                          <span className="mt-1 line-clamp-2 block text-xs leading-relaxed text-muted-foreground">
                            {item.excerpt} ·{" "}
                            {t("common.minutesRead", { count: item.readingTime })}
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            <div className="flex items-center justify-between gap-3 border-t border-border px-5 py-3">
              <span className="text-xs text-muted-foreground">
                {t("header.escapeToClose")}
              </span>
              <Link
                href="/blog"
                onClick={close}
                className="text-xs font-semibold text-link transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              >
                {t("common.allStories")}
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
