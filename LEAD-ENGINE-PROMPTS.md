# LEAD ENGINE — BUILD PACKAGE
### Chef R. Kearse · 13 prompts, in order · 30 September 2026

Paste these into Cursor or Claude Code one at a time, in order. Each is self-contained.
Do not skip ahead — L01 through L03 are the foundation and everything after reads from them.

**Before you paste anything:** the agent must read `CLAUDE.md` in the repo root. The portal
design is locked (left sidebar, dark glass, pill nav). Every prompt below assumes it and
none of them may change it.

**Companion documents:** `LEAD-ENGINE.md` is the plan and the channel research this package
implements. `PORTAL.md` is the existing portal's architecture. `CONTEXT.md` holds the
CONFIRM WITH CLIENT list.

**What already exists** that these prompts build on — do not recreate any of it:

- `src/lib/portal/types.ts` — `ORG_ID = "org_chefrkearse"`, `Lead`, `LeadScore`, `ScoreLine`, `Stage`, `ScoreBand`, `EventType`, `StaffRole`, `Session`
- `src/lib/portal/scoring.ts` — the **inbound** engine: `WEIGHTS`, `BANDS`, `STAGE_LABELS`, `EVENT_TYPE_LABELS`, `applyCaps`
- `src/lib/portal/store.ts` — the only data-access path; exports include `getLeads`, `createLead`, `actionQueue`, `canSeeFinancials`, `effectiveBand`, `mondayOf`, `resetDemoData`, `findStaffById`
- `src/lib/portal/auth.ts`, `guard.ts` (`requireStaff`, `requireRolePage`), `demo.ts` (`isDemoMode`)
- `src/components/portal/Ui.tsx` — `Card`, `Stat`, `BandBadge`, `StageBadge`, `ScoreMeter`, `EmptyState`, `UrgencyIcon`, `DemoBanner`, `money`, `shortDate`, `longDate`, `relativeTime`
- `src/components/portal/Icons.tsx` — `IconGauge IconInbox IconUsers IconCalendar IconMenuBook IconMegaphone IconChat IconClipboard IconCart IconSettings IconAlert IconCheck IconClock IconDownload IconArrowRight IconMail IconPhone IconLock IconFlame IconLogout IconSpark IconChevron IconPlus IconTrash`
- `src/components/portal/PortalNav.tsx` — the locked left sidebar, with `OWNER_NAV` and `ASSISTANT_NAV`
- `src/app/portal/portal.css` — the locked theme. Class list in `CLAUDE.md` §1.2.
- `scripts/` — `test-scoring.mjs` (51), `test-portal.mjs` (78), `test-pipeline.mjs` (21), `verify-portal-entry.mjs` (16), `qa-portal.mjs`

---

# PROMPT L01 — Lead engine types

```
Read CLAUDE.md first. The portal design is locked — this prompt adds no UI at all.

GOAL
Add the type layer for the outbound lead engine. This is types only: no components, no
routes, no store functions, no seed data. Later prompts depend on these names being exact.

FILE TO CREATE
src/lib/portal/lead-types.ts

Keep it a separate file from types.ts. types.ts describes the INBOUND business (enquiries
that arrive, events that get booked). This file describes the OUTBOUND engine (research
sweeps, prospects we go and find). They are different lifecycles and mixing them is how
the Lead type ends up with thirty optional fields.

Re-export nothing. Import only `StaffRole` from "./types" — it is the single symbol this
file needs. Do NOT import ORG_ID here: nothing in a types-only file uses its value, and an
unused import is a lint warning, and the project standard is zero warnings. `orgId` is
declared as a plain `string` field on each interface.

CONTENT — write exactly these types, with the doc comments.

/**
 * A research run. Every record the engine finds points back at the sweep that
 * found it, so the UI can answer "what did this week produce" without anyone
 * maintaining a changelog by hand.
 */
export interface Sweep {
  run: number;              // 1, 2, 3…
  label: string;            // "S1", "S2" — rendered as a chip on new records
  iso: string;              // YYYY-MM-DD, the day the sweep ran
  weekOf: string;           // YYYY-MM-DD, the Monday of the reporting week
  /** What was actually checked, in prose specific enough to re-run. */
  sourcesSwept: string[];
  corrections: Correction[];
}

/**
 * What changed or failed. Published, never silently dropped — a tool that hides
 * its own failures is one you stop trusting the first time you catch it.
 */
export interface Correction {
  subject: string;             // the record or claim re-checked
  what: string;                // what changed, or why it could not be verified
  resolvedISO: string | null;  // null while still open
}

export type SourceKind =
  | "organization"   // the subject's own website
  | "directory"      // a listing that aggregates subjects
  | "search"         // a results page with no stable permalink
  | "news"
  | "filing"         // IRS 990, a public register
  | "statute";

/**
 * Evidence. Every factual claim in the engine hangs off one of these.
 *
 * `note` is the field that matters and it is required. It states what this
 * source ESTABLISHES and, explicitly, what it does NOT. A source that gives an
 * address but not opening hours says so, so nobody downstream assumes the hours
 * were verified. Where a subject's documents sit behind a session-bound search
 * rather than a permalink, cite the search page honestly with kind "search"
 * rather than inventing a direct URL.
 */
export interface SourceLink {
  label: string;
  url: string;
  kind: SourceKind;
  retrievedISO: string;
  note: string;
}

export type SignalTriage = "new" | "promoted" | "dismissed";

/** A raw feed hit, before a human decides whether it is worth pursuing. */
export interface Signal {
  id: string;
  orgId: string;
  source: string;            // "Richmond BizSense", "Hanover Chamber"…
  title: string;
  url: string;
  publishedISO: string;
  /** Which keyword rules fired, so the triage decision is auditable. */
  matchedRules: string[];
  triage: SignalTriage;
  dismissReason: string | null;
  promotedToProspectId: string | null;
  sweepRun: number;
}

export type ProspectCategory =
  | "corporate"
  | "nonprofit-gala"
  | "venue"
  | "planner"
  | "association"
  | "institution"
  | "production";

export type ProspectPriority = "HOT" | "WARM" | "WATCH" | "DECLINE";

export type ProspectStatus =
  | "new"
  | "researched"
  | "contacted"
  | "conversation"
  | "quoted"
  | "won"
  | "lost"
  | "declined";      // we declined it, distinct from "lost"

export interface ProspectScoreLine {
  key: string;
  label: string;
  weight: number;
  earned: number;
  reason: string;
}

export interface ProspectScore {
  total: number;
  lines: ProspectScoreLine[];
  /** Set when a cap held the priority below what the raw total earned. */
  cappedBy: string | null;
}

/** Who sourced a prospect. This is the commission record — see LEAD-ENGINE.md Part C. */
export type SourcedBy = "agent" | "inbound" | "chef" | "assistant";

/**
 * The outbound counterpart to Lead. A stranger worth calling, with the call
 * already written.
 */
export interface Prospect {
  id: string;
  orgId: string;
  ref: string;                 // human-quotable, e.g. "P-0014"
  name: string;
  category: ProspectCategory;
  city: string;
  state: string;

  /** Absent rather than invented. A fabricated contact is worse than none. */
  phone: string | null;
  website: string | null;
  contactName: string | null;
  contactRole: string | null;

  score: ProspectScore;
  priority: ProspectPriority;

  /** Structural, not promotional — why this one specifically. */
  whyItFits: string;
  pitch: string;
  /**
   * The one question that starts a real conversation. It should be answerable
   * only by someone inside that business, and it must not be answerable with
   * "no thanks".
   */
  openingQuestion: string;
  /** What will embarrass the caller. Null only when there is genuinely nothing. */
  caution: string | null;
  /** Including "DO NOT PURSUE — because…" where that is the honest answer. */
  suggestedAction: string;

  /** Which of his open dates this could fill. ISO dates. */
  targetDates: string[];
  /** Placeholder until he confirms price bands. Never presented as a quote. */
  estValue: number | null;

  status: ProspectStatus;
  /** Drives the overdue count that leads the Monday briefing. */
  nextActionBy: string | null;
  owner: StaffRole | "agent";
  sourcedBy: SourcedBy;
  /** Immutable once written. Attribution evidence for the commission ledger. */
  sourcedISO: string;

  addedISO: string;
  sweepRun: number;
  /** Never empty for a record a sweep added. Enforced by the scoring cap. */
  sources: SourceLink[];
  notes: ProspectNote[];
}

export interface ProspectNote {
  iso: string;
  actor: string;
  body: string;
}

export type VenueListType =
  | "published-open"      // publishes its caterer list, and the list is open
  | "unpublished-open"    // has a list, does not publish it
  | "byo-required"        // no production kitchen — outside catering required
  | "in-house-exclusive"  // closed, do not pursue
  | "unknown";

export type VenueOurStatus = "not-applied" | "applied" | "on-list" | "declined";

/**
 * The venue board. One approved-list placement earns recurring inbound
 * forever, which makes this the highest-value object in the engine.
 */
export interface VenueRecord {
  id: string;
  orgId: string;
  name: string;
  city: string;
  state: string;
  url: string;
  listType: VenueListType;
  /** Verbatim from the venue's own page. Never paraphrased. */
  caterersNamed: string[];
  /**
   * What the venue charges THE CLIENT for using an off-list caterer. This is
   * the pitch: getting on the list removes a cost the guest is paying.
   */
  offListFee: number | null;
  offListFeeNote: string | null;
  ourStatus: VenueOurStatus;
  appliedISO: string | null;
  /** Insurance, licence, certification — as the venue states them. */
  requirements: string[];
  /** Diff history, so "who got added, who got dropped" is visible over time. */
  diffs: VenueDiff[];
  sources: SourceLink[];
}

export interface VenueDiff {
  iso: string;
  added: string[];
  removed: string[];
}

export type OutreachChannel = "email" | "call" | "form" | "in-person";

export type OutreachStatus =
  | "draft"
  | "approved"
  | "sent"
  | "replied"
  | "no-response"
  | "closed";

/**
 * Outreach as records rather than a count. Every number in the UI derives from
 * these, so the dashboard can never drift from what was actually written.
 */
export interface OutreachRecord {
  id: string;
  orgId: string;
  prospectId: string;
  channel: OutreachChannel;
  subject: string;
  /** Full text, rendered verbatim in the prospect view. */
  body: string;
  status: OutreachStatus;
  draftedISO: string;
  sentISO: string | null;
  responseISO: string | null;
  sentBy: StaffRole | "agent" | null;
}

/**
 * The Kitchen Brain — one authoritative record of the business. Every generated
 * proposal, email, venue application and menu reads from this, so no two
 * outputs disagree and nothing is invented at generation time.
 *
 * Every field that is not yet confirmed is null, and the UI renders null as
 * "NOT CONFIRMED" rather than as an empty string. Nothing here may be guessed.
 */
export interface KitchenBrain {
  orgId: string;
  legalName: string;
  brandName: string;
  phone: string;
  tollFree: string | null;
  email: string;
  baseCity: string;
  baseState: string;
  serviceAreas: string[];
  foundedYear: number | null;

  // Credentials — all currently unconfirmed and all gating the venue applications.
  liabilityInsuranceLimit: number | null;
  insuranceCarrier: string | null;
  servSafeHolder: string | null;
  servSafeExpiryISO: string | null;
  businessLicenceJurisdictions: string[];
  healthPermitJurisdictions: string[];
  swamCertified: boolean | null;
  evaRegistered: boolean | null;

  // Commercial terms — placeholders until confirmed.
  priceBands: PriceBand[];
  travelRadiusMiles: number | null;
  travelFeeNote: string | null;
  minimumNote: string | null;
  depositNote: string | null;
  cancellationNote: string | null;

  // Capacity rules that drive targetDates scoring.
  maxEventsPerWeek: number | null;
  minLeadTimeDays: number | null;

  capabilities: string[];
  cuisines: string[];
  /** Every entry here is pending client confirmation and must render as such. */
  confirmWithClient: string[];
}

export interface PriceBand {
  label: string;
  perGuestLow: number | null;
  perGuestHigh: number | null;
  /** Always true until he confirms. Rendered as a visible flag, not a footnote. */
  placeholder: boolean;
}

ACCEPTANCE
- npx tsc --noEmit passes with 0 errors.
- npx next lint passes with 0 warnings.
- The file imports StaffRole from "./types" and declares nothing that already
  exists there.
- Every interface above is present with exactly these field names.

DO NOT
- Do not touch types.ts, scoring.ts or store.ts in this prompt.
- Do not add a `fitScore: number` field to Prospect. The score is the
  ProspectScore object, so the breakdown travels with the number.
- Do not make `sources`, `note` or `retrievedISO` optional.
- Do not add any UI.
```

