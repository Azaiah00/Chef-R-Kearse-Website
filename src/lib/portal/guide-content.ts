/**
 * PLAIN-ENGLISH GUIDANCE
 *
 * Everything the chef and his assistant need in order to use this portal without
 * anybody sitting next to them.
 *
 * HOW TO WRITE FOR THIS FILE — read before adding anything.
 *
 * The two people reading this are a chef and his assistant. They are good at
 * their jobs and they are not technical, and those two facts are unrelated. So:
 *
 *   - Short sentences. One idea each.
 *   - No jargon in the explanations themselves. Where a word on the screen needs
 *     explaining, it goes in TERMS and gets defined once, properly.
 *   - Say what to DO, not what the feature is. "Open the two names at the top
 *     and call them" beats "this page surfaces prioritised prospects".
 *   - Never say "simply", "just" or "easy". If it were easy they would not be
 *     reading this, and being told it is easy when it is not is insulting.
 *   - Concrete over general. Name the actual button, the actual number.
 *   - Honest about limits. If something is demo data, the guide says so.
 *
 * The content is data so it can be edited without touching a component, and so
 * the same text can appear in the page panel, the tour and the Start here page
 * without three copies drifting apart.
 */

import type { StaffRole } from "./types";

/* ══════════════════════════ Glossary ════════════════════════════════════ */

export interface Term {
  /** The word as it appears on screen. */
  term: string;
  /** One or two sentences. Plain. No cross-references to other jargon. */
  plain: string;
  /** An optional second line for the "why it matters" part. */
  why?: string;
}

/**
 * Keyed by a short slug so a component can mark up a word inline.
 * Every term that appears anywhere in the portal should be here.
 */
export const TERMS: Record<string, Term> = {
  enquiry: {
    term: "Enquiry",
    plain:
      "Someone who filled in the form on the website asking about an event. It arrives here on its own — nobody has to copy it over.",
  },
  band: {
    term: "Band A, B, C or D",
    plain:
      "A letter the system puts on every enquiry the moment it arrives, based on the answers they gave. A is the best fit for you, D is the worst.",
    why:
      "It exists so you are not reading every enquiry yourself. A and B reach a person. C and D get a polite reply automatically.",
  },
  score: {
    term: "Score",
    plain:
      "A number out of 100 that goes with the band. You can always open it and see exactly which answers earned which points.",
    why: "If the number ever looks wrong, the breakdown tells you why, and you can overrule it.",
  },
  pipeline: {
    term: "Pipeline",
    plain:
      "All your enquiries laid out in columns, left to right, from new ones through to booked. Drag a card to a different column to move it along.",
  },
  stage: {
    term: "Stage",
    plain:
      "Where an enquiry has got to — new, quoted, tasting booked, confirmed, and so on. It is the column the card sits in.",
  },
  prospect: {
    term: "Prospect",
    plain:
      "Someone who has NOT contacted you. A company, a venue or a charity that we found and think is worth a call.",
    why:
      "This is the opposite of an enquiry. An enquiry came to you. A prospect is one you go and get.",
  },
  signal: {
    term: "Signal",
    plain:
      "A news story or a listing that might mean somebody needs a caterer — a business opening, a company taking a new office, a charity announcing a gala.",
    why:
      "It is a hint, not a lead. Somebody has to read it and decide. That is what the Signals page is for.",
  },
  sweep: {
    term: "Sweep",
    plain:
      "The weekly search. It reads a set of news feeds and public calendars and brings back anything that looks promising.",
    why: "Each sweep is numbered and dated, so you can see what any given week actually turned up.",
  },
  priority: {
    term: "Call this week / Call this month / Keep an eye on it / Do not pursue",
    plain:
      "How urgent a prospect is. The system works it out from how well they fit, how fresh the news is, and whether there is a real person to ring.",
    why:
      '"Do not pursue" is a real answer and it is useful. It means we checked and it is not worth your time, and the card says why.',
  },
  source: {
    term: "Source",
    plain:
      "The web page a fact came from, with the date we read it. Every prospect has at least one.",
    why:
      "It is there so you can repeat something on a phone call and know it is true. Each one also says what it does NOT prove, so you never state more than we actually checked.",
  },
  offListFee: {
    term: "Off-list fee",
    plain:
      "What a venue charges a client for bringing in a caterer who is not on the venue's approved list. Usually five or six hundred dollars.",
    why:
      "This is the argument for getting on these lists. The fee is paid by the couple, not by you — and some of them pick a different chef to avoid it.",
  },
  approvedList: {
    term: "Approved caterer list",
    plain:
      "A list a venue keeps of caterers it is happy to have working in its building. Some venues publish theirs, some only tell you if you ask.",
    why:
      "Getting on one is the best single thing in this whole system. You do it once and it keeps sending you work.",
  },
  outreach: {
    term: "Outreach",
    plain:
      "A letter or email to a prospect. It gets written first, then read, then sent — those are three separate steps on purpose.",
    why: "Nothing goes out in your name without someone reading it first.",
  },
  draftApprovedSent: {
    term: "Draft, Approved, Sent",
    plain:
      "Draft means it is written. Approved means you have read it and you are happy with it. Sent means it has actually gone.",
    why:
      "A pile of drafts nobody sent is the most common way a system like this quietly stops working. The portal counts them and tells you.",
  },
  brain: {
    term: "Kitchen Brain",
    plain:
      "One page holding the facts about your business — your insurance, your certificates, your prices, how far you travel. Everything the portal writes for you reads from here.",
    why:
      "It means a letter can never claim something about you that is not true. Anything not filled in shows as an orange NOT CONFIRMED label.",
  },
  actionBy: {
    term: "Action by / Overdue",
    plain:
      "The date you decided you would do something about a prospect. If that date has passed, it shows as overdue.",
    why:
      "Overdue items go to the top of the briefing, ahead of anything new. Old work first.",
  },
  primeDate: {
    term: "Prime date",
    plain:
      "A Friday or Saturday with nothing booked. The portal watches the next six weeks of them.",
    why:
      "An empty Saturday cannot be sold later. It is the one thing here that is worth something today and nothing next month.",
  },
  venueList: {
    term: "Venues page",
    plain:
      "Every venue we know of, sorted by how easy it is to get work there — starting with the ones that have no kitchen of their own.",
  },
  demoData: {
    term: "Demo data",
    plain:
      "Made-up enquiries and events, so the portal looks like a working business while we build it. Real client information replaces it later.",
    why:
      "The prospects and venues are NOT made up — those are real businesses with real web pages. Only the enquiries and bookings are examples.",
  },
  magicLink: {
    term: "Magic link",
    plain:
      "A private web address you send a client so they can see their own event and pick their menu. No password, and it only works for their event.",
  },
  eightySix: {
    term: "86 an item",
    plain:
      "Kitchen shorthand for taking something off. Mark a dish 86'd and it disappears from what clients can choose.",
  },
};

