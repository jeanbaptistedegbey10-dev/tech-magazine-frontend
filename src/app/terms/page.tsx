import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Building2,
  Copyright,
  CreditCard,
  Gavel,
  Mail,
  Scale,
  Server,
  User,
} from "lucide-react";

import { SiteFooter } from "@/components/blog/footer";
import { SiteHeader } from "@/components/blog/header";
import { T } from "@/components/blog/t";

export const metadata: Metadata = {
  title: "Mentions légales & CGU — TechPulse",
  description:
    "Éditeur du site, hébergement, propriété intellectuelle, comptes lecteurs, abonnement Premium de démonstration et conditions d'utilisation de TechPulse Magazine.",
};

const SECTIONS = [
  { icon: Building2, headingKey: "terms.publisherHeading", bodyKey: "terms.publisherBody" },
  { icon: Server, headingKey: "terms.hostingHeading", bodyKey: "terms.hostingBody" },
  { icon: Copyright, headingKey: "terms.ipHeading", bodyKey: "terms.ipBody" },
  { icon: User, headingKey: "terms.accountHeading", bodyKey: "terms.accountBody" },
  { icon: CreditCard, headingKey: "terms.subscriptionHeading", bodyKey: "terms.subscriptionBody" },
  { icon: Scale, headingKey: "terms.liabilityHeading", bodyKey: "terms.liabilityBody" },
  { icon: Gavel, headingKey: "terms.lawHeading", bodyKey: "terms.lawBody" },
] as const;

/**
 * `/terms` — legal notice & terms. Sister page of `/privacy`, linked from the
 * shared footer. Server component on the shared 1200px editorial measure,
 * every string translated through the `<T />` leaf. Static and
 * CMS-independent — no WordPress call, so a CMS outage can never degrade it.
 */
export default function TermsPage() {
  return (
    <div className="flex min-h-full flex-col">
      <SiteHeader />

      <main className="mx-auto w-full max-w-[1200px] flex-1 px-4 py-12">
        <div className="flex flex-col gap-2">
          <Link
            href="/"
            className="w-fit text-sm text-muted-foreground transition-colors duration-300 hover:text-link focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            &larr; <T k="common.backToFront" />
          </Link>
          <span className="mt-4 text-[0.7rem] font-semibold tracking-[0.22em] text-primary uppercase">
            <T k="terms.eyebrow" />
          </span>
          <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-balance text-foreground sm:text-5xl">
            <T k="terms.title" />
          </h1>
          <p className="mt-2 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            <T k="terms.intro" />
          </p>
          <p className="mt-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
            <T k="terms.updated" />
          </p>
        </div>

        <section aria-labelledby="terms-details-heading" className="mt-12 flex flex-col gap-6">
          <h2
            id="terms-details-heading"
            className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl"
          >
            <T k="terms.publisherHeading" />
          </h2>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {SECTIONS.map((section, index) => (
              <article
                key={section.headingKey}
                className={`flex flex-col gap-3 rounded-2xl border border-border bg-card p-6 transition-colors duration-300 hover:border-primary/60${index === SECTIONS.length - 1 ? " md:col-span-2" : ""}`}
              >
                <span className="flex size-11 items-center justify-center rounded-xl bg-primary/15 text-link">
                  <section.icon className="size-5" aria-hidden="true" />
                </span>
                <h3 className="text-base font-semibold tracking-tight text-foreground">
                  <T k={section.headingKey} />
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  <T k={section.bodyKey} />
                </p>
              </article>
            ))}
          </div>
        </section>

        <section
          aria-labelledby="terms-contact-heading"
          className="mt-12 flex flex-col gap-4 rounded-3xl border border-border bg-card px-6 py-10 text-center sm:px-12"
        >
          <span
            aria-hidden="true"
            className="mx-auto flex size-11 items-center justify-center rounded-xl bg-primary/15 text-link"
          >
            <Mail className="size-5" aria-hidden="true" />
          </span>
          <h2
            id="terms-contact-heading"
            className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl"
          >
            <T k="terms.contactHeading" />
          </h2>
          <p className="mx-auto max-w-xl text-sm leading-relaxed text-muted-foreground">
            <T k="terms.contactBody" />
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors duration-300 hover:bg-primary/85 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none"
            >
              <T k="terms.contactCta" />
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
            <Link
              href="/privacy"
              className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-medium text-foreground transition-colors duration-300 hover:border-primary/60 hover:text-link focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
              <T k="terms.privacyCta" />
            </Link>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
