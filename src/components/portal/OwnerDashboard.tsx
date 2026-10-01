import Link from "next/link";
import type { Session } from "@/lib/portal/types";
import {
  actionQueue,
  calendarOutlook,
  effectiveBand,
  funnelMetrics,
  getLeads,
  getQueue,
  lossReasons,
  pipelineValue,
  upcomingEvents,
} from "@/lib/portal/store";
import { BANDS } from "@/lib/portal/scoring";
import {
  BandBadge,
  Card,
  EmptyState,
  Stat,
  UrgencyIcon,
  longDate,
  money,
  relativeTime,
  shortDate,
} from "./Ui";
import {
  IconAlert,
  IconArrowRight,
  IconCheck,
  IconFlame,
  IconMegaphone,
  IconSpark,
} from "./Icons";

export default function OwnerDashboard({ session }: { session: Session }) {
  const actions = actionQueue().filter((a) => a.owner !== "assistant");
  const events = upcomingEvents(4);
  const funnel = funnelMetrics();
  const value = pipelineValue();
  const calendar = calendarOutlook(8);
  const queue = getQueue();
  const losses = lossReasons();
  const leads = getLeads();

  const newLeads = leads
    .filter((l) => l.stage === "new")
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const openPrimeDates = calendar.filter(
    (d) => d.isWeekendPrime && !d.booked && d.inPressureWindow,
  );

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="p-title">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </p>
          <h1 className="t-h3 mt-1.5">Good to see you, {session.name}.</h1>
        </div>
        <Link href="/portal/leads" className="p-btn p-btn-sm">
          Open the pipeline
          <IconArrowRight className="h-4 w-4" />
        </Link>
      </header>

      {/* ── What needs him. The most valuable panel in the portal. ────────── */}
      <Card
        title={`Needs you${actions.length > 0 ? ` — ${actions.length}` : ""}`}
        action={
          actions.filter((a) => a.urgency === "overdue").length > 0 ? (
            <span className="p-badge p-bad">
              {actions.filter((a) => a.urgency === "overdue").length} slipping
            </span>
          ) : (
            <span className="p-badge p-ok">All clear</span>
          )
        }
      >
        {actions.length === 0 ? (
          <EmptyState
            title="Nothing is on fire."
            body="No unanswered guests, no unpaid deposits, no unlocked menus inside three weeks. Go and cook."
          />
        ) : (
          <ul className="divide-y divide-[color:var(--color-line-dark)]">
            {actions.slice(0, 7).map((a) => (
              <li key={a.id}>
                <Link
                  href={a.href}
                  className="flex items-start gap-3 px-5 py-3.5 transition-colors hover:bg-[color:color-mix(in_srgb,var(--color-bone)_4%,transparent)]"
                >
                  <span className="mt-0.5">
                    <UrgencyIcon urgency={a.urgency} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium">{a.title}</span>
                    <span className="p-muted block text-[0.8125rem] leading-snug">{a.detail}</span>
                  </span>
                  <IconArrowRight className="p-muted mt-1 h-4 w-4 shrink-0" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {/* ── Money. Owner only — this whole block is never rendered for her. ─ */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat
          label="On the books"
          value={money(value.onTheBooks)}
          hint="Confirmed events still ahead of you"
        />
        <Stat
          label="Out for decision"
          value={money(value.quoted)}
          hint="Quoted and waiting on the client"
        />
        <Stat
          label="Average event"
          value={money(value.averageEventValue)}
          hint="Across every booking on record"
        />
        <Stat
          label="Deposits held"
          value={money(value.collected)}
          hint="Cash already in for future dates"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        {/* ── Next events, with the four things that blow one up. ─────────── */}
        <Card
          title="Next out of the kitchen"
          action={
            <Link href="/portal/events" className="p-link">
              All events
            </Link>
          }
        >
          {events.length === 0 ? (
            <EmptyState
              title="Nothing booked yet."
              body="Confirmed events appear here with their readiness flags."
              cta={{ href: "/portal/leads", label: "Look at the pipeline" }}
            />
          ) : (
            <ul className="divide-y divide-[color:var(--color-line-dark)]">
              {events.map(({ lead, daysOut, flags }) => (
                <li key={lead.id} className="px-5 py-4">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <div>
                      <Link
                        href={`/portal/events/${lead.id}`}
                        className="text-[0.9375rem] font-medium hover:text-[color:var(--color-accent-soft)]"
                      >
                        {lead.name}
                      </Link>
                      <p className="p-muted text-[0.8125rem]">
                        {longDate(lead.eventDate)} · {lead.guestCount} guests · {lead.venueCity}
                      </p>
                    </div>
                    <span
                      className={`p-badge ${daysOut <= 7 ? "p-warn" : "p-muted"}`}
                    >
                      {daysOut === 0 ? "Today" : daysOut === 1 ? "Tomorrow" : `${daysOut} days`}
                    </span>
                  </div>

                  <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
                    {flags.map((f) => (
                      <li key={f.label} className="flex items-center gap-1.5 text-[0.8125rem]">
                        {f.ok ? (
                          <IconCheck className="p-ok h-3.5 w-3.5" />
                        ) : (
                          <IconAlert className="p-bad h-3.5 w-3.5" />
                        )}
                        <span className={f.ok ? "p-muted" : "p-bad"}>{f.label}</span>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* ── The filter, working. This is the panel he asked for. ────────── */}
        <Card title="The filter, this period">
          <div className="p-card-pad space-y-4">
            <div>
              <p className="p-figure">{funnel.total}</p>
              <p className="p-muted text-[0.8125rem]">enquiries scored</p>
            </div>

            <ul className="space-y-2">
              {(["A", "B", "C", "D"] as const).map((band) => {
                const n = funnel.byBand[band];
                const pct = funnel.total === 0 ? 0 : Math.round((n / funnel.total) * 100);
                return (
                  <li key={band}>
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="text-[0.8125rem]">
                        <span className={`p-band-${band} font-semibold`}>{band}</span>{" "}
                        <span className="p-muted">{BANDS[band].label}</span>
                      </span>
                      <span className="text-[0.8125rem] font-medium tabular-nums">
                        {n} <span className="p-muted">· {pct}%</span>
                      </span>
                    </div>
                    <div className="p-meter mt-1">
                      <span style={{ width: `${Math.max(pct, n > 0 ? 3 : 0)}%` }} />
                    </div>
                  </li>
                );
              })}
            </ul>

            <div className="p-hairline space-y-2 pt-4">
              <div className="flex items-start gap-2">
                <IconSpark className="p-ok mt-0.5 h-4 w-4 shrink-0" />
                <p className="text-[0.8125rem] leading-snug">
                  <span className="font-medium">
                    {funnel.autoHandled} enquir{funnel.autoHandled === 1 ? "y" : "ies"} handled
                    without you
                  </span>{" "}
                  <span className="p-muted">
                    — roughly {funnel.hoursSaved} hours you did not spend on people who were
                    never going to book.
                  </span>
                </p>
              </div>
              {funnel.medianReplyHours !== null ? (
                <p className="p-muted text-[0.8125rem] leading-snug">
                  Median time to first reply:{" "}
                  <span className="font-medium text-[color:var(--color-bone)]">
                    {funnel.medianReplyHours < 1
                      ? "under an hour"
                      : `${funnel.medianReplyHours.toFixed(1)} hours`}
                  </span>
                </p>
              ) : null}
              <p className="p-muted text-[0.8125rem] leading-snug">
                {funnel.booked} booked from {funnel.reachedHuman} that reached a human —{" "}
                <span className="font-medium text-[color:var(--color-bone)]">
                  {Math.round(funnel.conversionOfQualified * 100)}%
                </span>
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* ── Calendar heat, and the campaign it triggers. ──────────────────── */}
      <Card
        title="The next eight weeks"
        action={
          <span className="p-muted text-[0.8125rem]">
            Crimson is booked · amber is an open weekend inside three weeks
          </span>
        }
      >
        <div className="p-card-pad">
          <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
            {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
              <span key={i} className="p-muted pb-1 text-center text-[0.625rem] tracking-widest">
                {d}
              </span>
            ))}
            {calendar.map((d) => {
              const dayNum = Number(d.date.slice(8, 10));
              const openPressure = d.isWeekendPrime && !d.booked && d.inPressureWindow;
              const cls = d.booked
                ? "p-day p-day-booked"
                : openPressure
                  ? "p-day p-day-open-pressure"
                  : d.isWeekendPrime
                    ? "p-day p-day-prime"
                    : "p-day";
              const label = d.booked
                ? `${shortDate(d.date)} — booked, ${d.booked.name}`
                : openPressure
                  ? `${shortDate(d.date)} — open weekend date inside the three-week window`
                  : shortDate(d.date);
              return (
                <span key={d.date} className={cls} title={label}>
                  <span className="sr-only">{label}</span>
                  <span aria-hidden="true">{dayNum}</span>
                </span>
              );
            })}
          </div>

          {openPrimeDates.length > 0 ? (
            <div className="p-hairline mt-4 flex flex-wrap items-center gap-3 pt-4">
              <IconFlame className="p-warn h-5 w-5 shrink-0" />
              {/* basis-48 keeps the text at least ~12rem wide, so on a phone the
                  button wraps below it instead of squeezing it into a sliver. */}
              <p className="min-w-0 flex-1 basis-48 text-[0.8125rem] leading-snug">
                <span className="font-medium">
                  {openPrimeDates.length} prime date
                  {openPrimeDates.length === 1 ? "" : "s"} open inside three weeks
                </span>{" "}
                <span className="p-muted">
                  — {openPrimeDates.slice(0, 3).map((d) => shortDate(d.date)).join(", ")}
                  {openPrimeDates.length > 3 ? ` and ${openPrimeDates.length - 3} more` : ""}. The
                  Open Weekend campaign has already queued for the first one.
                </span>
              </p>
              <Link href="/portal/marketing" className="p-btn p-btn-sm">
                <IconMegaphone className="h-4 w-4" />
                See the queue
              </Link>
            </div>
          ) : null}
        </div>
      </Card>

      <div className="grid gap-6 xl:grid-cols-2">
        {/* ── New enquiries, newest first. ────────────────────────────────── */}
        <Card
          title={`New enquiries${newLeads.length > 0 ? ` — ${newLeads.length}` : ""}`}
          action={
            <Link href="/portal/leads" className="p-link">
              All enquiries
            </Link>
          }
        >
          {newLeads.length === 0 ? (
            <EmptyState title="Inbox clear." body="New enquiries land here the moment they are scored." />
          ) : (
            <ul className="divide-y divide-[color:var(--color-line-dark)]">
              {newLeads.slice(0, 5).map((lead) => (
                <li key={lead.id}>
                  <Link
                    href={`/portal/leads/${lead.id}`}
                    className="flex items-start gap-3 px-5 py-3.5 transition-colors hover:bg-[color:color-mix(in_srgb,var(--color-bone)_4%,transparent)]"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-baseline gap-2">
                        <span className="text-sm font-medium">{lead.name}</span>
                        <BandBadge band={effectiveBand(lead)} overridden={Boolean(lead.scoreOverride)} />
                      </span>
                      <span className="p-muted mt-0.5 block text-[0.8125rem] leading-snug">
                        {lead.guestCount} guests · {shortDate(lead.eventDate)} · {lead.venueCity || "venue TBC"} ·{" "}
                        {relativeTime(lead.createdAt)}
                      </span>
                    </span>
                    <span className="p-figure-sm shrink-0 tabular-nums">{lead.score.total}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* ── Where he is losing, and what it costs. ──────────────────────── */}
        <Card title="Why work is being lost">
          {losses.length === 0 ? (
            <EmptyState title="Nothing lost yet." body="Closed enquiries get a reason, and the reasons group here." />
          ) : (
            <div className="p-card-pad">
              <ul className="space-y-3">
                {losses.map((l) => (
                  <li key={l.reason} className="flex items-start justify-between gap-3">
                    <span className="min-w-0 text-[0.8125rem] leading-snug">{l.reason}</span>
                    <span className="shrink-0 text-right">
                      <span className="block text-sm font-medium tabular-nums">{l.count}</span>
                      {l.value > 0 ? (
                        <span className="p-muted block text-[0.6875rem] tabular-nums">{money(l.value)}</span>
                      ) : null}
                    </span>
                  </li>
                ))}
              </ul>
              {value.lostValue > 0 ? (
                <p className="p-hairline p-muted mt-4 pt-3 text-[0.8125rem] leading-snug">
                  {money(value.lostValue)} of quoted work went elsewhere. If most of it is one
                  reason, that is the thing to fix next — not the marketing.
                </p>
              ) : null}
            </div>
          )}
        </Card>
      </div>

      {/* ── This week's marketing, so he never wonders what went out. ────── */}
      <Card
        title="Going out this week"
        action={
          <Link href="/portal/marketing" className="p-btn p-btn-sm">
            <IconMegaphone className="h-4 w-4" />
            Marketing
          </Link>
        }
      >
        {queue.length === 0 ? (
          <EmptyState
            title="Nothing queued."
            body="The engine composes a fresh queue every Monday from your open dates and the season."
            cta={{ href: "/portal/marketing", label: "Open marketing" }}
          />
        ) : (
          <ul className="divide-y divide-[color:var(--color-line-dark)]">
            {queue.slice(0, 4).map((q) => (
              <li key={q.id} className="flex flex-wrap items-baseline gap-x-3 gap-y-1 px-5 py-3">
                <span className="text-sm font-medium">{q.title}</span>
                <span className="p-badge p-muted">{q.channel}</span>
                <span className="p-muted text-[0.8125rem]">
                  {new Date(q.scheduledFor).toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                    timeZone: "UTC",
                  })}
                </span>
                <span
                  className={`p-badge ml-auto ${q.status === "approved" ? "p-ok" : q.status === "skipped" ? "p-muted" : "p-warn"}`}
                >
                  {q.status === "proposed" ? "Awaiting you" : q.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
