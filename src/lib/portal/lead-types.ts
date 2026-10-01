/**
 * OUTBOUND LEAD ENGINE — TYPES
 *
 * types.ts describes the INBOUND business: enquiries that arrive, events that
 * get booked, menus that get built. This file describes the OUTBOUND engine:
 * research sweeps, prospects we go and find, venues worth getting listed at.
 *
 * They are deliberately separate. Mixing them is how the Lead type ends up with
 * thirty optional fields and nobody can tell which half of the lifecycle any
 * given record is in.
 *
 * The one symbol shared from the inbound side is StaffRole, because the same two
 * people work both halves. `orgId` is a plain string field here — ORG_ID's value
 * belongs to the seed and the store, not to a types module.
 */

import type { StaffRole } from "./types";

/* ══════════════════════════ Research runs ═══════════════════════════════ */

/**
 * A research run. Every record the engine finds points back at the sweep that
 * found it, so the UI can answer "what did this week produce" without anyone
 * maintaining a changelog by hand.
 */
export interface Sweep {
  run: number;
  /** Rendered as a chip on records this run added. */
  label: string;
  /** YYYY-MM-DD, the day the sweep ran. */
  iso: string;
  /** YYYY-MM-DD, the Monday of the reporting week. */
  weekOf: string;
  /** What was actually checked, in prose specific enough to re-run. */
  sourcesSwept: string[];
  corrections: Correction[];
}

/**
 * What changed or failed.
 *
 * Published, never silently dropped. A tool that hides its own failures is one
 * you stop trusting the first time you catch it; one that says "I checked this
 * and could not confirm it" is one you believe about everything else.
 */
export interface Correction {
  /** The record or claim re-checked. */
  subject: string;
  /** What changed, or why it could not be verified, and what would resolve it. */
  what: string;
  /** Null while still open. */
  resolvedISO: string | null;
}

/* ══════════════════════════ Evidence ════════════════════════════════════ */

export type SourceKind =
  /** The subject's own website. */
  | "organization"
  /** A listing that aggregates subjects. */
  | "directory"
  /** A results page with no stable permalink. */
  | "search"
  | "news"
  /** An IRS 990, a public register. */
  | "filing"
  | "statute";

/**
 * Evidence. Every factual claim in the engine hangs off one of these.
 *
 * `note` is the field that matters, and it is required. It states what this
 * source ESTABLISHES and, explicitly, what it does NOT: a page that gives an
 * address but not opening hours says so, so nobody downstream assumes the hours
 * were checked. Where a subject's documents sit behind a session-bound search
 * rather than a permalink, cite the search page honestly with kind "search"
 * rather than inventing a direct URL.
 *
 * This is the field that turns "real facts only" from a rule we hope an agent
 * follows into one the type system asks for.
 */
export interface SourceLink {
  label: string;
  url: string;
  kind: SourceKind;
  retrievedISO: string;
  note: string;
}

/* ══════════════════════════ Signals ═════════════════════════════════════ */

export type SignalTriage = "new" | "promoted" | "dismissed";

