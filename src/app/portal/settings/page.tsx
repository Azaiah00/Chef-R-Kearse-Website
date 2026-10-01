import { requireRolePage } from "@/lib/portal/guard";
import { assistantSeesFinancials, getStaff } from "@/lib/portal/store";
import { BANDS, BUDGET_LABELS, WEIGHTS } from "@/lib/portal/scoring";
import { site } from "@/lib/site";
import { Card } from "@/components/portal/Ui";
import { IconAlert, IconLock } from "@/components/portal/Icons";
import SettingsToggles from "@/components/portal/SettingsToggles";

export const metadata = { title: "Settings" };

/**
 * Owner only. An assistant who types this URL is redirected before any of it is
 * fetched — the gate is the server, not a hidden nav link.
 */
export default async function SettingsPage() {
  await requireRolePage("owner");
  const staff = getStaff();
  const showFinancials = assistantSeesFinancials();

  const weightRows = [
    { key: "budget", label: "Budget band", note: "The strongest single predictor of a booking" },
    { key: "leadTime", label: "Lead time", note: "How far out the date is" },
    { key: "eventType", label: "Event type", note: "Weddings and corporate weighted up — your growth lines" },
    { key: "guestCount", label: "Party size", note: "Fit against your practical minimum and comfortable band" },
    { key: "decisionMaker", label: "Decision maker", note: "Whether you are talking to the buyer" },
    { key: "venue", label: "Venue readiness", note: "How real the event is yet" },
    { key: "source", label: "Source", note: "Referrals and past clients score highest" },
    { key: "deposit", label: "Commitment signals", note: "Deposit acknowledged, reachable number, open to a call" },
    { key: "effort", label: "Detail given", note: "How much they wrote about the occasion" },
  ] as const;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="t-h3">Settings</h1>
        <p className="p-muted mt-1 text-sm">
          Yours only — your assistant cannot reach this page.
        </p>
      </header>

      <SettingsToggles assistantSeesFinancials={showFinancials} />

      {/* ── The weights, laid out honestly as a proposal. ──────────────────── */}
      <Card title="How enquiries are scored">
        <div className="p-card-pad p-hairline border-t-0">
          <p className="p-warn flex items-start gap-2 text-[0.8125rem] leading-relaxed">
            <IconAlert className="mt-0.5 h-4 w-4 shrink-0" />
            <span>
              Read this before you trust a single score. None of the numbers below come from your
              own booking history, because we do not have it yet — they are a defensible opening
              position based on how this kind of work converts generally. Once thirty or so
              enquiries have been through and you know which ones actually booked, they should be
              retuned against that. Until then, treat the score as a sorting aid and trust your own
              read over it every time.
            </span>
          </p>
        </div>

        <div className="p-scroll-x">
          <table className="p-table">
            <thead>
              <tr>
                <th scope="col">What is measured</th>
                <th scope="col">Weight</th>
                <th scope="col">Why</th>
              </tr>
            </thead>
            <tbody>
              {weightRows.map((r) => (
                <tr key={r.key}>
                  <td className="font-medium">{r.label}</td>
                  <td className="tabular-nums whitespace-nowrap">{WEIGHTS[r.key]} pts</td>
                  <td className="p-muted">{r.note}</td>
                </tr>
              ))}
              <tr>
                <td className="font-medium">Total</td>
                <td className="tabular-nums">100 pts</td>
                <td className="p-muted">Every enquiry is scored out of one hundred</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="p-card-pad p-hairline">
          <p className="p-title">One hard rule that sits above the weights</p>
          <p className="mt-2 text-[0.8125rem] leading-relaxed">
            An enquiry whose budget is below your service floor is held at band B no matter how well
            it scores otherwise, so it never lands on your desk inside four hours. It is not
            declined either — somebody that organised with the wrong budget is a conversation about
            scope, not a brush-off. Your assistant looks at it within a day and either re-scopes it
            or says no kindly.
          </p>
        </div>
      </Card>

      <Card title="What each band buys">
        <div className="p-scroll-x">
          <table className="p-table">
            <thead>
              <tr>
                <th scope="col">Band</th>
                <th scope="col">Score</th>
                <th scope="col">Who handles it</th>
                <th scope="col">Standard</th>
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ── Pricing, and why nothing is published. ─────────────────────────── */}
      <Card title="Pricing">
        <div className="p-card-pad">
          <p className="flex items-start gap-2 text-[0.8125rem] leading-relaxed">
            <IconLock className="p-muted mt-0.5 h-4 w-4 shrink-0" />
            <span>
              Nothing on your website or in the guest menu builder shows a price, because no
              verified price for your business exists anywhere public and we will not invent one.
              The bands the enquiry form offers are placeholders in the same position:
            </span>
          </p>
          <ul className="mt-3 space-y-1.5">
            {Object.entries(BUDGET_LABELS).map(([k, label]) => (
              <li key={k} className="text-[0.8125rem]">
                {label}
              </li>
            ))}
          </ul>
          <p className="p-muted mt-4 text-[0.8125rem] leading-relaxed">
            Confirm or replace those four ranges and give us your real per-guest floors, and two
            things switch on: the Experiences page starts showing a price band table, and the guest
            menu builder starts showing a clearly labelled estimate as they choose. Both are off
            until then.
          </p>
        </div>
      </Card>

      <Card title="Your team">
        <ul className="divide-y divide-[color:var(--color-line-dark)]">
          {staff.map((u) => (
            <li key={u.id} className="px-5 py-3">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <div>
                  <p className="text-[0.9375rem] font-medium">{u.name}</p>
                  <p className="p-muted text-[0.8125rem]">
                    {u.title} · {u.email}
                  </p>
                </div>
                <span className={`p-badge ${u.role === "owner" ? "p-ok" : "p-muted"}`}>
                  {u.role === "owner" ? "Full access" : "Events access"}
                </span>
              </div>
            </li>
          ))}
        </ul>
        <div className="p-card-pad p-hairline">
          <p className="p-warn flex items-start gap-2 text-[0.8125rem] leading-relaxed">
            <IconAlert className="mt-0.5 h-4 w-4 shrink-0" />
            <span>
              Your assistant&apos;s name and email here are placeholders — we have not been given
              the real ones. Send them over and the account, her sign-in and everything addressed to
              her gets corrected.
            </span>
          </p>
        </div>
      </Card>

      <Card title="Still to connect">
        <ul className="divide-y divide-[color:var(--color-line-dark)]">
          {[
            {
              label: "Your website domain",
              detail:
                "The site is finished and ready, but the domain is not under your control at the moment, so it cannot be pointed at it. There is a written plan for recovering it — and a faster alternative — in the handover documents.",
              tone: "p-bad",
            },
            {
              label: "Your Google Business Profile",
              detail:
                "Someone else currently owns the listing. This matters more than anything else on this list: it is the single biggest source of enquiries for a local chef. The recovery process is documented and it is worth starting immediately.",
              tone: "p-bad",
            },
            {
              label: "Email delivery",
              detail:
                "Enquiries are logged safely and land in this portal, but no email is sent until a sending service is connected and your domain is verified.",
              tone: "p-warn",
            },
            {
              label: "Card payments",
              detail:
                "Deposits and balances are tracked here but not collected. Connecting Stripe turns on deposit links, card holds and paid tasting tickets.",
              tone: "p-warn",
            },
            {
              label: "SMS",
              detail:
                "Reminders and open-date texts need a registered number plus opt-in, STOP handling and quiet hours before anything sends.",
              tone: "p-warn",
            },
            {
              label: "Real accounts and Google sign-in",
              detail:
                "This portal uses demo sign-in. Real accounts, password resets and two-factor come with the production build, and the demo credentials on the sign-in page come off at the same time.",
              tone: "p-warn",
            },
          ].map((row) => (
            <li key={row.label} className="px-5 py-3.5">
              <p className={`text-[0.9375rem] font-medium ${row.tone}`}>{row.label}</p>
              <p className="p-muted mt-1 max-w-prose text-[0.8125rem] leading-relaxed">
                {row.detail}
              </p>
            </li>
          ))}
        </ul>
      </Card>

      <Card title="Your details as the site uses them">
        <dl className="divide-y divide-[color:var(--color-line-dark)]">
          {[
            ["Name", site.name],
            ["Phone", `${site.contact.phone} · toll free ${site.contact.phoneAlt}`],
            ["Email", site.contact.email],
            ["Based", `${site.location.city}, ${site.location.region}`],
            ["Trading since", String(site.founded)],
            ["Service area", site.serviceAreas.join(" · ")],
          ].map(([k, v]) => (
            <div key={k} className="px-5 py-2.5">
              <dt className="p-title">{k}</dt>
              <dd className="mt-1 text-[0.8125rem] leading-snug break-words">{v}</dd>
            </div>
          ))}
        </dl>
        <p className="p-card-pad p-hairline p-muted text-[0.75rem] leading-relaxed">
          Every one of these was taken from a source we could verify — your Google listing, your
          old site footer, your Instagram bio, your Zola profile. If any of it is wrong, tell us
          and it changes in one place and updates the whole site.
        </p>
      </Card>
    </div>
  );
}
