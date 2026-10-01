import Link from "next/link";
import type { Session } from "@/lib/portal/types";
import {
  actionQueue,
  assistantSeesFinancials,
  effectiveBand,
  getLeads,
  getMenuForLead,
  unreadForStaff,
  upcomingEvents,
} from "@/lib/portal/store";
import {
  BandBadge,
  Card,
  EmptyState,
  UrgencyIcon,
  longDate,
  money,
  relativeTime,
  shortDate,
} from "./Ui";
import {
  IconArrowRight,
  IconCalendar,
  IconChat,
  IconCheck,
  IconClipboard,
  IconMail,
  IconPhone,
} from "./Icons";

/**
 * THE ASSISTANT'S DESK
 *
 * We do not know yet what she actually does day to day — that is an open
 * question for the chef. So this is built on the safest assumption available:
 * an events assistant's job is chasing, coordinating and protecting the chef's
 * attention. That makes her screen a work queue, not a dashboard.
 *
 * Three deliberate choices, all of them easy to change once we can ask her:
 *   • Tasks first, in the order they should be done. No analytics above the fold.
 *   • Every item carries the next physical action, not a status. "Chase the
 *     deposit", not "Deposit: outstanding".
 *   • No revenue anywhere unless the chef switches it on in Settings. She needs
 *     the diary, not the P&L, and defaulting to closed is the respectful choice
 *     in both directions.
 */
