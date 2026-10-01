/**
 * DATA ACCESS LAYER
 *
 * Every portal page and route handler reads and writes through this module and
 * nothing else. That is the whole point: the demo runs on a seeded in-memory
 * store today, and moving to Supabase means reimplementing the functions in
 * this one file against Postgres. No page, component or form changes.
 *
 * ── Honest limitation of demo mode ──────────────────────────────────────────
 * The store lives in module memory on the server. It survives navigation and
 * every mutation inside a running server, which is what a live demo needs. It
 * does NOT survive a server restart, and on a serverless host each cold start
 * begins again from the seed. Two consequences, both fine for a demo and both
 * unacceptable in production:
 *   • Changes the chef makes while you present will persist for that session
 *     and then reset.
 *   • Two people browsing simultaneously may land on different instances.
 * Real persistence, real concurrency safety and realtime sync all arrive with
 * Supabase. See PORTAL.md → "Going live".
 */

import { ORG_ID } from "./types";
import type {
  Campaign,
  CampaignChannel,
  Lead,
  MenuDraft,
  Message,
  QueueItem,
  Stage,
  StaffRole,
  StaffUser,
  Subscriber,
  TimelineEntry,
} from "./types";
import {
  buildCampaigns,
  buildLeads,
  buildMenus,
  buildMessages,
  buildSubscribers,
  staffUsers,
} from "./seed";
import { daysBetween, scoreLead } from "./scoring";

/* ──────────────────────────────────────────────────────────── the store ───── */

interface Db {
  staff: StaffUser[];
  leads: Lead[];
  menus: MenuDraft[];
  messages: Message[];
  subscribers: Subscriber[];
  campaigns: Campaign[];
  queue: QueueItem[];
  /** Owner-controlled setting: may the assistant see revenue figures? */
  assistantSeesFinancials: boolean;
}

// Module-level singleton, guarded so Next's dev-mode hot reload does not wipe it
// between compilations.
const g = globalThis as unknown as { __rkPortalDb?: Db };

function freshDb(): Db {
  const db: Db = {
    staff: staffUsers,
    leads: buildLeads(),
    menus: buildMenus(),
    messages: buildMessages(),
    subscribers: buildSubscribers(),
    campaigns: buildCampaigns(),
    queue: [],
    assistantSeesFinancials: false,
  };
  db.queue = composeWeeklyQueue(db, mondayOf(new Date()));
  return db;
}

function db(): Db {
  if (!g.__rkPortalDb) g.__rkPortalDb = freshDb();
  return g.__rkPortalDb;
}

/**
 * Resets to the seed. Wired to a control in the portal so a demo can be reset.
 *
 * Resets BOTH halves: the inbound store here, and the outbound lead engine in
 * lead-store.ts. The import is dynamic because lead-store.ts imports
 * calendarOutlook from this module, and a static import both ways would be a
 * cycle. One reset, one control, no half-reset state.
 */
export function resetDemoData(): void {
  g.__rkPortalDb = freshDb();
  void import("./lead-store").then((m) => m.resetLeadDemoData());
}

/* ────────────────────────────────────────────────────────────── helpers ───── */

function nowIso(): string {
  return new Date().toISOString();
}

function nextId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

/** The Monday of the week containing `d`, as an ISO date string. */
export function mondayOf(d: Date): string {
  const copy = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const dow = copy.getUTCDay(); // 0 Sun … 6 Sat
  const delta = dow === 0 ? -6 : 1 - dow;
  copy.setUTCDate(copy.getUTCDate() + delta);
  return copy.toISOString().slice(0, 10);
}

function appendTimeline(lead: Lead, entry: Omit<TimelineEntry, "id">): void {
  lead.timeline.push({ ...entry, id: nextId("t") });
}

/* ──────────────────────────────────────────────────────────── staff I/O ───── */

export function getStaff(): StaffUser[] {
  return db().staff;
}

export function findStaffByEmail(email: string): StaffUser | undefined {
  const needle = email.trim().toLowerCase();
  return db().staff.find((u) => u.email.toLowerCase() === needle);
}

export function findStaffById(id: string): StaffUser | undefined {
  return db().staff.find((u) => u.id === id);
}

export function assistantSeesFinancials(): boolean {
  return db().assistantSeesFinancials;
}

export function setAssistantSeesFinancials(value: boolean): void {
  db().assistantSeesFinancials = value;
}

/**
 * Whether a role may see money. The owner always can. The assistant can only
 * when the owner has turned it on — an intentional default, because an events
 * assistant needs to run the calendar, not read the P&L.
 */
export function canSeeFinancials(role: StaffRole): boolean {
  return role === "owner" || db().assistantSeesFinancials;
}

/* ──────────────────────────────────────────────────────────── leads I/O ───── */

export function getLeads(): Lead[] {
  return db().leads;
}

export function getLead(id: string): Lead | undefined {
  return db().leads.find((l) => l.id === id);
}

export function getLeadByClientToken(token: string): Lead | undefined {
  return db().leads.find((l) => l.clientToken === token);
}

