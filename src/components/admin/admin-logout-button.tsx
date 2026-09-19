"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, LogOut } from "lucide-react";

/**
 * Secure sign-out action for the admin dashboard header — calls
 * `POST /api/admin/logout` (which deletes the httpOnly session cookie),
 * then lands on the admin login page. Never touches the cookie directly:
 * it is httpOnly, so only the server can clear it.
 */
export function AdminLogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    if (loading) return;
    setLoading(true);
    try {
      await fetch("/api/admin/logout", {
        method: "POST",
        credentials: "same-origin",
      });
    } catch {
      // The session cookie stays server-side; navigate to the login page
      // regardless so a network failure cannot trap the admin.
    } finally {
      router.push("/admin/login");
      router.refresh();
    }
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loading}
      className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-sm font-medium text-foreground transition-colors duration-300 hover:border-primary/60 hover:text-link disabled:cursor-not-allowed disabled:opacity-70 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
    >
      {loading ? (
        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
      ) : (
        <LogOut className="size-4" aria-hidden="true" />
      )}
      {loading ? "Déconnexion…" : "Déconnexion"}
    </button>
  );
}