/** A raw feed hit, before a human decides whether it is worth pursuing. */
export interface Signal {
  id: string;
  orgId: string;
  /** "Richmond BizSense", "Hanover Chamber"… */
  source: string;
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

/* ══════════════════════════ Prospects ═══════════════════════════════════ */

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
  /** We declined it. Distinct from "lost", which is them declining us. */
  | "declined";

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

export interface ProspectNote {
  iso: string;
  actor: string;
  body: string;
}

export type ApproachChannel = "phone" | "email" | "in-person" | "social" | "text";

/**
 * The same approach written for every way of making it.
 *
 * Why this is NOT an OutreachRecord: an approach is a script that is always
 * available, whereas an OutreachRecord is a specific message that is going to be
 * sent and therefore has a status and shows up in the backlog count. Writing five
 * channels per prospect as outreach records would put "thirty messages waiting"
 * on the briefing, which is both false and exactly the signal that page exists to
 * protect. An approach becomes an outreach record at the moment somebody picks it.
 *
 * `suitability` is the honest part. Not every channel fits every prospect, and a
 * script written for a channel that would embarrass him is worse than no script —
 * so an approach can say "do not use this here" and explain why.
 */
export interface Approach {
  channel: ApproachChannel;
  /** When this channel is the right one for this prospect. */
  whenToUse: string;
  /** The actual words. A script for phone and in-person, a message otherwise. */
  body: string;
  /** "good" | "workable" | "avoid" — drives whether the UI recommends it. */
  suitability: "good" | "workable" | "avoid";
  /** Why it is rated that way. Always present, including for the good ones. */
  note: string;
}

/**
 * The outbound counterpart to Lead: a stranger worth calling, with the call
 * already written.
 *
 * The three fields that make this more than a list are `openingQuestion`,
 * `caution` and `suggestedAction`. Whoever dials may not be the chef, and those
 * three are what let them sound like they belong on the call.
 */
export interface Prospect {
  id: string;
  orgId: string;
  /** Human-quotable, e.g. "P-0014". */
  ref: string;
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
  /**
   * The same approach written for phone, email, in person, a social message and
   * a text. Collapsed in the UI — it belongs on the prospect's own page and
   * nowhere else, because five scripts on a board is a board nobody can read.
   */
  approaches: Approach[];

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
  /**
   * Never empty for a record a sweep added. Enforced at scoring time by the
   * hard cap in prospect-scoring.ts: no citation means no better than WARM.
   */
  sources: SourceLink[];
  notes: ProspectNote[];
}

/* ══════════════════════════ Venues ══════════════════════════════════════ */

export type VenueListType =
  /** Publishes its caterer list, and the list is open. */
  | "published-open"
  /** Has a list, does not publish it. */
  | "unpublished-open"
  /** No production kitchen — outside catering is required, not merely allowed. */
  | "byo-required"
  /** Closed. Recorded so nobody researches it twice. */
  | "in-house-exclusive"
  | "unknown";

export type VenueOurStatus = "not-applied" | "applied" | "on-list" | "declined";

export interface VenueDiff {
  iso: string;
  added: string[];
  removed: string[];
}

/**
 * The venue board.
 *
 * One approved-list placement earns recurring inbound forever with no further
 * marketing spend, which makes this the highest-value object in the engine.
 */
export interface VenueRecord {
  id: string;
  orgId: string;
  name: string;
  city: string;
  state: string;
  url: string;
  listType: VenueListType;
  /** Verbatim from the venue's own page. Never paraphrased, never reordered. */
  caterersNamed: string[];
  /**
   * What the venue charges THE CLIENT for using an off-list caterer.
   *
   * This is the pitch, and it is worth being precise about who pays: the fee is
   * not a cost to us, it is the friction that loses us the booking. Getting on
   * the list removes a charge the guest is paying.
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

/* ══════════════════════════ Outreach ════════════════════════════════════ */

export type OutreachChannel = "email" | "call" | "form" | "in-person";

export type OutreachStatus =
  | "draft"
  | "approved"
  | "sent"
  | "replied"
  | "no-response"
  | "closed";

/**
 * Outreach as records rather than a count.
 *
 * Every number in the UI derives from these, so the dashboard can never drift
 * from what was actually written. The inbound side learned this the same way.
 */
export interface OutreachRecord {
  id: string;
  orgId: string;
  prospectId: string;
  channel: OutreachChannel;
  subject: string;
  /** Full text, rendered verbatim in the prospect view. Never truncated. */
  body: string;
  status: OutreachStatus;
  draftedISO: string;
  sentISO: string | null;
  responseISO: string | null;
  sentBy: StaffRole | "agent" | null;
}

/* ══════════════════════════ The Kitchen Brain ═══════════════════════════ */

export interface PriceBand {
  label: string;
  perGuestLow: number | null;
  perGuestHigh: number | null;
  /**
   * True until he confirms. Rendered as a visible badge, never as a footnote —
   * a placeholder price that reads as a real one is how a quote goes out wrong.
   */
  placeholder: boolean;
}

/**
 * The Kitchen Brain — one authoritative record of the business.
 *
 * Every generated proposal, email, venue application and menu reads from this,
 * so no two outputs disagree and nothing is invented at generation time.
 *
 * Every field that is not yet confirmed is null, and the UI renders null as a
 * visible "NOT CONFIRMED" chip rather than as an empty input. That is the
 * point: the Brain's job is to make the gaps impossible to miss. Right now all
 * five credential fields are null, and those five block every venue application
 * in the engine.
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

  // ── Credentials. All five gate the venue applications. ──
  liabilityInsuranceLimit: number | null;
  insuranceCarrier: string | null;
  servSafeHolder: string | null;
  servSafeExpiryISO: string | null;
  businessLicenceJurisdictions: string[];
  healthPermitJurisdictions: string[];
  swamCertified: boolean | null;
  evaRegistered: boolean | null;

  // ── Commercial terms. Placeholders until confirmed. ──
  priceBands: PriceBand[];
  travelRadiusMiles: number | null;
  travelFeeNote: string | null;
  minimumNote: string | null;
  depositNote: string | null;
  cancellationNote: string | null;

  // ── Capacity rules. These drive the date-fit factor in the outbound score. ──
  maxEventsPerWeek: number | null;
  minLeadTimeDays: number | null;

  capabilities: string[];
  cuisines: string[];
  /** Every entry is pending client confirmation and renders as such. */
  confirmWithClient: string[];
}
