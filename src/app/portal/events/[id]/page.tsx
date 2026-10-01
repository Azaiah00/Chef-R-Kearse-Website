import Link from "next/link";
import { notFound } from "next/navigation";
import { requireStaff } from "@/lib/portal/guard";
import { canSeeFinancials, getLead, getMenuForLead } from "@/lib/portal/store";
import { daysBetween } from "@/lib/portal/scoring";
import { generatePrep } from "@/lib/portal/prep";
import { bySlug } from "@/lib/dishes";
import { Card, EmptyState, longDate, money } from "@/components/portal/Ui";
import { IconAlert, IconClock, IconMenuBook } from "@/components/portal/Icons";
import RunSheet from "@/components/portal/RunSheet";
import PrepPanel from "@/components/portal/PrepPanel";

export const metadata = { title: "Event" };

export default async function EventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await requireStaff();
  const lead = getLead(id);
  if (!lead) notFound();

  const showMoney = canSeeFinancials(session.role);
  const menu = getMenuForLead(lead.id);
  const daysOut = lead.eventDate
    ? daysBetween(new Date(), new Date(`${lead.eventDate}T12:00:00Z`))
    : null;

  const prep = menu ? generatePrep(menu, lead.event?.serviceTime ?? null) : null;

  return (
    <div className="space-y-6">
      <nav aria-label="Breadcrumb" className="p-muted text-[0.8125rem]">
        <Link href="/portal/events" className="p-link">
          Events
        </Link>
        <span aria-hidden="true"> / </span>
        <span>{lead.name}</span>
      </nav>

      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="t-h3">{lead.name}</h1>
          <p className="p-muted mt-1.5 text-sm">
            {longDate(lead.eventDate)} · {lead.guestCount} guests ·{" "}
            {lead.event?.serviceStyle ?? menu?.serviceStyle ?? "service style to confirm"}
          </p>
          <p className="p-muted text-sm">
            {lead.event?.addressLine ?? lead.venueCity ?? "Venue to confirm"}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {daysOut !== null ? (
            <span className={`p-badge ${daysOut <= 7 ? "p-warn" : "p-muted"}`}>
              {daysOut === 0 ? "Today" : daysOut === 1 ? "Tomorrow" : `${daysOut} days out`}
            </span>
          ) : null}
          <Link href={`/portal/leads/${lead.id}`} className="p-btn p-btn-sm">
            The enquiry
          </Link>
        </div>
      </header>

      {lead.event ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="p-card p-card-pad">
            <p className="p-title">Load in</p>
            <p className="p-figure-sm mt-2">{lead.event.loadInTime}</p>
          </div>
          <div className="p-card p-card-pad">
            <p className="p-title">Service</p>
            <p className="p-figure-sm mt-2">{lead.event.serviceTime}</p>
          </div>
          <div className="p-card p-card-pad">
            <p className="p-title">On the floor</p>
            <p className="mt-2 text-[0.8125rem] leading-snug">
              {lead.event.staffAssigned.join(", ")}
            </p>
          </div>
          {showMoney ? (
            <div className="p-card p-card-pad">
              <p className="p-title">Balance due</p>
              <p className="p-figure-sm mt-2">{money(lead.event.balanceDue)}</p>
              <p className="p-muted mt-1 text-[0.75rem]">
                {money(lead.event.depositAmount)}{" "}
                {lead.event.depositPaid ? "deposit received" : "deposit outstanding"}
              </p>
            </div>
          ) : (
            <div className="p-card p-card-pad">
              <p className="p-title">Deposit</p>
              <p className={`p-figure-sm mt-2 ${lead.event.depositPaid ? "p-ok" : "p-bad"}`}>
                {lead.event.depositPaid ? "Received" : "Outstanding"}
              </p>
            </div>
          )}
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[1fr_22rem]">
        <div className="space-y-6">
          {/* ── The locked menu, as it will be cooked. ─────────────────────── */}
          <Card
            title="The menu"
            action={
              menu ? (
                <Link
                  href={`/portal/menus/${menu.id}`}
                  className="p-link"
                >
                  Open it
                </Link>
              ) : null
            }
          >
            {!menu ? (
              <EmptyState
                title="No menu yet."
                body="The guest builds their menu on their own event page, and it appears here the moment they submit it."
              />
            ) : (
              <div>
                <div className="p-card-pad p-hairline flex flex-wrap items-center gap-2 border-t-0">
                  <span
                    className={`p-badge ${menu.status === "locked" ? "p-ok" : menu.status === "submitted" ? "p-warn" : "p-muted"}`}
                  >
                    {menu.status === "changes_requested" ? "changes requested" : menu.status}
                  </span>
                  <span className="p-muted text-[0.8125rem]">
                    version {menu.version} · {menu.serviceStyle}
                  </span>
                  {menu.status !== "locked" && daysOut !== null && daysOut <= 10 ? (
                    <span className="p-bad ml-auto flex items-center gap-1.5 text-[0.8125rem]">
                      <IconAlert className="h-3.5 w-3.5" />
                      Not locked with {daysOut} days to go
                    </span>
                  ) : null}
                </div>
                <ul className="divide-y divide-[color:var(--color-line-dark)]">
                  {menu.courses.map((course) => (
                    <li key={course.id} className="px-5 py-3.5">
                      <p className="p-title">{course.name}</p>
                      {course.selected.length === 0 ? (
                        <p className="p-muted mt-1.5 text-[0.8125rem]">Nothing chosen yet</p>
                      ) : (
                        <ul className="mt-1.5 space-y-1">
                          {course.selected.map((slug) => (
                            <li key={slug} className="text-[0.875rem] leading-snug">
                              {bySlug(slug)?.title ?? slug}
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  ))}
                  {menu.addOns.filter((a) => a.selected).length > 0 ? (
                    <li className="px-5 py-3.5">
                      <p className="p-title">Also booked</p>
                      <ul className="mt-1.5 space-y-1">
                        {menu.addOns
                          .filter((a) => a.selected)
                          .map((a) => (
                            <li key={a.id} className="text-[0.875rem] leading-snug">
                              {a.label}
                              {a.note ? <span className="p-muted"> — {a.note}</span> : null}
                            </li>
                          ))}
                      </ul>
                    </li>
                  ) : null}
                </ul>
              </div>
            )}
          </Card>

          {/* ── Dietary board. The thing that must not be got wrong. ──────── */}
          {menu && menu.guestDietary.length > 0 ? (
            <Card
              title="Allergies and dietary"
              action={<span className="p-badge p-warn">Read before service</span>}
            >
              <ul className="divide-y divide-[color:var(--color-line-dark)]">
                {menu.guestDietary.map((g) => (
                  <li key={g.id} className="px-5 py-3">
                    <p className="text-[0.875rem] font-medium">{g.label}</p>
                    <ul className="mt-1.5 flex flex-wrap gap-1.5">
                      {g.restrictions.map((r) => (
                        <li key={r} className="p-badge p-warn">
                          {r}
                        </li>
                      ))}
                    </ul>
                    {g.notes ? (
                      <p className="mt-1.5 text-[0.8125rem] leading-snug">{g.notes}</p>
                    ) : null}
                  </li>
                ))}
              </ul>
              {prep && prep.conflicts.length > 0 ? (
                <div className="p-card-pad p-hairline">
                  <p className="p-bad flex items-center gap-1.5 text-[0.8125rem] font-medium">
                    <IconAlert className="h-4 w-4" />
                    {prep.conflicts.length} conflict
                    {prep.conflicts.length === 1 ? "" : "s"} between the menu and a guest
                  </p>
                  <ul className="mt-2 space-y-1.5">
                    {prep.conflicts.map((c, i) => (
                      <li key={i} className="text-[0.8125rem] leading-snug">
                        <span className="font-medium">{c.guest}</span>{" "}
                        <span className="p-muted">({c.restriction})</span> — {c.dishes.join(", ")}
                      </li>
                    ))}
                  </ul>
                  <p className="p-muted mt-2 text-[0.75rem] leading-snug">
                    Flagged for a human to resolve, never auto-cleared. Allergen groups are read
                    from what is visible in each photograph, so this is a prompt to check, not a
                    dietary clearance.
                  </p>
                </div>
              ) : null}
              <p className="p-card-pad p-muted p-hairline text-[0.75rem] leading-relaxed">
                Prepared in a kitchen that handles shellfish, fish, dairy, egg, gluten and nuts.
                Cross-contact cannot be ruled out. Dietary flags come from the guest and from the
                chef only — nothing here is inferred.
              </p>
            </Card>
          ) : null}

          {/* ── The generated prep and shopping list. ─────────────────────── */}
          {menu && prep ? (
            <PrepPanel
              prep={prep}
              menuStatus={menu.status}
              guestCount={menu.guestCount}
              serviceTime={lead.event?.serviceTime ?? null}
            />
          ) : null}
        </div>

        <aside className="space-y-6">
          {lead.event ? (
            <RunSheet leadId={lead.id} items={lead.event.runSheet} role={session.role} />
          ) : (
            <Card title="Run-sheet">
              <EmptyState
                title="Not created yet."
                body="A run-sheet is generated when the event is confirmed and the deposit is in."
              />
            </Card>
          )}

          <Card title="Timeline on the day">
            <div className="p-card-pad">
              {lead.event ? (
                <ol className="space-y-3">
                  {[
                    { time: lead.event.loadInTime, label: "Load in and set up" },
                    { time: lead.event.serviceTime, label: "First course away" },
                  ].map((row) => (
                    <li key={row.label} className="flex items-start gap-2.5">
                      <IconClock className="p-muted mt-0.5 h-4 w-4 shrink-0" />
                      <div>
                        <p className="text-[0.875rem] font-medium">{row.time}</p>
                        <p className="p-muted text-[0.8125rem]">{row.label}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="p-muted text-[0.8125rem]">Times are set once the event is confirmed.</p>
              )}
            </div>
          </Card>

          {menu ? (
            <Card title="Guest's own page">
              <div className="p-card-pad">
                <p className="p-muted text-[0.8125rem] leading-snug">
                  What {lead.name.split(" ")[0]} sees — the menu, the timings and the conversation.
                </p>
                {lead.clientToken ? (
                  <Link
                    href={`/my-event/${lead.clientToken}`}
                    target="_blank"
                    className="p-btn p-btn-sm mt-3 w-full"
                  >
                    <IconMenuBook className="h-4 w-4" />
                    Open their page
                  </Link>
                ) : (
                  <p className="p-muted mt-2 text-[0.8125rem]">
                    No link issued yet — it goes out with the confirmation.
                  </p>
                )}
              </div>
            </Card>
          ) : null}
        </aside>
      </div>
    </div>
  );
}
