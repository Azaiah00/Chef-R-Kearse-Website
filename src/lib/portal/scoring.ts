/**
 * QUALIFICATION ENGINE
 *
 * The brief: "he is tired of people wasting his time and not following through
 * to becoming a real client."
 *
 * So this scores every enquiry on nine signals that actually predict whether
 * someone books, routes it into one of four bands, and tells the office exactly
 * how much human attention the enquiry has earned. The guest never sees a score.
 *
 * ── Two principles it is built on ────────────────────────────────────────────
 *
 * 1. THE BEST FILTER IS AN HONEST PRICE FLOOR, STATED EARLY.
 *    A budget question that names a real starting number removes unqualified
 *    enquiries before they cost anyone a phone call, and it does it without a
 *    gatekeeper being rude to anybody. That is why budget carries the single
 *    heaviest weight here.
 *
 * 2. EFFORT PREDICTS FOLLOW-THROUGH.
 *    Someone who writes four sentences about their daughter's engagement dinner
 *    behaves differently from someone who types "how much". Requiring a real
 *    description, a phone number and an acknowledgment that dates are held with
 *    a deposit is friction — and friction is the point. It costs a serious buyer
 *    forty seconds and costs a tyre-kicker the whole enquiry.
 *
 * ── Every weight below is a starting proposal, not a finding ─────────────────
 * Nothing here comes from the chef's own booking history, because we do not
 * have it yet. The numbers are a defensible opening position that he tunes in
 * Settings, and they are all listed in CONTEXT.md under CONFIRM WITH CLIENT.
 * After roughly thirty scored enquiries, retune against real outcomes —
 * PORTAL.md explains how.
 */

import type {
  BudgetBand,
  DecisionMaker,
  EventType,
  LeadScore,
  LeadSource,
  ScoreBand,
  ScoreLine,
  Stage,
  VenueType,
} from "./types";

/** The shape the scorer needs. A subset of Lead, so the public form can score
 *  a submission before a Lead record exists. */
export interface ScoreInput {
  eventType: EventType;
  eventDate: string | null;
  dateFlexible: boolean;
  guestCount: number;
  venueType: VenueType;
  budgetBand: BudgetBand;
  decisionMaker: DecisionMaker;
  source: LeadSource;
  occasionNotes: string;
  depositOk: boolean;
  callOk: boolean;
  phone: string;
  workedWithChefBefore: boolean;
}

/** Maximum points per criterion. Sums to 100 — asserted in the tests. */
export const WEIGHTS = {
  budget: 22,
  leadTime: 18,
  eventType: 12,
  guestCount: 12,
  decisionMaker: 8,
  venue: 8,
  source: 8,
  deposit: 7,
  effort: 5,
} as const;

/**
 * Band thresholds and what each band buys you.
 * These drive routing, the auto-reply that goes out, and the SLA clock.
 */
export const BANDS: Record<
  ScoreBand,
  {
    label: string;
    min: number;
    /** Who touches it. */
    routing: string;
    /** How fast. */
    sla: string;
    /** What leaves the building automatically. */
    autoReply: string;
    /** Tailwind-ish token name used by the portal UI. */
    tone: "success" | "accent" | "warn" | "muted";
  }
> = {
  A: {
    label: "Priority",
    min: 75,
    routing: "Straight to the chef, flagged in his dashboard",
    sla: "Reply within 4 hours",
    autoReply: "Personal note, real open dates, and a tasting invitation",
    tone: "success",
  },
  B: {
    label: "Qualified",
    min: 55,
    routing: "Assistant screens, then hands over with a summary",
    sla: "Reply within 24 hours",
    autoReply: "Acknowledgement with menus and the consultation next step",
    tone: "accent",
  },
  C: {
    label: "Nurture",
    min: 35,
    routing: "No chef time. Added to the seasonal-menu list",
    sla: "Automated only",
    autoReply: "Menus, service overview, and the newsletter opt-in",
    tone: "warn",
  },
  D: {
    label: "Not a fit",
    min: 0,
    routing: "Closed politely, zero human time",
    sla: "Automated only",
    autoReply: "Gracious decline with the newsletter and a referral suggestion",
    tone: "muted",
  },
};

export function bandFor(total: number): ScoreBand {
  if (total >= BANDS.A.min) return "A";
  if (total >= BANDS.B.min) return "B";
  if (total >= BANDS.C.min) return "C";
  return "D";
}

