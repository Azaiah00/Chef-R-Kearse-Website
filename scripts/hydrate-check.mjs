import { chromium, devices } from "playwright";
const browser = await chromium.launch();
const ctx = await browser.newContext({ ...devices["Pixel 5"] });
const page = await ctx.newPage();
const msgs = [];
page.on("console", (m) => { if (["error", "warning"].includes(m.type())) msgs.push(m.type() + ": " + m.text().slice(0, 200)); });
page.on("pageerror", (e) => msgs.push("pageerror: " + e.message.slice(0, 200)));
for (const p of ["", "book", "gallery", "menus", "weddings", "about", "faq", "contact", "experiences", "privacy"]) {
  await page.goto("http://localhost:3222/" + p, { waitUntil: "load" });
  await page.waitForTimeout(1500);
}
console.log(msgs.length ? msgs.join("\n") : "NO CONSOLE ERRORS OR WARNINGS ON ANY PAGE");
await browser.close();
