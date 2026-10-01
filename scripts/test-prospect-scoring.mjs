/**
 * Outbound prospect scoring tests.
 *
 * Plain Node, no test framework — same approach as test-scoring.mjs, which this
 * follows deliberately so there is one way of doing this in the repo. Run with:
 *   npm run test:prospects
 *
 * The scorer is compiled on the fly from the real TypeScript, so these run
 * against the shipping code rather than a copy of it.
 */

import { execFileSync } from "node:child_process";
import { mkdtempSync, writeFileSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const dir = mkdtempSync(join(tmpdir(), "rk-prospect-"));

try {
  execFileSync(
    "npx",
    [
      "tsc",
      "src/lib/portal/prospect-scoring.ts",
      "src/lib/portal/lead-types.ts",
      "src/lib/portal/types.ts",
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
  console.error(
    "Could not compile the prospect scorer:\n",
    err.stdout?.toString() ?? err.message,
  );
  process.exit(1);
}

// tsc emits extensionless imports; patch them so Node can load the output.
for (const f of ["prospect-scoring.js", "lead-types.js"]) {
  const p = join(dir, f);
  let src;
  try {
    src = readFileSync(p, "utf8");
  } catch {
    continue; // a types-only module may emit nothing
  }
  writeFileSync(
    p,
    src
      .replace(/from "\.\/lead-types"/g, 'from "./lead-types.js"')
      .replace(/from "\.\/types"/g, 'from "./types.js"'),
  );
}

const mod = await import(pathToFileURL(join(dir, "prospect-scoring.js")).href);
const {
  scoreProspect,
  applyProspectCap,
  priorityFor,
  PROSPECT_WEIGHTS,
  PROSPECT_BANDS,
  MAX_PROSPECT_SCORE,
  ASSUMED_RADIUS_MILES,
  scoreDateFit,
  scoreFreshness,
  scoreAccess,
  scoreSpendEvidence,
  scoreDistance,
  scoreRepeatability,
  scoreIncumbency,
  scoreBrandFit,
  scoreEffort,
} = mod;

let pass = 0;
let fail = 0;

function check(name, condition, detail = "") {
  if (condition) {
    pass += 1;
    console.log(`  ok   ${name}`);
  } else {
    fail += 1;
    console.error(`  FAIL ${name}${detail ? ` — ${detail}` : ""}`);
  }
}

/** Every factor at its maximum, with one source so no cap fires. */
const BEST = {
  dateFit: "prime-open",
  freshness: "this-month",
  access: "named-decision-maker",
  spendEvidence: "disclosed-figure",
  distanceMiles: 5,
  repeatability: "recurring-list",
  incumbency: "open-lane",
  brandFit: "flagship",
  effort: "low",
  sourceCount: 1,
};

/** Every factor at its minimum. */
const WORST = {
  dateFit: "unavailable",
  freshness: "stale",
  access: "switchboard",
  spendEvidence: "none",
  distanceMiles: 500,
  repeatability: "one-off",
  incumbency: "strong-incumbent",
  brandFit: "off-brand",
  effort: "high",
  sourceCount: 1,
};

const RADIUS = 40;

console.log("\nWeights");
check(
  "the nine weights sum to exactly 100",
  Object.values(PROSPECT_WEIGHTS).reduce((a, b) => a + b, 0) === 100,
);
check("there are exactly nine factors", Object.keys(PROSPECT_WEIGHTS).length === 9);
check("MAX_PROSPECT_SCORE is 100", MAX_PROSPECT_SCORE === 100);
check(
  "date fit carries the most weight, because an open date is perishable",
  PROSPECT_WEIGHTS.dateFit === Math.max(...Object.values(PROSPECT_WEIGHTS)),
);

console.log("\nEnds of the range");
{
  const best = scoreProspect(BEST, RADIUS);
  check("a best-case prospect scores 100", best.score.total === 100, `got ${best.score.total}`);
  check("and lands HOT", best.priority === "HOT", best.priority);
  check("with no cap", best.score.cappedBy === null);

  const worst = scoreProspect(WORST, RADIUS);
  check("a worst-case prospect scores low", worst.score.total < 32, `got ${worst.score.total}`);
  check("and lands DECLINE", worst.priority === "DECLINE", worst.priority);
}

console.log("\nThe breakdown");
{
  const { score } = scoreProspect(BEST, RADIUS);
  check("an uncapped breakdown has exactly 9 lines", score.lines.length === 9, `got ${score.lines.length}`);
  check(
    "the line order matches the weight order",
    score.lines.map((l) => l.key).join(",") === Object.keys(PROSPECT_WEIGHTS).join(","),
  );
  check(
    "every line carries its weight",
    score.lines.every((l) => l.weight === PROSPECT_WEIGHTS[l.key]),
  );
  check(
    "every line carries a non-empty reason",
    score.lines.every((l) => typeof l.reason === "string" && l.reason.length > 10),
  );
  check(
    "no line earns more than its weight",
    score.lines.every((l) => l.earned <= l.weight),
  );

  const zeroed = scoreProspect({ ...BEST, brandFit: "off-brand" }, RADIUS);
  const brand = zeroed.score.lines.find((l) => l.key === "brandFit");
  check("a factor that earns zero still appears, with its reason", brand.earned === 0 && brand.reason.length > 10);
}

console.log("\nThe hard cap — no source, no better than WARM");
{
  const unsourced = scoreProspect({ ...BEST, sourceCount: 0 }, RADIUS);
  check("a perfect prospect with no source is held at WARM", unsourced.priority === "WARM", unsourced.priority);
  check("cappedBy explains why", typeof unsourced.score.cappedBy === "string" && unsourced.score.cappedBy.length > 40);
  check("the cap changes the band, not the number", unsourced.score.total === 100, `got ${unsourced.score.total}`);
  check("a cap adds a 10th line", unsourced.score.lines.length === 10);
  check("and never an 11th", unsourced.score.lines.filter((l) => l.key === "cap").length === 1);

  const sourced = scoreProspect({ ...BEST, sourceCount: 1 }, RADIUS);
  check("attaching one source lifts it back to HOT", sourced.priority === "HOT");
  check("and clears cappedBy", sourced.score.cappedBy === null);

  const lowAndUnsourced = scoreProspect({ ...WORST, sourceCount: 0 }, RADIUS);
  check(
    "the cap never RAISES a band",
    lowAndUnsourced.priority === "DECLINE",
    lowAndUnsourced.priority,
  );
}

console.log("\nThe hard cap — exclusive incumbency is closed");
{
  const exclusive = scoreProspect({ ...BEST, incumbency: "exclusive" }, RADIUS);
  check("a perfect prospect with an exclusive incumbent is DECLINE", exclusive.priority === "DECLINE");
  check("and says so", exclusive.score.cappedBy.includes("exclusive"));
  check(
    "exclusive takes precedence over the no-source cap",
    scoreProspect({ ...BEST, incumbency: "exclusive", sourceCount: 0 }, RADIUS).priority === "DECLINE",
  );
}

console.log("\nBand boundaries are exact");
check("72 is HOT", priorityFor(72) === "HOT");
check("71 is WARM", priorityFor(71) === "WARM");
check("52 is WARM", priorityFor(52) === "WARM");
check("51 is WATCH", priorityFor(51) === "WATCH");
check("32 is WATCH", priorityFor(32) === "WATCH");
check("31 is DECLINE", priorityFor(31) === "DECLINE");
check("0 is DECLINE", priorityFor(0) === "DECLINE");
check(
  "the band minimums descend",
  PROSPECT_BANDS.HOT.min > PROSPECT_BANDS.WARM.min &&
    PROSPECT_BANDS.WARM.min > PROSPECT_BANDS.WATCH.min &&
    PROSPECT_BANDS.WATCH.min > PROSPECT_BANDS.DECLINE.min,
);

console.log("\nDistance");
{
  const unknown = scoreDistance(null, RADIUS);
  check("unknown distance earns 0.4 of the weight", unknown.fraction === 0.4);
  check("and the reason says it is unknown", unknown.reason.toLowerCase().includes("unknown"));

  const assumed = scoreDistance(10, null);
  check(
    `a null radius uses the assumed ${ASSUMED_RADIUS_MILES} miles`,
    assumed.reason.includes(String(ASSUMED_RADIUS_MILES)),
  );
  check("and says the radius is not confirmed", assumed.reason.includes("not yet confirmed"));

  check("inside half the radius scores full", scoreDistance(20, 40).fraction === 1);
  check("inside the radius scores 0.8", scoreDistance(40, 40).fraction === 0.8);
  check("beyond the radius drops", scoreDistance(55, 40).fraction === 0.45);
  check("well beyond drops further", scoreDistance(95, 40).fraction === 0.2);
  check("far outside scores zero", scoreDistance(400, 40).fraction === 0);
  check(
    "the long-leg reason warns about pricing the return",
    scoreDistance(95, 40).reason.includes("return leg"),
  );
}

console.log("\nEvery factor stays within its weight");
{
  const cases = [
    [scoreDateFit, ["prime-open", "open", "tight", "unknown", "unavailable"]],
    [scoreFreshness, ["this-month", "this-quarter", "this-year", "stale"]],
    [scoreAccess, ["named-decision-maker", "named-contact", "department", "switchboard"]],
    [scoreSpendEvidence, ["disclosed-figure", "strong-proxy", "weak-proxy", "none"]],
    [scoreRepeatability, ["recurring-list", "recurring-events", "annual", "one-off"]],
    [scoreIncumbency, ["open-lane", "weak-incumbent", "strong-incumbent", "exclusive"]],
    [scoreBrandFit, ["flagship", "good", "neutral", "off-brand"]],
    [scoreEffort, ["low", "medium", "high"]],
  ];
  let allInRange = true;
  let allHaveReasons = true;
  for (const [fn, values] of cases) {
    for (const v of values) {
      const r = fn(v);
      if (!(r.fraction >= 0 && r.fraction <= 1)) allInRange = false;
      if (!r.reason || r.reason.length < 10) allHaveReasons = false;
    }
  }
  check("every enum value returns a fraction between 0 and 1", allInRange);
  check("every enum value returns a real reason", allHaveReasons);
  check(
    "distance across a spread of miles stays in range",
    [0, 1, 20, 40, 41, 60, 100, 1000].every((m) => {
      const f = scoreDistance(m, 40).fraction;
      return f >= 0 && f <= 1;
    }),
  );
}

console.log("\napplyProspectCap in isolation");
{
  const clean = applyProspectCap("HOT", { ...BEST });
  check("an uncapped call returns the band unchanged", clean.priority === "HOT" && clean.cappedBy === null);
  const capped = applyProspectCap("HOT", { ...BEST, sourceCount: 0 });
  check("and a capped one lowers it", capped.priority === "WARM" && capped.cappedBy !== null);
  check(
    "WATCH with no source is left alone, because it is already below the ceiling",
    applyProspectCap("WATCH", { ...BEST, sourceCount: 0 }).priority === "WATCH",
  );
}

console.log("\nDeterminism and purity");
{
  const a = scoreProspect(BEST, RADIUS);
  const b = scoreProspect(BEST, RADIUS);
  check("the same input scores the same twice", a.score.total === b.score.total);
  check("and bands the same twice", a.priority === b.priority);
  const input = { ...BEST };
  scoreProspect(input, RADIUS);
  check(
    "scoring does not mutate its input",
    JSON.stringify(input) === JSON.stringify({ ...BEST }),
  );
  check(
    "a different radius changes the distance line only",
    scoreProspect({ ...BEST, distanceMiles: 50 }, 40).score.total !==
      scoreProspect({ ...BEST, distanceMiles: 50 }, 100).score.total,
  );
}

console.log("\nA realistic middle case");
{
  // The Hanover ribbon-cutting channel: fresh, repeatable, open lane, but no
  // named decision maker and no evidence of what a new business spends.
  const ribbon = scoreProspect(
    {
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
    RADIUS,
  );
  check(
    "a fresh, repeatable, open-lane prospect with weak access lands HOT or WARM",
    ribbon.priority === "HOT" || ribbon.priority === "WARM",
    `${ribbon.priority} at ${ribbon.score.total}`,
  );
  check("and carries no cap", ribbon.score.cappedBy === null);
}

rmSync(dir, { recursive: true, force: true });

console.log(`\n${pass} passed, ${fail} failed\n`);
process.exit(fail === 0 ? 0 : 1);
