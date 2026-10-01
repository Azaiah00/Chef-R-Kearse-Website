"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import type { EventType, ScoreBand, Stage } from "@/lib/portal/types";
import { EVENT_TYPE_LABELS, STAGE_LABELS, STAGE_ORDER } from "@/lib/portal/scoring";
import { money, shortDate } from "./Ui";
import { IconArrowRight, IconChevron, IconTrash } from "./Icons";

/**
 * THE PIPELINE BOARD — drag a card, everything else follows.
 *
 * Moving a card writes through the same `setStage` the rest of the portal uses,
 * so one drag updates every derived view at once: the chef's "needs you" queue,
 * the deposit chases on the assistant's desk, the upcoming-events flags, the
 * qualification funnel, the calendar, and the loss reporting. Nothing is
 * duplicated anywhere, so nothing can disagree.
 *
 * ── WHY THIS IS HAND-ROLLED ─────────────────────────────────────────────────
 * Two reasons, and both matter more than the convenience of a library.
 *
 * HTML5 drag-and-drop does not fire on touch, and this portal gets used on a
 * phone at a host stand. Pointer Events cover mouse, touch and pen with one
 * code path, so the board behaves the same in a kitchen as on a desk.
 *
 * And a drag-only interface is unusable without a mouse. Every card therefore
 * carries a real stage <select> that does exactly what the drag does. That is
 * not a fallback bolted on afterwards — it is the path a keyboard or screen
 * reader takes, and the drag is the shortcut for everyone else.
 *
 * ── OPTIMISTIC, THEN RECONCILED ─────────────────────────────────────────────
 * The card moves the instant it is dropped, because waiting on a round trip
 * makes a board feel broken. The write follows; if it fails the card springs
 * back and says why.
 */

/**
 * Exactly what a card draws, and nothing else.
 *
 * This is a client component, so whatever it receives as props is serialised
 * into the payload the browser downloads — rendered or not. Handing it whole
 * Lead objects put `bookedValue` in the assistant's HTML even though her cards
 * never showed it, which is precisely the leak the financial gate exists to
 * prevent. The page builds these on the server and omits the money entirely
 * when she is not allowed it, so there is nothing to find in view-source.
 */
export interface BoardLead {
  id: string;
  ref: string;
  name: string;
  stage: Stage;
  eventType: EventType;
  eventDate: string | null;
  guestCount: number;
  band: ScoreBand;
  lostReason: string | null;
  /** Present only when the viewer may see financials. */
  value?: { amount: number; booked: boolean } | null;
}

interface Props {
  leads: BoardLead[];
  canRemove: boolean;
}

type Ghost = {
  id: string;
  name: string;
  x: number;
  y: number;
  offsetX: number;
  offsetY: number;
};

