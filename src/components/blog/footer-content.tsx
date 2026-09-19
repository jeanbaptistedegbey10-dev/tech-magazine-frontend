"use client";

import Link from "next/link";
import { Rss } from "lucide-react";

import { PRIMARY_NAV } from "@/components/blog/navigation";
import { useTranslation } from "@/lib/i18n";

/**
 * Whole footer body except the CMS endpoint, which stays a server-provided
 * prop so this client module never imports the WordPress data layer.
 */
export function SiteFooterContent({ endpoint }: { endpoint: string }) {
  const { t } = useTranslation();

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-semibold tracking-tight text-foreground">
          {t("header.brand")}{" "}
          <span className="font-normal text-muted-foreground">{t("header.tagline")}</span>
        </p>

        <nav aria-label="Footer" className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
          {PRIMARY_NAV.map((entry) => (
            <Link
              key={entry.href}
              href={entry.href}
              className="text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
              {t(entry.labelKey)}
            </Link>
          ))}
        </nav>
      </div>

      <div className="flex flex-col gap-3 border-t border-border pt-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p>&copy; {new Date().getFullYear()} TechPulse Magazine &mdash; {t("footer.rights")}</p>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <Link
            href="/privacy"
            className="transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            {t("privacy.title")}
          </Link>
          <p className="inline-flex items-center gap-2 break-all">
            <Rss className="size-3.5 shrink-0" aria-hidden="true" />
            {endpoint.replace(/^https?:\/\//, "")}
          </p>
        </div>
      </div>
    </>
  );
}