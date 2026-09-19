import type { Metadata } from "next";
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
          <SessionProvider>
            <TranslationProvider>{children}</TranslationProvider>
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
