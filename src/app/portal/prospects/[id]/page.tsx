import Link from "next/link";
import { notFound } from "next/navigation";
import { requireStaff } from "@/lib/portal/guard";
import { getOutreach, getProspect } from "@/lib/portal/lead-store";
import { PROSPECT_WEIGHTS } from "@/lib/portal/prospect-scoring";
import { Card, longDate, relativeTime, shortDate } from "@/components/portal/Ui";
import { PRIORITY_LABELS, STATUS_LABELS } from "@/components/portal/ProspectBoard";
import ProspectActions from "@/components/portal/ProspectActions";
import ApproachPanel from "@/components/portal/ApproachPanel";
import {
  IconAlert,
  IconArrowRight,
  IconCheck,
  IconPhone,
} from "@/components/portal/Icons";

export const metadata = { title: "Prospect" };

const PRIORITY_BAND = {
  HOT: "p-band-A",
  WARM: "p-band-B",
  WATCH: "p-band-C",
  DECLINE: "p-band-D",
} as const;

const KIND_LABELS: Record<string, string> = {
  organization: "Their own site",
  directory: "A listing",
  search: "A search page",
  news: "News",
  filing: "A public filing",
  statute: "The law",
};

/**
 * The dossier.
 *
 * This page is the product. Someone who has never spoken to this organisation
 * should be able to read it top to bottom and then make the call — so it is
 * ordered the way a caller needs it, not the way the data is shaped:
 *
 *   who they are → what to say → what NOT to say → what to do → why it scored
 *   that → the evidence → what has been sent → the log
 *
 * The opening question is the biggest thing on the page on purpose. It is the
 * one sentence that decides whether the call goes anywhere.
 */