---

# PROMPT L02 — The outbound scoring engine

```
Read CLAUDE.md first. No UI in this prompt.

GOAL
Score an outbound prospect 0–100 with a transparent per-factor breakdown, and assign a
priority band. This is a SEPARATE engine from the inbound one in scoring.ts — inbound asks
"is this enquiry worth his time", outbound asks "is this stranger worth a call." Keep them
apart; share only the shape of the breakdown so the existing meter UI can render both.

FILES
Create: src/lib/portal/prospect-scoring.ts
Create: scripts/test-prospect-scoring.mjs

CONTENT — src/lib/portal/prospect-scoring.ts

Nine weights summing to exactly 100. Assert the sum at module load so it can never
silently drift:

export const PROSPECT_WEIGHTS = {
  dateFit: 20,        // does it land on an open date, and is that date prime
  freshness: 16,      // a ribbon cutting next month beats a 2023 filing
  access: 14,         // is there a named human and a route in
  spendEvidence: 12,  // Schedule G line 7, published budget, venue tier
  distance: 10,       // against the real service radius, return leg priced
  repeatability: 10,  // a venue list or a quarterly corporate beats a one-off
  incumbency: 8,      // is a competitor embedded — overflow pitch vs open lane
  brandFit: 6,        // does this flatter the work he wants more of
  effort: 4,          // research and touches before a decision
} as const;

const WEIGHT_TOTAL = Object.values(PROSPECT_WEIGHTS).reduce((a, b) => a + b, 0);
if (WEIGHT_TOTAL !== 100) {
  throw new Error(`Prospect weights must sum to 100, got ${WEIGHT_TOTAL}`);
}

Define the input type. Every field is a discriminated enum or a number, never free text —
the score must be reproducible from the input:

export interface ProspectScoreInput {
  dateFit: "prime-open" | "open" | "tight" | "unknown" | "unavailable";
  freshness: "this-month" | "this-quarter" | "this-year" | "stale";
  access: "named-decision-maker" | "named-contact" | "department" | "switchboard";
  spendEvidence: "disclosed-figure" | "strong-proxy" | "weak-proxy" | "none";
  distanceMiles: number | null;      // null = unknown
  repeatability: "recurring-list" | "recurring-events" | "annual" | "one-off";
  incumbency: "open-lane" | "weak-incumbent" | "strong-incumbent" | "exclusive";
  brandFit: "flagship" | "good" | "neutral" | "off-brand";
  effort: "low" | "medium" | "high";
  /** How many verified sources the record carries. Drives the hard cap. */
  sourceCount: number;
}

Scoring rules — each factor returns a fraction of its weight, and a one-line human reason.
Write a named function per factor so the test can exercise each in isolation.

- dateFit: prime-open 1.0 · open 0.75 · tight 0.4 · unknown 0.3 · unavailable 0
  "Prime" means a date his own calendar flags as high-demand. An unavailable date scores
  zero on this factor but does not disqualify — the event may move.
- freshness: this-month 1.0 · this-quarter 0.7 · this-year 0.35 · stale 0.1
- access: named-decision-maker 1.0 · named-contact 0.7 · department 0.4 · switchboard 0.15
- spendEvidence: disclosed-figure 1.0 · strong-proxy 0.7 · weak-proxy 0.35 · none 0.1
- distance: null → 0.4 (unknown is not free). Otherwise, against the Kitchen Brain's
  travelRadiusMiles R, which the caller passes in; when R is null use 40 as a documented
  working assumption and say so in the reason string:
    miles <= R*0.5  → 1.0
    miles <= R      → 0.8
    miles <= R*1.5  → 0.45
    miles <= R*2.5  → 0.2
    beyond          → 0
- repeatability: recurring-list 1.0 · recurring-events 0.8 · annual 0.5 · one-off 0.2
- incumbency: open-lane 1.0 · weak-incumbent 0.65 · strong-incumbent 0.3 · exclusive 0
- brandFit: flagship 1.0 · good 0.75 · neutral 0.4 · off-brand 0
- effort: low 1.0 · medium 0.6 · high 0.25

Round each earned value to one decimal; round the total to the nearest integer. The lines
array must list all nine factors in the order above, every one carrying its weight, its
earned value and its reason — including factors that earned zero, because a zero with a
reason is the most useful line on the card.

Bands:
export const PROSPECT_BANDS = {
  HOT:   { min: 72, label: "Call this week",   routing: "Chef or agent calls", sla: "7 days" },
  WARM:  { min: 52, label: "Call this month",  routing: "Assistant or agent",  sla: "30 days" },
  WATCH: { min: 32, label: "Keep an eye on it", routing: "Nurture",            sla: "quarterly" },
  DECLINE: { min: 0, label: "Do not pursue",   routing: "Recorded as evidence", sla: "none" },
} as const;

THE HARD CAP — this is the rule that keeps the board honest:

export function applyProspectCap(
  priority: ProspectPriority,
  input: ProspectScoreInput,
): { priority: ProspectPriority; cappedBy: string | null }

A prospect with sourceCount === 0 can never rank above WARM, whatever it scored. Reason
string: "No verified source yet, so this is held at WARM until one is attached — a
plausible-sounding prospect with no citation is a guess, not a lead."

Also cap: incumbency === "exclusive" is forced to DECLINE, with the reason naming that the
venue or account has an exclusive provider.

When a cap fires, append a tenth explanatory line to the breakdown so the UI shows why the
band is lower than the number suggests. Mirror how applyCaps does this in scoring.ts.

Export the composer:
export function scoreProspect(
  input: ProspectScoreInput,
  travelRadiusMiles: number | null,
): { score: ProspectScore; priority: ProspectPriority }

CONTENT — scripts/test-prospect-scoring.mjs

A plain node script, no test framework, matching the style of scripts/test-scoring.mjs:
a small ok()/fail() harness, a count at the end, exit code 1 on any failure. Transpile the
TS with the same approach test-scoring.mjs already uses in this repo — read that file and
follow it exactly rather than inventing a second mechanism.

Assert at least these, and add more:
1. PROSPECT_WEIGHTS sums to exactly 100.
2. A best-case input with sourceCount 1 scores 100 and lands HOT.
3. A worst-case input scores 0 and lands DECLINE.
4. Every returned breakdown has exactly 9 lines when no cap fires.
5. A cap adds a 10th line and never an 11th.
6. sourceCount 0 with an otherwise perfect input is capped to WARM, cappedBy is non-null,
   and the raw total is still 100 — the cap changes the band, not the number.
7. incumbency "exclusive" forces DECLINE even with a perfect input.
8. distanceMiles null earns 0.4 of its weight and the reason mentions that it is unknown.
9. travelRadiusMiles null uses 40 and the reason says so.
10. Band boundaries are exact: 72 is HOT and 71 is WARM; 52 is WARM and 51 is WATCH;
    32 is WATCH and 31 is DECLINE.
11. Each of the nine factor functions, called directly, returns 0 ≤ earned ≤ its weight
    for every enum value it accepts.
12. The lines array order matches the PROSPECT_WEIGHTS key order.

ACCEPTANCE
- node scripts/test-prospect-scoring.mjs prints "N passed, 0 failed" with N >= 30.
- npx tsc --noEmit: 0 errors. npx next lint: 0 warnings.
- Add "test:prospects": "node scripts/test-prospect-scoring.mjs" to package.json scripts.

DO NOT
- Do not modify src/lib/portal/scoring.ts. The inbound engine is finished and its 51
  assertions must keep passing.
- Do not let any factor read global state. scoreProspect must be pure: same input and
  same radius, same output.
- Do not add UI.
```

