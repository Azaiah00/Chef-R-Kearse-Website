/**
 * WHAT THE WEEKLY SEARCH READS, AND WHAT IT LOOKS FOR
 *
 * Both are data so that adding a feed or a keyword is an edit to this file and
 * nothing else — no code, no deploy decisions, no hunting through a script.
 *
 * EVERY FEED BELOW WAS CONFIRMED LIVE AND RETURNING ITEMS on 30 September 2026.
 * Do not add one that has not been. A feed URL that quietly 404s produces an
 * engine that looks like it is working and finds nothing, which is worse than an
 * engine that is obviously switched off.
 */

export interface Feed {
  id: string;
  name: string;
  url: string;
  kind: "rss" | "json";
  /**
   * True when the feed is already local to the market, so a hit does not also
   * have to mention a place name. Richmond BizSense only covers Richmond; the
   * national Bisnow feed covers everywhere and must be filtered.
   */
  geoImplied?: boolean;
  note?: string;
}

export const FEEDS: Feed[] = [
  {
    id: "bizsense",
    name: "Richmond BizSense",
    url: "https://richmondbizsense.com/feed/",
    kind: "rss",
    geoImplied: true,
    note: "The best single source in this market. New openings, leases, expansions and permits. Publishes in one early-morning weekday batch. The Pro tier gates New Licenses and Breaking Ground, which are the two sharpest products and are not in this free feed.",
  },
  {
    id: "vabusiness",
    name: "Virginia Business",
    url: "https://www.virginiabusiness.com/feed/",
    kind: "rss",
    note: "Statewide, and it carries national wire copy, so the geography filter matters here more than anywhere else.",
  },
  {
    id: "bisnow",
    name: "Bisnow",
    url: "https://www.bisnow.com/feed",
    kind: "rss",
    note: "Office leases and HQ moves. The feed is NATIONAL — a DC-scoped feed was checked and returns 404 — so every hit must clear the geography filter.",
  },
  {
    id: "philva",
    name: "ThePhilVA",
    url: "https://thephilva.com/feed/",
    kind: "rss",
    geoImplied: true,
    note: "Virginia nonprofit news and events. Low volume, weekly to biweekly, and partly retrospective — a recap of a gala that already happened is still useful, because it names next year's organiser.",
  },
  {
    id: "gwbot",
    name: "Greater Washington Board of Trade",
    url: "https://www.bot.org/wp-json/tribe/events/v1/events",
    kind: "json",
    note: "The only chamber in the sweep with a real API. Corporate policy briefings and executive lunches — the rooms where DC-corridor catering decisions get made.",
  },
  {
    id: "vcu",
    name: "VCU Events",
    url: "https://calendar.vcu.edu/api/2/events",
    kind: "json",
    geoImplied: true,
    note: "Localist. Proof that departments book off-campus: a verified listing put a VCU event at Hardywood Park Craft Brewery.",
  },
];

export interface Rule {
  id: string;
  label: string;
  /** How fresh a hit on this rule usually is, fed into the prospect score. */
  freshness: "this-month" | "this-quarter" | "this-year" | "stale";
  /** Any one of these phrases, matched case-insensitively. */
  any: string[];
}

export const RULES: Rule[] = [
  {
    id: "ribbon-cutting",
    label: "Ribbon cutting or grand opening",
    freshness: "this-month",
    any: [
      "ribbon cutting",
      "ribbon-cutting",
      "grand opening",
      "now open",
      "opens its doors",
      "officially opened",
      "opening celebration",
    ],
  },
  {
    id: "new-licence",
    label: "New business licence",
    freshness: "this-month",
    any: ["new license", "new licence", "business license", "newly licensed"],
  },
  {
    id: "office-move",
    label: "Office lease, relocation or new HQ",
    freshness: "this-quarter",
    any: [
      "leases office",
      "office lease",
      "relocat",
      "new headquarters",
      "moves into",
      "square feet",
      "signs lease",
    ],
  },
  {
    id: "expansion",
    label: "Expansion, hiring or investment",
    freshness: "this-quarter",
    any: [
      "expansion",
      "expands",
      "to add jobs",
      "new jobs",
      "investment",
      "opens facility",
      "breaks ground",
    ],
  },
  {
    id: "gala",
    label: "Gala, fundraiser or benefit",
    freshness: "this-quarter",
    any: ["gala", "fundraiser", "benefit dinner", "annual dinner", "auction", "giving day"],
  },
  {
    id: "corporate-event",
    label: "Conference, meeting or reception",
    freshness: "this-quarter",
    any: [
      "conference",
      "summit",
      "luncheon",
      "annual meeting",
      "breakfast",
      "reception",
      "awards",
    ],
  },
];

/**
 * Place names that put a hit inside his service area.
 *
 * Deliberately generous at the edges — a false positive costs ten seconds of
 * triage, and a false negative means a real opening is never seen at all.
 */
export const GEO: string[] = [
  "richmond",
  "henrico",
  "chesterfield",
  "hanover",
  "glen allen",
  "ashland",
  "midlothian",
  "goochland",
  "powhatan",
  "short pump",
  "scott's addition",
  "northern virginia",
  "arlington",
  "alexandria",
  "fairfax",
  "tysons",
  "reston",
  "washington",
  "d.c.",
  "maryland",
  "bethesda",
  "silver spring",
  "rockville",
];
