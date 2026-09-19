"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, X, Zap } from "lucide-react";

import { LanguageSelector } from "@/components/blog/language-selector";
import { PRIMARY_NAV, resolveActiveNavHref } from "@/components/blog/navigation";
import { ThemeToggle } from "@/components/blog/theme-toggle";
import { useTranslation } from "@/lib/i18n";

type MobileMenuProps = {
  /** Closes the drawer (open state lives in the masthead). */
  onClose: () => void;
};

/**
 * Full-screen navigation drawer for mobile and tablet —
 * `src/components/blog/mobile-menu.tsx`.
 *
 * Opened by the hamburger button of the masthead (trigger is `lg:hidden`, and
 * the masthead additionally dismisses this drawer through a `matchMedia`
 * listener, so it can never linger above the desktop layout). It gathers
 * everything the desktop rail holds: the translated primary navigation, the
 * i18n language switcher, the "S'abonner à Premium" CTA and the
 * Connexion / Inscription links.
 *
 * Dialog semantics mirror `search-dialog.tsx`: `role="dialog"` +
 * `aria-modal`, backdrop click and Escape close, body scroll lock, focus
 * moved to the close button on mount, `animate-in slide-in-from-right`
 * entrance, and every link closes the drawer on click.
 */
export function MobileMenu({ onClose }: MobileMenuProps) {
  const { t } = useTranslation();
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();
  const activeHref = resolveActiveNavHref(pathname);

  useEffect(() => {
    closeButtonRef.current?.focus();
  }, []);

  return (
    <div
      id="mobile-menu"
      role="dialog"
      aria-modal="true"
      aria-label={t("header.menu")}
      className="fixed inset-0 z-50 lg:hidden"
    >
      {/* Backdrop — a plain button so a click outside also closes the drawer. */}
      <button
        type="button"
        onClick={onClose}
        aria-label={t("header.close")}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />

      <div className="absolute inset-y-0 right-0 flex w-full max-w-sm flex-col overflow-y-auto border-l border-border bg-background shadow-2xl shadow-black/40 animate-in slide-in-from-right duration-300">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <span className="flex items-center gap-2.5">
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-lg shadow-primary/30">
              <Zap className="size-3.5" aria-hidden="true" />
            </span>
            <span className="text-sm font-semibold tracking-tight text-foreground">
              {t("header.brand")}
            </span>
          </span>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label={t("header.close")}
            className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-surface hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>

        <nav aria-label="Primary" className="flex flex-col gap-1 border-b border-border px-3 py-4">
          {PRIMARY_NAV.map((entry) => {
            const isActive = entry.href === activeHref;
            return (
              <Link
                key={entry.href}
                href={entry.href}
                onClick={onClose}
                aria-current={isActive ? "page" : undefined}
                className={
                  isActive
                    ? "group flex items-center justify-between gap-3 rounded-xl bg-accent px-3 py-3 text-base font-semibold text-link transition-colors duration-300 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                    : "group flex items-center justify-between gap-3 rounded-xl px-3 py-3 text-base font-medium text-foreground transition-colors duration-300 hover:bg-surface focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                }
              >
                {t(entry.labelKey)}
                <ArrowRight
                  className={
                    isActive
                      ? "size-4 text-link"
                      : "size-4 text-muted-foreground transition-colors duration-300 group-hover:text-link"
                  }
                  aria-hidden="true"
                />
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
          <span className="text-sm text-muted-foreground">{t("header.language")}</span>
          <LanguageSelector />
        </div>

        {/* Parity with the desktop rail: the theme switch is reachable on phones too. */}
        <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
          <span className="text-sm text-muted-foreground">{t("header.themeLight")}</span>
          <ThemeToggle />
        </div>

        <div className="mt-auto flex flex-col gap-3 px-5 py-6">
          <Link
            href="/subscribe"
            onClick={onClose}
            className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/30 transition-colors duration-300 hover:bg-primary/85 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none"
          >
            {t("subscribe.ctaPremium")}
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              onClick={onClose}
              className="flex flex-1 items-center justify-center rounded-full border border-border px-4 py-2.5 text-sm font-medium text-foreground transition-colors duration-300 hover:border-primary/60 hover:text-link focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
              {t("auth.login")}
            </Link>
            <Link
              href="/register"
              onClick={onClose}
              className="flex flex-1 items-center justify-center rounded-full border border-border px-4 py-2.5 text-sm font-medium text-foreground transition-colors duration-300 hover:border-primary/60 hover:text-link focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
              {t("auth.register")}
            </Link>
          </div>
          <Link
            href="/admin/dashboard"
            onClick={onClose}
            className="inline-flex items-center justify-center text-xs text-muted-foreground transition-colors hover:text-link focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            Espace Admin (démo)
          </Link>
        </div>
      </div>
    </div>
  );
}