/**
 * HARD CAPS — constraints, not weights.
 *
 * Caught by the test suite, and worth stating because it is the most important
 * correction in this engine: a weighted total alone lets a below-floor budget be
 * outvoted. An enquiry that is a personal referral, 70 guests, a booked venue, a
 * decision maker, well written and 60 days out scores 80 even at "under $75 a
 * guest" — which would route it straight to the chef inside four hours. That is
 * exactly the wasted hour he asked us to prevent.
 *
 * But it must not be auto-declined either. Somebody that organised with a budget
 * below the floor is a SCOPE conversation, not a brush-off — family style instead
 * of plated, a shorter menu, a smaller guest list. Auto-nurturing them loses real
 * work.
 *
 * So a below-floor budget caps the band at B: a human looks at it, cheaply and
 * within a day, and either re-scopes it or says no kindly. No amount of charm
 * makes an under-floor event profitable, and no score should pretend otherwise.
 *
 * The floor band is a placeholder pending the chef's own numbers.
 */
const BELOW_FLOOR_BUDGET: BudgetBand = "under-75";
const BELOW_FLOOR_MAX_BAND: ScoreBand = "B";

/** Rank for comparison — A is best. */
const BAND_RANK: Record<ScoreBand, number> = { A: 0, B: 1, C: 2, D: 3 };

export function applyCaps(
  band: ScoreBand,
  input: Pick<ScoreInput, "budgetBand">,
): { band: ScoreBand; cappedBy: string | null } {
  if (input.budgetBand === BELOW_FLOOR_BUDGET && BAND_RANK[band] < BAND_RANK[BELOW_FLOOR_MAX_BAND]) {
    return {
      band: BELOW_FLOOR_MAX_BAND,
      cappedBy:
        "Budget is below the service floor, so this is held at band B for a human to re-scope or decline — however well it scores otherwise.",
    };
  }
  return { band, cappedBy: null };
}

/** Whole days from `from` to `to`, floored. Date-only, so DST cannot skew it. */
export function daysBetween(from: Date, to: Date): number {
  const a = Date.UTC(from.getUTCFullYear(), from.getUTCMonth(), from.getUTCDate());
  const b = Date.UTC(to.getUTCFullYear(), to.getUTCMonth(), to.getUTCDate());
  return Math.floor((b - a) / 86_400_000);
}

/* ─────────────────────────────────────────────────── individual criteria ─── */

function scoreBudget(band: BudgetBand): ScoreLine {
  const max = WEIGHTS.budget;
  const table: Record<BudgetBand, { points: number; reason: string }> = {
    "200-plus": { points: max, reason: "Top band — plated, multi-course, full service is comfortably in reach" },
    "125-200": { points: 19, reason: "Strong band — the sweet spot for a plated private dinner" },
    "75-125": { points: 12, reason: "Workable band — family style or stations rather than plated" },
    "under-75": { points: 2, reason: "Below the service floor — almost never converts without scope cuts" },
    unsure: { points: 9, reason: "Has not thought about budget yet — needs the pricing conversation early" },
  };
  const { points, reason } = table[band];
  return { key: "budget", label: "Budget band", points, max, reason };
}

function scoreLeadTime(eventDate: string | null, flexible: boolean, now: Date): ScoreLine {
  const max = WEIGHTS.leadTime;
  if (!eventDate) {
    return {
      key: "leadTime",
      label: "Lead time",
      points: flexible ? 9 : 5,
      max,
      reason: flexible
        ? "No date yet but flexible — easy to place into an open weekend"
        : "No date yet and not flexible — hard to plan around",
    };
  }
  const days = daysBetween(now, new Date(`${eventDate}T12:00:00Z`));

  if (days < 0) {
    return { key: "leadTime", label: "Lead time", points: 0, max, reason: "Date has already passed — almost certainly a form error" };
  }
  if (days <= 6) {
    return { key: "leadTime", label: "Lead time", points: 2, max, reason: `${days} days out — inside the sourcing and staffing window` };
  }
  if (days <= 13) {
    return { key: "leadTime", label: "Lead time", points: 6, max, reason: `${days} days out — tight, possible only if the menu is simple` };
  }
  if (days <= 20) {
    return { key: "leadTime", label: "Lead time", points: 12, max, reason: `${days} days out — workable with a fast menu lock` };
  }
  if (days <= 120) {
    return { key: "leadTime", label: "Lead time", points: max, max, reason: `${days} days out — the ideal planning window` };
  }
  if (days <= 300) {
    return { key: "leadTime", label: "Lead time", points: 14, max, reason: `${days} days out — real, but expect a long nurture before deposit` };
  }
  return { key: "leadTime", label: "Lead time", points: 9, max, reason: `${days} days out — very early; keep warm, do not spend chef time yet` };
}

