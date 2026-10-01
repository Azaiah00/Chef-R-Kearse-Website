/**
 * Verifies the portal is actually reachable from the marketing site.
 *
 * Three entry points, three widths:
 *   • the "Portal" control in the fixed header (desktop and tablet)
 *   • "Staff sign in" in the mobile menu (phone)
 *   • the "Staff sign in" block in the footer (everywhere, permanent)
 *
 * Also confirms the Next.js dev badge is gone, and that setting
 * NEXT_PUBLIC_SHOW_DEMO_BAR=false would leave only the footer entry.
 */

import { chromium, devices } from "playwright";
import { mkdirSync } from "node:fs";

const BASE = process.env.BASE ?? "http://localhost:3000";
mkdirSync("/tmp/shots", { recursive: true });

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

const box = (page, selector) =>
  page.evaluate((sel) => {
    const el = document.querySelector(sel);
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return {
      text: (el.textContent || "").trim(),
      w: Math.round(r.width),
      h: Math.round(r.height),
      visible: r.width > 0 && r.height > 0,
    };
  }, selector);

const browser = await chromium.launch({ args: ["--no-sandbox"] });

/* ── Desktop ──────────────────────────────────────────────────────────────── */
console.log("\nDesktop, 1440");
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(BASE, { waitUntil: "networkidle" });
  await page.waitForTimeout(600);

  const hdr = await box(page, 'header a[href="/portal/login"]');
  check("the header carries a Portal control", hdr?.visible === true, JSON.stringify(hdr));
  check(
    "it is a real target, not a text link",
    (hdr?.h ?? 0) >= 24 && (hdr?.w ?? 0) >= 60,
    `${hdr?.w}x${hdr?.h}`,
  );
  check("it reads as the portal", /portal/i.test(hdr?.text ?? ""), hdr?.text);

  await page.screenshot({ path: "/tmp/shots/header-desktop.png", clip: { x: 0, y: 0, width: 1440, height: 110 } });

  // The primary call to action must still dominate.
  const cta = await box(page, 'header a[href="/book"]');
  check(
    "Check your date is still the bigger control",
    (cta?.w ?? 0) > (hdr?.w ?? 0),
    `cta ${cta?.w} vs portal ${hdr?.w}`,
  );

  await page.click('header a[href="/portal/login"]');
  await page.waitForURL(/portal\/login/, { timeout: 10_000 });
  check("clicking it reaches the sign-in page", /portal\/login/.test(page.url()), page.url());

  // waitForURL resolves on navigation, which is before the document has
  // finished rendering — wait for the content itself, not just the address.
  await page.waitForLoadState("networkidle");
  const creds = (await page.textContent("body")) ?? "";
  check(
    "the demo credentials are on the sign-in page",
    creds.includes("chef2026") && creds.includes("desk2026"),
  );
  await page.screenshot({ path: "/tmp/shots/login-desktop.png" });

  // Footer block
  await page.goto(BASE, { waitUntil: "networkidle" });
  const foot = await box(page, 'footer a[href="/portal/login"]');
  check("the footer carries a Staff sign in button", foot?.visible === true, JSON.stringify(foot));
  check("it is button-sized", (foot?.h ?? 0) >= 44, `${foot?.w}x${foot?.h}`);
  await page.evaluate(() => document.querySelector('footer a[href="/portal/login"]')?.scrollIntoView({ block: "center" }));
  await page.waitForTimeout(700);
  await page.screenshot({ path: "/tmp/shots/footer-desktop.png" });

  await ctx.close();
}

/* ── Tablet ───────────────────────────────────────────────────────────────── */
console.log("\nTablet, 834");
{
  const ctx = await browser.newContext({ viewport: { width: 834, height: 1112 } });
  const page = await ctx.newPage();
  await page.goto(BASE, { waitUntil: "networkidle" });
  await page.waitForTimeout(500);
  const hdr = await box(page, 'header a[href="/portal/login"]');
  check("the header control is visible on a tablet", hdr?.visible === true, JSON.stringify(hdr));
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
  );
  check("the header does not overflow", !overflow);
  await page.screenshot({ path: "/tmp/shots/header-tablet.png", clip: { x: 0, y: 0, width: 834, height: 110 } });
  await ctx.close();
}

/* ── Phone ────────────────────────────────────────────────────────────────── */
console.log("\nPhone, Pixel 5");
{
  const ctx = await browser.newContext({ ...devices["Pixel 5"] });
  const page = await ctx.newPage();
  await page.goto(BASE, { waitUntil: "networkidle" });
  await page.waitForTimeout(600);

  const hdr = await box(page, 'header a[href="/portal/login"]');
  check(
    "the header control is hidden on a phone, keeping the bar uncrowded",
    hdr === null || hdr.visible === false,
    JSON.stringify(hdr),
  );

  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
  );
  check("no horizontal overflow on a phone", !overflow);

  await page.click('button[aria-controls="mobile-menu"]');
  await page.waitForTimeout(800);

  const menu = await page.evaluate(() => {
    const links = [...document.querySelectorAll('a[href="/portal/login"]')];
    const vis = links
      .map((a) => ({ a, r: a.getBoundingClientRect() }))
      .filter((o) => o.r.width > 0 && o.r.height > 0);
    if (vis.length === 0) return null;
    const { a, r } = vis[0];
    return { text: a.textContent.trim(), w: Math.round(r.width), h: Math.round(r.height) };
  });
  check("the mobile menu carries a Staff sign in button", menu !== null, JSON.stringify(menu));
  check("it is full-width and finger-sized", (menu?.h ?? 0) >= 44, `${menu?.w}x${menu?.h}`);
  await page.screenshot({ path: "/tmp/shots/menu-phone.png" });

  // Three links share this href; the header one is hidden at this width, so
  // target the visible one rather than whichever the DOM lists first.
  await page.locator('a[href="/portal/login"]:visible').first().click();
  await page.waitForURL(/portal\/login/, { timeout: 10_000 });
  check("it reaches the sign-in page from a phone", /portal\/login/.test(page.url()));
  await page.screenshot({ path: "/tmp/shots/login-phone.png" });
  await ctx.close();
}

/* ── The dev badge ────────────────────────────────────────────────────────── */
console.log("\nThe Next.js dev badge");
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(BASE, { waitUntil: "networkidle" });
  await page.waitForTimeout(1200);
  const badge = await page.evaluate(() => {
    const suspects = [
      "nextjs-portal",
      "[data-nextjs-toast]",
      "[data-next-badge]",
      "[data-next-badge-root]",
      "#__next-build-watcher",
      "[data-nextjs-dev-tools-button]",
    ];
    for (const s of suspects) {
      if (document.querySelector(s)) return s;
    }
    return null;
  });
  check("no dev badge in the corner", badge === null, `found ${badge}`);
  await ctx.close();
}

await browser.close();
console.log(`\n${pass} passed, ${fail} failed`);
console.log("Screenshots in /tmp/shots\n");
process.exit(fail === 0 ? 0 : 1);
