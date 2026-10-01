import { requireRolePage } from "@/lib/portal/guard";
import { getBrain } from "@/lib/portal/lead-store";
import { Card, money, shortDate } from "@/components/portal/Ui";
import { IconAlert, IconLock } from "@/components/portal/Icons";

export const metadata = { title: "Kitchen Brain" };

/**
 * The Kitchen Brain.
 *
 * The design decision that matters: a blank renders as a filled amber NOT
 * CONFIRMED chip, not as an empty input. The page's job is to make the gaps
 * impossible to miss rather than to look complete.
 *
 * Right now every credential is blank, which means this page opens with five
 * amber chips — and that is the correct, useful first impression, because those
 * five block every venue application in the engine.
 *
 * This is read-only for now. Editing arrives with the real credentials: the API
 * is written and enforces that confirming a credential clears its matching open
 * item in the same write, so the chip and the list can never disagree.
 */

function Value({
  label,
  value,
  blocks,
}: {
  label: string;
  value: string | null;
  /** What this blank is stopping, shown only when it is blank. */
  blocks?: string;
}) {
  return (
    <div className="p-hairline py-3 first:border-t-0 first:pt-0">
      <dt className="p-title">{label}</dt>
      <dd className="mt-1.5">
        {value ? (
          <span className="text-sm">{value}</span>
        ) : (
          <>
            <span className="p-badge p-band-C">Not confirmed</span>
            {blocks ? (
              <span className="p-muted mt-1 block text-[0.8125rem] leading-relaxed">{blocks}</span>
            ) : null}
          </>
        )}
      </dd>
    </div>
  );
}

