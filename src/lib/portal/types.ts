/**
 * Portal domain types.
 *
 * Every record carries `orgId`. The portal is built multi-tenant from the first
 * line so the same codebase can run a second chef, a restaurant group, or the
 * agency's own instance without a schema migration. In demo mode there is
 * exactly one org (`ORG_ID`).
 *
 * DESIGN NOTE — one record, whole lifecycle.
 * A private chef's business does not split "lead" and "booking" into two
 * systems; the same conversation becomes the event. So a single `Lead` record
 * carries the enquiry through qualification, quoting, tasting, contract and
 * service, and grows an optional `event` block once it is confirmed. This keeps
 * the timeline, the messages and the menu attached to one thing the chef can
 * point at, instead of scattering them across three tables that have to be
 * reconciled by hand.
 */

export const ORG_ID = "org_chefrkearse";

/* ────────────────────────────────────────────────────────────── People ───── */

export type StaffRole = "owner" | "assistant";

export interface StaffUser {
  id: string;
  orgId: string;
  name: string;
  /** Job title as it should appear in the portal UI. */
  title: string;
  email: string;
  role: StaffRole;
  initials: string;
  /**
   * Demo-only password. Real auth replaces this with Supabase Auth or an
   * OIDC provider — see PORTAL.md. Never ship a real deployment with these.
   */
  demoPassword: string;
}

/* ───────────────────────────────────────────────────────────── Enquiry ───── */

export type EventType =
  | "wedding"
  | "corporate"
  | "private-dinner"
  | "milestone"
  | "weekly-service"
  | "other";

export type VenueType =
  | "my-home"
  | "rented-venue"
  | "office"
  | "outdoor"
  | "undecided";

export type BudgetBand = "under-75" | "75-125" | "125-200" | "200-plus" | "unsure";

export type LeadSource =
  | "referral"
  | "google"
  | "instagram"
  | "returning"
  | "wedding-directory"
  | "walk-past"
  | "other";

export type DecisionMaker = "yes" | "shared" | "no";

export type Stage =
  | "new"
  | "screened"
  | "quoted"
  | "tasting"
  | "contract"
  | "deposit"
  | "confirmed"
  | "completed"
  | "lost";

export type ScoreBand = "A" | "B" | "C" | "D";

export interface ScoreLine {
  /** Criterion key, stable so the UI can group and the engine can be tuned. */
  key: string;
  label: string;
  /** Points awarded. */
  points: number;
  /** Maximum points this criterion can award. */
  max: number;
  /** Plain-English reason shown in the portal, never shown to the guest. */
  reason: string;
}

export interface LeadScore {
  total: number;
  band: ScoreBand;
  lines: ScoreLine[];
  /** ISO timestamp the score was computed. */
  computedAt: string;
}

export interface TimelineEntry {
  id: string;
  at: string;
  /** Who or what caused it. `system` covers the automations. */
  actor: string;
  kind:
    | "created"
    | "scored"
    | "stage"
    | "message"
    | "menu"
    | "email"
    | "sms"
    | "note"
    | "payment"
    | "override";
  summary: string;
  detail?: string;
}

/** Operational fields that only exist once an enquiry becomes a real event. */
export interface EventDetail {
  serviceStyle: string;
  /** Local time strings, rendered as given. Timezone is the org's. */
  loadInTime: string;
  serviceTime: string;
  staffAssigned: string[];
  depositPaid: boolean;
  depositAmount: number | null;
  balanceDue: number | null;
  /** Operational checklist. `done` is toggled from the assistant's desk. */
  runSheet: { id: string; label: string; done: boolean; owner: StaffRole }[];
  addressLine: string;
}

export interface Lead {
  id: string;
  orgId: string;
  /** Human-readable reference used in emails and on the phone. */
  ref: string;
  createdAt: string;

  name: string;
  email: string;
  phone: string;

  eventType: EventType;
  /** ISO date (no time) or null when the guest has not picked one. */
  eventDate: string | null;
  dateFlexible: boolean;
  guestCount: number;
  venueType: VenueType;
  venueCity: string;
  budgetBand: BudgetBand;
  decisionMaker: DecisionMaker;
  source: LeadSource;
  /** The guest's own description of the occasion. Length is a scoring signal. */
  occasionNotes: string;
  dietaryNotes: string;
  depositOk: boolean;
  callOk: boolean;
  workedWithChefBefore: boolean;

  score: LeadScore;
  /**
   * Manual band override. The chef is the boss — the engine advises, it does
   * not decide. When set, the portal shows both the computed band and this one.
   */
  scoreOverride: { band: ScoreBand; by: string; at: string; reason: string } | null;