---

# PROMPT L03 — Seed the engine with the real research

```
Read CLAUDE.md and LEAD-ENGINE.md first. No UI in this prompt.

GOAL
Seed the outbound engine with the verified research from LEAD-ENGINE.md so the portal demos
with real prospects, real venues and real citations rather than invented ones. This is the
prompt where fabrication would do the most damage: every URL, figure and quoted policy
below was retrieved on 2026-09-30 and must be reproduced verbatim. Add nothing that is not
in this prompt.

FILE TO CREATE
src/lib/portal/lead-seed.ts

Export: SWEEPS, prospectSeed(), venueSeed(), signalSeed(), outreachSeed(), brainSeed().
Each returns a fresh array or object on every call — never a shared mutable module
constant, because resetDemoData() in store.ts must be able to restore a clean state.

Use const R1 = "2026-09-30" for every retrievedISO and addedISO in this seed.

SWEEPS — one run:
[{ run: 1, label: "S1", iso: "2026-09-30", weekOf: "2026-09-28",
   sourcesSwept: [ ...the list below... ], corrections: [ ...the list below... ] }]

sourcesSwept — write these as the eleven strings, verbatim:
- "Richmond BizSense — RSS feed confirmed live and returning items; the Pro tier gates New Licenses and Breaking Ground (building permits), which are the two sharpest products"
- "Virginia Business, Bisnow (national feed only — the DC-scoped feed returns 404), ThePhilVA — all three RSS feeds confirmed returning items"
- "Greater Washington Board of Trade — events JSON and iCal both confirmed returning live data; the only chamber in this sweep with a real API"
- "VCU — Localist JSON, RSS and iCal all confirmed; a verified listing put a VCU event off-campus at Hardywood Park Craft Brewery"
- "ChamberRVA, Hanover, Chesterfield and Virginia Chamber calendars — public and readable; Hanover publishes ribbon cuttings, the sharpest single signal found"
- "Greater Richmond Convention Center calendar — names the host organisation months ahead; the building itself runs exclusive in-house F&B"
- "Competitor venue maps — Groovin' Gourmets (37 venues) and Garnish (~40) both publish their own preferred-venue lists; 14 venues appear on both"
- "Cultural Arts Center at Glen Allen and Maymont — both publish their approved-caterer lists and both publish an off-list fee charged to the client"
- "IRS Form 990 Schedule G Part II line 7 is labelled 'Food and beverages' — a nonprofit's own disclosed catering spend; monthly XML bulk downloads confirmed available 2019 through August 2026"
- "Virginia ABC — confirmed over 28,000 banquet and special-event licences granted annually, and that the Banquet application captures event date, times and location address. Whether that register is publicly obtainable is UNRESOLVED"
- "Marriage licence records — checked in Virginia, DC and Maryland and ruled out as a lead source; closed by statute in Virginia"

corrections — write these four, verbatim:
1. { subject: "Virginia ABC banquet licence register",
     what: "Could not establish whether banquet and special-event licences appear in the public licensee search or the downloadable XLS, or whether the records carry the event date and location. The downloadable file is most likely the ~20,000 permanent retail licensees rather than the 28,000 banquet licences. Resolve by calling Virginia ABC License Records Management on (804) 213-4577, then by Virginia FOIA request under Va. Code 2.2-3700 et seq. if refused. This is the highest-value open question in the sweep.",
     resolvedISO: null }
2. { subject: "Washington Business Journal and Richmond Times-Dispatch",
     what: "Both block automated retrieval, so no RSS or email-alert URL could be confirmed. Both publications exist and cover this market. Someone needs to open them in a browser before any feed URL is published in a deliverable.",
     resolvedISO: null }
3. { subject: "Here Comes The Guide BYO-catering indexes, and the PartySlate and Northern Virginia / DC Chamber directories",
     what: "All render client-side and returned no content to automated retrieval. The BYO-catering indexes are worth a manual browse — a venue with no production kitchen must use outside catering, which is the strongest venue category there is. Do not plan automation against any of them.",
     resolvedISO: null }
4. { subject: "Richmond BizSense subscription price",
     what: "The subscribe page shows $45/month and $145/year alongside copy reading 'Save 50% with annual billing'. Those three figures do not reconcile. Confirm the current price before paying.",
     resolvedISO: null }

venueSeed() — EIGHT records. Reproduce the quoted policies verbatim.

1. Cultural Arts Center at Glen Allen · Glen Allen VA ·
   https://www.artsglenallen.com/facility-information/approved-caterers
   listType "published-open", offListFee 500,
   offListFeeNote: "Policy as published: \"The following caterers are approved to cater events at The Center (Use of other caterers, or self-catering, will require a $500 refundable deposit)\". The fee falls on the client, not on us — which is the whole pitch for getting on the list."
   caterersNamed, verbatim and in this order: A Sharper Palate · Anant · Anokha · Apple Spice Junction · DeFazio's Catering · Garnish Catering · Groovin' Gourmets · Hacienda Catering · Lehja · Mosaic · Ms. Girlee's Catering · Natalie's Taste of Lebanon · Q Barbeque
   requirements: ["Approval criteria are NOT published on the page — ask directly"]
   ourStatus "not-applied", appliedISO null, diffs []
   sources: one SourceLink, kind "organization", note: "Establishes the full 13-name approved list and the $500 refundable deposit charged for an off-list caterer. Names Christiana Roberts as Events Sales Manager. The approval criteria — insurance, licensing, certification, any fee — are NOT published and are not claimed here."

2. Maymont · Richmond VA · https://maymont.org/rentals/catering/
   listType "published-open", offListFee 600,
   offListFeeNote: "Policy as published: \"Working with other outside caterers is discouraged and will incur an outside catering fee of $600, plus additional requirements\". Maymont also keeps a supplemental list of pre-screened Approved Caterers at a discounted fee — that second tier is the realistic first rung and should be asked for by name."
   caterersNamed: Mosaic Catering + Events · Groovin' Gourmets · Deep Run Roadhouse · A Sharper Palate Catering Company · Garnish RVA · Timber Pizza Co.
   requirements: ["\"plus additional requirements\" — not itemised on the page"]
   sources note must state that it establishes the six Premier Caterers, the $600 off-list fee and the existence of a discounted pre-screened supplemental tier, and that no application mechanism is published for either tier.

3. Science Museum of Virginia · Richmond VA · https://smv.org/visit/specialevents/
   listType "unpublished-open", offListFee null
   caterersNamed [] — the list is referenced but not published
   sources note: "Establishes that a preferred-caterer list exists — \"our list of preferred caterers can accommodate your every need\" — but the names are NOT published on the page and are not claimed here. Special Events Team: 804.864.1466."

4. Main Street Station · Richmond VA · listType "unpublished-open"
   Appears on BOTH competitor venue maps, which is the evidence it runs an open
   multi-caterer list. url: https://www.trolleyhouseva.com/groovin-gourmets/venue-partners/richmond
   caterersNamed [] · sources kind "directory", note: "Appears on both Groovin' Gourmets' and Garnish's published preferred-venue lists, which establishes that Main Street Station runs an open multi-caterer list. The venue's own caterer policy was NOT retrieved and the list is not published here."

5. Weinstein Jewish Community Center · Richmond VA · listType "unpublished-open"
   url: https://garnishrva.com/venues/
   sources note must state it appears on both competitor maps AND that the JCC runs its own
   annual gala (https://weinsteinjcc.org/gala/ — URL confirmed to exist, event details NOT
   verified), which makes it both a venue target and a direct client target.

6. Prince George's County Parks historic venues · Upper Marlboro MD ·
   https://www.pgparks.com/facilities-rentals/historic-site-rentals
   listType "byo-required", offListFee null
   caterersNamed []
   requirements: ["No approved-caterer list is published; call each site"]
   sources note: "Establishes five venues — Billingsley House, Newton White Mansion, Prince George's Ballroom, Oxon Hill Manor (the page states it is temporarily closed) and Snow Hill Manor — and that each \"has warming kitchens\". A warming kitchen with no production kitchen is the definitive signal that outside catering is required. No caterer list or catering policy is published on the page."

7. Dumbarton House · Washington DC ·
   https://dumbartonhouse.org/book/preferred-professionals/
   listType "byo-required", offListFee null
   requirements, verbatim from the venue: ["DC business license", "Proof of sufficient insurance", "Review Dumbarton House rules and regulations", "On-site appointment with the Rental Events Coordinator before the event"]
   sources note: "Establishes that outside catering is permitted with clear, meetable requirements — \"you may work with any vendor you choose, providing they…\" — and that the venue highly recommends but does not mandate its Preferred Vendors List. The caterer names on that list did not render and are not claimed here. The most open door found in DC."

8. Lewis Ginter Botanical Garden · Richmond VA ·
   https://www.lewisginter.org/visit/facility-rental/catering/
   listType "in-house-exclusive", offListFee null
   caterersNamed ["Restaurant Associates"]
   sources note: "Establishes an exclusive catering partnership — \"Lewis Ginter Botanical Garden offers catered events and on-site restaurants through our partnership with Restaurant Associates\". Recorded as closed so nobody researches it twice."

prospectSeed() — SIX records, each with a complete pitch, openingQuestion, caution and
suggestedAction written in full prose. Score each with scoreProspect() at seed time rather
than hardcoding a total, so the breakdown is always consistent with the weights.

P-0001 Cultural Arts Center at Glen Allen — category "venue", priority HOT.
  suggestedAction must name Christiana Roberts and lead with the $500 fee as the argument.
  openingQuestion: "Your approved list already has thirteen names on it, so I'm not asking
  to replace anyone. I'm asking what it takes to get on it — because right now a couple who
  wants me is paying you a five-hundred-dollar deposit for the privilege, and that's the
  reason some of them don't book your room at all. What do you need to see from a caterer
  before you'll add one?"
  caution: "The approval criteria are not published, so do not turn up assuming insurance
  and ServSafe are the whole list. And do not disparage any of the thirteen — four of them
  are also on Maymont's list and this is a small market."

P-0002 Maymont — category "venue", priority HOT.
  suggestedAction must say to ask for the supplemental pre-screened Approved Caterers list
  by name rather than aiming at the six Premier Caterers first.
  caution must note that "Working with other outside caterers is discouraged" is the
  venue's own language, so the approach is to join the structure rather than argue with it.

P-0003 Hanover Chamber ribbon-cutting programme — category "association", priority HOT.
  This prospect is the channel, not one business. whyItFits should explain that a business
  cutting a ribbon this month needs food this month, has budget approved and has never had
  a caterer, which makes it the warmest repeatable signal in the sweep.
  openingQuestion for the chamber itself: "You've got two ribbon cuttings on the calendar
  in the next six weeks. When a new member opens, who tells them they need food for it —
  and would it help them if there was a chef on your list who already knew how your
  openings run?"
  sources: the Hanover events calendar and member directory URLs from LEAD-ENGINE.md,
  kind "directory", with a note naming the two verified upcoming ribbon cuttings (Advance
  Auto Parts, 29 October; Uniquely Yours Dog Care, 7 November) and stating that whether the
  chamber will make an introduction is NOT established.

P-0004 Virginia Society of Association Executives — category "association", priority WARM.
  whyItFits: its members are the people who buy meeting catering and it is headquartered in
  Richmond, so this is a buyer concentration rather than a peer group.
  caution: "Vendor-membership eligibility and cost are both unverified. Do not budget for
  this until VSAE confirms a caterer can join and at what price."

P-0005 Weinstein JCC — category "nonprofit-gala", priority WARM.
  whyItFits must carry the cross-reference: it appears on both competitor venue maps, so it
  demonstrably hosts outside-catered events, and it runs its own annual gala.
  caution: "The gala page URL is confirmed to exist but its date, venue and catering
  arrangements were NOT verified. Confirm all three before the call — turning up with the
  wrong date is the fastest way to sound like a cold caller."

P-0006 Greater Richmond Convention Center calendar — category "institution",
  priority DECLINE, incumbency "exclusive".
  suggestedAction must begin "DO NOT PURSUE AS A VENUE" and then explain the record's real
  purpose: convention centres of this type run exclusive in-house food and beverage, so he
  will not cater inside the building — but the calendar names the host organisation months
  ahead, and every association on it brings a board dinner, a sponsor reception or a
  pre-conference off-site into Richmond that goes to an outside caterer. The correct use of
  this record is as a monthly source of association names to pitch, not as a target.
  This record exists to prove the engine will decline something and say why.

signalSeed() — FOUR records with triage "new", drawn from the verified live headlines in
LEAD-ENGINE.md Tier 1, each with its real source name, a plausible matchedRules array, and
sweepRun 1. Use only headlines that appear in LEAD-ENGINE.md; invent none.

outreachSeed() — TWO records, both status "draft", sentISO null, both pointing at P-0001
and P-0002. Write the full body text of each. Both are venue-list applications, not
wedding pitches: they ask what the venue needs in order to add a caterer, they state what
he can document today, and they do not quote a price. Neither may assert an insurance
limit, a certification or an award, because none is confirmed — instead each says plainly
that he will supply certificates on request.

brainSeed() — a KitchenBrain. Use ONLY the verified facts from CONTEXT.md:
brandName "Chef R. Kearse", phone "(804) 939-9246", tollFree "(844) 532-7724",
email "chefrkearse@gmail.com", baseCity "Richmond", baseState "VA", foundedYear 2018,
serviceAreas ["Richmond VA", "Northern Virginia", "Washington DC", "Maryland"],
cuisines from CONTEXT.md verbatim.
EVERY credential field is null. EVERY commercial field is null. priceBands is [].
confirmWithClient must list, as strings, the five gating items from LEAD-ENGINE.md:
liability insurance limit, ServSafe or food-handler certification, business licence and
health permits, SWaM certification status, eVA registration status — each phrased as what
it blocks.

ACCEPTANCE
- npx tsc --noEmit: 0 errors. npx next lint: 0 warnings.
- Every SourceLink in the file has a non-empty note, and every note states what the source
  does NOT establish wherever something was unverified.
- No record has an empty sources array except signalSeed records, which carry their own url.
- Calling each seed function twice returns deeply equal but not identity-equal values.
- Every phone number appearing anywhere in the file is one of these five, which are the only
  numbers the research verified. Any other number means something was invented:
    (804) 939-9246   his own, from CONTEXT.md
    (844) 532-7724   his toll free, from CONTEXT.md
    (804) 213-4577   Virginia ABC License Records Management
    804.864.1466     Science Museum of Virginia Special Events
    (804) 261-6211   Cultural Arts Center at Glen Allen rentals
- Every venue off-list fee is either 500, 600 or null. Those are the only two fee figures
  the research verified. A figure on any other venue means it was invented.

DO NOT
- Do not invent a contact name, phone number, email, price, insurance limit, certification,
  award or review. Christiana Roberts and the two published phone numbers above are the
  only named contacts in the research; everything else is null.
- Do not add a venue, prospect or signal that is not specified in this prompt.
- Do not set any KitchenBrain credential field to a non-null value.
- Do not hardcode a score total. Call scoreProspect().
```

