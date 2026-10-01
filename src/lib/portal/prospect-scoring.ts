/**
 * OUTBOUND PROSPECT SCORING
 *
 * This is a SEPARATE engine from scoring.ts, deliberately.
 *
 * The inbound engine asks "is this enquiry worth his time" — it is scoring
 * someone who already wants to hire him, so it weighs budget, lead time and
 * whether they are the decision maker.
 *
 * This engine asks a different question: "is this stranger worth a call." The
 * factors that matter are whether they could fill a date he has open, whether
 * the signal is fresh enough to act on, whether there is a named human to reach,
 * and whether a competitor is already embedded. Budget barely features, because
 * at this stage nobody has named one.
 *
 * What the two share is the SHAPE of the breakdown — a line per factor with its
 * weight, what it earned and why — so the existing ScoreMeter UI renders both.
 *
 * Pure throughout: the same input and the same radius produce the same output.
 */

import type {
  ProspectPriority,
  ProspectScore,
  ProspectScoreLine,
} from "./lead-types";

/* ══════════════════════════ Weights ═════════════════════════════════════ */

/**
 * Nine factors, summing to exactly 100.
 *
 * Date fit leads because an unbooked prime Saturday is perishable inventory that
 * expires worthless — it is the only factor measuring something he is actively
 * losing. Freshness is second because a ribbon cutting next month is actionable
 * and a filing from 2023 is history.
 */
export const PROSPECT_WEIGHTS = {
  dateFit: 20,
  freshness: 16,
  access: 14,
  spendEvidence: 12,
  distance: 10,
  repeatability: 10,
  incumbency: 8,
  brandFit: 6,
  effort: 4,
} as const;

export type ProspectFactorKey = keyof typeof PROSPECT_WEIGHTS;

const WEIGHT_TOTAL = Object.values(PROSPECT_WEIGHTS).reduce((a, b) => a + b, 0);
if (WEIGHT_TOTAL !== 100) {
  // Thrown at module load rather than checked in a test, so a weight edit that
  // breaks the total cannot reach a running build at all.
  throw new Error(`Prospect weights must sum to 100, got ${WEIGHT_TOTAL}`);
}

export const MAX_PROSPECT_SCORE = 100;

/**
 * Used when the Kitchen Brain has no confirmed travel radius. Stated in the
 * reason string every time it is used, so a score that rests on an assumption
 * says so on the card rather than looking like a measurement.
 */
export const ASSUMED_RADIUS_MILES = 40;

/* ══════════════════════════ Input ═══════════════════════════════════════ */

export type DateFit = "prime-open" | "open" | "tight" | "unknown" | "unavailable";
export type Freshness = "this-month" | "this-quarter" | "this-year" | "stale";
export type Access =
  | "named-decision-maker"
  | "named-contact"
  | "department"
  | "switchboard";
export type SpendEvidence = "disclosed-figure" | "strong-proxy" | "weak-proxy" | "none";
export type Repeatability = "recurring-list" | "recurring-events" | "annual" | "one-off";
export type Incumbency = "open-lane" | "weak-incumbent" | "strong-incumbent" | "exclusive";
export type BrandFit = "flagship" | "good" | "neutral" | "off-brand";
export type Effort = "low" | "medium" | "high";

/**
 * Every field is an enum or a number, never free text. The score has to be
 * reproducible from the input — if a factor depended on prose, two people
 * entering the same prospect would get different numbers.
 */
export interface ProspectScoreInput {
  dateFit: DateFit;
  freshness: Freshness;
  access: Access;
  spendEvidence: SpendEvidence;
  /** Null means unknown, which is not the same as near. */
  distanceMiles: number | null;
  repeatability: Repeatability;
  incumbency: Incumbency;
  brandFit: BrandFit;
  effort: Effort;
  /** How many verified sources the record carries. Drives the hard cap. */
  sourceCount: number;
}

/* ══════════════════════════ Factors ═════════════════════════════════════ */

interface FactorResult {
  fraction: number;
  reason: string;
}

export function scoreDateFit(v: DateFit): FactorResult {
  switch (v) {
    case "prime-open":
      return { fraction: 1, reason: "Lands on an open date his calendar flags as prime." };
    case "open":
      return { fraction: 0.75, reason: "Lands on a date he has open." };
    case "tight":
      return { fraction: 0.4, reason: "The date is workable but already tight." };
    case "unknown":
      return { fraction: 0.3, reason: "No date yet, so this cannot be matched to his calendar." };
    case "unavailable":
      return {
        fraction: 0,
        reason: "The date is already committed. Not disqualifying — events move — but it earns nothing here.",
      };
  }
}

