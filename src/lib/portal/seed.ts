/**
 * DEMO SEED DATA
 *
 * Everything in this file is fictional. Every guest name, phone number, email
 * address, dollar figure and campaign statistic was invented to demonstrate the
 * portal. None of it is a real person or a real result, and the portal shows a
 * standing banner saying so on every screen.
 *
 * Dates are generated RELATIVE TO TODAY at module load, so the demo never goes
 * stale — the "next event" is always genuinely next week, and the overdue
 * deposit is always genuinely overdue. That matters when the chef is looking
 * over your shoulder three months from now.
 *
 * Replace this wholesale when real data arrives; nothing else imports from it
 * except store.ts.
 */

import { ORG_ID } from "./types";
import type {
  Campaign,
  Lead,
  MenuDraft,
  Message,
  StaffUser,
  Subscriber,
  TimelineEntry,
} from "./types";
import { scoreLead } from "./scoring";

/* ───────────────────────────────────────────────────── relative dating ───── */

const NOW = new Date();

/** ISO date (YYYY-MM-DD) `n` days from today. */
function day(n: number): string {
  const d = new Date(NOW);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}
/** Full ISO timestamp `n` days from today, at the given local-ish hour. */
function stamp(n: number, hour = 10, minute = 0): string {
  const d = new Date(NOW);
  d.setUTCDate(d.getUTCDate() + n);
  d.setUTCHours(hour, minute, 0, 0);
  return d.toISOString();
}

/* ─────────────────────────────────────────────────────────────── staff ───── */

/**
 * The assistant's real name and email are not known yet — "Jordan Ellis" is a
 * placeholder and is on the CONFIRM WITH CLIENT list. The chef's own name and
 * email are real and come from src/lib/site.ts.
 */
export const staffUsers: StaffUser[] = [
  {
    id: "u_owner",
    orgId: ORG_ID,
    name: "Chef R. Kearse",
    title: "Chef & Owner",
    email: "chefrkearse@gmail.com",
    role: "owner",
    initials: "RK",
    demoPassword: "chef2026",
  },
  {
    id: "u_assistant",
    orgId: ORG_ID,
    name: "Jordan Ellis",
    title: "Events Assistant",
    email: "assistant@chefrkearse.com",
    role: "assistant",
    initials: "JE",
    demoPassword: "desk2026",
  },
];

/* ──────────────────────────────────────────────────────────────── leads ───── */

type LeadSeed = Omit<Lead, "score" | "timeline" | "orgId"> & {
  /** Extra timeline entries beyond the generated "created" + "scored" pair. */
  extraTimeline?: Omit<TimelineEntry, "id">[];
};

