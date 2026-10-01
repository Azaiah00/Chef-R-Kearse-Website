import Link from "next/link";
import { requireStaff } from "@/lib/portal/guard";
import { canSeeFinancials, getLeads, getMenuForLead, upcomingEvents } from "@/lib/portal/store";
import { daysBetween } from "@/lib/portal/scoring";
import { Card, EmptyState, longDate, money, shortDate } from "@/components/portal/Ui";
import { IconAlert, IconArrowRight, IconCheck } from "@/components/portal/Icons";

export const metadata = { title: "Events" };

export default async function EventsPage() {
  const session = await requireStaff();
  const showMoney = canSeeFinancials(session.role);
  const upcoming = upcomingEvents(20);
  const today = new Date();

  const past = getLeads()
    .filter(
      (l) =>
        l.eventDate &&
        l.stage === "completed" &&
        daysBetween(today, new Date(`${l.eventDate}T12:00:00Z`)) < 0,
    )
    .sort((a, b) => (b.eventDate as string).localeCompare(a.eventDate as string));

  return (
    <div className="space-y-6">
      <header>
        <h1 className="t-h3">Events</h1>
        <p className="p-muted mt-1 text-sm">
          {upcoming.length} ahead · {past.length} delivered
        </p>
      </header>

      <Card title="Coming up">
        {upcoming.length === 0 ? (
          <EmptyState
            title="Nothing in the diary."
            body="An event appears here as soon as an enquiry reaches contract stage, and its run-sheet is created when it is confirmed."
            cta={{ href: "/portal/leads", label: "Open the pipeline" }}
          />
        ) : (
          <ul className="divide-y divide-[color:var(--color-line-dark)]">
            {upcoming.map(({ lead, daysOut, flags }) => {
              const menu = getMenuForLead(lead.id);
              const runSheet = lead.event?.runSheet ?? [];
              const done = runSheet.filter((r) => r.done).length;
              return (
                <li key={lead.id}>
                  <Link
                    href={`/portal/events/${lead.id}`}
                    className="block px-5 py-4 transition-colors hover:bg-[color:color-mix(in_srgb,var(--color-bone)_4%,transparent)]"
                  >
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-[0.9375rem] font-medium">{lead.name}</p>
                        <p className="p-muted text-[0.8125rem]">
                          {longDate(lead.eventDate)} · {lead.guestCount} guests ·{" "}
                          {lead.event?.serviceStyle ?? menu?.serviceStyle ?? "service style TBC"}
                        </p>
                        <p className="p-muted text-[0.8125rem]">
                          {lead.event?.addressLine ?? lead.venueCity ?? "Venue to confirm"}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        {showMoney && lead.bookedValue ? (
                          <span className="text-sm font-medium tabular-nums">
                            {money(lead.bookedValue)}
                          </span>
                        ) : null}
                        <span className={`p-badge ${daysOut <= 7 ? "p-warn" : "p-muted"}`}>
                          {daysOut === 0 ? "Today" : daysOut === 1 ? "Tomorrow" : `${daysOut} days`}
                        </span>
                        <IconArrowRight className="p-muted h-4 w-4" />
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
                      <ul className="flex flex-wrap gap-x-3 gap-y-1">
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
                      {runSheet.length > 0 ? (
                        <span className="p-muted ml-auto text-[0.75rem] tabular-nums">
                          run-sheet {done}/{runSheet.length}
                        </span>
                      ) : null}
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      {past.length > 0 ? (
        <Card title="Delivered">
          <div className="p-scroll-x">
            <table className="p-table p-table-hover">
              <thead>
                <tr>
                  <th scope="col">Guest</th>
                  <th scope="col">Date</th>
                  <th scope="col">Guests</th>
                  {showMoney ? <th scope="col">Final</th> : null}
                  {showMoney ? <th scope="col">Against quote</th> : null}
                </tr>
              </thead>
              <tbody>
                {past.map((lead) => {
                  const delta =
                    lead.bookedValue && lead.quotedValue ? lead.bookedValue - lead.quotedValue : null;
                  return (
                    <tr key={lead.id}>
                      <td>
                        <Link
                          href={`/portal/leads/${lead.id}`}
                          className="font-medium hover:text-[color:var(--color-accent-soft)]"
                        >
                          {lead.name}
                        </Link>
                      </td>
                      <td className="whitespace-nowrap">{shortDate(lead.eventDate)}</td>
                      <td className="tabular-nums">{lead.guestCount}</td>
                      {showMoney ? (
                        <td className="tabular-nums whitespace-nowrap">{money(lead.bookedValue)}</td>
                      ) : null}
                      {showMoney ? (
                        <td className="whitespace-nowrap">
                          {delta === null ? (
                            "—"
                          ) : delta === 0 ? (
                            <span className="p-muted">on quote</span>
                          ) : (
                            <span className={delta > 0 ? "p-ok" : "p-warn"}>
                              {delta > 0 ? "+" : ""}
                              {money(delta)}
                            </span>
                          )}
                        </td>
                      ) : null}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      ) : null}
    </div>
  );
}