---

# PROMPT L04 — Store functions

```
Read CLAUDE.md first. No UI in this prompt.

GOAL
Extend the data layer so the outbound engine has exactly one access path, matching how
store.ts already works for the inbound side.

FILE TO CREATE
src/lib/portal/lead-store.ts

Why a separate file: store.ts is already 41KB and is the inbound system of record. A second
module keeps the outbound engine reviewable and keeps resetDemoData's two halves obvious.
Mirror store.ts's existing conventions exactly — read it first. In particular: the
module-singleton guarded against dev HMR, and the rule that every mutator takes an `actor`
string and never trusts a caller-supplied identity.

EXPORT these functions.

Reads:
  getSweeps(): Sweep[]
  getProspects(): Prospect[]
  getProspect(id: string): Prospect | undefined
  getVenues(): VenueRecord[]
  getVenue(id: string): VenueRecord | undefined
  getSignals(triage?: SignalTriage): Signal[]
  getOutreach(prospectId?: string): OutreachRecord[]
  getBrain(): KitchenBrain

Mutators — each appends to the existing audit log in store.ts if one is exported; if not,
each appends a ProspectNote recording the actor and the change:
  addProspect(input, actor): Prospect
  setProspectStatus(id, status, actor): Prospect | undefined
  setProspectNextAction(id, iso: string | null, actor): Prospect | undefined
  assignProspect(id, owner, actor): Prospect | undefined
  addProspectNote(id, body, actor): Prospect | undefined
  attachSource(id, source: SourceLink, actor): Prospect | undefined
  deleteProspect(id, actor): { ok: boolean; name?: string }
  promoteSignal(signalId, actor): Prospect | undefined
  dismissSignal(signalId, reason: string, actor): Signal | undefined
  setVenueStatus(venueId, status: VenueOurStatus, actor): VenueRecord | undefined
  recordVenueDiff(venueId, added: string[], removed: string[], iso): VenueRecord | undefined
  addOutreach(input, actor): OutreachRecord
  setOutreachStatus(id, status, actor): OutreachRecord | undefined
  updateBrain(patch: Partial<KitchenBrain>, actor): KitchenBrain

Rules the mutators must enforce:
- attachSource must RE-SCORE the prospect, because sourceCount feeds the hard cap. A
  prospect capped at WARM for having no citation must become HOT the moment one is
  attached, with cappedBy going back to null. Test this.
- promoteSignal creates a Prospect from the Signal, sets the Signal's triage to "promoted"
  and its promotedToProspectId, and attaches the Signal's own url as a SourceLink with
  kind "news" and a note stating that it establishes the signal but not the organisation's
  catering need. The new Prospect's sourcedBy is "agent" when actor is the agent, otherwise
  the actor's role. sourcedISO is set once and never rewritten.
- deleteProspect removes the prospect and its outreach records, and must be documented in
  a comment as needing soft-delete in production — mirror how deleteLead does this.
- setProspectStatus to "won" or "lost" requires nextActionBy to be cleared to null, so a
  closed prospect can never appear in the overdue count.
- updateBrain must reject any patch that sets a credential field to a non-null value
  without also removing the matching entry from confirmWithClient, and must throw with a
  clear message. The Brain is the one place where an unconfirmed fact becoming a confirmed
  one has to be deliberate.

Derived intelligence — pure functions, no mutation:
  prospectCounts(): Record<ProspectPriority, number>
  overdueProspects(todayISO): Prospect[]      // nextActionBy < today, status not closed
  outreachStats(): { drafted: number; approved: number; sent: number; replied: number }
      Derive every number. "sent" means the message reached the recipient, so it counts
      sent + replied + no-response + closed. Keep that list as one named constant so no
      two views can disagree about what "sent" means — store.ts has the same pattern.
  venueFunnel(): Record<VenueOurStatus, number>
  openPrimeDates(todayISO, horizonDays): string[]
      Reads the inbound calendar via store.ts's calendarOutlook() and returns prime dates
      inside the horizon with nothing booked. This is the perishable-inventory signal.
  briefingHeadline(todayISO): { kind: string; title: string; detail: string }
      Picks the headline by what is actually wrong, in this order:
        1. overdueProspects() non-empty
        2. outreach drafted but not sent, with the age of the oldest
        3. openPrimeDates() non-empty inside 45 days
        4. venues with ourStatus "applied" and appliedISO older than 21 days
        5. otherwise, this week's new prospects
      If item 1 is non-empty, item 1 IS the headline. Never lead with new finds while
      something is overdue. Write a comment saying why: an engine that flatters itself
      gets switched off in month three.

Wire into resetDemoData() in store.ts: add a call to a new resetLeadDemoData() exported
from this file, so one reset restores both halves. Do not duplicate the reset logic.

ACCEPTANCE
- npx tsc --noEmit: 0 errors. npx next lint: 0 warnings.
- node scripts/test-scoring.mjs still prints 51 passed, 0 failed.
- node scripts/test-prospect-scoring.mjs still passes.

DO NOT
- Do not let any route or component import lead-seed.ts directly. The store is the only
  access path, exactly as it is for the inbound side.
- Do not accept an actor from a request body anywhere. The actor comes from the session.
- Do not add UI or routes.
```