const leadSeeds: LeadSeed[] = [
  /* ── A confirmed wedding, eight days out. The demo's centrepiece. ───────── */
  {
    id: "l_001",
    ref: "RK-2604",
    createdAt: stamp(-52, 9, 12),
    name: "Danielle Brooks",
    email: "danielle.brooks@example.com",
    phone: "(804) 555-0142",
    eventType: "wedding",
    eventDate: day(8),
    dateFlexible: false,
    guestCount: 64,
    venueType: "rented-venue",
    venueCity: "Midlothian, VA",
    budgetBand: "125-200",
    decisionMaker: "shared",
    source: "referral",
    occasionNotes:
      "We're getting married at a restored barn just outside Midlothian. Sixty-four guests, mostly family. My aunt had Chef Kearse cook for her anniversary two years ago and has not stopped talking about the lamb. We want a plated dinner, nothing stiff — good food, people going back for seconds.",
    dietaryNotes:
      "Two vegetarians, one shellfish allergy (serious — carries an EpiPen), one guest avoids pork.",
    depositOk: true,
    callOk: true,
    workedWithChefBefore: false,
    scoreOverride: null,
    stage: "confirmed",
    assignedTo: "u_owner",
    tags: ["wedding", "referral", "plated"],
    quotedValue: 9600,
    bookedValue: 9600,
    lostReason: null,
    menuId: "m_001",
    clientToken: "demo-danielle-brooks",
    firstRepliedAt: stamp(-52, 11, 40),
    event: {
      serviceStyle: "Seated, plated dinner",
      loadInTime: "2:00 PM",
      serviceTime: "6:30 PM",
      staffAssigned: ["Chef R. Kearse", "Jordan Ellis", "2 servers", "1 bartender"],
      depositPaid: true,
      depositAmount: 2880,
      balanceDue: 6720,
      addressLine: "Restored barn venue, Midlothian, VA",
      runSheet: [
        { id: "r1", label: "Final headcount confirmed with couple", done: true, owner: "assistant" },
        { id: "r2", label: "Dietary list locked and shared with kitchen", done: true, owner: "assistant" },
        { id: "r3", label: "Menu locked", done: true, owner: "owner" },
        { id: "r4", label: "Rentals ordered — plates, glassware, linen", done: true, owner: "assistant" },
        { id: "r5", label: "Serving staff confirmed", done: true, owner: "assistant" },
        { id: "r6", label: "Shopping list built from locked menu", done: false, owner: "owner" },
        { id: "r7", label: "Venue kitchen walkthrough", done: false, owner: "owner" },
        { id: "r8", label: "Balance invoice sent", done: false, owner: "assistant" },
      ],
    },
  },

  /* ── Corporate, deposit overdue. Drives the "needs you today" queue. ───── */
  {
    id: "l_002",
    ref: "RK-2609",
    createdAt: stamp(-21, 14, 30),
    name: "Marcus Webb",
    email: "m.webb@example-consulting.com",
    phone: "(202) 555-0188",
    eventType: "corporate",
    eventDate: day(19),
    dateFlexible: false,
    guestCount: 38,
    venueType: "office",
    venueCity: "Washington, DC",
    budgetBand: "125-200",
    decisionMaker: "yes",
    source: "google",
    occasionNotes:
      "End-of-quarter dinner for our DC office. Thirty-eight people, in our own space on the eighth floor — we have a kitchenette, not a kitchen, so I need to understand what's possible. Plated or stations, either is fine. We do this twice a year and have never been happy with the caterer.",
    dietaryNotes: "Four vegetarian, two gluten-free, one halal.",
    depositOk: true,
    callOk: true,
    workedWithChefBefore: false,
    scoreOverride: null,
    stage: "deposit",
    assignedTo: "u_assistant",
    tags: ["corporate", "repeat-potential", "dc"],
    quotedValue: 6080,
    bookedValue: null,
    lostReason: null,
    menuId: "m_002",
    clientToken: "demo-marcus-webb",
    firstRepliedAt: stamp(-21, 17, 5),
    event: null,
    extraTimeline: [
      { at: stamp(-14, 11, 0), actor: "Jordan Ellis", kind: "stage", summary: "Moved to Quoted", detail: "Proposal sent — stations service, 38 guests." },
      { at: stamp(-9, 16, 20), actor: "Marcus Webb", kind: "message", summary: "Client approved the proposal", detail: "\"This looks great. Send the deposit link and I'll get it processed.\"" },
      { at: stamp(-8, 9, 30), actor: "Jordan Ellis", kind: "stage", summary: "Moved to Deposit due", detail: "Deposit invoice sent — $1,824 (30%)." },
      { at: stamp(-3, 9, 0), actor: "system", kind: "email", summary: "Deposit reminder sent automatically", detail: "First reminder, 5 days after invoice." },
    ],
  },

  /* ── Priority wedding enquiry, brand new, unclaimed. ───────────────────── */
  {
    id: "l_003",
    ref: "RK-2617",
    createdAt: stamp(-1, 21, 14),
    name: "Priya Raman",
    email: "priya.raman@example.com",
    phone: "(804) 555-0233",
    eventType: "wedding",
    eventDate: day(96),
    dateFlexible: false,
    guestCount: 85,
    venueType: "rented-venue",
    venueCity: "Richmond, VA",
    budgetBand: "200-plus",
    decisionMaker: "yes",
    source: "referral",
    occasionNotes:
      "Our wedding is in January at a venue in Scott's Addition. Eighty-five guests. We want something that feels like a proper dinner party rather than banquet food — my fiancé is from New Orleans and I grew up eating South Indian food, and we'd love a menu that nods to both without being a gimmick. Two of Chef Kearse's dishes on Instagram are exactly the direction we mean. We have budget and we'd rather spend it on food than flowers.",
    dietaryNotes: "Twelve vegetarian guests, three of whom are vegan. No beef.",
    depositOk: true,
    callOk: true,
    workedWithChefBefore: false,
    scoreOverride: null,
    stage: "new",
    assignedTo: null,
    tags: ["wedding", "referral", "high-value"],
    quotedValue: null,
    bookedValue: null,
    lostReason: null,
    menuId: null,
    clientToken: null,
    firstRepliedAt: null,
    event: null,
  },

  /* ── Corporate holiday enquiry, new, strong. Feeds the campaign story. ── */
  {
    id: "l_004",
    ref: "RK-2618",
    createdAt: stamp(0, 8, 41),
    name: "Angela Foster",
    email: "afoster@example-group.com",
    phone: "(703) 555-0117",
    eventType: "corporate",
    eventDate: day(74),
    dateFlexible: true,
    guestCount: 55,
    venueType: "rented-venue",
    venueCity: "Arlington, VA",
    budgetBand: "125-200",
    decisionMaker: "shared",
    source: "instagram",
    occasionNotes:
      "Holiday party for our Arlington office, around 55 people, first week of December if possible but we can move it. We've used a hotel the last three years and it's fine but forgettable. Looking for something people actually talk about on Monday.",
    dietaryNotes: "Will confirm — expect a handful of vegetarian and gluten-free.",
    depositOk: true,
    callOk: true,
    workedWithChefBefore: false,
    scoreOverride: null,
    stage: "new",
    assignedTo: null,
    tags: ["corporate", "holiday"],
    quotedValue: null,
    bookedValue: null,
    lostReason: null,
    menuId: null,
    clientToken: null,
    firstRepliedAt: null,
    event: null,
  },

  /* ── Private dinner at tasting stage. ─────────────────────────────────── */
  {
    id: "l_005",
    ref: "RK-2612",
    createdAt: stamp(-16, 19, 3),
    name: "Terence Hall",
    email: "terence.hall@example.com",
    phone: "(804) 555-0190",
    eventType: "milestone",
    eventDate: day(34),
    dateFlexible: false,
    guestCount: 14,
    venueType: "my-home",
    venueCity: "Glen Allen, VA",
    budgetBand: "200-plus",
    decisionMaker: "yes",
    source: "returning",
    occasionNotes:
      "My parents' fiftieth. Fourteen of us at my house in Glen Allen. Chef Kearse cooked for my wife's fortieth in 2024 and it was the best night we've hosted — same energy, different menu. My father will talk your ear off about the smoked beef.",
    dietaryNotes: "Mother is diabetic — would appreciate a dessert that accounts for it.",
    depositOk: true,
    callOk: true,
    workedWithChefBefore: true,
    scoreOverride: null,
    stage: "tasting",
    assignedTo: "u_owner",
    tags: ["past-client", "milestone", "vip"],
    quotedValue: 3500,
    bookedValue: null,
    lostReason: null,
    menuId: "m_003",
    clientToken: "demo-terence-hall",
    firstRepliedAt: stamp(-16, 20, 15),
    event: null,
    extraTimeline: [
      { at: stamp(-12, 10, 0), actor: "Chef R. Kearse", kind: "note", summary: "Returning client — skip the screening call", detail: "Booked the 2024 birthday. Knows the drill." },
      { at: stamp(-5, 15, 30), actor: "Jordan Ellis", kind: "stage", summary: "Moved to Tasting", detail: "Tasting not yet scheduled." },
    ],
  },

  /* ── Nurture band: real person, wrong timing. ─────────────────────────── */
  {
    id: "l_006",
    ref: "RK-2615",
    createdAt: stamp(-5, 12, 50),
    name: "Rachel Nguyen",
    email: "r.nguyen@example.com",
    phone: "(804) 555-0165",
    eventType: "private-dinner",
    eventDate: null,
    dateFlexible: true,
    guestCount: 8,
    venueType: "my-home",
    venueCity: "Henrico, VA",
    budgetBand: "75-125",
    decisionMaker: "yes",
    source: "google",
    occasionNotes: "Thinking about a dinner party sometime next year, just gathering ideas for now.",
    dietaryNotes: "",
    depositOk: false,
    callOk: false,
    workedWithChefBefore: false,
    scoreOverride: null,
    stage: "screened",
    assignedTo: "u_assistant",
    tags: ["nurture"],
    quotedValue: null,
    bookedValue: null,
    lostReason: null,
    menuId: null,
    clientToken: null,
    firstRepliedAt: stamp(-5, 13, 2),
    event: null,
    extraTimeline: [
      { at: stamp(-5, 13, 2), actor: "system", kind: "email", summary: "Nurture auto-reply sent", detail: "Menus, service overview and the seasonal-menu opt-in. No chef time spent." },
      { at: stamp(-5, 13, 3), actor: "system", kind: "note", summary: "Added to seasonal-menu list", detail: "Will receive the next menu drop." },
    ],
  },

  /* ── The time-waster the filter is for. Auto-declined, zero human time. ── */
  {
    id: "l_007",
    ref: "RK-2616",
    createdAt: stamp(-4, 23, 8),
    name: "Kevin M.",
    email: "kev.m.2004@example.com",
    phone: "",
    eventType: "other",
    eventDate: day(5),
    dateFlexible: false,
    guestCount: 3,
    venueType: "undecided",
    venueCity: "",
    budgetBand: "under-75",
    decisionMaker: "no",
    source: "other",
    occasionNotes: "how much",
    dietaryNotes: "",
    depositOk: false,
    callOk: false,
    workedWithChefBefore: false,
    scoreOverride: null,
    stage: "lost",
    assignedTo: null,
    tags: ["auto-declined"],
    quotedValue: null,
    bookedValue: null,
    lostReason: "Below service floor — auto-declined by the qualification engine",
    menuId: null,
    clientToken: null,
    firstRepliedAt: null,
    event: null,
    extraTimeline: [
      { at: stamp(-4, 23, 9), actor: "system", kind: "email", summary: "Polite decline sent automatically", detail: "Gracious no, newsletter link, suggestion of two local options. Total chef time spent: none." },
    ],
  },

  /* ── Completed event, feeds the win-back and review campaigns. ─────────── */
  {
    id: "l_008",
    ref: "RK-2588",
    createdAt: stamp(-142, 10, 0),
    name: "Simone Carter",
    email: "simone.carter@example.com",
    phone: "(804) 555-0121",
    eventType: "corporate",
    eventDate: day(-96),
    dateFlexible: false,
    guestCount: 42,
    venueType: "office",
    venueCity: "Richmond, VA",
    budgetBand: "125-200",
    decisionMaker: "yes",
    source: "referral",
    occasionNotes:
      "Client-appreciation dinner at our Richmond office, forty-two guests. We want to impress people who get taken out to dinner constantly.",
    dietaryNotes: "Three vegetarian, one nut allergy.",
    depositOk: true,
    callOk: true,
    workedWithChefBefore: false,
    scoreOverride: null,
    stage: "completed",
    assignedTo: "u_owner",
    tags: ["corporate", "past-client"],
    quotedValue: 6720,
    bookedValue: 7140,
    lostReason: null,
    menuId: null,
    clientToken: null,
    firstRepliedAt: stamp(-142, 12, 30),
    event: null,
    extraTimeline: [
      { at: stamp(-96, 22, 0), actor: "Chef R. Kearse", kind: "stage", summary: "Event delivered", detail: "Added a passed-appetiser course on the night — final $7,140 against a $6,720 quote." },
      { at: stamp(-94, 9, 0), actor: "system", kind: "email", summary: "Thank-you and review request sent", detail: "Routed to Google. No review received yet — still open." },
    ],
  },

  /* ── Lost on price. Makes the win/loss reporting real. ─────────────────── */
  {
    id: "l_009",
    ref: "RK-2601",
    createdAt: stamp(-63, 11, 22),
    name: "Owen Delacroix",
    email: "owen.d@example.com",
    phone: "(540) 555-0176",
    eventType: "wedding",
    eventDate: day(-12),
    dateFlexible: false,
    guestCount: 120,
    venueType: "outdoor",
    venueCity: "Charlottesville, VA",
    budgetBand: "75-125",
    decisionMaker: "shared",
    source: "wedding-directory",
    occasionNotes:
      "Outdoor wedding near Charlottesville, 120 guests, buffet service. We have three caterers quoting and we're deciding on price.",
    dietaryNotes: "Will provide a list closer to the date.",
    depositOk: true,
    callOk: true,
    workedWithChefBefore: false,
    scoreOverride: null,
    stage: "lost",
    assignedTo: "u_assistant",
    tags: ["wedding", "price-shopper"],
    quotedValue: 11400,
    bookedValue: null,
    lostReason: "Lost on price — chose a lower bid",
    menuId: null,
    clientToken: null,
    firstRepliedAt: stamp(-63, 14, 0),
    event: null,
  },

  /* ── Weekly service enquiry — recurring revenue, quoted. ───────────────── */
  {
    id: "l_010",
    ref: "RK-2613",
    createdAt: stamp(-11, 7, 45),
    name: "Dr. Yvonne Baptiste",
    email: "y.baptiste@example.com",
    phone: "(804) 555-0154",
    eventType: "weekly-service",
    eventDate: day(26),
    dateFlexible: true,
    guestCount: 4,
    venueType: "my-home",
    venueCity: "Short Pump, VA",
    budgetBand: "200-plus",
    decisionMaker: "yes",
    source: "referral",
    occasionNotes:
      "I work long clinical hours and my household eats badly because of it. I'd like a weekly service — cook and store four or five dinners for a family of four, one day a week. I care more about consistency than variety. Referred by a colleague whose family he cooked for last year.",
    dietaryNotes: "Low sodium for my husband. No pork. My daughter is a fussy eleven-year-old.",
    depositOk: true,
    callOk: true,
    workedWithChefBefore: false,
    scoreOverride: null,
    stage: "quoted",
    assignedTo: "u_owner",
    tags: ["weekly-service", "recurring", "referral"],
    quotedValue: 1150,
    bookedValue: null,
    lostReason: null,
    menuId: null,
    clientToken: null,
    firstRepliedAt: stamp(-11, 9, 10),
    event: null,
    extraTimeline: [
      { at: stamp(-6, 13, 0), actor: "Chef R. Kearse", kind: "stage", summary: "Moved to Quoted", detail: "Weekly rate quoted per week, four dinners, shopping included." },
      { at: stamp(-6, 13, 5), actor: "Chef R. Kearse", kind: "note", summary: "Highest lifetime value in the pipeline", detail: "A weekly client at this rate is worth more over a year than three weddings." },
    ],
  },
];

