"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, Loader2 } from "lucide-react";

import { useTranslation } from "@/lib/i18n";

type Plan = "monthly" | "yearly";

/**
 * Premium subscribe CTA wired to the mocked Stripe checkout flow.
 *
 * - Not signed in -> navigate to `/login?redirect=/subscribe` so the reader
 *   can sign in with Google and be sent back to this page.
 * - Signed in      -> POST `/api/stripe/checkout` (mocked) and follow the
 *   returned `url` (`/dashboard?success=true`).
 */
export function SubscribeCheckoutButton({ plan, className }: { plan: Plan; className?: string }) {
  const { t } = useTranslation();
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubscribe() {
    if (loading) return;

    if (status !== "authenticated" || !session?.user) {
      router.push("/login?redirect=/subscribe");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Impossible de creer la session de paiement");
      }
      // Follow the mocked Stripe redirect to the dashboard success screen.
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : t("subscribe.checkoutError"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={className}>
      <button
        type="button"
        onClick={handleSubscribe}
        disabled={loading}
        className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/30 transition-colors duration-300 hover:bg-primary/85 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none disabled:cursor-wait disabled:opacity-80"
      >
        {loading ? (
          <>
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            {t("subscribe.submitting")}
          </>
        ) : (
          <>
            {t("subscribe.ctaPremium")}
            <ArrowRight className="size-4" aria-hidden="true" />
          </>
        )}
      </button>
      {error ? (
        <p
          role="alert"
          className="mt-2 text-center text-sm leading-relaxed text-red-300"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}
