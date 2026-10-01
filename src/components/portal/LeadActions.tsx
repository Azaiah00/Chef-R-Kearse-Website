"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { ScoreBand, Stage } from "@/lib/portal/types";
import { STAGE_LABELS, STAGE_ORDER } from "@/lib/portal/scoring";
import { Card } from "./Ui";
import { IconArrowRight, IconSpark } from "./Icons";

export default function LeadActions({
  leadId,
  stage,
  band,
  canOverride,
  actorName,
}: {
  leadId: string;
  stage: Stage;
  band: ScoreBand;
  canOverride: boolean;
  actorName: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [busy, setBusy] = useState(false);
  const [showOverride, setShowOverride] = useState(false);
  const [overrideBand, setOverrideBand] = useState<ScoreBand>(band);
  const [overrideReason, setOverrideReason] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function post(action: string, payload: Record<string, unknown> = {}) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/portal/leads/${leadId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, actor: actorName, ...payload }),
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

  const idx = STAGE_ORDER.indexOf(stage);
  const nextStage = idx >= 0 && idx < STAGE_ORDER.length - 1 ? STAGE_ORDER[idx + 1] : null;
  const disabled = busy || pending;

  return (
    <Card title="Move it along">
      <div className="p-card-pad space-y-3">
        {nextStage ? (
          <button
            type="button"
            className="p-btn p-btn-primary w-full"
            disabled={disabled}
            onClick={() => post("stage", { stage: nextStage })}
          >
            Move to {STAGE_LABELS[nextStage]}
            <IconArrowRight className="h-4 w-4" />
          </button>
        ) : null}

        <div>
          <label htmlFor="stage-select" className="p-title block">
            Or set the stage
          </label>
          <select
            id="stage-select"
            className="p-select mt-2"
            value={stage}
            disabled={disabled}
            onChange={(e) => post("stage", { stage: e.target.value })}
          >
            {STAGE_ORDER.map((s) => (
              <option key={s} value={s}>
                {STAGE_LABELS[s]}
              </option>
            ))}
            <option value="lost">Closed</option>
          </select>
        </div>

        <div className="p-hairline pt-3">
          <label htmlFor="lead-note" className="p-title block">
            Add a note
          </label>
          <textarea
            id="lead-note"
            className="p-textarea mt-2"
            rows={3}
            value={note}
            disabled={disabled}
            placeholder="Anything worth remembering next time you speak to them."
            onChange={(e) => setNote(e.target.value)}
          />
          <button
            type="button"
            className="p-btn p-btn-sm mt-2 w-full"
            disabled={disabled || note.trim().length === 0}
            onClick={async () => {
              const ok = await post("note", { body: note.trim() });
              if (ok) setNote("");
            }}
          >
            Save the note
          </button>
        </div>

        {/*
          The override is owner-only and deliberately requires a reason. The
          engine advises; he decides. Recording why he disagreed is what makes
          retuning the weights possible later instead of guesswork.
        */}
        {canOverride ? (
          <div className="p-hairline pt-3">
            {showOverride ? (
              <div className="space-y-2">
                <label htmlFor="band-select" className="p-title block">
                  Set the band by hand
                </label>
                <select
                  id="band-select"
                  className="p-select"
                  value={overrideBand}
                  disabled={disabled}
                  onChange={(e) => setOverrideBand(e.target.value as ScoreBand)}
                >
                  {(["A", "B", "C", "D"] as const).map((b) => (
                    <option key={b} value={b}>
                      Band {b}
                    </option>
                  ))}
                </select>
                <label htmlFor="override-reason" className="p-title block pt-1">
                  Why
                </label>
                <textarea
                  id="override-reason"
                  className="p-textarea"
                  rows={2}
                  value={overrideReason}
                  disabled={disabled}
                  placeholder="What the engine could not see."
                  onChange={(e) => setOverrideReason(e.target.value)}
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="p-btn p-btn-sm flex-1"
                    disabled={disabled || overrideReason.trim().length === 0}
                    onClick={async () => {
                      const ok = await post("override", {
                        band: overrideBand,
                        reason: overrideReason.trim(),
                      });
                      if (ok) {
                        setOverrideReason("");
                        setShowOverride(false);
                      }
                    }}
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    className="p-btn p-btn-sm"
                    onClick={() => setShowOverride(false)}
                  >
                    Cancel
                  </button>
                </div>
                <p className="p-muted text-[0.75rem] leading-snug">
                  Both the computed band and yours stay on the record, so the weights can be
                  retuned later against where you disagreed.
                </p>
              </div>
            ) : (
              <button
                type="button"
                className="p-btn p-btn-sm w-full"
                onClick={() => setShowOverride(true)}
              >
                <IconSpark className="h-4 w-4" />
                Disagree with the score
              </button>
            )}
          </div>
        ) : null}

        {error ? (
          <p role="alert" className="p-bad text-[0.8125rem]">
            {error}
          </p>
        ) : null}
      </div>
    </Card>
  );
}
