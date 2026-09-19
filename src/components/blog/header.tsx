"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Zap } from "lucide-react";

import { SearchDialog } from "@/components/blog/search-dialog";
import { LanguageSelector } from "@/components/blog/language-selector";
import { MobileMenu } from "@/components/blog/mobile-menu";
import { PRIMARY_NAV, resolveActiveNavHref } from "@/components/blog/navigation";
import { ThemeToggle } from "@/components/blog/theme-toggle";
import { UserMenu } from "@/components/blog/user-menu";
import { useTranslation } from "@/lib/i18n";

/**
 * Sticky magazine masthead: brand mark, primary navigation, live-search
 * trigger, reader account actions and the language switcher.
 *
 * Client component: every label comes from the i18n dictionary, so the header
 * must re-render when the reader switches locale. It carries no server-only
 * imports and uses the same container (`max-w-[1600px]`) as `<main>` and the
 * footer, so every edge stays aligned on ultrawide monitors.
 *
 * Mobile and tablet (below `lg`): the inline nav, account actions and language
 * switcher collapse into a hamburger button (`lg:hidden`) that opens the
 * full-screen `MobileMenu` drawer. The drawer mounts as a sibling of
 * `<header>` on purpose — the header's `backdrop-blur-md` creates a containing
 * block, so a `fixed` child rendered inside it would be trapped within the
 * masthead box instead of covering the viewport.
 */
export function SiteHeader() {
  const { t } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  // Longest matching nav href wins, so a desk page highlights the desk link
  // only — never `/blog` and the desk at the same time.
  const activeHref = resolveActiveNavHref(pathname);

  // Drawer dialog semantics, mirroring `search-dialog.tsx`: body scroll lock
  // while open, Escape closes, and growing past `lg` dismisses it so it can
  // never linger above the desktop masthead.
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) return;
    const handleKeydown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", handleKeydown);
    return () => document.removeEventListener("keydown", handleKeydown);
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) return;
    const desktop = window.matchMedia("(min-width: 1024px)");
    const handleChange = (event: MediaQueryListEvent) => {
      if (event.matches) setMenuOpen(false);
    };
    desktop.addEventListener("change", handleChange);
    return () => desktop.removeEventListener("change", handleChange);
  }, [menuOpen]);

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-[1600px] flex-wrap items-center justify-between gap-x-6 gap-y-3 px-4 py-4 sm:px-8 lg:px-16">
          <Link
            href="/"
            className="inline-flex items-center gap-3 rounded-xl focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none"
          >
            <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/30">
              <Zap className="size-4" aria-hidden="true" />
            </span>
            <span className="flex flex-col leading-tight">
              <span className="text-base font-semibold tracking-tight text-foreground">
                {t("header.brand")}
              </span>
              <span className="text-[0.6rem] font-semibold tracking-[0.24em] text-muted-foreground uppercase">
                {t("header.tagline")}
              </span>
            </span>
          </Link>

          <nav
            aria-label="Primary"
            className="hidden flex-wrap items-center gap-x-4 gap-y-2 text-sm lg:flex xl:gap-x-5"
          >
            {PRIMARY_NAV.map((entry) => {
              if (entry.href === "/") return null;
              const isActive = entry.href === activeHref;
              return (
                <Link
                  key={entry.href}
                  href={entry.href}
                  aria-current={isActive ? "page" : undefined}
                  className={
                    isActive
                      ? "relative font-semibold text-link transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none after:absolute after:-bottom-1.5 after:left-0 after:h-0.5 after:w-full after:rounded-full after:bg-primary"
                      : "text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                  }
                >
                  {t(entry.labelKey)}
                </Link>
              );
            })}

            {/*
             * The live-feed pill is the first rail item to go: below `xl` the
             * seven nav entries, the search trigger, the theme switch, the
             * account chip, the Premium CTA and the language selector need the
             * whole row (the rail wraps gracefully if a locale needs more room).
             */}
            <span className="hidden items-center gap-2 rounded-full border border-border px-3 py-1 text-xs text-muted-foreground xl:inline-flex">
              <span className="size-1.5 rounded-full bg-primary" aria-hidden="true" />
              {t("nav.liveFeed")}
            </span>

            <SearchDialog />

            <UserMenu />

            <ThemeToggle />

            <Link
              href="/subscribe"
              className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/30 transition-colors duration-300 hover:bg-primary/85 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none"
            >
              {t("subscribe.ctaPremium")}
            </Link>

            <LanguageSelector />
          </nav>

          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label={t("header.menu")}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-3.5 py-2 text-sm font-medium text-foreground transition-colors duration-300 hover:border-primary/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none lg:hidden"
          >
            <Menu className="size-4" aria-hidden="true" />
            {t("header.menu")}
          </button>
        </div>
      </header>

      {menuOpen ? <MobileMenu onClose={() => setMenuOpen(false)} /> : null}
    </>
  );
}
