import { chromium, devices } from "playwright";
const url = process.argv[2];
const browser = await chromium.launch();
const ctx = await browser.newContext({ ...devices["Pixel 5"] });
const page = await ctx.newPage();
const cdp = await ctx.newCDPSession(page);
await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
await cdp.send("Network.enable");
await cdp.send("Network.emulateNetworkConditions", {
  offline: false, latency: 150, downloadThroughput: (1.6 * 1024 * 1024) / 8, uploadThroughput: (750 * 1024) / 8,
});
await page.addInitScript(() => {
  window.__shifts = [];
  new PerformanceObserver((l) => {
    for (const e of l.getEntries()) {
      if (e.hadRecentInput) continue;
      window.__shifts.push({
        value: e.value, t: Math.round(e.startTime),
        sources: (e.sources || []).map((s) => ({
          tag: s.node ? s.node.tagName : "?",
          cls: s.node && s.node.className ? String(s.node.className).slice(0, 70) : "",
          prevY: s.previousRect ? Math.round(s.previousRect.y) : null,
          curY: s.currentRect ? Math.round(s.currentRect.y) : null,
          prevH: s.previousRect ? Math.round(s.previousRect.height) : null,
          curH: s.currentRect ? Math.round(s.currentRect.height) : null,
        })),
      });
    }
  }).observe({ type: "layout-shift", buffered: true });
});
await page.goto(url, { waitUntil: "load", timeout: 60000 });
await page.waitForTimeout(6000);
const s = await page.evaluate(() => window.__shifts);
console.log("total", s.reduce((a, b) => a + b.value, 0).toFixed(4));
for (const x of s) {
  console.log(" ", x.value.toFixed(4), "@", x.t + "ms");
  for (const src of x.sources.slice(0, 4))
    console.log("      ", src.tag, src.cls, "| y", src.prevY, "->", src.curY, "| h", src.prevH, "->", src.curH);
}
await browser.close();
