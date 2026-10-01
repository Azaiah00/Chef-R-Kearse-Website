"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { ProspectStatus } from "@/lib/portal/lead-types";
import { STATUS_LABELS } from "./ProspectBoard";
import { Card } from "./Ui";

/**
 * The working controls on a prospect: where it has got to, when the next action
 * is due, who has it, and a note.
 *
 * Four separate small writes rather than one form with a Save button, because
 * this gets used mid-call — "mark it contacted, remind me Thursday" has to be two
 * taps, not a form submission.
 */
export default function ProspectActions({
  id,
  status,
  owner,
  nextActionBy,
  overdue,
}: {
  id: string;
  status: ProspectStatus;
  owner: string;
  nextActionBy: string | null;
  overdue: boolean;
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState("");

  async function send(body: Record<string, unknown>) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/portal/prospects/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setError(data.error ?? "That did not save.");
        setBusy(false);
        return false;
      }
      startTransition(() => router.refresh());
      setBusy(false);
      return true;
    } catch {
      setError("Could not reach the server.");
      setBusy(false);
      return false;
    }
  }

  return (
    <Card title="Update this">
      <div className="p-card-pad space-y-4">
        {error ? (
          <p className="p-bad text-sm" role="alert">
            {error}
          </p>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="p-title block" htmlFor="pa-status">
              Where it has got to
            </label>
            <select
              id="pa-status"
              className="p-select mt-1.5"
              value={status}
              disabled={busy}
              onChange={(e) => void send({ action: "status", status: e.target.value })}
            >
              {(Object.keys(STATUS_LABELS) as ProspectStatus[]).map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABELS[s]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="p-title block" htmlFor="pa-next">
              Do something by
            </label>
            <input
              id="pa-next"
              type="date"
              className="p-input mt-1.5"
              defaultValue={nextActionBy ?? ""}
              disabled={busy}
              onChange={(e) =>
                void send({ action: "nextAction", iso: e.target.value || null })
              }
            />
            {overdue ? (
              <p className="p-bad mt-1 text-[0.75rem]">This date has passed.</p>
            ) : (
              <p className="p-muted mt-1 text-[0.75rem] leading-snug">
                Anything past its date goes to the top of Monday&apos;s briefing.
              </p>
            )}
          </div>

          <div>
            <label className="p-title block" htmlFor="pa-owner">
              Who has it
            </label>
            <select
              id="pa-owner"
              className="p-select mt-1.5"
              value={owner}
              disabled={busy}
              onChange={(e) => void send({ action: "assign", owner: e.target.value })}
            >
              <option value="owner">Chef R. Kearse</option>
              <option value="assistant">Assistant</option>
              <option value="agent">Azaiah</option>
            </select>
          </div>
        </div>

        <div className="p-hairline pt-4">
          <label className="p-title block" htmlFor="pa-note">
            Add a note
          </label>
          <textarea
            id="pa-note"
            className="p-textarea mt-1.5"
            placeholder="What happened on the call?"
            value={note}
            disabled={busy}
            onChange={(e) => setNote(e.target.value)}
          />
          <button
            type="button"
            className="p-btn p-btn-sm p-btn-primary mt-2"
            disabled={busy || note.trim().length === 0}
            onClick={async () => {
              const okay = await send({ action: "note", body: note.trim() });
              if (okay) setNote("");
            }}
          >
            Save the note
          </button>
        </div>
      </div>
    </Card>
  );
}