/** Build full Lead records: compute the score, assemble the timeline. */
export function buildLeads(): Lead[] {
  return leadSeeds.map((seed) => {
    const { extraTimeline = [], ...rest } = seed;
    const score = scoreLead(
      {
        eventType: rest.eventType,
        eventDate: rest.eventDate,
        dateFlexible: rest.dateFlexible,
        guestCount: rest.guestCount,
        venueType: rest.venueType,
        budgetBand: rest.budgetBand,
        decisionMaker: rest.decisionMaker,
        source: rest.source,
        occasionNotes: rest.occasionNotes,
        depositOk: rest.depositOk,
        callOk: rest.callOk,
        phone: rest.phone,
        workedWithChefBefore: rest.workedWithChefBefore,
      },
      // Score as at the moment the enquiry landed, which is what actually
      // happened — otherwise a lead created 50 days ago would be re-scored
      // today and its lead-time points would be wrong.
      new Date(rest.createdAt),
    );

    const base: Omit<TimelineEntry, "id">[] = [
      { at: rest.createdAt, actor: rest.name, kind: "created", summary: "Enquiry submitted", detail: `Via the website intake form — reference ${rest.ref}.` },
      {
        at: rest.createdAt,
        actor: "system",
        kind: "scored",
        summary: `Qualified ${score.total}/100 — band ${score.band}`,
        detail: score.lines
          .slice()
          .sort((a, b) => b.points - a.points)
          .slice(0, 3)
          .map((l) => `${l.label}: ${l.points}/${l.max}`)
          .join(" · "),
      },
      ...extraTimeline,
    ];

    const timeline: TimelineEntry[] = base
      .sort((a, b) => a.at.localeCompare(b.at))
      .map((entry, i) => ({ ...entry, id: `${rest.id}_t${i + 1}` }));

    return { ...rest, orgId: ORG_ID, score, timeline };
  });
}