export default function AssistantDesk({ session }: { session: Session }) {
  const showMoney = assistantSeesFinancials();
  const actions = actionQueue().filter((a) => a.owner !== "owner");
  const events = upcomingEvents(6);
  const unread = unreadForStaff();
  const leads = getLeads();

  const toScreen = leads
    .filter((l) => l.stage === "new" && effectiveBand(l) === "B")
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));

  const firstName = session.name.split(" ")[0];
  const overdue = actions.filter((a) => a.urgency === "overdue");
  const today = actions.filter((a) => a.urgency === "today");
  const soon = actions.filter((a) => a.urgency === "soon");

  const groups = [
    { key: "overdue", label: "Behind — do these first", items: overdue },
    { key: "today", label: "Today", items: today },
    { key: "soon", label: "This week", items: soon },
  ].filter((g) => g.items.length > 0);

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
          <h1 className="t-h3 mt-1.5">Morning, {firstName}.</h1>
          <p className="p-muted mt-1 text-sm">
            {actions.length === 0
              ? "Your desk is clear."
              : `${actions.length} thing${actions.length === 1 ? "" : "s"} on your desk${overdue.length > 0 ? `, ${overdue.length} of them behind` : ""}.`}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/portal/messages" className="p-btn p-btn-sm">
            <IconChat className="h-4 w-4" />
            Messages
            {unread.length > 0 ? <span className="p-badge p-band-B">{unread.length}</span> : null}
          </Link>
          <Link href="/portal/events" className="p-btn p-btn-sm">
            <IconCalendar className="h-4 w-4" />
            Events
          </Link>
        </div>
      </header>

      {/* ── The work, grouped by urgency, in the order to do it. ─────────── */}
      {groups.length === 0 ? (
        <Card title="Your desk">
          <EmptyState
            title="Nothing outstanding."
            body="No guests waiting, no deposits to chase, no tastings to book. Anything new will appear here the moment it lands."
          />
        </Card>
      ) : (
        <div className="space-y-4">
          {groups.map((group) => (
            <Card
              key={group.key}
              title={group.label}
              action={<span className="p-badge p-muted">{group.items.length}</span>}
            >
              <ul className="divide-y divide-[color:var(--color-line-dark)]">
                {group.items.map((a) => (
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
                        <span className="p-muted block text-[0.8125rem] leading-snug">
                          {a.detail}
                        </span>
                      </span>
                      <IconArrowRight className="p-muted mt-1 h-4 w-4 shrink-0" />
                    </Link>
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[1.3fr_1fr]">
        {/* ── Run-sheets: the operational view of each upcoming event. ───── */}
        <Card
          title="Events to run"
          action={
            <Link href="/portal/events" className="p-link">
              All events
            </Link>
          }
        >
          {events.length === 0 ? (
            <EmptyState title="Nothing in the diary." body="Confirmed events and their run-sheets appear here." />
          ) : (
            <ul className="divide-y divide-[color:var(--color-line-dark)]">
              {events.map(({ lead, daysOut }) => {
                const menu = getMenuForLead(lead.id);
                const runSheet = lead.event?.runSheet ?? [];
                const done = runSheet.filter((r) => r.done).length;
                const mine = runSheet.filter((r) => !r.done && r.owner === "assistant");
                return (
                  <li key={lead.id} className="px-5 py-4">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <Link
                        href={`/portal/events/${lead.id}`}
                        className="text-[0.9375rem] font-medium hover:text-[color:var(--color-accent-soft)]"
                      >
                        {lead.name}
                      </Link>
                      <span className={`p-badge ${daysOut <= 7 ? "p-warn" : "p-muted"}`}>
                        {daysOut === 0 ? "Today" : daysOut === 1 ? "Tomorrow" : `${daysOut} days`}
                      </span>
                    </div>
                    <p className="p-muted mt-0.5 text-[0.8125rem]">
                      {longDate(lead.eventDate)} · {lead.guestCount} guests ·{" "}
                      {lead.event?.serviceStyle ?? menu?.serviceStyle ?? "service style TBC"}
                    </p>

                    {runSheet.length > 0 ? (
                      <>
                        <div className="mt-3 flex items-center gap-2">
                          <div className="p-meter flex-1">
                            <span style={{ width: `${Math.round((done / runSheet.length) * 100)}%` }} />
                          </div>
                          <span className="p-muted shrink-0 text-[0.6875rem] tabular-nums">
                            {done}/{runSheet.length}
                          </span>
                        </div>
                        {mine.length > 0 ? (
                          <ul className="mt-2.5 space-y-1">
                            {mine.map((r) => (
                              <li key={r.id} className="flex items-start gap-2 text-[0.8125rem]">
                                <span
                                  className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[color:var(--color-accent-soft)]"
                                  aria-hidden="true"
                                />
                                <span>{r.label}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="p-ok mt-2.5 flex items-center gap-1.5 text-[0.8125rem]">
                            <IconCheck className="h-3.5 w-3.5" />
                            Nothing outstanding on your side
                          </p>
                        )}
                      </>
                    ) : (
                      <p className="p-muted mt-2 text-[0.8125rem]">
                        No run-sheet yet — it is created when the event is confirmed.
                      </p>
                    )}

                    {showMoney && lead.bookedValue ? (
                      <p className="p-muted mt-2 text-[0.8125rem]">{money(lead.bookedValue)}</p>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        <div className="space-y-6">
          {/* ── Guests waiting on a reply, with one-tap contact. ─────────── */}
          <Card
            title={`Waiting on a reply${unread.length > 0 ? ` — ${unread.length}` : ""}`}
            action={
              <Link href="/portal/messages" className="p-link">
                Inbox
              </Link>
            }
          >
            {unread.length === 0 ? (
              <EmptyState title="Everyone has been answered." body="Nothing is sitting unread." />
            ) : (
              <ul className="divide-y divide-[color:var(--color-line-dark)]">
                {unread.slice(0, 5).map((msg) => {
                  const lead = leads.find((l) => l.id === msg.leadId);
                  if (!lead) return null;
                  return (
                    <li key={msg.id} className="px-5 py-3.5">
                      <div className="flex items-baseline justify-between gap-2">
                        <Link
                          href={`/portal/leads/${lead.id}`}
                          className="text-sm font-medium hover:text-[color:var(--color-accent-soft)]"
                        >
                          {lead.name}
                        </Link>
                        <span className="p-muted shrink-0 text-[0.6875rem]">
                          {relativeTime(msg.at)}
                        </span>
                      </div>
                      <p className="p-muted mt-1 line-clamp-2 text-[0.8125rem] leading-snug">
                        {msg.body}
                      </p>
                      <div className="mt-2 flex gap-2">
                        <a href={`tel:${lead.phone.replace(/\D/g, "")}`} className="p-btn p-btn-sm">
                          <IconPhone className="h-3.5 w-3.5" />
                          Call
                        </a>
                        <a href={`mailto:${lead.email}`} className="p-btn p-btn-sm">
                          <IconMail className="h-3.5 w-3.5" />
                          Email
                        </a>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>

          {/* ── B-band enquiries she screens before the chef sees them. ──── */}
          <Card title={`To screen${toScreen.length > 0 ? ` — ${toScreen.length}` : ""}`}>
            {toScreen.length === 0 ? (
              <EmptyState
                title="Nothing to screen."
                body="Qualified enquiries that need a look before they reach the chef land here. Priority enquiries go straight to him."
              />
            ) : (
              <ul className="divide-y divide-[color:var(--color-line-dark)]">
                {toScreen.map((lead) => (
                  <li key={lead.id}>
                    <Link
                      href={`/portal/leads/${lead.id}`}
                      className="block px-5 py-3.5 transition-colors hover:bg-[color:color-mix(in_srgb,var(--color-bone)_4%,transparent)]"
                    >
                      <span className="flex flex-wrap items-baseline gap-2">
                        <span className="text-sm font-medium">{lead.name}</span>
                        <BandBadge band={effectiveBand(lead)} />
                      </span>
                      <span className="p-muted mt-0.5 block text-[0.8125rem] leading-snug">
                        {lead.guestCount} guests · {shortDate(lead.eventDate)} ·{" "}
                        {relativeTime(lead.createdAt)}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          {/* ── Honest note about what we do not know yet. ──────────────── */}
          <Card title="Shape this screen">
            <div className="p-card-pad">
              <p className="flex items-start gap-2 text-[0.8125rem] leading-relaxed">
                <IconClipboard className="p-muted mt-0.5 h-4 w-4 shrink-0" />
                <span>
                  This desk was built on an assumption about how you work, not on asking you.
                  Tell us what you actually chase in a week — and what you wish you did not
                  have to — and this screen gets rebuilt around it.
                </span>
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
