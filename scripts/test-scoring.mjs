/**
 * Qualification engine tests.
 *
 * Plain Node, no test framework — this repo has no test runner and adding one
 * for nine assertions would be worse than this. Run with:
 *   npm run test:scoring
 *
 * The scorer is compiled on the fly with the TypeScript already in the project,
 * so these run against the real code rather than a copy.
 */

import { execFileSync } from "node:child_process";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const dir = mkdtempSync(join(tmpdir(), "rk-scoring-"));

// Compile scoring.ts and types.ts to ESM in a temp dir.
try {
  execFileSync(
    "npx",
    [
      "tsc",
      "src/lib/portal/scoring.ts",
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
  console.error("Could not compile the scorer:\n", err.stdout?.toString() ?? err.message);
  process.exit(1);
}

// tsc emits .js without the extension in imports; patch it so Node can load it.
const compiled = join(dir, "scoring.js");
const src = (await import("node:fs")).readFileSync(compiled, "utf8");
writeFileSync(compiled, src.replace(/from "\.\/types"/g, 'from "./types.js"'));

const { scoreLead, bandFor, applyCaps, WEIGHTS, MAX_SCORE, BANDS, daysBetween } = await import(
  pathToFileURL(compiled).href
);

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

const NOW = new Date("2026-06-15T12:00:00Z");
const dayOffset = (n) => {
  const d = new Date(NOW);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
};

const IDEAL = {
  eventType: "wedding",
  eventDate: dayOffset(60),
  dateFlexible: false,
  guestCount: 70,
  venueType: "my-home",
  budgetBand: "200-plus",
  decisionMaker: "yes",
  source: "referral",
  occasionNotes:
    "Our wedding is in August at a venue we have already booked. Seventy guests, mostly family, and we care far more about the food than the flowers. We would love a plated dinner with a seafood course.",
  depositOk: true,
  callOk: true,
  phone: "(804) 555-0100",
  workedWithChefBefore: false,
};

const WORST = {
  eventType: "other",
  eventDate: dayOffset(3),
  dateFlexible: false,
  guestCount: 2,
  venueType: "undecided",
  budgetBand: "under-75",
  decisionMaker: "no",
  source: "other",
  occasionNotes: "how much",
  depositOk: false,
  callOk: false,
  phone: "",
  workedWithChefBefore: false,
};

console.log("\nWeights and bands");
check(
  "weights sum to exactly 100",
  Object.values(WEIGHTS).reduce((a, b) => a + b, 0) === 100,
  `got ${Object.values(WEIGHTS).reduce((a, b) => a + b, 0)}`,
);
check("MAX_SCORE agrees with the weights", MAX_SCORE === 100, `got ${MAX_SCORE}`);
check("band thresholds descend without gaps", BANDS.A.min > BANDS.B.min && BANDS.B.min > BANDS.C.min && BANDS.C.min > BANDS.D.min);
check("bandFor maps the boundaries", bandFor(100) === "A" && bandFor(75) === "A" && bandFor(74) === "B" && bandFor(55) === "B" && bandFor(54) === "C" && bandFor(35) === "C" && bandFor(34) === "D" && bandFor(0) === "D");

console.log("\nEnds of the range");
const ideal = scoreLead(IDEAL, NOW);
const worst = scoreLead(WORST, NOW);
check("a perfect enquiry scores 100", ideal.total === 100, `got ${ideal.total}`);
check("a perfect enquiry is band A", ideal.band === "A", `got ${ideal.band}`);
check("the worst enquiry is band D", worst.band === "D", `got ${worst.total}/${worst.band}`);
check("the worst enquiry still scores at or above zero", worst.total >= 0, `got ${worst.total}`);
check("every score is within 0 and MAX_SCORE", ideal.total <= MAX_SCORE && worst.total <= MAX_SCORE);
check(
  "every line's points never exceed its max",
  [...ideal.lines, ...worst.lines].every((l) => l.points <= l.max && l.points >= 0),
);
check("nine criteria are always returned", ideal.lines.length === 9, `got ${ideal.lines.length}`);
check("a capped enquiry gains a tenth explanatory line", scoreLead({ ...IDEAL, budgetBand: "under-75" }, NOW).lines.length === 10);
check("every line carries a human-readable reason", [...ideal.lines, ...worst.lines].every((l) => typeof l.reason === "string" && l.reason.length > 4));

console.log("\nLead time behaves");
const lt = (days) => scoreLead({ ...IDEAL, eventDate: dayOffset(days) }, NOW).lines.find((l) => l.key === "leadTime").points;
check("the ideal window scores full marks", lt(60) === WEIGHTS.leadTime, `got ${lt(60)}`);
check("three days out scores very low", lt(3) <= 3, `got ${lt(3)}`);
check("a past date scores zero", lt(-5) === 0, `got ${lt(-5)}`);
check("very far out is discounted, not zeroed", lt(400) > 0 && lt(400) < WEIGHTS.leadTime, `got ${lt(400)}`);
check("lead time rises then falls across the window", lt(3) < lt(16) && lt(16) < lt(60) && lt(60) > lt(400));
check(
  "no date but flexible beats no date and rigid",
  scoreLead({ ...IDEAL, eventDate: null, dateFlexible: true }, NOW).lines.find((l) => l.key === "leadTime").points >
    scoreLead({ ...IDEAL, eventDate: null, dateFlexible: false }, NOW).lines.find((l) => l.key === "leadTime").points,
);

console.log("\nBudget is the heaviest signal");
const budget = (band) => scoreLead({ ...IDEAL, budgetBand: band }, NOW).lines.find((l) => l.key === "budget").points;
check("budget carries the largest single weight", Math.max(...Object.values(WEIGHTS)) === WEIGHTS.budget);
check("the top band scores full marks", budget("200-plus") === WEIGHTS.budget);
check("bands descend in order", budget("200-plus") > budget("125-200") && budget("125-200") > budget("75-125") && budget("75-125") > budget("under-75"));
check("'unsure' sits mid-range rather than at the bottom", budget("unsure") > budget("under-75") && budget("unsure") < budget("125-200"));
check(
  "dropping only the budget from ideal moves it out of band A",
  scoreLead({ ...IDEAL, budgetBand: "under-75" }, NOW).band !== "A",
);

console.log("\nHard caps are constraints, not weights");
const belowFloor = scoreLead({ ...IDEAL, budgetBand: "under-75" }, NOW);
check("an otherwise perfect enquiry below the floor is capped at B", belowFloor.band === "B", `got ${belowFloor.total}/${belowFloor.band}`);
check("the cap does not alter the numeric total", belowFloor.total === scoreLead(IDEAL, NOW).total - WEIGHTS.budget + 2, `got ${belowFloor.total}`);
check("the cap explains itself in the breakdown", belowFloor.lines.some((l) => l.key === "cap" && l.reason.length > 20));
check("the cap never promotes a lower band", scoreLead({ ...WORST, budgetBand: "under-floor-invalid" in {} ? "unsure" : "under-75" }, NOW).band === "D");
check(
  "a weak-but-above-floor enquiry is not capped",
  !scoreLead({ ...IDEAL, budgetBand: "75-125" }, NOW).lines.some((l) => l.key === "cap"),
);
check("applyCaps is idempotent", applyCaps(applyCaps("A", { budgetBand: "under-75" }).band, { budgetBand: "under-75" }).band === "B");

console.log("\nEffort is measured, and it matters");
const effort = (notes) => scoreLead({ ...IDEAL, occasionNotes: notes }, NOW).lines.find((l) => l.key === "effort").points;
check("an empty occasion scores zero", effort("") === 0);
check("a two-word reply scores almost nothing", effort("how much") <= 1);
check("a considered paragraph scores full marks", effort(IDEAL.occasionNotes) === WEIGHTS.effort);
check("effort is monotonic", effort("") < effort("a few words only here") && effort("a few words only here") < effort(IDEAL.occasionNotes));

console.log("\nCommitment signals");
const commit = (o) => scoreLead({ ...IDEAL, ...o }, NOW).lines.find((l) => l.key === "deposit").points;
check("all three signals score full marks", commit({}) === WEIGHTS.deposit);
check("no phone number costs points", commit({ phone: "" }) < commit({}));
check("refusing the deposit costs the most of the three", commit({ depositOk: false }) < commit({ callOk: false }));
check("a short number is treated as no number", commit({ phone: "555" }) === commit({ phone: "" }));

console.log("\nGrowth lines are weighted up");
const type = (t) => scoreLead({ ...IDEAL, eventType: t }, NOW).lines.find((l) => l.key === "eventType").points;
check("weddings score full marks", type("wedding") === WEIGHTS.eventType);
check("corporate scores full marks", type("corporate") === WEIGHTS.eventType);
check("both beat an unclassified enquiry", type("wedding") > type("other") && type("corporate") > type("other"));
check("weekly service is valued highly", type("weekly-service") >= WEIGHTS.eventType - 2);

console.log("\nReturning clients");
check(
  "having hired a chef before scores the source at full marks",
  scoreLead({ ...IDEAL, source: "other", workedWithChefBefore: true }, NOW).lines.find((l) => l.key === "source").points ===
    WEIGHTS.source,
);

console.log("\nParty size fit");
const size = (n) => scoreLead({ ...IDEAL, guestCount: n }, NOW).lines.find((l) => l.key === "guestCount").points;
check("the comfortable band scores full marks", size(40) === WEIGHTS.guestCount);
check("below the minimum is penalised", size(3) < size(8) && size(8) < size(40));
check("very large is discounted but not zeroed", size(400) > 0 && size(400) < WEIGHTS.guestCount);
check("zero guests scores zero", size(0) === 0);

console.log("\nDate maths is DST-safe");
check("60 days is measured as 60", daysBetween(NOW, new Date(dayOffset(60) + "T12:00:00Z")) === 60);
check(
  "a spring-forward boundary still measures whole days",
  daysBetween(new Date("2027-03-13T23:00:00Z"), new Date("2027-03-15T01:00:00Z")) === 2,
);
check(
  "an autumn-back boundary still measures whole days",
  daysBetween(new Date("2026-11-01T01:00:00Z"), new Date("2026-11-03T23:00:00Z")) === 2,
);

console.log("\nDeterminism");
check(
  "the same input scores the same twice",
  scoreLead(IDEAL, NOW).total === scoreLead(IDEAL, NOW).total,
);

rmSync(dir, { recursive: true, force: true });

console.log(`\n${pass} passed, ${fail} failed\n`);
process.exit(fail === 0 ? 0 : 1);