/* ───────────────────────────────────────────────────────────── menus ───── */

/** Course templates by service style, drawn from his real photographed work. */
export const COURSE_TEMPLATES: Record<string, { name: string; picks: number; offered: string[] }[]> = {
  "Seated, plated dinner": [
    { name: "First course", picks: 1, offered: ["garden-salad", "clam-chowder", "mango-salsa-plated"] },
    { name: "Second course", picks: 1, offered: ["stuffed-shrimp-platter", "crab-stuffed-golden", "shrimp-grits-sausage"] },
    { name: "Main course", picks: 2, offered: ["lamb-chops-asparagus", "snapper-mango-salsa", "lobster-tail-plated", "smoked-beef-sliced", "smothered-chicken"] },
    { name: "Dessert", picks: 1, offered: ["creme-brulee-torch", "dessert-strawberries"] },
  ],
  "Family style": [
    { name: "To start, on the table", picks: 2, offered: ["garden-salad", "mango-salsa-platter", "fried-fish-hushpuppies"] },
    { name: "Mains to share", picks: 2, offered: ["smoked-beef-sliced", "seafood-crab-roast", "smothered-chicken", "baked-stuffed-platter"] },
    { name: "Dessert", picks: 1, offered: ["dessert-strawberries", "creme-brulee-torch"] },
  ],
  "Food stations": [
    { name: "Raw and cold station", picks: 1, offered: ["mango-salsa-platter", "garden-salad"] },
    { name: "Seafood station", picks: 2, offered: ["stuffed-shrimp-platter", "seafood-crab-roast", "lobster-shrimp-linguine", "shrimp-sausage-cream"] },
    { name: "Carving station", picks: 1, offered: ["smoked-beef-sliced", "blackened-roast"] },
    { name: "Sweet station", picks: 2, offered: ["dessert-strawberries", "creme-brulee-torch"] },
  ],
  "Passed appetizers": [
    { name: "Passed, first hour", picks: 3, offered: ["stuffed-shrimp-platter", "crab-stuffed-plated", "fried-fish-hushpuppies", "mango-salsa-detail"] },
    { name: "Passed, second hour", picks: 2, offered: ["shrimp-sausage-cream", "smoked-beef-sliced"] },
  ],
};

