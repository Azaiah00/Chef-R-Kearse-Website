/**
 * OUTBOUND LEAD ENGINE — SEED
 *
 * This is the research from sweep S1, retrieved 30 September 2026, as data.
 *
 * READ THIS BEFORE EDITING. Every URL, figure and quoted policy in this file was
 * retrieved and verified on that date. Nothing here may be added, adjusted or
 * "improved" without re-checking the source, because the whole engine's value
 * rests on a caller being able to repeat what is on a prospect card without
 * being corrected.
 *
 * The specific rules:
 *   - Only five phone numbers appear anywhere in this file. They are listed in
 *     VERIFIED_PHONES below. Any other number means something was invented.
 *   - Only two off-list fee figures exist: 500 and 600. Any other venue carrying
 *     a fee means it was invented.
 *   - Every SourceLink note says what the source establishes AND what it does
 *     not. A note that only says what was found is half-written.
 *   - Every KitchenBrain credential field is null. All five are unconfirmed and
 *     all five block the venue applications.
 *
 * Each exported function returns a fresh value on every call, so the store's
 * reset can restore clean state without sharing mutable structure.
 */

import { ORG_ID } from "./types";
import type {
  Correction,
  KitchenBrain,
  OutreachRecord,
  Prospect,
  ProspectNote,
  Signal,
  SourceLink,
  Sweep,
  VenueRecord,
} from "./lead-types";
import { scoreProspect, type ProspectScoreInput } from "./prospect-scoring";
import { APPROACHES } from "./lead-approaches";

/** Retrieval date for every source in sweep S1. */
const R1 = "2026-09-30";

/**
 * The only phone numbers the research verified. The seed-integrity test asserts
 * that nothing outside this list appears in the file.
 */
export const VERIFIED_PHONES = [
  "(804) 939-9246", // his own — CONTEXT.md
  "(844) 532-7724", // his toll free — CONTEXT.md
  "(804) 213-4577", // Virginia ABC License Records Management
  "804.864.1466", // Science Museum of Virginia Special Events
  "(804) 261-6211", // Cultural Arts Center at Glen Allen rentals
] as const;

/**
 * His travel radius is NOT confirmed, so the scorer falls back to its documented
 * assumption. Passed explicitly here so the seed and the Brain cannot disagree.
 */
const TRAVEL_RADIUS: number | null = null;

/* ══════════════════════════ Sweeps ══════════════════════════════════════ */

function s1Corrections(): Correction[] {
  return [
    {
      subject: "Virginia ABC banquet licence register",
      what:
        "Could not establish whether banquet and special-event licences appear in the public licensee search or the downloadable XLS, or whether the records carry the event date and location. The downloadable file is most likely the roughly 20,000 permanent retail licensees rather than the 28,000 banquet licences. Resolve by calling Virginia ABC License Records Management on (804) 213-4577, then by Virginia FOIA request under Va. Code 2.2-3700 et seq. if refused. This is the highest-value open question in the sweep: if the register is obtainable it is not a signal that precedes catering demand, it is the demand itself.",
      resolvedISO: null,
    },
    {
      subject: "Washington Business Journal and Richmond Times-Dispatch",
      what:
        "Both block automated retrieval, so no RSS or email-alert URL could be confirmed. Both publications exist and cover this market. Someone needs to open them in a browser before any feed URL is published in a client deliverable.",
      resolvedISO: null,
    },
    {
      subject:
        "Here Comes The Guide BYO-catering indexes, and the PartySlate, Northern Virginia Chamber and DC Chamber directories",
      what:
        "All render client-side and returned no content to automated retrieval. The BYO-catering indexes are worth a manual browse — a venue with no production kitchen must use outside catering, which is the strongest venue category there is. Do not plan automation against any of them.",
      resolvedISO: null,
    },
    {
      subject: "Richmond BizSense subscription price",
      what:
        "The subscribe page shows $45 per month and $145 per year alongside copy reading 'Save 50% with annual billing'. Those three figures do not reconcile. Confirm the current price before paying.",
      resolvedISO: null,
    },
  ];
}

export function sweepSeed(): Sweep[] {
  return [
    {
      run: 1,
      label: "S1",
      iso: R1,
      weekOf: "2026-09-28",
      sourcesSwept: [
        "Richmond BizSense — RSS feed confirmed live and returning items; the Pro tier gates New Licenses and Breaking Ground (building permits), which are the two sharpest products",
        "Virginia Business, Bisnow (national feed only — the DC-scoped feed returns 404) and ThePhilVA — all three RSS feeds confirmed returning items",
        "Greater Washington Board of Trade — events JSON and iCal both confirmed returning live data; the only chamber in this sweep with a real API",
        "VCU — Localist JSON, RSS and iCal all confirmed; a verified listing put a VCU event off-campus at Hardywood Park Craft Brewery, which proves departments book outside",
        "ChamberRVA, Hanover, Chesterfield and Virginia Chamber calendars — public and readable; Hanover publishes ribbon cuttings, the sharpest single signal found in the sweep",
        "Greater Richmond Convention Center calendar — names the host organisation months ahead; the building itself runs exclusive in-house food and beverage",
        "Competitor venue maps — Groovin' Gourmets (37 venues) and Garnish (about 40) both publish their own preferred-venue lists; 14 venues appear on both, which is the evidence those lists are open",
        "Cultural Arts Center at Glen Allen and Maymont — both publish their approved-caterer lists and both publish an off-list fee charged to the client",
        "IRS Form 990 Schedule G Part II line 7 is labelled 'Food and beverages' — a nonprofit's own disclosed catering spend; monthly XML bulk downloads confirmed available 2019 through August 2026",
        "Virginia ABC — confirmed over 28,000 banquet and special-event licences granted annually, and that the Banquet application captures event date, times and location address. Whether that register is publicly obtainable is UNRESOLVED",
        "Marriage licence records — checked in Virginia, DC and Maryland and ruled out as a lead source; closed by statute in Virginia under Va. Code 32.1-267(F)",
      ],
      corrections: s1Corrections(),
    },
  ];
}

