"use client";

import { CheckCircle2 } from "lucide-react";

import { useTranslation } from "@/lib/i18n";

/**
 * Renders a translated list of feature bullets for the subscribe page.
 * Client component so the list follows the reader's locale via `tList`.
 */
export function SubscribeFeatureList({
  listKey,
  color,
}: {
  listKey: string;
  color?: string;
}) {
  const { tList } = useTranslation();
  const items = tList(listKey);
  const itemColor = color || "text-muted-foreground";

  if (items.length === 0) return null;

  return (
    <ul className="flex flex-col gap-2.5">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-2.5 text-sm text-muted-foreground">
          <CheckCircle2 className={`mt-0.5 size-4 shrink-0 ${itemColor}`} aria-hidden="true" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
