import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/app/api/auth/[...nextauth]/route";

type Plan = "monthly" | "yearly";

const PLAN_PRICES: Record<Plan, { monthly: number; yearly: number; label: string }> = {
  monthly: { monthly: 9.99, yearly: 99.0, label: "TechPulse Premium — mensuel" },
  yearly: { monthly: 9.99, yearly: 89.99, label: "TechPulse Premium — annuel" },
};

const MOCK_DELAY_MS = 600;

/**
 * Mocked Stripe checkout route — `/api/stripe/checkout`.
 *
 * Simulates the creation of a Stripe Checkout session without any real
 * Stripe account. On success it:
 *   1. sets a short-lived `techpulse_premium_success` cookie (10 min,
 *      non-httpOnly so the client banner can dismiss it) so the dashboard
 *      shows the success alert on the immediate return and briefly after a
 *      refresh,
 *   2. sets a 30-day `techpulse_premium` cookie (httpOnly) that marks the
 *      session as "active premium" in this no-database architecture, so the
 *      dashboard renders the "Compte Premium" badge and the premium body,
 *   3. returns `{ url: "/dashboard?success=true" }` for the client to
 *      follow.
 *
 * Unauthenticated readers are rejected with 401 — the subscribe page itself
 * redirects to `/login?redirect=/subscribe` before calling this route, so
 * this 401 is a safety net rather than the primary flow.
 */
export async function POST(request: NextRequest) {
  const started = Date.now();

  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "non authentifie" },
        { status: 401 }
      );
    }

    // Give the auth cookie a moment to settle on the very first request
    // after a cold start (the page can otherwise see an empty session
    // for a few ms only).
    if (Date.now() - started < 50) {
      await new Promise((r) => setTimeout(r, 50 - (Date.now() - started)));
    }

    let plan: Plan = "monthly";
    try {
      const body = await request.json();
      if (
        body &&
        typeof body.plan === "string" &&
        (body.plan === "monthly" || body.plan === "yearly")
      ) {
        plan = body.plan;
      }
    } catch {
      // Malformed body — fall back to the monthly plan.
    }

    const prices = PLAN_PRICES[plan];

    // Simulate a Stripe Checkout session creation (network round-trip to a
    // fake Stripe API).
    await new Promise((r) => setTimeout(r, MOCK_DELAY_MS));

    const response = NextResponse.json(
      {
        id: "mock_session_" + Date.now(),
        plan,
        price: plan === "yearly" ? prices.yearly : prices.monthly,
        currency: "eur",
        url: "/dashboard?success=true",
        sandbox: true,
      },
      { status: 200 }
    );

    // Short-lived success cookie — drives the dashboard success banner.
    // Non-httpOnly so the client can clear it on dismiss.
    response.cookies.set("techpulse_premium_success", "1", {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 600,
    });

    // Persistent premium marker — the no-DB representation of an "active
    // premium session". The dashboard reads it (server-side) to render the
    // "Compte Premium" badge and premium body.
    response.cookies.set("techpulse_premium", "active", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 2592000,
    });

    return response;
  } catch (error) {
    console.error("[stripe/checkout] unexpected error:", error);
    return NextResponse.json(
      { error: "impossible de creer la session de paiement" },
      { status: 500 }
    );
  }
}