/* ══════════════════════════ Venues ══════════════════════════════════════ */

export function venueSeed(): VenueRecord[] {
  return [
    {
      id: "v_glenallen",
      orgId: ORG_ID,
      name: "Cultural Arts Center at Glen Allen",
      city: "Glen Allen",
      state: "VA",
      url: "https://www.artsglenallen.com/facility-information/approved-caterers",
      listType: "published-open",
      caterersNamed: [
        "A Sharper Palate",
        "Anant",
        "Anokha",
        "Apple Spice Junction",
        "DeFazio's Catering",
        "Garnish Catering",
        "Groovin' Gourmets",
        "Hacienda Catering",
        "Lehja",
        "Mosaic",
        "Ms. Girlee's Catering",
        "Natalie's Taste of Lebanon",
        "Q Barbeque",
      ],
      offListFee: 500,
      offListFeeNote:
        "Policy as published: \"The following caterers are approved to cater events at The Center (Use of other caterers, or self-catering, will require a $500 refundable deposit)\". The fee falls on the client, not on us — which is the whole pitch for getting on the list.",
      ourStatus: "not-applied",
      appliedISO: null,
      requirements: [
        "Approval criteria are NOT published on the page — ask directly",
      ],
      diffs: [],
      sources: [
        {
          label: "Cultural Arts Center at Glen Allen — approved caterers",
          url: "https://www.artsglenallen.com/facility-information/approved-caterers",
          kind: "organization",
          retrievedISO: R1,
          note:
            "Establishes the full 13-name approved list and the $500 refundable deposit charged for an off-list caterer. Names Christiana Roberts as Events Sales Manager, with rentals@artsglenallen.com and (804) 261-6211. The approval criteria — insurance, licensing, certification, any fee to join — are NOT published and are not claimed here.",
        },
      ],
    },

    {
      id: "v_maymont",
      orgId: ORG_ID,
      name: "Maymont",
      city: "Richmond",
      state: "VA",
      url: "https://maymont.org/rentals/catering/",
      listType: "published-open",
      caterersNamed: [
        "Mosaic Catering + Events",
        "Groovin' Gourmets",
        "Deep Run Roadhouse",
        "A Sharper Palate Catering Company",
        "Garnish RVA",
        "Timber Pizza Co.",
      ],
      offListFee: 600,
      offListFeeNote:
        "Policy as published: \"Working with other outside caterers is discouraged and will incur an outside catering fee of $600, plus additional requirements\". Maymont also keeps a supplemental list of pre-screened Approved Caterers at a discounted fee — that second tier is the realistic first rung and should be asked for by name.",
      ourStatus: "not-applied",
      appliedISO: null,
      requirements: [
        '"plus additional requirements" — not itemised on the page',
      ],
      diffs: [],
      sources: [
        {
          label: "Maymont — catering",
          url: "https://maymont.org/rentals/catering/",
          kind: "organization",
          retrievedISO: R1,
          note:
            "Establishes the six named Premiere Caterers, the $600 outside-catering fee, and the existence of a discounted supplemental list of pre-screened Approved Caterers. No application mechanism is published for either tier, and the \"additional requirements\" are not itemised — neither is claimed here.",
        },
      ],
    },

    {
      id: "v_smv",
      orgId: ORG_ID,
      name: "Science Museum of Virginia",
      city: "Richmond",
      state: "VA",
      url: "https://smv.org/visit/specialevents/",
      listType: "unpublished-open",
      caterersNamed: [],
      offListFee: null,
      offListFeeNote: null,
      ourStatus: "not-applied",
      appliedISO: null,
      requirements: ["Not published — the list itself is not public"],
      diffs: [],
      sources: [
        {
          label: "Science Museum of Virginia — special events",
          url: "https://smv.org/visit/specialevents/",
          kind: "organization",
          retrievedISO: R1,
          note:
            "Establishes that a preferred-caterer list exists — \"our list of preferred caterers can accommodate your every need\" — and gives the Special Events Team number, 804.864.1466. The caterer NAMES are not published on the page and are not claimed here. The museum also appears on both competitor venue maps, which is independent evidence the list is open.",
        },
      ],
    },

    {
      id: "v_mainst",
      orgId: ORG_ID,
      name: "Main Street Station",
      city: "Richmond",
      state: "VA",
      url: "https://www.trolleyhouseva.com/groovin-gourmets/venue-partners/richmond",
      listType: "unpublished-open",
      caterersNamed: [],
      offListFee: null,
      offListFeeNote: null,
      ourStatus: "not-applied",
      appliedISO: null,
      requirements: ["Unknown — the venue's own catering policy was not retrieved"],
      diffs: [],
      sources: [
        {
          label: "Groovin' Gourmets — Richmond venue partners",
          url: "https://www.trolleyhouseva.com/groovin-gourmets/venue-partners/richmond",
          kind: "directory",
          retrievedISO: R1,
          note:
            "A competitor's own page, describing these as \"venues that have included us on their preferred caterer lists\". Main Street Station appears here AND on Garnish's published preferred-caterer list, which together establish that it runs an open multi-caterer list. The venue's own catering policy, its full caterer list and any off-list fee were NOT retrieved and are not claimed here.",
        },
      ],
    },

    {
      id: "v_weinstein",
      orgId: ORG_ID,
      name: "Weinstein Jewish Community Center",
      city: "Richmond",
      state: "VA",
      url: "https://garnishrva.com/venues/",
      listType: "unpublished-open",
      caterersNamed: [],
      offListFee: null,
      offListFeeNote: null,
      ourStatus: "not-applied",
      appliedISO: null,
      requirements: [
        "Unknown — ask about kosher or dietary requirements before proposing anything",
      ],
      diffs: [],
      sources: [
        {
          label: "Garnish Catering — venues, under the heading VENUE PREFERRED CATERER",
          url: "https://garnishrva.com/venues/",
          kind: "directory",
          retrievedISO: R1,
          note:
            "A competitor's own page listing the venues that name them as a preferred caterer. The Weinstein JCC appears here AND on Groovin' Gourmets' venue map, so it demonstrably hosts outside-catered events. Separately, the JCC runs its own annual fundraising gala at https://weinsteinjcc.org/gala/ — that URL is confirmed to exist, but its date, venue and catering arrangements were NOT verified and must be confirmed before any approach.",
        },
      ],
    },

    {
      id: "v_pgparks",
      orgId: ORG_ID,
      name: "Prince George's County Parks — historic venues",
      city: "Upper Marlboro",
      state: "MD",
      url: "https://www.pgparks.com/facilities-rentals/historic-site-rentals",
      listType: "byo-required",
      caterersNamed: [],
      offListFee: null,
      offListFeeNote: null,
      ourStatus: "not-applied",
      appliedISO: null,
      requirements: [
        "No approved-caterer list is published — call each site individually",
      ],
      diffs: [],
      sources: [
        {
          label: "Prince George's County Parks — historic site rentals",
          url: "https://www.pgparks.com/facilities-rentals/historic-site-rentals",
          kind: "organization",
          retrievedISO: R1,
          note:
            "Establishes five venues — Billingsley House, Newton White Mansion, Prince George's Ballroom, Oxon Hill Manor (the page states it is temporarily closed) and Snow Hill Manor — and that each \"has warming kitchens\". A warming kitchen with no production kitchen is the definitive signal that outside catering is required rather than merely permitted. No caterer list, catering policy or fee is published on the page, and the county's rental-policies page carries no catering language either.",
        },
      ],
    },

    {
      id: "v_dumbarton",
      orgId: ORG_ID,
      name: "Dumbarton House",
      city: "Washington",
      state: "DC",
      url: "https://dumbartonhouse.org/book/preferred-professionals/",
      listType: "byo-required",
      caterersNamed: [],
      offListFee: null,
      offListFeeNote: null,
      ourStatus: "not-applied",
      appliedISO: null,
      requirements: [
        "DC business license",
        "Proof of sufficient insurance",
        "Review Dumbarton House rules and regulations",
        "On-site appointment with the Rental Events Coordinator before the event",
      ],
      diffs: [],
      sources: [
        {
          label: "Dumbarton House — preferred professionals",
          url: "https://dumbartonhouse.org/book/preferred-professionals/",
          kind: "organization",
          retrievedISO: R1,
          note:
            "Establishes that outside catering is permitted with clear, meetable requirements, quoted verbatim in this record's requirements list, and that the venue highly recommends but does not mandate its Preferred Vendors List. The caterer names on that list did not render and are not claimed here. The most open door found in the DC market — but note the DC business licence requirement, which he may not hold.",
        },
      ],
    },

    {
      id: "v_lewisginter",
      orgId: ORG_ID,
      name: "Lewis Ginter Botanical Garden",
      city: "Richmond",
      state: "VA",
      url: "https://www.lewisginter.org/visit/facility-rental/catering/",
      listType: "in-house-exclusive",
      caterersNamed: ["Restaurant Associates"],
      offListFee: null,
      offListFeeNote: null,
      ourStatus: "declined",
      appliedISO: null,
      requirements: ["Closed — an exclusive partner holds this venue"],
      diffs: [],
      sources: [
        {
          label: "Lewis Ginter Botanical Garden — catering",
          url: "https://www.lewisginter.org/visit/facility-rental/catering/",
          kind: "organization",
          retrievedISO: R1,
          note:
            "Establishes an exclusive catering partnership: \"Lewis Ginter Botanical Garden offers catered events and on-site restaurants through our partnership with Restaurant Associates\". Recorded as closed so nobody researches it twice. Whether the arrangement has an expiry or any exception is NOT stated on the page.",
        },
      ],
    },
  ];
}