export interface NewLeadInput {
  name: string;
  email: string;
  phone: string;
  eventType: Lead["eventType"];
  eventDate: string | null;
  dateFlexible: boolean;
  guestCount: number;
  venueType: Lead["venueType"];
  venueCity: string;
  budgetBand: Lead["budgetBand"];
  decisionMaker: Lead["decisionMaker"];
  source: Lead["source"];
  occasionNotes: string;
  dietaryNotes: string;
  depositOk: boolean;
  callOk: boolean;
  workedWithChefBefore: boolean;
}

/** Creates, scores and routes a new enquiry. Called by the public intake API. */
export function createLead(input: NewLeadInput): Lead {
  const store = db();
  const now = new Date();
  const score = scoreLead(input, now);

  // Reference numbers continue the seeded series so the demo reads coherently.
  const highest = store.leads.reduce((max, l) => {
    const n = Number(l.ref.replace(/\D/g, ""));
    return Number.isFinite(n) && n > max ? n : max;
  }, 2600);

  const lead: Lead = {
    id: nextId("l"),
    orgId: ORG_ID,
    ref: `RK-${highest + 1}`,
    createdAt: now.toISOString(),
    ...input,
    score,
    scoreOverride: null,
    // Band D closes immediately with an automated reply — that is the whole
    // point of the filter. Everything else enters the pipeline.
    stage: score.band === "D" ? "lost" : "new",
    assignedTo: score.band === "A" ? "u_owner" : score.band === "B" ? "u_assistant" : null,
    tags: score.band === "D" ? ["auto-declined"] : [],
    quotedValue: null,
    bookedValue: null,
    lostReason:
      score.band === "D" ? "Below the qualification threshold — auto-declined by the engine" : null,
    timeline: [],
    menuId: null,
    clientToken: null,
    event: null,
    firstRepliedAt: null,
  };

  appendTimeline(lead, {
    at: lead.createdAt,
    actor: lead.name,
    kind: "created",
    summary: "Enquiry submitted",
    detail: `Via the website intake form — reference ${lead.ref}.`,
  });
  appendTimeline(lead, {
    at: lead.createdAt,
    actor: "system",
    kind: "scored",
    summary: `Qualified ${score.total}/100 — band ${score.band}`,
    detail: score.lines
      .slice()
      .sort((a, b) => b.points - a.points)
      .slice(0, 3)
      .map((l) => `${l.label}: ${l.points}/${l.max}`)
      .join(" · "),
  });

  if (score.band === "C" || score.band === "D") {
    appendTimeline(lead, {
      at: lead.createdAt,
      actor: "system",
      kind: "email",
      summary: score.band === "C" ? "Nurture auto-reply queued" : "Polite decline queued",
      detail:
        score.band === "C"
          ? "Menus, service overview and the seasonal-menu opt-in. No chef time spent."
          : "Gracious no with the newsletter link. Total chef time spent: none.",
    });
    // A declined or nurtured enquiry is still a real person who liked his food.
    upsertSubscriber({
      email: input.email,
      name: input.name,
      source: "declined-lead",
      segments: ["seasonal-menu"],
    });
  }

  store.leads.unshift(lead);
  return lead;
}

/**
 * Adds an enquiry by hand — a phone call, a referral passed on in person, a
 * conversation at another event. Scored by the same engine as a web enquiry, so
 * a lead that arrived by phone sits in the same pipeline on the same terms.
 *
 * The one difference from `createLead`: nothing here is auto-declined. If a
 * member of staff has bothered to type it in, a human has already decided it is
 * worth having, and the engine's job is to advise on how much attention it
 * earns — not to bin something the chef just took a call about.
 */
export function addLeadByHand(input: NewLeadInput, actor: string): Lead {
  const lead = createLead(input);
  if (lead.stage === "lost" && lead.lostReason?.includes("auto-declined")) {
    lead.stage = "new";
    lead.lostReason = null;
    lead.tags = lead.tags.filter((t) => t !== "auto-declined");
    appendTimeline(lead, {
      at: nowIso(),
      actor,
      kind: "note",
      summary: "Added by hand, so the automatic decline was not applied",
      detail:
        "The engine scored this below the threshold. Because a person entered it deliberately it stays in the pipeline for a human to decide.",
    });
  }
  appendTimeline(lead, {
    at: nowIso(),
    actor,
    kind: "created",
    summary: `Added by ${actor}`,
    detail: "Entered directly in the portal rather than through the website form.",
  });
  return lead;
}

/**
 * Removes an enquiry and everything attached to it.
 *
 * This is a real delete, because "remove" should mean removed — a row that
 * lingers invisibly is worse than one that is gone. It takes the menu, the
 * messages and the whole timeline with it, so nothing is orphaned.
 *
 * PRODUCTION NOTE: this should become a soft delete. A booking record is a
 * financial and contractual document, and a business wants to know that an
 * event existed even after it was cancelled. Mark `deletedAt`, filter it out of
 * every read, and keep an audit row naming who removed it. In demo mode, where
 * the whole point is being able to tidy up between showings, a hard delete is
 * the honest behaviour.
 */
