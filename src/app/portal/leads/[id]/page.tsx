import Link from "next/link";
import { notFound } from "next/navigation";
import { requireStaff } from "@/lib/portal/guard";
import {
  canSeeFinancials,
  effectiveBand,
  getLead,
  getMenuForLead,
  getMessages,
} from "@/lib/portal/store";
import {
  BANDS,
  BUDGET_LABELS,
  DECISION_LABELS,
  EVENT_TYPE_LABELS,
  SOURCE_LABELS,
  VENUE_LABELS,
} from "@/lib/portal/scoring";
import {
  BandBadge,
  Card,
  ScoreMeter,
  StageBadge,
  longDate,
  money,
  relativeTime,
} from "@/components/portal/Ui";
import {
  IconAlert,
  IconArrowRight,
  IconCheck,
  IconMail,
  IconMenuBook,
  IconPhone,
} from "@/components/portal/Icons";
import LeadActions from "@/components/portal/LeadActions";
import Thread from "@/components/portal/Thread";

export const metadata = { title: "Enquiry" };

export default async function LeadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await requireStaff();
  const lead = getLead(id);
  if (!lead) notFound();

  const showMoney = canSeeFinancials(session.role);
  const band = effectiveBand(lead);
  const menu = getMenuForLead(lead.id);
  const messages = getMessages(lead.id);
  const routing = BANDS[band];

  const facts: { label: string; value: string }[] = [
    { label: "Event", value: EVENT_TYPE_LABELS[lead.eventType] },
    { label: "Date", value: `${longDate(lead.eventDate)}${lead.dateFlexible ? " — flexible" : ""}` },
    { label: "Guests", value: String(lead.guestCount) },
    { label: "Where", value: `${VENUE_LABELS[lead.venueType]}${lead.venueCity ? ` · ${lead.venueCity}` : ""}` },
    { label: "Budget given", value: BUDGET_LABELS[lead.budgetBand] },
    { label: "Decision", value: DECISION_LABELS[lead.decisionMaker] },
    { label: "Found him via", value: SOURCE_LABELS[lead.source] },
    { label: "Hired a chef before", value: lead.workedWithChefBefore ? "Yes" : "No" },
  ];

  return (
    <div className="space-y-6">
      <nav aria-label="Breadcrumb" className="p-muted text-[0.8125rem]">
        <Link href="/portal/leads" className="p-link">
          {session.role === "owner" ? "Pipeline" : "Enquiries"}
        </Link>
        <span aria-hidden="true"> / </span>
        <span>{lead.ref}</span>
      </nav>

      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="t-h3">{lead.name}</h1>
            <BandBadge band={band} overridden={Boolean(lead.scoreOverride)} />
            <StageBadge stage={lead.stage} />
          </div>
          <p className="p-muted mt-1.5 text-sm">
            {lead.ref} · enquired {relativeTime(lead.createdAt)}
            {lead.firstRepliedAt ? ` · first reply ${relativeTime(lead.firstRepliedAt)}` : " · not yet replied to"}
          </p>
          {lead.tags.length > 0 ? (
            <ul className="mt-2.5 flex flex-wrap gap-1.5">
              {lead.tags.map((t) => (
                <li key={t} className="p-badge p-muted">
                  {t}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          {lead.phone ? (
            <a href={`tel:${lead.phone.replace(/\D/g, "")}`} className="p-btn p-btn-sm">
              <IconPhone className="h-4 w-4" />
              {lead.phone}
            </a>
          ) : (
            <span className="p-badge p-bad">No phone number given</span>
          )}
          <a href={`mailto:${lead.email}`} className="p-btn p-btn-sm">
            <IconMail className="h-4 w-4" />
            Email
          </a>
        </div>
      </header>

      <div className="grid gap-6 xl:grid-cols-[1fr_20rem]">
        <div className="space-y-6">
          {/* ── What they actually wrote. Top of the page on purpose. ────── */}
          <Card title="In their words">
            <div className="p-card-pad">
              <blockquote className="t-serif-italic text-lg leading-relaxed">
                &ldquo;{lead.occasionNotes}&rdquo;
              </blockquote>
              {lead.dietaryNotes ? (
                <div className="p-hairline mt-4 pt-4">
                  <p className="p-title">Dietary and allergies, as given</p>
                  <p className="mt-1.5 text-sm leading-relaxed">{lead.dietaryNotes}</p>
                  <p className="p-muted mt-2 text-[0.75rem] leading-snug">
                    Taken verbatim from the guest. Nothing is assumed or filled in on their behalf.
                  </p>
                </div>
              ) : null}
            </div>
          </Card>

          {/* ── The score, fully broken down. No black box. ───────────────── */}
          <Card
            title="Why it scored what it scored"
            action={<span className="p-muted text-[0.8125rem]">Never shown to the guest</span>}
          >
            <div className="p-card-pad">
              <ScoreMeter total={lead.score.total} band={lead.score.band} />

              <div className="p-hairline mt-4 pt-4">
                <p className="text-[0.8125rem] leading-relaxed">
                  <span className="font-medium">{routing.routing}.</span>{" "}
                  <span className="p-muted">{routing.sla}. Automatically: {routing.autoReply.toLowerCase()}.</span>
                </p>
              </div>

              <ul className="mt-4 space-y-3">
                {lead.score.lines
                  .slice()
                  .sort((a, b) => b.points / b.max - a.points / a.max)
                  .map((line) => {
                    const pct = Math.round((line.points / line.max) * 100);
                    const strong = pct >= 70;
                    const weak = pct <= 30;
                    return (
                      <li key={line.key}>
                        <div className="flex items-baseline justify-between gap-3">
                          <span className="flex items-center gap-1.5 text-[0.8125rem] font-medium">
                            {strong ? (
                              <IconCheck className="p-ok h-3.5 w-3.5 shrink-0" />
                            ) : weak ? (
                              <IconAlert className="p-bad h-3.5 w-3.5 shrink-0" />
                            ) : null}
                            {line.label}
                          </span>
                          <span className="shrink-0 text-[0.8125rem] tabular-nums">
                            {line.points}
                            <span className="p-muted"> / {line.max}</span>
                          </span>
                        </div>
                        <div className="p-meter mt-1">
                          <span style={{ width: `${Math.max(pct, line.points > 0 ? 3 : 0)}%` }} />
                        </div>
                        <p className="p-muted mt-1 text-[0.75rem] leading-snug">{line.reason}</p>
                      </li>
                    );
                  })}
              </ul>

              {lead.scoreOverride ? (
                <div className="p-hairline mt-4 pt-4">
                  <p className="p-title">Overridden by hand</p>
                  <p className="mt-1.5 text-[0.8125rem] leading-snug">
                    Set to band {lead.scoreOverride.band} by {lead.scoreOverride.by},{" "}
                    {relativeTime(lead.scoreOverride.at)}.
                  </p>
                  <p className="p-muted mt-1 text-[0.8125rem] leading-snug">
                    {lead.scoreOverride.reason}
                  </p>
                </div>
              ) : null}
            </div>
          </Card>

          {/* ── Conversation. ─────────────────────────────────────────────── */}
          <Card title={`Conversation${messages.length > 0 ? ` — ${messages.length}` : ""}`}>
            <Thread
              leadId={lead.id}
              messages={messages}
              as="staff"
              authorName={session.name}
              authorRole={session.role}
            />
          </Card>

          {/* ── Timeline. Everything that ever happened, in order. ────────── */}
          <Card title="Everything that has happened">
            <ol className="divide-y divide-[color:var(--color-line-dark)]">
              {lead.timeline
                .slice()
                .reverse()
                .map((entry) => (
                  <li key={entry.id} className="px-5 py-3">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <p className="text-[0.8125rem] font-medium">{entry.summary}</p>
                      <p className="p-muted shrink-0 text-[0.6875rem]">
                        {entry.actor === "system" ? "Automatic" : entry.actor} ·{" "}
                        {relativeTime(entry.at)}
                      </p>
                    </div>
                    {entry.detail ? (
                      <p className="p-muted mt-1 text-[0.8125rem] leading-snug">{entry.detail}</p>
                    ) : null}
                  </li>
                ))}
            </ol>
          </Card>
        </div>

        {/* ── Sidebar: facts, actions, menu. ──────────────────────────────── */}
        <aside className="space-y-6">
          <LeadActions
            leadId={lead.id}
            stage={lead.stage}
            band={band}
            canOverride={session.role === "owner"}
            actorName={session.name}
          />

          <Card title="The enquiry">
            <dl className="divide-y divide-[color:var(--color-line-dark)]">
              {facts.map((f) => (
                <div key={f.label} className="px-5 py-2.5">
                  <dt className="p-title">{f.label}</dt>
                  <dd className="mt-1 text-[0.8125rem] leading-snug">{f.value}</dd>
                </div>
              ))}
              <div className="px-5 py-2.5">
                <dt className="p-title">Commitment</dt>
                <dd className="mt-1 space-y-1 text-[0.8125rem] leading-snug">
                  <p className="flex items-center gap-1.5">
                    {lead.depositOk ? (
                      <IconCheck className="p-ok h-3.5 w-3.5" />
                    ) : (
                      <IconAlert className="p-bad h-3.5 w-3.5" />
                    )}
                    Deposit acknowledged
                  </p>
                  <p className="flex items-center gap-1.5">
                    {lead.callOk ? (
                      <IconCheck className="p-ok h-3.5 w-3.5" />
                    ) : (
                      <IconAlert className="p-muted h-3.5 w-3.5" />
                    )}
                    Open to a call
                  </p>
                </dd>
              </div>
            </dl>
          </Card>

          {showMoney && (lead.quotedValue || lead.bookedValue) ? (
            <Card title="Value">
              <dl className="divide-y divide-[color:var(--color-line-dark)]">
                {lead.quotedValue ? (
                  <div className="px-5 py-2.5">
                    <dt className="p-title">Quoted</dt>
                    <dd className="p-figure-sm mt-1">{money(lead.quotedValue)}</dd>
                  </div>
                ) : null}
                {lead.bookedValue ? (
                  <div className="px-5 py-2.5">
                    <dt className="p-title">Booked</dt>
                    <dd className="p-figure-sm p-ok mt-1">{money(lead.bookedValue)}</dd>
                  </div>
                ) : null}
                {lead.event?.depositAmount ? (
                  <div className="px-5 py-2.5">
                    <dt className="p-title">Deposit</dt>
                    <dd className="mt-1 text-[0.8125rem]">
                      {money(lead.event.depositAmount)}{" "}
                      {lead.event.depositPaid ? (
                        <span className="p-ok">received</span>
                      ) : (
                        <span className="p-bad">outstanding</span>
                      )}
                    </dd>
                  </div>
                ) : null}
              </dl>
            </Card>
          ) : null}

          {menu ? (
            <Card title="Menu">
              <div className="p-card-pad">
                <p className="text-[0.8125rem]">
                  {menu.serviceStyle} · version {menu.version}
                </p>
                <p className="mt-1.5">
                  <span
                    className={`p-badge ${menu.status === "locked" ? "p-ok" : menu.status === "submitted" ? "p-warn" : "p-muted"}`}
                  >
                    {menu.status === "changes_requested" ? "changes requested" : menu.status}
                  </span>
                </p>
                <Link href={`/portal/menus/${menu.id}`} className="p-btn p-btn-sm mt-3 w-full">
                  <IconMenuBook className="h-4 w-4" />
                  Open the menu
                </Link>
              </div>
            </Card>
          ) : null}

          {lead.clientToken ? (
            <Card title="Their own page">
              <div className="p-card-pad">
                <p className="p-muted text-[0.8125rem] leading-snug">
                  The guest reaches their event page by magic link — no password, no account.
                </p>
                <Link
                  href={`/my-event/${lead.clientToken}`}
                  className="p-btn p-btn-sm mt-3 w-full"
                  target="_blank"
                >
                  View it as they see it
                  <IconArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </Card>
          ) : null}
        </aside>
      </div>
    </div>
  );
}