/* ══════════════════════════ Prospects ═══════════════════════════════════ */

interface ProspectDraft {
  id: string;
  ref: string;
  name: string;
  category: Prospect["category"];
  city: string;
  state: string;
  phone: string | null;
  website: string | null;
  contactName: string | null;
  contactRole: string | null;
  whyItFits: string;
  pitch: string;
  openingQuestion: string;
  caution: string | null;
  suggestedAction: string;
  targetDates: string[];
  status: Prospect["status"];
  nextActionBy: string | null;
  owner: Prospect["owner"];
  scoreInput: ProspectScoreInput;
  sources: SourceLink[];
  notes?: ProspectNote[];
}

/**
 * The scoring input behind every seeded prospect, keyed by id.
 *
 * Populated by build() as a side effect of constructing each prospect, and
 * exported so the store can RE-score a prospect when a source is attached
 * without having to guess at the other eight factors. Guessing them would mean
 * attaching a citation silently changed a prospect's distance or brand fit,
 * which is a worse bug than the one the cap exists to prevent.
 */
const SEED_SCORE_INPUTS: Record<string, ProspectScoreInput> = {};

/**
 * Scored at seed time rather than hardcoded, so the breakdown is always
 * consistent with the weights in prospect-scoring.ts. Change a weight and every
 * seeded prospect re-scores on the next boot.
 */
