"use client";

import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

import { useTranslation } from "@/lib/i18n";

/**
 * Light / dark theme switcher — `src/components/blog/theme-toggle.tsx`.
 *
 * `next-themes` cannot know the resolved theme while server rendering, so the
 * first render (server **and** client) falls back to the dark default: both
 * sides render the same markup, which is why this component needs no
 * `mounted` state — and no `setState` inside an effect (forbidden by the
 * `react-hooks/set-state-in-effect` rule used in this project).
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
      className={`inline-flex size-9 shrink-0 items-center justify-center rounded-full border border-border bg-surface text-foreground transition-colors duration-300 hover:border-primary/50 hover:text-link focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none ${className || ""}`}
    >
      {isDark ? (
        <Sun className="size-4" aria-hidden="true" />
      ) : (
        <Moon className="size-4" aria-hidden="true" />
      )}
    </button>
  );
}