export function deleteLead(leadId: string): { ok: boolean; name?: string } {
  const store = db();
  const lead = store.leads.find((l) => l.id === leadId);
  if (!lead) return { ok: false };

  store.leads = store.leads.filter((l) => l.id !== leadId);
  store.menus = store.menus.filter((m) => m.leadId !== leadId);
  store.messages = store.messages.filter((m) => m.leadId !== leadId);
  return { ok: true, name: lead.name };
}

export function setStage(leadId: string, stage: Stage, actor: string, note?: string): Lead | undefined {
  const lead = getLead(leadId);
  if (!lead) return undefined;
  const from = lead.stage;
  lead.stage = stage;
  appendTimeline(lead, {
    at: nowIso(),
    actor,
    kind: "stage",
    summary: `Moved from ${from} to ${stage}`,
    detail: note,
  });
  return lead;
}

export function assignLead(leadId: string, userId: string | null, actor: string): Lead | undefined {
  const lead = getLead(leadId);
  if (!lead) return undefined;
  lead.assignedTo = userId;
  const who = userId ? (findStaffById(userId)?.name ?? userId) : "nobody";
  appendTimeline(lead, { at: nowIso(), actor, kind: "note", summary: `Assigned to ${who}` });
  return lead;
}

export function overrideBand(
  leadId: string,
  band: Lead["score"]["band"],
  by: string,
  reason: string,
): Lead | undefined {
  const lead = getLead(leadId);
  if (!lead) return undefined;
  lead.scoreOverride = { band, by, at: nowIso(), reason };
  appendTimeline(lead, {
    at: nowIso(),
    actor: by,
    kind: "override",
    summary: `Band overridden to ${band}`,
    detail: reason,
  });
  return lead;
}

export function addNote(leadId: string, actor: string, body: string): Lead | undefined {
  const lead = getLead(leadId);
  if (!lead) return undefined;
  appendTimeline(lead, { at: nowIso(), actor, kind: "note", summary: body });
  return lead;
}

/** The band actually in force — the override when present, else the computed one. */
export function effectiveBand(lead: Lead): Lead["score"]["band"] {
  return lead.scoreOverride?.band ?? lead.score.band;
}

/* ───────────────────────────────────────────────────────── messages I/O ───── */

export function getMessages(leadId: string): Message[] {
  return db()
    .messages.filter((m) => m.leadId === leadId)
    .sort((a, b) => a.at.localeCompare(b.at));
}

export function unreadForStaff(): Message[] {
  return db().messages.filter((m) => m.authorType === "client" && !m.readByStaff);
}

export function addMessage(
  leadId: string,
  authorType: "staff" | "client",
  authorName: string,
  authorRole: StaffRole | null,
  body: string,
): Message {
  const msg: Message = {
    id: nextId("msg"),
    orgId: ORG_ID,
    leadId,
    at: nowIso(),
    authorType,
    authorName,
    authorRole,
    body,
    readByStaff: authorType === "staff",
    readByClient: authorType === "client",
  };
  db().messages.push(msg);

  const lead = getLead(leadId);
  if (lead) {
    appendTimeline(lead, {
      at: msg.at,
      actor: authorName,
      kind: "message",
      summary: authorType === "staff" ? "Replied to the client" : "Client sent a message",
      detail: body.length > 140 ? `${body.slice(0, 137)}…` : body,
    });
    if (authorType === "staff" && !lead.firstRepliedAt) lead.firstRepliedAt = msg.at;
  }
  return msg;
}

export function markThreadRead(leadId: string, side: "staff" | "client"): void {
  for (const m of db().messages) {
    if (m.leadId !== leadId) continue;
    if (side === "staff" && m.authorType === "client") m.readByStaff = true;
    if (side === "client" && m.authorType === "staff") m.readByClient = true;
  }
}

/* ───────────────────────────────────────────────────────────── menu I/O ───── */

export function getMenu(id: string): MenuDraft | undefined {
  return db().menus.find((m) => m.id === id);
}

export function getMenuForLead(leadId: string): MenuDraft | undefined {
  return db().menus.find((m) => m.leadId === leadId);
}

export function setMenuSelection(menuId: string, courseId: string, slugs: string[]): MenuDraft | undefined {
  const menu = getMenu(menuId);
  if (!menu || menu.status === "locked") return menu;
  const course = menu.courses.find((c) => c.id === courseId);
  if (!course) return menu;
  course.selected = slugs.slice(0, course.picks);
  menu.updatedAt = nowIso();
  return menu;
}

export function toggleMenuAddOn(menuId: string, addOnId: string): MenuDraft | undefined {
  const menu = getMenu(menuId);
  if (!menu || menu.status === "locked") return menu;
  const addOn = menu.addOns.find((a) => a.id === addOnId);
  if (addOn) addOn.selected = !addOn.selected;
  menu.updatedAt = nowIso();
  return menu;
}

