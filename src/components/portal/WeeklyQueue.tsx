"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { QueueItem } from "@/lib/portal/types";
import { Card, EmptyState } from "./Ui";
import { IconCheck, IconChevron, IconSpark } from "./Icons";

/**
 * This week's queue.
 *
 * Approve-before-send is the default and is not configurable in this build.
 * A marketing automation that emails a chef's own past clients without him
 * having read it is a liability, not a feature — one clumsy line in front of a
 * wedding client costs more than the campaign earns. So everything sits here
 * until he taps approve.
 */
export default function WeeklyQueue({
  items,
  campaigns,
  weekOf,
}: {
  items: QueueItem[];
  campaigns: { id: string; name: string }[];
  weekOf: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [busy, setBusy] = useState<string | null>(null);
  const [open, setOpen] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const nameFor = (id: string) => campaigns.find((c) => c.id === id)?.name ?? id;

  async function act(body: Record<string, unknown>, key: string) {
    setBusy(key);
    setError(null);
    try {
      const res = await fetch("/api/portal/marketing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setError(data.error ?? "That did not save.");
        setBusy(null);
        return;
      }
      startTransition(() => router.refresh());
      setBusy(null);
    } catch {
      setError("Could not reach the server.");
      setBusy(null);
    }
  }

  const weekLabel = new Date(`${weekOf}T12:00:00Z`).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });

  const awaiting = items.filter((i) => i.status === "proposed").length;

  return (
    <Card
      title={`Week of ${weekLabel}`}
      action={
        <div className="flex items-center gap-2">
          {awaiting > 0 ? <span className="p-badge p-warn">{awaiting} awaiting you</span> : null}
          <button
            type="button"
            className="p-btn p-btn-sm"
            disabled={busy !== null || pending}
            onClick={() => act({ action: "regenerate", weekOf }, "regen")}
          >
            <IconSpark className="h-4 w-4" />
            {busy === "regen" ? "Rebuilding…" : "Rebuild the queue"}
          </button>
        </div>
      }
    >
      {items.length === 0 ? (
        <EmptyState
          title="Nothing queued this week."
          body="No rule fired. Rebuild the queue to run them again, or wait for Monday."
        />
      ) : (
        <ul className="divide-y divide-[color:var(--color-line-dark)]">
          {items.map((item) => {
            const isOpen = open === item.id;
            return (
              <li key={item.id}>
                <div className="px-5 py-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-[0.9375rem] font-medium">{item.title}</p>
                        <span className="p-badge p-muted">{item.channel}</span>
                        <span
                          className={`p-badge ${
                            item.status === "approved"
                              ? "p-ok"
                              : item.status === "sent"
                                ? "p-ok"
                                : item.status === "skipped"
                                  ? "p-muted"
                                  : "p-warn"
                          }`}
                        >
                          {item.status === "proposed" ? "awaiting you" : item.status}
                        </span>
                      </div>
                      <p className="p-muted mt-1 text-[0.8125rem]">
                        {nameFor(item.campaignId)} ·{" "}
                        {new Date(item.scheduledFor).toLocaleDateString("en-US", {
                          weekday: "long",
                          month: "short",
                          day: "numeric",
                          timeZone: "UTC",
                        })}{" "}
                        at{" "}
                        {new Date(item.scheduledFor).toLocaleTimeString("en-US", {
                          hour: "numeric",
                          minute: "2-digit",
                          timeZone: "UTC",
                        })}
                        {item.audienceCount > 0 ? ` · ${item.audienceCount} recipients` : ""}
                      </p>
                    </div>

                    <div className="flex shrink-0 flex-wrap gap-2">
                      {item.status === "proposed" ? (
                        <>
                          <button
                            type="button"
                            className="p-btn p-btn-sm p-btn-primary"
                            disabled={busy !== null || pending}
                            onClick={() => act({ action: "status", id: item.id, status: "approved" }, item.id)}
                          >
                            <IconCheck className="h-4 w-4" />
                            Approve
                          </button>
                          <button
                            type="button"
                            className="p-btn p-btn-sm"
                            disabled={busy !== null || pending}
                            onClick={() => act({ action: "status", id: item.id, status: "skipped" }, item.id)}
                          >
                            Skip
                          </button>
                        </>
                      ) : item.status === "approved" ? (
                        <button
                          type="button"
                          className="p-btn p-btn-sm"
                          disabled={busy !== null || pending}
                          onClick={() => act({ action: "status", id: item.id, status: "proposed" }, item.id)}
                        >
                          Un-approve
                        </button>
                      ) : item.status === "skipped" ? (
                        <button
                          type="button"
                          className="p-btn p-btn-sm"
                          disabled={busy !== null || pending}
                          onClick={() => act({ action: "status", id: item.id, status: "proposed" }, item.id)}
                        >
                          Put it back
                        </button>
                      ) : null}
                      <button
                        type="button"
                        className="p-btn p-btn-sm"
                        aria-expanded={isOpen}
                        onClick={() => setOpen(isOpen ? null : item.id)}
                      >
                        {isOpen ? "Hide" : "Read it"}
                        <IconChevron
                          className={`h-4 w-4 transition-transform ${isOpen ? "rotate-90" : ""}`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* The rule that put it here. Always visible. */}
                  <p className="p-muted mt-2.5 flex items-start gap-2 text-[0.8125rem] leading-snug">
                    <IconSpark className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    <span>{item.rationale}</span>
                  </p>

                  {isOpen ? (
                    <div className="p-hairline mt-4 pt-4">
                      <p className="p-title">
                        {item.channel === "email" ? "Subject line" : "Opening line"}
                      </p>
                      <p className="t-serif-italic mt-1.5 text-lg leading-snug">{item.preview}</p>
                      <p className="p-title mt-4">What goes out</p>
                      <p className="mt-1.5 text-[0.875rem] leading-relaxed">{item.body}</p>
                      <p className="p-muted mt-3 text-[0.75rem] leading-snug">
                        The finished creative for this campaign — the full HTML email, the ad brief,
                        the captions — is in the campaign list below, ready to download.
                      </p>
                    </div>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {error ? (
        <p role="alert" className="p-card-pad p-bad p-hairline text-[0.8125rem]">
          {error}
        </p>
      ) : null}

      <p className="p-card-pad p-hairline p-muted text-[0.75rem] leading-relaxed">
        Nothing here sends on its own. Approving marks it ready — actual delivery starts once an
        email platform and an SMS number are connected, with opt-out handling and quiet hours in
        place. In this demo, approving simply records the decision.
      </p>
    </Card>
  );
}
