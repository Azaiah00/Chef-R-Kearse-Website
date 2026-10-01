/**
 * Parsing and matching for the weekly search.
 *
 * Separated from scripts/sweep.mjs so the logic that decides what counts as a
 * lead can be tested without a network, and so the script is only I/O. A regex
 * that quietly stops matching is the kind of bug that produces an engine which
 * looks like it is running and finds nothing — so it gets a test.
 */

import { GEO, RULES } from "./feed-rules";

export interface FeedItem {
  title: string;
  url: string;
  published: string;
  body: string;
}

/**
 * A small regex reader rather than an XML library.
 *
 * Six feeds do not justify a dependency, and a malformed item should be skipped
 * rather than throwing the run away — which is what a strict parser would do
 * the first time a publisher emits a stray ampersand.
 */
export function parseRss(xml: string): FeedItem[] {
  const items: FeedItem[] = [];
  for (const block of xml.split(/<item[\s>]/i).slice(1)) {
    const pick = (tag: string): string => {
      const m = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "i").exec(block);
      if (!m) return "";
      return m[1]
        .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
        .replace(/<[^>]+>/g, " ")
        .replace(/&amp;/g, "&")
        .replace(/&#8217;|&#8216;/g, "'")
        .replace(/&quot;/g, '"')
        .replace(/&nbsp;/g, " ")
        .replace(/\s+/g, " ")
        .trim();
    };
    const title = pick("title");
    const url = pick("link");
    if (!title || !url) continue;
    items.push({ title, url, published: pick("pubDate"), body: pick("description") });
  }
  return items;
}

interface JsonRow {
  title?: string;
  name?: string;
  url?: string;
  website_url?: string;
  localist_url?: string;
  start_date?: string;
  date?: string;
  created?: string;
  description?: string;
  excerpt?: string;
}

/** Both JSON feeds in use nest their rows under `events`. */
export function parseJson(payload: unknown): FeedItem[] {
  const rows: JsonRow[] = Array.isArray(payload)
    ? (payload as JsonRow[])
    : (((payload as { events?: JsonRow[]; data?: JsonRow[] })?.events ??
        (payload as { data?: JsonRow[] })?.data ??
        []) as JsonRow[]);

  return rows
    .map((r) => ({
      title: r.title ?? r.name ?? "",
      url: r.url ?? r.website_url ?? r.localist_url ?? "",
      published: r.start_date ?? r.date ?? r.created ?? "",
      body: String(r.description ?? r.excerpt ?? "")
        .replace(/<[^>]+>/g, " ")
        .slice(0, 600),
    }))
    .filter((r) => r.title && r.url);
}

/** Which keyword rules a piece of text trips. */
export function matchRules(haystack: string): string[] {
  const hay = haystack.toLowerCase();
  return RULES.filter((rule) => rule.any.some((phrase) => hay.includes(phrase))).map((r) => r.id);
}

/** Whether a piece of text names somewhere inside his service area. */
export function inArea(haystack: string): boolean {
  const hay = haystack.toLowerCase();
  return GEO.some((place) => hay.includes(place));
}

/**
 * The whole decision for one item.
 *
 * A feed that is already local to the market does not also have to name a place,
 * which is what `geoImplied` is for — Richmond BizSense only covers Richmond, so
 * demanding the word "Richmond" in every headline would throw away most of it.
 */
export function shouldKeep(
  item: FeedItem,
  opts: { geoImplied?: boolean },
): { keep: boolean; rules: string[] } {
  const haystack = `${item.title} ${item.body}`;
  const rules = matchRules(haystack);
  if (rules.length === 0) return { keep: false, rules };
  if (!opts.geoImplied && !inArea(haystack)) return { keep: false, rules };
  return { keep: true, rules };
}

export function isoOf(value: string): string {
  const t = Date.parse(value);
  return Number.isNaN(t)
    ? new Date().toISOString().slice(0, 10)
    : new Date(t).toISOString().slice(0, 10);
}
