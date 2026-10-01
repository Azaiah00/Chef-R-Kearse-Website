import Link from "next/link";
import { requireStaff } from "@/lib/portal/guard";
import { getLeads, getMenuForLead } from "@/lib/portal/store";
import { daysBetween } from "@/lib/portal/scoring";
import { generatePrep } from "@/lib/portal/prep";
import { Card, EmptyState, relativeTime } from "@/components/portal/Ui";
import { IconAlert, IconArrowRight, IconCheck } from "@/components/portal/Icons";

export const metadata = { title: "Menus" };

export default async function MenusPage() {
  await requireStaff();
  const today = new Date();

  const rows = getLeads()
    .map((lead) => {
      const menu = getMenuForLead(lead.id);
      if (!menu) return null;
      const days = lead.eventDate
        ? daysBetween(today, new Date(`${lead.eventDate}T12:00:00Z`))
        : null;
      const prep = generatePrep(menu, lead.event?.serviceTime ?? null);
      const chosen = menu.courses.reduce((s, c) => s + c.selected.length, 0);
      const needed = menu.courses.reduce((s, c) => s + c.picks, 0);
      return { lead, menu, days, prep, chosen, needed };
    })
    .filter((r): r is NonNullable<typeof r> => r !== null)
    // Waiting on the chef first, then soonest.
    .sort((a, b) => {
      const aWait = a.menu.status === "submitted" ? 0 : 1;
      const bWait = b.menu.status === "submitted" ? 0 : 1;
      if (aWait !== bWait) return aWait - bWait;
      return (a.days ?? 9999) - (b.days ?? 9999);
    });

  const waiting = rows.filter((r) => r.menu.status === "submitted");

  return (
    <div className="space-y-6">
      <header>
        <h1 className="t-h3">Menus</h1>
        <p className="p-muted mt-1 text-sm">
          {rows.length} in progress
          {waiting.length > 0 ? ` · ${waiting.length} waiting on your review` : " · none waiting on you"}
        </p>
      </header>

      <Card title="Every menu">
        {rows.length === 0 ? (
          <EmptyState
            title="No menus yet."
            body="A menu is created for a guest when they reach quoting, and they build it on their own event page."
          />
        ) : (
          <ul className="divide-y divide-[color:var(--color-line-dark)]">
            {rows.map(({ lead, menu, days, prep, chosen, needed }) => (
              <li key={menu.id}>
                <Link
                  href={`/portal/menus/${menu.id}`}
                  className="block px-5 py-4 transition-colors hover:bg-[color:color-mix(in_srgb,var(--color-bone)_4%,transparent)]"
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-[0.9375rem] font-medium">{lead.name}</p>
                      <p className="p-muted text-[0.8125rem]">
                        {menu.serviceStyle} · {menu.guestCount} guests · version {menu.version}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <span
                        className={`p-badge ${
                          menu.status === "locked"
                            ? "p-ok"
                            : menu.status === "submitted"
                              ? "p-warn"
                              : menu.status === "changes_requested"
                                ? "p-bad"
                                : "p-muted"
                        }`}
                      >
                        {menu.status === "changes_requested" ? "changes requested" : menu.status}
                      </span>
                      {days !== null ? (
                        <span className={`p-badge ${days <= 10 && menu.status !== "locked" ? "p-bad" : "p-muted"}`}>
                          {days < 0 ? "past" : days === 0 ? "today" : `${days} days`}
                        </span>
                      ) : null}
                      <IconArrowRight className="p-muted h-4 w-4" />
                    </div>
                  </div>

                  <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[0.8125rem]">
                    <span className="flex items-center gap-1.5">
                      {chosen >= needed ? (
                        <IconCheck className="p-ok h-3.5 w-3.5" />
                      ) : (
                        <IconAlert className="p-warn h-3.5 w-3.5" />
                      )}
                      <span className={chosen >= needed ? "p-muted" : "p-warn"}>
                        {chosen} of {needed} choices made
                      </span>
                    </span>
                    {prep.conflicts.length > 0 ? (
                      <span className="p-bad flex items-center gap-1.5">
                        <IconAlert className="h-3.5 w-3.5" />
                        {prep.conflicts.length} dietary conflict
                        {prep.conflicts.length === 1 ? "" : "s"}
                      </span>
                    ) : menu.guestDietary.length > 0 ? (
                      <span className="p-ok flex items-center gap-1.5">
                        <IconCheck className="h-3.5 w-3.5" />
                        No conflicts
                      </span>
                    ) : null}
                    <span className="p-muted ml-auto">edited {relativeTime(menu.updatedAt)}</span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
