import { NextRequest, NextResponse } from "next/server";

import { setAdminSession, verifyAdminCredentials } from "@/lib/admin-auth";

/**
 * Admin sign-in — `POST /api/admin/login` with `{ email, password }`.
 *
 * On success mints the httpOnly `techpulse_admin_session` cookie and answers
 * `{ ok: true, redirect: "/admin/dashboard" }` for the client to follow.
 * On failure answers 401 with an explicit message. A short delay keeps a
 * wrong email and a wrong password indistinguishable by timing, and the
 * response never reveals which field was incorrect.
 */
export async function POST(request: NextRequest) {
  let email = "";
  let password = "";
  try {
    const body: unknown = await request.json();
    if (body && typeof body === "object") {
      const record = body as Record<string, unknown>;
      if (typeof record.email === "string") email = record.email;
      if (typeof record.password === "string") password = record.password;
    }
  } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  await new Promise((resolve) => setTimeout(resolve, 400));

  if (!verifyAdminCredentials(email, password)) {
    return NextResponse.json(
      { error: "Identifiants incorrects. Vérifiez l'e-mail et le mot de passe." },
      { status: 401 }
    );
  }

  const response = NextResponse.json(
    { ok: true, redirect: "/admin/dashboard" },
    { status: 200 }
  );
  setAdminSession(response, email);
  return response;
}