export function scoreFreshness(v: Freshness): FactorResult {
  switch (v) {
    case "this-month":
      return { fraction: 1, reason: "The signal is from this month and is actionable now." };
    case "this-quarter":
      return { fraction: 0.7, reason: "The signal is from this quarter." };
    case "this-year":
      return { fraction: 0.35, reason: "The signal is from this year and may have moved on." };
    case "stale":
      return { fraction: 0.1, reason: "The signal is old enough that it is history, not a lead." };
  }
}

export function scoreAccess(v: Access): FactorResult {
  switch (v) {
    case "named-decision-maker":
      return { fraction: 1, reason: "A named decision maker, reachable directly." };
    case "named-contact":
      return { fraction: 0.7, reason: "A named contact, though not confirmed as the decision maker." };
    case "department":
      return { fraction: 0.4, reason: "A department or shared inbox, with no named person." };
    case "switchboard":
      return { fraction: 0.15, reason: "A main switchboard only — the first call is spent finding the right person." };
  }
}

export function scoreSpendEvidence(v: SpendEvidence): FactorResult {
  switch (v) {
    case "disclosed-figure":
      return {
        fraction: 1,
        reason: "They have disclosed a catering figure — a Form 990 Schedule G line, or a published budget.",
      };
    case "strong-proxy":
      return { fraction: 0.7, reason: "Strong proxy for spend: venue tier, event scale or a comparable event." };
    case "weak-proxy":
      return { fraction: 0.35, reason: "Weak proxy for spend — an inference rather than evidence." };
    case "none":
      return { fraction: 0.1, reason: "No evidence of what they spend on food." };
  }
}

export function scoreDistance(
  miles: number | null,
  radius: number | null,
): FactorResult {
  if (miles === null) {
    return {
      fraction: 0.4,
      reason: "Distance is unknown, which is not the same as near — this earns a partial score, not a free pass.",
    };
  }
  const assumed = radius === null;
  const r = radius ?? ASSUMED_RADIUS_MILES;
  const suffix = assumed
    ? ` (against an assumed ${ASSUMED_RADIUS_MILES}-mile radius — his real travel radius is not yet confirmed)`
    : ` (against his ${r}-mile radius)`;

  if (miles <= r * 0.5) return { fraction: 1, reason: `${miles} miles, well inside the radius${suffix}.` };
  if (miles <= r) return { fraction: 0.8, reason: `${miles} miles, inside the radius${suffix}.` };
  if (miles <= r * 1.5)
    return { fraction: 0.45, reason: `${miles} miles, somewhat beyond the radius${suffix}.` };
  if (miles <= r * 2.5)
    return {
      fraction: 0.2,
      reason: `${miles} miles — the return leg has to be priced deliberately or this loses money${suffix}.`,
    };
  return { fraction: 0, reason: `${miles} miles, far outside any workable radius${suffix}.` };
}

export function scoreRepeatability(v: Repeatability): FactorResult {
  switch (v) {
    case "recurring-list":
      return {
        fraction: 1,
        reason: "A venue or vendor list — one placement earns recurring inbound with no further spend.",
      };
    case "recurring-events":
      return { fraction: 0.8, reason: "They run events on a regular cycle." };
    case "annual":
      return { fraction: 0.5, reason: "An annual event — worth winning, but once a year." };
    case "one-off":
      return { fraction: 0.2, reason: "A single event with no repeat built in." };
  }
}

export function scoreIncumbency(v: Incumbency): FactorResult {
  switch (v) {
    case "open-lane":
      return { fraction: 1, reason: "No incumbent caterer defending this." };
    case "weak-incumbent":
      return { fraction: 0.65, reason: "An incumbent exists but is not entrenched — an overflow pitch works." };
    case "strong-incumbent":
      return {
        fraction: 0.3,
        reason: "A strong incumbent. Pitch overflow capacity, never displacement — the displacement pitch gets corrected in the first thirty seconds.",
      };
    case "exclusive":
      return { fraction: 0, reason: "An exclusive provider holds this. It is closed." };
  }
}

export function scoreBrandFit(v: BrandFit): FactorResult {
  switch (v) {
    case "flagship":
      return { fraction: 1, reason: "Exactly the work he wants more of, and worth showing." };
    case "good":
      return { fraction: 0.75, reason: "Good fit for the brand." };
    case "neutral":
      return { fraction: 0.4, reason: "Neither helps nor hurts the brand." };
    case "off-brand":
      return { fraction: 0, reason: "Off-brand — winning it would point the business the wrong way." };
  }
}

export function scoreEffort(v: Effort): FactorResult {
  switch (v) {
    case "low":
      return { fraction: 1, reason: "Little research and few touches before a decision." };
    case "medium":
      return { fraction: 0.6, reason: "Moderate research and several touches." };
    case "high":
      return { fraction: 0.25, reason: "Heavy research and many touches before anyone decides." };
  }
}

