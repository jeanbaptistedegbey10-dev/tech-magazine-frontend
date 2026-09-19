import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

/**
 * Auth.js (NextAuth v5) configuration — Google Sign-In, standalone.
 *
 * Sessions are JWT-based (`strategy: "jwt"` is the default when no database
 * adapter is configured): the signed session cookie lives entirely on the
 * reader's device, so this layer works with zero database. That is the
 * deliberate "autonomous" setup — a separate application database can be
 * attached later without touching any call site:
 *
 * 1. point `DATABASE_URL` at the new database (placeholder already in
 *    `.env.local`),
 * 2. install an adapter (`@auth/pg-adapter`, `@auth/drizzle-adapter`…),
 * 3. pass it here (`adapter: MyAdapter(pool)`) — Google profiles then persist
 *    into `users` / `accounts` / `sessions` tables and `auth()` gains
 *    database-backed lookups.
 *
 * Credentials come from `.env.local` (`AUTH_GOOGLE_ID` /
 * `AUTH_GOOGLE_SECRET`); the signing key is `AUTH_SECRET`. In the Google
 * Cloud Console the authorized redirect URI must be
 * `<origin>/api/auth/callback/google`.
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    /**
     * With no explicit `clientId`/`clientSecret`, the Google provider reads
     * `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` from the environment on its
     * own — the same variables Vercel will carry in production.
     */
    Google,
  ],
});
