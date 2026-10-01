/**
 * Outbound lead engine — end-to-end and security tests.
 *
 * Runs against a production server on BASE (default http://localhost:3000),
 * following the same shape as test-portal.mjs so there is one way of doing this
 * in the repo.
 *
 * Covers the things that would actually hurt if they were wrong:
 *   • Can a signed-out stranger reach any of it?
 *   • Can the assistant reach the Kitchen Brain, or see a revenue figure?
 *   • Does the hard cap hold, and does attaching a source lift it?
 *   • Can a source be attached with no note — the field the engine rests on?
 *   • Do the derived counts stay honest when a message is sent?
 *   • Does the briefing lead with overdue work rather than new finds?
 *   • Did anything invented creep into the seed?
 *
 *   npm run build && npm start &
 *   BASE=http://localhost:3000 node scripts/test-lead-engine.mjs
 *
 * ORDER MATTERS. The state tests mutate the in-memory store, so the seed
 * integrity group runs FIRST, before anything has been changed.
 */

const BASE = process.env.BASE ?? "http://localhost:3000";

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

async function raw(path, init = {}) {
  return fetch(`${BASE}${path}`, { redirect: "manual", ...init });
}

async function send(path, method, body, cookie) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(cookie ? { Cookie: cookie } : {}),
    },
    body: JSON.stringify(body),
  });
  let data = null;
  try {
    data = await res.json();
  } catch {
    /* some responses have no body */
  }
  return { status: res.status, data };
}

