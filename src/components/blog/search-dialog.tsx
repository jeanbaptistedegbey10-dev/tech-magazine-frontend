"use client";

import { useEffect, useRef, useState } from "react";
import { Search, X, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useTranslation } from "@/lib/i18n";

type SearchResult = {
  id: string;
  href: string;
  title: string;
  excerpt: string;
  publishedAt: string;
  readingTime: number;
  category: { name: string; slug: string };
};

type SearchResponse = {
  posts: SearchResult[];
  error: string | null;
};

const DEBOUNCE_MS = 300;
const MIN_QUERY_LENGTH = 2;
const MAX_RESULTS = 8;

export function SearchDialog() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if (e.key === "/" && e.target instanceof HTMLElement && e.target.tagName !== "INPUT") {
        e.preventDefault();
        setOpen(true);
      }
    };
    document.addEventListener("keydown", handleKeydown);
    return () => document.removeEventListener("keydown", handleKeydown);
  }, []);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      inputRef.current?.focus();
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
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
      if (dialogRef.current && !dialogRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < MIN_QUERY_LENGTH) {
      setResults([]);
      setError(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const params = new URLSearchParams({ q: trimmed, limit: String(MAX_RESULTS) });
        const res = await fetch(`/api/search?${params}`, { signal: controller.signal });
        const data: SearchResponse = await res.json();
        if (data.posts) {
          setResults(data.posts);
          setError(data.error);
        } else {
          setResults([]);
        }
      } catch {
        if (!controller.signal.aborted) {
          setResults([]);
          setError(degraded);
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, DEBOUNCE_MS);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query, t]);

  const handleResultClick = () => {
    setOpen(false);
    setQuery("");
    setResults([]);
  };

  const placeholder = t("header.searchPlaceholder");
  const hint = t("header.searchHint");
  const loadingLabel = t("header.searchLoading");
  const empty = t("header.searchEmpty");
  const degraded = t("header.searchError");

  return (

    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={t("header.search") || "Search"}
        className="inline-flex items-center justify-center rounded-lg p-2 text-muted-foreground transition-colors duration-300 hover:bg-surface hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
      >
        <Search className="size-4" aria-hidden="true" />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex min-h-screen items-end justify-center bg-black/60 p-4 backdrop-blur-sm"
          aria-modal="true"
          role="dialog"
        >
          <div
            ref={dialogRef}
            className="w-full max-w-2xl animate-in slide-in-from-bottom duration-300"
          >
            <div className="relative flex items-center gap-2 rounded-2xl border border-border bg-card p-4 shadow-2xl shadow-black/40">
              <Search className="size-5 text-muted-foreground" aria-hidden="true" />
              <input
                ref={inputRef}
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={placeholder}
                className="flex-1 border-0 bg-transparent text-foreground placeholder:text-muted-foreground/60 outline-none"
                aria-label={placeholder}
              />
              {loading && <Loader2 className="size-4 animate-spin text-muted-foreground" />}
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label={t("header.close")}
                className="rounded-lg p-1 text-muted-foreground hover:bg-surface focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="mt-2 max-h-[50vh] overflow-y-auto rounded-2xl border border-border bg-card">
              {query.trim().length === 0 ? (
                <p className="p-6 text-sm text-muted-foreground">{hint}</p>
              ) : loading ? (
                <div className="flex items-center justify-center gap-2 p-6 text-sm text-muted-foreground">
                  <Loader2 className="size-4 animate-spin" />
                  {loadingLabel}
                </div>
              ) : error ? (
                <div className="flex items-start gap-3 p-6 text-sm">
                  <AlertCircle className="mt-0.5 size-4 text-destructive" />
                  <span className="text-muted-foreground">{error}</span>
                </div>
              ) : results.length === 0 ? (
                <p className="p-6 text-sm text-muted-foreground">{empty}</p>
              ) : (
                <ul className="py-2">
                  {results.map((result) => (
                    <li key={result.id}>
                      <Link
                        href={result.href}
                        onClick={handleResultClick}
                        className="block p-4 text-sm transition-colors hover:bg-surface focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                      >
                        <span className="text-xs font-semibold tracking-[0.14em] text-primary uppercase">
                          {result.category.name}
                        </span>
                        <p className="mt-1 font-semibold text-foreground">{result.title}</p>
                        <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                          {result.excerpt}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {result.publishedAt} · {result.readingTime} min read
                        </p>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
