/**
 * Feed parsing and matching tests.
 *
 * Runs against fixtures, not the network — so it tells you whether the search
 * would recognise a lead, independently of whether a publisher is up today.
 *
 * This matters more than it looks. A regex that quietly stops matching produces
 * an engine that runs every Monday, reports "0 to triage", and looks like a
 * quiet week rather than a broken one. These fixtures are the thing that would
 * catch that.
 *
 *   npm run test:feeds
 */

import { execFileSync } from "node:child_process";
import { mkdtempSync, writeFileSync, readFileSync, readdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const dir = mkdtempSync(join(tmpdir(), "rk-feeds-"));
try {
  execFileSync(
    "npx",
    [
      "tsc",
      "src/lib/portal/feed-parse.ts",
      "src/lib/portal/feed-rules.ts",
      "--outDir",
      dir,
      "--module",
      "esnext",
      "--target",
      "es2022",
      "--moduleResolution",
      "bundler",
      "--skipLibCheck",
    ],
    { stdio: "pipe" },
  );
} catch (err) {
  console.error("Could not compile:\n", err.stdout?.toString() ?? err.message);
  process.exit(1);
}
for (const f of readdirSync(dir)) {
  if (!f.endsWith(".js")) continue;
  const p = join(dir, f);
  writeFileSync(p, readFileSync(p, "utf8").replace(/from "\.\/([a-zA-Z-]+)"/g, 'from "./$1.js"'));
}

const { parseRss, parseJson, matchRules, inArea, shouldKeep, isoOf } = await import(
  pathToFileURL(join(dir, "feed-parse.js")).href
);
const { FEEDS, RULES, GEO } = await import(pathToFileURL(join(dir, "feed-rules.js")).href);

let pass = 0;
let fail = 0;
const check = (name, cond, detail = "") => {
  if (cond) {
    pass += 1;
    console.log(`  ok   ${name}`);
  } else {
    fail += 1;
    console.error(`  FAIL ${name}${detail ? ` — ${detail}` : ""}`);
  }
};

/* ── Fixtures. Real headlines, verified live on the sweep date. ──────────── */

const RSS = `<rss><channel>
<item>
  <title>Grove Eye Care now open at Regency mall in Henrico</title>
  <link>https://example.com/1</link>
  <pubDate>Wed, 30 Sep 2026 06:00:00 +0000</pubDate>
  <description><![CDATA[<p>The practice opened its doors in Henrico this week.</p>]]></description>
</item>
<item>
  <title>Chipmaker Nvidia Leases Office Space In Downtown D.C.</title>
  <link>https://example.com/2</link>
  <pubDate>Wed, 30 Sep 2026 06:01:00 +0000</pubDate>
  <description>The company signs lease for 40,000 square feet.</description>
</item>
<item>
  <title>A recipe for autumn squash soup</title>
  <link>https://example.com/3</link>
  <pubDate>Wed, 30 Sep 2026 06:02:00 +0000</pubDate>
  <description>Nothing to do with business at all.</description>
</item>
<item>
  <title>Charity announces annual gala in Boise, Idaho</title>
  <link>https://example.com/4</link>
  <pubDate>Wed, 30 Sep 2026 06:03:00 +0000</pubDate>
  <description>A fundraiser entirely outside the service area.</description>
</item>
<item>
  <title>Smith &amp; Jones celebrate their grand opening in Richmond</title>
  <link>https://example.com/5</link>
  <pubDate>Wed, 30 Sep 2026 06:04:00 +0000</pubDate>
  <description>The firm&#8217;s new office.</description>
</item>
<item>
  <title>No link on this one</title>
  <pubDate>Wed, 30 Sep 2026 06:05:00 +0000</pubDate>
  <description>Malformed.</description>
</item>
</channel></rss>`;

const JSON_FEED = {
  events: [
    {
      title: "Executive Lunch: Building for Growth in the Greater Washington Region",
      url: "https://example.com/6",
      start_date: "2026-10-08 12:00:00",
      description: "<p>A luncheon for members in Washington.</p>",
    },
    { title: "No url on this one", start_date: "2026-10-09" },
  ],
};

/* ── Parsing ─────────────────────────────────────────────────────────────── */

console.log("\nParsing");

const items = parseRss(RSS);
check("five well-formed RSS items are parsed", items.length === 5, `got ${items.length}`);
check("an item with no link is dropped rather than throwing", !items.some((i) => !i.url));
check("CDATA and tags are stripped from the description", items[0].body === "The practice opened its doors in Henrico this week.");
check("&amp; is decoded", items[4].title.includes("Smith & Jones"));
check("a numeric entity for an apostrophe is decoded", items[4].body.includes("firm's"));
check("parsing empty input returns nothing rather than throwing", parseRss("").length === 0);
check("parsing junk returns nothing rather than throwing", parseRss("<html>nope</html>").length === 0);

const jitems = parseJson(JSON_FEED);
check("one well-formed JSON row is parsed", jitems.length === 1, `got ${jitems.length}`);
check("a row with no url is dropped", !jitems.some((i) => !i.url));
check("HTML is stripped from a JSON description", !jitems[0].body.includes("<p>"));
check("parseJson tolerates an empty payload", parseJson({}).length === 0);
check("parseJson tolerates a bare array", parseJson([]).length === 0);
check("parseJson tolerates null", parseJson(null).length === 0);

/* ── Matching ────────────────────────────────────────────────────────────── */

console.log("\nWhat gets kept");

const decide = (i, geoImplied = false) => shouldKeep(i, { geoImplied });

check("a ribbon cutting in Henrico is kept", decide(items[0]).keep);
check("and it matches the ribbon-cutting rule", decide(items[0]).rules.includes("ribbon-cutting"));

check("an office lease in DC is kept", decide(items[1]).keep);
check("and it matches the office-move rule", decide(items[1]).rules.includes("office-move"));

check("a recipe is dropped", !decide(items[2]).keep);
check("because it matches no rule at all", decide(items[2]).rules.length === 0);

check("a gala in Idaho is dropped on geography", !decide(items[3]).keep);
check("even though it DID match the gala rule", decide(items[3]).rules.includes("gala"));

check("a grand opening in Richmond is kept", decide(items[4]).keep);

check("the DC luncheon is kept", decide(jitems[0]).keep);

console.log("\nA local feed does not have to name the place");
const localOnly = { title: "Grand opening this week", url: "x", published: "", body: "A new shop." };
check("dropped when geography is required", !decide(localOnly).keep);
check("kept when the feed is already local", decide(localOnly, true).keep);

/* ── Dates ───────────────────────────────────────────────────────────────── */

console.log("\nDates");
check("an RFC date becomes an ISO day", isoOf("Wed, 30 Sep 2026 06:00:00 +0000") === "2026-09-30");
check("a JSON datetime becomes an ISO day", isoOf("2026-10-08 12:00:00") === "2026-10-08");
check("an unparseable date falls back to today rather than throwing", /^\d{4}-\d{2}-\d{2}$/.test(isoOf("not a date")));

/* ── The config itself ───────────────────────────────────────────────────── */

console.log("\nThe configuration");
check("six feeds are configured", FEEDS.length === 6, String(FEEDS.length));
check("every feed has an https url", FEEDS.every((f) => f.url.startsWith("https://")));
check("every feed is rss or json", FEEDS.every((f) => f.kind === "rss" || f.kind === "json"));
check("feed ids are unique", new Set(FEEDS.map((f) => f.id)).size === FEEDS.length);
check("six rules are configured", RULES.length === 6, String(RULES.length));
check("every rule has phrases", RULES.every((r) => r.any.length > 0));
check("every rule phrase is lower case, since matching lowercases the text", RULES.every((r) => r.any.every((p) => p === p.toLowerCase())));
check("rule ids are unique", new Set(RULES.map((r) => r.id)).size === RULES.length);
check("every geography term is lower case", GEO.every((g) => g === g.toLowerCase()));
check("the service area covers both metros", inArea("something in richmond") && inArea("something in washington"));
check("and does not match somewhere else", !inArea("something in boise idaho"));

rmSync(dir, { recursive: true, force: true });

console.log(`\n${pass} passed, ${fail} failed\n`);
process.exit(fail === 0 ? 0 : 1);
