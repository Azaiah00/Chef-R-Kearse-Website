/**
 * Portal end-to-end and security tests.
 *
 * Runs against a production server on BASE (default http://localhost:3000).
 * Covers the things that would actually hurt if they were wrong:
 *   • Can a signed-out stranger reach any portal page or API?
 *   • Can the assistant reach the owner's settings, or change a band?
 *   • Does a guest with one valid magic link reach another guest's event?
 *   • Does the intake form score, route and record an enquiry correctly?
 *   • Is a locked menu actually locked?
 *   • Is the portal kept out of the sitemap and marked no-index?
 *
 *   npm run build && npm start &
 *   node scripts/test-portal.mjs
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

/** fetch without following redirects, so we can assert on the 307 itself. */
async function raw(path, init = {}) {
  return fetch(`${BASE}${path}`, { redirect: "manual", ...init });
}

async function json(path, body, cookie) {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
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

/* ══════════════════════════════════════════════════ 1. Unauthenticated ═══ */

console.log("\nA signed-out stranger");

const PORTAL_PAGES = [
  "/portal",
  "/portal/leads",
  "/portal/messages",
  "/portal/events",
  "/portal/menus",
  "/portal/marketing",
  "/portal/audience",
  "/portal/settings",
];

for (const path of PORTAL_PAGES) {
  const res = await raw(path);
  const loc = res.headers.get("location") ?? "";
  check(
    `is redirected away from ${path}`,
    res.status >= 300 && res.status < 400 && loc.includes("/portal/login"),
    `got ${res.status} to ${loc || "(no location)"}`,
  );
}

const loginPage = await raw("/portal/login");
check("can reach the sign-in page", loginPage.status === 200, `got ${loginPage.status}`);

console.log("\nEvery portal API rejects an unauthenticated call");
const unauthCalls = [
  ["/api/portal/leads/l_001", { action: "note", actor: "x", body: "test" }],
  ["/api/portal/events/l_001", { action: "toggle-run-sheet", itemId: "r1" }],
  ["/api/portal/marketing", { action: "regenerate", weekOf: "2026-01-05" }],
  ["/api/portal/settings", { action: "assistant-financials", value: true }],
  ["/api/portal/messages", { leadId: "l_001", as: "staff", authorName: "x", body: "hi" }],
];
for (const [path, body] of unauthCalls) {
  const { status } = await json(path, body);
  check(`${path} returns 401`, status === 401, `got ${status}`);
}

console.log("\nBad credentials");
const wrongPw = await login("chefrkearse@gmail.com", "not-the-password");
check("a wrong password is refused", !wrongPw.ok && wrongPw.cookie === null);
const noSuchUser = await login("nobody@example.com", "chef2026");
check("an unknown address is refused", !noSuchUser.ok && noSuchUser.cookie === null);

const forged = await json(
  "/api/portal/leads/l_001",
  { action: "note", actor: "x", body: "test" },
  "rk_portal_session=eyJ1c2VySWQiOiJ1X293bmVyIn0.forged-signature",
);
check("a forged session cookie is refused", forged.status === 401, `got ${forged.status}`);

/* ══════════════════════════════════════════════════════════ 2. Owner ═══ */

console.log("\nThe owner signs in");
const owner = await login("chefrkearse@gmail.com", "chef2026");
check("the owner can sign in", owner.ok && owner.cookie !== null);

if (!owner.cookie) {
  console.error("\nCannot continue without an owner session.\n");
  process.exit(1);
}

for (const path of PORTAL_PAGES) {
  const res = await raw(path, { headers: { Cookie: owner.cookie } });
  check(`the owner can open ${path}`, res.status === 200, `got ${res.status}`);
}

console.log("\nThe owner's own actions");
const note = await json(
  "/api/portal/leads/l_001",
  { action: "note", actor: "ignored", body: "Test note from the QA script." },
  owner.cookie,
);
check("can add a note", note.status === 200, `got ${note.status}`);

const override = await json(
  "/api/portal/leads/l_006",
  { action: "override", actor: "ignored", band: "B", reason: "QA test override." },
  owner.cookie,
);
check("can override a band", override.status === 200, `got ${override.status}`);

const badAction = await json("/api/portal/leads/l_001", { action: "nonsense" }, owner.cookie);
check("an unrecognised action is rejected", badAction.status === 400, `got ${badAction.status}`);

const missingLead = await json(
  "/api/portal/leads/does-not-exist",
  { action: "note", actor: "x", body: "hello" },
  owner.cookie,
);
check("a missing enquiry returns 404", missingLead.status === 404, `got ${missingLead.status}`);

const sentAttempt = await json(
  "/api/portal/marketing",
  { action: "status", id: "anything", status: "sent" },
  owner.cookie,
);
check(
  "nobody can mark a campaign item as sent by hand",
  sentAttempt.status === 403,
  `got ${sentAttempt.status}`,
);

/* ══════════════════════════════════════════════════════ 3. Assistant ═══ */

console.log("\nThe assistant signs in");
const assistant = await login("assistant@chefrkearse.com", "desk2026");
check("the assistant can sign in", assistant.ok && assistant.cookie !== null);

if (assistant.cookie) {
  const settings = await raw("/portal/settings", { headers: { Cookie: assistant.cookie } });
  const loc = settings.headers.get("location") ?? "";
  check(
    "the assistant is redirected away from Settings",
    settings.status >= 300 && settings.status < 400 && loc.includes("/portal") && !loc.includes("settings"),
    `got ${settings.status} to ${loc || "(no location)"}`,
  );

  const settingsApi = await json(
    "/api/portal/settings",
    { action: "assistant-financials", value: true },
    assistant.cookie,
  );
  check(
    "the assistant cannot change settings through the API",
    settingsApi.status === 403,
    `got ${settingsApi.status}`,
  );

  const assistantOverride = await json(
    "/api/portal/leads/l_003",
    { action: "override", actor: "x", band: "A", reason: "Should not be allowed." },
    assistant.cookie,
  );
  check(
    "the assistant cannot override a band",
    assistantOverride.status === 403,
    `got ${assistantOverride.status}`,
  );

  const desk = await raw("/portal", { headers: { Cookie: assistant.cookie } });
  check("the assistant can open her own desk", desk.status === 200, `got ${desk.status}`);

  // The financial gate is a data gate, not a CSS gate: with the toggle off the
  // figures must not appear anywhere in the HTML sent to her browser.
  const leadsHtml = await (await fetch(`${BASE}/portal/leads`, { headers: { Cookie: assistant.cookie } })).text();
  check(
    "no revenue figure is sent to the assistant's browser",
    !leadsHtml.includes("$9,600") && !leadsHtml.includes("9600"),
    "a booked value appeared in her HTML",
  );

  const ownerLeadsHtml = await (await fetch(`${BASE}/portal/leads`, { headers: { Cookie: owner.cookie } })).text();
  check(
    "the same figure IS sent to the owner",
    ownerLeadsHtml.includes("$9,600"),
    "the owner's page is missing the booked value",
  );
}

/* ═════════════════════════════════════════════════ 4. Client portal ═══ */

console.log("\nThe guest's magic link");
const goodLink = await raw("/my-event/demo-danielle-brooks");
check("a valid link opens without signing in", goodLink.status === 200, `got ${goodLink.status}`);

const badLinkRes = await fetch(`${BASE}/my-event/not-a-real-token`);
const badLinkHtml = await badLinkRes.text();
check("an invalid link gets a helpful page, not portal data", /not working/i.test(badLinkHtml));
check("the invalid-link page leaks no guest data", !badLinkHtml.includes("Danielle") && !badLinkHtml.includes("Marcus"));
check("the invalid-link page offers the phone number", badLinkHtml.includes("939-9246"));

const crossTenant = await json("/api/portal/messages", {
  leadId: "l_002",
  as: "client",
  authorName: "Attacker",
  body: "Can I read someone else's event?",
  token: "demo-danielle-brooks",
});
check(
  "one guest's token cannot post into another guest's event",
  crossTenant.status === 403,
  `got ${crossTenant.status}`,
);

const noToken = await json("/api/portal/messages", {
  leadId: "l_001",
  as: "client",
  authorName: "Attacker",
  body: "No token at all.",
});
check("a client message with no token is refused", noToken.status === 401, `got ${noToken.status}`);

const clientMsg = await json("/api/portal/messages", {
  leadId: "l_001",
  as: "client",
  authorName: "Danielle Brooks",
  body: "QA test message from the guest side.",
  token: "demo-danielle-brooks",
});
check("a guest can send with their own token", clientMsg.status === 200, `got ${clientMsg.status}`);

console.log("\nMenu locking is enforced server-side");
const lockedEdit = await json("/api/portal/menus/m_001", {
  action: "select",
  as: "client",
  authorName: "Danielle Brooks",
  token: "demo-danielle-brooks",
  courseId: "m1c1",
  slugs: ["clam-chowder"],
});
check(
  "a locked menu refuses an edit",
  lockedEdit.status === 409,
  `got ${lockedEdit.status}`,
);

const clientLockAttempt = await json("/api/portal/menus/m_002", {
  action: "status",
  as: "client",
  authorName: "Marcus Webb",
  token: "demo-marcus-webb",
  status: "locked",
});
check(
  "a guest cannot lock their own menu",
  clientLockAttempt.status === 403,
  `got ${clientLockAttempt.status}`,
);

const crossMenu = await json("/api/portal/menus/m_002", {
  action: "select",
  as: "client",
  authorName: "Attacker",
  token: "demo-danielle-brooks",
  courseId: "m2c1",
  slugs: ["garden-salad"],
});
check(
  "one guest's token cannot edit another guest's menu",
  crossMenu.status === 403,
  `got ${crossMenu.status}`,
);

/* ════════════════════════════════════════════ 5. Intake and scoring ═══ */

console.log("\nThe intake form, end to end");

const strongEnquiry = {
  service: "Wedding",
  date: new Date(Date.now() + 70 * 86_400_000).toISOString().slice(0, 10),
  flexibility: "That date exactly",
  guests: "31–75",
  place: "Richmond, VA",
  notes:
    "We are getting married in the autumn and we care much more about the food than anything else at the wedding. Around fifty guests, mostly family, and we would love a plated dinner with a seafood course. A friend recommended Chef Kearse after eating at her anniversary.",
  dietary: "Two vegetarians, one shellfish allergy.",
  name: "QA Strong Enquiry",
  email: "qa-strong@example.com",
  phone: "(804) 555-0999",
  company: "",
  eventType: "wedding",
  guestCount: 50,
  venueType: "rented-venue",
  budgetBand: "200-plus",
  decisionMaker: "yes",
  source: "referral",
  dateFlexible: false,
  depositOk: true,
  callOk: true,
  elapsedMs: 45_000,
};

const strong = await json("/api/inquiry", strongEnquiry);
check("a strong enquiry is accepted", strong.status === 200 && strong.data?.ok === true, `got ${strong.status}`);
check("it is scored band A", strong.data?.band === "A", `got band ${strong.data?.band}`);
check("it is given a reference", typeof strong.data?.ref === "string" && strong.data.ref.startsWith("RK-"), `got ${strong.data?.ref}`);

const weak = await json("/api/inquiry", {
  ...strongEnquiry,
  name: "QA Weak Enquiry",
  email: "qa-weak@example.com",
  phone: "(804) 555-0001",
  notes: "how much",
  eventType: "other",
  guestCount: 2,
  venueType: "undecided",
  budgetBand: "under-75",
  decisionMaker: "no",
  source: "other",
  depositOk: false,
  callOk: false,
  date: new Date(Date.now() + 4 * 86_400_000).toISOString().slice(0, 10),
});
check("a weak enquiry is still accepted politely", weak.status === 200, `got ${weak.status}`);
check("it is scored band D", weak.data?.band === "D", `got band ${weak.data?.band}`);

const capped = await json("/api/inquiry", {
  ...strongEnquiry,
  name: "QA Below Floor",
  email: "qa-capped@example.com",
  budgetBand: "under-75",
});
check(
  "an otherwise perfect enquiry below the budget floor is capped at B",
  capped.data?.band === "B",
  `got band ${capped.data?.band}`,
);

const honeypot = await json("/api/inquiry", {
  ...strongEnquiry,
  name: "QA Bot",
  email: "qa-bot@example.com",
  company: "filled in by a bot",
});
check("a filled honeypot is silently dropped", honeypot.data?.skipped === true, JSON.stringify(honeypot.data));

const tooFast = await json("/api/inquiry", {
  ...strongEnquiry,
  name: "QA Fast",
  email: "qa-fast@example.com",
  elapsedMs: 400,
});
check("a submission faster than a human is dropped", tooFast.data?.skipped === true, JSON.stringify(tooFast.data));

const malformed = await json("/api/inquiry", { name: "only a name" });
check("a malformed payload is rejected", malformed.status === 400, `got ${malformed.status}`);

console.log("\nThe new enquiries appear in the portal");
const leadsAfter = await (await fetch(`${BASE}/portal/leads`, { headers: { Cookie: owner.cookie } })).text();
check("the band A enquiry is in the pipeline", leadsAfter.includes("QA Strong Enquiry"));
check("the band D enquiry is recorded, not discarded", leadsAfter.includes("QA Weak Enquiry"));
check("the capped enquiry is recorded", leadsAfter.includes("QA Below Floor"));
check("the honeypot submission was never recorded", !leadsAfter.includes("QA Bot"));
check("the too-fast submission was never recorded", !leadsAfter.includes("QA Fast"));

/* ══════════════════════════════════════════════ 6. SEO and hygiene ═══ */

console.log("\nSearch-engine hygiene");
const sitemap = await (await fetch(`${BASE}/sitemap.xml`)).text();
check("the sitemap does not list the portal", !sitemap.includes("/portal"));
check("the sitemap does not list guest event pages", !sitemap.includes("/my-event"));
check("the sitemap still lists the public pages", sitemap.includes("/menus") && sitemap.includes("/weddings"));

const loginHtml = await (await fetch(`${BASE}/portal/login`)).text();
check("the sign-in page is marked no-index", /noindex/i.test(loginHtml));

const eventHtml = await (await fetch(`${BASE}/my-event/demo-danielle-brooks`)).text();
check("a guest event page is marked no-index", /noindex/i.test(eventHtml));

const dashHtml = await (await fetch(`${BASE}/portal`, { headers: { Cookie: owner.cookie } })).text();
check("the portal is marked no-index", /noindex/i.test(dashHtml));
check("the demo-data banner is shown", /Demo data/i.test(dashHtml));

console.log("\nCampaign creative is actually served");
const assets = [
  "/marketing/chef-r-kearse-marketing-plan.md",
  "/marketing/email/corporate-holiday-01-the-pitch.html",
  "/marketing/email/wedding-03-venue-partner.html",
  "/marketing/ads/corporate-holiday-ads.md",
  "/marketing/prompts/wedding-season-prompts.md",
  "/marketing/social/open-weekend-sms-stories.md",
];
for (const a of assets) {
  const res = await fetch(`${BASE}${a}`);
  check(`${a} is served`, res.status === 200, `got ${res.status}`);
}

const emailHtml = await (await fetch(`${BASE}/marketing/email/corporate-holiday-01-the-pitch.html`)).text();
check("every email carries an unsubscribe link", emailHtml.includes("{{unsubscribe_url}}"));
check("no emoji in the email creative", !/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u.test(emailHtml));

console.log("\nSign out");
const logout = await fetch(`${BASE}/api/portal/logout`, { method: "POST", headers: { Cookie: owner.cookie } });
const cleared = logout.headers.get("set-cookie") ?? "";
check("signing out clears the cookie", /rk_portal_session=;|Max-Age=0/.test(cleared), cleared);

console.log(`\n${pass} passed, ${fail} failed\n`);
process.exit(fail === 0 ? 0 : 1);
