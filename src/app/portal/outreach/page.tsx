import { requireStaff } from "@/lib/portal/guard";
import { getOutreach, getProspects, outreachStats } from "@/lib/portal/lead-store";
import type { OutreachStatus } from "@/lib/portal/lead-types";
import { Card, EmptyState, Stat } from "@/components/portal/Ui";
import OutreachQueue from "@/components/portal/OutreachQueue";
import { IconAlert } from "@/components/portal/Icons";

export const metadata = { title: "Letters and emails" };

const GROUP_ORDER: { status: OutreachStatus; heading: string }[] = [
  { status: "draft", heading: "Written, waiting to be read" },
  { status: "approved", heading: "Approved, waiting to go" },
  { status: "sent", heading: "Sent" },
  { status: "replied", heading: "They replied" },
  { status: "no-response", heading: "No reply" },
  { status: "closed", heading: "Closed" },
];

export default async function OutreachPage() {
  await requireStaff();
  const all = getOutreach();
  const stats = outreachStats();
  const names = Object.fromEntries(getProspects().map((p) => [p.id, p.name]));

  // Every number on this page derives from outreachStats(). Nothing is a literal
  // — that is exactly the drift this whole design exists to prevent.
  const urgent = (stats.oldestWaitingDays ?? 0) >= 14;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="t-h3">Letters and emails</h1>
        <p className="p-muted mt-1 text-sm">
          Everything written to a prospect, and whether it has actually gone
        </p>
      </header>

      {/*
        The backlog leads the page, or nothing does.

        When something is written and unsent this is the first thing you see,
        with how long it has been sitting. When nothing is waiting this card is
        ABSENT rather than showing a green all-clear — a system that congratulates
        you for an empty queue is one you stop reading.
      */}
      {stats.waiting > 0 ? (
        <Card
          title="This is the thing to do"
          action={<IconAlert className={`h-4 w-4 ${urgent ? "p-bad" : "p-warn"}`} />}
        >
          <div className="p-card-pad">
            <p className={`p-figure-sm ${urgent ? "p-bad" : "p-warn"}`}>
              {stats.waiting} {stats.waiting === 1 ? "message is" : "messages are"} written and
              not sent
            </p>
            <p className="mt-2 text-sm leading-relaxed">
              The oldest has been waiting {stats.oldestWaitingDays}{" "}
              {stats.oldestWaitingDays === 1 ? "day" : "days"}. Read them, change anything that
              does not sound like you, and send them.
            </p>
            <p className="p-muted mt-2 text-[0.8125rem] leading-relaxed">
              A written letter nobody sends is worth exactly nothing. Writing more of them while
              these sit here would make this portal look busy and your business no better off.
            </p>
          </div>
        </Card>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Written in total" value={String(stats.drafted)} />
        <Stat label="Approved, not sent" value={String(stats.approved)} />
        <Stat label="Reached someone" value={String(stats.sent)} />
        <Stat label="Replied" value={String(stats.replied)} />
      </div>

      {all.length === 0 ? (
        <EmptyState
          title="Nothing written yet"
          body="Letters are written against a prospect. Open one from the call list and draft something there."
          cta={{ href: "/portal/prospects", label: "Go to the call list" }}
        />
      ) : (
        GROUP_ORDER.map(({ status, heading }) => {
          const items = all.filter((o) => o.status === status);
          if (items.length === 0) return null;
          return (
            <section key={status}>
              <h2 className="p-title mb-2">
                {heading} — {items.length}
              </h2>
              <OutreachQueue records={items} names={names} />
            </section>
          );
        })
      )}

      <Card title="Why there are three steps">
        <div className="p-card-pad text-[0.8125rem] leading-relaxed">
          <p>
            Written, approved, sent. They are separate on purpose: nothing goes out in the
            chef&apos;s name without a person having read it first.
          </p>
          <p className="p-muted mt-2">
            &ldquo;Reached someone&rdquo; above counts anything that actually arrived — sent,
            replied, no reply, and closed. It is one definition used everywhere, so no two
            screens can disagree about what sent means.
          </p>
        </div>
      </Card>
    </div>
  );
}