export default async function BrainPage() {
  const brain = getBrain();
  await requireRolePage("owner");

  const credentialGaps = [
    brain.liabilityInsuranceLimit,
    brain.servSafeHolder,
    brain.businessLicenceJurisdictions.length > 0 ? "yes" : null,
    brain.swamCertified,
    brain.evaRegistered,
  ].filter((v) => v === null || v === undefined).length;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="t-h3">Kitchen Brain</h1>
        <p className="p-muted mt-1 text-sm">
          The facts about the business that everything else here is built on
        </p>
      </header>

      {credentialGaps > 0 ? (
        <Card title="What is missing, and what it stops" action={<IconAlert className="h-4 w-4 p-warn" />}>
          <div className="p-card-pad">
            <p className="p-figure-sm p-warn">
              {credentialGaps} {credentialGaps === 1 ? "thing is" : "things are"} not confirmed
            </p>
            <p className="mt-2 text-sm leading-relaxed">
              Every venue asks for these before it will add a caterer to its list, and every
              letter this portal writes reads from this page. Until they are filled in, no
              venue application can go out — which means the highest-value work in the whole
              engine is on hold.
            </p>
            <p className="p-muted mt-2 text-[0.8125rem] leading-relaxed">
              They are blank rather than guessed on purpose. A letter that claims a
              certificate he does not hold is worse than one that never goes.
            </p>
          </div>
        </Card>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Who he is">
          <dl className="p-card-pad">
            <Value label="Trading name" value={brain.brandName} />
            <Value label="Phone" value={brain.phone} />
            <Value label="Toll free" value={brain.tollFree} />
            <Value label="Email" value={brain.email} />
            <Value label="Based" value={`${brain.baseCity}, ${brain.baseState}`} />
            <Value
              label="Cooking since"
              value={brain.foundedYear ? String(brain.foundedYear) : null}
            />
            <Value label="Works across" value={brain.serviceAreas.join(" · ")} />
          </dl>
        </Card>

        <Card
          title="Credentials"
          action={<IconLock className="h-4 w-4 p-muted" />}
        >
          <dl className="p-card-pad">
            <Value
              label="Liability insurance limit"
              value={brain.liabilityInsuranceLimit ? money(brain.liabilityInsuranceLimit) : null}
              blocks="Venues ask for this first. One industry body requires $1M per occurrence."
            />
            <Value label="Insurance carrier" value={brain.insuranceCarrier} />
            <Value
              label="Food-safety certificate"
              value={brain.servSafeHolder}
              blocks="Who holds it, and when it expires. Asked for by every approved-caterer list."
            />
            <Value
              label="Certificate expires"
              value={brain.servSafeExpiryISO ? shortDate(brain.servSafeExpiryISO) : null}
            />
            <Value
              label="Business licence"
              value={
                brain.businessLicenceJurisdictions.length > 0
                  ? brain.businessLicenceJurisdictions.join(" · ")
                  : null
              }
              blocks="Which places he is licensed in. One DC venue requires a DC business licence specifically."
            />
            <Value
              label="Health permits"
              value={
                brain.healthPermitJurisdictions.length > 0
                  ? brain.healthPermitJurisdictions.join(" · ")
                  : null
              }
            />
            <Value
              label="Registered as a small business with the state"
              value={brain.swamCertified === null ? null : brain.swamCertified ? "Yes" : "No"}
              blocks="Opens up public-sector work and corporates that track who they buy from."
            />
            <Value
              label="Registered on eVA"
              value={brain.evaRegistered === null ? null : brain.evaRegistered ? "Yes" : "No"}
              blocks="The way every Virginia public body buys, including the universities."
            />
          </dl>
        </Card>

        <Card title="What he charges">
          <div className="p-card-pad">
            {brain.priceBands.length === 0 ? (
              <>
                <span className="p-badge p-band-C">Not confirmed</span>
                <p className="p-muted mt-2 text-[0.8125rem] leading-relaxed">
                  Nothing is published anywhere, so the portal has no prices to work from. Until
                  these are set it will not quote anybody — which is right, but it also means a
                  prospect card cannot say what an event is worth.
                </p>
              </>
            ) : (
              <ul className="space-y-2">
                {brain.priceBands.map((b) => (
                  <li key={b.label} className="flex flex-wrap items-center gap-2 text-sm">
                    <span className="font-medium">{b.label}</span>
                    <span className="p-muted">
                      {b.perGuestLow !== null ? money(b.perGuestLow) : "?"} –{" "}
                      {b.perGuestHigh !== null ? money(b.perGuestHigh) : "?"} per guest
                    </span>
                    {b.placeholder ? (
                      <span className="p-badge p-band-C">Placeholder — needs confirming</span>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
            <dl className="mt-4">
              <Value
                label="Travels up to"
                value={brain.travelRadiusMiles ? `${brain.travelRadiusMiles} miles` : null}
                blocks="Used to score how far a prospect is. Working on an assumed 40 miles until confirmed."
              />
              <Value label="Travel fee beyond that" value={brain.travelFeeNote} />
              <Value label="Minimum" value={brain.minimumNote} />
              <Value label="Deposit" value={brain.depositNote} />
              <Value label="Cancellation" value={brain.cancellationNote} />
            </dl>
          </div>
        </Card>

        <Card title="What he can take on">
          <dl className="p-card-pad">
            <Value
              label="Most events in a week"
              value={brain.maxEventsPerWeek ? String(brain.maxEventsPerWeek) : null}
            />
            <Value
              label="Needs this much notice"
              value={brain.minLeadTimeDays ? `${brain.minLeadTimeDays} days` : null}
            />
            <div className="p-hairline py-3">
              <dt className="p-title">What is included</dt>
              {/*
                A list, not badges. A badge is nowrap and does not shrink by
                design, so "Consultations and tastings — fee waived on signing"
                in a pill runs straight off a 320px screen. Short labels get
                pills; sentences get lines.
              */}
              <dd className="p-guide-list mt-1.5">
                {brain.capabilities.map((c) => (
                  <p key={c} className="relative pl-4 text-[0.8125rem] leading-snug">
                    <span className="absolute left-0 text-[color:var(--color-accent-soft)]">—</span>
                    {c}
                  </p>
                ))}
              </dd>
            </div>
            <div className="p-hairline py-3">
              <dt className="p-title">Cooks</dt>
              <dd className="mt-1.5 flex flex-wrap gap-1.5">
                {brain.cuisines.map((c) => (
                  <span key={c} className="p-badge p-band-D">
                    {c}
                  </span>
                ))}
              </dd>
            </div>
          </dl>
        </Card>
      </div>

      <Card title="Everything still to confirm">
        <div className="p-card-pad">
          <ol className="space-y-3">
            {brain.confirmWithClient.map((item, i) => (
              <li key={item} className="flex gap-3 text-[0.8125rem] leading-relaxed">
                <span className="p-step-n shrink-0" aria-hidden="true">
                  {i + 1}
                </span>
                <span className="min-w-0 flex-1">{item}</span>
              </li>
            ))}
          </ol>
          <p className="p-muted p-hairline mt-4 pt-3 text-[0.8125rem] leading-relaxed">
            Send these to Azaiah and they get filled in. Each one that lands removes an amber
            label above and unblocks the work next to it.
          </p>
        </div>
      </Card>
    </div>
  );
}
