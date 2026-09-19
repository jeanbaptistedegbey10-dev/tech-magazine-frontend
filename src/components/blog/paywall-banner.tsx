"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, Lock } from "lucide-react";

import { useTranslation } from "@/lib/i18n";

/**
 * Paywall banner — `src/components/blog/paywall-banner.tsx`.
 *
 * Elegant Freemium gate rendered under a truncated article body. Client
 * component so the message, the three benefits and both CTAs follow the
 * reader's language (`paywall.*` in `src/lib/i18n/locales/*.json`).
 */
export function PaywallBanner() {
  const { t, tList } = useTranslation();
  const benefits = tList("paywall.benefits");

  return (
    <aside
      aria-labelledby="paywall-heading"
      className="relative overflow-hidden rounded-3xl border border-primary/30 bg-card px-6 py-10 text-center shadow-2xl shadow-primary/10 sm:px-12"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary via-[#818cf8] to-primary"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-20 left-1/2 h-44 w-[28rem] -translate-x-1/2 rounded-full bg-primary/20 blur-3xl"
      />

      <span className="relative mx-auto flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/40">
        <Lock className="size-5" aria-hidden="true" />
      </span>

      <h2
        id="paywall-heading"
        className="relative mx-auto mt-5 max-w-xl text-2xl font-semibold tracking-tight text-balance text-foreground sm:text-3xl"
      >
        {t("paywall.heading")}
      </h2>

      <p className="relative mx-auto mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
        {t("paywall.body")}
      </p>

      <ul className="relative mx-auto mt-5 flex max-w-md flex-col gap-2 text-left text-sm text-muted-foreground">
        {benefits.map((benefit) => (
          <li key={benefit} className="flex items-start gap-2.5">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
            <span>{benefit}</span>
          </li>
        ))}
      </ul>

      <div className="relative mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Link
          href="/subscribe"
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors duration-300 hover:bg-primary/85 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none sm:w-auto"
        >
          {t("paywall.ctaSubscribe")}
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
        <Link
          href="/login"
          className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-border px-6 py-3 text-sm font-medium text-foreground transition-colors duration-300 hover:border-primary/60 hover:text-link focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none sm:w-auto"
        >
          {t("paywall.ctaLogin")}
        </Link>
      </div>

      <p className="relative mt-4 text-xs text-muted-foreground">{t("paywall.footnote")}</p>
    </aside>
  );
}