export function setMenuStatus(
  menuId: string,
  status: MenuDraft["status"],
  actor: string,
): MenuDraft | undefined {
  const menu = getMenu(menuId);
  if (!menu) return undefined;
  menu.status = status;
  menu.updatedAt = nowIso();
  if (status === "locked") menu.lockedAt = menu.updatedAt;
  if (status === "submitted") menu.version += 1;

  const lead = getLead(menu.leadId);
  if (lead) {
    appendTimeline(lead, {
      at: menu.updatedAt,
      actor,
      kind: "menu",
      summary:
        status === "locked"
          ? `Menu locked at version ${menu.version}`
          : status === "submitted"
            ? `Menu v${menu.version} submitted for review`
            : status === "changes_requested"
              ? "Changes requested on the menu"
              : "Menu returned to draft",
    });
  }
  return menu;
}

export function addMenuComment(
  menuId: string,
  authorType: "staff" | "client",
  authorName: string,
  courseId: string | null,
  body: string,
): MenuDraft | undefined {
  const menu = getMenu(menuId);
  if (!menu) return undefined;
  menu.comments.push({ id: nextId("c"), at: nowIso(), authorType, authorName, courseId, body });
  menu.updatedAt = nowIso();
  return menu;
}

export function addGuestDietary(
  menuId: string,
  label: string,
  restrictions: string[],
  notes: string,
): MenuDraft | undefined {
  const menu = getMenu(menuId);
  if (!menu) return undefined;
  menu.guestDietary.push({ id: nextId("g"), label, restrictions, notes });
  menu.updatedAt = nowIso();
  return menu;
}

export function removeGuestDietary(menuId: string, id: string): MenuDraft | undefined {
  const menu = getMenu(menuId);
  if (!menu) return undefined;
  menu.guestDietary = menu.guestDietary.filter((g) => g.id !== id);
  menu.updatedAt = nowIso();
  return menu;
}

/* ─────────────────────────────────────────────────────── subscribers I/O ─── */

export function getSubscribers(): Subscriber[] {
  return db().subscribers;
}

export function upsertSubscriber(input: {
  email: string;
  name?: string | null;
  source: Subscriber["source"];
  segments: Subscriber["segments"];
}): Subscriber {
  const store = db();
  const needle = input.email.trim().toLowerCase();
  const existing = store.subscribers.find((s) => s.email.toLowerCase() === needle);
  if (existing) {
    for (const seg of input.segments) {
      if (!existing.segments.includes(seg)) existing.segments.push(seg);
    }
    if (!existing.name && input.name) existing.name = input.name;
    return existing;
  }
  const sub: Subscriber = {
    id: nextId("sub"),
    orgId: ORG_ID,
    email: input.email.trim(),
    name: input.name ?? null,
    createdAt: nowIso(),
    source: input.source,
    segments: input.segments,
    status: "active",
    lastSentAt: null,
  };
  store.subscribers.push(sub);
  return sub;
}

export function promoteSubscriberToLead(id: string): Subscriber | undefined {
  const sub = db().subscribers.find((s) => s.id === id);
  if (sub && !sub.segments.includes("corporate")) sub.segments.push("corporate");
  return sub;
}

/* ───────────────────────────────────────────────────────── campaigns I/O ─── */

export function getCampaigns(): Campaign[] {
  return db().campaigns;
}

export function getCampaign(id: string): Campaign | undefined {
  return db().campaigns.find((c) => c.id === id);
}

export function getQueue(weekOf?: string): QueueItem[] {
  const week = weekOf ?? mondayOf(new Date());
  return db()
    .queue.filter((q) => q.weekOf === week)
    .sort((a, b) => a.scheduledFor.localeCompare(b.scheduledFor));
}

export function setQueueStatus(id: string, status: QueueItem["status"]): QueueItem | undefined {
  const item = db().queue.find((q) => q.id === id);
  if (item) item.status = status;
  return item;
}

/** Recomposes this week's queue from the rules. Wired to the Regenerate control. */
export function regenerateQueue(weekOf?: string): QueueItem[] {
  const store = db();
  const week = weekOf ?? mondayOf(new Date());
  store.queue = store.queue.filter((q) => q.weekOf !== week);
  store.queue.push(...composeWeeklyQueue(store, week));
  return getQueue(week);
}

/* ══════════════════════════════════════════════════════════════════════════
   THE WEEKLY CAMPAIGN ENGINE

   The chef asked for a marketing tab that "automatically updates weekly" so he
   can see what is going out and grab what he wants. This is the rule set that
   composes it. Nothing here is a black box — every queued item carries the
   reason it was chosen, and the portal prints that reason under the item.

   The four rules, in priority order:
     1. OPEN DATE PRESSURE. Any Friday or Saturday inside the next 21 days with
        no confirmed event queues the Open Weekend Fill campaign for that date.
        This is the highest-value rule because it converts idle capacity.
     2. SEASONAL WINDOW. A campaign whose activeMonths include this month or
        next queues its next unsent touch.
     3. SEGMENT STATE. Lapsed subscribers past 180 days with no send in 90 days
        queue the win-back. Completed events with no review queue the ask.
     4. ALWAYS-ON FLOOR. If the above produced fewer than three items, the
        wedding campaign fills the gap, because an empty marketing week is worse
        than a quiet one.

   In production this runs as a scheduled job on Monday at 06:00 local. In demo
   mode it runs at cold start and on demand from the Regenerate control.
   ═══════════════════════════════════════════════════════════════════════════ */

