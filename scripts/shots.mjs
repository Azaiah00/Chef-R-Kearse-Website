import { chromium } from "playwright";
import fs from "node:fs";

const BASE = process.env.BASE || "http://localhost:3211";
const OUT = process.env.OUT || "/tmp/shots";
const MODE = process.env.MODE || "layout"; // "layout" | "motion"
const routes = (
  process.env.ROUTES ||
  "/,/experiences,/menus,/weddings,/gallery,/about,/faq,/contact,/book,/nope-404"
).split(",");

const sizes =
  process.env.SIZES === "desktop"
    ? [{ name: "desktop", width: 1440, height: 900, dsf: 1 }]
    : [
        { name: "mobile", width: 390, height: 844, dsf: 2 },
        { name: "tablet", width: 834, height: 1112, dsf: 2 },
        { name: "desktop", width: 1440, height: 900, dsf: 1 },
      ];

fs.mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch();
const errors = [];

for (const s of sizes) {
  const ctx = await browser.newContext({
    viewport: { width: s.width, height: s.height },
    deviceScaleFactor: s.dsf,
    isMobile: s.name === "mobile",
    hasTouch: s.name !== "desktop",
    // Layout pass turns motion off so every reveal is painted and pinned
    // sections lay out normally — otherwise a full-page capture is mostly
    // pin-spacer whitespace.
    reducedMotion: MODE === "layout" ? "reduce" : "no-preference",
  });
  const page = await ctx.newPage();
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(`[${s.name}] console: ${m.text()}`);
  });
  page.on("pageerror", (e) => errors.push(`[${s.name}] pageerror: ${e.message}`));
  page.on("requestfailed", (r) =>
    errors.push(`[${s.name}] requestfailed: ${r.url()} — ${r.failure()?.errorText}`)
  );

  for (const route of routes) {
    const res = await page.goto(BASE + route, { waitUntil: "load", timeout: 45000 });
    const expected404 = route.includes("nope-404");
    const status = res?.status() ?? 0;
    if (!expected404 && status >= 400) errors.push(`[${s.name}] ${route} -> ${status}`);
    if (expected404 && status !== 404) errors.push(`[${s.name}] 404 page returned ${status}`);

    await page.evaluate(async () => {
      const step = window.innerHeight * 0.85;
      for (let y = 0; y < document.body.scrollHeight; y += step) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 120));
      }
      window.scrollTo(0, 0);
      await new Promise((r) => setTimeout(r, 300));
    });
    await page.waitForTimeout(600);

    const slug = route === "/" ? "home" : route.replace(/\//g, "-").slice(1);

    if (MODE === "layout") {
      await page.screenshot({ path: `${OUT}/${slug}--${s.name}.png`, fullPage: true });
    } else {
      // Stepped viewport captures — what a person actually sees, with motion on.
      const h = await page.evaluate(() => document.body.scrollHeight);
      const frames = Math.min(10, Math.ceil(h / s.height));
      for (let i = 0; i < frames; i++) {
        await page.evaluate((y) => window.scrollTo(0, y), i * s.height * 0.92);
        await page.waitForTimeout(950);
        await page.screenshot({ path: `${OUT}/motion-${slug}--${s.name}-${i}.png` });
      }
    }

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth
    );
    if (overflow > 2) errors.push(`[${s.name}] ${route} horizontal overflow ${overflow}px`);

    // Tap-target audit: anything interactive under 44px on mobile
    if (s.name === "mobile") {
      const small = await page.evaluate(() => {
        const out = [];
        document
          .querySelectorAll("a[href], button, input, select, textarea, [role='button']")
          .forEach((el) => {
            const r = el.getBoundingClientRect();
            if (r.width === 0 && r.height === 0) return;
            const style = getComputedStyle(el);
            if (style.visibility === "hidden" || style.display === "none") return;
            if (r.height < 40 || r.width < 40) {
              out.push(
                `${el.tagName.toLowerCase()}"${(el.textContent || "").trim().slice(0, 26)}" ${Math.round(
                  r.width
                )}x${Math.round(r.height)}`
              );
            }
          });
        return out.slice(0, 12);
      });
      small.forEach((t) => errors.push(`[tap] ${route} ${t}`));
    }
  }
  await ctx.close();
}

await browser.close();
fs.writeFileSync(`${OUT}/errors.txt`, errors.join("\n") || "none");
console.log(errors.length ? errors.join("\n") : "NO ERRORS");
