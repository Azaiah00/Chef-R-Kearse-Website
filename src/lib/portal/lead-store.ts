/**
 * OUTBOUND LEAD ENGINE — DATA ACCESS
 *
 * Every page and route handler touching the outbound engine reads and writes
 * through this module and nothing else, exactly as store.ts works for the
 * inbound side. Moving to Supabase means reimplementing these functions against
 * Postgres; no page, component or form changes.
 *
 * Why this is a second file rather than more of store.ts: store.ts is already
 * 41KB and is the inbound system of record. Keeping the outbound engine in its
 * own module keeps both reviewable, and makes the two halves of a demo reset
 * obvious instead of buried.
 *
 * Same honest limitation as store.ts: this lives in module memory on the server.
 * It survives navigation and every mutation inside a running server, which is
 * what a live demo needs, and it does not survive a restart. See PORTAL.md.
 *
 * Conventions carried over from store.ts and not to be broken:
 *   - every mutator takes an `actor` string, and callers pass it from the
 *     session; nothing here ever trusts an identity from a request body
 *   - the module singleton is guarded against Next's dev hot reload
 *   - derived numbers are computed, never stored, so no two views can disagree
 */

import { ORG_ID } from "./types";
import type { StaffRole } from "./types";
import type {
  KitchenBrain,
  OutreachRecord,
  OutreachStatus,
  Prospect,
  ProspectPriority,
  ProspectStatus,
  Signal,
  SignalTriage,
  SourceLink,
  Sweep,
  VenueOurStatus,
  VenueRecord,
} from "./lead-types";
import {
  brainSeed,
  outreachSeed,
  prospectScoreInputs,
  prospectSeed,
  signalSeed,
  sweepSeed,
  venueSeed,
} from "./lead-seed";
import { scoreProspect, type ProspectScoreInput } from "./prospect-scoring";
import { blankApproaches } from "./lead-approaches";
import { calendarOutlook } from "./store";

/* ──────────────────────────────────────────────────────────── the store ───── */

interface LeadDb {
  sweeps: Sweep[];
  prospects: Prospect[];
  venues: VenueRecord[];
  signals: Signal[];
  outreach: OutreachRecord[];
  brain: KitchenBrain;
  /** Scoring inputs kept alongside each prospect so attachSource can re-score. */
  scoreInputs: Record<string, ProspectScoreInput>;
}

const g = globalThis as unknown as { __rkLeadDb?: LeadDb };

function freshLeadDb(): LeadDb {
  // Order matters: prospectSeed() populates the seed's score-input map as it
  // builds, so prospectScoreInputs() has to be read after it, not before.
  const prospects = prospectSeed();
  return {
    sweeps: sweepSeed(),
    prospects,
    venues: venueSeed(),
    signals: signalSeed(),
    outreach: outreachSeed(),
    brain: brainSeed(),
    scoreInputs: prospectScoreInputs(),
  };
}

function ldb(): LeadDb {
  if (!g.__rkLeadDb) g.__rkLeadDb = freshLeadDb();
  return g.__rkLeadDb;
}

/** Called by store.ts's resetDemoData so one reset restores both halves. */
export function resetLeadDemoData(): void {
  g.__rkLeadDb = freshLeadDb();
}

/* ────────────────────────────────────────────────────────────── helpers ───── */

