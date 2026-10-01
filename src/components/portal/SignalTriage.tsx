"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { Signal } from "@/lib/portal/lead-types";
import { relativeTime } from "./Ui";
import { IconCheck, IconTrash } from "./Icons";

/**
 * Triage. Two taps per item, and the dismissal asks why.
 *
 * The reason box is required and it is not bureaucracy: a dismissal with a reason
 * is how the keyword rules in feed-rules.ts get better, and an unexplained one
 * teaches nothing and comes back next week. It is also the only place the people
 * using this ever tell the engine it is wrong, which makes it the most valuable
 * text box in the portal.
 */
export default function SignalTriage({ signals }: { signals: Signal[] }) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dismissing, setDismissing] = useState<string | null>(null);
  const [reason, setReason] = useState("");

  async function act(body: Record<string, unknown>, id: string) {
    setBusy(id);
    setError(null);
    try {
      const res = await fetch("/api/portal/signals", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setError(data.error ?? "That did not save.");
        setBusy(null);
        return;
      }
      setDismissing(null);
      setReason("");
      startTransition(() => router.refresh());
    } catch {
      setError("Could not reach the server.");
    }
    setBusy(null);
  }

  return (
    <div className="space-y-3">
      {error ? (
        <p className="p-bad text-sm" role="alert">
          {error}
        </p>
      ) : null}

      {signals.map((s) => (
        <article key={s.id} className="p-card p-card-pad">
          <div className="flex flex-wrap items-center gap-2">
            <span className="p-badge p-band-D">{s.source}</span>
            <span className="p-muted text-[0.75rem]">{relativeTime(s.publishedISO)}</span>
          </div>

          <a
            href={s.url}
            target="_blank"
            rel="noreferrer noopener"
            className="p-tap mt-2 text-sm leading-snug font-medium hover:text-[color:var(--color-accent-soft)]"
          >
            {s.title}
          </a>

          {/* Why it surfaced. Without this the queue is a list of headlines with
              no explanation, and nobody can tell a good rule from a noisy one. */}
          <p className="p-muted mt-1.5 text-[0.75rem]">
            Caught because it mentions:{" "}
            {s.matchedRules.map((r) => (
              <span key={r} className="p-badge p-band-C mr-1">
                {r.replace(/-/g, " ")}
              </span>
            ))}
          </p>

          {dismissing === s.id ? (
            <div className="mt-3">
              <label className="p-title block" htmlFor={`why-${s.id}`}>
                Why is this not worth chasing?
              </label>
              <input
                id={`why-${s.id}`}
                className="p-input mt-1.5"
                placeholder="Too far away. Wrong kind of business. Already have a caterer."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
              <p className="p-muted mt-1 text-[0.75rem] leading-snug">
                A few words is plenty. It is how the search learns what to stop sending you.
              </p>
              <div className="mt-2 flex gap-2">
                <button
                  type="button"
                  className="p-btn p-btn-sm p-btn-primary"
                  disabled={busy === s.id || reason.trim().length === 0}
                  onClick={() => void act({ action: "dismiss", id: s.id, reason: reason.trim() }, s.id)}
                >
                  Drop it
                </button>
                <button
                  type="button"
                  className="p-btn p-btn-sm"
                  onClick={() => {
                    setDismissing(null);
                    setReason("");
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                className="p-btn p-btn-sm p-btn-primary"
                disabled={busy === s.id}
                onClick={() => void act({ action: "promote", id: s.id }, s.id)}
              >
                <IconCheck className="h-4 w-4" />
                Worth a look
              </button>
              <button
                type="button"
                className="p-btn p-btn-sm"
                disabled={busy === s.id}
                onClick={() => setDismissing(s.id)}
              >
                <IconTrash className="h-4 w-4" />
                Not for us
              </button>
            </div>
          )}
        </article>
      ))}
    </div>
  );
}