---

# PROMPT L05 — API routes

```
Read CLAUDE.md first. No UI in this prompt.

GOAL
Expose the outbound engine's mutations over HTTP, matching the existing route conventions
in src/app/api/portal/ exactly. Read src/app/api/portal/leads/route.ts and
src/app/api/portal/leads/[id]/route.ts first and follow their shape: Zod on every body, a
discriminated union for action dispatch, the actor taken from the session and never from
the body, and the same rate-limiting approach already used by demo-login.

FILES TO CREATE
src/app/api/portal/prospects/route.ts          POST create · DELETE remove
src/app/api/portal/prospects/[id]/route.ts     PATCH status | nextAction | assign | note | source
src/app/api/portal/signals/route.ts            PATCH promote | dismiss
src/app/api/portal/venues/[id]/route.ts        PATCH status | diff
src/app/api/portal/outreach/route.ts           POST create · PATCH status
src/app/api/portal/brain/route.ts              PATCH update

Rules:
- Every handler calls requireStaff() from src/lib/portal/guard.ts first and returns 401 on
  no session.
- /api/portal/brain PATCH is owner-only. Return 403 for the assistant. The Brain is the
  source of truth for every generated document and the assistant must not be able to
  assert a credential.
- DELETE on /api/portal/prospects is owner-only, mirroring how lead deletion works.
- Every Zod failure returns 400 with the issue list, never a 500.
- A mutation on an id that does not exist returns 404, not 200 with a null body.
- Attaching a source requires label, url, kind, retrievedISO and a non-empty note. Reject a
  blank note with a 400 whose message says the note must state what the source establishes
  and what it does not — the API is the right place to enforce the rule that the whole
  engine's honesty rests on.

ACCEPTANCE
- npx tsc --noEmit: 0 errors. npx next lint: 0 warnings. npm run build: 0 warnings.
- Every new route appears in the build output as a dynamic route.

DO NOT
- Do not read the actor, role or orgId from the request body in any handler.
- Do not add a GET to any of these. Pages read through the store on the server.
- Do not add UI.
```

---

# PROMPT L06 — The prospects board and detail view

```
Read CLAUDE.md first. THE PORTAL DESIGN IS LOCKED — this prompt builds inside it.

Use the existing classes from src/app/portal/portal.css and the existing components from
src/components/portal/Ui.tsx (Card, Stat, BandBadge, StageBadge, ScoreMeter, EmptyState,
money, shortDate, relativeTime) and Icons.tsx. Introduce no new colours, no new radii, and
no new shadow values. If you need a visual treatment that does not exist, say so in your
reply rather than inventing one.

GOAL
The outbound board, and the dossier that makes a cold call possible.

FILES TO CREATE
src/app/portal/prospects/page.tsx
src/app/portal/prospects/[id]/page.tsx
src/components/portal/ProspectBoard.tsx
src/components/portal/ProspectCard.tsx
src/components/portal/AddProspect.tsx
src/components/portal/SourceList.tsx

THE BOARD (src/app/portal/prospects/page.tsx)
Server component. requireStaff(). Read via getProspects() and prospectCounts().

Header: "Prospects" for the owner, "Call list" for the assistant. Subtitle gives the live
count by priority and the overdue count. Priority chips reuse .p-badge with .p-band-A for
HOT, .p-band-B for WARM, .p-band-C for WATCH and .p-band-D for DECLINE — the band colours
already exist and already mean "better to worse", so do not add a fifth colour.

Then a filter row: priority, category, status, sweep. Selects use .p-select with aria-label
rather than a visually-hidden label — PipelineBoard.tsx learned this the hard way, because
Tailwind's sr-only is position:absolute and a hidden label inside a scrolled column
resolves against the viewport and drags the document width out with it. Read
PipelineBoard.tsx and follow it.

Then <ProspectBoard>, a client component with columns by status, drag to move between
them, reusing the pointer-event drag approach already proven in PipelineBoard.tsx. Do not
write a second drag implementation — extract the shared logic if that is clean, otherwise
follow the same pattern. Columns use .p-column, cards use .p-drag-card, the drag ghost uses
.p-drag-ghost.

CRITICAL — the financial leak. Client component props are serialised into the page whether
they render or not. Build a narrow BoardProspect type on the server carrying only what a
card draws, and omit estValue entirely when canSeeFinancials(session.role) is false. Do not
pass full Prospect objects and hide the money in the markup. src/app/portal/leads/page.tsx
does exactly this for BoardLead — copy that pattern and its comment.

Then the full table below the board, reusing .p-table .p-table-hover inside .p-scroll-x,
because a table is better than a board for scanning and for keyboards. Columns: Prospect
(name + ref, linking to the detail page), Score (number + priority badge), Category,
Priority, Next action (with overdue rendered in .p-bad), Owner, Sources (a count — and a
count of zero renders in .p-warn, because a prospect with no citation is the thing most
worth noticing).

THE DOSSIER (src/app/portal/prospects/[id]/page.tsx)
This page is the product. Someone who has never spoken to this organisation should be able
to read it and make the call. Order the cards in the order the caller needs them:

1. Identity — name, category, city, phone and website as real links, contact name and role
   if known. Where a field is null render "Not established" in .p-muted, never an empty
   space, so the reader knows the difference between "no contact" and "we did not check".
2. The call — openingQuestion rendered large and first, in .p-figure-sm so it carries the
   weight of a headline. Then pitch. Then caution in a card whose header reads "Before you
   dial" with IconAlert, tinted .p-warn. If caution is null, render nothing rather than an
   empty card.
3. Suggested action — full prose. When suggestedAction begins with "DO NOT", render the
   card header with IconAlert and .p-bad so declining is visually as strong as pursuing.
4. The score — reuse ScoreMeter and render all breakdown lines with weight, earned and
   reason. If cappedBy is set, render it as the final line, visually distinct, so the
   reader understands why the band is lower than the number.
5. Dates — targetDates against his calendar, each one labelled open or booked.
6. Evidence — <SourceList>. Every source as label (linked), kind badge, retrieval date,
   and the full note. The note is the point; do not truncate it.
7. Outreach — the drafts and sends for this prospect, full body text rendered verbatim in
   a <pre class="whitespace-pre-wrap"> so line breaks survive, with the status and dates.
8. Notes — the activity log, newest first, with an add-note form.

ADD PROSPECT (src/components/portal/AddProspect.tsx)
A client component in a <details> disclosure, matching how AddLead.tsx works. Every field
of ProspectScoreInput as a labelled select, so the person entering it sees exactly what
drives the score. Checkbox rows use .p-check-row, because the padding has to sit on the
label for the tap target to measure correctly.

Accessibility, non-negotiable:
- Column headings on the board are <h2> — the page's <h1> is the header, so h1→h3 is a
  heading-order failure the QA harness will catch.
- Every interactive control clears 24px, and .p-btn-sm already handles 40/44px.
- Quiet links inside card headers use .p-link, which exists because a 13px line box is
  about 20px tall and fails AA on its own.

ACCEPTANCE
- npx tsc --noEmit: 0 errors. npx next lint: 0 warnings. npm run build: 0 warnings.
- Sign in as the assistant, open /portal/prospects, and confirm the page source contains no
  estValue figure anywhere. Then sign in as the owner and confirm it does. State both
  results in your reply.
- BASE=<url> node scripts/qa-portal.mjs reports "No failures." including at 1023px and
  1024px, the two widths either side of the sidebar breakpoint.
- No horizontal page scroll at 320px on either route.

DO NOT
- Do not modify portal.css except to add a class that genuinely does not exist, and if you
  do, match the locked conventions in CLAUDE.md §1.2 and say in your reply what you added
  and why.
- Do not change PortalNav.tsx in this prompt. Navigation is wired in L10.
- Do not use emoji. Icons come from Icons.tsx.
- Do not truncate a source note or a caution to make a card look tidier.
```

---

# PROMPT L07 — Signals triage and the venue board