function composeWeeklyQueue(store: Db, weekOf: string): QueueItem[] {
  const items: QueueItem[] = [];
  const monday = new Date(`${weekOf}T00:00:00Z`);
  const today = new Date();
  const thisMonth = today.getUTCMonth() + 1;
  const nextMonth = (thisMonth % 12) + 1;

  const slot = (dayOffset: number, hour: number): string => {
    const d = new Date(monday);
    d.setUTCDate(d.getUTCDate() + dayOffset);
    d.setUTCHours(hour, 0, 0, 0);
    return d.toISOString();
  };

  const countSegment = (segments: Campaign["segments"]): number =>
    store.subscribers.filter(
      (s) => s.status === "active" && s.segments.some((seg) => segments.includes(seg)),
    ).length;

  const push = (
    campaign: Campaign,
    channel: CampaignChannel,
    title: string,
    dayOffset: number,
    hour: number,
    rationale: string,
    preview: string,
    body: string,
  ): void => {
    items.push({
      id: `q_${weekOf}_${campaign.id}_${channel}_${dayOffset}`,
      orgId: ORG_ID,
      weekOf,
      campaignId: campaign.id,
      channel,
      title,
      scheduledFor: slot(dayOffset, hour),
      status: "proposed",
      rationale,
      audienceCount: countSegment(campaign.segments),
      preview,
      body,
    });
  };

  const byId = (id: string): Campaign | undefined => store.campaigns.find((c) => c.id === id);

  /* ── Rule 1: open weekend pressure ─────────────────────────────────────── */
  const confirmedDates = new Set(
    store.leads
      .filter((l) => (l.stage === "confirmed" || l.stage === "completed") && l.eventDate)
      .map((l) => l.eventDate as string),
  );
  const openDates: string[] = [];
  for (let i = 1; i <= 21; i++) {
    const d = new Date(today);
    d.setUTCDate(d.getUTCDate() + i);
    const dow = d.getUTCDay();
    if (dow !== 5 && dow !== 6) continue; // Friday, Saturday
    const iso = d.toISOString().slice(0, 10);
    if (!confirmedDates.has(iso)) openDates.push(iso);
  }

  const openWeekend = byId("cmp_open_weekend");
  if (openWeekend && openDates.length > 0) {
    const target = openDates[0];
    const pretty = new Date(`${target}T12:00:00Z`).toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      timeZone: "UTC",
    });
    push(
      openWeekend,
      "email",
      `Open date note — ${pretty}`,
      1,
      10,
      `${pretty} is inside three weeks and still open. ${openDates.length} open Friday/Saturday date${openDates.length === 1 ? "" : "s"} in the window.`,
      `One open table: ${pretty}`,
      `A short, personal note to past clients and the seasonal list in the region — no discount, no urgency theatre. Just: this date is free, here is what I'd cook on it.`,
    );
    if (openDates.length >= 2) {
      push(
        openWeekend,
        "instagram",
        "Story frames — open date",
        2,
        17,
        `More than one open weekend date in the window, so this gets a social push as well as the email.`,
        "Three story frames, swipe-up to the enquiry form",
        `Frame 1: the dish. Frame 2: the date, large, on the bone background. Frame 3: the one-tap enquiry link.`,
      );
    }
  }

  /* ── Rule 2: seasonal windows ──────────────────────────────────────────── */
  for (const campaign of store.campaigns) {
    if (campaign.status === "paused" || campaign.status === "draft") continue;
    if (campaign.activeMonths.length === 0) continue;
    if (!campaign.activeMonths.includes(thisMonth) && !campaign.activeMonths.includes(nextMonth)) {
      continue;
    }
    const inThis = campaign.activeMonths.includes(thisMonth);
    const monthName = new Date(Date.UTC(2000, (inThis ? thisMonth : nextMonth) - 1, 1)).toLocaleDateString(
      "en-US",
      { month: "long", timeZone: "UTC" },
    );

    if (campaign.id === "cmp_corporate_holiday") {
      push(
        campaign,
        "email",
        "Corporate holiday — the pitch",
        2,
        9,
        `${monthName} is inside this campaign's window, and corporate holiday budgets are decided now. Sending early beats sending well here.`,
        "Your team will not remember the hotel ballroom",
        `Opening email of the corporate sequence. Argues for a chef in your own space over a banquet room, and points at the two things a decision maker actually needs: a date and a number.`,
      );
      push(
        campaign,
        "paid-social",
        "Paid social — corporate concept A",
        3,
        12,
        `Paid support for the email while the window is open. Geo: Richmond, NoVA, DC. Job titles: office manager, EA, HR.`,
        "Concept A — the empty conference room",
        `Runs alongside the email so the name is familiar when the follow-up lands.`,
      );
    }

    if (campaign.id === "cmp_menu_drop") {
      push(
        campaign,
        "email",
        `${monthName} menu drop`,
        4,
        10,
        `${monthName} is a season turn, which is this campaign's quarterly trigger. The drop is the list's best-performing email.`,
        `What I'm cooking this season`,
        `Menu first, sell second. The whole list, including nurture leads who never booked — this is the email that brings some of them back.`,
      );
    }

    if (campaign.id === "cmp_wedding_season") {
      push(
        campaign,
        "email",
        "Venue coordinator outreach",
        2,
        14,
        `${monthName} is in the wedding window. Coordinator relationships compound, so this goes out regardless of enquiry volume.`,
        "A chef your couples will thank you for",
        `The highest-leverage email in the programme. One coordinator who trusts him is worth more than a quarter of ad spend.`,
      );
    }
  }

  /* ── Rule 3: segment state ─────────────────────────────────────────────── */
  const lapsed = store.subscribers.filter((s) => {
    if (s.status !== "active") return false;
    if (!s.segments.includes("lapsed")) return false;
    if (!s.lastSentAt) return true;
    return daysBetween(new Date(s.lastSentAt), today) >= 90;
  });
  const winback = byId("cmp_winback");
  if (winback && lapsed.length >= 3) {
    push(
      winback,
      "email",
      "Win-back — what's new",
      3,
      10,
      `${lapsed.length} lapsed guests have had nothing from us in 90 days or more. Small batch, leads with a new dish rather than a guilt trip.`,
      "Something new on the menu",
      `Sent to ${lapsed.length} people only. Cadence rule prevents anyone receiving this twice in a quarter.`,
    );
  }

  const awaitingReview = store.leads.filter(
    (l) =>
      l.stage === "completed" &&
      l.eventDate &&
      daysBetween(new Date(`${l.eventDate}T12:00:00Z`), today) >= 3,
  );
  const referral = byId("cmp_referral");
  if (referral && awaitingReview.length > 0) {
    push(
      referral,
      "email",
      "Review and referral ask",
      1,
      9,
      `${awaitingReview.length} completed event${awaitingReview.length === 1 ? "" : "s"} past the three-day mark with no review recorded. His Google review count is the biggest competitive gap he has.`,
      "One favour, and it takes a minute",
      `One link, one ask, no bundle of requests. Then a single follow-up at thirty days and nothing after that.`,
    );
  }

  /* ── Rule 4: always-on floor ───────────────────────────────────────────── */
  const weddings = byId("cmp_wedding_season");
  if (items.length < 3 && weddings && !items.some((i) => i.campaignId === weddings.id)) {
    push(
      weddings,
      "instagram",
      "Wedding proof post",
      4,
      18,
      `Only ${items.length} item${items.length === 1 ? "" : "s"} met a rule this week. A quiet week still gets one wedding post — an empty marketing week is worse than a slow one.`,
      "A real review, a real plate",
      `Marie R's Zola review paired with the dish it refers to. Proof beats claims.`,
    );
  }

  return items;
}

