import Link from "next/link";
import { notFound } from "next/navigation";
import { requireStaff } from "@/lib/portal/guard";
import { getLead, getMenu } from "@/lib/portal/store";
import { generatePrep } from "@/lib/portal/prep";
import { Card, longDate, relativeTime } from "@/components/portal/Ui";
import MenuBuilder from "@/components/portal/MenuBuilder";

export const metadata = { title: "Menu" };

export default async function MenuPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await requireStaff();
  const menu = getMenu(id);
  if (!menu) notFound();

  const lead = getLead(menu.leadId);
  if (!lead) notFound();

  const prep = generatePrep(menu, lead.event?.serviceTime ?? null);
  const generalComments = menu.comments.filter((c) => c.courseId === null);

  return (
    <div className="space-y-6">
      <nav aria-label="Breadcrumb" className="p-muted text-[0.8125rem]">
        <Link href="/portal/menus" className="p-link">
          Menus
        </Link>
        <span aria-hidden="true"> / </span>
        <span>{lead.name}</span>
      </nav>

      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="t-h3">{lead.name}</h1>
          <p className="p-muted mt-1.5 text-sm">
            {longDate(lead.eventDate)} · {menu.guestCount} guests · {menu.serviceStyle}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href={`/portal/leads/${lead.id}`} className="p-btn p-btn-sm">
            The enquiry
          </Link>
          {lead.event ? (
            <Link href={`/portal/events/${lead.id}`} className="p-btn p-btn-sm">
              The event
            </Link>
          ) : null}
          {lead.clientToken ? (
            <Link href={`/my-event/${lead.clientToken}`} target="_blank" className="p-btn p-btn-sm">
              As the guest sees it
            </Link>
          ) : null}
        </div>
      </header>

      {generalComments.length > 0 ? (
        <Card title="On the menu as a whole">
          <ul className="divide-y divide-[color:var(--color-line-dark)]">
            {generalComments.map((c) => (
              <li key={c.id} className="px-5 py-3">
                <p className="p-muted text-[0.6875rem]">
                  {c.authorName}
                  {c.authorType === "staff" ? " · the chef" : " · the guest"} · {relativeTime(c.at)}
                </p>
                <p className="mt-1 text-[0.875rem] leading-relaxed">{c.body}</p>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}

      <MenuBuilder menu={menu} as="staff" authorName={session.name} conflicts={prep.conflicts} />
    </div>
  );
}