export function buildMenus(): MenuDraft[] {
  const plated = COURSE_TEMPLATES["Seated, plated dinner"];
  const stations = COURSE_TEMPLATES["Food stations"];

  return [
    {
      id: "m_001",
      orgId: ORG_ID,
      leadId: "l_001",
      version: 3,
      status: "locked",
      serviceStyle: "Seated, plated dinner",
      guestCount: 64,
      courses: plated.map((c, i) => ({
        id: `m1c${i + 1}`,
        ...c,
        selected:
          i === 0 ? ["garden-salad"]
          : i === 1 ? ["crab-stuffed-golden"]
          : i === 2 ? ["lamb-chops-asparagus", "snapper-mango-salsa"]
          : ["creme-brulee-torch"],
      })),
      addOns: [
        { id: "a1", label: "Bartender and mobile bar", selected: true, note: "Two signature cocktails, beer and wine" },
        { id: "a2", label: "Additional serving staff", selected: true, note: "Two servers for 64 guests" },
        { id: "a3", label: "Late-night passed bite", selected: false, note: "" },
      ],
      guestDietary: [
        { id: "g1", label: "Aunt Rosalie", restrictions: ["Shellfish allergy"], notes: "Severe — carries an EpiPen. No cross-contact." },
        { id: "g2", label: "Table 4, two guests", restrictions: ["Vegetarian"], notes: "" },
        { id: "g3", label: "Uncle Ray", restrictions: ["No pork"], notes: "" },
      ],
      comments: [
        { id: "c1", at: stamp(-19, 15, 0), authorType: "client", authorName: "Danielle Brooks", courseId: "m1c3", body: "Can we do both the lamb and the fish as a choice on the night, rather than picking one?" },
        { id: "c2", at: stamp(-19, 17, 22), authorType: "staff", authorName: "Chef R. Kearse", courseId: "m1c3", body: "Yes — two mains is standard for me at this headcount. I'll take the count with the invitations so nothing is wasted." },
        { id: "c3", at: stamp(-18, 9, 5), authorType: "staff", authorName: "Chef R. Kearse", courseId: "m1c2", body: "Swapping the second course to the crab-stuffed — it plates faster for 64 and holds better than the shrimp." },
        { id: "c4", at: stamp(-17, 11, 40), authorType: "client", authorName: "Danielle Brooks", courseId: null, body: "All approved. Thank you for being so easy about the allergy — the last caterer made us feel like a nuisance." },
      ],
      updatedAt: stamp(-17, 12, 0),
      lockedAt: stamp(-17, 12, 0),
      estimatePerGuest: null,
    },
    {
      id: "m_002",
      orgId: ORG_ID,
      leadId: "l_002",
      version: 2,
      status: "submitted",
      serviceStyle: "Food stations",
      guestCount: 38,
      courses: stations.map((c, i) => ({
        id: `m2c${i + 1}`,
        ...c,
        selected:
          i === 0 ? ["garden-salad"]
          : i === 1 ? ["stuffed-shrimp-platter", "shrimp-sausage-cream"]
          : i === 2 ? ["smoked-beef-sliced"]
          : ["dessert-strawberries"],
      })),
      addOns: [
        { id: "a1", label: "Bartender and mobile bar", selected: false, note: "Office has its own bar service" },
        { id: "a2", label: "Additional serving staff", selected: true, note: "" },
        { id: "a3", label: "Coffee service", selected: true, note: "" },
      ],
      guestDietary: [
        { id: "g1", label: "Four guests", restrictions: ["Vegetarian"], notes: "" },
        { id: "g2", label: "Two guests", restrictions: ["Gluten-free"], notes: "" },
        { id: "g3", label: "One guest", restrictions: ["Halal"], notes: "Confirm sourcing." },
      ],
      comments: [
        { id: "c1", at: stamp(-7, 14, 0), authorType: "client", authorName: "Marcus Webb", courseId: null, body: "Submitted for review. The kitchenette situation is my main worry — is the carving station realistic up there?" },
      ],
      updatedAt: stamp(-7, 14, 0),
      lockedAt: null,
      estimatePerGuest: null,
    },
    {
      id: "m_003",
      orgId: ORG_ID,
      leadId: "l_005",
      version: 1,
      status: "draft",
      serviceStyle: "Seated, plated dinner",
      guestCount: 14,
      courses: plated.map((c, i) => ({
        id: `m3c${i + 1}`,
        ...c,
        selected: i === 2 ? ["smoked-beef-sliced"] : [],
      })),
      addOns: [
        { id: "a1", label: "Bartender and mobile bar", selected: false, note: "" },
        { id: "a2", label: "Additional serving staff", selected: false, note: "" },
        { id: "a3", label: "Wine pairing", selected: true, note: "Father drinks red only" },
      ],
      guestDietary: [
        { id: "g1", label: "Mother", restrictions: ["Diabetic"], notes: "Would like a dessert that accounts for it." },
      ],
      comments: [],
      updatedAt: stamp(-4, 20, 30),
      lockedAt: null,
      estimatePerGuest: null,
    },
  ];
}

