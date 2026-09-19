import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BadgeCheck, Crown, Newspaper } from "lucide-react";

import { SiteFooter } from "@/components/blog/footer";
import { SiteHeader } from "@/components/blog/header";
import { T } from "@/components/blog/t";
import { SubscribeFeatureList } from "@/components/blog/subscribe-feature-list";
import { SubscribeCheckoutButton } from "@/components/blog/subscribe-checkout-button";

export const metadata: Metadata = {
  title: "S'abonner — TechPulse",
  description: "Free Reader (0 euro) ou Premium (9,99 euro/mois ou 99 euro/an) : enquêtes illimitées, sans publicité, newsletter hebdommaire.",
};

export default function SubscribePage() {
  return (
    <div className="flex min-h-full flex-col">
      <SiteHeader />

            <main className="mx-auto w-full max-w-[1200px] flex-1 px-4 py-12">
        <div className="mx-auto max-w-2xl">
          <div className="flex flex-col items-center gap-2 text-center">
          <span className="text-[0.7rem] font-semibold tracking-[0.22em] text-primary uppercase">
            <T k="subscribe.eyebrow" />
          </span>
          <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-balance text-foreground sm:text-5xl">
            <T k="subscribe.subtitle" />
          </h1>
          <p className="mt-2 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            <T k="subscribe.subheading" />
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2">
          <article className="flex h-full flex-col justify-between gap-6 rounded-3xl border border-border bg-card p-6 sm:p-8">
            <div className="flex flex-col gap-4">
              <span className="flex size-11 items-center justify-center rounded-xl bg-surface text-muted-foreground">
                <Newspaper className="size-5" aria-hidden="true" />
              </span>
              <div>
                <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                  <T k="subscribe.free" />
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  <T k="subscribe.freeDesc" />
                </p>
              </div>
              <p className="flex items-baseline gap-2">
                <span className="text-4xl font-semibold tracking-tight text-foreground">0 euro</span>
                <span className="text-sm text-muted-foreground">
                  (<T k="subscribe.pricingForever" />)
                </span>
              </p>
              <SubscribeFeatureList listKey="subscribe.freeFeatures" />
            </div>
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-border px-6 py-3 text-sm font-semibold text-foreground transition-colors duration-300 hover:border-primary/60"
            >
              <T k="subscribe.ctaFree" />
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </article>
            <article className="relative flex h-full flex-col justify-between gap-6 overflow-hidden rounded-3xl border border-primary/40 bg-card p-6 shadow-2xl shadow-primary/15 sm:p-8">
              <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary via-[#818cf8] to-primary" />
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/40">
                    <Crown className="size-5" aria-hidden="true" />
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                    <BadgeCheck className="size-3.5" aria-hidden="true" />
                    <T k="subscribe.recommended" />
                  </span>
                </div>
                <div>
                  <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                    <T k="subscribe.premium" />
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    <T k="subscribe.premiumDesc" />
                  </p>
                </div>
                <div className="flex flex-col gap-1">
                  <p className="text-4xl font-semibold tracking-tight text-foreground">
                    <T k="subscribe.pricingMonthly" params={{ price: "9,99" }} />
                  </p>
                  <p className="text-sm text-muted-foreground">
                    <T k="subscribe.pricingYearly" params={{ price: "99" }} />
                  </p>
                </div>
                <SubscribeFeatureList listKey="subscribe.premiumFeatures" color="text-primary" />
              </div>
              <div className="flex flex-col gap-3">
                <SubscribeCheckoutButton plan="monthly" className="w-full" />
                <Link
                  href="/login"
                  className="text-center text-sm text-muted-foreground hover:text-foreground"
                >
                  <T k="subscribe.alreadySubscribed" />
                </Link>
              </div>
            </article>
          </div>

          <section aria-labelledby="premium-benefits-heading" className="mt-12 flex flex-col gap-6">
            <h2 id="premium-benefits-heading" className="text-center text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              <T k="subscribe.benefitsHeading" />
            </h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <article className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-6 transition-colors duration-300 hover:border-primary/60">
                <span aria-hidden="true" className="flex size-10 items-center justify-center rounded-xl bg-primary/15 text-sm font-semibold text-link">01</span>
                <h3 className="text-base font-semibold tracking-tight text-foreground">
                  <T k="subscribe.benefit1Title" />
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  <T k="subscribe.benefit1Body" />
                </p>
              </article>
              <article className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-6 transition-colors duration-300 hover:border-primary/60">
                <span aria-hidden="true" className="flex size-10 items-center justify-center rounded-xl bg-primary/15 text-sm font-semibold text-link">02</span>
                <h3 className="text-base font-semibold tracking-tight text-foreground">
                  <T k="subscribe.benefit2Title" />
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  <T k="subscribe.benefit2Body" />
                </p>
              </article>
              <article className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-6 transition-colors duration-300 hover:border-primary/60">
                <span aria-hidden="true" className="flex size-10 items-center justify-center rounded-xl bg-primary/15 text-sm font-semibold text-link">03</span>
                <h3 className="text-base font-semibold tracking-tight text-foreground">
                  <T k="subscribe.benefit3Title" />
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  <T k="subscribe.benefit3Body" />
                </p>
              </article>
            </div>
          </section>

          <p className="mx-auto mt-10 max-w-xl text-center text-xs leading-relaxed text-muted-foreground">
            <T k="subscribe.demoNote" />
                    </p>
        </div>
      </main>

        <SiteFooter />
      </div>
  );
}