```
Read CLAUDE.md first. The portal design is locked; build inside it.

GOAL
Two pages. Signals is where a week's raw feed hits get turned into prospects or thrown
away. Venues is the asset that earns recurring inbound.

FILES TO CREATE
src/app/portal/signals/page.tsx
src/components/portal/SignalTriage.tsx
src/app/portal/venues/page.tsx
src/components/portal/VenueBoard.tsx

SIGNALS
Server component, requireStaff(), reads getSignals("new").

The whole design goal is two taps per signal. Each row: source, title linked to the
original, published date as relativeTime, the matchedRules as small .p-badge chips so the
reader can see WHY it surfaced, and two controls — Promote and Dismiss. Dismiss opens a
required one-line reason, because a dismissal with a reason is how the keyword rules get
better and an unexplained dismissal teaches nothing.

Below the queue, two collapsed <details> sections: everything promoted this sweep, and
everything dismissed with its reason. Both are read-only history.

Empty state uses EmptyState from Ui.tsx with an honest message: nothing is waiting, the
next sweep runs on the following Monday. Do not render a fake-cheerful empty state.

VENUES
Server component, requireStaff(), reads getVenues() and venueFunnel().

Lead with four Stat tiles from the funnel: not applied, applied, on list, declined.

Then group the venues by listType, in this order, because the order is the priority order:
1. "No kitchen — outside catering required" (byo-required) — the strongest category, so it
   goes first. Explain in one line of body copy why: a warming kitchen with no production
   kitchen means outside catering is not tolerated but required.
2. "Publishes its list" (published-open) — with the off-list fee shown prominently, because
   that fee is the pitch.
3. "Has a list, does not publish it" (unpublished-open)
4. "Unknown" (unknown)
5. "Closed" (in-house-exclusive) — collapsed by default, present so nobody researches it
   twice.

Each venue card shows: name, city, the venue URL as a real link, our status as a badge,
the off-list fee in money() with its note, requirements as a list, and the named caterers
as chips. Where caterersNamed is empty, render "List not published" in .p-muted rather than
an empty row.

The off-list fee needs a one-line explainer beside it, because the whole argument depends on
understanding who pays it: "The venue charges the client this for using an off-list
caterer. Getting on the list removes it for them." Write it once as a shared string.

A status control per venue — not-applied, applied, on-list, declined — PATCHing
/api/portal/venues/[id]. Setting "applied" stamps appliedISO server-side, never from the
client clock.

A diff history section per venue, newest first, rendering added names in .p-ok and removed
in .p-muted. Where diffs is empty, say that the list has not been re-checked yet and name
the next check date.

Competitive intelligence card at the bottom of the page: the four names appearing on both
published approved-lists — A Sharper Palate, Groovin' Gourmets, Mosaic, Garnish — labelled
as the incumbent set in institutional Richmond venues, with a line stating that this is
drawn from those venues' own published lists and is not a judgement about any of them.

ACCEPTANCE
- npx tsc --noEmit: 0 errors. npx next lint: 0 warnings. npm run build: 0 warnings.
- Dismissing a signal without a reason is impossible in the UI and returns 400 from the API.
- BASE=<url> node scripts/qa-portal.mjs reports "No failures."

DO NOT
- Do not allow a one-tap dismiss with no reason.
- Do not sort venues alphabetically. The grouping above IS the priority order.
- Do not add emoji or a new colour.
```

---

# PROMPT L08 — Outreach pipeline

```
Read CLAUDE.md first. The portal design is locked.

GOAL
The outreach pipeline, built so the backlog is impossible to ignore.

FILES TO CREATE
src/app/portal/outreach/page.tsx
src/components/portal/OutreachQueue.tsx
src/app/(print)/portal/print/outreach/[id]/page.tsx
src/components/portal/PrintableOutreach.tsx
src/components/portal/PrintControls.tsx

THE PAGE
Server component, requireStaff(), reads getOutreach() and outreachStats().

Every number on this page is derived from outreachStats(). Do not render a literal count
anywhere — that is exactly the drift this design exists to prevent.

Lead with the honest state, not a vanity metric. If anything has been drafted and not sent,
the first card on the page is a backlog card: how many are waiting, the age of the oldest in
days, and one sentence saying this needs a morning rather than another sweep. Render it with
IconAlert in .p-warn, or .p-bad once the oldest passes fourteen days. When nothing is
waiting, that card is absent entirely rather than showing a green "all clear".

Then four Stat tiles from outreachStats(): drafted, approved, sent, replied.

Then the queue, grouped draft → approved → sent → replied → no-response → closed. Each row:
the prospect name linking to its dossier, the channel as a badge, the subject, the drafted
date as relativeTime, the status control, and a "Print" link to the print route.

Expanding a row reveals the full body in a <pre class="whitespace-pre-wrap">. Never
truncate a draft in a way that hides what would actually be sent.

Status transitions are the only mutation here, PATCHing /api/portal/outreach. Moving to
"sent" stamps sentISO server-side and records sentBy from the session.

THE PRINT ROUTE
A new route group src/app/(print)/ so the print view carries neither the marketing chrome
nor the portal sidebar. Read src/app/(site)/layout.tsx to see how the existing route group
works, then write src/app/(print)/layout.tsx as a minimal shell with its own print
stylesheet: white background, black text, 11pt body, no backgrounds, no shadows, and the
PrintControls hidden by @media print.

PrintableOutreach renders the record as a clean letter: his name and contact details from
getBrain() as a header, the date, the recipient if known, the subject, the body verbatim,
and a footer line. It must read from the Brain rather than hardcoding contact details, so
there is one source of truth.

PrintControls is a small client component with a Print button and a back link to the
prospect. It must not auto-print on mount — an unexpected print dialog is hostile. Offer
the button and let the person press it.

This matters because a chef works from paper in a kitchen, not from a laptop.

ACCEPTANCE
- npx tsc --noEmit: 0 errors. npx next lint: 0 warnings. npm run build: 0 warnings.
- The print route renders with no sidebar, no site header and no mobile CTA bar. Confirm by
  loading it and saying so in your reply.
- With both seeded drafts unsent, the backlog card is the first thing on /portal/outreach.
- BASE=<url> node scripts/qa-portal.mjs reports "No failures."

DO NOT
- Do not auto-print.
- Do not put the print route inside src/app/portal/ — it would inherit the sidebar.
- Do not hardcode his phone, email or address anywhere in the printable. Read the Brain.
- Do not render a literal outreach count.
```

---

# PROMPT L09 — The Kitchen Brain and the sweeps view

```
Read CLAUDE.md first. The portal design is locked.

GOAL
The Brain is the single source of truth every generated document reads from. The sweeps view
is the engine's own record, including what it failed to verify.

FILES TO CREATE
src/app/portal/brain/page.tsx
src/components/portal/BrainEditor.tsx
src/app/portal/sweeps/page.tsx

THE BRAIN
Server component. requireRolePage("owner") — this page is owner-only, because the Brain is
where an unconfirmed fact becomes a confirmed one and the assistant must not be able to
assert a credential.

Group the fields: Identity · Service area · Credentials · Commercial terms · Capacity ·
Capabilities.

The design decision that matters: a null field renders as a filled chip reading "NOT
CONFIRMED" in .p-warn, not as an empty input. The Brain's job is to make the gaps visible.
Right now every credential field is null, which means the page opens with five amber chips
under Credentials — and that is the correct, useful first impression, because those five
items block every venue application in the engine.

The Credentials group carries one line of body copy stating what the gaps block: insurance
limit, ServSafe, business licence and health permits, SWaM status, eVA registration — and
that no venue application can go out until they are confirmed.

Each price band renders with its placeholder flag as a visible badge reading "Placeholder —
pending client confirmation", never as a footnote and never hidden.

BrainEditor is a client component PATCHing /api/portal/brain. Confirming a credential
requires the matching confirmWithClient entry to be cleared in the same submit — the API
enforces this, and the UI must make it a single deliberate action with a short confirmation
line, not two separate fields that can drift apart.

THE SWEEPS VIEW
Server component, requireStaff(), reads getSweeps().

For each sweep, newest first: the label and date as the card header, the count of records it
added, then two sections.

"What was checked" — sourcesSwept as a list, rendered in full. These strings are written to
be specific enough to re-run, so do not truncate them.

"Corrections" — every Correction. An open one (resolvedISO null) renders with IconAlert in
.p-warn; a resolved one in .p-muted with its resolution date. Open corrections sort first.

Above the sweep list, a card headed "Open questions" listing every unresolved correction
across all sweeps, with the Virginia ABC one first because it is the highest-value unknown
in the engine. Each carries whatever action resolves it — for ABC, the phone number and the
FOIA route from the correction text itself.

Write a comment in the page explaining why corrections are published rather than hidden: a
tool that shows its own failures is one you believe, and one that silently drops what it
could not check is one you stop trusting the first time you catch it.

ACCEPTANCE
- npx tsc --noEmit: 0 errors. npx next lint: 0 warnings. npm run build: 0 warnings.
- Signing in as the assistant and navigating to /portal/brain redirects away. Confirm and
  say so in your reply.
- /portal/brain opens with exactly five NOT CONFIRMED chips under Credentials.
- Attempting to confirm a credential without clearing its confirmWithClient entry returns
  400 and surfaces the message in the UI.
- BASE=<url> node scripts/qa-portal.mjs reports "No failures."

DO NOT
- Do not pre-fill any credential with a plausible default. Null is the honest value.
- Do not let the assistant reach this page or that API.
- Do not hide the placeholder flag on a price band.
```

---

# PROMPT L10 — Navigation, roles, and the Monday briefing

