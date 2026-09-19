"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Link2, MessageCircle, Share2 } from "lucide-react";

import { useTranslation } from "@/lib/i18n";

export type ShareButtonsProps = {
  /** Story title — feeds the X and WhatsApp share texts. */
  title: string;
  /** Internal article path (e.g. `/blog/mon-article`), resolved to absolute. */
  path: string;
  /** Optional extra classes for the wrapping element. */
  className?: string;
};

const COPIED_RESET_MS = 2000;

/**
 * Social sharing row — `src/components/blog/share-buttons.tsx`.
 *
 * Client component: copy-to-clipboard (Clipboard API with a textarea
 * fallback) plus X/Twitter, LinkedIn and WhatsApp share intents. The shared
 * URL is resolved from `window.location.href` after mount, so previews,
 * canonical links and copied URLs always match the page being read.
 * (`lucide-react` no longer ships brand glyphs, so X and LinkedIn render as
 * bold wordmarks in the same pill recipe as the icon buttons.)
 */
export function ShareButtons({ title, path, className }: ShareButtonsProps) {
  const { t } = useTranslation();
  const [pageUrl, setPageUrl] = useState(path);
  const [copied, setCopied] = useState(false);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setPageUrl(window.location.href);

    return () => {
      if (resetTimer.current) {
        clearTimeout(resetTimer.current);
      }
    };
  }, [path]);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(pageUrl);
    } catch {
      const fallback = document.createElement("textarea");
      fallback.value = pageUrl;
      fallback.setAttribute("readonly", "");
      fallback.style.position = "fixed";
      fallback.style.opacity = "0";
      document.body.appendChild(fallback);
      fallback.select();

      try {
        document.execCommand("copy");
      } catch {
        /* The confirmation simply never shows; the link stays selectable. */
      }

      document.body.removeChild(fallback);
    }

    setCopied(true);

    if (resetTimer.current) {
      clearTimeout(resetTimer.current);
    }

    resetTimer.current = setTimeout(() => setCopied(false), COPIED_RESET_MS);
  }

  const encodedUrl = encodeURIComponent(pageUrl);
  const encodedTitle = encodeURIComponent(title);

  const channels = [
    {
      label: t("blog.article.shareOnX"),
      shortLabel: "X",
      href: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
      wordmark: "X",
    },
    {
      label: t("blog.article.shareOnLinkedIn"),
      shortLabel: "LinkedIn",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      wordmark: "in",
    },
    {
      label: t("blog.article.shareOnWhatsApp"),
      shortLabel: "WhatsApp",
      href: `https://wa.me/?text=${encodeURIComponent(`${title} — ${pageUrl}`)}`,
      icon: <MessageCircle className="size-4" aria-hidden="true" />,
    },
  ];

  return (
    <div
      className={`flex flex-wrap items-center gap-2.5 ${className || ""}`}
      role="group"
      aria-label={t("blog.article.shareLabel")}
    >
      <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
        <Share2 className="size-3.5" aria-hidden="true" />
        {t("blog.article.shareLabel")}
      </span>

      <button
        type="button"
        onClick={handleCopy}
        aria-live="polite"
        className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors duration-300 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none ${
          copied
            ? "border-primary/60 bg-primary/15 text-link"
            : "border-border text-foreground hover:border-primary/60 hover:text-link"
        }`}
      >
        {copied ? (
          <>
            <Check className="size-4" aria-hidden="true" />
            {t("blog.article.linkCopied")}
          </>
        ) : (
          <>
            <Link2 className="size-4" aria-hidden="true" />
            {t("blog.article.copyLink")}
          </>
        )}
      </button>

      {channels.map((channel) => (
        <a
          key={channel.label}
          href={channel.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={channel.label}
          title={channel.label}
          className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors duration-300 hover:border-primary/60 hover:text-link focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          {channel.icon ?? (
            <span aria-hidden="true" className="text-sm leading-none font-black tracking-tight">
              {channel.wordmark}
            </span>
          )}
          {channel.shortLabel}
        </a>
      ))}
    </div>
  );
}
