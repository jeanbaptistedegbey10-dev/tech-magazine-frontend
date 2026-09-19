import { handlers } from "@/auth";

/**
 * Auth.js catch-all route — `/api/auth/*`.
 *
 * Serves every Auth.js endpoint: `GET` for `session` (consumed by
 * `useSession()` in the client header), `signin`/`signout` pages and `GET` for
 * the OAuth callbacks (`/api/auth/callback/google`), `POST` for the
 * sign-in/sign-out form actions. The handlers come straight from the
 * `NextAuth()` call in `src/auth.ts`; nothing else is needed here.
 *
 * The route is dynamic by nature (it reads cookies and query params), so no
 * `revalidate`/`dynamic` export is required.
 */
export const { GET, POST } = handlers;

/**
 * Standalone auth helper re-exported for server-side checks inside this route
 * module (e.g. the mocked Stripe checkout below reads the session to decide
 * whether the reader is signed in). It resolves the session from the Auth.js
 * cookie the same way `auth()` does, without re-declaring the provider
 * configuration.
 */
export { auth } from "@/auth";