function nowIso(): string {
  return new Date().toISOString();
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function nextId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

function nextRef(): string {
  const n = ldb().prospects.length + 1;
  return `P-${String(n).padStart(4, "0")}`;
}

function note(p: Prospect, actor: string, body: string): void {
  p.notes.unshift({ iso: nowIso(), actor, body });
}

/**
 * Statuses that mean a prospect is finished, either way. Kept as one list so
 * the overdue count and the board can never disagree about what "closed" means.
 */
const CLOSED_STATUSES: ProspectStatus[] = ["won", "lost", "declined"];

export function isClosed(status: ProspectStatus): boolean {
  return CLOSED_STATUSES.includes(status);
}

/**
 * Statuses that mean an outreach message actually reached the recipient. Same
 * reasoning as store.ts's equivalent: one list, so every view agrees on "sent".
 */
const REACHED_RECIPIENT: OutreachStatus[] = ["sent", "replied", "no-response", "closed"];

/* ──────────────────────────────────────────────────────────────── reads ───── */

export function getSweeps(): Sweep[] {
  return ldb().sweeps;
}

export function latestSweep(): Sweep | undefined {
  return ldb().sweeps.reduce<Sweep | undefined>(
    (best, s) => (!best || s.run > best.run ? s : best),
    undefined,
  );
}

export function getProspects(): Prospect[] {
  return ldb().prospects;
}

export function getProspect(id: string): Prospect | undefined {
  return ldb().prospects.find((p) => p.id === id);
}

export function getVenues(): VenueRecord[] {
  return ldb().venues;
}

export function getVenue(id: string): VenueRecord | undefined {
  return ldb().venues.find((v) => v.id === id);
}

export function getSignals(triage?: SignalTriage): Signal[] {
  const all = ldb().signals;
  return triage ? all.filter((s) => s.triage === triage) : all;
}

export function getOutreach(prospectId?: string): OutreachRecord[] {
  const all = ldb().outreach;
  return prospectId ? all.filter((o) => o.prospectId === prospectId) : all;
}

export function getBrain(): KitchenBrain {
  return ldb().brain;
}

/* ────────────────────────────────────────────────────────── prospect I/O ───── */

export interface NewProspectInput {
  name: string;
  category: Prospect["category"];
  city: string;
  state: string;
  phone?: string | null;
  website?: string | null;
  contactName?: string | null;
  contactRole?: string | null;
  whyItFits: string;
  pitch: string;
  openingQuestion: string;
  caution?: string | null;
  suggestedAction: string;
  targetDates?: string[];
  scoreInput: ProspectScoreInput;
  sources?: SourceLink[];
  owner?: Prospect["owner"];
  sourcedBy?: Prospect["sourcedBy"];
}

export function addProspect(input: NewProspectInput, actor: string): Prospect {
  const d = ldb();
  const sources = input.sources ?? [];
  // sourceCount is authoritative from the sources actually attached, not from
  // whatever the caller claimed — otherwise the hard cap is trivially bypassed.
  const scoreInput: ProspectScoreInput = { ...input.scoreInput, sourceCount: sources.length };
  const { score, priority } = scoreProspect(scoreInput, d.brain.travelRadiusMiles);
  const id = nextId("p");

  const p: Prospect = {
    id,
    orgId: ORG_ID,
    ref: nextRef(),
    name: input.name,
    category: input.category,
    city: input.city,
    state: input.state,
    phone: input.phone ?? null,
    website: input.website ?? null,
    contactName: input.contactName ?? null,
    contactRole: input.contactRole ?? null,
    score,
    priority,
    whyItFits: input.whyItFits,
    pitch: input.pitch,
    openingQuestion: input.openingQuestion,
    caution: input.caution ?? null,
    suggestedAction: input.suggestedAction,
    // A hand-added or promoted prospect gets the scaffold, not written copy —
    // a confident script for a business nobody has checked is the one thing
    // this engine must never produce.
    approaches: blankApproaches(),
    targetDates: input.targetDates ?? [],
    estValue: null,
    status: "new",
    nextActionBy: null,
    owner: input.owner ?? "agent",
    sourcedBy: input.sourcedBy ?? "agent",
    // Written once, here. Never rewritten — this is the commission record.
    sourcedISO: today(),
    addedISO: today(),
    sweepRun: latestSweep()?.run ?? 1,
    sources,
    notes: [],
  };
  note(p, actor, "Added by hand.");
  d.prospects.unshift(p);
  d.scoreInputs[id] = scoreInput;
  return p;
}

export function setProspectStatus(
  id: string,
  status: ProspectStatus,
  actor: string,
): Prospect | undefined {
  const p = getProspect(id);
  if (!p) return undefined;
  const from = p.status;
  p.status = status;
  // A closed prospect must never appear in the overdue count — otherwise the
  // Monday briefing leads with work that no longer exists.
  if (isClosed(status)) p.nextActionBy = null;
  note(p, actor, `Status ${from} → ${status}.`);
  return p;
}

export function setProspectNextAction(
  id: string,
  iso: string | null,
  actor: string,
): Prospect | undefined {
  const p = getProspect(id);
  if (!p) return undefined;
  p.nextActionBy = iso;
  note(p, actor, iso ? `Next action by ${iso}.` : "Next-action date cleared.");
  return p;
}

export function assignProspect(
  id: string,
  owner: Prospect["owner"],
  actor: string,
): Prospect | undefined {
  const p = getProspect(id);
  if (!p) return undefined;
  const from = p.owner;
  p.owner = owner;
  note(p, actor, `Reassigned ${from} → ${owner}.`);
  return p;
}

export function addProspectNote(id: string, body: string, actor: string): Prospect | undefined {
  const p = getProspect(id);
  if (!p) return undefined;
  note(p, actor, body);
  return p;
}

/**
 * Attaching a source RE-SCORES the prospect, because sourceCount feeds the hard
 * cap. A prospect held at WARM for having no citation must lift the moment one
 * is attached — that is the behaviour that makes the cap a prompt rather than a
 * punishment.
 */
export function attachSource(
  id: string,
  source: SourceLink,
  actor: string,
): Prospect | undefined {
  const d = ldb();
  const p = getProspect(id);
  if (!p) return undefined;
  p.sources.push(source);

  const prev = d.scoreInputs[p.id];
  const scoreInput: ProspectScoreInput = {
    ...(prev ?? {
      dateFit: "unknown",
      freshness: "this-month",
      access: "department",
      spendEvidence: "weak-proxy",
      distanceMiles: null,
      repeatability: "one-off",
      incumbency: "open-lane",
      brandFit: "neutral",
      effort: "medium",
      sourceCount: 0,
    }),
    sourceCount: p.sources.length,
  };
  const { score, priority } = scoreProspect(scoreInput, d.brain.travelRadiusMiles);
  const fromPriority = p.priority;
  p.score = score;
  p.priority = priority;
  d.scoreInputs[p.id] = scoreInput;

  note(
    p,
    actor,
    fromPriority === priority
      ? `Source attached: ${source.label}.`
      : `Source attached: ${source.label}. Priority ${fromPriority} → ${priority}.`,
  );
  return p;
}

/**
 * Removes the prospect and its outreach.
 *
 * NOTE FOR PRODUCTION: this is a hard delete, which is wrong for a record that
 * may carry commission attribution. In Supabase this becomes a soft delete with
 * a deleted_at column and an audit row, so a disputed attribution can still be
 * reconstructed. Same note as deleteLead in store.ts.
 */
export function deleteProspect(id: string, actor: string): { ok: boolean; name?: string } {
  const d = ldb();
  const i = d.prospects.findIndex((p) => p.id === id);
  if (i === -1) return { ok: false };
  const [removed] = d.prospects.splice(i, 1);
  d.outreach = d.outreach.filter((o) => o.prospectId !== id);
  delete d.scoreInputs[id];
  // Any signal that produced this prospect goes back to being un-promoted,
  // so it does not point at a record that no longer exists.
  for (const s of d.signals) {
    if (s.promotedToProspectId === id) {
      s.promotedToProspectId = null;
      s.triage = "new";
    }
  }
  void actor;
  return { ok: true, name: removed.name };
}

/* ──────────────────────────────────────────────────────────── signal I/O ───── */

export function promoteSignal(signalId: string, actor: string): Prospect | undefined {
  const d = ldb();
  const s = d.signals.find((x) => x.id === signalId);
  if (!s || s.triage === "promoted") return undefined;

  const sourcedBy: Prospect["sourcedBy"] =
    actor === "agent" ? "agent" : actor === "assistant" ? "assistant" : "chef";

  const p = addProspect(
    {
      name: s.title,
      category: "corporate",
      city: "",
      state: "",
      website: s.url,
      whyItFits:
        "Promoted from a feed signal and not yet researched. Fill in why this fits before calling — a promoted signal is a candidate, not a lead.",
      pitch: "Not yet written.",
      openingQuestion: "Not yet written. Do not call until it is.",
      suggestedAction:
        "Research first: find the organisation, a named contact, and what the event actually is. Then rewrite this record's pitch, opening question and cautions, and attach the organisation's own page as a second source.",
      scoreInput: {
        dateFit: "unknown",
        freshness: "this-month",
        access: "switchboard",
        spendEvidence: "none",
        distanceMiles: null,
        repeatability: "one-off",
        incumbency: "open-lane",
        brandFit: "neutral",
        effort: "medium",
        sourceCount: 0,
      },
      sources: [
        {
          label: `${s.source} — ${s.title}`,
          url: s.url,
          kind: "news",
          retrievedISO: s.publishedISO,
          note: `Establishes that ${s.source} published this item on ${s.publishedISO}, and that it matched the rules ${s.matchedRules.join(", ")}. It does NOT establish that the organisation needs catering, who decides, or what they would spend — all three are the object of the research this prospect still needs.`,
        },
      ],
      sourcedBy,
    },
    actor,
  );

  s.triage = "promoted";
  s.promotedToProspectId = p.id;
  return p;
}

export function dismissSignal(
  signalId: string,
  reason: string,
  actor: string,
): Signal | undefined {
  const s = ldb().signals.find((x) => x.id === signalId);
  if (!s) return undefined;
  if (!reason.trim()) return undefined;
  s.triage = "dismissed";
  s.dismissReason = reason.trim();
  void actor;
  return s;
}

/* ───────────────────────────────────────────────────────────── venue I/O ───── */

export function setVenueStatus(
  venueId: string,
  status: VenueOurStatus,
  actor: string,
): VenueRecord | undefined {
  const v = getVenue(venueId);
  if (!v) return undefined;
  v.ourStatus = status;
  // Stamped server-side from the server clock, never from a client-supplied
  // date — an application date is evidence and should not be settable.
  v.appliedISO = status === "applied" ? today() : status === "on-list" ? v.appliedISO : null;
  void actor;
  return v;
}

export function recordVenueDiff(
  venueId: string,
  added: string[],
  removed: string[],
  iso: string = today(),
): VenueRecord | undefined {
  const v = getVenue(venueId);
  if (!v) return undefined;
  // Appends. Never replaces — the history is the point.
  v.diffs.unshift({ iso, added, removed });
  for (const name of added) {
    if (!v.caterersNamed.includes(name)) v.caterersNamed.push(name);
  }
  v.caterersNamed = v.caterersNamed.filter((n) => !removed.includes(n));
  return v;
}

/* ─────────────────────────────────────────────────────────── outreach I/O ───── */

export interface NewOutreachInput {
  prospectId: string;
  channel: OutreachRecord["channel"];
  subject: string;
  body: string;
}

export function addOutreach(input: NewOutreachInput, actor: string): OutreachRecord {
  const rec: OutreachRecord = {
    id: nextId("out"),
    orgId: ORG_ID,
    prospectId: input.prospectId,
    channel: input.channel,
    subject: input.subject,
    body: input.body,
    status: "draft",
    draftedISO: today(),
    sentISO: null,
    responseISO: null,
    sentBy: null,
  };
  ldb().outreach.unshift(rec);
  const p = getProspect(input.prospectId);
  if (p) note(p, actor, `Outreach drafted: ${input.subject}`);
  return rec;
}

export function setOutreachStatus(
  id: string,
  status: OutreachStatus,
  actor: StaffRole | "agent",
): OutreachRecord | undefined {
  const rec = ldb().outreach.find((o) => o.id === id);
  if (!rec) return undefined;
  const from = rec.status;
  rec.status = status;
  // Timestamps are stamped here, from the server clock.
  if (status === "sent" && !rec.sentISO) {
    rec.sentISO = today();
    rec.sentBy = actor;
  }
  if (status === "replied" && !rec.responseISO) rec.responseISO = today();

  const p = getProspect(rec.prospectId);
  if (p) note(p, String(actor), `Outreach ${from} → ${status}: ${rec.subject}`);
  return rec;
}

/* ───────────────────────────────────────────────────────────── brain I/O ───── */

/** Which Brain fields count as a credential, for the confirm-together rule. */
const CREDENTIAL_FIELDS = [
  "liabilityInsuranceLimit",
  "insuranceCarrier",
  "servSafeHolder",
  "servSafeExpiryISO",
  "swamCertified",
  "evaRegistered",
] as const;

export class BrainConfirmError extends Error {}

/**
 * The Brain is the one place where an unconfirmed fact becomes a confirmed one,
 * and every generated document reads from it. So confirming a credential has to
 * be deliberate: the matching confirmWithClient entry must be cleared in the
 * same write. Otherwise the amber chip disappears from the UI while the open
 * item quietly stays on the list, and nobody can tell which is true.
 */
export function updateBrain(patch: Partial<KitchenBrain>, actor: string): KitchenBrain {
  const d = ldb();
  const confirming = CREDENTIAL_FIELDS.filter((f) => {
    const before = d.brain[f];
    const after = patch[f];
    return after !== undefined && after !== null && (before === null || before === undefined);
  });

  if (confirming.length > 0) {
    const nextList = patch.confirmWithClient;
    if (!nextList || nextList.length >= d.brain.confirmWithClient.length) {
      throw new BrainConfirmError(
        `Confirming ${confirming.join(", ")} must also remove the matching entry from the CONFIRM WITH CLIENT list in the same save. Otherwise the amber chip clears while the open item stays on the list, and the two disagree.`,
      );
    }
  }

  d.brain = { ...d.brain, ...patch };
  void actor;
  return d.brain;
}

/* ───────────────────────────────────────────────── derived intelligence ───── */

export function prospectCounts(): Record<ProspectPriority, number> {
  const out: Record<ProspectPriority, number> = { HOT: 0, WARM: 0, WATCH: 0, DECLINE: 0 };
  for (const p of getProspects()) out[p.priority] += 1;
  return out;
}

export function overdueProspects(todayISO: string = today()): Prospect[] {
  return getProspects()
    .filter((p) => !isClosed(p.status) && p.nextActionBy !== null && p.nextActionBy < todayISO)
    .sort((a, b) => (a.nextActionBy! < b.nextActionBy! ? -1 : 1));
}

export interface OutreachStats {
  drafted: number;
  approved: number;
  sent: number;
  replied: number;
  /** Written but not yet out of the door — the number the briefing leads with. */
  waiting: number;
  /** Age in days of the oldest unsent draft, or null when nothing is waiting. */
  oldestWaitingDays: number | null;
}

export function outreachStats(todayISO: string = today()): OutreachStats {
  const all = getOutreach();
  const waiting = all.filter((o) => o.status === "draft" || o.status === "approved");
  const ages = waiting.map((o) => daysBetweenIso(o.draftedISO, todayISO));
  return {
    // A funnel total: everything was drafted at some point, including what has
    // since been sent. Not a count of what is still sitting in draft.
    drafted: all.length,
    approved: all.filter((o) => o.status === "approved").length,
    sent: all.filter((o) => REACHED_RECIPIENT.includes(o.status)).length,
    replied: all.filter((o) => o.status === "replied").length,
    waiting: waiting.length,
    oldestWaitingDays: ages.length ? Math.max(...ages) : null,
  };
}

function daysBetweenIso(a: string, b: string): number {
  const ms = Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`);
  return Math.round(ms / 86_400_000);
}

export function venueFunnel(): Record<VenueOurStatus, number> {
  const out: Record<VenueOurStatus, number> = {
    "not-applied": 0,
    applied: 0,
    "on-list": 0,
    declined: 0,
  };
  for (const v of getVenues()) out[v.ourStatus] += 1;
  return out;
}

/** Venue applications sent and not answered past `days`. */
export function staleVenueApplications(days = 21, todayISO: string = today()): VenueRecord[] {
  return getVenues().filter(
    (v) => v.ourStatus === "applied" && v.appliedISO !== null && daysBetweenIso(v.appliedISO, todayISO) > days,
  );
}

/**
 * Prime dates inside the horizon with nothing booked.
 *
 * This is the perishable-inventory signal: an unbooked prime Saturday is the
 * only thing on the board that expires worthless whether or not anyone acts.
 */
export function openPrimeDates(horizonDays = 45, todayISO: string = today()): string[] {
  const weeks = Math.ceil(horizonDays / 7) + 1;
  return calendarOutlook(weeks)
    .filter(
      (d) =>
        d.isWeekendPrime &&
        d.booked === null &&
        d.date >= todayISO &&
        daysBetweenIso(todayISO, d.date) <= horizonDays,
    )
    .map((d) => d.date);
}

export type BriefingKind =
  | "overdue"
  | "unsent-outreach"
  | "open-dates"
  | "stale-applications"
  | "new-prospects";

export interface BriefingHeadline {
  kind: BriefingKind;
  title: string;
  detail: string;
}

/**
 * Picks the headline by what is actually wrong, in a fixed order.
 *
 * If something is overdue, that IS the headline — the briefing never leads with
 * new finds while existing work is sitting. An engine that flatters itself by
 * reporting fresh discoveries over an untouched backlog gets switched off in
 * month three, because the chef works out that the number going up is not the
 * same as the business getting better.
 */
export function briefingHeadline(todayISO: string = today()): BriefingHeadline {
  const overdue = overdueProspects(todayISO);
  if (overdue.length > 0) {
    const oldest = overdue[0];
    const days = daysBetweenIso(oldest.nextActionBy!, todayISO);
    return {
      kind: "overdue",
      title: `${overdue.length} ${overdue.length === 1 ? "prospect is" : "prospects are"} past their own action-by date`,
      detail: `The oldest is ${oldest.name}, ${days} ${days === 1 ? "day" : "days"} overdue. None of this needs research or another sweep — it needs a morning on the phone. Everything else on this page can wait until it is clear.`,
    };
  }

  const stats = outreachStats(todayISO);
  if (stats.waiting > 0) {
    const d = stats.oldestWaitingDays ?? 0;
    return {
      kind: "unsent-outreach",
      title: `${stats.waiting} ${stats.waiting === 1 ? "message is" : "messages are"} written and unsent`,
      detail: `The oldest has been waiting ${d} ${d === 1 ? "day" : "days"}. Writing another would make the engine look productive and the business no better off. Read them, approve them, send them.`,
    };
  }

  const open = openPrimeDates(45, todayISO);
  if (open.length > 0) {
    return {
      kind: "open-dates",
      title: `${open.length} prime ${open.length === 1 ? "date is" : "dates are"} open in the next six weeks`,
      detail: `An unbooked Friday or Saturday is the one thing here that expires worthless whether or not anyone acts. The first is ${open[0]}. Everything on the prospect board should be measured against filling them.`,
    };
  }

  const stale = staleVenueApplications(21, todayISO);
  if (stale.length > 0) {
    return {
      kind: "stale-applications",
      title: `${stale.length} venue ${stale.length === 1 ? "application has" : "applications have"} gone unanswered`,
      detail: `${stale.map((v) => v.name).join(", ")} — sent more than three weeks ago with no reply. A venue list is the highest-value placement in the engine, so these are worth a follow-up call rather than a second email.`,
    };
  }

  const run = latestSweep()?.run ?? 0;
  const fresh = getProspects().filter((p) => p.sweepRun === run);
  return {
    kind: "new-prospects",
    title:
      fresh.length > 0
        ? `${fresh.length} new ${fresh.length === 1 ? "prospect" : "prospects"} from the latest sweep`
        : "Nothing is overdue and nothing is waiting",
    detail:
      fresh.length > 0
        ? "Nothing is overdue, nothing is sitting unsent, and no prime date is going begging — so this week's finds are the top of the page. That is the only circumstance in which they should be."
        : "No overdue actions, no unsent drafts, no open prime dates inside six weeks and no stale venue applications. Run the sweep to bring in new candidates.",
  };
}

/** Open corrections across every sweep, oldest run first. */
export function openCorrections(): { run: number; label: string; subject: string; what: string }[] {
  const out: { run: number; label: string; subject: string; what: string }[] = [];
  for (const s of [...getSweeps()].sort((a, b) => a.run - b.run)) {
    for (const c of s.corrections) {
      if (c.resolvedISO === null) {
        out.push({ run: s.run, label: s.label, subject: c.subject, what: c.what });
      }
    }
  }
  return out;
}
