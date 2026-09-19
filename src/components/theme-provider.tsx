"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";

/**
 * Theme provider — `src/components/theme-provider.tsx`.
 *
 * Wraps the app in `next-themes` and toggles the `light` / `dark` class on
 * `<html>`. Dark stays the editorial default of the magazine
 *
 *   - `defaultTheme="dark"`: the first paint is dark, just like the raw Figma
 *     palette on `:root`, so a reader who never touches the toggle sees the
 *     product default and no flash of a light page;
 *   - `enableSystem={false}`: the toggle is an explicit two-state switch
 *     (light / dark) instead of silently following the OS and surprising the
 *     reader with a theme they never chose;
 *   - `disableTransitionOnChange`: colours swap instantly instead of animating
 *     every transitioned property on the page.
 *
 * The matching palettes live in `src/app/globals.css` (`.light` / `.dark`).
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      themes={["light", "dark"]}
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  );
}