async function login(email, password) {
  const res = await fetch(`${BASE}/api/portal/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const setCookie = res.headers.get("set-cookie") ?? "";
  const match = /rk_portal_session=([^;]+)/.exec(setCookie);
  return { ok: res.ok, cookie: match ? `rk_portal_session=${match[1]}` : null };
}

/**
 * Strips the HTML comment markers React puts between interpolated values, and
 * collapses whitespace. Without this, `{n} {word} written and not sent` renders
 * as `2<!-- -->messages are<!-- --> written and not sent` and every sensible
 * assertion about a sentence fails for a reason that has nothing to do with the
 * thing being tested.
 */
function text(html) {
  return html.replace(/<!--.*?-->/g, "").replace(/\s+/g, " ");
}

async function page(path, cookie) {
  const res = await fetch(`${BASE}${path}`, {
    redirect: "manual",
    headers: cookie ? { Cookie: cookie } : {},
  });
  const html = res.status === 200 ? await res.text() : "";
  return { status: res.status, html };
}

const owner = await login("chefrkearse@gmail.com", "chef2026");
const assistant = await login("assistant@chefrkearse.com", "desk2026");

if (!owner.cookie || !assistant.cookie) {
  console.error("Could not sign in — is the server running on " + BASE + "?");
  process.exit(1);
}

const ROUTES = [
  "/portal/briefing",
  "/portal/prospects",
  "/portal/signals",
  "/portal/venues",
  "/portal/outreach",
  "/portal/brain",
  "/portal/sweeps",
  "/portal/start",
];

/* ═════════════════════════ 1. Seed integrity — run first ════════════════ */

console.log("\nThe seed carries nothing invented");

const seedHtml = (await page("/portal/prospects", owner.cookie)).html;
const brainHtml = (await page("/portal/brain", owner.cookie)).html;
const venuesHtml = (await page("/portal/venues", owner.cookie)).html;
const dossier = (await page("/portal/prospects/p_glenallen", owner.cookie)).html;

/**
 * The five numbers the research actually verified. Anything phone-shaped outside
 * this list means somebody invented a contact, which is the single worst thing
 * that can happen to this engine's credibility.
 */
const ALLOWED_PHONES = new Set([
  "(804) 939-9246",
  "(844) 532-7724",
  "(804) 213-4577",
  "804.864.1466",
  "(804) 261-6211",
]);

const allHtml = seedHtml + brainHtml + venuesHtml + dossier;
const phoneLike = [...allHtml.matchAll(/\(?\d{3}\)?[ .-]\d{3}[.-]\d{4}/g)].map((m) => m[0]);
const strayPhones = [...new Set(phoneLike)].filter((p) => !ALLOWED_PHONES.has(p));

check(
  "every phone number on screen is one of the five the research verified",
  strayPhones.length === 0,
  strayPhones.join(", "),
);

check(
  "the two verified off-list fees are shown",
  venuesHtml.includes("$500") && venuesHtml.includes("$600"),
);

check(
  "the Glen Allen approved list is reproduced verbatim",
  venuesHtml.includes("A Sharper Palate") && venuesHtml.includes("Natalie&#x27;s Taste of Lebanon"),
);

check(
  "the dossier carries an opening question",
  dossier.includes("Open the call with this") && dossier.includes("thirteen names"),
);

check(
  "the dossier carries a Before you dial warning",
  dossier.includes("Before you dial"),
);

check(
  "a source note states what it does NOT establish",
  dossier.includes("are NOT published and are not claimed here"),
);

check(
  "the DECLINE prospect says DO NOT PURSUE",
  (await page("/portal/prospects/p_grcc", owner.cookie)).html.includes("DO NOT PURSUE"),
);

check(
  "the Kitchen Brain opens with unconfirmed credentials",
  brainHtml.includes("Not confirmed"),
);

check(
  "and says what the gaps block",
  brainHtml.includes("no venue application can go out"),
);

check("no price band is presented as real", !brainHtml.includes("per guest</span>"));

/* ═════════════════════════ 2. The signed-out stranger ═══════════════════ */

console.log("\nA signed-out stranger");

for (const route of ROUTES) {
  const res = await raw(route);
  check(`${route} is a 307 to sign-in, not a 200`, res.status === 307, String(res.status));
}

check(
  "a printable letter is behind sign-in too",
  (await raw("/print/outreach/out_0001")).status === 307,
);

const noAuth = [
  ["/api/portal/prospects", "POST"],
  ["/api/portal/prospects/p_glenallen", "PATCH"],
  ["/api/portal/signals", "PATCH"],
  ["/api/portal/venues/v_maymont", "PATCH"],
  ["/api/portal/outreach", "POST"],
  ["/api/portal/brain", "PATCH"],
];
for (const [path, method] of noAuth) {
  const { status } = await send(path, method, {}, null);
  check(`${method} ${path} returns 401 with no session`, status === 401, String(status));
}

/* ═════════════════════════ 3. Role isolation ════════════════════════════ */

console.log("\nWhat the assistant may and may not reach");

for (const route of ROUTES) {
  const res = await raw(route, { headers: { Cookie: owner.cookie } });
  check(`the owner reaches ${route}`, res.status === 200, String(res.status));
}

check(
  "the assistant is bounced from the Kitchen Brain",
  (await raw("/portal/brain", { headers: { Cookie: assistant.cookie } })).status === 307,
);
check(
  "the assistant is bounced from the search history",
  (await raw("/portal/sweeps", { headers: { Cookie: assistant.cookie } })).status === 307,
);
check(
  "but she reaches the call list",
  (await raw("/portal/prospects", { headers: { Cookie: assistant.cookie } })).status === 200,
);

check(
  "she cannot change the Kitchen Brain",
  (await send("/api/portal/brain", "PATCH", { brandName: "x" }, assistant.cookie)).status === 403,
);
check(
  "she cannot delete a prospect",
  (await send("/api/portal/prospects", "DELETE", { id: "p_vsae" }, assistant.cookie)).status === 403,
);

// The financial leak. Client component props are serialised into the page
// whether they render or not, so this asserts on the HTML rather than the view.
const assistantBoard = (await page("/portal/prospects", assistant.cookie)).html;
check(
  "no estimated value appears anywhere in the assistant's HTML",
  !/estValue|"value":\s*\d/.test(assistantBoard),
);

/* ═════════════════════════ 4. The hard cap ══════════════════════════════ */

console.log("\nThe hard cap — a prospect with no citation is a guess");

const perfect = {
  name: "Cap test — no source",
  category: "corporate",
  city: "Richmond",
  state: "VA",
  whyItFits: "A fixture for the cap test.",
  pitch: "A fixture.",
  openingQuestion: "A fixture?",
  suggestedAction: "Nothing — this is a test fixture.",
  scoreInput: {
    dateFit: "prime-open",
    freshness: "this-month",
    access: "named-decision-maker",
    spendEvidence: "disclosed-figure",
    distanceMiles: 5,
    repeatability: "recurring-list",
    incumbency: "open-lane",
    brandFit: "flagship",
    effort: "low",
  },
  sources: [],
};

const created = await send("/api/portal/prospects", "POST", perfect, owner.cookie);
check("a prospect can be added by hand", created.status === 200, String(created.status));
check(
  `a perfect prospect with no source is held at WARM (got ${created.data?.priority})`,
  created.data?.priority === "WARM",
);
check("its raw score is still 100 — the cap moves the band, not the number", created.data?.total === 100);
check("and it says why", typeof created.data?.cappedBy === "string" && created.data.cappedBy.length > 40);

const newId = created.data?.id;

const blankNote = await send(
  `/api/portal/prospects/${newId}`,
  "PATCH",
  {
    action: "source",
    source: {
      label: "Test",
      url: "https://example.com",
      kind: "organization",
      retrievedISO: "2026-10-01",
      note: "too short",
    },
  },
  owner.cookie,
);
check("a source with a thin note is refused", blankNote.status === 400, String(blankNote.status));
check(
  "and the message says the note must state what the source does not establish",
  String(blankNote.data?.error ?? "").includes("what it does not"),
);

const attached = await send(
  `/api/portal/prospects/${newId}`,
  "PATCH",
  {
    action: "source",
    source: {
      label: "A real source",
      url: "https://example.com",
      kind: "organization",
      retrievedISO: "2026-10-01",
      note: "Establishes that this fixture exists. It does NOT establish anything about a real business, because it is a test.",
    },
  },
  owner.cookie,
);
check("attaching a proper source succeeds", attached.status === 200);
check(`and lifts it to HOT (got ${attached.data?.priority})`, attached.data?.priority === "HOT");
check("and clears the cap", attached.data?.cappedBy === null);
check("and the source count is 1", attached.data?.sourceCount === 1);

/* ═════════════════════════ 5. Closed work leaves the queue ══════════════ */

console.log("\nA closed prospect stops being overdue");

await send(
  `/api/portal/prospects/${newId}`,
  "PATCH",
  { action: "nextAction", iso: "2026-01-01" },
  owner.cookie,
);
const overdueHtml = (await page("/portal/briefing", owner.cookie)).html;
check("an overdue prospect reaches the briefing", overdueHtml.includes("Cap test"));
check("and the briefing leads with overdue, not with new finds", overdueHtml.includes("past their own action-by date") || overdueHtml.includes("past its own action-by date"));

const won = await send(`/api/portal/prospects/${newId}`, "PATCH", { action: "status", status: "won" }, owner.cookie);
check("marking it won clears its action date", won.data?.nextActionBy === null);
// It still appears under "new this week" — correctly, it IS new. What matters
// is that it has left the overdue section at the top.
const afterWon = (await page("/portal/briefing", owner.cookie)).html;
check(
  "and it drops out of the overdue section",
  !/Overdue — \d+[\s\S]{0,4000}?Cap test/.test(afterWon),
);
check(
  "and the briefing no longer leads with overdue",
  !afterWon.includes("past their own action-by date") &&
    !afterWon.includes("past its own action-by date"),
);

/* ═════════════════════════ 6. Derived counts ════════════════════════════ */

console.log("\nThe outreach numbers derive, so they cannot drift");

const before = (await page("/portal/outreach", owner.cookie)).html;
check(
  "two seeded messages are waiting",
  text(before).includes("2 messages are written and not sent"),
);
check(
  "and that is the first thing on the page",
  before.indexOf("This is the thing to do") < before.indexOf("Written in total"),
);

const sent = await send("/api/portal/outreach", "PATCH", { id: "out_0001", status: "sent" }, owner.cookie);
check("a message can be marked sent", sent.status === 200);
check("and the server stamps the date, not the client", typeof sent.data?.sentISO === "string");
check("and records who sent it", sent.data?.sentBy === "owner");

const replied = await send("/api/portal/outreach", "PATCH", { id: "out_0001", status: "replied" }, owner.cookie);
check("marking it replied keeps it counted as reached", replied.status === 200);

const after = (await page("/portal/outreach", owner.cookie)).html;
check(
  "only one is waiting now",
  text(after).includes("1 message is written and not sent"),
);

/* ═════════════════════════ 7. Signals ═══════════════════════════════════ */

console.log("\nTriage");

const noReason = await send("/api/portal/signals", "PATCH", { action: "dismiss", id: "sig_0001", reason: "" }, owner.cookie);
check("dismissing without a reason is refused", noReason.status === 400, String(noReason.status));
check(
  "and says why a reason is wanted",
  String(noReason.data?.error ?? "").includes("teaches the rules nothing"),
);

const dismissed = await send(
  "/api/portal/signals",
  "PATCH",
  { action: "dismiss", id: "sig_0001", reason: "Out of radius." },
  owner.cookie,
);
check("dismissing with a reason works", dismissed.status === 200);

const promoted = await send("/api/portal/signals", "PATCH", { action: "promote", id: "sig_0002" }, owner.cookie);
check("promoting creates a prospect", promoted.status === 200 && Boolean(promoted.data?.prospectId));
check(
  "and the new prospect is not HOT, because nobody has researched it",
  promoted.data?.priority !== "HOT",
  String(promoted.data?.priority),
);

const promotedPage = (await page(`/portal/prospects/${promoted.data?.prospectId}`, owner.cookie)).html;
check(
  "it carries the signal as a source, with an honest note",
  promotedPage.includes("It does NOT establish that the organisation needs catering"),
);
check(
  "and its approach scripts are blank rather than invented",
  promotedPage.includes("Nothing written yet"),
);

check(
  "promoting the same signal twice is refused",
  (await send("/api/portal/signals", "PATCH", { action: "promote", id: "sig_0002" }, owner.cookie)).status === 404,
);

/* ═════════════════════════ 8. Venues ════════════════════════════════════ */

console.log("\nVenues");

const applied = await send("/api/portal/venues/v_smv", "PATCH", { action: "status", status: "applied" }, owner.cookie);
check("a venue can be marked as asked", applied.status === 200);
check("and the server stamps the date", typeof applied.data?.appliedISO === "string");

const d1 = await send("/api/portal/venues/v_smv", "PATCH", { action: "diff", added: ["New Name"], removed: [] }, owner.cookie);
check("a change to their list can be recorded", d1.data?.diffs === 1);
const d2 = await send("/api/portal/venues/v_smv", "PATCH", { action: "diff", added: [], removed: ["New Name"] }, owner.cookie);
check("a second change appends rather than replacing", d2.data?.diffs === 2);

check(
  "an empty diff is refused",
  (await send("/api/portal/venues/v_smv", "PATCH", { action: "diff", added: [], removed: [] }, owner.cookie)).status === 400,
);

/* ═════════════════════════ 9. The Kitchen Brain ═════════════════════════ */

console.log("\nThe Kitchen Brain cannot be half-confirmed");

const lone = await send("/api/portal/brain", "PATCH", { liabilityInsuranceLimit: 1000000 }, owner.cookie);
check("confirming a credential alone is refused", lone.status === 400, String(lone.status));
check(
  "and explains that the open item must clear in the same save",
  String(lone.data?.error ?? "").includes("CONFIRM WITH CLIENT"),
);

const unknownField = await send("/api/portal/brain", "PATCH", { somethingElse: true }, owner.cookie);
check("an unknown field is rejected rather than silently ignored", unknownField.status === 400);

/* ═════════════════════════ 10. The approach scripts ═════════════════════ */

console.log("\nApproach scripts");

check("the dossier carries all five channels", dossier.includes("On the phone") && dossier.includes("By email") && dossier.includes("In person") && dossier.includes("On social") && dossier.includes("By text"));
check("they are collapsed, not open", (dossier.match(/<details class="p-approach"(?! open)/g) ?? []).length >= 1 || !dossier.includes('class="p-approach" open'));
check("a channel that would hurt him is marked Don't", dossier.includes("Don&#x27;t") || dossier.includes("Don't"));
check(
  "and the social one explains itself instead of carrying a script",
  dossier.includes("Not written on purpose"),
);
check(
  "the board does NOT carry the scripts",
  !seedHtml.includes("Not written on purpose"),
);

/* ═════════════════════════ 11. Noindex ══════════════════════════════════ */

console.log("\nStill out of the index");

for (const route of ["/portal/prospects", "/portal/venues", "/portal/briefing"]) {
  const html = (await page(route, owner.cookie)).html;
  check(`${route} is noindex`, html.includes("noindex"));
}

const sitemap = await (await fetch(`${BASE}/sitemap.xml`)).text();
check("the sitemap lists no part of the lead engine", !sitemap.includes("/portal/") && !sitemap.includes("/print/"));

console.log(`\n${pass} passed, ${fail} failed\n`);
process.exit(fail === 0 ? 0 : 1);