function scoreEventType(t: EventType): ScoreLine {
  const max = WEIGHTS.eventType;
  // Weddings and corporate are weighted up because they are the two lines the
  // chef has said he wants to grow, and they carry the highest average value.
  const table: Record<EventType, { points: number; reason: string }> = {
    wedding: { points: max, reason: "Wedding — highest average value and a growth priority" },
    corporate: { points: max, reason: "Corporate — repeatable, invoiced, and a growth priority" },
    "weekly-service": { points: 11, reason: "Weekly personal chef service — recurring revenue, very high lifetime value" },
    milestone: { points: 8, reason: "Milestone celebration — solid one-off, often becomes a repeat guest" },
    "private-dinner": { points: 8, reason: "Private dinner — the core service, steady value" },
    other: { points: 4, reason: "Unclassified — needs a human to read the notes" },
  };
  const { points, reason } = table[t];
  return { key: "eventType", label: "Event type", points, max, reason };
}

/**
 * Guest-count fit.
 * Placeholder operating assumption: 6 is the practical minimum for a plated
 * private dinner, 12–90 is the comfortable band, and above 150 needs a
 * conversation about staffing and kit rather than an instant yes.
 */
function scoreGuestCount(n: number): ScoreLine {
  const max = WEIGHTS.guestCount;
  if (!Number.isFinite(n) || n <= 0) {
    return { key: "guestCount", label: "Party size", points: 0, max, reason: "No party size given" };
  }
  if (n < 6) return { key: "guestCount", label: "Party size", points: 4, max, reason: `${n} guests — below the practical minimum for a full service` };
  if (n <= 11) return { key: "guestCount", label: "Party size", points: 9, max, reason: `${n} guests — intimate, well suited to a plated dinner` };
  if (n <= 90) return { key: "guestCount", label: "Party size", points: max, max, reason: `${n} guests — squarely in the comfortable band` };
  if (n <= 150) return { key: "guestCount", label: "Party size", points: 10, max, reason: `${n} guests — strong value, needs a staffing plan` };
  return { key: "guestCount", label: "Party size", points: 6, max, reason: `${n} guests — large scale; confirm kit, staff and venue capacity first` };
}

function scoreDecisionMaker(d: DecisionMaker): ScoreLine {
  const max = WEIGHTS.decisionMaker;
  const table: Record<DecisionMaker, { points: number; reason: string }> = {
    yes: { points: max, reason: "Enquirer signs off — no second approval to chase" },
    shared: { points: 5, reason: "Shared decision — expect one extra round before commitment" },
    no: { points: 1, reason: "Not the decision maker — the real buyer has not been reached yet" },
  };
  const { points, reason } = table[d];
  return { key: "decisionMaker", label: "Decision maker", points, max, reason };
}

function scoreVenue(v: VenueType): ScoreLine {
  const max = WEIGHTS.venue;
  const table: Record<VenueType, { points: number; reason: string }> = {
    "my-home": { points: max, reason: "Their own home — known kitchen, no venue coordination" },
    "rented-venue": { points: 6, reason: "Booked venue — needs a kitchen check but the date is real" },
    office: { points: 7, reason: "Office — straightforward access and an invoiced payer" },
    outdoor: { points: 4, reason: "Outdoor — power, water and weather contingency all need solving" },
    undecided: { points: 2, reason: "Venue undecided — the event is not yet real enough to plan" },
  };
  const { points, reason } = table[v];
  return { key: "venue", label: "Venue readiness", points, max, reason };
}

function scoreSource(s: LeadSource, returning: boolean): ScoreLine {
  const max = WEIGHTS.source;
  if (returning) {
    return { key: "source", label: "Source", points: max, max, reason: "Has hired a private chef before — knows what it costs and how it works" };
  }
  const table: Record<LeadSource, { points: number; reason: string }> = {
    returning: { points: max, reason: "Past client — the cheapest booking he will ever make" },
    referral: { points: max, reason: "Personal referral — the highest-converting source there is" },
    "wedding-directory": { points: 6, reason: "Wedding directory — high intent, also high price shopping" },
    google: { points: 5, reason: "Found on Google — real intent, comparing options" },
    instagram: { points: 4, reason: "Instagram — strong interest, often earlier in the process" },
    "walk-past": { points: 3, reason: "Saw him working — warm but unqualified" },
    other: { points: 2, reason: "Source unclear" },
  };
  const { points, reason } = table[s];
  return { key: "source", label: "Source", points, max, reason };
}

