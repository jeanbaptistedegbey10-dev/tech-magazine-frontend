import Link from "next/link";
import { ArrowLeft, ArrowRight, Compass, Newspaper } from "lucide-react";

import { SiteFooter } from "@/components/blog/footer";
import { SiteHeader } from "@/components/blog/header";
import { T } from "@/components/blog/t";

/**
 * Root 404 page — `src/app/not-found.tsx`.
 *
 * Rendered by Next.js inside the root layout both for `notFound()` calls
 * (unknown article or desk slug) and for URLs matching no route at all. It
 * shares the magazine chrome (masthead + footer) and the 1600px container,
 * and links only to URLs verified against the live WordPress terms — the desk
 * slugs below mirror `getCategories()` (`ai-and-cloud`, never `ai-cloud`), so
 * the pills cannot 404 themselves.
 *
 * Server component: translated strings cross the client boundary through the
 * tiny `<T />` leaf, like every other reading surface. Next.js injects
 * `robots: noindex` for 404 responses automatically, so no metadata export is
 * needed here.
 */
const MAIN_DESKS = [
  { slug: "tech-news", name: "Tech News" },
  { slug: "development", name: "Development" },
  { slug: "design", name: "Design" },
  { slug: "ai-and-cloud", name: "AI & Cloud" },
];

export default function NotFound() {
  return (
    <div className="flex min-h-full flex-col">
      <SiteHeader />

      <main className="mx-auto flex w-full max-w-[1600px] flex-1 flex-col items-center px-4 py-16 text-center sm:px-8 sm:py-24 lg:px-16">
        <div className="flex max-w-2xl flex-col items-center gap-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-semibold tracking-[0.22em] text-link uppercase">
            <Compass className="size-3.5" aria-hidden="true" />
            <T k="notFound.eyebrow" />
          </span>

          {/* Oversized 404 badge — the editorial anchor of the page. */}
          <p
            aria-hidden="true"
            className="bg-gradient-to-b from-[#818cf8] via-primary to-[#4338ca] bg-clip-text text-[6rem] leading-none font-bold tracking-tight text-transparent sm:text-[9rem]"
          >
            404
          </p>

          <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            <T k="notFound.title" />
          </h1>

          <p className="max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            <T k="notFound.body" />
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/30 transition-colors duration-300 hover:bg-primary/85 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none"
            >
              <ArrowLeft className="size-4" aria-hidden="true" />
              <T k="common.backToFront" />
            </Link>
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-3 text-sm font-semibold text-foreground transition-colors duration-300 hover:border-primary/60 hover:text-link focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
              <Newspaper className="size-4" aria-hidden="true" />
              <T k="common.allStories" />
            </Link>
          </div>
        </div>

        <div className="mt-16 flex w-full max-w-2xl flex-col items-center gap-5 border-t border-border pt-10">
          <p className="text-[0.7rem] font-semibold tracking-[0.22em] text-primary uppercase">
            <T k="notFound.categoriesHeading" />
          </p>
          <nav
            aria-label="Main desks"
            className="flex flex-wrap items-center justify-center gap-3"
          >
            {MAIN_DESKS.map((desk) => (
              <Link
                key={desk.slug}
                href={`/blog/category/${desk.slug}`}
                className="group inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors duration-300 hover:border-primary/60 hover:text-link focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              >
                {desk.name}
                <ArrowRight
                  className="size-4 text-muted-foreground transition-colors duration-300 group-hover:text-link"
                  aria-hidden="true"
                />
              </Link>
            ))}
          </nav>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}