function build(d: ProspectDraft): Prospect {
  SEED_SCORE_INPUTS[d.id] = { ...d.scoreInput };
  const { score, priority } = scoreProspect(d.scoreInput, TRAVEL_RADIUS);
  return {
    id: d.id,
    orgId: ORG_ID,
    ref: d.ref,
    name: d.name,
    category: d.category,
    city: d.city,
    state: d.state,
    phone: d.phone,
    website: d.website,
    contactName: d.contactName,
    contactRole: d.contactRole,
    score,
    priority,
    whyItFits: d.whyItFits,
    pitch: d.pitch,
    openingQuestion: d.openingQuestion,
    caution: d.caution,
    suggestedAction: d.suggestedAction,
    // The same approach written for every channel. Looked up rather than carried
    // on the draft, so the scripts live in one readable file of their own.
    approaches: APPROACHES[d.id] ?? [],
    targetDates: d.targetDates,
    // Null throughout the seed: he has not confirmed price bands, so any figure
    // here would be a number the engine invented about his own business.
    estValue: null,
    status: d.status,
    nextActionBy: d.nextActionBy,
    owner: d.owner,
    sourcedBy: "agent",
    sourcedISO: R1,
    addedISO: R1,
    sweepRun: 1,
    sources: d.sources,
    notes: d.notes ?? [],
  };
}

/**
 * The scoring inputs for the seeded prospects.
 *
 * Call this AFTER prospectSeed() — build() populates the map, so calling it
 * first returns an empty object. The store does exactly that in freshLeadDb().
 */
export function prospectScoreInputs(): Record<string, ProspectScoreInput> {
  // Shallow copy per entry so a caller mutating one cannot reach back into the
  // seed module and change what the next reset produces.
  const out: Record<string, ProspectScoreInput> = {};
  for (const [id, input] of Object.entries(SEED_SCORE_INPUTS)) out[id] = { ...input };
  return out;
}

