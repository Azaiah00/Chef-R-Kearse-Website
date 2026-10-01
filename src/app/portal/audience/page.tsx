import { requireStaff } from "@/lib/portal/guard";
import { getSubscribers } from "@/lib/portal/store";
import { daysBetween } from "@/lib/portal/scoring";
import { Card, EmptyState, shortDate } from "@/components/portal/Ui";
import { IconInbox } from "@/components/portal/Icons";

export const metadata = { title: "Audience" };

const SEGMENT_LABELS: Record<string, string> = {
  "seasonal-menu": "Seasonal menu list",
  corporate: "Corporate",
  weddings: "Weddings",
  "past-client": "Past client",
  lapsed: "Lapsed",
};

const SOURCE_LABELS: Record<string, string> = {
  "site-footer": "Signed up on the site",
  "menu-download": "Downloaded a menu",
  "event-guest": "Guest at an event",
  manual: "Added by hand",
  "declined-lead": "Enquired but did not book",
};

export default async function AudiencePage() {
  await requireStaff();
  const subs = getSubscribers();
  const today = new Date();

  const active = subs.filter((s) => s.status === "active");
  const segments = Object.keys(SEGMENT_LABELS).map((key) => ({
    key,
    label: SEGMENT_LABELS[key],
    count: active.filter((s) => s.segments.includes(key as never)).length,
  }));

  const lapsed = active.filter((s) => s.segments.includes("lapsed"));
  const fromDeclined = active.filter((s) => s.source === "declined-lead");

  return (
    <div className="space-y-6">
      <header>
        <h1 className="t-h3">Audience</h1>
        <p className="p-muted mt-1 text-sm">
          {active.length} active · {subs.length - active.length} unsubscribed
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {segments.map((s) => (
          <div key={s.key} className="p-card p-card-pad">
            <p className="p-title">{s.label}</p>
            <p className="p-figure mt-2">{s.count}</p>
          </div>
        ))}
      </div>

      {/* ── The point that is easy to miss: declined leads are still an asset. */}
      <Card title="The people the filter turned away">
        <div className="p-card-pad">
          <p className="flex items-start gap-2 text-[0.8125rem] leading-relaxed">
            <IconInbox className="p-muted mt-0.5 h-4 w-4 shrink-0" />
            <span>
              {fromDeclined.length} of the people on this list enquired and did not become a
              client — either the timing was wrong or the budget was. They are still here on
              purpose. Someone whose dinner-party budget did not work this year gets promoted at
              work next year, and the seasonal menu email costs nothing to send them. Filtering
              hard at the front door only works if nobody is thrown away at the same time.
            </span>
          </p>
        </div>
      </Card>

      <Card
        title="Everyone on the list"
        action={
          lapsed.length > 0 ? (
            <span className="p-badge p-warn">{lapsed.length} lapsed</span>
          ) : null
        }
      >
        {subs.length === 0 ? (
          <EmptyState
            title="Nobody yet."
            body="People join from the site footer, from downloading a menu, from being a guest at an event, and from enquiries that did not convert."
          />
        ) : (
          <div className="p-scroll-x">
            <table className="p-table p-table-hover">
              <thead>
                <tr>
                  <th scope="col">Who</th>
                  <th scope="col">Segments</th>
                  <th scope="col">Came from</th>
                  <th scope="col">Joined</th>
                  <th scope="col">Last sent</th>
                  <th scope="col">Status</th>
                </tr>
              </thead>
              <tbody>
                {subs
                  .slice()
                  .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
                  .map((s) => {
                    const quietDays = s.lastSentAt
                      ? daysBetween(new Date(s.lastSentAt), today)
                      : null;
                    return (
                      <tr key={s.id}>
                        <td>
                          <span className="block font-medium">{s.name ?? "—"}</span>
                          <span className="p-muted block text-[0.75rem] break-all">{s.email}</span>
                        </td>
                        <td>
                          <span className="flex flex-wrap gap-1">
                            {s.segments.map((seg) => (
                              <span
                                key={seg}
                                className={`p-badge ${seg === "lapsed" ? "p-warn" : "p-muted"}`}
                              >
                                {SEGMENT_LABELS[seg] ?? seg}
                              </span>
                            ))}
                          </span>
                        </td>
                        <td className="p-muted">{SOURCE_LABELS[s.source] ?? s.source}</td>
                        <td className="p-muted whitespace-nowrap">{shortDate(s.createdAt)}</td>
                        <td className="p-muted whitespace-nowrap">
                          {s.lastSentAt
                            ? `${shortDate(s.lastSentAt)}${quietDays !== null && quietDays >= 90 ? ` · ${quietDays}d ago` : ""}`
                            : "Never"}
                        </td>
                        <td>
                          <span className={`p-badge ${s.status === "active" ? "p-ok" : "p-muted"}`}>
                            {s.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Card title="Before a single email sends">
        <div className="p-card-pad space-y-2 text-[0.8125rem] leading-relaxed">
          <p>
            Email needs a verified sending domain and a visible unsubscribe link in every message —
            both are handled by the platform once it is connected.
          </p>
          <p>
            SMS is stricter and is worth saying out loud: it needs explicit written opt-in with a
            disclosure at the point of collection, STOP and HELP handling, quiet hours respected,
            and A2P 10DLC registration of the number. None of that is optional, and the penalties
            for getting it wrong are per-message. No SMS goes out until it is all in place.
          </p>
          <p className="p-muted">
            Guests at an event are on this list because they were served by him, not because they
            asked to be marketed to. They receive the seasonal menu and nothing else, and one
            unsubscribe removes them permanently.
          </p>
        </div>
      </Card>
    </div>
  );
}
