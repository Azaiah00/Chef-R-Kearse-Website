import { requireStaff } from "@/lib/portal/guard";
import { getVenues, venueFunnel } from "@/lib/portal/lead-store";
import type { VenueListType, VenueRecord } from "@/lib/portal/lead-types";
import { Card, Stat, money, shortDate } from "@/components/portal/Ui";
import VenueStatus from "@/components/portal/VenueStatus";

export const metadata = { title: "Venues" };

/**
 * The venue board.
 *
 * Grouped by how gettable the venue is, NOT alphabetically — the order IS the
 * priority. A venue with no kitchen of its own has to bring a caterer in, which
 * makes it a far better target than a prestigious one with a closed list, and
 * sorting by name would bury that.
 */

const GROUPS: { type: VenueListType; heading: string; why: string }[] = [
  {
    type: "byo-required",
    heading: "No kitchen of their own",
    why: "These have warming kitchens only, so an outside caterer is not tolerated — it is required. Best place to start, and the least competition.",
  },
  {
    type: "published-open",
    heading: "They publish their caterer list",
    why: "You can see exactly who is on it and what they charge a client for using someone who is not. That fee is the whole argument for getting added.",
  },
  {
    type: "unpublished-open",
    heading: "They have a list but do not publish it",
    why: "We know the list exists because other caterers say they are on it. Getting the details means a phone call.",
  },
  {
    type: "unknown",
    heading: "Not looked into yet",
    why: "No catering policy found either way.",
  },
  {
    type: "in-house-exclusive",
    heading: "Closed to you",
    why: "An exclusive caterer holds these. Listed so nobody spends a morning finding that out again.",
  },
];

const OFF_LIST_EXPLAINER =
  "The venue charges the client this for bringing in a caterer who is not on their list. It is not a cost to you — it is the reason some clients book a different chef. Getting on the list removes it for them.";

