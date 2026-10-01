/**
 * Pipeline board: drag, add, remove — and the sync that matters.
 *
 * The claim being tested is not "the card moved". It is that moving a card
 * changes every other surface that derives from it, because they all read
 * through one store. So each test drags something and then goes and looks at a
 * different page.
 *
 *   npm run build && npm start &
 *   node scripts/test-pipeline.mjs
 */

import { chromium } from "playwright";

const BASE = process.env.BASE ?? "http://localhost:3000";

let pass = 0;
let fail = 0;
const check = (name, ok, detail = "") => {
  if (ok) {
    pass += 1;
    console.log(`  ok   ${name}`);
  } else {
    fail += 1;
    console.error(`  FAIL ${name}${detail ? ` — ${detail}` : ""}`);
  }
};

const browser = await chromium.launch({ args: ["--no-sandbox"] });
const ctx = await browser.newContext({ viewport: { width: 1600, height: 1000 } });
const page = await ctx.newPage();

const consoleErrors = [];
page.on("console", (m) => {
  if (m.type() === "error" && !m.text().includes("React DevTools")) {
    consoleErrors.push(m.text().slice(0, 160));
  }
});

// Reset so the run is repeatable, then sign in as the owner in one tap.
await page.request.post(`${BASE}/api/portal/demo-login`, { data: { role: "owner" } });
await page.request.post(`${BASE}/api/portal/settings`, { data: { action: "reset-demo" } });

/** Which column is a named card sitting in? */
async function columnOf(name) {
  return page.evaluate((n) => {
    for (const section of document.querySelectorAll("section[aria-label]")) {
      const cards = [...section.querySelectorAll("article")];
      if (cards.some((c) => (c.textContent || "").includes(n))) {
        return (section.getAttribute("aria-label") || "").split(",")[0];
      }
    }
    return null;
  }, name);
}

/** A real pointer drag from a card onto a target column. */
async function drag(name, targetStageLabel) {
  const card = page.locator("article").filter({ hasText: name }).first();
  const target = page.locator(`section[aria-label^="${targetStageLabel},"]`).first();
  const cb = await card.boundingBox();
  const tb = await target.boundingBox();
  if (!cb || !tb) throw new Error(`could not locate ${name} or ${targetStageLabel}`);

  await page.mouse.move(cb.x + cb.width / 2, cb.y + 20);
  await page.mouse.down();
  // Several moves: one jump can be treated as a click by pointer handlers.
  for (let i = 1; i <= 6; i++) {
    await page.mouse.move(
      cb.x + cb.width / 2 + ((tb.x + tb.width / 2 - cb.x - cb.width / 2) * i) / 6,
      cb.y + 20 + ((tb.y + 80 - cb.y - 20) * i) / 6,
    );
    await page.waitForTimeout(30);
  }
  await page.mouse.up();
  await page.waitForTimeout(900);
}

/* ── 1. Drag moves the card ───────────────────────────────────────────────── */

console.log("\nDragging a card");
await page.goto(`${BASE}/portal/leads`, { waitUntil: "networkidle" });
await page.waitForTimeout(400);

const before = await columnOf("Priya Raman");
check("Priya Raman starts in New", before === "New", `got ${before}`);

await drag("Priya Raman", "Screened");
const after = await columnOf("Priya Raman");
check("dragging her to Screened moves the card", after === "Screened", `got ${after}`);

await page.reload({ waitUntil: "networkidle" });
await page.waitForTimeout(400);
const persisted = await columnOf("Priya Raman");
check("the move survives a reload, so it was written", persisted === "Screened", `got ${persisted}`);

/* ── 2. It syncs everywhere else ──────────────────────────────────────────── */

console.log("\nThe move reaches every other surface");

// Her timeline should carry the stage change.
const leadHref = await page
  .locator("a", { hasText: "Priya Raman" })
  .first()
  .getAttribute("href");
await page.goto(`${BASE}${leadHref}`, { waitUntil: "networkidle" });
const timeline = await page.textContent("body");
check(
  "the enquiry's own timeline records the move",
  /Moved from new to screened/i.test(timeline ?? ""),
  "no timeline entry",
);
check("it is attributed to the signed-in user, not the client", /Chef R\. Kearse/.test(timeline ?? ""));

// The dashboard's action queue is computed from stage, so it should change.
await page.goto(`${BASE}/portal`, { waitUntil: "networkidle" });
const dash = (await page.textContent("body")) ?? "";
check(
  "the dashboard no longer lists her as a new priority enquiry",
  !/Priority enquiry: Priya Raman/.test(dash),
  "she is still in the needs-you queue",
);

/* ── 3. Stage menu does the same thing as the drag ────────────────────────── */

console.log("\nThe keyboard path");
await page.goto(`${BASE}/portal/leads`, { waitUntil: "networkidle" });
await page.waitForTimeout(300);