/* ────────────────────────────────────────────────────────── messages ───── */

export function buildMessages(): Message[] {
  const m = (
    id: string,
    leadId: string,
    at: string,
    authorType: "staff" | "client",
    authorName: string,
    authorRole: "owner" | "assistant" | null,
    body: string,
    readByStaff = true,
    readByClient = true,
  ): Message => ({ id, orgId: ORG_ID, leadId, at, authorType, authorName, authorRole, body, readByStaff, readByClient });

  return [
    m("msg_1", "l_001", stamp(-20, 10, 0), "client", "Danielle Brooks", null, "Hi Chef — we've been through the menu you sent and we love it. One question about the mains, I've left a note on that course.", true, true),
    m("msg_2", "l_001", stamp(-19, 17, 25), "staff", "Chef R. Kearse", "owner", "Answered it on the course itself. Two mains is no trouble at 64 — I'd rather give people a choice. I'll need the final split about ten days out.", true, true),
    m("msg_3", "l_001", stamp(-2, 18, 12), "client", "Danielle Brooks", null, "Final count is 64 confirmed. 38 lamb, 26 fish. Also — my aunt's shellfish allergy, can you confirm the crab course won't be prepped near her plate? She's nervous about it.", true, true),
    m("msg_4", "l_001", stamp(-2, 20, 40), "staff", "Chef R. Kearse", "owner", "Confirmed and noted on the kitchen sheet. Her first course is plated separately, different board, different gloves, and it goes out on a marked plate so the server knows. She'll be looked after.", true, true),
    m("msg_5", "l_001", stamp(0, 7, 55), "client", "Danielle Brooks", null, "One more — is there somewhere the two of us can eat for five minutes away from everyone? Everyone tells us we won't get to taste the food.", false, true),

    m("msg_6", "l_002", stamp(-9, 16, 20), "client", "Marcus Webb", null, "This looks great. Send the deposit link and I'll get it processed this week.", true, true),
    m("msg_7", "l_002", stamp(-8, 9, 32), "staff", "Jordan Ellis", "assistant", "Sent — it's in your inbox and also on your event page. Anything you need from our side to get it through your finance team, just say.", true, true),
    m("msg_8", "l_002", stamp(-1, 11, 15), "client", "Marcus Webb", null, "Sorry for the delay, our finance lead has been out. Should be cleared this week. Still on for the 19th.", false, true),

    m("msg_9", "l_005", stamp(-5, 15, 35), "staff", "Jordan Ellis", "assistant", "Lovely to hear from you again. Chef would like to do a tasting before we lock the menu — what evenings work for you in the next fortnight?", true, true),
  ];
}

/* ─────────────────────────────────────────────────────── subscribers ───── */