/* ══════════════════════════ Page guides ═════════════════════════════════ */

export interface PageGuide {
  /** Plain heading, in their words. */
  heading: string;
  /** One sentence: what this page is. */
  oneLine: string;
  /** What they are looking at. Two to four items. Each one short. */
  whatYouSee: string[];
  /** The single thing to do first. Imperative, concrete. */
  doFirst: string;
  /** Glossary keys that appear on this page. */
  terms: string[];
  /** Shown only to this role when set. */
  roles?: StaffRole[];
}

/**
 * Keyed by route. The owner and the assistant see different text on the pages
 * where they do genuinely different jobs, so a few keys carry a `:assistant`
 * variant and the lookup falls back to the plain key.
 */
export const PAGE_GUIDES: Record<string, PageGuide> = {
  "/portal": {
    heading: "Your dashboard",
    oneLine: "The state of the business on one screen, and what needs you today.",
    whatYouSee: [
      "At the top: what needs doing, most urgent first. If something is late it sits here.",
      "Your next events, with how many days until each one.",
      "The money: what is quoted, what is booked, what you have actually been paid.",
      "The next few weeks of your calendar. Red squares are booked, empty Fridays and Saturdays are not.",
    ],
    doFirst:
      "Read the top box. If it is empty, you are up to date and the rest of this page is just the picture.",
    terms: ["actionBy", "primeDate", "demoData"],
  },

  "/portal:assistant": {
    heading: "Your desk",
    oneLine: "Everything waiting on you today, in the order to do it.",
    whatYouSee: [
      "The jobs at the top are the ones that are late or nearly late. Start there.",
      "New enquiries that still need a reply.",
      "The events coming up and what still needs arranging for each one.",
      "Messages from clients that nobody has answered yet.",
    ],
    doFirst: "Work from the top down. Anything marked late goes before anything new.",
    terms: ["enquiry", "actionBy", "demoData"],
  },

  "/portal/leads": {
    heading: "Your enquiries",
    oneLine: "Everyone who has contacted you through the website, and how far along each one is.",
    whatYouSee: [
      "The board at the top: columns from new on the left to booked on the right. Drag a card sideways to move it.",
      "A letter on every card — A, B, C or D — for how well they fit what you want to do.",
      "The table underneath shows the same enquiries as a list, which is easier for scanning.",
      "Add an enquiry yourself with the button at the top if someone phones you.",
    ],
    doFirst:
      "Look at the A cards first. Those are the ones worth your own time. The Cs and Ds already got a polite reply without you.",
    terms: ["enquiry", "band", "score", "pipeline", "stage"],
  },

  "/portal/messages": {
    heading: "Messages",
    oneLine: "Conversations with clients about their events, in one place instead of scattered across texts and email.",
    whatYouSee: [
      "Each client's event is one conversation. Click it to read the whole thread.",
      "Anything with a mark next to it has not been read yet.",
      "What you type here is what the client sees on their own private page.",
    ],
    doFirst: "Answer anything unread. A same-day reply is most of why people book you over someone else.",
    terms: ["magicLink"],
  },

  "/portal/events": {
    heading: "Events",
    oneLine: "Everything you have agreed to cook, and what still has to happen before each one.",
    whatYouSee: [
      "Events in date order, nearest first.",
      "Open one and you get the run sheet, the shopping list and the prep plan for that event.",
      "Anything missing — a final headcount, a locked menu, a deposit — is flagged on the event.",
    ],
    doFirst: "Open the next event and check nothing on it is still outstanding.",
    terms: ["actionBy"],
  },

  "/portal/menus": {
    heading: "Menus",
    oneLine: "What each client has chosen to eat, and whether they have finished choosing.",
    whatYouSee: [
      "One row per event, showing how many choices they have made out of how many they need.",
      "A menu can be locked once it is settled. After that the client cannot change it without asking.",
      "Open a menu and you get the shopping list and prep schedule built from it.",
    ],
    doFirst:
      "Chase anybody who has not finished choosing. You cannot shop for an event whose menu is still moving.",
    terms: ["eightySix"],
  },

  "/portal/marketing": {
    heading: "Marketing",
    oneLine: "Ready-made emails and social posts, and what the portal suggests sending this week.",
    whatYouSee: [
      "This week's suggestions at the top, each with a line saying why it is being suggested now.",
      "Finished email designs you can download and send.",
      "Captions for social posts you can copy straight out.",
      "Nothing sends by itself. You pick what goes out.",
    ],
    doFirst: "Read the week's suggestions. Take the one that fits and ignore the rest.",
    terms: ["outreach"],
  },

  "/portal/audience": {
    heading: "Your mailing list",
    oneLine: "Everyone who has given you their email, and which group they belong to.",
    whatYouSee: [
      "Past clients, people who enquired but never booked, and people who signed up from the website.",
      "Groups so you can write to the right people — past clients get a different email from strangers.",
    ],
    doFirst: "Nothing urgent here. It is the list the marketing page writes to.",
    terms: [],
  },

  "/portal/settings": {
    heading: "Settings",
    oneLine: "The rules the portal follows, and who can see what.",
    whatYouSee: [
      "How enquiries get scored, if you ever want to change what matters.",
      "Whether your assistant can see money figures. It is off unless you turn it on.",
      "A button to reset the demo back to the start, which is useful before showing somebody.",
    ],
    doFirst: "Leave it alone until something annoys you. Then change that one thing.",
    terms: ["band", "score", "demoData"],
    roles: ["owner"],
  },

  /* ── The outbound engine ───────────────────────────────────────────── */

  "/portal/briefing": {
    heading: "Monday briefing",
    oneLine: "What to do this week, picked by what is actually behind rather than what is newest.",
    whatYouSee: [
      "One big box at the top. That is the most important thing this week, and the portal chooses it, not you.",
      "If anything is late, late wins. New finds only go to the top when nothing is outstanding.",
      "Underneath: overdue calls with phone numbers, letters written but not sent, and empty Saturdays coming up.",
    ],
    doFirst: "Do the big box. If it says you have four overdue calls, make the four calls.",
    terms: ["actionBy", "primeDate", "draftApprovedSent", "prospect"],
  },

  "/portal/prospects": {
    heading: "Prospects",
    oneLine: "Businesses worth calling, with the call already written out for you.",
    whatYouSee: [
      "Cards sorted by how urgent they are. Call this week is the top group.",
      "Open any card and you get one question to open the call with, what to say, and what to avoid saying.",
      "Every card lists the web pages the facts came from, so you can say them out loud safely.",
      "Some cards say Do not pursue. Those are not mistakes — read the reason, it is usually useful.",
    ],
    doFirst:
      "Open the top card and read the opening question. It is written so you can use it almost word for word.",
    terms: ["prospect", "priority", "source", "actionBy"],
  },

  "/portal/prospects:assistant": {
    heading: "Your call list",
    oneLine: "Who to ring, and what to say when they answer.",
    whatYouSee: [
      "The top group is who to call this week.",
      "Open a card and you get the one question to start with, plus what not to say. Read the Before you dial box every time.",
      "The sources at the bottom are where each fact came from, with the date. Nothing on the card is a guess.",
    ],
    doFirst: "Open the top card, read the opening question and the warnings, then dial.",
    terms: ["prospect", "priority", "source"],
  },

  "/portal/signals": {
    heading: "This week's finds",
    oneLine: "News the weekly search turned up. You decide what is worth chasing.",
    whatYouSee: [
      "One row per story, with the reason it caught the system's attention.",
      "Two buttons: keep it, which turns it into a prospect to research, or drop it.",
      "Dropping something asks you why in a few words. That is how the search gets better at this.",
    ],
    doFirst:
      "Go through the list once. Most of it will not be relevant, and that is normal — keeping two out of ten is a good week.",
    terms: ["signal", "sweep", "prospect"],
  },

  "/portal/venues": {
    heading: "Venues",
    oneLine: "Places that host events, and how to get on their caterer lists.",
    whatYouSee: [
      "The top group is venues with no kitchen of their own. Those have to bring a caterer in, so they are the best ones to go after.",
      "Next are venues that publish their caterer list, with the fee they charge a client for using someone not on it.",
      "At the bottom, venues that are closed to you. They are listed so nobody wastes a morning on them.",
    ],
    doFirst:
      "Start at the top. One name on one of these lists sends you work for years without you doing anything else.",
    terms: ["approvedList", "offListFee", "venueList"],
  },

  "/portal/outreach": {
    heading: "Letters and emails",
    oneLine: "Everything written to a prospect, and whether it has actually gone out.",
    whatYouSee: [
      "If anything is written and unsent, that is the first thing on the page, with how long it has been waiting.",
      "Each letter can be read in full here. Nothing is hidden or shortened.",
      "A Print link on each one, because a letter sometimes wants to be a letter.",
    ],
    doFirst: "Read what is waiting and send it. A written letter that never goes is worth nothing.",
    terms: ["outreach", "draftApprovedSent", "prospect"],
  },

  "/portal/brain": {
    heading: "Kitchen Brain",
    oneLine: "The facts about your business that everything else here is built on.",
    whatYouSee: [
      "Your details, your service area, your certificates, your prices and your rules.",
      "Anything in orange saying NOT CONFIRMED is a blank we need from you.",
      "The five orange ones under Credentials are the important ones. Until they are filled in, no venue application can go out.",
    ],
    doFirst:
      "Fill in the five under Credentials: your insurance limit, your food-safety certificate, your business licence, and whether you are registered with the state. Everything else can wait.",
    terms: ["brain", "approvedList"],
    roles: ["owner"],
  },

  "/portal/sweeps": {
    heading: "Search history",
    oneLine: "What the weekly search checked, what it found, and what it could not confirm.",
    whatYouSee: [
      "Each week's search, newest first, with everything it looked at.",
      "A Corrections section listing anything we tried to check and could not.",
      "Those are deliberately visible. A system that hides what it got wrong is one you should not trust.",
    ],
    doFirst:
      "Look at the open questions at the top. The first one needs one phone call and could be worth more than everything else here.",
    terms: ["sweep", "source"],
    roles: ["owner"],
  },
};