/* ══════════════════════════════════════════════════════════════════════════
   DERIVED VIEWS — the computed intelligence behind both dashboards
   ═══════════════════════════════════════════════════════════════════════════ */

export type ActionUrgency = "overdue" | "today" | "soon";

export interface ActionItem {
  id: string;
  urgency: ActionUrgency;
  /** Which role should act. */
  owner: StaffRole | "either";
  title: string;
  detail: string;
  href: string;
  /** Sort key — lower is more urgent. */
  weight: number;
}

/**
 * "Needs you today" — the single most valuable widget in the portal.
 * A private chef does not need a wall of charts; he needs to know what will
 * break if he ignores it. Six rules, each mapped to something that actually
 * costs money or goodwill when it slips.
 */
export function actionQueue(): ActionItem[] {
  const store = db();
  const today = new Date();
  const out: ActionItem[] = [];

  // 1. Unanswered client messages. Every hour here costs trust.
  for (const msg of unreadForStaff()) {
    const lead = getLead(msg.leadId);
    if (!lead) continue;
    const hours = Math.floor((today.getTime() - new Date(msg.at).getTime()) / 3_600_000);
    out.push({
      id: `act_msg_${msg.id}`,
      urgency: hours >= 24 ? "overdue" : "today",
      owner: "either",
      title: `${lead.name} is waiting on a reply`,
      detail:
        hours >= 24
          ? `Unanswered for ${hours} hours — ${lead.ref}`
          : `Came in ${hours <= 1 ? "in the last hour" : `${hours} hours ago`} — ${lead.ref}`,
      href: `/portal/leads/${lead.id}`,
      weight: hours >= 24 ? 5 : 30,
    });
  }

  // 2. New A-band leads nobody has replied to. The SLA is four hours.
  for (const lead of store.leads) {
    if (lead.stage !== "new" || lead.firstRepliedAt) continue;
    const band = effectiveBand(lead);
    const hours = Math.floor((today.getTime() - new Date(lead.createdAt).getTime()) / 3_600_000);
    if (band === "A") {
      out.push({
        id: `act_new_${lead.id}`,
        urgency: hours > 4 ? "overdue" : "today",
        owner: "owner",
        title: `Priority enquiry: ${lead.name}`,
        detail: `Scored ${lead.score.total}/100 · ${lead.guestCount} guests · ${hours > 4 ? `${hours}h old, past the 4-hour standard` : `${hours}h old`}`,
        href: `/portal/leads/${lead.id}`,
        weight: hours > 4 ? 1 : 10,
      });
    } else if (band === "B") {
      out.push({
        id: `act_new_${lead.id}`,
        urgency: hours > 24 ? "overdue" : "soon",
        owner: "assistant",
        title: `Screen: ${lead.name}`,
        detail: `Scored ${lead.score.total}/100 · ${hours > 24 ? `${hours}h old, past the 24-hour standard` : `${hours}h old`}`,
        href: `/portal/leads/${lead.id}`,
        weight: hours > 24 ? 8 : 40,
      });
    }
  }

  // 3. Deposits outstanding. Unpaid deposit means the date is not really held.
  for (const lead of store.leads) {
    if (lead.stage !== "deposit") continue;
    const days = lead.eventDate ? daysBetween(today, new Date(`${lead.eventDate}T12:00:00Z`)) : null;
    out.push({
      id: `act_dep_${lead.id}`,
      urgency: days !== null && days <= 21 ? "overdue" : "soon",
      owner: "assistant",
      title: `Deposit outstanding — ${lead.name}`,
      detail:
        days !== null
          ? `Event is ${days} days out and the date is not secured yet — ${lead.ref}`
          : `No event date set — ${lead.ref}`,
      href: `/portal/leads/${lead.id}`,
      weight: days !== null && days <= 21 ? 3 : 45,
    });
  }

  // 4. Menus not locked close to service. Locking late means rushed sourcing.
  for (const menu of store.menus) {
    if (menu.status === "locked") continue;
    const lead = getLead(menu.leadId);
    if (!lead?.eventDate) continue;
    const days = daysBetween(today, new Date(`${lead.eventDate}T12:00:00Z`));
    if (days > 21) continue;
    out.push({
      id: `act_menu_${menu.id}`,
      urgency: days <= 10 ? "overdue" : "soon",
      owner: "owner",
      title: `Menu not locked — ${lead.name}`,
      detail:
        menu.status === "submitted"
          ? `Client submitted v${menu.version} and is waiting on your review · ${days} days to service`
          : `Still a draft · ${days} days to service`,
      href: `/portal/leads/${lead.id}`,
      weight: days <= 10 ? 2 : 35,
    });
  }

  // 5. Tastings promised but not scheduled.
  for (const lead of store.leads) {
    if (lead.stage !== "tasting") continue;
    out.push({
      id: `act_tasting_${lead.id}`,
      urgency: "soon",
      owner: "assistant",
      title: `Schedule the tasting — ${lead.name}`,
      detail: `At tasting stage with no date in the diary — ${lead.ref}`,
      href: `/portal/leads/${lead.id}`,
      weight: 50,
    });
  }

  // 6. Run-sheet items still open inside ten days of service.
  for (const lead of store.leads) {
    if (!lead.event || !lead.eventDate) continue;
    const days = daysBetween(today, new Date(`${lead.eventDate}T12:00:00Z`));
    if (days < 0 || days > 10) continue;
    const open = lead.event.runSheet.filter((r) => !r.done);
    if (open.length === 0) continue;
    out.push({
      id: `act_run_${lead.id}`,
      urgency: days <= 4 ? "overdue" : "today",
      owner: "either",
      title: `${open.length} run-sheet item${open.length === 1 ? "" : "s"} open — ${lead.name}`,
      detail: `${days} days to service · ${open.map((o) => o.label).join(", ")}`,
      href: `/portal/events/${lead.id}`,
      weight: days <= 4 ? 4 : 25,
    });
  }

  return out.sort((a, b) => a.weight - b.weight);
}

