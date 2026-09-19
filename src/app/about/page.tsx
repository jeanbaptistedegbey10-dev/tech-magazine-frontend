import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, PenLine, ShieldCheck, Target } from "lucide-react";

import { SiteFooter } from "@/components/blog/footer";
import { SiteHeader } from "@/components/blog/header";

export const metadata: Metadata = {
  title: "About — TechPulse",
  description:
    "TechPulse Magazine is an independent technology newsroom covering AI, infrastructure, security and developer tooling.",
};

const VALUES = [
  {
    icon: Target,
    title: "Signal over noise",
    body: "We publish fewer, better stories: every piece earns its place by explaining what changed, why it matters and what happens next.",
  },
  {
    icon: ShieldCheck,
    title: "Independent by design",
    body: "No sponsored rankings, no pay-to-play coverage. Our only leverage is the trust of readers who build the future.",
  },
  {
    icon: PenLine,
    title: "Craft in every paragraph",
    body: "Every story is reported, edited and fact-checked by a human editor before it reaches the front page.",
  },
] as const;

const COVERAGE = [
  "Artificial Intelligence",
  "Cloud & Infrastructure",
  "Cybersecurity",
  "Developer Tools",
  "Open Source",
  "Gadgets & Reviews",
] as const;

const TEAM = [
  { initials: "LM", name: "Léa Moreau", role: "Editor-in-chief", beat: "AI & platforms" },
  { initials: "KB", name: "Karim Benali", role: "Senior reporter", beat: "Infrastructure & security" },
  { initials: "SA", name: "Sofia Almeida", role: "Staff writer", beat: "Developer tooling" },
  { initials: "JW", name: "Jonas Weber", role: "Contributing editor", beat: "Reviews & analysis" },
] as const;

/**
 * About page — `/about`. Mission, values, coverage and editors on the shared
 * 1200px editorial measure, using the Figma card / badge language.
 */
export default function AboutPage() {
  return (
    <div className="flex min-h-full flex-col">
      <SiteHeader />

      <main className="mx-auto w-full max-w-[1200px] flex-1 px-4 py-12">
        <div className="flex flex-col gap-2">
          <span className="text-[0.7rem] font-semibold tracking-[0.22em] text-primary uppercase">
            About TechPulse
          </span>
          <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-balance text-foreground sm:text-5xl">
            Tech news, engineered.
          </h1>
          <p className="mt-2 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            TechPulse is an independent technology magazine for people who build, secure and ship
            modern software. We cover the products, platforms and people shaping the industry.
          </p>
        </div>

        <section aria-labelledby="values-heading" className="mt-12 flex flex-col gap-6">
          <h2
            id="values-heading"
            className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl"
          >
            What we stand for
          </h2>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {VALUES.map((value) => (
              <article
                key={value.title}
                className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-6 transition-colors duration-300 hover:border-primary/60"
              >
                <span className="flex size-11 items-center justify-center rounded-xl bg-primary/15 text-link">
                  <value.icon className="size-5" aria-hidden="true" />
                </span>
                <h3 className="text-lg font-semibold tracking-tight text-foreground">
                  {value.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{value.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section aria-labelledby="coverage-heading" className="mt-12 flex flex-col gap-6">
          <h2
            id="coverage-heading"
            className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl"
          >
            What we cover
          </h2>

          <ul className="flex flex-wrap gap-2.5">
            {COVERAGE.map((topic) => (
              <li
                key={topic}
                className="rounded-full border border-border bg-card px-4 py-1.5 text-sm text-muted-foreground transition-colors duration-300 hover:border-primary/60 hover:text-foreground"
              >
                {topic}
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="team-heading" className="mt-12 flex flex-col gap-6">
          <h2
            id="team-heading"
            className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl"
          >
            The newsroom
          </h2>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {TEAM.map((member) => (
              <article
                key={member.name}
                className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-6 transition-colors duration-300 hover:border-primary/60"
              >
                <span
                  aria-hidden="true"
                  className="flex size-12 items-center justify-center rounded-full bg-primary/15 text-base font-semibold text-link"
                >
                  {member.initials}
                </span>
                <div className="flex flex-col gap-1">
                  <h3 className="text-base font-semibold tracking-tight text-foreground">
                    {member.name}
                  </h3>
                  <p className="text-sm text-link">{member.role}</p>
                  <p className="text-xs text-muted-foreground">{member.beat}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section
          aria-labelledby="about-cta-heading"
          className="mt-12 flex flex-col gap-4 rounded-3xl border border-border bg-card px-6 py-10 text-center sm:px-12"
        >
          <h2
            id="about-cta-heading"
            className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl"
          >
            Read the latest from the newsroom
          </h2>
          <p className="mx-auto max-w-xl text-sm leading-relaxed text-muted-foreground">
            Every story on TechPulse is published from our headless WordPress newsroom and
            refreshed hourly.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors duration-300 hover:bg-primary/85 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none"
            >
              Browse all stories
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-medium text-foreground transition-colors duration-300 hover:border-primary/60 hover:text-link focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
              Talk to the newsroom
            </Link>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

