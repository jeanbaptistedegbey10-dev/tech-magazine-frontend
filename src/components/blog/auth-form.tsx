"use client";

import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2, Lock } from "lucide-react";
import { signIn } from "next-auth/react";

type AuthMode = "login" | "register";
type AuthStatus = "idle" | "sending" | "sent";

const FIELD_LABEL = "mb-1.5 block text-sm font-medium text-foreground";
const AUTH_INPUT = "w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 transition-colors duration-300 outline-none focus:border-primary/70 focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-60";
const SIMULATED_AUTH_MS = 1200;

/**
 * Official four-colour Google "G" mark. `lucide-react` ships no brand
 * glyphs, so the identity asset is inlined as an SVG — same approach as the
 * wordmark pills in `share-buttons.tsx`.
 */
function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

export function AuthForm({ mode, callbackUrl }: { mode: AuthMode; callbackUrl?: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<AuthStatus>("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isRegister = mode === "register";
  const sending = status === "sending";
  const sent = status === "sent";
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleError, setGoogleError] = useState(false);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (sending || sent) return;
    setStatus("sending");
    timer.current = setTimeout(() => setStatus("sent"), SIMULATED_AUTH_MS);
  }

  /**
   * Real Google Sign-In through the Auth.js client SDK: hands off to the
   * hosted Google consent screen and lands back on the home page via
   * `/api/auth/callback/google`. Failures (bad credentials, unreachable
   * route handler) surface as the inline alert under the button.
   */
  async function handleGoogle() {
    if (googleLoading || sending || sent) return;
    setGoogleLoading(true);
    setGoogleError(false);
    try {
      await signIn("google", { callbackUrl: callbackUrl || "/" });
    } catch {
      setGoogleLoading(false);
      setGoogleError(true);
    }
  }

  if (sent) {
    return (
      <div role="status" className="flex flex-col items-center gap-4 rounded-3xl border border-border bg-card px-6 py-14 text-center">
        <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/15 text-link">
          <CheckCircle2 className="size-5" aria-hidden="true" />
        </span>
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">
          {isRegister ? "Compte cree, bienvenue" : "Bon retour parmi nous"}
        </h2>
        <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
          Connecte en tant que <span className="text-foreground">{email}</span> (simulation locale, rien ne quitte votre navigateur).
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button type="button" onClick={() => router.back()} className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-colors duration-300 hover:bg-primary/85">
            Retour a la lecture
          </button>
          <Link href="/subscribe" className="inline-flex items-center justify-center gap-2 rounded-full border border-border px-6 py-2.5 text-sm font-medium text-foreground transition-colors duration-300 hover:border-primary/60">
            Decouvrir Premium
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 rounded-3xl border border-border bg-card p-6 sm:p-8">
      <div className="flex items-center gap-3">
        <span className="flex size-10 items-center justify-center rounded-xl bg-primary/15 text-link">
          <Lock className="size-4" aria-hidden="true" />
        </span>
        <p className="text-xs leading-relaxed text-muted-foreground">
          E-mail + mot de passe : simulation locale. Google : connexion réelle
          via Auth.js.
        </p>
      </div>
      {isRegister ? (
        <div>
          <label htmlFor="auth-name" className={FIELD_LABEL}>Nom complet</label>
          <input id="auth-name" name="name" type="text" autoComplete="name" required minLength={2} maxLength={80} disabled={sending} placeholder="Ada Lovelace" className={AUTH_INPUT} />
        </div>
      ) : null}
      <div>
        <label htmlFor="auth-email" className={FIELD_LABEL}>Email</label>
        <input id="auth-email" name="email" type="email" autoComplete="email" required maxLength={120} disabled={sending} placeholder="ada@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className={AUTH_INPUT} />
      </div>
      <div>
        <label htmlFor="auth-password" className={FIELD_LABEL}>Mot de passe</label>
        <input id="auth-password" name="password" type="password" autoComplete={isRegister ? "new-password" : "current-password"} required minLength={8} maxLength={128} disabled={sending} placeholder="8 caracteres minimum" value={password} onChange={(e) => setPassword(e.target.value)} className={AUTH_INPUT} />
      </div>
      <button type="submit" disabled={sending} className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors duration-300 hover:bg-primary/85 disabled:cursor-wait disabled:opacity-80">
        {sending ? (<><Loader2 className="size-4 animate-spin" aria-hidden="true" />{isRegister ? "Creation du compte..." : "Connexion..."}</>) : isRegister ? "Creer mon compte" : "Se connecter"}
      </button>
      <div role="separator" aria-label="ou" className="flex items-center gap-3">
        <span className="h-px flex-1 bg-border" aria-hidden="true" />
        <span className="text-[0.65rem] font-semibold tracking-[0.2em] text-muted-foreground uppercase">
          ou
        </span>
        <span className="h-px flex-1 bg-border" aria-hidden="true" />
      </div>
      <button
        type="button"
        onClick={handleGoogle}
        disabled={googleLoading || sending}
        className="inline-flex items-center justify-center gap-2.5 rounded-full border border-border bg-surface px-6 py-3 text-sm font-semibold text-foreground transition-colors duration-300 hover:border-primary/60 hover:bg-primary/10 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none disabled:cursor-wait disabled:opacity-80"
      >
        {googleLoading ? (
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        ) : (
          <GoogleIcon />
        )}
        Continuer avec Google
      </button>
      {googleError ? (
        <p
          role="alert"
          className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-2.5 text-center text-sm leading-relaxed text-red-300"
        >
          La connexion Google a échoué. Vérifiez la configuration Auth.js
          (AUTH_GOOGLE_ID / AUTH_GOOGLE_SECRET) puis réessayez.
        </p>
      ) : null}
      <p className="text-center text-sm text-muted-foreground">
        {isRegister ? (<>Deja abonne ? <Link href="/login" className="font-medium text-link hover:text-foreground">Se connecter</Link></>) : (<>Pas encore de compte ? <Link href="/register" className="font-medium text-link hover:text-foreground">Creer un compte</Link></>)}
      </p>
    </form>
  );
}
