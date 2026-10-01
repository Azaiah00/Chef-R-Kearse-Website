import { requireStaff } from "@/lib/portal/guard";
import { calendarOutlook, getCampaigns, getQueue, getSubscribers, mondayOf } from "@/lib/portal/store";
import { MASTER_PLAN_ASSET } from "@/lib/portal/seed";
import { Card, shortDate } from "@/components/portal/Ui";
import { IconDownload, IconSpark } from "@/components/portal/Icons";
import WeeklyQueue from "@/components/portal/WeeklyQueue";
import CampaignList from "@/components/portal/CampaignList";

export const metadata = { title: "Marketing" };

export default async function MarketingPage() {
  await requireStaff();
  const campaigns = getCampaigns();
  const week = mondayOf(new Date());
  const queue = getQueue(week);
  const subs = getSubscribers();
  const calendar = calendarOutlook(8);

  const openPrime = calendar.filter((d) => d.isWeekendPrime && !d.booked && d.inPressureWindow);
  const active = subs.filter((s) => s.status === "active").length;

  const totals = campaigns.reduce(
    (acc, c) => ({
      sent: acc.sent + c.kpi.sent,
      opened: acc.opened + c.kpi.opened,
      clicked: acc.clicked + c.kpi.clicked,
      enquiries: acc.enquiries + c.kpi.enquiries,
      booked: acc.booked + c.kpi.booked,
    }),
    { sent: 0, opened: 0, clicked: 0, enquiries: 0, booked: 0 },
  );

  const assetCount = campaigns.reduce((s, c) => s + c.assets.length, 0) + 1;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="t-h3">Marketing</h1>
          <p className="p-muted mt-1 text-sm">
            {campaigns.length} campaigns · {assetCount} pieces of creative ready to download ·{" "}
            {active} people on the list
          </p>
        </div>
        <a
          href={MASTER_PLAN_ASSET.file}
          download
          className="p-btn p-btn-primary p-btn-sm"
        >
          <IconDownload className="h-4 w-4" />
          The whole plan
        </a>
      </header>

      {/* ── How the weekly queue decides what to send. Stated, not hidden. ── */}
      <Card title="How this week was chosen">
        <div className="p-card-pad">
          <p className="flex items-start gap-2 text-[0.8125rem] leading-relaxed">
            <IconSpark className="p-ok mt-0.5 h-4 w-4 shrink-0" />
            <span>
              Every Monday the queue is rebuilt from four rules, in this order: an open Friday or
              Saturday inside three weeks, a campaign whose season has come round, a segment that
              has gone quiet, and a floor of at least one post so a slow week is never a silent
              one. Nothing sends until you approve it, and every item below shows the rule that
              put it there.
            </span>
          </p>
          {openPrime.length > 0 ? (
            <p className="p-warn mt-3 text-[0.8125rem] leading-snug">
              Right now: {openPrime.length} prime date{openPrime.length === 1 ? "" : "s"} open
              inside three weeks — {openPrime.slice(0, 4).map((d) => shortDate(d.date)).join(", ")}
              {openPrime.length > 4 ? ` and ${openPrime.length - 4} more` : ""}.
            </p>
          ) : (
            <p className="p-ok mt-3 text-[0.8125rem] leading-snug">
              Right now: no open prime dates inside three weeks, so the queue is driven by the
              season rather than by capacity.
            </p>
          )}
        </div>
      </Card>

      <WeeklyQueue
        items={queue}
        campaigns={campaigns.map((c) => ({ id: c.id, name: c.name }))}
        weekOf={week}
      />

      {/* ── Performance. Honest about what these numbers are. ─────────────── */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {[
          { label: "Sent", value: totals.sent.toLocaleString("en-US") },
          {
            label: "Opened",
            value: totals.sent === 0 ? "—" : `${Math.round((totals.opened / totals.sent) * 100)}%`,
          },
          {
            label: "Clicked",
            value: totals.opened === 0 ? "—" : `${Math.round((totals.clicked / totals.opened) * 100)}%`,
          },
          { label: "Enquiries", value: String(totals.enquiries) },
          { label: "Booked", value: String(totals.booked), tone: "p-ok" },
        ].map((s) => (
          <div key={s.label} className="p-card p-card-pad">
            <p className="p-title">{s.label}</p>
            <p className={`p-figure mt-2 ${s.tone ?? ""}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <CampaignList campaigns={campaigns} masterPlan={MASTER_PLAN_ASSET} />

      <Card title="What this is, and what it is not">
        <div className="p-card-pad space-y-2.5 text-[0.8125rem] leading-relaxed">
          <p>
            <span className="font-medium">The creative is real and it is yours.</span> Every email
            below is a finished, brand-styled HTML file you can open, edit or paste into any email
            platform. Every ad concept is a full brief — headline, body, call to action, targeting
            and the exact image to pair with it. Every caption is written to be posted as it
            stands.
          </p>
          <p>
            <span className="font-medium">The numbers above are demonstration figures.</span>{" "}
            Nothing has been sent yet, so there is no real open rate to report. They become real on
            the first send, once an email platform is connected.
          </p>
          <p className="p-muted">
            Images: every visual in these campaigns is either one of Chef Kearse&apos;s own
            photographs or an atmosphere plate generated from the prompt sheets — texture, light,
            a room, a table. No generated image ever depicts a dish a guest could order, because
            that would misrepresent what arrives on the plate.
          </p>
        </div>
      </Card>
    </div>
  );
}
