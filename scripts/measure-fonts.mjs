import { chromium } from "playwright";
const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto(process.argv[2] || "http://localhost:3220/", { waitUntil: "load" });
await page.evaluate(() => document.fonts.ready);
const res = await page.evaluate(() => {
  const mk = (family, extra) => {
    const s = document.createElement("span");
    s.textContent = "Your invitation to the perfect catered affair. Handgloves 0123456789";
    s.style.cssText = `position:absolute;left:-9999px;white-space:nowrap;font-size:100px;font-family:${family};${extra || ""}`;
    document.body.appendChild(s);
    const w = s.getBoundingClientRect().width;
    const h = s.getBoundingClientRect().height;
    s.remove();
    return { w, h };
  };
  const out = {};
  for (const opsz of [14, 24, 96, 144]) {
    out["fraunces_opsz" + opsz] = mk('"Fraunces Variable"', `font-variation-settings:"opsz" ${opsz};`);
  }
  out.liberationSerif = mk("'Liberation Serif'", "");
  out.frauncesFallback = mk('"Fraunces Fallback"', "");
  out.inter = mk('"Inter Variable"', "");
  out.liberationSans = mk("'Liberation Sans'", "");
  out.interFallback = mk('"Inter Fallback"', "");
  return out;
});
for (const [k, v] of Object.entries(res)) console.log(k.padEnd(20), Math.round(v.w), "x", Math.round(v.h));
const ls = res.liberationSerif.w;
for (const opsz of [14, 24, 96, 144]) {
  console.log("ideal size-adjust for opsz", opsz, ((res["fraunces_opsz" + opsz].w / ls) * 100).toFixed(2) + "%");
}
console.log("inter ideal size-adjust", ((res.inter.w / res.liberationSans.w) * 100).toFixed(2) + "%");
await browser.close();