/** Looks up a guide for a route, preferring the role-specific variant. */
export function guideFor(route: string, role: StaffRole): PageGuide | undefined {
  return PAGE_GUIDES[`${route}:${role}`] ?? PAGE_GUIDES[route];
}

/* ══════════════════════════ The tour ════════════════════════════════════ */

export interface TourStep {
  /** Short title. */
  title: string;
  /** Two or three sentences. Plain. */
  body: string;
  /** Where this step lives, so the tour can offer a link to it. */
  href?: string;
  /** Link text, when href is set. */
  linkLabel?: string;
}

/**
 * A guided walk through the portal, role-aware.
 *
 * Deliberately short. Eight steps the chef will finish beats twenty he abandons,
 * and the per-page panels carry the detail anyway.
 */
export const OWNER_TOUR: TourStep[] = [
  {
    title: "This is your office",
    body:
      "Everything about the business lives here: who has asked about an event, what you have agreed to cook, who is worth calling, and what the money looks like. Nothing in here is visible to the public.",
  },
  {
    title: "The tabs are down the left",
    body:
      "Seven or eight of them. You will mostly use three. On a phone they hide behind the Menu button at the top, and the rest of the screen is the same.",
  },
  {
    title: "Start with the dashboard",
    body:
      "The box at the top of it is the only part you have to read. It lists what needs you, most urgent first. If it is empty, nothing is on fire.",
    href: "/portal",
    linkLabel: "Open the dashboard",
  },
  {
    title: "Enquiries come in on their own",
    body:
      "When someone fills in the form on your website it appears under Pipeline with a letter on it — A, B, C or D — for how well they match the work you want. A and B are worth your time. C and D get a polite reply without you lifting a finger.",
    href: "/portal/leads",
    linkLabel: "See the pipeline",
  },
  {
    title: "Prospects are the other direction",
    body:
      "These are businesses that have not contacted you — a venue, a company, a charity — that we found and think are worth a call. Each one comes with a question to open with and a warning about what not to say.",
    href: "/portal/prospects",
    linkLabel: "See the prospects",
  },
  {
    title: "Venues are the best of them",
    body:
      "A venue keeps a list of caterers it is happy to have in its building. Get on one and it sends you work for years. Most venues charge a client five or six hundred dollars for using a chef who is not on the list, and that is the whole reason this is worth doing.",
    href: "/portal/venues",
    linkLabel: "See the venues",
  },
  {
    title: "The Monday briefing tells you what to do",
    body:
      "One box at the top, chosen by what is actually behind rather than what is newest. If something is late, late wins. Do that box and you have done the week's most useful thing.",
    href: "/portal/briefing",
    linkLabel: "Open the briefing",
  },
  {
    title: "One thing we need from you",
    body:
      "The Kitchen Brain page has five orange NOT CONFIRMED labels on it: your insurance limit, your food-safety certificate, your business licence, and whether you are registered with the state. Venues ask for all of these, so nothing can go out until they are filled in.",
    href: "/portal/brain",
    linkLabel: "Open the Kitchen Brain",
  },
];

