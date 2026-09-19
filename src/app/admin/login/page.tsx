import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { AdminLoginForm } from "@/components/admin/admin-login-form";
import { SiteFooter } from "@/components/blog/footer";
import { SiteHeader } from "@/components/blog/header";
import { isAdminLoggedIn } from "@/lib/admin-auth";

export const metadata: Metadata = {
  title: "Administration — Connexion — TechPulse",
  description: "Connexion sécurisée à l'espace d'administration TechPulse.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/**
 * Dedicated admin sign-in page — `/admin/login`.
 *
 * Shared magazine chrome around the credential form on a narrow 480px
 * column. Already-authenticated admins skip the form and go straight to
 * the dashboard; a successful sign-in redirects there as well.
 */
export default async function AdminLoginPage() {
  if (await isAdminLoggedIn()) {
    redirect("/admin/dashboard");
  }

  return (
    <div className="flex min-h-full flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-[1200px] flex-1 px-4 py-12">
        <div className="mx-auto flex w-full max-w-[480px] flex-col gap-6">
          <Link
            href="/"
            className="inline-flex w-fit items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            Retour à l&apos;accueil
          </Link>
          <AdminLoginForm />
          <p className="text-center text-xs text-muted-foreground">
            Accès réservé à l&apos;équipe TechPulse — toute tentative est journalisée.
          </p>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