export default function PipelineBoard({ leads, canRemove }: Props) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  /** Local stage overrides applied optimistically, keyed by lead id. */
  const [moved, setMoved] = useState<Record<string, Stage>>({});
  const [ghost, setGhost] = useState<Ghost | null>(null);
  const [overStage, setOverStage] = useState<Stage | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirmRemove, setConfirmRemove] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState("");

  const columnRefs = useRef<Partial<Record<Stage, HTMLElement | null>>>({});
  const dragging = useRef<{ id: string; from: Stage; pointerId: number } | null>(null);

  // Clear optimistic overrides once the server data catches up with them.
  useEffect(() => {
    setMoved((prev) => {
      if (Object.keys(prev).length === 0) return prev;
      const next: Record<string, Stage> = {};
      for (const [id, stage] of Object.entries(prev)) {
        const lead = leads.find((l) => l.id === id);
        if (lead && lead.stage !== stage) next[id] = stage;
      }
      return Object.keys(next).length === Object.keys(prev).length ? prev : next;
    });
  }, [leads]);

  const stageOf = useCallback(
    (lead: BoardLead): Stage => moved[lead.id] ?? lead.stage,
    [moved],
  );

  async function commitStage(id: string, from: Stage, to: Stage) {
    if (from === to) return;
    setMoved((m) => ({ ...m, [id]: to }));
    setBusyId(id);
    setError(null);
    setAnnouncement(`Moved to ${STAGE_LABELS[to]}`);
    try {
      const res = await fetch(`/api/portal/leads/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "stage", actor: "portal", stage: to }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setMoved((m) => {
          const next = { ...m };
          delete next[id];
          return next;
        });
        setError(data.error ?? "That move did not save.");
        setAnnouncement("That move did not save");
        setBusyId(null);
        return;
      }
      startTransition(() => router.refresh());
    } catch {
      setMoved((m) => {
        const next = { ...m };
        delete next[id];
        return next;
      });
      setError("Could not reach the server.");
      setAnnouncement("That move did not save");
    }
    setBusyId(null);
  }

  async function remove(id: string, name: string) {
    setBusyId(id);
    setError(null);
    try {
      const res = await fetch("/api/portal/leads", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setError(data.error ?? "Could not remove that.");
        setBusyId(null);
        return;
      }
      setAnnouncement(`${name} removed`);
      setConfirmRemove(null);
      startTransition(() => router.refresh());
    } catch {
      setError("Could not reach the server.");
    }
    setBusyId(null);
  }

  /* ── Pointer dragging ───────────────────────────────────────────────────── */

  function stageUnderPoint(x: number, y: number): Stage | null {
    for (const stage of STAGE_ORDER) {
      const el = columnRefs.current[stage];
      if (!el) continue;
      const r = el.getBoundingClientRect();
      if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) return stage;
    }
    return null;
  }

  function onPointerDown(e: React.PointerEvent, lead: BoardLead) {
    // Left button or touch only, and never from inside a control.
    if (e.button !== 0) return;
    const target = e.target as HTMLElement;
    if (target.closest("a, button, select")) return;

    const card = e.currentTarget as HTMLElement;
    const r = card.getBoundingClientRect();
    dragging.current = { id: lead.id, from: stageOf(lead), pointerId: e.pointerId };
    card.setPointerCapture(e.pointerId);
    setGhost({
      id: lead.id,
      name: lead.name,
      x: e.clientX,
      y: e.clientY,
      offsetX: e.clientX - r.left,
      offsetY: e.clientY - r.top,
    });
    setAnnouncement(`Picked up ${lead.name}`);
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!dragging.current || dragging.current.pointerId !== e.pointerId) return;
    e.preventDefault();
    setGhost((g) => (g ? { ...g, x: e.clientX, y: e.clientY } : g));
    setOverStage(stageUnderPoint(e.clientX, e.clientY));
  }

  function onPointerUp(e: React.PointerEvent) {
    const drag = dragging.current;
    if (!drag || drag.pointerId !== e.pointerId) return;
    const to = stageUnderPoint(e.clientX, e.clientY);
    dragging.current = null;
    setGhost(null);
    setOverStage(null);
    if (to && to !== drag.from) {
      void commitStage(drag.id, drag.from, to);
    } else {
      setAnnouncement("Put back");
    }
  }

  function onPointerCancel() {
    dragging.current = null;
    setGhost(null);
    setOverStage(null);
  }

  const active = leads.filter((l) => stageOf(l) !== "lost");
  const closed = leads.filter((l) => stageOf(l) === "lost");

  return (
    <div>
      {/* Screen readers hear every move; the visual feedback is the card itself. */}
      <p aria-live="polite" className="sr-only">
        {announcement}
      </p>

      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <p className="p-muted text-[0.8125rem]">
          Drag a card to move it, or use the stage menu on any card. Every change updates the
          dashboards, the events list and the reporting at the same time.
        </p>
        {error ? (
          <p role="alert" className="p-bad text-[0.8125rem]">
            {error}
          </p>
        ) : null}
      </div>

      <div className="p-scroll-x -mx-4 px-4 pb-2 md:mx-0 md:px-0">
        <div className="flex gap-3">
          {STAGE_ORDER.map((stage) => {
            const col = active.filter((l) => stageOf(l) === stage);
            const isOver = overStage === stage;
            return (
              <section
                key={stage}
                ref={(el) => {
                  columnRefs.current[stage] = el;
                }}
                aria-label={`${STAGE_LABELS[stage]}, ${col.length} enquiries`}
                className={`p-column rounded-md transition-colors ${
                  isOver
                    ? "bg-[color:color-mix(in_srgb,var(--color-accent)_16%,transparent)] outline outline-1 outline-[color:var(--color-accent)]"
                    : ""
                }`}
              >
                <div className="mb-2 flex items-baseline justify-between gap-2 px-1">
                  <h2 className="p-title">{STAGE_LABELS[stage]}</h2>
                  <span className="p-muted text-[0.6875rem] tabular-nums">{col.length}</span>
                </div>

                <ul className="space-y-2">
                  {col.length === 0 ? (
                    <li
                      className={`p-card px-3 py-6 text-center transition-colors ${
                        isOver ? "border-[color:var(--color-accent)]" : ""
                      }`}
                    >
                      <span className="p-muted text-[0.75rem]">
                        {isOver ? "Drop here" : "Empty"}
                      </span>
                    </li>
                  ) : (
                    col.map((lead) => {
                      const current = stageOf(lead);
                      const isDragging = ghost?.id === lead.id;
                      return (
                        <li key={lead.id}>
                          <article
                            onPointerDown={(e) => onPointerDown(e, lead)}
                            onPointerMove={onPointerMove}
                            onPointerUp={onPointerUp}
                            onPointerCancel={onPointerCancel}
                            className={`p-card p-drag-card px-3 py-3 ${
                              isDragging ? "opacity-35" : ""
                            } ${busyId === lead.id ? "animate-pulse" : ""}`}
                          >
                            <div className="flex items-baseline justify-between gap-2">
                              <Link
                                href={`/portal/leads/${lead.id}`}
                                className="truncate text-sm font-medium hover:text-[color:var(--color-accent-soft)]"
                              >
                                {lead.name}
                              </Link>
                              <span
                                className={`p-band-${lead.band} shrink-0 text-[0.6875rem] font-semibold`}
                              >
                                {lead.band}
                              </span>
                            </div>

                            <p className="p-muted mt-1 text-[0.75rem] leading-snug">
                              {EVENT_TYPE_LABELS[lead.eventType]}
                            </p>
                            <p className="p-muted mt-0.5 text-[0.75rem] leading-snug">
                              {shortDate(lead.eventDate)} · {lead.guestCount} guests
                            </p>
                            {lead.value ? (
                              <p className="mt-1.5 text-[0.75rem] font-medium tabular-nums">
                                {money(lead.value.amount)}
                                {lead.value.booked ? null : (
                                  <span className="p-muted"> quoted</span>
                                )}
                              </p>
                            ) : null}

                            {/* The keyboard path. Does exactly what the drag does. */}
                            <div className="mt-2.5 flex items-center gap-1.5">
                              {/*
                                Labelled with aria-label rather than a visually
                                hidden <label>. Tailwind's `sr-only` is
                                position:absolute, and inside a horizontally
                                scrolled column with no positioned ancestor it
                                resolves against the viewport — the eighth
                                column's hidden label landed 209px past the right
                                edge and gave the whole page a horizontal
                                scrollbar. One attribute says the same thing to a
                                screen reader and adds no box to lay out.
                              */}
                              <select
                                aria-label={`Stage for ${lead.name}`}
                                id={`stage-${lead.id}`}
                                value={current}
                                disabled={busyId === lead.id}
                                onChange={(e) =>
                                  commitStage(lead.id, current, e.target.value as Stage)
                                }
                                className="p-select !min-h-[34px] flex-1 !py-1 !pr-7 !pl-2 text-[0.75rem]"
                              >
                                {STAGE_ORDER.map((s) => (
                                  <option key={s} value={s}>
                                    {STAGE_LABELS[s]}
                                  </option>
                                ))}
                                <option value="lost">{STAGE_LABELS.lost}</option>
                              </select>
                              {canRemove ? (
                                <button
                                  type="button"
                                  onClick={() => setConfirmRemove(lead.id)}
                                  disabled={busyId === lead.id}
                                  aria-label={`Remove ${lead.name}`}
                                  className="p-btn !min-h-[34px] !px-2"
                                >
                                  <IconTrash className="h-3.5 w-3.5" />
                                </button>
                              ) : null}
                            </div>

                            {confirmRemove === lead.id ? (
                              <div className="p-hairline mt-2.5 pt-2.5">
                                <p className="p-bad text-[0.75rem] leading-snug">
                                  Remove {lead.name} and everything attached — the menu, the
                                  messages, the history? This cannot be undone.
                                </p>
                                <div className="mt-2 flex gap-1.5">
                                  <button
                                    type="button"
                                    className="p-btn p-btn-sm flex-1 !min-h-[32px] border-[color:var(--color-accent)] text-[0.75rem]"
                                    disabled={busyId === lead.id}
                                    onClick={() => remove(lead.id, lead.name)}
                                  >
                                    Remove
                                  </button>
                                  <button
                                    type="button"
                                    className="p-btn p-btn-sm !min-h-[32px] text-[0.75rem]"
                                    onClick={() => setConfirmRemove(null)}
                                  >
                                    Keep
                                  </button>
                                </div>
                              </div>
                            ) : null}
                          </article>
                        </li>
                      );
                    })
                  )}
                </ul>
              </section>
            );
          })}
        </div>
      </div>

      {closed.length > 0 ? (
        <details className="p-card mt-4">
          <summary className="p-card-head cursor-pointer list-none">
            <h2 className="p-title">Closed — {closed.length}</h2>
            <IconChevron className="p-muted h-4 w-4" />
          </summary>
          <ul className="divide-y divide-[color:var(--color-line-dark)]">
            {closed.map((lead) => (
              <li key={lead.id} className="flex flex-wrap items-center gap-x-3 gap-y-1.5 px-5 py-3">
                <Link
                  href={`/portal/leads/${lead.id}`}
                  className="text-sm font-medium hover:text-[color:var(--color-accent-soft)]"
                >
                  {lead.name}
                </Link>
                <span className="p-muted text-[0.75rem]">{lead.ref}</span>
                {lead.lostReason ? (
                  <span className="p-muted min-w-0 flex-1 text-[0.75rem] leading-snug">
                    {lead.lostReason}
                  </span>
                ) : null}
                <select
                  aria-label={`Stage for ${lead.name}`}
                  id={`stage-closed-${lead.id}`}
                  value="lost"
                  disabled={busyId === lead.id}
                  onChange={(e) => commitStage(lead.id, "lost", e.target.value as Stage)}
                  className="p-select !min-h-[34px] !w-auto !py-1 !pr-7 !pl-2 text-[0.75rem]"
                >
                  <option value="lost">{STAGE_LABELS.lost}</option>
                  {STAGE_ORDER.map((s) => (
                    <option key={s} value={s}>
                      Reopen as {STAGE_LABELS[s]}
                    </option>
                  ))}
                </select>
                {canRemove ? (
                  <button
                    type="button"
                    onClick={() =>
                      confirmRemove === lead.id ? remove(lead.id, lead.name) : setConfirmRemove(lead.id)
                    }
                    disabled={busyId === lead.id}
                    className={`p-btn p-btn-sm !min-h-[34px] text-[0.75rem] ${
                      confirmRemove === lead.id ? "border-[color:var(--color-accent)]" : ""
                    }`}
                  >
                    {confirmRemove === lead.id ? "Confirm" : <IconTrash className="h-3.5 w-3.5" />}
                  </button>
                ) : null}
              </li>
            ))}
          </ul>
        </details>
      ) : null}

      {/* The card that follows the finger. Fixed, so it escapes the scroller. */}
      {ghost ? (
        <div
          aria-hidden="true"
          className="p-drag-ghost"
          style={{ left: ghost.x - ghost.offsetX, top: ghost.y - ghost.offsetY }}
        >
          <span className="text-sm font-medium">{ghost.name}</span>
          <IconArrowRight className="h-4 w-4" />
        </div>
      ) : null}
    </div>
  );
}