/* ══════════════════════════ Bands ═══════════════════════════════════════ */

export const PROSPECT_BANDS = {
  HOT: { min: 72, label: "Call this week", routing: "Chef or agent calls", sla: "7 days" },
  WARM: { min: 52, label: "Call this month", routing: "Assistant or agent", sla: "30 days" },
  WATCH: { min: 32, label: "Keep an eye on it", routing: "Nurture", sla: "quarterly" },
  DECLINE: { min: 0, label: "Do not pursue", routing: "Recorded as evidence", sla: "none" },
} as const;

const BAND_ORDER: ProspectPriority[] = ["HOT", "WARM", "WATCH", "DECLINE"];
const BAND_RANK: Record<ProspectPriority, number> = {
  HOT: 0,
  WARM: 1,
  WATCH: 2,
  DECLINE: 3,
};

export function priorityFor(total: number): ProspectPriority {
  for (const band of BAND_ORDER) {
    if (total >= PROSPECT_BANDS[band].min) return band;
  }
  return "DECLINE";
}

/* ══════════════════════════ Caps ════════════════════════════════════════ */

const UNSOURCED_MAX_BAND: ProspectPriority = "WARM";

/**
 * The rule that keeps the board honest.
 *
 * A prospect with no verified source cannot rank above WARM however well it
 * scores. Without this, the board fills with plausible-sounding entries that
 * nobody can check — and a lead engine whose top item turns out to be a guess is
 * one the chef stops opening.
 *
 * Note what the cap does and does not do: it lowers the BAND, never the number.
 * The total stays where it earned, so attaching a citation lifts the prospect
 * immediately rather than requiring a re-entry.
 */
export function applyProspectCap(
  priority: ProspectPriority,
  input: ProspectScoreInput,
): { priority: ProspectPriority; cappedBy: string | null } {
  // Exclusive incumbency is absolute — there is nothing to pursue.
  if (input.incumbency === "exclusive") {
    return {
      priority: "DECLINE",
      cappedBy:
        "An exclusive provider holds this account or venue, so it is recorded as evidence rather than as a target, whatever the rest of the score says.",
    };
  }

  if (input.sourceCount === 0 && BAND_RANK[priority] < BAND_RANK[UNSOURCED_MAX_BAND]) {
    return {
      priority: UNSOURCED_MAX_BAND,
      cappedBy:
        "No verified source yet, so this is held at WARM until one is attached — a plausible-sounding prospect with no citation is a guess, not a lead. The score itself is unchanged; attach a source and it lifts.",
    };
  }

  return { priority, cappedBy: null };
}

/* ══════════════════════════ The composer ════════════════════════════════ */

const FACTOR_LABELS: Record<ProspectFactorKey, string> = {
  dateFit: "Date fit",
  freshness: "Signal freshness",
  access: "Access to a decision maker",
  spendEvidence: "Evidence of spend",
  distance: "Distance",
  repeatability: "Repeatability",
  incumbency: "Incumbency",
  brandFit: "Brand fit",
  effort: "Effort to a decision",
};

export function scoreProspect(
  input: ProspectScoreInput,
  travelRadiusMiles: number | null,
): { score: ProspectScore; priority: ProspectPriority } {
  const results: Record<ProspectFactorKey, FactorResult> = {
    dateFit: scoreDateFit(input.dateFit),
    freshness: scoreFreshness(input.freshness),
    access: scoreAccess(input.access),
    spendEvidence: scoreSpendEvidence(input.spendEvidence),
    distance: scoreDistance(input.distanceMiles, travelRadiusMiles),
    repeatability: scoreRepeatability(input.repeatability),
    incumbency: scoreIncumbency(input.incumbency),
    brandFit: scoreBrandFit(input.brandFit),
    effort: scoreEffort(input.effort),
  };

  // Iterate the weights object so the line order always matches the weight
  // order — the UI reads them top to bottom and the test asserts it.
  const lines: ProspectScoreLine[] = (
    Object.keys(PROSPECT_WEIGHTS) as ProspectFactorKey[]
  ).map((key) => {
    const weight = PROSPECT_WEIGHTS[key];
    const { fraction, reason } = results[key];
    return {
      key,
      label: FACTOR_LABELS[key],
      weight,
      earned: Math.round(weight * fraction * 10) / 10,
      reason,
    };
  });

  const total = Math.round(lines.reduce((sum, l) => sum + l.earned, 0));
  const raw = priorityFor(total);
  const { priority, cappedBy } = applyProspectCap(raw, input);

  if (cappedBy) {
    // A tenth line, so the card explains why the band is lower than the number.
    lines.push({
      key: "cap",
      label: "Held back",
      weight: 0,
      earned: 0,
      reason: cappedBy,
    });
  }

  return { score: { total, lines, cappedBy }, priority };
}