function VenueCard({ v }: { v: VenueRecord }) {
  return (
    <article className="p-card p-card-pad">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1 basis-48">
          {/*
            .p-link rather than a bare anchor: a 14px line box is about 17px
            tall, which is under the 24px WCAG 2.2 AA minimum. The class gives
            it a real target without making it look like a button.
          */}
          <a
            href={v.url}
            target="_blank"
            rel="noreferrer noopener"
            className="p-link !text-sm font-medium !text-[color:var(--color-bone)] hover:!text-[color:var(--color-accent-soft)]"
          >
            {v.name}
          </a>
          <p className="p-muted text-[0.75rem]">
            {v.city}, {v.state}
          </p>
        </div>
        <div className="w-44 shrink-0">
          <VenueStatus id={v.id} status={v.ourStatus} name={v.name} />
        </div>
      </div>

      {v.offListFee !== null ? (
        <div className="mt-3 rounded-[12px] border border-[color:color-mix(in_srgb,var(--color-accent)_30%,transparent)] bg-[color:color-mix(in_srgb,var(--color-accent)_10%,transparent)] px-3 py-2">
          <p className="text-sm">
            <span className="font-medium">{money(v.offListFee)}</span> charged to the client for
            an off-list caterer
          </p>
          {v.offListFeeNote ? (
            <p className="p-muted mt-1 text-[0.75rem] leading-relaxed">{v.offListFeeNote}</p>
          ) : null}
        </div>
      ) : null}

      {v.caterersNamed.length > 0 ? (
        <div className="mt-3">
          <p className="p-title">Who is already on it</p>
          <p className="mt-1.5 flex flex-wrap gap-1.5">
            {v.caterersNamed.map((c) => (
              <span key={c} className="p-badge p-band-D">
                {c}
              </span>
            ))}
          </p>
        </div>
      ) : (
        <p className="p-muted mt-3 text-[0.8125rem]">
          Their list is not published. Ask for it.
        </p>
      )}

      {v.requirements.length > 0 ? (
        <div className="mt-3">
          <p className="p-title">What they ask for</p>
          <ul className="p-guide-list mt-1.5">
            {v.requirements.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {v.appliedISO ? (
        <p className="p-muted mt-3 text-[0.75rem]">Asked on {shortDate(v.appliedISO)}</p>
      ) : null}

      {v.diffs.length > 0 ? (
        <div className="mt-3">
          <p className="p-title">Changes to their list</p>
          <ul className="mt-1.5 space-y-1">
            {v.diffs.map((d, i) => (
              <li key={`${d.iso}-${i}`} className="text-[0.75rem]">
                <span className="p-muted">{shortDate(d.iso)}: </span>
                {d.added.length > 0 ? <span className="p-ok">added {d.added.join(", ")}</span> : null}
                {d.added.length > 0 && d.removed.length > 0 ? " · " : ""}
                {d.removed.length > 0 ? (
                  <span className="p-muted">dropped {d.removed.join(", ")}</span>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="p-muted mt-3 text-[0.75rem]">
          Their list has not been re-checked since we found it. Worth a look once a month.
        </p>
      )}

      {v.sources.map((s) => (
        <p key={s.url} className="p-muted p-hairline mt-3 pt-3 text-[0.75rem] leading-relaxed">
          {s.note}
        </p>
      ))}
    </article>
  );
}

export default async function VenuesPage() {
  await requireStaff();
  const venues = getVenues();
  const funnel = venueFunnel();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="t-h3">Venues</h1>
        <p className="p-muted mt-1 text-sm">
          {venues.length} places that host events, in the order worth going after them
        </p>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Not asked yet" value={String(funnel["not-applied"])} />
        <Stat label="Asked, waiting" value={String(funnel.applied)} />
        <Stat label="On the list" value={String(funnel["on-list"])} />
        <Stat label="Said no" value={String(funnel.declined)} />
      </div>

      <Card title="Why this page is worth more than the rest">
        <div className="p-card-pad text-[0.8125rem] leading-relaxed">
          <p>
            A venue keeps a list of caterers it is happy to have in its building. Get on one and
            it sends you work for years, without you doing anything else.
          </p>
          <p className="p-muted mt-2">{OFF_LIST_EXPLAINER}</p>
        </div>
      </Card>

      {GROUPS.map((g) => {
        const items = venues.filter((v) => v.listType === g.type);
        if (items.length === 0) return null;

        const body = (
          <>
            <p className="p-muted mb-3 text-[0.8125rem] leading-relaxed">{g.why}</p>
            <div className="space-y-3">
              {items.map((v) => (
                <VenueCard key={v.id} v={v} />
              ))}
            </div>
          </>
        );

        // The closed group is collapsed — present so nobody researches it twice,
        // but it should not take up the page.
        if (g.type === "in-house-exclusive") {
          return (
            <details key={g.type} className="p-card">
              <summary className="p-guide-summary">
                <span className="flex-1">
                  {g.heading} ({items.length})
                </span>
              </summary>
              <div className="p-card-pad p-hairline">{body}</div>
            </details>
          );
        }

        return (
          <section key={g.type}>
            <h2 className="p-title mb-2">
              {g.heading} — {items.length}
            </h2>
            {body}
          </section>
        );
      })}

      <Card title="Who you are up against">
        <div className="p-card-pad text-[0.8125rem] leading-relaxed">
          <p>
            Four names appear on both of the published lists above:{" "}
            <strong>A Sharper Palate</strong>, <strong>Groovin&apos; Gourmets</strong>,{" "}
            <strong>Mosaic</strong> and <strong>Garnish</strong>. Those are the caterers already
            embedded in Richmond&apos;s institutional venues.
          </p>
          <p className="p-muted mt-2">
            This comes from those venues&apos; own published pages. It is not a judgement about
            any of them — and on a call, never say a word against one. Four of them work the same
            rooms you want, the market is small, and venue staff know all of them.
          </p>
        </div>
      </Card>
    </div>
  );
}
