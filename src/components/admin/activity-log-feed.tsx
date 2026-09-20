"use client";

import { motion } from "framer-motion";
import { CreditCard, FileText, KeyRound } from "lucide-react";

import { ACTIVITY_LOG, auditTypeLabel, timeAgo } from "@/lib/admin-data";
import type { ActivityEntry, AuditActionType } from "@/lib/admin-data";

function typeIcon(type: AuditActionType) {
  if (type === "SUBSCRIPTION") return CreditCard;
  if (type === "CONTENT") return FileText;
  return KeyRound;
}

function typeStyle(type: AuditActionType): string {
  if (type === "SUBSCRIPTION") return "bg-primary/10 text-link";
  if (type === "CONTENT") return "bg-emerald-500/10 text-emerald-400";
  return "bg-amber-500/10 text-amber-400";
}

export function ActivityLogFeed({ entries = ACTIVITY_LOG }: { entries?: ActivityEntry[] }) {
  return (
    <section aria-labelledby="admin-activity-heading" className="rounded-2xl border border-border bg-card p-5 sm:p-6">
      <h2 id="admin-activity-heading" className="text-lg font-semibold tracking-tight text-foreground">
        Journal d&apos;activite
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">Qui a fait quoi, en ordre chronologique.</p>
      <ol className="mt-6 flex flex-col gap-5">
        {entries.map((entry, index) => {
          const Icon = typeIcon(entry.type);
          return (
            <motion.li
              key={entry.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: Math.min(index * 0.04, 0.3) }}
              className="flex items-start gap-4"
            >
              <span className={"inline-flex size-10 shrink-0 items-center justify-center rounded-xl " + typeStyle(entry.type)}>
                <Icon className="size-4" aria-hidden="true" />
              </span>
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <p className="text-sm text-foreground">
                  <span className="font-semibold">{entry.user}</span>
                  <span className="text-muted-foreground"> — {entry.action}</span>
                </p>
                <p className="truncate text-xs text-muted-foreground">{entry.target}</p>
                <p className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span className="rounded-full border border-border bg-surface px-2 py-0.5 font-medium">
                    {auditTypeLabel(entry.type)}
                  </span>
                  {/* `timeAgo` recomputes `Date.now()` at render; if the minute
                      boundary flips between the server render and hydration the
                      stamp text would differ — the stamp is exempted from the
                      hydration diff instead of freezing the clock. */}
                  <time dateTime={entry.timestamp} suppressHydrationWarning>
                    {timeAgo(entry.timestamp)}
                  </time>
                </p>
              </div>
            </motion.li>
          );
        })}
      </ol>
    </section>
  );
}
