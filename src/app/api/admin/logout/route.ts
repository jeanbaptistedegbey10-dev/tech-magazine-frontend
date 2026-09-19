import { NextResponse } from "next/server";

import { clearAdminSession } from "@/lib/admin-auth";

/**
 * Admin sign-out — `POST /api/admin/logout`.
 *
 * Deletes the `techpulse_admin_session` cookie and answers
 * `{ ok: true, redirect: "/admin/login" }` for the client to follow.
 * Always succeeds, even without a session, so a stale logout button can
 * never leave the reader stuck.
 */
export async function POST() {
  const response = NextResponse.json(
    { ok: true, redirect: "/admin/login" },
    { status: 200 }
  );
  await clearAdminSession(response);
  return response;
}