export function prospectSeed(): Prospect[] {
  return [
    build({
      id: "p_glenallen",
      ref: "P-0001",
      name: "Cultural Arts Center at Glen Allen — approved caterer list",
      category: "venue",
      city: "Glen Allen",
      state: "VA",
      phone: "(804) 261-6211",
      website: "https://www.artsglenallen.com/facility-information/approved-caterers",
      contactName: "Christiana Roberts",
      contactRole: "Events Sales Manager",
      whyItFits:
        "A venue list is the only asset in this engine that keeps paying after the work stops: one placement earns a share of every couple and every company that books the room, permanently, with no further marketing spend. This one is unusually approachable because the Center publishes both its full thirteen-name list and the exact fee it charges a client for going off-list, which means the argument is already written and costs nothing to verify.",
      pitch:
        "Thirteen caterers are already approved here, so there is no displacement pitch to make and no reason to make one. The argument is simpler and it is about their client rather than about us: a couple who wants a chef who is not on the list has to hand the Center a five-hundred-dollar deposit for the privilege, and some of them look at that number and book a different room. Adding a name to the list removes a charge their own guest is paying.",
      openingQuestion:
        "Your approved list already has thirteen names on it, so I'm not asking to replace anyone — I'm asking what it takes to get on it. Right now a couple who wants me is handing you a five-hundred-dollar deposit for the privilege, and I suspect that costs you a few bookings a year. What do you need to see from a caterer before you'll add one?",
      caution:
        "The approval criteria are not published anywhere, so do not turn up assuming insurance and ServSafe are the whole list — ask, and take notes, because whatever they say is probably close to what Maymont and the Science Museum want too. And do not say a word against any of the thirteen: four of them also sit on Maymont's list, this is a small market, and the Center's staff will have worked with all of them.",
      suggestedAction:
        "Call Christiana Roberts on (804) 261-6211 and ask one question: what does a caterer have to document to be added to the approved list. Do not pitch the food on this call and do not send a menu. The goal is to walk away with a written list of requirements, because that list is also the checklist for every other venue application in this engine. Before dialling, confirm his liability insurance limit and ServSafe status — both are currently unconfirmed in the Kitchen Brain, and being asked for them and not having an answer is the one way to lose this call.",
      targetDates: [],
      status: "new",
      nextActionBy: null,
      owner: "agent",
      scoreInput: {
        dateFit: "unknown",
        freshness: "this-month",
        access: "named-decision-maker",
        spendEvidence: "strong-proxy",
        distanceMiles: 14,
        repeatability: "recurring-list",
        incumbency: "weak-incumbent",
        brandFit: "flagship",
        effort: "low",
        sourceCount: 1,
      },
      sources: [
        {
          label: "Cultural Arts Center at Glen Allen — approved caterers",
          url: "https://www.artsglenallen.com/facility-information/approved-caterers",
          kind: "organization",
          retrievedISO: R1,
          note:
            "Establishes the thirteen approved caterers, the $500 refundable deposit for an off-list caterer, and Christiana Roberts as Events Sales Manager with (804) 261-6211. The approval criteria are NOT published and are not claimed here — they are the object of the call.",
        },
      ],
    }),

    build({
      id: "p_maymont",
      ref: "P-0002",
      name: "Maymont — supplemental Approved Caterers list",
      category: "venue",
      city: "Richmond",
      state: "VA",
      phone: null,
      website: "https://maymont.org/rentals/catering/",
      contactName: null,
      contactRole: null,
      whyItFits:
        "Maymont is the strongest venue name in Richmond that still runs an open list, and it has a two-tier structure that most venues do not: six Premiere Caterers, and behind them a supplemental list of pre-screened Approved Caterers at a discounted off-list fee. That second tier is a real door rather than a closed one, and nobody gets onto the first tier without being on the second first.",
      pitch:
        "Their own page says working with an outside caterer is discouraged and costs the client six hundred dollars. That is not an objection to argue with, it is a structure to join — and they have already built the rung to join at. The ask is to be pre-screened onto the supplemental Approved Caterers list, which lowers that fee for their guests and costs Maymont nothing but the screening.",
      openingQuestion:
        "Your page mentions a supplemental list of Approved Caterers who've been pre-screened, separate from the six Premiere Caterers. I'd like to be on that one. What does the pre-screening involve, and who handles it?",
      caution:
        "Do not aim at the Premiere tier on the first call — asking to join six named caterers at a venue like Maymont, cold, reads as not understanding how this works. And do not argue with \"working with other outside caterers is discouraged\". That is their language about protecting their room, it is reasonable, and the whole approach is to get inside the structure rather than to dispute it. The supplemental list is not described in any detail on the page, so go in asking rather than assuming you know what it is.",
      suggestedAction:
        "Call and ask specifically for the supplemental pre-screened Approved Caterers list by name — not for \"the caterer list\", which will get you the six Premiere names and a polite no. Capture the screening requirements in writing. Same gating item as Glen Allen: confirm his insurance limit and ServSafe status first, because a venue of Maymont's size will ask on the call rather than after it.",
      targetDates: [],
      status: "new",
      nextActionBy: null,
      owner: "agent",
      scoreInput: {
        dateFit: "unknown",
        freshness: "this-month",
        access: "department",
        spendEvidence: "strong-proxy",
        distanceMiles: 6,
        repeatability: "recurring-list",
        incumbency: "strong-incumbent",
        brandFit: "flagship",
        effort: "medium",
        sourceCount: 1,
      },
      sources: [
        {
          label: "Maymont — catering",
          url: "https://maymont.org/rentals/catering/",
          kind: "organization",
          retrievedISO: R1,
          note:
            "Establishes the six Premiere Caterers, the $600 outside-catering fee, and that a discounted supplemental list of pre-screened Approved Caterers exists. No contact name, no phone number and no application process are published for either tier — none is claimed here.",
        },
      ],
    }),

    build({
      id: "p_hanover",
      ref: "P-0003",
      name: "Hanover Chamber of Commerce — ribbon-cutting programme",
      category: "association",
      city: "Ashland",
      state: "VA",
      phone: null,
      website: "https://business.hanoverchamberva.com/event-calendar",
      contactName: null,
      contactRole: null,
      whyItFits:
        "This is the warmest repeatable signal the sweep found, and it is a channel rather than a single account. A business cutting a ribbon this month needs food this month, has already approved a budget for the opening, and has never hired a caterer before — so there is no incumbent to displace and no procurement process to survive. The chamber publishes the openings on a public calendar weeks ahead, which turns a cold market into a dated list.",
      pitch:
        "Every new member that opens a location holds an event, and most of them order trays from a sandwich shop because nobody told them there was another option. A standing relationship with the chamber — a chef their new members can be pointed at — costs the chamber nothing and makes their openings look better than the ones down the road.",
      openingQuestion:
        "You've got two ribbon cuttings on the calendar in the next six weeks. When a new member opens, who tells them they need food for it — and would it help them if there was a chef on your list who already knew how your openings run?",
      caution:
        "Whether the chamber will make an introduction at all is not established — that is the thing the call is for, not a finding. Chamber membership dues are not published on their site either, so do not commit to joining on the call. And the two named openings are a reason to call this week, not something to mention as though you have been invited: find out how the programme works before attaching yourself to a specific business's event.",
      suggestedAction:
        "Call the chamber and ask how new-member openings are supported, then ask to be the chef they point members at. Separately, monitor the public events calendar weekly — a ribbon cutting appearing on it is an actionable signal on its own even without the chamber's help, because the business name and the date are both public. Do not cold-approach the two named businesses before speaking to the chamber: going round them is how a chamber relationship dies before it starts.",
      targetDates: [],
      status: "new",
      nextActionBy: null,
      owner: "agent",
      scoreInput: {
        dateFit: "unknown",
        freshness: "this-month",
        access: "department",
        spendEvidence: "weak-proxy",
        distanceMiles: 18,
        repeatability: "recurring-events",
        incumbency: "open-lane",
        brandFit: "good",
        effort: "low",
        sourceCount: 2,
      },
      sources: [
        {
          label: "Hanover Chamber of Commerce — event calendar",
          url: "https://business.hanoverchamberva.com/event-calendar",
          kind: "directory",
          retrievedISO: R1,
          note:
            "Establishes a public, forward-looking events calendar that includes ribbon cuttings, with two verified upcoming entries: Advance Auto Parts on 29 October 2026 and Uniquely Yours Dog Care on 7 November 2026. Whether the chamber will introduce a caterer to a new member is NOT established and is the object of the call. No iCal or RSS feed is exposed, so this needs a weekly human read or a scrape.",
        },
        {
          label: "Hanover Chamber of Commerce — active member directory",
          url: "https://business.hanoverchamberva.com/active-member-directory",
          kind: "directory",
          retrievedISO: R1,
          note:
            "Establishes a public, category-filterable member directory on the GrowthZone platform, including a Food/Beverage category. Membership dues are NOT published on the page and are not claimed here.",
        },
      ],
    }),

    build({
      id: "p_vsae",
      ref: "P-0004",
      name: "Virginia Society of Association Executives",
      category: "association",
      city: "Richmond",
      state: "VA",
      phone: null,
      website: "https://www.vsae.org/calendar",
      contactName: null,
      contactRole: null,
      whyItFits:
        "VSAE's members are the people who buy meeting catering for a living, and the organisation is headquartered in Richmond. That makes it a concentration of buyers rather than a room full of peers — which is the opposite of most association memberships, where a caterer ends up networking with other caterers.",
      pitch:
        "Association executives book food several times a year, every year, for boards and committees and annual meetings, and they are the segment most likely to need an outside caterer because they rarely own a venue. Being a known quantity inside VSAE is worth more than being listed in a directory, because these buyers hire by reputation inside a small professional circle.",
      openingQuestion:
        "Most of your members are booking food for boards and committees several times a year. Do you have vendor members on the catering side, and if so what does that look like — is it a listing, or is it showing up at the events?",
      caution:
        "Vendor-membership eligibility and cost are both unverified — the partner-programme page exists but publishes no figures. Do not budget for this or promise him a number until VSAE confirms a caterer can join and at what price. The member directory PDF found in research is titled 2023–2024, so treat any names in it as probably stale.",
      suggestedAction:
        "Call VSAE and establish two things: whether a caterer can be a vendor member, and what it costs. If the answer is yes and the price is reasonable, the Awards Luncheon on 4 December is the event to attend — not to pitch, but to be the chef that twenty association executives have now met. Treat this as a six-month play rather than a this-month booking.",
      targetDates: [],
      status: "new",
      nextActionBy: null,
      owner: "assistant",
      scoreInput: {
        dateFit: "unknown",
        freshness: "this-quarter",
        access: "department",
        spendEvidence: "strong-proxy",
        distanceMiles: 7,
        repeatability: "recurring-events",
        incumbency: "weak-incumbent",
        brandFit: "good",
        effort: "medium",
        sourceCount: 1,
      },
      sources: [
        {
          label: "Virginia Society of Association Executives — calendar",
          url: "https://www.vsae.org/calendar",
          kind: "organization",
          retrievedISO: R1,
          note:
            "Establishes a public calendar of in-person Richmond events, including an Awards Luncheon and Silent Auction on 4 December 2026, and that VSAE is headquartered at 6800 Paragon Place, Richmond. Vendor-membership eligibility and cost are NOT published and are not claimed here. No iCal or RSS is exposed.",
        },
      ],
    }),

    build({
      id: "p_weinstein_gala",
      ref: "P-0005",
      name: "Weinstein JCC — annual fundraising gala",
      category: "nonprofit-gala",
      city: "Richmond",
      state: "VA",
      phone: null,
      website: "https://weinsteinjcc.org/gala/",
      contactName: null,
      contactRole: null,
      whyItFits:
        "The JCC appears on both competitor venue maps, which means it demonstrably hosts outside-catered events rather than running everything in-house — and it also runs its own annual gala. That combination is rare: it is both a venue worth being listed at and a client with a recurring event of its own.",
      pitch:
        "An annual gala is the single most repeatable event type there is — the date moves by a few weeks, the committee largely does not, and a caterer who does it well once tends to do it for years. And because the JCC already works with outside caterers at its venue, there is no argument to win about whether outside catering is possible here.",
      openingQuestion:
        "You've worked with outside caterers at the Center before, so you know how that goes. For the gala itself — who's been doing the food, and is that something you revisit each year or has it settled?",
      caution:
        "The gala page URL is confirmed to exist but its date, venue and catering arrangements were NOT verified. Confirm all three before calling: turning up with the wrong date is the fastest way to sound like someone working from a scraped list. Separately, ask about kosher and dietary requirements early rather than late — a JCC event may have requirements that change the whole proposal, and discovering that after quoting is worse than asking at the start.",
      suggestedAction:
        "Before any call: open the gala page, confirm this year's date, venue and whether a caterer is named. Then use the Form 990 route to find what the JCC discloses on Schedule G line 7 — their own food-and-beverage spend on their largest fundraising event — so the conversation about budget starts from their number rather than a guess. Only then call. This is a research-first prospect, not a dial-first one.",
      targetDates: [],
      status: "new",
      nextActionBy: null,
      owner: "assistant",
      scoreInput: {
        dateFit: "unknown",
        freshness: "this-quarter",
        access: "switchboard",
        spendEvidence: "weak-proxy",
        distanceMiles: 9,
        repeatability: "annual",
        incumbency: "weak-incumbent",
        brandFit: "flagship",
        effort: "medium",
        sourceCount: 1,
      },
      sources: [
        {
          label: "Garnish Catering — venues, under VENUE PREFERRED CATERER",
          url: "https://garnishrva.com/venues/",
          kind: "directory",
          retrievedISO: R1,
          note:
            "Establishes that the Weinstein JCC names at least one outside caterer as preferred, and it appears on Groovin' Gourmets' venue map as well. This establishes that the JCC hosts outside-catered events. It does NOT establish anything about the gala itself — the gala's date, venue, budget and current caterer are all unverified.",
        },
      ],
    }),

    build({
      id: "p_grcc",
      ref: "P-0006",
      name: "Greater Richmond Convention Center — host-organisation calendar",
      category: "institution",
      city: "Richmond",
      state: "VA",
      phone: null,
      website: "https://www.richmond-center.com/calendar-of-events",
      contactName: null,
      contactRole: null,
      whyItFits:
        "It does not fit as a venue, and that is the point of keeping the record. What it is worth is the calendar: a public, forward-looking list that names the host organisation months ahead — the Virginia Bankers Association, the Commonwealth Prayer Breakfast Committee, the Elegba Folklore Society. Every one of those brings a board dinner, a sponsor reception or a pre-conference off-site into Richmond, and those go to outside caterers.",
      pitch:
        "There is no pitch to the building. The pitch is to the associations on its calendar, and the calendar is how you find them twelve months out instead of two weeks out.",
      openingQuestion:
        "Not applicable — this record is a monthly research source, not a call. The opening question belongs to each association it surfaces.",
      caution:
        "Do not let this record drift into looking like a target. A convention centre of this size runs exclusive in-house food and beverage, and approaching it as a caterer wastes a call and marks him as someone who did not check.",
      suggestedAction:
        "DO NOT PURSUE AS A VENUE. Convention centres of this type run exclusive in-house food and beverage, so he will not cater inside the building and should not ask. The correct use of this record is as a monthly source of association names: read the calendar, take the host organisations, and pitch their off-site receptions and board dinners — the events that happen around a conference rather than inside it. Add any association that appears twice as its own prospect. This record exists to prove the engine will decline something and say why, rather than padding the board with everything it found.",
      targetDates: [],
      status: "new",
      nextActionBy: null,
      owner: "agent",
      scoreInput: {
        dateFit: "unknown",
        freshness: "this-quarter",
        access: "switchboard",
        spendEvidence: "weak-proxy",
        distanceMiles: 7,
        repeatability: "recurring-events",
        incumbency: "exclusive",
        brandFit: "neutral",
        effort: "low",
        sourceCount: 1,
      },
      sources: [
        {
          label: "Greater Richmond Convention Center — calendar of events",
          url: "https://www.richmond-center.com/calendar-of-events",
          kind: "organization",
          retrievedISO: R1,
          note:
            "Establishes a public forward calendar that names the host organisation alongside each event, with listings running months ahead — verified examples include the Commonwealth Prayer Breakfast Committee, the Virginia Bankers Association with the Virginia Chamber, and the Elegba Folklore Society. Per-event Google Calendar and ICS links exist but there is NO whole-calendar feed. That the building runs exclusive in-house food and beverage is the standard arrangement for convention centres of this type; the page itself does not state the catering policy, so that specific claim is an inference and is flagged as such.",
        },
      ],
    }),
  ];
}

