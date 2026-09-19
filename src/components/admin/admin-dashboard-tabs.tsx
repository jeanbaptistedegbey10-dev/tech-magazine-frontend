"use client";

import { useState } from "react";
import { Activity, LayoutDashboard, Users } from "lucide-react";

import { ActivityLogFeed } from "@/components/admin/activity-log-feed";
import { AdminStats } from "@/components/admin/admin-stats";
import { UserManagementTable } from "@/components/admin/user-management-table";
import { cn } from "@/lib/utils";

type AdminTab = "overview" | "users" | "activity";

const TABS = [
  { value: "overview", label: "Vue d'ensemble", Icon: LayoutDashboard },
  { value: "users", label: "Utilisateurs et abonnements", Icon: Users },
  { value: "activity", label: "Journal d'activite", Icon: Activity },
] as Array<{ value: AdminTab; label: string; Icon: typeof Users }>;

/**
 * Coquille a onglets du back-office : vue d'ensemble (stats + table +
 * journal), gestion des abonnes, fil d'activite isole.
 */
export function AdminDashboardTabs() {
  const [tab, setTab] = useState<AdminTab>("overview");
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Sections d'administration">
        {TABS.map((entry) => (
          <button
            key={entry.value}
            type="button"
            role="tab"
            aria-selected={tab === entry.value}
            onClick={() => setTab(entry.value)}
            className={cn(
              "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-colors duration-300 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
              tab === entry.value
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-surface text-muted-foreground hover:border-primary/60 hover:text-foreground",
            )}
          >
            <entry.Icon className="size-4" aria-hidden="true" />
            {entry.label}
          </button>
        ))}
      </div>
      {tab === "overview" ? (
        <div className="flex flex-col gap-6">
          <AdminStats />
          <UserManagementTable />
          <ActivityLogFeed />
        </div>
      ) : null}
      {tab === "users" ? <UserManagementTable /> : null}
      {tab === "activity" ? <ActivityLogFeed /> : null}
    </div>
  );
}
