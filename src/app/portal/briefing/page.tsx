import Link from "next/link";
import { requireStaff } from "@/lib/portal/guard";
import { canSeeFinancials } from "@/lib/portal/store";
import {
  briefingHeadline,
  getProspects,
  latestSweep,
  openCorrections,
  openPrimeDates,
  outreachStats,
  overdueProspects,
  staleVenueApplications,
} from "@/lib/portal/lead-store";
import { Card, longDate, shortDate } from "@/components/portal/Ui";
import { PRIORITY_LABELS } from "@/components/portal/ProspectBoard";
import { IconAlert, IconCheck, IconPhone, IconSpark } from "@/components/portal/Icons";

export const metadata = { title: "Monday briefing" };

const PRIORITY_BAND = {
  HOT: "p-band-A",
  WARM: "p-band-B",
  WATCH: "p-band-C",
  DECLINE: "p-band-D",
} as const;

/**
 * The briefing.
 *
 * The ordering decision lives in the store, not here — this page renders the
 * decision, it does not make it. See briefingHeadline() for why overdue work
 * outranks new finds, every time.
 */
export default async function BriefingPage() {
  const session = await requireStaff();
  const showMoney = canSeeFinancials(session.role);
  const todayISO = new Date().toISOString().slice(0, 10);

  const headline = briefingHeadline(todayISO);
  const overdue = overdueProspects(todayISO);
  const stats = outreachStats(todayISO);
  const openDates = openPrimeDates(45, todayISO);
  const stale = staleVenueApplications(21, todayISO);
  const corrections = openCorrections();
  const sweep = latestSweep();
  const fresh = getProspects().filter((p) => p.sweepRun === (sweep?.run ?? 0));

  // The assistant sees the same structure, filtered to what she owns and with no
  // money anywhere — built here, on the server, so nothing extra is serialised.
  const mine = session.role === "owner" ? overdue : overdue.filter((p) => p.owner !== "owner");

  const allClear =
    overdue.length === 0 && stats.waiting === 0 && openDates.length === 0 && stale.length === 0;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="t-h3">Monday briefing</h1>
        <p className="p-muted mt-1 text-sm">
          {longDate(todayISO)}
          {sweep ? ` · last search ${shortDate(sweep.iso)}` : ""}
        </p>
      </header>

      {/* ── The headline. One box. Chosen by what is wrong, not what is new. ─ */}
      <Card
        title="The thing to do this week"
        action={
          allClear ? (
            <IconCheck className="h-4 w-4 p-ok" />
          ) : (
            <IconAlert className="h-4 w-4 p-warn" />
          )
        }
      >
        <div className="p-card-pad">
          <p className={`p-figure-sm ${allClear ? "" : "p-warn"}`}>{headline.title}</p>
          <p className="mt-2.5 text-sm leading-relaxed">{headline.detail}</p>
        </div>
      </Card>

      {/* ── 1. Overdue, with phone numbers. This is a call list. ──────────── */}
      {mine.length > 0 ? (
        <Card title={`Overdue — ${mine.length}`}>
          <div className="p-card-pad space-y-3">
            {mine.map((p) => {
              const days = Math.round(
                (Date.parse(`${todayISO}T00:00:00Z`) - Date.parse(`${p.nextActionBy}T00:00:00Z`)) /
                  86_400_000,
              );
              return (
                <div key={p.id} className="flex flex-wrap items-center gap-2">
                  <span className={`p-badge ${PRIORITY_BAND[p.priority]}`}>
                    {PRIORITY_LABELS[p.priority]}
                  </span>
                  <Link
                    href={`/portal/prospects/${p.id}`}
                    className="p-tap text-sm font-medium hover:text-[color:var(--color-accent-soft)]"
                  >
                    {p.name}
                  </Link>
                  <span className="p-bad text-[0.8125rem]">
                    {days} {days === 1 ? "day" : "days"} late
                  </span>
                  {p.phone ? (
                    <a
                      href={`tel:${p.phone.replace(/[^\d+]/g, "")}`}
                      className="p-btn p-btn-sm"
                      aria-label={`Call ${p.name} on ${p.phone}`}
                    >
                      <IconPhone className="h-4 w-4" />
                      {p.phone}
                    </a>
                  ) : null}
                </div>
              );
            })}
          </div>
        </Card>
      ) : null}

      {/* ── 2. Written and unsent. ───────────────────────────────────────── */}
      {stats.waiting > 0 ? (
        <Card title="Written but not sent">
          <div className="p-card-pad">
            <p className="text-sm leading-relaxed">
              {stats.waiting} {stats.waiting === 1 ? "message" : "messages"}, the oldest waiting{" "}
              {stats.oldestWaitingDays} {stats.oldestWaitingDays === 1 ? "day" : "days"}.
            </p>
            <Link href="/portal/outreach" className="p-btn p-btn-sm mt-2.5">
              Read and send them
            </Link>
          </div>
        </Card>
      ) : null}

      {/* ── 3. Open prime dates. Perishable inventory. ───────────────────── */}
      {openDates.length > 0 ? (
        <Card title={`Open Fridays and Saturdays — ${openDates.length}`}>
          <div className="p-card-pad">
            <p className="text-sm leading-relaxed">
              Nothing booked on {openDates.slice(0, 6).map((d) => shortDate(d)).join(", ")}
              {openDates.length > 6 ? ` and ${openDates.length - 6} more` : ""}.
            </p>
            <p className="p-muted mt-2 text-[0.8125rem] leading-relaxed">
              An empty Saturday cannot be sold afterwards. It is the one thing on this page
              worth something today and nothing next month, so everything on the call list is
              worth measuring against filling them.
            </p>
          </div>
        </Card>
      ) : null}

      {/* ── 4. Venue applications gone quiet. ────────────────────────────── */}
      {stale.length > 0 ? (
        <Card title="Venue applications with no reply">
          <div className="p-card-pad">
            <p className="text-sm leading-relaxed">
              {stale.map((v) => v.name).join(", ")} — asked more than three weeks ago.
            </p>
            <p className="p-muted mt-2 text-[0.8125rem] leading-relaxed">
              Worth a phone call rather than a second email. Getting onto one of these lists is
              the highest-value thing in the engine, so they are worth chasing properly.
            </p>
            <Link href="/portal/venues" className="p-btn p-btn-sm mt-2.5">
              Open venues
            </Link>
          </div>
        </Card>
      ) : null}

      {/* ── 5. Only now, this week's new finds. ──────────────────────────── */}
      {fresh.length > 0 ? (
        <Card
          title={`New this week — ${fresh.length}`}
          action={<IconSpark className="h-4 w-4 p-muted" />}
        >
          <div className="p-card-pad space-y-2">
            {fresh.slice(0, 8).map((p) => (
              <div key={p.id} className="flex flex-wrap items-center gap-2">
                <span className={`p-badge ${PRIORITY_BAND[p.priority]}`}>
                  {PRIORITY_LABELS[p.priority]}
                </span>
                <Link
                  href={`/portal/prospects/${p.id}`}
                  className="p-tap text-sm hover:text-[color:var(--color-accent-soft)]"
                >
                  {p.name}
                </Link>
                {showMoney && p.estValue !== null ? (
                  <span className="p-muted text-[0.75rem] tabular-nums">
                    est. ${p.estValue.toLocaleString()}
                  </span>
                ) : null}
              </div>
            ))}
            <p className="p-muted p-hairline pt-3 text-[0.8125rem] leading-relaxed">
              New finds sit below everything above them on purpose. Supply is rarely the
              constraint — getting through what is already here usually is.
            </p>
          </div>
        </Card>
      ) : null}

      {/* ── 6. Open questions from the search. ───────────────────────────── */}
      {corrections.length > 0 && session.role === "owner" ? (
        <Card title={`Open questions — ${corrections.length}`}>
          <div className="p-card-pad">
            <p className="text-sm leading-relaxed">
              Things the search could not confirm. The first one needs a single phone call and
              could be worth more than everything else on this page.
            </p>
            <Link href="/portal/sweeps" className="p-btn p-btn-sm mt-2.5">
              See what they are
            </Link>
          </div>
        </Card>
      ) : null}
    </div>
  );
}
