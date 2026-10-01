"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import type { ProspectCategory, ProspectPriority, ProspectStatus } from "@/lib/portal/lead-types";
import { IconArrowRight, IconPhone, IconTrash } from "./Icons";
import { shortDate } from "./Ui";

/**
 * THE PROSPECT BOARD
 *
 * Same mechanics as PipelineBoard — pointer events so it works on a phone,
 * optimistic moves so it never feels laggy, and a real <select> on every card so
 * the whole thing is usable without a mouse. Read PipelineBoard's header comment
 * for the reasoning; it applies here unchanged.
 *
 * What is different is what a card says. An enquiry card answers "how good is
 * this and how far along is it". A prospect card answers "should I ring this
 * today, and is there a phone number" — so the phone number is on the card, as a
 * tel: link, and an overdue action date shouts.
 */

/**
 * Exactly what a card draws.
 *
 * Built on the server. Anything in here is downloaded by the browser whether it
 * renders or not, so `value` is omitted entirely rather than hidden when the
 * viewer may not see financials.
 */
export interface BoardProspect {
  id: string;
  ref: string;
  name: string;
  status: ProspectStatus;
  category: ProspectCategory;
  priority: ProspectPriority;
  total: number;
  city: string;
  state: string;
  phone: string | null;
  nextActionBy: string | null;
  overdue: boolean;
  sourceCount: number;
  /** True when the score was held back for want of a citation. */
  capped: boolean;
  /** Present only when the viewer may see financials. */
  value?: number | null;
}

export const STATUS_ORDER: ProspectStatus[] = [
  "new",
  "researched",
  "contacted",
  "conversation",
  "quoted",
  "won",
];

export const STATUS_LABELS: Record<ProspectStatus, string> = {
  new: "To research",
  researched: "Ready to call",
  contacted: "Called",
  conversation: "Talking",
  quoted: "Quoted",
  won: "Booked",
  lost: "Lost",
  declined: "We declined",
};

const PRIORITY_BAND: Record<ProspectPriority, string> = {
  HOT: "p-band-A",
  WARM: "p-band-B",
  WATCH: "p-band-C",
  DECLINE: "p-band-D",
};

export const PRIORITY_LABELS: Record<ProspectPriority, string> = {
  HOT: "Call this week",
  WARM: "Call this month",
  WATCH: "Keep an eye on it",
  DECLINE: "Do not pursue",
};

const CATEGORY_LABELS: Record<ProspectCategory, string> = {
  corporate: "Company",
  "nonprofit-gala": "Charity gala",
  venue: "Venue",
  planner: "Planner",
  association: "Association",
  institution: "Institution",
  production: "Film or TV",
};

type Ghost = { id: string; name: string; x: number; y: number; offsetX: number; offsetY: number };