export interface UpcomingEvent {
  lead: Lead;
  daysOut: number;
  /** The four things that blow up an event, pre-computed. */
  flags: { label: string; ok: boolean }[];
}

export function upcomingEvents(limit = 5): UpcomingEvent[] {
  const today = new Date();
  return db()
    .leads.filter(
      (l) =>
        l.eventDate &&
        (l.stage === "confirmed" || l.stage === "deposit" || l.stage === "contract") &&
        daysBetween(today, new Date(`${l.eventDate}T12:00:00Z`)) >= 0,
    )
    .sort((a, b) => (a.eventDate as string).localeCompare(b.eventDate as string))
    .slice(0, limit)
    .map((lead) => {
      const menu = getMenuForLead(lead.id);
      const dietary = menu?.guestDietary ?? [];
      return {
        lead,
        daysOut: daysBetween(today, new Date(`${lead.eventDate as string}T12:00:00Z`)),
        flags: [
          { label: "Deposit", ok: Boolean(lead.event?.depositPaid) },
          { label: "Menu locked", ok: menu?.status === "locked" },
          { label: "Headcount", ok: Boolean(lead.event) },
          { label: "Allergies logged", ok: dietary.length > 0 },
        ],
      };
    });
}

export interface CalendarDay {
  date: string;
  isWeekendPrime: boolean;
  booked: Lead | null;
  /** Inside the 21-day window the open-weekend campaign watches. */
  inPressureWindow: boolean;
}

