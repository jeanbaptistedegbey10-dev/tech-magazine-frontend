"use client";

import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { LogOut } from "lucide-react";

import { useTranslation } from "@/lib/i18n";

/**
 * Account slot of the masthead rail, driven by the Auth.js session.
 *
 * - `loading`   -> a quiet skeleton chip (no layout jump while the session
 *                  cookie is resolved against `/api/auth/session`).
 * - anonymous   -> the previous "Connexion" text link, untouched.
 * - signed in   -> the Google avatar (remote host whitelisted in
 *                  `next.config.ts`), the reader's first name as a link and
 *                  a `LogOut` button calling `signOut({ callbackUrl: "/" })`.
 *
 * Client component: `useSession()` needs the `SessionProvider` mounted in
 * `src/app/layout.tsx`, and the labels come from the i18n dictionary.
 */
function initialsOf(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => (part[0] ?? "").toUpperCase())
    .join("");
}

export function UserMenu() {
  const { t } = useTranslation();
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <span
        aria-hidden="true"
        className="h-8 w-20 animate-pulse rounded-full bg-surface"
      />
    );
  }

  if (status !== "authenticated" || !session.user) {
    return (
      <span className="inline-flex items-center gap-3">
        <Link
          href="/admin/dashboard"
          title="Espace Admin (démo)"
          className="hidden text-xs text-muted-foreground transition-colors hover:text-link focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none sm:inline"
        >
          Espace Admin
        </Link>
        <Link
          href="/login"
          className="text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          {t("auth.login")}
        </Link>
      </span>
    );
  }

  const name = session.user.name ?? session.user.email ?? "TechPulse";
  const firstName = name.split(/\s+/)[0] || name;
  const image = session.user.image ?? null;

  return (
    <div className="flex items-center gap-2">
      <Link
        href="/admin/dashboard"
        title="Espace Admin (démo)"
        className="hidden text-xs text-muted-foreground transition-colors hover:text-link focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none sm:inline"
      >
        Espace Admin
      </Link>
      <Link
        href="/dashboard"
        title={name}
        aria-label={`${name} — ${t("auth.myAccount")}`}
        className="flex max-w-[11rem] items-center gap-2 rounded-full border border-border bg-surface py-1 pl-1 pr-3 transition-colors duration-300 hover:border-primary/60 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
      >
        {image ? (
          <Image
            src={image}
            alt=""
            width={28}
            height={28}
            className="size-7 shrink-0 rounded-full border border-border object-cover"
          />
        ) : (
          <span
            aria-hidden="true"
            className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-[0.6rem] font-semibold text-primary-foreground"
          >
            {initialsOf(name)}
          </span>
        )}
        <span className="truncate text-sm font-medium text-foreground">
          {firstName}
        </span>
      </Link>
      <button
        type="button"
        onClick={() => signOut({ callbackUrl: "/" })}
        title={t("auth.signOut")}
        aria-label={t("auth.signOut")}
        className="inline-flex size-8 shrink-0 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors duration-300 hover:border-primary/60 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
      >
        <LogOut className="size-3.5" aria-hidden="true" />
      </button>
    </div>
  );
}