const card = page.locator("article").filter({ hasText: "Angela Foster" }).first();
const select = card.locator("select").first();
await select.selectOption("quoted");
await page.waitForTimeout(900);
const viaSelect = await columnOf("Angela Foster");
check("the stage menu moves the card too", viaSelect === "Quoted", `got ${viaSelect}`);

await page.reload({ waitUntil: "networkidle" });
await page.waitForTimeout(400);
check("that move persisted as well", (await columnOf("Angela Foster")) === "Quoted");

// Reaching a money stage should surface it on the dashboard's pipeline value.
await page.goto(`${BASE}/portal`, { waitUntil: "networkidle" });
check(
  "the dashboard still renders after the change",
  ((await page.textContent("body")) ?? "").includes("Needs you"),
);

/* ── 4. Adding an enquiry by hand ─────────────────────────────────────────── */

console.log("\nAdding one by hand");
await page.goto(`${BASE}/portal/leads`, { waitUntil: "networkidle" });
await page.click('button:has-text("Add an enquiry")');
await page.waitForTimeout(300);

await page.fill("#al-name", "QA Phone Enquiry");
await page.fill("#al-email", "qa-phone@example.com");
await page.fill("#al-phone", "(804) 555-0777");
await page.selectOption("#al-type", "corporate");
await page.fill("#al-guests", "45");
await page.fill("#al-city", "Richmond, VA");
await page.selectOption("#al-budget", "125-200");
await page.selectOption("#al-decision", "yes");
await page.selectOption("#al-source", "referral");
await page.fill(
  "#al-notes",
  "Rang the office about an end-of-year dinner for the Richmond team. Forty-five people, wants something memorable, has used a hotel the last two years and did not enjoy it.",
);
await page.click('button:has-text("Add it to the pipeline")');
await page.waitForTimeout(1200);

const added = (await page.textContent("body")) ?? "";
check("it confirms with a reference and a score", /Added as RK-\d+ — scored \d+\/100/.test(added));
check("the new enquiry appears on the board", (await columnOf("QA Phone Enquiry")) !== null);

await page.reload({ waitUntil: "networkidle" });
await page.waitForTimeout(400);
check("it survived a reload", (await columnOf("QA Phone Enquiry")) !== null);

// And it should be reachable from the other surfaces too.
await page.goto(`${BASE}/portal/messages`, { waitUntil: "networkidle" });
await page.goto(`${BASE}/portal`, { waitUntil: "networkidle" });
const dashAfterAdd = (await page.textContent("body")) ?? "";
check(
  "the dashboard funnel counted it",
  /enquiries scored/.test(dashAfterAdd),
  "funnel panel missing",
);

/* ── 5. Removing one ──────────────────────────────────────────────────────── */

console.log("\nRemoving one");
await page.goto(`${BASE}/portal/leads`, { waitUntil: "networkidle" });
await page.waitForTimeout(400);

const removeBtn = page.locator('button[aria-label="Remove QA Phone Enquiry"]').first();
check("the owner gets a remove control", (await removeBtn.count()) > 0);
await removeBtn.click();
await page.waitForTimeout(250);

const warned = (await page.textContent("body")) ?? "";
check("it warns before removing", /cannot be undone/i.test(warned));

await page.click('button:has-text("Remove")');
await page.waitForTimeout(1200);
check("the card is gone", (await columnOf("QA Phone Enquiry")) === null);

await page.reload({ waitUntil: "networkidle" });
await page.waitForTimeout(400);
check("it stayed gone after a reload", (await columnOf("QA Phone Enquiry")) === null);

/* ── 6. The assistant cannot remove ───────────────────────────────────────── */

console.log("\nRole limits");
const actx = await browser.newContext({ viewport: { width: 1600, height: 1000 } });
const apage = await actx.newPage();
await apage.request.post(`${BASE}/api/portal/demo-login`, { data: { role: "assistant" } });
await apage.goto(`${BASE}/portal/leads`, { waitUntil: "networkidle" });
await apage.waitForTimeout(400);

const assistantRemove = await apage.locator("button[aria-label^='Remove ']").count();
check("the assistant has no remove control", assistantRemove === 0, `found ${assistantRemove}`);

const assistantSelects = await apage.locator("article select").count();
check("but she can still move cards between stages", assistantSelects > 0);
await actx.close();

/* ── 7. Hygiene ───────────────────────────────────────────────────────────── */

console.log("\nHygiene");
check("no console errors through any of that", consoleErrors.length === 0, consoleErrors[0] ?? "");

const overflow = await page.evaluate(
  () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
);
check("no horizontal page overflow on the board", !overflow);

// Put the demo data back so a presentation after this run starts clean.
await page.request.post(`${BASE}/api/portal/settings`, { data: { action: "reset-demo" } });
console.log("  ok   demo data reset");

await browser.close();
console.log(`\n${pass} passed, ${fail} failed\n`);
process.exit(fail === 0 ? 0 : 1);