function scoreDeposit(depositOk: boolean, callOk: boolean, phone: string): ScoreLine {
  const max = WEIGHTS.deposit;
  let points = 0;
  const notes: string[] = [];
  if (depositOk) {
    points += 4;
    notes.push("accepts that dates are held with a deposit");
  } else {
    notes.push("has not agreed to a deposit");
  }
  if (phone.replace(/\D/g, "").length >= 10) {
    points += 2;
    notes.push("gave a reachable number");
  } else {
    notes.push("no usable phone number");
  }
  if (callOk) {
    points += 1;
    notes.push("open to a short call");
  }
  return {
    key: "deposit",
    label: "Commitment signals",
    points,
    max,
    reason: notes.join("; ").replace(/^./, (c) => c.toUpperCase()),
  };
}

/**
 * Effort. Measured on the free-text occasion field.
 * Not a test of writing ability — a test of whether they stopped to think. The
 * form asks for it in a way that makes a real answer the path of least
 * resistance, so a one-word reply is itself the signal.
 */
function scoreEffort(notes: string): ScoreLine {
  const max = WEIGHTS.effort;
  const len = notes.trim().length;
  const words = notes.trim().split(/\s+/).filter(Boolean).length;
  if (len === 0) return { key: "effort", label: "Detail given", points: 0, max, reason: "Left the occasion blank" };
  if (words < 8) return { key: "effort", label: "Detail given", points: 1, max, reason: `Only ${words} words about the occasion` };
  if (words < 20) return { key: "effort", label: "Detail given", points: 3, max, reason: `${words} words — enough to work with` };
  return { key: "effort", label: "Detail given", points: max, max, reason: `${words} words — has clearly thought this through` };
}

/* ─────────────────────────────────────────────────────────────── scorer ─── */

export function scoreLead(input: ScoreInput, now: Date = new Date()): LeadScore {
  const lines: ScoreLine[] = [
    scoreBudget(input.budgetBand),
    scoreLeadTime(input.eventDate, input.dateFlexible, now),
    scoreEventType(input.eventType),
    scoreGuestCount(input.guestCount),
    scoreDecisionMaker(input.decisionMaker),
    scoreVenue(input.venueType),
    scoreSource(input.source, input.workedWithChefBefore),
    scoreDeposit(input.depositOk, input.callOk, input.phone),
    scoreEffort(input.occasionNotes),
  ];

  const total = lines.reduce((sum, l) => sum + l.points, 0);
  const { band, cappedBy } = applyCaps(bandFor(total), input);

  if (cappedBy) {
    // The cap is visible in the breakdown rather than applied silently, so the
    // office can always see why a high score did not reach the chef.
    lines.push({
      key: "cap",
      label: "Held back",
      points: 0,
      max: 0,
      reason: cappedBy,
    });
  }

  return {
    total,
    band,
    lines,
    computedAt: now.toISOString(),
  };
}

/** Total available points. Used by the UI to render "58 / 100" honestly. */
export const MAX_SCORE = Object.values(WEIGHTS).reduce((a, b) => a + b, 0);

/* ──────────────────────────────────────────────────────── copy helpers ─── */

export const BUDGET_LABELS: Record<BudgetBand, string> = {
  "under-75": "Under $75 a guest",
  "75-125": "$75 – $125 a guest",
  "125-200": "$125 – $200 a guest",
  "200-plus": "$200 a guest and up",
  unsure: "I'd like guidance on this",
};

export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  wedding: "Wedding",
  corporate: "Corporate or company event",
  "private-dinner": "Private dinner at home",
  milestone: "Birthday, anniversary or milestone",
  "weekly-service": "Weekly personal chef service",
  other: "Something else",
};

export const VENUE_LABELS: Record<VenueType, string> = {
  "my-home": "My home",
  "rented-venue": "A venue we've booked",
  office: "Our office",
  outdoor: "Outdoors — garden, tent or park",
  undecided: "Still deciding",
};

export const SOURCE_LABELS: Record<LeadSource, string> = {
  referral: "Someone recommended him",
  google: "Google search",
  instagram: "Instagram",
  returning: "I've booked him before",
  "wedding-directory": "A wedding site or directory",
  "walk-past": "I ate his food somewhere",
  other: "Somewhere else",
};

export const DECISION_LABELS: Record<DecisionMaker, string> = {
  yes: "Yes, it's my call",
  shared: "Shared — I decide with someone else",
  no: "No, I'm gathering options for someone else",
};

export const STAGE_LABELS: Record<Stage, string> = {
  new: "New",
  screened: "Screened",
  quoted: "Quoted",
  tasting: "Tasting",
  contract: "Contract out",
  deposit: "Deposit due",
  confirmed: "Confirmed",
  completed: "Completed",
  lost: "Closed",
};

/** Pipeline order for the board columns. `lost` is shown separately. */
export const STAGE_ORDER: Stage[] = [
  "new",
  "screened",
  "quoted",
  "tasting",
  "contract",
  "deposit",
  "confirmed",
  "completed",
];