```
Read CLAUDE.md first, especially §1.1. THE SIDEBAR IS LOCKED. This prompt adds items to it
and changes nothing about how it looks or where it sits.

GOAL
Wire the new pages into the existing left sidebar, enforce the role split, and build the
briefing that tells him what to do on Monday.

FILES TO MODIFY
src/components/portal/PortalNav.tsx   — add nav items ONLY
src/middleware.ts                      — add the owner-only path

FILES TO CREATE
src/app/portal/briefing/page.tsx
src/components/portal/Briefing.tsx

NAVIGATION — add to the existing OWNER_NAV and ASSISTANT_NAV arrays. Do not restructure
them, do not change the rendering, do not touch the drawer, the identity block or the
breakpoint.

The existing nav already uses IconGauge, IconUsers, IconChat, IconCalendar, IconMenuBook,
IconMegaphone, IconInbox, IconSettings and IconClipboard. Every icon below is drawn from
what is left in Icons.tsx, so no icon appears twice in either array. Do not substitute.

OWNER_NAV gains, in this order immediately after Dashboard:
  { href: "/portal/briefing",  label: "Briefing",       icon: IconSpark, badge: "overdue" }
  { href: "/portal/prospects", label: "Prospects",      icon: IconFlame }
  { href: "/portal/signals",   label: "Signals",        icon: IconArrowRight, badge: "signals" }
  { href: "/portal/venues",    label: "Venues",         icon: IconCart }
  { href: "/portal/outreach",  label: "Outreach",       icon: IconMail,  badge: "drafts" }
  { href: "/portal/brain",     label: "Kitchen Brain",  icon: IconLock }
  { href: "/portal/sweeps",    label: "Sweeps",         icon: IconClock }

ASSISTANT_NAV gains the same five, with the same icons, in this order after "My desk":
Briefing, Prospects (labelled "Call list"), Signals, Venues, Outreach. It gains NEITHER
Kitchen Brain NOR Sweeps.

Confirm in your reply that no icon appears twice within OWNER_NAV and none twice within
ASSISTANT_NAV. The owner nav will now carry 15 items, which is long for a sidebar — if it
overflows the rail at 768px height, the nav already has `overflow-y-auto` on it, so verify
it scrolls rather than clipping, and say what you found.

The badge union currently accepts "actions" | "unread". Extend it to add "overdue",
"signals" and "drafts", and extend the badgeFor() function and the props PortalNav receives
from src/app/portal/layout.tsx to supply those three counts. The counts come from
overdueProspects(), getSignals("new") and outreachStats().drafted minus the sent-equivalents.
Pass them from the layout, which is already a server component doing exactly this for
actionCount and unreadCount.

MIDDLEWARE — add "/portal/brain" and "/portal/sweeps" to the owner-only paths. Read
src/middleware.ts first: it is a routing gate, NOT a security boundary, and it reads the
role via unverifiedRole() with no signature check because the Edge runtime has no
node:crypto. Each page still calls requireRolePage() itself. Do not move auth into
middleware and do not add a crypto dependency there.

THE BRIEFING
Server component, requireStaff(), reads briefingHeadline(), overdueProspects(),
outreachStats(), openPrimeDates(), getVenues() and getProspects().

The headline card is whatever briefingHeadline() returns, rendered large at the top of the
page with its detail in full prose. The ordering logic lives in the store, not here — this
page renders the decision, it does not make it.

Then, in this order:
1. Overdue — every prospect past its nextActionBy, with how many days, the phone number,
   and a link to the dossier. This is a call list, so make it dialable: the phone renders
   as a tel: link with a real tap target.
2. Unsent outreach — count and the age of the oldest, linking to /portal/outreach.
3. Open prime dates — the next 45 days, each with how many days out it is. One line of
   copy stating the point: an unbooked prime Saturday is inventory that expires worthless.
4. Venue applications waiting — ourStatus "applied" with appliedISO older than 21 days.
5. This week's new prospects — only after all of the above.
6. Open corrections — count, linking to /portal/sweeps.

For the assistant, show the same structure but filtered to what she owns, and with no
estValue anywhere — build the narrow props on the server as L06 does.

If every one of items 1 through 4 is empty, the headline becomes this week's new prospects
and the page says plainly that nothing is overdue. That is the only circumstance in which
this page leads with good news.

ACCEPTANCE
- npx tsc --noEmit: 0 errors. npx next lint: 0 warnings. npm run build: 0 warnings.
- The sidebar still renders as a sticky left rail at 1024px and above, and as a drawer
  behind a Menu button below it. Take a screenshot at 1023px and 1024px and confirm.
- No icon appears twice within OWNER_NAV, and none twice within ASSISTANT_NAV.
- The assistant's sidebar contains no Kitchen Brain and no Sweeps item, and navigating
  directly to either path redirects her.
- With the seed data, /portal/briefing leads with the outreach backlog, because two drafts
  are unsent and nothing is yet overdue.
- BASE=<url> node scripts/qa-portal.mjs reports "No failures." at every width.
- All existing suites still pass: 51 / 78 / 21 / 16.

DO NOT
- Do not change the sidebar's position, width, background, blur, border or breakpoint.
- Do not convert the nav to a top bar at any width.
- Do not restructure PortalNav.tsx. Add array entries and extend the badge union; nothing
  else.
- Do not put authentication in middleware.
```

---

# PROMPT L11 — Feed ingestion

```
Read CLAUDE.md first. No UI in this prompt.

GOAL
A script that fetches the verified feeds, matches them against keyword rules, and writes new
Signals into the store for triage. This is the engine's input stage.

FILES TO CREATE
scripts/sweep.mjs
src/lib/portal/feed-rules.ts

feed-rules.ts exports the sources and the rules as data, so adding a feed is a data change.

export const FEEDS = [
  { id: "bizsense",   name: "Richmond BizSense",  url: "https://richmondbizsense.com/feed/",        kind: "rss"  },
  { id: "vabusiness", name: "Virginia Business",   url: "https://www.virginiabusiness.com/feed/",     kind: "rss"  },
  { id: "bisnow",     name: "Bisnow",              url: "https://www.bisnow.com/feed",                kind: "rss",
    note: "National feed. The DC-scoped feed returns 404, so results must be keyword-filtered for the DC corridor." },
  { id: "philva",     name: "ThePhilVA",           url: "https://thephilva.com/feed/",                kind: "rss"  },
  { id: "gwbot",      name: "Greater Washington Board of Trade",
    url: "https://www.bot.org/wp-json/tribe/events/v1/events", kind: "json" },
  { id: "vcu",        name: "VCU Events",          url: "https://calendar.vcu.edu/api/2/events",      kind: "json" },
] as const;

Every one of those six was confirmed live and returning data on 2026-09-30. Add no feed that
has not been confirmed — a feed URL that 404s silently produces an engine that looks like it
is working and finds nothing.

Rules are keyword groups with a weight hint and a geography requirement:

export const RULES = [
  { id: "ribbon-cutting", label: "Ribbon cutting / grand opening", freshness: "this-month",
    any: ["ribbon cutting", "grand opening", "now open", "opens its doors", "officially opened"] },
  { id: "new-licence",    label: "New business licence",            freshness: "this-month",
    any: ["new license", "new licence", "business license"] },
  { id: "office-move",    label: "Office lease / relocation / HQ",  freshness: "this-quarter",
    any: ["leases office", "office lease", "relocat", "new headquarters", "moves into", "square feet"] },
  { id: "expansion",      label: "Expansion / hiring / investment", freshness: "this-quarter",
    any: ["expansion", "expands", "to add jobs", "new jobs", "investment", "opens facility"] },
  { id: "gala",           label: "Gala / fundraiser / benefit",     freshness: "this-quarter",
    any: ["gala", "fundraiser", "benefit dinner", "annual dinner", "auction"] },
  { id: "corporate-event",label: "Corporate meeting / conference",  freshness: "this-quarter",
    any: ["conference", "summit", "luncheon", "annual meeting", "breakfast", "reception"] },
] as const;

export const GEO = ["richmond", "henrico", "chesterfield", "hanover", "glen allen",
  "ashland", "midlothian", "goochland", "powhatan", "short pump", "northern virginia",
  "arlington", "alexandria", "fairfax", "washington", "d.c.", "dc", "maryland",
  "bethesda", "silver spring", "rockville"] as const;

scripts/sweep.mjs
- Node, no new dependencies. Use global fetch and a small regex RSS reader for <item>
  title/link/pubDate — do not add an XML library for six feeds.
- For each feed: fetch with a 15s timeout and a descriptive User-Agent, parse, and for each
  item test the title and description against RULES and against GEO. A hit needs at least
  one rule AND one geography term, except for the bizsense and philva feeds which are
  already Richmond-scoped — mark those in FEEDS with a `geoImplied: true` flag and skip the
  geography test for them.
- Deduplicate by url against existing signals.
- Write matches as Signal records with triage "new", the matched rule ids in matchedRules,
  and the current sweep run.
- Print a per-feed summary: fetched, matched, new, skipped-duplicate, and any error.
- A feed that fails must NOT abort the run. Catch per feed, print the error, carry on, and
  record it as a Correction on the sweep so the failure is published rather than lost.
- Exit 0 even when some feeds failed; exit 1 only when every feed failed.

Add "sweep": "node scripts/sweep.mjs" to package.json scripts.

Write a header comment in sweep.mjs stating plainly that this is a research aid, not an
oracle: it surfaces candidates for a human to triage, every promoted prospect still needs a
source attached and a human-written opening question, and the hard cap in
prospect-scoring.ts is what stops an unverified signal being treated as a lead.

ACCEPTANCE
- npm run sweep completes and prints a per-feed summary.
- Deliberately break one feed URL and confirm the run still completes, reports the error,
  and records a Correction.
- npx tsc --noEmit: 0 errors. npx next lint: 0 warnings.
- Running sweep twice produces no duplicate signals.

DO NOT
- Do not add an npm dependency.
- Do not add a feed URL that has not been confirmed live.
- Do not auto-promote a signal to a prospect. Triage is a human decision.
- Do not let one failing feed abort the sweep.
```

---

# PROMPT L12 — Tests

