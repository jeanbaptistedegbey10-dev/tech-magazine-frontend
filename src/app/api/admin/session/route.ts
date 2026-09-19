import { NextResponse } from "next/server";

import { isAdminLoggedIn } from "@/lib/admin-auth";

/**
 * Admin session probe — `GET /api/admin/session`.
 *
 * Lets client components know whether the admin gate is open without ever
 * exposing the session token (the cookie is httpOnly). Never throws: any
 * unexpected failure answers unauthenticated instead of crashing the caller.
 */
export async function GET() {
  try {
    const authenticated = await isAdminLoggedIn();
    return NextResponse.json({ authenticated }, { status: 200 });
  } catch {
    return NextResponse.json({ authenticated: false }, { status: 200 });
  }
}
