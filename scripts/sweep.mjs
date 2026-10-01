/**
 * THE WEEKLY SEARCH
 *
 * Reads the feeds in src/lib/portal/feed-rules.ts, matches each item against the
 * keyword rules and the service area, and prints what it found.
 *
 * ── WHAT THIS IS, HONESTLY ──────────────────────────────────────────────────
 * It is a research aid, not an oracle. It surfaces CANDIDATES for a person to
 * triage. Every one it finds still needs a human to decide it is worth pursuing,
 * attach a source, and write the opening question — and until somebody does, the
 * hard cap in prospect-scoring.ts holds it below WARM no matter how it scores.
 *
 * A system that turned feed hits straight into confident prospect cards would
 * produce exactly the thing this whole engine exists to avoid: persuasive words
 * about a business nobody has checked.
 *
 * ── HOW IT FAILS ────────────────────────────────────────────────────────────
 * One feed going down must not take the run with it. Each is fetched inside its
 * own try, a failure is printed and recorded, and the sweep carries on. It exits
 * non-zero only if EVERY feed failed, because that means the network is down
 * rather than one publisher having a bad morning.
 *
 *   npm run sweep
 */

import { execFileSync } from "node:child_process";
import { mkdtempSync, writeFileSync, readFileSync, readdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const TIMEOUT_MS = 15_000;
/**
 * ASCII only. An HTTP header value is a ByteString, so a single em dash here
 * throws before the request is even made — and because every feed shares this
 * constant, one stray character fails the entire run at once.
 */
const UA = "Chef R. Kearse portal - weekly research sweep (one request per feed, once a week)";

/* ── Load the rules from the TypeScript, so there is one copy of them ─────── */

const dir = mkdtempSync(join(tmpdir(), "rk-sweep-"));
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
  console.error("Could not compile the feed rules:\n", err.stdout?.toString() ?? err.message);
  process.exit(1);
}
for (const f of readdirSync(dir)) {
  if (!f.endsWith(".js")) continue;
  const p = join(dir, f);
  writeFileSync(p, readFileSync(p, "utf8").replace(/from "\.\/([a-zA-Z-]+)"/g, 'from "./$1.js"'));
}
const { FEEDS } = await import(pathToFileURL(join(dir, "feed-rules.js")).href);
const { parseRss, parseJson, shouldKeep, isoOf } = await import(
  pathToFileURL(join(dir, "feed-parse.js")).href
);

/* ── The run ─────────────────────────────────────────────────────────────── */

const found = [];
const failures = [];
const seen = new Set();

console.log(`\nWeekly search — ${new Date().toISOString().slice(0, 10)}\n`);

for (const feed of FEEDS) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  let fetched = 0;
  let matched = 0;
  let duplicate = 0;

  try {
    const res = await fetch(feed.url, {
      signal: controller.signal,
      headers: { "User-Agent": UA, Accept: feed.kind === "json" ? "application/json" : "application/rss+xml, application/xml, text/xml" },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const items = feed.kind === "json" ? parseJson(await res.json()) : parseRss(await res.text());
    fetched = items.length;

    for (const item of items) {
      const { keep, rules } = shouldKeep(item, { geoImplied: feed.geoImplied });
      if (!keep) continue;
      if (seen.has(item.url)) {
        duplicate += 1;
        continue;
      }
      seen.add(item.url);
      matched += 1;
      found.push({
        source: feed.name,
        title: item.title.slice(0, 200),
        url: item.url,
        publishedISO: isoOf(item.published),
        matchedRules: rules,
      });
    }

    console.log(
      `  ${feed.name.padEnd(36)} ${String(fetched).padStart(3)} read  ${String(matched).padStart(2)} kept  ${duplicate} dup`,
    );
  } catch (err) {
    const reason = err.name === "AbortError" ? `no answer in ${TIMEOUT_MS / 1000}s` : err.message;
    failures.push({ feed: feed.name, reason });
    console.error(`  ${feed.name.padEnd(36)} FAILED — ${reason}`);
  } finally {
    clearTimeout(timer);
  }
}

rmSync(dir, { recursive: true, force: true });

/* ── What it found ───────────────────────────────────────────────────────── */

console.log(`\n${found.length} to triage:\n`);
for (const f of found.slice(0, 40)) {
  console.log(`  [${f.matchedRules.join(", ")}]`);
  console.log(`  ${f.title}`);
  console.log(`  ${f.source} · ${f.publishedISO} · ${f.url}\n`);
}
if (found.length > 40) console.log(`  …and ${found.length - 40} more\n`);

if (failures.length > 0) {
  console.log("Recorded as corrections — published rather than quietly dropped:\n");
  for (const f of failures) console.log(`  ${f.feed}: ${f.reason}`);
  console.log("");

  /*
   * Every feed failing the same way is almost never six publishers having a bad
   * morning. The usual cause is the machine, not the internet — a corporate
   * proxy, a VPN, or a sandbox that only allows outbound requests to an
   * allow-listed set of hosts. Saying so beats letting somebody conclude the
   * engine is broken and stop running it.
   */
  if (failures.length === FEEDS.length) {
    const allSame = new Set(failures.map((f) => f.reason)).size === 1;
    if (allSame) {
      console.log("Every feed failed in the same way, which usually means the network rather than");
      console.log("the feeds. Check for a proxy, a VPN or a firewall between this machine and the");
      console.log("open internet, and try one of the URLs in a browser on the same machine.\n");
      console.log("The matching logic itself is tested separately and does not need the network:");
      console.log("  npm run test:feeds\n");
    }
  }
}

// Written out so the portal can pick it up, and so a run is reviewable after the
// fact rather than only in a terminal somebody has since closed.
const out = join(process.cwd(), ".sweep-latest.json");
writeFileSync(
  out,
  JSON.stringify(
    { ranISO: new Date().toISOString(), signals: found, failures },
    null,
    2,
  ),
);
console.log(`Written to ${out}`);
console.log(
  "\nNothing here is a lead yet. Open /portal/signals, keep what is worth a look, and say why you dropped the rest — that is what makes next week's search better.\n",
);

// One publisher having a bad morning is not a failed run. Everything failing is.
process.exit(failures.length === FEEDS.length ? 1 : 0);