const SUB_NAMES: [string, string, Subscriber["source"], Subscriber["segments"], number][] = [
  ["hannah.lowe@example.com", "Hannah Lowe", "site-footer", ["seasonal-menu"], -3],
  ["d.okonkwo@example.com", "Daniel Okonkwo", "menu-download", ["seasonal-menu", "corporate"], -6],
  ["claire.b@example.com", "Claire Bennett", "event-guest", ["seasonal-menu", "weddings"], -9],
  ["t.marsh@example.com", "Tanya Marsh", "site-footer", ["seasonal-menu"], -12],
  ["simone.carter@example.com", "Simone Carter", "event-guest", ["past-client", "corporate"], -94],
  ["r.nguyen@example.com", "Rachel Nguyen", "declined-lead", ["seasonal-menu"], -5],
  ["kev.m.2004@example.com", null as unknown as string, "declined-lead", ["seasonal-menu"], -4],
  ["greg.ellison@example.com", "Greg Ellison", "site-footer", ["seasonal-menu", "lapsed"], -210],
  ["m.santoro@example.com", "Maria Santoro", "event-guest", ["past-client", "lapsed"], -240],
  ["j.whitfield@example.com", "Joseph Whitfield", "menu-download", ["seasonal-menu", "weddings"], -18],
  ["a.kilpatrick@example.com", "Amara Kilpatrick", "site-footer", ["seasonal-menu"], -24],
  ["p.vance@example.com", "Paul Vance", "event-guest", ["past-client"], -150],
  ["nadia.h@example.com", "Nadia Haddad", "menu-download", ["seasonal-menu", "corporate"], -31],
  ["l.ferreira@example.com", "Luis Ferreira", "site-footer", ["seasonal-menu"], -38],
  ["kimberly.j@example.com", "Kimberly Jessup", "event-guest", ["past-client", "weddings"], -122],
  ["o.delacroix@example.com", "Owen Delacroix", "declined-lead", ["seasonal-menu", "weddings"], -60],
  ["s.rowntree@example.com", "Sam Rowntree", "site-footer", ["seasonal-menu"], -44],
  ["gina.p@example.com", "Gina Petrakis", "menu-download", ["seasonal-menu", "corporate"], -51],
  ["v.osei@example.com", "Victor Osei", "site-footer", ["seasonal-menu", "lapsed"], -265],
  ["b.mcallister@example.com", "Beth McAllister", "event-guest", ["past-client"], -180],
];

export function buildSubscribers(): Subscriber[] {
  return SUB_NAMES.map(([email, name, source, segments, daysAgo], i) => ({
    id: `sub_${String(i + 1).padStart(3, "0")}`,
    orgId: ORG_ID,
    email,
    name: name ?? null,
    createdAt: stamp(daysAgo, 12, i),
    source,
    segments,
    status: i === 6 ? "unsubscribed" : "active",
    lastSentAt: daysAgo < -30 ? stamp(-14, 9, 0) : null,
  }));
}

/* ──────────────────────────────────────────────────────── campaigns ───── */