export const ASSISTANT_TOUR: TourStep[] = [
  {
    title: "This is your desk",
    body:
      "Everything waiting on you is here. The top of each page is the urgent part; the rest is reference. You will not see money figures unless the chef turns that on.",
  },
  {
    title: "The tabs are down the left",
    body:
      "On a phone they hide behind the Menu button at the top. Everything else looks the same.",
  },
  {
    title: "Work from the top of your desk",
    body:
      "The jobs at the top are the ones that are late or nearly late. Do those before anything new, however interesting the new thing looks.",
    href: "/portal",
    linkLabel: "Open my desk",
  },
  {
    title: "Enquiries arrive by themselves",
    body:
      "Someone fills in the website form and it appears under Enquiries with a letter on it. A and B need a person. C and D have already had a polite reply.",
    href: "/portal/leads",
    linkLabel: "See the enquiries",
  },
  {
    title: "The call list has the words written for you",
    body:
      "Open any prospect and you get one question to start the call with, what to say, and a Before you dial box telling you what to avoid. Read that box every time — it is there because one wrong sentence loses the call.",
    href: "/portal/prospects",
    linkLabel: "See the call list",
  },
  {
    title: "Letters need reading before they go",
    body:
      "Everything written to a prospect sits under Outreach as a draft first. Read it, approve it, then send it. Nothing leaves in the chef's name without a person reading it.",
    href: "/portal/outreach",
    linkLabel: "See the letters",
  },
  {
    title: "Messages are the one to keep on top of",
    body:
      "Clients write in about their events and the reply they get appears on their own private page. A same-day answer is most of why people book him over someone else.",
    href: "/portal/messages",
    linkLabel: "Open messages",
  },
];

export function tourFor(role: StaffRole): TourStep[] {
  return role === "owner" ? OWNER_TOUR : ASSISTANT_TOUR;
}
