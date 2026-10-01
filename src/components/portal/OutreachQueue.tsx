"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { OutreachRecord, OutreachStatus } from "@/lib/portal/lead-types";
import { relativeTime } from "./Ui";

const STATUS_LABELS: Record<OutreachStatus, string> = {
  draft: "Written, not sent",
  approved: "Approved, not sent",
  sent: "Sent",
  replied: "They replied",
  "no-response": "No reply",
  closed: "Closed",
};

const BAND: Record<OutreachStatus, string> = {
  draft: "p-band-C",
  approved: "p-band-B",
  sent: "p-band-A",
  replied: "p-band-A",
  "no-response": "p-band-D",
  closed: "p-band-D",
};

/**
 * One row per letter, with the full text available and never truncated — if the
 * portal shortens a draft to look tidy, somebody approves a message they have
 * not actually read.
 */
export default function OutreachQueue({
  records,
  names,
}: {
  records: OutreachRecord[];
  /** prospectId → name, resolved on the server so this stays a dumb list. */
  names: Record<string, string>;
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function setStatus(id: string, status: OutreachStatus) {
    setBusy(id);
    setError(null);
    try {
      const res = await fetch("/api/portal/outreach", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setError(data.error ?? "That did not save.");
      } else {
        startTransition(() => router.refresh());
      }
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

      {records.map((o) => (
        <article key={o.id} className="p-card p-card-pad">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`p-badge ${BAND[o.status]}`}>{STATUS_LABELS[o.status]}</span>
            <Link
              href={`/portal/prospects/${o.prospectId}`}
              className="p-tap text-sm font-medium hover:text-[color:var(--color-accent-soft)]"
            >
              {names[o.prospectId] ?? "Unknown"}
            </Link>
            <span className="p-muted text-[0.75rem]">
              written {relativeTime(o.draftedISO)}
              {o.sentISO ? ` · sent ${relativeTime(o.sentISO)}` : ""}
            </span>
          </div>

          <p className="mt-2 text-sm font-medium">{o.subject}</p>

          <details className="mt-2">
            <summary className="p-link cursor-pointer">Read the whole thing</summary>
            <pre className="p-muted mt-2 text-[0.8125rem] leading-relaxed whitespace-pre-wrap font-[inherit]">
              {o.body}
            </pre>
          </details>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <select
              className="p-select !min-h-[40px] w-48"
              value={o.status}
              disabled={busy === o.id}
              aria-label={`Status of the message to ${names[o.prospectId] ?? "this prospect"}`}
              onChange={(e) => void setStatus(o.id, e.target.value as OutreachStatus)}
            >
              {(Object.keys(STATUS_LABELS) as OutreachStatus[]).map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABELS[s]}
                </option>
              ))}
            </select>
            <Link href={`/print/outreach/${o.id}`} className="p-btn p-btn-sm">
              Print
            </Link>
          </div>
        </article>
      ))}
    </div>
  );
}