export function buildCampaigns(): Campaign[] {
  return [
    {
      id: "cmp_corporate_holiday",
      orgId: ORG_ID,
      name: "Corporate Holiday Parties",
      goal: "Book eight corporate holiday dinners between mid-November and the end of December.",
      audience: "Office managers, EAs and HR leads in Richmond, Northern Virginia and DC, plus everyone on the corporate segment.",
      segments: ["corporate"],
      channels: ["email", "instagram", "paid-social"],
      cadence: "Weekly from the first week of October to the second week of December",
      status: "live",
      activeMonths: [9, 10, 11, 12],
      kpi: { sent: 412, opened: 178, clicked: 41, enquiries: 9, booked: 2 },
      assets: [
        { id: "a1", title: "Corporate holiday email — the pitch", kind: "email", description: "Opening email in the sequence. Leads on the fact that nobody remembers a hotel ballroom.", file: "/marketing/email/corporate-holiday-01-the-pitch.html", meta: "HTML email" },
        { id: "a2", title: "Corporate holiday email — the reminder", kind: "email", description: "Second touch, ten days later. Scarcity is real and stated honestly: December Fridays go first.", file: "/marketing/email/corporate-holiday-02-dates-going.html", meta: "HTML email" },
        { id: "a3", title: "Paid social — three ad concepts", kind: "ad", description: "Full creative briefs with headline, body, CTA, targeting and the exact image to pair with each.", file: "/marketing/ads/corporate-holiday-ads.md", meta: "Brief, 3 concepts" },
        { id: "a4", title: "Image prompts for Nano Banana", kind: "prompt-sheet", description: "Six atmosphere and texture prompts. No prompt depicts a dish a guest could order.", file: "/marketing/prompts/corporate-holiday-prompts.md", meta: "6 prompts" },
        { id: "a5", title: "Instagram captions and stories", kind: "social", description: "Nine captions and four story frames, written in his voice, ready to paste.", file: "/marketing/social/corporate-holiday-captions.md", meta: "9 captions" },
      ],
    },
    {
      id: "cmp_wedding_season",
      orgId: ORG_ID,
      name: "Wedding Season",
      goal: "Fill spring and summer Saturdays, and get in front of couples before they sign a venue's in-house caterer.",
      audience: "Engaged couples in Central Virginia and the DMV, the weddings segment, and venue coordinators as referral partners.",
      segments: ["weddings"],
      channels: ["email", "instagram", "paid-social"],
      cadence: "Fortnightly, year-round, heavier January to April",
      status: "live",
      activeMonths: [1, 2, 3, 4, 5, 9, 10],
      kpi: { sent: 286, opened: 141, clicked: 38, enquiries: 11, booked: 3 },
      assets: [
        { id: "a1", title: "Wedding enquiry email — the difference", kind: "email", description: "The argument for a chef over a banquet caterer, made without knocking anybody.", file: "/marketing/email/wedding-01-the-difference.html", meta: "HTML email" },
        { id: "a2", title: "Wedding tasting invitation", kind: "email", description: "Sent to A-band wedding enquiries. Converts on specificity — real dates, real dishes.", file: "/marketing/email/wedding-02-tasting-invite.html", meta: "HTML email" },
        { id: "a3", title: "Venue coordinator outreach", kind: "email", description: "The highest-leverage email here. One coordinator relationship is worth a year of ads.", file: "/marketing/email/wedding-03-venue-partner.html", meta: "HTML email" },
        { id: "a4", title: "Paid social — three ad concepts", kind: "ad", description: "Concepts aimed at couples who care more about food than flowers.", file: "/marketing/ads/wedding-season-ads.md", meta: "Brief, 3 concepts" },
        { id: "a5", title: "Image prompts for Nano Banana", kind: "prompt-sheet", description: "Atmosphere plates for wedding creative — the room, the light, the table. Never a dish.", file: "/marketing/prompts/wedding-season-prompts.md", meta: "6 prompts" },
        { id: "a6", title: "Instagram captions", kind: "social", description: "Eight captions covering the objection, the proof and the ask.", file: "/marketing/social/wedding-season-captions.md", meta: "8 captions" },
      ],
    },
    {
      id: "cmp_open_weekend",
      orgId: ORG_ID,
      name: "Open Weekend Fill",
      goal: "Convert an empty Saturday into a booked one inside three weeks, without discounting the brand.",
      audience: "Past clients and the seasonal-menu list, filtered to the region of the open date.",
      segments: ["past-client", "seasonal-menu"],
      channels: ["email", "sms", "instagram"],
      cadence: "Triggered — fires only when a weekend inside 21 days is still open",
      status: "live",
      activeMonths: [],
      kpi: { sent: 96, opened: 58, clicked: 19, enquiries: 4, booked: 1 },
      assets: [
        { id: "a1", title: "Open date email", kind: "email", description: "Short, personal, no discount. Reads like a note, not a promotion.", file: "/marketing/email/open-weekend-01-one-date.html", meta: "HTML email" },
        { id: "a2", title: "Open date SMS and story copy", kind: "social", description: "Two SMS variants with compliant opt-out, plus story frames.", file: "/marketing/social/open-weekend-sms-stories.md", meta: "SMS + 3 frames" },
      ],
    },
    {
      id: "cmp_winback",
      orgId: ORG_ID,
      name: "Lapsed Client Win-back",
      goal: "Bring back guests who booked once and have not been in touch for six months or more.",
      audience: "Past clients with no activity in 180 days. Currently four people.",
      segments: ["lapsed", "past-client"],
      channels: ["email"],
      cadence: "Monthly, small batches, never the same person twice in a quarter",
      status: "live",
      activeMonths: [],
      kpi: { sent: 34, opened: 21, clicked: 7, enquiries: 3, booked: 1 },
      assets: [
        { id: "a1", title: "Win-back email — what's changed", kind: "email", description: "Leads with a new dish rather than a guilt trip. The only win-back angle that works twice.", file: "/marketing/email/winback-01-whats-new.html", meta: "HTML email" },
      ],
    },
    {
      id: "cmp_menu_drop",
      orgId: ORG_ID,
      name: "Seasonal Menu Drop",
      goal: "Keep the list warm between events and give people a reason to forward the email.",
      audience: "The whole seasonal-menu list.",
      segments: ["seasonal-menu"],
      channels: ["email", "instagram"],
      cadence: "Quarterly, on the turn of each season",
      status: "seasonal",
      activeMonths: [3, 6, 9, 12],
      kpi: { sent: 604, opened: 322, clicked: 74, enquiries: 6, booked: 2 },
      assets: [
        { id: "a1", title: "Autumn menu drop email", kind: "email", description: "The list's favourite email of the quarter. Menu-first, sell-second.", file: "/marketing/email/menu-drop-autumn.html", meta: "HTML email" },
        { id: "a2", title: "Menu drop captions and carousel plan", kind: "social", description: "Carousel structure plus captions for the drop announcement.", file: "/marketing/social/menu-drop-captions.md", meta: "6 captions" },
      ],
    },
    {
      id: "cmp_referral",
      orgId: ORG_ID,
      name: "Review and Referral Ask",
      goal: "Close the biggest competitive gap he has — his Google review count — and turn happy guests into referrers.",
      audience: "Every client three days after their event, and past clients who never left a review.",
      segments: ["past-client"],
      channels: ["email", "sms"],
      cadence: "Triggered three days after each completed event, then once more at thirty days",
      status: "live",
      activeMonths: [],
      kpi: { sent: 18, opened: 14, clicked: 6, enquiries: 2, booked: 1 },
      assets: [
        { id: "a1", title: "Thank-you and review request", kind: "email", description: "Sent three days out, while the night is still vivid. One link, one ask.", file: "/marketing/email/referral-01-thank-you.html", meta: "HTML email" },
        { id: "a2", title: "The referral ask", kind: "email", description: "Thirty days later. Asks for a name, not a share — which is why it works.", file: "/marketing/email/referral-02-one-name.html", meta: "HTML email" },
      ],
    },
  ];
}

/** Campaign-level strategy document offered as a single download. */
export const MASTER_PLAN_ASSET: CampaignAssetLike = {
  id: "master",
  title: "Full marketing plan — twelve months",
  kind: "plan",
  description:
    "The whole programme in one document: the six campaigns, the calendar month by month, the segments, the budget shape, what to measure, and the corporate and wedding growth strategy the chef asked for.",
  file: "/marketing/chef-r-kearse-marketing-plan.md",
  meta: "Strategy document",
};
type CampaignAssetLike = Campaign["assets"][number];
