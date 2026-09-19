import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Building2, Crown, LogOut, ShieldCheck } from "lucide-react";

import { SiteFooter } from "@/components/blog/footer";
import { SiteHeader } from "@/components/blog/header";
import { T } from "@/components/blog/t";
import { auth } from "@/auth";
import { cookies } from "next/headers";
import { Suspense } from "react";
import { PremiumSuccessBanner } from "@/components/blog/premium-success-banner";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) { return notFound(); }
  const cookieStore = await cookies();
  const premiumCookie = cookieStore.get("techpulse_premium");
  const successCookie = cookieStore.get("techpulse_premium_success");
  const isPremium = !!premiumCookie;
  const name = session.user.name ?? session.user.email ?? "TechPulse";
  const email = session.user.email ?? "";
  const image = session.user.image ?? null;
  const initials = name.trim().split(/\s+/).slice(0,2).map(p => (p[0] ?? "").toUpperCase()).join("");
  return (
    <div className="flex min-h-full flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-[1200px] flex-1 px-4 py-12 sm:px-8">
        <div className="mx-auto max-w-2xl">
          <div className="mb-10 flex items-center gap-4">
            <div className="relative flex size-16 shrink-0 items-center justify-center rounded-full border-2 border-primary/30 bg-card overflow-hidden">
              {image ? (
                <Image src={image} alt="" fill className="object-cover" />
              ) : (
                <span className="flex size-16 items-center justify-center rounded-full bg-primary text-lg font-semibold text-primary-foreground">
                  {initials}
                </span>
              )}
            </div>
            <div>
              <p className="text-[0.7rem] font-semibold tracking-[0.22em] text-primary uppercase"><T k="auth.myAccount" /></p>
              <h1 className="mt-1 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                <T k="auth.dashboard.greeting" params={{ name: name.split(/\s+/)[0] }} />
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">{email}</p>
            </div>
          </div>

          <Suspense fallback={null}>
            <PremiumSuccessBanner hasCookie={!!successCookie} />
          </Suspense>
          <section aria-labelledby="account-status-heading" className="mb-10 rounded-2xl border border-border bg-card p-6 sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div className="flex flex-col gap-3">
                <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-link uppercase">
                  {isPremium ? <ArrowRight className="size-3.5" aria-hidden="true" /> : <Crown className="size-3.5" aria-hidden="true" />}
                  <T k="auth.dashboard.accountStatus" />
                </span>
                <h2 id="account-status-heading" className="text-xl font-semibold tracking-tight text-foreground">
                  <T k={isPremium ? "auth.dashboard.premiumTier" : "auth.dashboard.freeTier"} />
                </h2>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  <T k={isPremium ? "auth.dashboard.premiumTierBody" : "auth.dashboard.freeTierBody"} />
                </p>
              </div>
              <Link
                href={isPremium ? "/blog" : "/subscribe"}
                className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/30 transition-colors duration-300 hover:bg-primary/85 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none whitespace-nowrap"
              >
                {isPremium ? <ArrowRight className="size-4" aria-hidden="true" /> : <Crown className="size-4" aria-hidden="true" />}
                <T k={isPremium ? "auth.dashboard.browseStories" : "auth.dashboard.upgradeCta"} />
              </Link>
            </div>
          </section>

          <section aria-labelledby="account-settings-heading" className="mb-10 rounded-2xl border border-border bg-card p-6 sm:p-8">
            <div className="flex items-center gap-2">
              <Building2 className="size-4 text-muted-foreground" aria-hidden="true" />
              <h2 id="account-settings-heading" className="text-lg font-semibold tracking-tight text-foreground">
                <T k="auth.dashboard.settingsTitle" />
              </h2>
            </div>
            <div className="mt-6 flex flex-col gap-3">
              <div className="flex items-center gap-4 rounded-xl border border-border bg-surface/50 px-4 py-3 transition-colors duration-300 hover:border-primary/60">
                <LogOut className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                <div>
                  <p className="text-sm font-medium text-foreground"><T k="auth.signOut" /></p>
                  <p className="text-xs text-muted-foreground"><T k="auth.dashboard.signOutHint" /></p>
                </div>
                <form method="POST" action="/api/auth/signout" className="ml-auto">
                  <button type="submit" className="rounded-full border border-border bg-surface px-4 py-2 text-sm font-medium text-muted-foreground transition-colors duration-300 hover:border-primary/60 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none">
                    <T k="auth.signOut" />
                  </button>
                </form>
              </div>
              <Link href="/privacy" className="flex w-full items-center gap-4 rounded-xl border border-border bg-surface/50 px-4 py-3 text-sm text-muted-foreground transition-colors duration-300 hover:border-primary/60 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none">
                <ShieldCheck className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                <span className="flex flex-col gap-0.5">
                  <span className="font-medium text-foreground">
                    <T k="privacy.title" />
                  </span>
                  <span className="text-xs text-muted-foreground">
                    <T k="privacy.cardBody" />
                  </span>
                </span>
              </Link>
            </div>
          </section>


          <section aria-labelledby="auth-info-heading" className="rounded-2xl border border-border bg-card/80 p-6 sm:p-8">
            <div className="flex items-center gap-2">
              <ShieldCheck className="size-4 text-muted-foreground" aria-hidden="true" />
              <h2 id="auth-info-heading" className="text-lg font-semibold tracking-tight text-foreground">
                <T k="auth.dashboard.authInfo" />
              </h2>
            </div>
            <dl className="mt-5 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1 rounded-lg bg-surface/40 px-4 py-3">
                <span className="text-[0.65rem] font-semibold tracking-[0.2em] text-muted-foreground uppercase"><T k="auth.name" /></span>
                <span className="text-sm font-medium text-foreground truncate">{name}</span>
              </div>
              <div className="flex flex-col gap-1 rounded-lg bg-surface/40 px-4 py-3">
                <span className="text-[0.65rem] font-semibold tracking-[0.2em] text-muted-foreground uppercase"><T k="auth.email" /></span>
                <span className="text-sm font-medium text-foreground break-all">{email}</span>
              </div>
              <div className="flex flex-col gap-1 rounded-lg bg-surface/40 px-4 py-3">
                <span className="text-[0.65rem] font-semibold tracking-[0.2em] text-muted-foreground uppercase"><T k="auth.dashboard.provider" /></span>
                <span className="text-sm font-medium text-foreground flex items-center gap-2"><span className="inline-flex size-2 items-center justify-center rounded-full bg-sky-400" aria-hidden="true" />Google</span>
              </div>
              <div className="flex flex-col gap-1 rounded-lg bg-surface/40 px-4 py-3">
                <span className="text-[0.65rem] font-semibold tracking-[0.2em] text-muted-foreground uppercase"><T k="auth.dashboard.session" /></span>
                <span className="text-sm font-medium text-foreground flex items-center gap-2"><span className="inline-flex size-2 items-center justify-center rounded-full bg-emerald-400" aria-hidden="true" /><T k="auth.dashboard.active" /></span>
              </div>
            </dl>
          </section>

          <p className="mt-8 text-center text-xs text-muted-foreground"><T k="auth.dashboard.demoNote" /></p>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

