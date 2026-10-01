"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { VenueOurStatus } from "@/lib/portal/lead-types";

const LABELS: Record<VenueOurStatus, string> = {
  "not-applied": "Not asked yet",
  applied: "Asked — waiting",
  "on-list": "We are on the list",
  declined: "They said no",
};

/**
 * The one control on a venue card.
 *
 * Note what it does not send: a date. Moving to "asked" stamps the date on the
 * server, because when we asked is evidence, and evidence a browser can set is
 * not evidence.
 */
export default function VenueStatus({
  id,
  status,
  name,
}: {
  id: string;
  status: VenueOurStatus;
  name: string;
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div>
      <select
        className="p-select"
        value={status}
        disabled={busy}
        aria-label={`Where we stand with ${name}`}
        onChange={async (e) => {
          setBusy(true);
          setError(null);
          try {
            const res = await fetch(`/api/portal/venues/${id}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ action: "status", status: e.target.value }),
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
          setBusy(false);
        }}
      >
        {(Object.keys(LABELS) as VenueOurStatus[]).map((s) => (
          <option key={s} value={s}>
            {LABELS[s]}
          </option>
        ))}
      </select>
      {error ? (
        <p className="p-bad mt-1 text-[0.75rem]" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
