"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { IconArrowRight } from "@/components/portal/Icons";

/**
 * ONE-TAP ENTRY INTO EITHER PORTAL.
 *
 * Nobody should be typing a password into a laptop while the chef watches over
 * their shoulder. Two buttons, each one naming whose portal it opens, and the
 * demo is one tap away.
 *
 * The assistant's button says "Assistant Portal" rather than a name on purpose
 * — we have not been given hers yet, and inventing one on a screen the chef is
 * looking at would be worse than leaving it generic.
 *
 * Both call /api/portal/demo-login, which issues exactly the same signed
 * session cookie the real form issues. Nothing downstream knows the difference,
 * so what the chef sees is the real portal with real role gating, not a
 * preview.
 */

interface Role {
  role: "owner" | "assistant";
  label: string;
  detail: string;
}

const ROLES: Role[] = [
  {
    role: "owner",
    label: "Chef R. Kearse — Owner Portal",
    detail: "The whole business: enquiries, events, money, marketing, settings",
  },
  {
    role: "assistant",
    label: "Assistant Portal",
    detail: "The day's work: who to chase, what to book, what to prepare",
  },
];

export default function DemoEntry() {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function enter(role: Role["role"]) {
    setBusy(role);
    setError(null);
    try {
      const res = await fetch("/api/portal/demo-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        setError(data.error ?? "Could not open that portal.");
        setBusy(null);
        return;
      }
      // Replace, not push — nobody should land back on the sign-in screen by
      // hitting back while presenting.
      router.replace("/portal");
      router.refresh();
    } catch {
      setError("Could not reach the server. Check the site is running.");
      setBusy(null);
    }
  }

  return (
    <div>
      <ul className="space-y-3">
        {ROLES.map((r) => (
          <li key={r.role}>
            <button
              type="button"
              onClick={() => enter(r.role)}
              disabled={busy !== null}
              className="p-demo-entry"
            >
              <span className="min-w-0 flex-1 text-left">
                <span className="p-demo-entry-label">
                  {busy === r.role ? "Opening…" : r.label}
                </span>
                <span className="p-demo-entry-detail">{r.detail}</span>
              </span>
              <IconArrowRight className="h-5 w-5 shrink-0" />
            </button>
          </li>
        ))}
      </ul>

      {error ? (
        <p role="alert" className="p-bad mt-3 text-[0.8125rem]">
          {error}
        </p>
      ) : null}
    </div>
  );
}
