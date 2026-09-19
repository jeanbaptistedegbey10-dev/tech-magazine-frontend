"use client";

import { useSearchParams } from "next/navigation";
import { CheckCircle2 } from "lucide-react";

import { useTranslation } from "@/lib/i18n";

/**
 * Dashboard success banner shown when a mocked Premium checkout succeeds.
 *
 * Triggers (either one is enough):
 * - the reader landed on `/dashboard?success=true` (read via
 *   `useSearchParams`), or
 * - the server passed `hasCookie = true` because the
 *   `techpulse_premium_success` cookie is set (persists briefly across a
 *   refresh so the demo banner survives a reload).
 *
 * The banner can be dismissed client-side (clears the non-httpOnly success
 * cookie and flips local state so it does not reappear).
 */
export function PremiumSuccessBanner({ hasCookie }: { hasCookie: boolean }) {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const urlSuccess = searchParams.get("success") === "true";
  const show = hasCookie || urlSuccess;

  if (!show) return null;

  function dismiss() {
    // Clear the non-httpOnly success cookie so the banner does not reappear
    // on a later refresh within its TTL.
    document.cookie =
      "techpulse_premium_success=; Max-Age=0; Path=/; SameSite=Lax";
  }

  return (
    <div
      role="region"
      aria-live="polite"
      className="mx-auto max-w-2xl rounded-2xl border border-emerald-500/40 bg-emerald-500/10 px-6 py-5 text-center shadow-lg shadow-emerald-500/10"
    >
      <div className="flex items-center gap-3">
        <CheckCircle2 className="size-5 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
        <div className="text-left">
          <p className="text-base font-semibold tracking-tight text-emerald-700 dark:text-emerald-200">
            {t("auth.dashboard.successBanner")}
          </p>
        </div>
        <button
          type="button"
          onClick={dismiss}
          className="shrink-0 rounded-full p-1 text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          aria-label={t("header.close")}
        >
          <svg
            viewBox="0 0 24 24"
            className="size-4"
            aria-hidden="true"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