export default function ProspectBoard({
  prospects,
  canRemove,
}: {
  prospects: BoardProspect[];
  canRemove: boolean;
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  const [moved, setMoved] = useState<Record<string, ProspectStatus>>({});
  const [ghost, setGhost] = useState<Ghost | null>(null);
  const [overStatus, setOverStatus] = useState<ProspectStatus | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirmRemove, setConfirmRemove] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState("");

  const columnRefs = useRef<Partial<Record<ProspectStatus, HTMLElement | null>>>({});
  const dragging = useRef<{ id: string; from: ProspectStatus; pointerId: number } | null>(null);

  // Drop optimistic overrides once the server agrees with them.
  useEffect(() => {
    setMoved((prev) => {
      if (Object.keys(prev).length === 0) return prev;
      const next: Record<string, ProspectStatus> = {};
      for (const [id, status] of Object.entries(prev)) {
        const p = prospects.find((x) => x.id === id);
        if (p && p.status !== status) next[id] = status;
      }
      return Object.keys(next).length === Object.keys(prev).length ? prev : next;
    });
  }, [prospects]);

  const statusOf = useCallback(
    (p: BoardProspect): ProspectStatus => moved[p.id] ?? p.status,
    [moved],
  );

  async function commitStatus(id: string, from: ProspectStatus, to: ProspectStatus) {
    if (from === to) return;
    setMoved((m) => ({ ...m, [id]: to }));
    setBusyId(id);
    setError(null);
    setAnnouncement(`Moved to ${STATUS_LABELS[to]}`);
    try {
      const res = await fetch(`/api/portal/prospects/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "status", status: to }),
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
      const res = await fetch("/api/portal/prospects", {
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

  /* ── Pointer dragging ──────────────────────────────────────────────────── */

  function statusUnderPoint(x: number, y: number): ProspectStatus | null {
    for (const status of STATUS_ORDER) {
      const el = columnRefs.current[status];
      if (!el) continue;
      const r = el.getBoundingClientRect();
      if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) return status;
    }
    return null;
  }

  function onPointerDown(e: React.PointerEvent, p: BoardProspect) {
    if (e.button !== 0) return;
    const target = e.target as HTMLElement;
    // Links, the status menu and the remove control stay ordinary controls.
    if (target.closest("a, button, select")) return;

    const card = e.currentTarget as HTMLElement;
    const r = card.getBoundingClientRect();
    dragging.current = { id: p.id, from: statusOf(p), pointerId: e.pointerId };
    card.setPointerCapture(e.pointerId);
    setGhost({
      id: p.id,
      name: p.name,
      x: e.clientX,
      y: e.clientY,
      offsetX: e.clientX - r.left,
      offsetY: e.clientY - r.top,
    });
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!dragging.current || dragging.current.pointerId !== e.pointerId) return;
    setGhost((g) => (g ? { ...g, x: e.clientX, y: e.clientY } : g));
    setOverStatus(statusUnderPoint(e.clientX, e.clientY));
  }

  function onPointerUp(e: React.PointerEvent) {
    const d = dragging.current;
    if (!d || d.pointerId !== e.pointerId) return;
    const to = statusUnderPoint(e.clientX, e.clientY);
    dragging.current = null;
    setGhost(null);
    setOverStatus(null);
    if (to && to !== d.from) void commitStatus(d.id, d.from, to);
  }

  const columns = STATUS_ORDER.map((status) => ({
    status,
    items: prospects.filter((p) => statusOf(p) === status),
  }));

  return (
    <div>
      {error ? (
        <p className="p-bad mb-3 text-sm" role="alert">
          {error}
        </p>
      ) : null}

      {/* Announced to screen readers; the visual feedback is the card moving. */}
      <p className="sr-only" role="status" aria-live="polite">
        {announcement}
      </p>

      <div className="p-scroll-x -mx-1 pb-2">
        <div className="flex gap-3 px-1">
          {columns.map(({ status, items }) => (
            <section
              key={status}
              ref={(el) => {
                columnRefs.current[status] = el;
              }}
              className={`p-column p-card ${overStatus === status ? "ring-1 ring-[color:var(--color-accent)]" : ""}`}
            >
              <div className="p-card-head !px-3 !py-2.5">
                <h2 className="p-title">{STATUS_LABELS[status]}</h2>
                <span className="p-muted text-[0.75rem] tabular-nums">{items.length}</span>
              </div>

              <div className="space-y-2 p-2">
                {items.length === 0 ? (
                  <p className="p-muted px-1 py-3 text-[0.8125rem]">Nothing here.</p>
                ) : null}

                {items.map((p) => (
                  <article
                    key={p.id}
                    className={`p-drag-card p-card p-card-pad !p-3 ${busyId === p.id ? "opacity-60" : ""}`}
                    onPointerDown={(e) => onPointerDown(e, p)}
                    onPointerMove={onPointerMove}
                    onPointerUp={onPointerUp}
                    onPointerCancel={onPointerUp}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className={`p-badge ${PRIORITY_BAND[p.priority]}`}>
                        {p.priority === "DECLINE" ? "Skip" : PRIORITY_LABELS[p.priority]}
                      </span>
                      <span className="p-muted text-[0.75rem] tabular-nums">{p.total}</span>
                    </div>

                    <Link
                      href={`/portal/prospects/${p.id}`}
                      className="p-tap mt-2 text-[0.875rem] leading-snug font-medium hover:text-[color:var(--color-accent-soft)]"
                    >
                      {p.name}
                    </Link>

                    <p className="p-muted mt-1 text-[0.75rem]">
                      {CATEGORY_LABELS[p.category]}
                      {p.city ? ` · ${p.city}` : ""}
                      {p.ref ? ` · ${p.ref}` : ""}
                    </p>

                    {p.sourceCount === 0 ? (
                      <p className="p-warn mt-1.5 text-[0.75rem] leading-snug">
                        No source attached yet
                      </p>
                    ) : null}

                    {p.nextActionBy ? (
                      <p
                        className={`mt-1.5 text-[0.75rem] ${p.overdue ? "p-bad" : "p-muted"}`}
                      >
                        {p.overdue ? "Overdue since " : "Action by "}
                        {shortDate(p.nextActionBy)}
                      </p>
                    ) : null}

                    {p.value != null ? (
                      <p className="p-muted mt-1 text-[0.75rem] tabular-nums">
                        Est. ${p.value.toLocaleString()}
                      </p>
                    ) : null}

                    {/*
                      The status menu gets its own row with a real minimum width.
                      Sharing a row with the Call button squeezed it to "To" —
                      a select that cannot show its own value is worse than no
                      select, and this is the keyboard path, not a decoration.
                    */}
                    <div className="mt-2.5">
                      <select
                        className="p-select !min-h-[40px] w-full text-[0.75rem]"
                        value={statusOf(p)}
                        aria-label={`Status for ${p.name}`}
                        onChange={(e) =>
                          void commitStatus(p.id, statusOf(p), e.target.value as ProspectStatus)
                        }
                      >
                        {(Object.keys(STATUS_LABELS) as ProspectStatus[]).map((s) => (
                          <option key={s} value={s}>
                            {STATUS_LABELS[s]}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="mt-1.5 flex items-center gap-1.5">
                      {p.phone ? (
                        <a
                          href={`tel:${p.phone.replace(/[^\d+]/g, "")}`}
                          className="p-btn p-btn-sm flex-1"
                          aria-label={`Call ${p.name} on ${p.phone}`}
                        >
                          <IconPhone className="h-4 w-4" />
                          Call
                        </a>
                      ) : (
                        <Link
                          href={`/portal/prospects/${p.id}`}
                          className="p-btn p-btn-sm flex-1"
                        >
                          Open
                        </Link>
                      )}

                      {canRemove ? (
                        confirmRemove === p.id ? (
                          <button
                            type="button"
                            className="p-btn p-btn-sm p-bad"
                            onClick={() => void remove(p.id, p.name)}
                          >
                            Sure?
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="p-btn p-btn-sm"
                            onClick={() => setConfirmRemove(p.id)}
                            aria-label={`Remove ${p.name}`}
                          >
                            <IconTrash className="h-4 w-4" />
                          </button>
                        )
                      ) : null}
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>

      {ghost ? (
        <div
          className="p-drag-ghost"
          style={{ left: ghost.x - ghost.offsetX, top: ghost.y - ghost.offsetY }}
          aria-hidden="true"
        >
          <IconArrowRight className="h-4 w-4" />
          <span className="text-[0.8125rem]">{ghost.name}</span>
        </div>
      ) : null}
    </div>
  );
}
