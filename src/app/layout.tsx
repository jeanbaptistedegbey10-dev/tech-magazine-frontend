import type { Metadata } from "next";
import { MotionConfig } from "framer-motion";
import { Geist, Geist_Mono } from "next/font/google";
import { SessionProvider } from "next-auth/react";
import "./globals.css";

import { ThemeProvider } from "@/components/theme-provider";
import { TranslationProvider } from "@/lib/i18n";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  ),
  title: "TechPulse Magazine",
  description:
    "TechPulse — un magazine tech indépendant : actualité, développement, design et intelligence artificielle.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="fr"
      /* `next-themes` writes the `light` / `dark` class on <html> before hydration. */
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider>
          {/*
           * `reducedMotion="user"` is framer-motion's hydration-safe way to
           * honour the OS "reduce motion" setting: the preference is resolved
           * at the *animation* level (positional transforms become instant),
           * never in the rendered markup, so the server HTML and the hydration
           * render stay identical. The previous per-component
           * `useReducedMotion()` branching read `window.matchMedia` during the
           * hydration render and produced the React #418 mismatch — never
           * branch motion props on a browser value in render again.
           */}
          <MotionConfig reducedMotion="user">
            <SessionProvider>
              <TranslationProvider>{children}</TranslationProvider>
            </SessionProvider>
          </MotionConfig>
        </ThemeProvider>
      </body>
    </html>
  );
}
