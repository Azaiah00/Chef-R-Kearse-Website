import Link from "next/link";
import { requireStaff } from "@/lib/portal/guard";
import { canSeeFinancials } from "@/lib/portal/store";
import { getProspects, isClosed, overdueProspects, prospectCounts } from "@/lib/portal/lead-store";
import { Card, EmptyState, relativeTime, shortDate } from "@/components/portal/Ui";
import ProspectBoard, {
  PRIORITY_LABELS,
  STATUS_LABELS,
  type BoardProspect,
} from "@/components/portal/ProspectBoard";
export const metadata = { title: "Prospects" };

const PRIORITY_BAND = {
  HOT: "p-band-A",
  WARM: "p-band-B",
  WATCH: "p-band-C",
  DECLINE: "p-band-D",
} as const;

export default async function ProspectsPage() {
  const session = await requireStaff();
  const showMoney = canSeeFinancials(session.role);
  const prospects = getProspects();
  const counts = prospectCounts();
  const overdue = overdueProspects();
  const todayISO = new Date().toISOString().slice(0, 10);

  /*
   * Built here, on the server, carrying only what a card draws.
   *
   * ProspectBoard is a client component, so everything passed to it is
   * serialised into the page the browser downloads — rendered or not. The
   * estimated value is therefore OMITTED rather than hidden when the viewer is
   * not allowed it, exactly as the enquiry board does.
   */
  const board: BoardProspect[] = prospects.map((p) => ({
    id: p.id,
    ref: p.ref,
    name: p.name,
    status: p.status,
    category: p.category,
    priority: p.priority,
    total: p.score.total,
    city: p.city,
    state: p.state,
    phone: p.phone,
    nextActionBy: p.nextActionBy,
    overdue: !isClosed(p.status) && p.nextActionBy !== null && p.nextActionBy < todayISO,
    sourceCount: p.sources.length,
    capped: p.score.cappedBy !== null,
    value: showMoney ? p.estValue : undefined,
  }));

  const uncited = prospects.filter((p) => p.sources.length === 0);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="t-h3">{session.role === "owner" ? "Prospects" : "Your call list"}</h1>
          <p className="p-muted mt-1 text-sm">
            {prospects.length} in total · {overdue.length} overdue · businesses that have not
            contacted you
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {(["HOT", "WARM", "WATCH", "DECLINE"] as const).map((b) => (
            <span key={b} className={`p-badge ${PRIORITY_BAND[b]}`}>
              {PRIORITY_LABELS[b]} {counts[b]}
            </span>
          ))}
        </div>
      </header>

      {overdue.length > 0 ? (
        <Card title="Overdue — do these first">
          <div className="p-card-pad space-y-2">
            {overdue.map((p) => (
              <p key={p.id} className="text-sm leading-snug">
                <Link
                  href={`/portal/prospects/${p.id}`}
                  className="p-tap font-medium hover:text-[color:var(--color-accent-soft)]"
                >
                  {p.name}
                </Link>
                <span className="p-bad"> — was due {shortDate(p.nextActionBy)}</span>
                {p.phone ? (
                  <a href={`tel:${p.phone.replace(/[^\d+]/g, "")}`} className="p-link ml-2">
                    {p.phone}
                  </a>
                ) : null}
              </p>
            ))}
          </div>
        </Card>
      ) : null}

      {prospects.length === 0 ? (
        <EmptyState
          title="No prospects yet"
          body="The weekly search has not turned anything into a prospect yet. Check this week's finds on the Signals page and keep whichever look worth a call."
          cta={{ href: "/portal/signals", label: "See this week's finds" }}
        />
      ) : (
        <ProspectBoard prospects={board} canRemove={session.role === "owner"} />
      )}

      {/* A table beats a board for scanning, and it is the path a keyboard takes. */}
      <Card title="Every prospect">
        <div className="p-scroll-x">
          <table className="p-table p-table-hover">
            <thead>
              <tr>
                <th scope="col">Who</th>
                <th scope="col">How urgent</th>
                <th scope="col">Where they are</th>
                <th scope="col">Next action</th>
                <th scope="col">Who has it</th>
                <th scope="col">Sources</th>
              </tr>
            </thead>
            <tbody>
              {prospects.map((p) => {
                const isOverdue =
                  !isClosed(p.status) && p.nextActionBy !== null && p.nextActionBy < todayISO;
                return (
                  <tr key={p.id}>
                    <td>
                      <Link
                        href={`/portal/prospects/${p.id}`}
                        className="p-tap font-medium hover:text-[color:var(--color-accent-soft)]"
                      >
                        {p.name}
                      </Link>
                      <span className="p-muted block text-[0.75rem]">
                        {p.ref}
                        {p.city ? ` · ${p.city}, ${p.state}` : ""}
                      </span>
                    </td>
                    <td>
                      <span className="flex items-center gap-2">
                        <span className="tabular-nums">{p.score.total}</span>
                        <span className={`p-badge ${PRIORITY_BAND[p.priority]}`}>
                          {PRIORITY_LABELS[p.priority]}
                        </span>
                      </span>
                    </td>
                    <td className="p-muted">{STATUS_LABELS[p.status]}</td>
                    <td className="whitespace-nowrap">
                      {p.nextActionBy ? (
                        <span className={isOverdue ? "p-bad" : "p-muted"}>
                          {shortDate(p.nextActionBy)}
                        </span>
                      ) : (
                        <span className="p-muted">Not set</span>
                      )}
                    </td>
                    <td className="p-muted capitalize">{p.owner}</td>
                    <td>
                      {p.sources.length === 0 ? (
                        <span className="p-warn tabular-nums">0</span>
                      ) : (
                        <span className="p-muted tabular-nums">{p.sources.length}</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="p-card-pad p-muted p-hairline text-[0.8125rem] leading-relaxed">
          Added {relativeTime(prospects[0]?.addedISO ?? todayISO)} by the weekly search.
          {uncited.length > 0
            ? ` ${uncited.length} of these have no source attached yet, so they are held back no matter how well they score — a prospect nobody can check is a guess.`
            : " Every one of these carries at least one source you can check before you repeat it on a call."}
        </p>
      </Card>
    </div>
  );
}
