"use client";

import { motion } from "framer-motion";
import { Crown, Euro, TrendingUp, Users } from "lucide-react";

import { ADMIN_METRICS } from "@/lib/admin-data";

/**
 * Cartes de statistiques du back-office admin.
 * Client pour l'animation d'entree Framer Motion coherente
 * avec le langage motion du magazine (hero, post cards).
 */
const CARDS = [
  {
    key: "total",
    label: "Total abonnes",
    value: ADMIN_METRICS.totalUsers.toLocaleString("fr-FR"),
    hint: "Comptes lecteurs + admins",
    Icon: Users,
  },
  {
    key: "revenue",
    label: "Revenus mensuels",
    value: ADMIN_METRICS.monthlyRevenue.toLocaleString("fr-FR") + " EUR",
    hint: "MRR simule (sandbox Stripe)",
    Icon: Euro,
  },
  {
    key: "active",
    label: "Abonnes Premium actifs",
    value: ADMIN_METRICS.activeSubscribers.toLocaleString("fr-FR"),
    hint: "Statut ACTIVE_PREMIUM",
    Icon: Crown,
  },
  {
    key: "conversion",
    label: "Taux de conversion",
    value: String(ADMIN_METRICS.conversionRate).replace(".", ",") + " %",
    hint: "Lecteurs convertis en Premium",
    Icon: TrendingUp,
  },
] as const;

export function AdminStats() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {CARDS.map((card, index) => (
        <motion.div
          key={card.key}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: index * 0.06 }}
          className="rounded-2xl border border-border bg-card p-5"
        >
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
              {card.label}
            </p>
            <span className="inline-flex size-9 items-center justify-center rounded-xl bg-primary/10 text-link">
              <card.Icon className="size-4" aria-hidden="true" />
            </span>
          </div>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-foreground">
            {card.value}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">{card.hint}</p>
        </motion.div>
      ))}
    </div>
  );
}
