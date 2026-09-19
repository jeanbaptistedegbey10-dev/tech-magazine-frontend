"use client";

import { useMemo, useState } from "react";
import { Crown, Search, ShieldCheck, UserRound } from "lucide-react";

import { ADMIN_USERS, formatAdminDate, initialsOfAdmin, roleLabel, statusLabel } from "@/lib/admin-data";
import type { AdminUser, SubscriberStatus } from "@/lib/admin-data";
import { cn } from "@/lib/utils";

type StatusFilter = "ALL" | SubscriberStatus;

const STATUS_FILTERS = [
  { value: "ALL", label: "Tous" },
  { value: "ACTIVE_PREMIUM", label: "Premium actif" },
  { value: "FREE", label: "Gratuit" },
  { value: "EXPIRED", label: "Expire" },
] as Array<{ value: StatusFilter; label: string }>;

function statusBadgeClass(status: SubscriberStatus): string {
  if (status === "ACTIVE_PREMIUM") return "border-primary/40 bg-primary/10 text-link";
  if (status === "EXPIRED") return "border-destructive/40 bg-destructive/10 text-destructive";
  return "border-border bg-surface text-muted-foreground";
}

export function UserManagementTable({ users = ADMIN_USERS }: { users?: AdminUser[] }) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [rows, setRows] = useState<AdminUser[]>(users);
  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return rows.filter((user) => {
      const matchesQuery =
        needle.length === 0 ||
        user.name.toLowerCase().includes(needle) ||
        user.email.toLowerCase().includes(needle);
      const matchesStatus = statusFilter === "ALL" || user.status === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [rows, query, statusFilter]);
  function togglePremium(id: string) {
    setRows((current) =>
      current.map((user) =>
        user.id === id
          ? { ...user, status: user.status === "ACTIVE_PREMIUM" ? "FREE" : "ACTIVE_PREMIUM" }
          : user,
      ),
    );
  }
  function toggleRole(id: string) {
    setRows((current) =>
      current.map((user) =>
        user.id === id ? { ...user, role: user.role === "ADMIN" ? "USER" : "ADMIN" } : user,
      ),
    );
  }
  return (
    <section aria-labelledby="admin-users-heading" className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className="flex flex-col gap-4 border-b border-border p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 id="admin-users-heading" className="text-lg font-semibold tracking-tight text-foreground">
              Utilisateurs et abonnements
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {filtered.length} resultats sur {rows.length} comptes
            </p>
          </div>
          <label className="relative block w-full sm:w-72">
            <span className="sr-only">Rechercher par nom ou e-mail</span>
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Rechercher nom ou e-mail…"
              className="w-full rounded-full border border-border bg-surface py-2 pr-4 pl-10 text-sm text-foreground placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            />
          </label>
        </div>
        <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filtrer par statut">
          {STATUS_FILTERS.map((filter) => (
            <button
              key={filter.value}
              type="button"
              onClick={() => setStatusFilter(filter.value)}
              aria-pressed={statusFilter === filter.value}
              className={cn(
                "rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors duration-300 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                statusFilter === filter.value
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-surface text-muted-foreground hover:border-primary/60 hover:text-foreground",
              )}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-border text-xs tracking-[0.14em] text-muted-foreground uppercase">
              <th scope="col" className="px-5 py-3 font-semibold">Utilisateur</th>
              <th scope="col" className="px-5 py-3 font-semibold">Role</th>
              <th scope="col" className="px-5 py-3 font-semibold">Statut</th>
              <th scope="col" className="px-5 py-3 font-semibold">Inscription</th>
              <th scope="col" className="px-5 py-3 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((user) => (
              <tr key={user.id} className="border-b border-border/60 transition-colors last:border-0 hover:bg-surface/50">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <span aria-hidden="true" className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                      {initialsOfAdmin(user.name)}
                    </span>
                    <span className="flex min-w-0 flex-col">
                      <span className="truncate font-medium text-foreground">{user.name}</span>
                      <span className="truncate text-xs text-muted-foreground">{user.email}</span>
                    </span>
                  </div>
                </td>
                <td className="px-5 py-3">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-2.5 py-1 text-xs font-medium text-foreground">
                    {user.role === "ADMIN" ? (
                      <ShieldCheck className="size-3.5 text-link" aria-hidden="true" />
                    ) : (
                      <UserRound className="size-3.5 text-muted-foreground" aria-hidden="true" />
                    )}
                    {roleLabel(user.role)}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold", statusBadgeClass(user.status))}>
                    {user.status === "ACTIVE_PREMIUM" ? <Crown className="size-3.5" aria-hidden="true" /> : null}
                    {statusLabel(user.status)}
                  </span>
                </td>
                <td className="px-5 py-3 whitespace-nowrap text-muted-foreground">{formatAdminDate(user.joinedDate)}</td>
                <td className="px-5 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => togglePremium(user.id)}
                      className="rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:border-primary/60 hover:text-link focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                    >
                      {user.status === "ACTIVE_PREMIUM" ? "Passer gratuit" : "Passer Premium"}
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleRole(user.id)}
                      className="rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:border-primary/60 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                    >
                      {user.role === "ADMIN" ? "Retirer admin" : "Rendre admin"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-10 text-center text-sm text-muted-foreground">
                  Aucun utilisateur ne correspond a cette recherche.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </section>
  );
}