```
Read CLAUDE.md first.

GOAL
Prove the outbound engine holds, with the same rigour as the inbound side's 78 assertions.

FILE TO CREATE
scripts/test-lead-engine.mjs

Read scripts/test-portal.mjs first and follow it exactly: the same harness, the same
BASE env var (BASE, not BASE_URL — the existing scripts use BASE), the same sign-in helper,
the same ok()/fail() output and the same "N passed, 0 failed" footer with exit 1 on failure.

Assert at least these forty, grouped as the existing suite groups its output.

Role isolation — the group that matters most:
1. A signed-out request to /portal/prospects gets a 307, not a 200 with a meta-refresh.
2. Same for /portal/signals, /venues, /outreach, /brain, /sweeps, /briefing.
3. The assistant gets a 307 away from /portal/brain and /portal/sweeps.
4. The owner reaches all seven.
5. The assistant's /portal/prospects HTML contains no estValue figure from the seed.
6. The owner's /portal/prospects HTML does contain it.
7. The assistant's /portal/briefing HTML contains no revenue figure.
8. PATCH /api/portal/brain as the assistant returns 403.
9. DELETE /api/portal/prospects as the assistant returns 403.
10. Every one of the six new API routes returns 401 with no session.

The hard cap — the engine's honesty:
11. A prospect seeded with zero sources has priority WARM and a non-null cappedBy.
12. Its raw score total is unchanged by the cap.
13. Attaching a source via the API re-scores it and raises it above WARM.
14. cappedBy becomes null after that attach.
15. POST a source with an empty note returns 400.
16. The 400 message mentions that the note must state what the source does not establish.

Derived counts cannot drift:
17. outreachStats().drafted equals the number of outreach records.
18. With both seeds unsent, sent is 0 and replied is 0.
19. Moving one to "sent" makes sent 1 without changing drafted.
20. Moving it to "replied" keeps sent at 1 and makes replied 1 — "sent" means reached.
21. venueFunnel() totals equal getVenues().length.
22. prospectCounts() totals equal getProspects().length.

The briefing picks the right headline:
23. With two unsent drafts and nothing overdue, the headline kind is the outreach backlog.
24. Setting a prospect's nextActionBy to yesterday makes overdue the headline instead.
25. Clearing it returns the headline to the backlog.
26. Setting a prospect to "won" clears its nextActionBy and removes it from overdue.
27. A closed prospect never appears in overdueProspects().

Signals:
28. Dismissing without a reason returns 400.
29. Dismissing with a reason sets triage "dismissed" and stores the reason.
30. Promoting creates a prospect, sets triage "promoted" and sets promotedToProspectId.
31. The promoted prospect carries the signal's url as a source with kind "news".
32. The promoted prospect's sourcedISO is set and does not change on a later update.

Venues:
33. Setting a venue to "applied" stamps appliedISO server-side.
34. A client-supplied appliedISO in the body is ignored.
35. recordVenueDiff appends to diffs without replacing earlier entries.

The Brain:
36. Every credential field is null in the seed.
37. confirmWithClient has five entries.
38. PATCHing a credential without clearing its confirmWithClient entry returns 400.
39. PATCHing both together succeeds and the entry is gone.
40. Every price band in the seed has placeholder true.

Then add a seed-integrity group, which is the one that protects against fabrication
creeping back in on a later build:
41. Every SourceLink in the seed has a non-empty note at least 40 characters long.
42. Every prospect added by sweep 1 has at least one source, except the deliberate
    zero-source fixture if you add one.
43. Every phone number anywhere in the seed matches one of the five verified numbers listed
    in L03's acceptance criteria. Write the assertion as a regex sweep of the seed module's
    JSON-serialised output for anything shaped like a phone number, then check each hit
    against that allowlist — this is the single assertion that would catch a future agent
    inventing a contact.
44. Every prospect has a non-empty openingQuestion and suggestedAction.
45. The DECLINE prospect's suggestedAction begins with "DO NOT".

Add "test:lead-engine": "node scripts/test-lead-engine.mjs" to package.json.

ACCEPTANCE
- BASE=<url> node scripts/test-lead-engine.mjs prints "N passed, 0 failed", N >= 45.
- All existing suites still pass unchanged: test-scoring 51, test-portal 78,
  test-pipeline 21, verify-portal-entry 16, test-prospect-scoring from L02.
- BASE=<url> node scripts/qa-portal.mjs reports "No failures."

NOTE ON RATE LIMITING
The sign-in endpoint is rate limited and the QA harness will hit 429 if you run the suites
repeatedly against one server. Restart the server between full runs, and never use pkill in
the same bash command as a build or a test — it kills the shell and you will debug a stale
bundle for an hour. Separate commands.

DO NOT
- Do not weaken an existing assertion to make a new one pass.
- Do not use a test framework. The repo's convention is plain node scripts.
```

---

# PROMPT L13 — QA, hardening and the handoff

```
Read CLAUDE.md first.

GOAL
Bring the whole thing to the project's definition of done and write the handoff.

TASKS

1. Extend scripts/qa-portal.mjs to cover the seven new routes for both roles. Add them to
   the existing route arrays — do not write a second harness. Keep the width sweep at
   320 / 390 / 768 / 1023 / 1024 / 1440 and keep both sidebar-breakpoint widths.

2. Run the full gate and fix everything it finds:
   npx tsc --noEmit                      → 0 errors
   npx next lint                         → 0 warnings
   npm run build                         → 0 warnings
   node scripts/test-scoring.mjs                      → 51 passed
   node scripts/test-prospect-scoring.mjs             → passing
   BASE=<url> node scripts/test-portal.mjs            → 78 passed
   BASE=<url> node scripts/test-pipeline.mjs          → 21 passed
   BASE=<url> node scripts/verify-portal-entry.mjs    → 16 passed
   BASE=<url> node scripts/test-lead-engine.mjs       → 45+ passed
   BASE=<url> node scripts/qa-portal.mjs              → "No failures."
   npm run sweep                                       → completes

3. Design-lock verification. Screenshot both roles at 1023px and 1024px on
   /portal/briefing, /portal/prospects and /portal/venues. Confirm in your reply that the
   sidebar is still a sticky left rail above 1024px and a drawer below it, that cards are
   still glass with the inset top highlight, and that nav links are still pills. If
   anything drifted, fix it rather than reporting it.

4. State handling. Every new route needs a designed loading state, an empty state using
   EmptyState from Ui.tsx, and an error state. An empty state must be honest — when there
   are no signals it says the next sweep runs Monday, not "great job, you're all caught up".

5. Accessibility. Keyboard-only pass through: triage a signal, change a prospect's status
   on the board, set a venue to applied, and move an outreach record to sent. Reduced-motion
   pass on every new route. Screen-reader pass on the prospect dossier, which is the densest
   new page. Report what you found.

6. Write PORTAL-LEAD-ENGINE.md in the repo root covering:
   - What the engine is and, plainly, what it is not: it surfaces candidates for a human to
     triage; it does not find customers by itself.
   - The weekly operating rhythm: Monday run npm run sweep, triage /portal/signals, work the
     briefing top-down, send what is approved.
   - The source-citation rule and why every note must say what a source does not establish.
   - The hard cap, and why a prospect with no citation is held at WARM.
   - How to add a feed (edit FEEDS in feed-rules.ts) and a keyword rule (edit RULES).
   - The five gating credential items blocking every venue application, and that
     /portal/brain shows them as amber chips until confirmed.
   - The Virginia ABC open question, the phone number and the FOIA route.
   - Compliance: TCPA and A2P 10DLC for calls and texts, CAN-SPAM for email, National DNC
     scrubbing for consumer calls, and that the chef's lawyer should review the outbound
     programme before the first campaign.
   - That marriage-licence mining is closed by statute in Virginia and must not be revisited
     — cite Va. Code 32.1-267(F), 32.1-271 and 17.1-293.
   - The in-memory store's limits and that Supabase is the production path.

7. Append to CONTEXT.md's CONFIRM WITH CLIENT block the five gating credential items and
   the three commercial unknowns, renumbering the existing list correctly. Verify no
   cross-reference elsewhere in the repo points at an item number you changed.

ACCEPTANCE
Report every command's actual output. If something fails, fix it and re-run rather than
reporting it as a known issue. State explicitly:
- the five gating credential items as they now appear in CONTEXT.md
- the screenshot verdict on the sidebar at 1023px and 1024px
- what the keyboard and screen-reader passes found
- the final count from every suite

DO NOT
- Do not mark anything done with a failing check.
- Do not narrow the qa-portal width sweep.
- Do not change the portal design to make a test pass. Fix the test or the markup.
```

---

# CONFIRM WITH CLIENT

Nothing in this package guesses at any of the following. Every one is `null` or flagged in
the seed, and the Kitchen Brain renders each as an amber NOT CONFIRMED chip until answered.

**These five block every venue application, which is the highest-ROI work in the engine.**

1. General liability insurance — carrier and limit. WIPA requires $1M per occurrence and
   venues will ask before adding a caterer to a list.
2. ServSafe or food-handler certification — holder, and expiry date.
3. Business licence — which jurisdictions. Health-department permits — which jurisdictions.
4. SWaM certification status with the Virginia Department of Small Business and Supplier
   Diversity. If not certified, does he want to be?
5. eVA vendor registration status.

**These block pricing anything the engine produces.**

6. Real price bands by service model. Every figure in the build is a placeholder.
7. Travel radius, and the travel fee beyond it. This drives the distance factor in the
   outbound score, which currently falls back to a documented 40-mile assumption.
8. Minimums, deposit terms, cancellation policy.
9. Maximum events per week and minimum lead time. These drive the date-fit factor.

**These block the outbound programme itself.**

10. Does he approve outbound prospecting in his name, and does he want to see every draft
    before it sends or approve a template once?
11. His lawyer's review of the outbound programme and of the commission agreement.
12. The eight commission clauses in `LEAD-ENGINE.md` Part C.

**Still outstanding from the portal build.**

13. The assistant's name and email address. The demo button reads "Assistant Portal"
    because this is unknown.
14. Real dish names — everything on the site is currently a description of what is visible
    in his photographs.
15. The domain and Google Business Profile recovery — see `DOMAIN-AND-GBP-RECOVERY.md`.

**One call each resolves these, and the first is the highest-value unknown in the engine.**

16. Virginia ABC, **(804) 213-4577** — are banquet licences included in the public licensee
    search or the downloadable file, and do the records carry the event date and location?
17. Maymont — the supplemental pre-screened Approved Caterers list: criteria, fee, how to
    apply.
18. Cultural Arts Center at Glen Allen, Christiana Roberts, Events Sales Manager — approval
    criteria for the approved-caterer list.
19. Science Museum of Virginia, **804.864.1466** — the preferred-caterer list is referenced
    on their page but not published.
20. eVA vendor registration fee and SWaM certification fee. Neither is published.
