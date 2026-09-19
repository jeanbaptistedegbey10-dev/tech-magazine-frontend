import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, ShieldCheck } from "lucide-react";

import { AdminDashboardTabs } from "@/components/admin/admin-dashboard-tabs";
import { AdminLogoutButton } from "@/components/admin/admin-logout-button";
import { SiteFooter } from "@/components/blog/footer";
import { SiteHeader } from "@/components/blog/header";
import { isAdminLoggedIn } from "@/lib/admin-auth";

export const metadata: Metadata = {
  title: "Administration — TechPulse",
  description: "Back-office de demonstration : abonnes, revenus et journal d'activite.",
  robots: { index: false, follow: false },
};

/**
 * Back-office de demonstration : chrome magazine partage + onglets admin.
 * Donnees simulees, aucune dependance CMS, page marquee noindex.
 *
 * Acces protege : sans cookie de session admin valide, redirection vers la
 * page de connexion dediee. La lecture du cookie rend la route dynamique,
 * donc aucun HTML partage ne fuite entre lecteurs et admins.
 */
export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  if (!(await isAdminLoggedIn())) {
    redirect("/admin/login");
  }

  return (
    <div className="flex min-h-full flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-[1200px] flex-1 px-4 py-10 sm:px-8">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Retour a l&apos;espace membre
        </Link>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4">
            <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/30">
              <ShieldCheck className="size-6" aria-hidden="true" />
            </span>
            <div>
              <p className="text-[0.7rem] font-semibold tracking-[0.22em] text-primary uppercase">
                Administration — Demo
              </p>
              <h1 className="mt-1 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                Tableau de bord admin
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Abonnes, revenus simules et activite recente des lecteurs.
              </p>
            </div>
          </div>
          <AdminLogoutButton />
        </div>
        <div className="mt-8">
          <AdminDashboardTabs />
        </div>
        <p className="mt-8 text-center text-xs text-muted-foreground">
          Donnees de demonstration — aucun abonne ni paiement reel.
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}