/** Eight weeks of dates, for the open-weekend heat strip. */
export function calendarOutlook(weeks = 8): CalendarDay[] {
  const today = new Date();
  const out: CalendarDay[] = [];
  const booked = new Map<string, Lead>();
  for (const l of db().leads) {
    if (l.eventDate && l.stage !== "lost") booked.set(l.eventDate, l);
  }
  for (let i = 0; i < weeks * 7; i++) {
    const d = new Date(today);
    d.setUTCDate(d.getUTCDate() + i);
    const iso = d.toISOString().slice(0, 10);
    const dow = d.getUTCDay();
    out.push({
      date: iso,
      isWeekendPrime: dow === 5 || dow === 6,
      booked: booked.get(iso) ?? null,
      inPressureWindow: i <= 21,
    });
  }
  return out;
}

export interface FunnelMetrics {
  total: number;
  byBand: Record<"A" | "B" | "C" | "D", number>;
  /** Enquiries that reached a human (bands A and B). */
  reachedHuman: number;
  /** Closed automatically with zero chef time. */
  autoHandled: number;
  booked: number;
  lost: number;
  conversionOfQualified: number;
  /** Median hours from enquiry to first staff reply, or null with no data. */
  medianReplyHours: number | null;
  /** Chef-hours saved by not screening bands C and D, at 20 minutes each. */
  hoursSaved: number;
}

export function funnelMetrics(): FunnelMetrics {
  const leads = db().leads;
  const byBand = { A: 0, B: 0, C: 0, D: 0 };
  for (const l of leads) byBand[effectiveBand(l)] += 1;

  const reachedHuman = byBand.A + byBand.B;
  const autoHandled = byBand.C + byBand.D;
  const booked = leads.filter((l) => l.stage === "confirmed" || l.stage === "completed").length;
  const lost = leads.filter((l) => l.stage === "lost").length;

  const replyHours = leads
    .filter((l) => l.firstRepliedAt)
    .map((l) => (new Date(l.firstRepliedAt as string).getTime() - new Date(l.createdAt).getTime()) / 3_600_000)
    .sort((a, b) => a - b);
  const mid = Math.floor(replyHours.length / 2);
  const medianReplyHours =
    replyHours.length === 0
      ? null
      : replyHours.length % 2 === 1
        ? replyHours[mid]
        : (replyHours[mid - 1] + replyHours[mid]) / 2;

  return {
    total: leads.length,
    byBand,
    reachedHuman,
    autoHandled,
    booked,
    lost,
    conversionOfQualified: reachedHuman === 0 ? 0 : booked / reachedHuman,
    medianReplyHours,
    hoursSaved: Math.round((autoHandled * 20) / 60 * 10) / 10,
  };
}

export interface PipelineValue {
  quoted: number;
  booked: number;
  collected: number;
  /** Bookings whose event date is still ahead. */
  onTheBooks: number;
  averageEventValue: number;
  lostValue: number;
}

export function pipelineValue(): PipelineValue {
  const today = new Date();
  const leads = db().leads;
  const quoted = leads
    .filter((l) => l.quotedValue && !l.bookedValue && l.stage !== "lost")
    .reduce((s, l) => s + (l.quotedValue ?? 0), 0);
  const bookedLeads = leads.filter((l) => l.bookedValue);
  const booked = bookedLeads.reduce((s, l) => s + (l.bookedValue ?? 0), 0);
  const collected = leads.reduce((s, l) => s + (l.event?.depositAmount ?? 0), 0);
  const onTheBooks = leads
    .filter(
      (l) =>
        l.bookedValue &&
        l.eventDate &&
        daysBetween(today, new Date(`${l.eventDate}T12:00:00Z`)) >= 0,
    )
    .reduce((s, l) => s + (l.bookedValue ?? 0), 0);
  const lostValue = leads
    .filter((l) => l.stage === "lost" && l.quotedValue)
    .reduce((s, l) => s + (l.quotedValue ?? 0), 0);

  return {
    quoted,
    booked,
    collected,
    onTheBooks,
    averageEventValue: bookedLeads.length === 0 ? 0 : Math.round(booked / bookedLeads.length),
    lostValue,
  };
}

/** Grouped win/loss reasons, so "we keep losing on price" becomes visible. */
export function lossReasons(): { reason: string; count: number; value: number }[] {
  const map = new Map<string, { count: number; value: number }>();
  for (const l of db().leads) {
    if (l.stage !== "lost" || !l.lostReason) continue;
    const cur = map.get(l.lostReason) ?? { count: 0, value: 0 };
    cur.count += 1;
    cur.value += l.quotedValue ?? 0;
    map.set(l.lostReason, cur);
  }
  return [...map.entries()]
    .map(([reason, v]) => ({ reason, ...v }))
    .sort((a, b) => b.count - a.count);
}
