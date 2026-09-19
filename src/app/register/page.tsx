import type { Metadata } from "next";
import Link from "next/link";

import { AuthForm } from "@/components/blog/auth-form";
import { SiteFooter } from "@/components/blog/footer";
import { SiteHeader } from "@/components/blog/header";

export const metadata: Metadata = {
  title: "Créer un compte — TechPulse",
  description: "Créez votre compte TechPulse gratuit ou Premium en quelques secondes.",
};

/**
 * Register page — `/register`.
 *
 * Server wrapper (metadata + layout) around the client `AuthForm` in register
 * mode, on the shared 1200px editorial measure narrowed to a 480px column.
 */
export default function RegisterPage() {
  return (
    <div className="flex min-h-full flex-col">
      <SiteHeader />

      <main className="mx-auto w-full max-w-[1200px] flex-1 px-4 py-12">
        <div className="mx-auto flex w-full max-w-[480px] flex-col gap-6">
          <div className="flex flex-col items-center gap-2 text-center">
            <span className="text-[0.7rem] font-semibold tracking-[0.22em] text-primary uppercase">
              Inscription
            </span>
            <h1 className="text-4xl font-semibold tracking-tight text-balance text-foreground sm:text-5xl">
              Rejoignez TechPulse.
            </h1>
            <p className="mt-2 text-base leading-relaxed text-muted-foreground">
              Un compte gratuit pour commencer, Premium quand vous êtes prêt.
            </p>
          </div>

          <AuthForm mode="register" />

          <p className="text-center text-sm text-muted-foreground">
            Hésitez encore&nbsp;?{" "}
            <Link
              href="/subscribe"
              className="font-medium text-link transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
              Comparer les formules
            </Link>
          </p>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