export default async function ProspectPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await requireStaff();
  const { id } = await params;
  const p = getProspect(id);
  if (!p) notFound();

  const outreach = getOutreach(p.id);
  const todayISO = new Date().toISOString().slice(0, 10);
  const overdue = p.nextActionBy !== null && p.nextActionBy < todayISO;
  const declining = p.suggestedAction.trim().toUpperCase().startsWith("DO NOT");

  return (
    <div className="space-y-6">
      <div>
        <Link href="/portal/prospects" className="p-link">
          ← Back to {session.role === "owner" ? "prospects" : "the call list"}
        </Link>
      </div>

      {/* ── Who they are ──────────────────────────────────────────────────── */}
      <header>
        <div className="flex flex-wrap items-center gap-2">
          <span className={`p-badge ${PRIORITY_BAND[p.priority]}`}>
            {PRIORITY_LABELS[p.priority]}
          </span>
          <span className="p-badge p-band-D">{STATUS_LABELS[p.status]}</span>
          <span className="p-muted text-[0.75rem]">{p.ref}</span>
        </div>
        <h1 className="t-h3 mt-2">{p.name}</h1>
        <p className="p-muted mt-1 text-sm">
          {p.city ? `${p.city}, ${p.state}` : "Location not established"}
          {p.contactName ? ` · ${p.contactName}` : ""}
          {p.contactRole ? `, ${p.contactRole}` : ""}
        </p>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          {p.phone ? (
            <a
              href={`tel:${p.phone.replace(/[^\d+]/g, "")}`}
              className="p-btn p-btn-sm p-btn-primary"
            >
              <IconPhone className="h-4 w-4" />
              {p.phone}
            </a>
          ) : (
            <span className="p-muted text-sm">No phone number established</span>
          )}
          {p.website ? (
            <a
              href={p.website}
              target="_blank"
              rel="noreferrer noopener"
              className="p-btn p-btn-sm"
            >
              Their website
              <IconArrowRight className="h-4 w-4" />
            </a>
          ) : null}
        </div>
      </header>

      {/* ── What to say ───────────────────────────────────────────────────── */}
      <Card title="Open the call with this">
        <div className="p-card-pad">
          <p className="p-figure-sm !text-[1.15rem] leading-snug">
            &ldquo;{p.openingQuestion}&rdquo;
          </p>
          <p className="p-muted mt-3 text-[0.8125rem] leading-relaxed">
            Written so you can use it close to word for word. It is a question only someone
            inside that business can answer, which is why it does not get a &ldquo;no
            thanks&rdquo;.
          </p>
        </div>
      </Card>

      <Card title="Why them, and what to say">
        <div className="p-card-pad space-y-3 text-sm leading-relaxed">
          <p>{p.whyItFits}</p>
          <p className="p-hairline pt-3">{p.pitch}</p>
        </div>
      </Card>

      {/* ── What NOT to say. Only when there is something. ────────────────── */}
      {p.caution ? (
        <Card
          title="Before you dial"
          action={<IconAlert className="h-4 w-4 p-warn" />}
        >
          <div className="p-card-pad">
            <p className="p-warn text-sm leading-relaxed">{p.caution}</p>
          </div>
        </Card>
      ) : null}

      {/* ── What to do. A decline is as loud as a pursuit. ────────────────── */}
      <Card
        title={declining ? "Do not pursue this" : "What to do"}
        action={
          declining ? (
            <IconAlert className="h-4 w-4 p-bad" />
          ) : (
            <IconCheck className="h-4 w-4 p-ok" />
          )
        }
      >
        <div className="p-card-pad">
          <p className={`text-sm leading-relaxed ${declining ? "p-bad" : ""}`}>
            {p.suggestedAction}
          </p>
        </div>
      </Card>

      {/* ── Every way of making the approach, collapsed. ──────────────────── */}
      <ApproachPanel prospectId={p.id} approaches={p.approaches} />

      {/* ── Working controls ──────────────────────────────────────────────── */}
      <ProspectActions
        id={p.id}
        status={p.status}
        owner={p.owner}
        nextActionBy={p.nextActionBy}
        overdue={overdue}
      />

      {/* ── Why it scored what it scored ──────────────────────────────────── */}
      <Card
        title="How this was scored"
        action={<span className="p-muted text-[0.75rem] tabular-nums">{p.score.total} / 100</span>}
      >
        <div className="p-card-pad">
          <div className="p-meter" aria-hidden="true">
            <span style={{ width: `${Math.max(2, p.score.total)}%` }} />
          </div>
          <dl className="mt-4 space-y-3">
            {p.score.lines.map((line) => (
              <div key={line.key}>
                <dt className="flex items-baseline justify-between gap-3 text-[0.8125rem]">
                  <span className={line.key === "cap" ? "p-warn font-medium" : "font-medium"}>
                    {line.label}
                  </span>
                  {line.key === "cap" ? null : (
                    <span className="p-muted tabular-nums whitespace-nowrap">
                      {line.earned} / {line.weight}
                    </span>
                  )}
                </dt>
                <dd
                  className={`mt-0.5 text-[0.8125rem] leading-relaxed ${line.key === "cap" ? "p-warn" : "p-muted"}`}
                >
                  {line.reason}
                </dd>
              </div>
            ))}
          </dl>
          <p className="p-muted p-hairline mt-4 pt-3 text-[0.8125rem] leading-relaxed">
            Nine things are weighed, out of {Object.values(PROSPECT_WEIGHTS).reduce((a, b) => a + b, 0)}.
            The biggest single one is whether it could fill a date you have open, because an
            empty Saturday is the only thing here that expires on its own.
          </p>
        </div>
      </Card>

      {/* ── The evidence. The notes are the point; nothing is truncated. ──── */}
      <Card
        title="Where these facts came from"
        action={
          <span className="p-muted text-[0.75rem]">
            {p.sources.length} {p.sources.length === 1 ? "source" : "sources"}
          </span>
        }
      >
        <div className="p-card-pad space-y-4">
          {p.sources.length === 0 ? (
            <p className="p-warn text-sm leading-relaxed">
              Nothing has been attached yet, so this is held back no matter how well it scores.
              Find the organisation&apos;s own page, check the facts on this card against it, and
              attach it before anybody rings.
            </p>
          ) : (
            p.sources.map((s) => (
              <div key={s.url + s.label}>
                <div className="flex flex-wrap items-center gap-2">
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="p-tap text-sm font-medium hover:text-[color:var(--color-accent-soft)]"
                  >
                    {s.label}
                  </a>
                  <span className="p-badge p-band-D">{KIND_LABELS[s.kind] ?? s.kind}</span>
                  <span className="p-muted text-[0.75rem]">read {shortDate(s.retrievedISO)}</span>
                </div>
                <p className="p-muted mt-1 text-[0.8125rem] leading-relaxed">{s.note}</p>
              </div>
            ))
          )}
          <p className="p-muted p-hairline pt-3 text-[0.8125rem] leading-relaxed">
            Each note says what the page proves and, deliberately, what it does not. Say the
            first part on a call. Do not say the second.
          </p>
        </div>
      </Card>

      {/* ── What has been written to them ─────────────────────────────────── */}
      {outreach.length > 0 ? (
        <Card title="What has been written to them">
          <div className="p-card-pad space-y-4">
            {outreach.map((o) => (
              <div key={o.id}>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="p-badge p-band-B">
                    {o.status === "draft"
                      ? "Written, not sent"
                      : o.status === "approved"
                        ? "Approved, not sent"
                        : o.status}
                  </span>
                  <span className="text-sm font-medium">{o.subject}</span>
                  <span className="p-muted text-[0.75rem]">
                    written {relativeTime(o.draftedISO)}
                  </span>
                  <Link href={`/print/outreach/${o.id}`} className="p-link">
                    Print
                  </Link>
                </div>
                <pre className="p-muted mt-2 text-[0.8125rem] leading-relaxed whitespace-pre-wrap font-[inherit]">
                  {o.body}
                </pre>
              </div>
            ))}
          </div>
        </Card>
      ) : null}

      {/* ── The log ───────────────────────────────────────────────────────── */}
      <Card title="What has happened">
        <div className="p-card-pad">
          {p.notes.length === 0 ? (
            <p className="p-muted text-sm">Nothing logged yet.</p>
          ) : (
            <ol className="space-y-2.5">
              {p.notes.map((n, i) => (
                <li key={`${n.iso}-${i}`} className="text-[0.8125rem] leading-relaxed">
                  <span className="p-muted">
                    {longDate(n.iso.slice(0, 10))} · {n.actor}
                  </span>
                  <br />
                  {n.body}
                </li>
              ))}
            </ol>
          )}
        </div>
      </Card>
    </div>
  );
}