/* ══════════════════════════ Signals ═════════════════════════════════════ */

/**
 * Four headlines verified live in the feeds on the sweep date. These are real
 * strings from real feeds, carried in so the triage queue demos with genuine
 * material rather than invented copy.
 */
export function signalSeed(): Signal[] {
  const base = { orgId: ORG_ID, triage: "new" as const, dismissReason: null, promotedToProspectId: null, sweepRun: 1 };
  return [
    {
      ...base,
      id: "sig_0001",
      source: "Richmond BizSense",
      title: "Grove Eye Care now open at Regency mall in Henrico",
      url: "https://richmondbizsense.com/",
      publishedISO: "2026-09-30",
      matchedRules: ["ribbon-cutting"],
    },
    {
      ...base,
      id: "sig_0002",
      source: "Richmond BizSense",
      title: "$51B bank to get its place on the Richmond skyline",
      url: "https://richmondbizsense.com/",
      publishedISO: "2026-09-30",
      matchedRules: ["office-move", "expansion"],
    },
    {
      ...base,
      id: "sig_0003",
      source: "Bisnow Washington DC",
      title: "Chipmaker Nvidia Leases Office Space In Downtown D.C.",
      url: "https://www.bisnow.com/washington-dc",
      publishedISO: "2026-09-30",
      matchedRules: ["office-move"],
    },
    {
      ...base,
      id: "sig_0004",
      source: "Greater Washington Board of Trade",
      title: "Executive Lunch: Building for Growth in the Greater Washington Region",
      url: "https://www.bot.org/events/",
      publishedISO: "2026-09-30",
      matchedRules: ["corporate-event"],
    },
  ];
}

