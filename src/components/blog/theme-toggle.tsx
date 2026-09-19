"use client";

import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

import { useTranslation } from "@/lib/i18n";

/**
 * Light / dark theme switcher — `src/components/blog/theme-toggle.tsx`.
 *
 * `next-themes` cannot know the resolved theme while server rendering, so the
 * first render (server **and** client) falls back to the dark default: both
 * sides render the same markup, which is why this component keeps no
 * `mounted` state — and no `setState` inside an effect (forbidden by the
 * `react-hooks/set-state-in-effect` rule used in this project).
 *
 * The toggle icon + label still depend on the stored theme, so a reader
 * returning with `light` saved would hydrate a `Sun` server node into a
 * `Moon` client node (React 19 hydration mismatch). The `suppressHydrationWarning`
 * below tells React that this subtree is intentionally client-resolved by
 * `next-themes` after hydration — the standard escape hatch for theme toggles
 * when a `mounted` guard is unavailable. `<html>` already carries the same
 * attribute in `src/app/layout.tsx` for the injected theme class.
 *
 * The label describes the action, not the current state, so screen readers get
 * "Switch to light mode" while the dark theme is active.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const { t } = useTranslation();
  const { resolvedTheme, setTheme } = useTheme();

  const isDark = resolvedTheme !== "light";
  const label = isDark ? t("header.themeLight") : t("header.themeDark");

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={label}
      title={label}
      suppressHydrationWarning
      className={`inline-flex size-9 shrink-0 items-center justify-center rounded-full border border-border bg-surface text-foreground transition-colors duration-300 hover:border-primary/50 hover:text-link focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none ${className || ""}`}
    >
      <span suppressHydrationWarning className="inline-flex items-center justify-center">
        {isDark ? (
          <Sun className="size-4" aria-hidden="true" />
        ) : (
          <Moon className="size-4" aria-hidden="true" />
        )}
      </span>
    </button>
  );
}