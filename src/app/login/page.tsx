import type { Metadata } from "next";
import Link from "next/link";

import { AuthForm } from "@/components/blog/auth-form";
import { SiteFooter } from "@/components/blog/footer";
import { SiteHeader } from "@/components/blog/header";
import { T } from "@/components/blog/t";

export const metadata: Metadata = {
  title: "Connexion — TechPulse",
  description: "Connectez-vous à votre compte TechPulse pour retrouver vos articles Premium.",
};

/**
 * Login page — `/login`.
 *
 * Server wrapper (metadata + layout) around the client `AuthForm` in login
 * mode, on the shared 1200px editorial measure narrowed to a 480px column.
 *
 * Accepts an optional `?redirect=/path` search param so the subscription
 * checkout flow can send a reader here and back to `/subscribe` after Google
 * sign-in, completing the premium upgrade funnel.
 */
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const sp = await searchParams;
  const callbackUrl = sp.redirect ? `/${sp.redirect.replace(/^\//, "")}` : undefined;

  return (
    <div className="flex min-h-full flex-col">
      <SiteHeader />

      <main className="mx-auto w-full max-w-[1200px] flex-1 px-4 py-12">
        <div className="mx-auto flex w-full max-w-[480px] flex-col gap-6">
          <div className="flex flex-col items-center gap-2 text-center">
            <span className="text-[0.7rem] font-semibold tracking-[0.22em] text-primary uppercase">
                            <T k="auth.login" />
            </span>
            <h1 className="text-4xl font-semibold tracking-tight text-balance text-foreground sm:text-5xl">
              Bon retour.
            </h1>
            <p className="mt-2 text-base leading-relaxed text-muted-foreground">
              Retrouvez vos enquêtes Premium là où vous les aviez laissées.
            </p>
          </div>

          <AuthForm mode="login" callbackUrl={callbackUrl} />

          <p className="text-center text-sm text-muted-foreground">
            Envie de Premium&nbsp;?{" "}
            <Link
              href="/subscribe"
              className="font-medium text-link transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
              Voir les formules
            </Link>
          </p>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
