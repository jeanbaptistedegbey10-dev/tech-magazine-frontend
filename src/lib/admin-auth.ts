import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "node:crypto";
import type { NextResponse } from "next/server";

/**
 * Admin gate for the TechPulse back-office (demo-grade, no database).
 *
 * SERVER-ONLY module: it imports `next/headers` and `node:crypto`, so it
 * must never be imported from a `"use client"` component. Client components
 * (login form, logout button) talk to the `/api/admin/*` endpoints instead.
 *
 * Credentials resolve from the environment first, with demo defaults:
 *   - `ADMIN_EMAIL`    (default `admin@techpulse.com`)
 *   - `ADMIN_PASSWORD` (default `AdminTechPulse2026!`)
 *   - `ADMIN_SESSION_SECRET` (default: `AUTH_SECRET`, then a dev fallback —
 *     set a real secret in production so session signatures cannot be forged)
 *
 * The session is a self-contained HMAC-signed token stored in the httpOnly
 * `techpulse_admin_session` cookie (7 days, `SameSite=Lax`, `Secure` in
 * production). No JavaScript can read it, which keeps the token out of reach
 * of XSS payloads. Promoting this gate to production means replacing the
 * single shared credential with per-admin hashed passwords in the
 * application database (see the adapter recipe in `src/auth.ts`).
 */

export const ADMIN_SESSION_COOKIE = "techpulse_admin_session";

export const ADMIN_SESSION_TTL_SECONDS = 7 * 24 * 60 * 60;

function getAdminEmail(): string {
  return (process.env.ADMIN_EMAIL ?? "admin@techpulse.com").trim().toLowerCase();
}

function getAdminPassword(): string {
  return process.env.ADMIN_PASSWORD ?? "AdminTechPulse2026!";
}

function getAdminSecret(): string {
  return (
    process.env.ADMIN_SESSION_SECRET ??
    process.env.AUTH_SECRET ??
    "techpulse-admin-dev-secret-change-me"
  );
}

function timingSafeStringEqual(candidate: string, expected: string): boolean {
  const a = Buffer.from(candidate);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

/**
 * Checks the submitted credentials against the configured admin identity.
 * Email comparison is case-insensitive and trimmed; the password comparison
 * is exact. Both comparisons are constant-time so a wrong email does not
 * answer faster than a wrong password.
 */
export function verifyAdminCredentials(email: string, password: string): boolean {
  const emailOk = timingSafeStringEqual(
    (email ?? "").trim().toLowerCase(),
    getAdminEmail()
  );
  const passwordOk = timingSafeStringEqual(password ?? "", getAdminPassword());
  return emailOk && passwordOk;
}

function signPayload(payload: string): string {
  return createHmac("sha256", getAdminSecret()).update(payload).digest("hex");
}

function createAdminSessionToken(email: string): string {
  const expiresAt = Date.now() + ADMIN_SESSION_TTL_SECONDS * 1000;
  const payload = `${email.trim().toLowerCase()}:${expiresAt}`;
  return `${Buffer.from(payload).toString("base64url")}.${signPayload(payload)}`;
}

function verifyAdminSessionToken(value: string | undefined | null): boolean {
  if (!value) return false;
  const dot = value.lastIndexOf(".");
  if (dot <= 0) return false;
  const encoded = value.slice(0, dot);
  const signature = value.slice(dot + 1);
  let payload: string;
  try {
    payload = Buffer.from(encoded, "base64url").toString("utf8");
  } catch {
    return false;
  }
  const expected = signPayload(payload);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return false;
  const separator = payload.lastIndexOf(":");
  if (separator <= 0) return false;
  const expiresAt = Number(payload.slice(separator + 1));
  if (!Number.isFinite(expiresAt) || Date.now() > expiresAt) return false;
  return payload.slice(0, separator).toLowerCase() === getAdminEmail();
}

/** Server check used by the dashboard, the login page and the session API. */
export async function isAdminLoggedIn(): Promise<boolean> {
  const store = await cookies();
  return verifyAdminSessionToken(store.get(ADMIN_SESSION_COOKIE)?.value);
}

/**
 * Mints the session cookie on a route-handler response (login route).
 * Takes the response object because cookies can only be written where a
 * `NextResponse` is available — never during a page render.
 */
export function setAdminSession(response: NextResponse, email: string): void {
  response.cookies.set(ADMIN_SESSION_COOKIE, createAdminSessionToken(email), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: ADMIN_SESSION_TTL_SECONDS,
  });
}

/**
 * Clears the session cookie — on the logout route response when provided,
 * otherwise through the cookie store (server actions).
 */
export async function clearAdminSession(response?: NextResponse): Promise<void> {
  if (response) {
    response.cookies.delete(ADMIN_SESSION_COOKIE);
    return;
  }
  const store = await cookies();
  store.delete(ADMIN_SESSION_COOKIE);
}
