"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { IconArrowRight, IconLock } from "@/components/portal/Icons";

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/portal/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = (await res.json()) as { ok: boolean; error?: string };
      if (!res.ok || !data.ok) {
        setError(data.error ?? "That did not work. Check the address and password.");
        setBusy(false);
        return;
      }
      // Refresh so the server layout picks up the new session cookie.
      router.replace("/portal");
      router.refresh();
    } catch {
      setError("Could not reach the server. Check your connection and try again.");
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate>
      <div>
        <label htmlFor="email" className="p-title block">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="p-input mt-2"
          placeholder="you@chefrkearse.com"
        />
      </div>

      <div className="mt-4">
        <label htmlFor="password" className="p-title block">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="p-input mt-2"
          placeholder="••••••••"
        />
      </div>

      {error ? (
        <p role="alert" className="p-bad mt-4 text-sm">
          {error}
        </p>
      ) : null}

      <button type="submit" className="p-btn p-btn-primary mt-5 w-full" disabled={busy}>
        {busy ? "Signing in…" : "Sign in"}
        {busy ? null : <IconArrowRight className="h-4 w-4" />}
      </button>

      <p className="p-muted mt-4 flex items-start gap-2 text-[0.8125rem] leading-snug">
        <IconLock className="mt-px h-4 w-4 shrink-0" />
        <span>
          Sessions last eight hours — one long service day — and the cookie cannot be read
          by anything in the browser.
        </span>
      </p>
    </form>
  );
}