  stage: Stage;
  /** Staff user id the lead is assigned to, or null for unclaimed. */
  assignedTo: string | null;
  tags: string[];

  quotedValue: number | null;
  bookedValue: number | null;
  lostReason: string | null;

  timeline: TimelineEntry[];
  /** Menu draft id, when the client has started one. */
  menuId: string | null;
  /** Single-purpose client-portal token. Expiring + rate-limited in production. */
  clientToken: string | null;
  event: EventDetail | null;
  /** ISO timestamp of the last staff reply, for the response-time metric. */
  firstRepliedAt: string | null;
}

/* ──────────────────────────────────────────────────────────────── Menu ───── */

export type MenuStatus = "draft" | "submitted" | "changes_requested" | "locked";

export interface MenuCourse {
  id: string;
  name: string;
  /** How many dishes the client may pick for this course. */
  picks: number;
  /** Dish slugs from src/lib/dishes.ts that are offered for this course. */
  offered: string[];
  /** Dish slugs the client has chosen. */
  selected: string[];
}

export interface GuestDietary {
  id: string;
  label: string;
  restrictions: string[];
  notes: string;
}

export interface MenuComment {
  id: string;
  at: string;
  authorType: "staff" | "client";
  authorName: string;
  courseId: string | null;
  body: string;
}

export interface MenuDraft {
  id: string;
  orgId: string;
  leadId: string;
  version: number;
  status: MenuStatus;
  serviceStyle: string;
  guestCount: number;
  courses: MenuCourse[];
  addOns: { id: string; label: string; selected: boolean; note: string }[];
  guestDietary: GuestDietary[];
  comments: MenuComment[];
  updatedAt: string;
  lockedAt: string | null;
  /**
   * Per-guest estimate in whole dollars, or null.
   * ALWAYS a placeholder until site.pricing.published is true. The UI labels it
   * as pending the chef's confirmation and never presents it as a quote.
   */
  estimatePerGuest: number | null;
}

/* ─────────────────────────────────────────────────────────── Messaging ───── */

export interface Message {
  id: string;
  orgId: string;
  leadId: string;
  at: string;
  authorType: "staff" | "client";
  authorName: string;
  /** Staff role, so the client can see whether the chef or the office replied. */
  authorRole: StaffRole | null;
  body: string;
  readByStaff: boolean;
  readByClient: boolean;
}

/* ──────────────────────────────────────────────────────── Subscribers ───── */

export type SubscriberSegment =
  | "seasonal-menu"
  | "corporate"
  | "weddings"
  | "past-client"
  | "lapsed";

export interface Subscriber {
  id: string;
  orgId: string;
  email: string;
  name: string | null;
  createdAt: string;
  source: "site-footer" | "menu-download" | "event-guest" | "manual" | "declined-lead";
  segments: SubscriberSegment[];
  status: "active" | "unsubscribed";
  /** ISO date of the last campaign send, for cadence limits. */
  lastSentAt: string | null;
}

/* ────────────────────────────────────────────────────────── Marketing ───── */

export type CampaignChannel = "email" | "instagram" | "paid-social" | "sms";

export interface CampaignAsset {
  id: string;
  title: string;
  kind: "email" | "social" | "ad" | "prompt-sheet" | "plan";
  description: string;
  /** Path under /public that the portal offers for download. */
  file: string;
  /** Rough file label shown next to the download control. */
  meta: string;
}

export interface Campaign {
  id: string;
  orgId: string;
  name: string;
  /** One sentence: what this campaign is for. */
  goal: string;
  /** Who it goes to, in plain words. */
  audience: string;
  segments: SubscriberSegment[];
  channels: CampaignChannel[];
  cadence: string;
  status: "live" | "seasonal" | "draft" | "paused";
  /** Months (1-12) the engine should favour this campaign. Empty = year-round. */
  activeMonths: number[];
  kpi: { sent: number; opened: number; clicked: number; enquiries: number; booked: number };
  assets: CampaignAsset[];
}

export type QueueStatus = "proposed" | "approved" | "sent" | "skipped";

export interface QueueItem {
  id: string;
  orgId: string;
  /** ISO date of the Monday this item belongs to. */
  weekOf: string;
  campaignId: string;
  channel: CampaignChannel;
  title: string;
  /** ISO datetime the send is scheduled for. */
  scheduledFor: string;
  status: QueueStatus;
  /** Why the engine queued this — shown in the UI so it never feels magic. */
  rationale: string;
  audienceCount: number;
  /** Subject line for email, caption opener for social. */
  preview: string;
  body: string;
}

/* ───────────────────────────────────────────────────────────── Session ───── */

export interface Session {
  userId: string;
  role: StaffRole;
  name: string;
  /** Unix seconds. */
  exp: number;
}