/* ══════════════════════════ Outreach ════════════════════════════════════ */

/**
 * Two venue-list applications, both unsent.
 *
 * They ask what the venue needs in order to add a caterer. Neither quotes a
 * price, and neither asserts an insurance limit, a certification or an award,
 * because none of those is confirmed — each says instead that certificates
 * follow on request. That is both honest and, as it happens, the right sales
 * posture: the first contact is a question, not a brochure.
 */
export function outreachSeed(): OutreachRecord[] {
  return [
    {
      id: "out_0001",
      orgId: ORG_ID,
      prospectId: "p_glenallen",
      channel: "email",
      subject: "Joining the approved caterer list at The Center",
      body: `Hello,

I'm Chef R. Kearse, a private chef and caterer based in Richmond. I work across Richmond, Northern Virginia, DC and Maryland, and I've been cooking privately since 2018.

I'm writing about the approved caterer list at the Cultural Arts Center. I'm not asking to replace anyone on it — I'd like to know what it takes to be added to it.

The reason I'm asking is on your own page: a client who wants a caterer who isn't on the list has to leave a $500 deposit. I'd rather their choice of chef not cost them anything extra, and I'd rather your room not lose a booking over it.

So, plainly: what do you need to see from a caterer before you'll add one? I can supply current certificates of insurance and food-safety certification, references from recent events, and a sample menu, and I'm happy to come and walk the kitchen and the service spaces at whatever point in that process makes sense to you.

If there's a form, a fee or a screening process, please point me at it and I'll complete it properly.

Thank you for your time.

Chef R. Kearse
(804) 939-9246
chefrkearse@gmail.com`,
      status: "draft",
      draftedISO: R1,
      sentISO: null,
      responseISO: null,
      sentBy: null,
    },
    {
      id: "out_0002",
      orgId: ORG_ID,
      prospectId: "p_maymont",
      channel: "email",
      subject: "The supplemental Approved Caterers list",
      body: `Hello,

I'm Chef R. Kearse, a private chef and caterer based in Richmond, working across Richmond, Northern Virginia, DC and Maryland since 2018.

Your catering page mentions a supplemental list of Approved Caterers who have been pre-screened, alongside the six Premiere Caterers. I'd like to be considered for that supplemental list.

I understand the position the policy takes — an outside caterer who doesn't know the property is a risk to the room and to the event, and the $600 fee reflects that. I'd rather be screened properly than be an exception to a rule.

What does the pre-screening involve? I can provide current certificates of insurance and food-safety certification, references from recent events, and a full service plan covering load-in, timing, staffing and breakdown. I'd welcome the chance to walk the property with whoever manages this, so that if I'm ever working there it's not the first time I've seen the space.

If there's an application or a documentation checklist, please send it over.

Thank you for considering it.

Chef R. Kearse
(804) 939-9246
chefrkearse@gmail.com`,
      status: "draft",
      draftedISO: R1,
      sentISO: null,
      responseISO: null,
      sentBy: null,
    },
  ];
}

