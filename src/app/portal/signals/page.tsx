import Link from "next/link";
import { requireStaff } from "@/lib/portal/guard";
import { getSignals, latestSweep } from "@/lib/portal/lead-store";
import { Card, EmptyState, relativeTime } from "@/components/portal/Ui";
import SignalTriage from "@/components/portal/SignalTriage";

export const metadata = { title: "This week's finds" };

export default async function SignalsPage() {
  await requireStaff();
  const pending = getSignals("new");
  const promoted = getSignals("promoted");
  const dismissed = getSignals("dismissed");
  const sweep = latestSweep();

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="t-h3">This week&apos;s finds</h1>
          <p className="p-muted mt-1 text-sm">
            {pending.length} waiting on you · {promoted.length} kept · {dismissed.length} dropped
            {sweep ? ` · searched ${relativeTime(sweep.iso)}` : ""}
          </p>
        </div>
      </header>

      {pending.length === 0 ? (
        <EmptyState
          title="Nothing waiting"
          body="You have been through everything the last search turned up. The next one runs on Monday — there is nothing to do here until then."
          cta={{ href: "/portal/prospects", label: "Go to the call list" }}
        />
      ) : (
        <SignalTriage signals={pending} />
      )}

      {/* ── History. Collapsed, because it is reference and not work. ─────── */}
      {promoted.length > 0 ? (
        <details className="p-card">
          <summary className="p-guide-summary">
            <span className="flex-1">Kept ({promoted.length})</span>
          </summary>
          <div className="p-card-pad p-hairline space-y-2">
            {promoted.map((s) => (
              <p key={s.id} className="text-[0.8125rem] leading-snug">
                {s.promotedToProspectId ? (
                  <Link
                    href={`/portal/prospects/${s.promotedToProspectId}`}
                    className="p-tap hover:text-[color:var(--color-accent-soft)]"
                  >
                    {s.title}
                  </Link>
                ) : (
                  s.title
                )}
                <span className="p-muted"> — {s.source}</span>
              </p>
            ))}
          </div>
        </details>
      ) : null}

      {dismissed.length > 0 ? (
        <details className="p-card">
          <summary className="p-guide-summary">
            <span className="flex-1">Dropped ({dismissed.length})</span>
          </summary>
          <div className="p-card-pad p-hairline space-y-3">
            {dismissed.map((s) => (
              <div key={s.id} className="text-[0.8125rem] leading-snug">
                <p>{s.title}</p>
                <p className="p-muted">
                  {s.source} — dropped because: {s.dismissReason}
                </p>
              </div>
            ))}
            <p className="p-muted p-hairline pt-3 text-[0.75rem] leading-relaxed">
              These reasons are kept so the search can be narrowed. If the same kind of thing
              keeps appearing and keeps getting dropped, that is a rule worth changing rather
              than a chore worth repeating.
            </p>
          </div>
        </details>
      ) : null}

      <Card title="How this works">
        <div className="p-card-pad text-[0.8125rem] leading-relaxed">
          <p>
            Once a week the portal reads a set of news feeds and public calendars — business
            openings, companies taking new offices, charities announcing galas — and brings
            back anything matching the words it is watching for.
          </p>
          <p className="p-muted mt-2">
            Most of it will not be relevant, and that is normal. Two out of ten is a good week.
            What matters is that the ones you keep become prospects with a proper write-up, and
            the ones you drop teach it what to stop sending.
          </p>
        </div>
      </Card>
    </div>
  );
}
