import Link from "next/link";
import { requireStaff } from "@/lib/portal/guard";
import { canSeeFinancials, effectiveBand, getLeads } from "@/lib/portal/store";
import { BANDS, STAGE_LABELS } from "@/lib/portal/scoring";
import { BandBadge, Card, money, relativeTime, shortDate } from "@/components/portal/Ui";
import PipelineBoard, { type BoardLead } from "@/components/portal/PipelineBoard";
import AddLead from "@/components/portal/AddLead";
import { EVENT_TYPE_LABELS } from "@/lib/portal/scoring";

export const metadata = { title: "Pipeline" };

export default async function LeadsPage() {
  const session = await requireStaff();
  const showMoney = canSeeFinancials(session.role);
  const leads = getLeads();

  const active = leads.filter((l) => l.stage !== "lost");
  const closed = leads.filter((l) => l.stage === "lost");

  const boardLeads: BoardLead[] = leads.map((l) => {
    const amount = l.bookedValue ?? l.quotedValue;
    return {
      id: l.id,
      ref: l.ref,
      name: l.name,
      stage: l.stage,
      eventType: l.eventType,
      eventDate: l.eventDate,
      guestCount: l.guestCount,
      band: effectiveBand(l),
      lostReason: l.lostReason,
      value:
        showMoney && amount !== null
          ? { amount, booked: l.bookedValue !== null }
          : null,
    };
  });

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="t-h3">{session.role === "owner" ? "Pipeline" : "Enquiries"}</h1>
          <p className="p-muted mt-1 text-sm">
            {active.length} live · {closed.length} closed · every enquiry scored on arrival
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {(["A", "B", "C", "D"] as const).map((b) => {
            const n = leads.filter((l) => effectiveBand(l) === b).length;
            return (
              <span key={b} className={`p-badge p-band-${b}`}>
                {b} {n}
              </span>
            );
          })}
          <span className="ml-1">
            <AddLead />
          </span>
        </div>
      </header>

      {/* The board. Drag a card between columns, or use the stage menu on any
          card — both write through the same path, so the dashboards, the events
          list and the reporting all move with it.

          The cards are built here, on the server, carrying only what a card
          draws. When the viewer may not see financials the value is omitted
          rather than hidden — the board is a client component, so anything
          passed to it is downloaded by the browser whether it is rendered or
          not. */}
      <PipelineBoard leads={boardLeads} canRemove={session.role === "owner"} />

      {/* ── Full table. Better than the board for scanning and for keyboards. */}
      <Card title="Every enquiry">
        <div className="p-scroll-x">
          <table className="p-table p-table-hover">
            <thead>
              <tr>
                <th scope="col">Guest</th>
                <th scope="col">Score</th>
                <th scope="col">Event</th>
                <th scope="col">Date</th>
                <th scope="col">Guests</th>
                <th scope="col">Stage</th>
                {showMoney ? <th scope="col">Value</th> : null}
                <th scope="col">Received</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr key={lead.id}>
                  <td>
                    <Link
                      href={`/portal/leads/${lead.id}`}
                      className="font-medium hover:text-[color:var(--color-accent-soft)]"
                    >
                      {lead.name}
                    </Link>
                    <span className="p-muted block text-[0.75rem]">{lead.ref}</span>
                  </td>
                  <td>
                    <span className="flex items-center gap-2">
                      <span className="tabular-nums">{lead.score.total}</span>
                      <BandBadge
                        band={effectiveBand(lead)}
                        overridden={Boolean(lead.scoreOverride)}
                      />
                    </span>
                  </td>
                  <td>{EVENT_TYPE_LABELS[lead.eventType]}</td>
                  <td className="whitespace-nowrap">{shortDate(lead.eventDate)}</td>
                  <td className="tabular-nums">{lead.guestCount}</td>
                  <td>
                    <span className="p-muted">{STAGE_LABELS[lead.stage]}</span>
                    {lead.lostReason ? (
                      <span className="p-muted block text-[0.75rem] leading-snug">
                        {lead.lostReason}
                      </span>
                    ) : null}
                  </td>
                  {showMoney ? (
                    <td className="tabular-nums whitespace-nowrap">
                      {money(lead.bookedValue ?? lead.quotedValue)}
                    </td>
                  ) : null}
                  <td className="p-muted whitespace-nowrap">{relativeTime(lead.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ── What each band buys. Keeps the routing rules visible, not buried. */}
      <Card title="What each band means">
        <div className="p-scroll-x">
          <table className="p-table">
            <thead>
              <tr>
                <th scope="col">Band</th>
                <th scope="col">Score</th>
                <th scope="col">Who handles it</th>
                <th scope="col">Standard</th>
                <th scope="col">What goes out automatically</th>
              </tr>
            </thead>
            <tbody>
              {(["A", "B", "C", "D"] as const).map((b) => (
                <tr key={b}>
                  <td>
                    <span className={`p-badge p-band-${b}`}>
                      {b} · {BANDS[b].label}
                    </span>
                  </td>
                  <td className="whitespace-nowrap tabular-nums">
                    {b === "A" ? "75+" : b === "B" ? "55–74" : b === "C" ? "35–54" : "under 35"}
                  </td>
                  <td>{BANDS[b].routing}</td>
                  <td className="whitespace-nowrap">{BANDS[b].sla}</td>
                  <td>{BANDS[b].autoReply}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="p-card-pad p-muted p-hairline text-[0.8125rem] leading-relaxed">
          Thresholds and weights are a starting proposal, not a finding — they are not drawn
          from Chef Kearse&apos;s own booking history because we do not have it yet. After
          roughly thirty scored enquiries they should be retuned against what actually booked.
          {session.role === "owner" ? " You can change every one of them in Settings." : null}
        </p>
      </Card>
    </div>
  );
}