/* ══════════════════════════ The Kitchen Brain ═══════════════════════════ */

/**
 * Only verified facts from CONTEXT.md. Every credential and every commercial
 * term is null, because none has been confirmed — and the five credential nulls
 * are not an oversight, they are the finding: they block every venue application
 * in this engine, and the Brain page exists to say so in amber.
 */
export function brainSeed(): KitchenBrain {
  return {
    orgId: ORG_ID,
    legalName: "Chef R. Kearse",
    brandName: "Chef R. Kearse",
    phone: "(804) 939-9246",
    tollFree: "(844) 532-7724",
    email: "chefrkearse@gmail.com",
    baseCity: "Richmond",
    baseState: "VA",
    serviceAreas: ["Richmond VA", "Northern Virginia", "Washington DC", "Maryland"],
    foundedYear: 2018,

    liabilityInsuranceLimit: null,
    insuranceCarrier: null,
    servSafeHolder: null,
    servSafeExpiryISO: null,
    businessLicenceJurisdictions: [],
    healthPermitJurisdictions: [],
    swamCertified: null,
    evaRegistered: null,

    priceBands: [],
    travelRadiusMiles: null,
    travelFeeNote: null,
    minimumNote: null,
    depositNote: null,
    cancellationNote: null,

    maxEventsPerWeek: null,
    minLeadTimeDays: null,

    capabilities: [
      "Serving staff",
      "Bartenders",
      "Delivery and setup",
      "Cleanup and breakdown",
      "Consultations and tastings — fee waived on signing",
      "Bar and beverage servingware rentals",
    ],
    cuisines: [
      "Southern",
      "Seafood",
      "American",
      "BBQ",
      "Farm-to-table",
      "Italian",
      "Greek",
      "Latin American",
      "Fusion",
    ],
    confirmWithClient: [
      "General liability insurance — carrier and limit. Blocks every venue application; WIPA requires $1M per occurrence and venues ask before adding a caterer to a list.",
      "ServSafe or food-handler certification — holder and expiry date. Blocks every venue application.",
      "Business licence and health-department permits — which jurisdictions. Blocks every venue application, and Dumbarton House requires a DC business licence specifically.",
      "SWaM certification status with the Virginia Department of Small Business and Supplier Diversity. Blocks the public-sector and corporate diverse-spend lanes.",
      "eVA vendor registration status. Blocks every Virginia public body, including the universities.",
    ],
  };
}
