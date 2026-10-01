/**
 * Small shared presentational pieces for the portal.
 * Server components — no client JavaScript unless a file says "use client".
 */

import Link from "next/link";
import type { ScoreBand, Stage } from "@/lib/portal/types";
import { BANDS, MAX_SCORE, STAGE_LABELS } from "@/lib/portal/scoring";
import { IconAlert, IconCheck, IconClock } from "./Icons";

/* ─────────────────────────────────────────────────────────── demo banner ─── */

/**
 * Stated on every portal screen, because the alternative is a client
 * screenshotting a fictional revenue figure and believing it.
 */
export function DemoBanner() {
  return (
    <div className="p-demo-bar">
      <div className="p-shell flex flex-wrap items-center gap-x-3 gap-y-1 py-2">
        <span className="p-badge p-band-B">Demo data</span>
        <p className="text-[0.8125rem] leading-snug">
          Every guest, enquiry, date and figure on these screens is invented to show how
          the system works. Nothing here is a real person or a real result.
        </p>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────── the band ─── */

export function BandBadge({
  band,
  overridden = false,
}: {
  band: ScoreBand;
  overridden?: boolean;
}) {
  return (
    <span className={`p-badge p-band-${band}`}>
      {band} · {BANDS[band].label}
      {overridden ? " (set by hand)" : ""}
    </span>
  );
}

export function ScoreMeter({ total, band }: { total: number; band: ScoreBand }) {
  const pct = Math.max(2, Math.round((total / MAX_SCORE) * 100));
  return (
    <div>
      <div className="flex items-baseline justify-between gap-2">
        <span className="p-figure-sm">
          {total}
          <span className="p-muted text-sm"> / {MAX_SCORE}</span>
        </span>
        <BandBadge band={band} />
      </div>
      <div
        className="p-meter mt-2"
        role="meter"
        aria-valuenow={total}
        aria-valuemin={0}
        aria-valuemax={MAX_SCORE}
        aria-label={`Qualification score ${total} out of ${MAX_SCORE}, band ${band}`}
      >
        <span style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────── stages ─── */

export function StageBadge({ stage }: { stage: Stage }) {
  const tone =
    stage === "confirmed" || stage === "completed"
      ? "p-ok"
      : stage === "lost"
        ? "p-muted"
        : stage === "deposit"
          ? "p-warn"
          : "";
  return <span className={`p-badge ${tone}`}>{STAGE_LABELS[stage]}</span>;
}

/* ──────────────────────────────────────────────────────────────── layout ─── */

export function Card({
  title,
  action,
  children,
  className = "",
}: {
  title?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`p-card ${className}`}>
      {title ? (
        <div className="p-card-head">
          <h2 className="p-title">{title}</h2>
          {action}
        </div>
      ) : null}
      {children}
    </section>
  );
}

export function Stat({
  label,
  value,
  hint,
  tone = "",
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: string;
}) {
  return (
    <div className="p-card p-card-pad">
      <p className="p-title">{label}</p>
      <p className={`p-figure mt-2 ${tone}`}>{value}</p>
      {hint ? <p className="p-muted mt-1 text-[0.8125rem] leading-snug">{hint}</p> : null}
    </div>
  );
}

export function EmptyState({
  title,
  body,
  cta,
}: {
  title: string;
  body: string;
  cta?: { href: string; label: string };
}) {
  return (
    <div className="px-5 py-10 text-center">
      <p className="t-serif-italic text-xl">{title}</p>
      <p className="p-muted mx-auto mt-2 max-w-sm text-sm">{body}</p>
      {cta ? (
        <Link href={cta.href} className="p-btn p-btn-sm mt-4">
          {cta.label}
        </Link>
      ) : null}
    </div>
  );
}

/* ───────────────────────────────────────────────────────────── urgency ─── */

export function UrgencyIcon({ urgency }: { urgency: "overdue" | "today" | "soon" }) {
  if (urgency === "overdue") return <IconAlert className="h-4 w-4 p-bad shrink-0" />;
  if (urgency === "today") return <IconClock className="h-4 w-4 p-warn shrink-0" />;
  return <IconCheck className="h-4 w-4 p-muted shrink-0" />;
}

/* ───────────────────────────────────────────────────────── formatting ─── */

export function money(n: number | null | undefined): string {
  if (n === null || n === undefined) return "—";
  return `$${n.toLocaleString("en-US")}`;
}

export function shortDate(iso: string | null): string {
  if (!iso) return "No date";
  return new Date(iso.length === 10 ? `${iso}T12:00:00Z` : iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function longDate(iso: string | null): string {
  if (!iso) return "No date set";
  return new Date(iso.length === 10 ? `${iso}T12:00:00Z` : iso).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days}d ago`;
  return shortDate(iso);
}
