/**
 * Builds the campaign emails into /public/marketing/email.
 *
 * Written as a generator rather than ten hand-maintained HTML files so the brand
 * shell — colours, type, spacing, the footer, the unsubscribe line — is defined
 * once and cannot drift between campaigns. Change the shell here and every email
 * is rebuilt consistently.
 *
 *   node scripts/build-emails.mjs
 *
 * EMAIL HTML IS NOT WEB HTML. Everything here is deliberate:
 *   • Tables for layout. Outlook on Windows uses Word's rendering engine and has
 *     no meaningful flexbox or grid support.
 *   • Inline styles only. Gmail strips <style> blocks in several contexts.
 *   • Georgia and Helvetica, not the site's webfonts — @font-face is unreliable
 *     across clients and a failed webfont in email means a fallback nobody chose.
 *   • 600px content width, the safe maximum.
 *   • Every image has alt text that carries the message on its own, because a
 *     majority of clients block images until the reader allows them.
 *   • No emoji anywhere.
 *   • A real unsubscribe line in every single one.
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const OUT = join(process.cwd(), "public", "marketing", "email");
mkdirSync(OUT, { recursive: true });

/* ── Brand tokens, matching src/app/globals.css ───────────────────────────── */
const C = {
  ink: "#12100e",
  ink2: "#1e1a17",
  bone: "#f7f3ec",
  bone2: "#efe7d9",
  paper: "#fffdf9",
  line: "#e2d8c7",
  muted: "#6d6456",
  accent: "#ab2417",
  accentSoft: "#d9584a",
};

const SERIF = "Georgia, 'Times New Roman', Times, serif";
const SANS = "Helvetica, Arial, sans-serif";

/**
 * SITE is resolved, not hard-coded.
 *
 * Chef Kearse does not currently control his own domain, so writing one into ten
 * email files would guarantee ten broken files later. This follows the same
 * convention as src/lib/site.ts: SITE_URL wins, then Netlify's own URL, then the
 * live Netlify address as the fallback. Re-run this script after the domain is
 * settled and all ten emails rebuild with working links.
 */
const SITE = (
  process.env.SITE_URL ??
  process.env.NEXT_PUBLIC_SITE_URL ??
  process.env.URL ??
  "https://chef-r-kearse-website.netlify.app"
).replace(/\/+$/, "");
console.log(`  links point at ${SITE}`);

const label = (text, color = C.accent) =>
  `<div style="font-family:${SANS};font-size:10px;font-weight:bold;letter-spacing:.2em;text-transform:uppercase;color:${color};margin:0 0 10px">${text}</div>`;

const h1 = (text) =>
  `<h1 style="margin:0;font-family:${SERIF};font-size:30px;line-height:1.14;font-weight:normal;color:${C.ink};letter-spacing:-.01em">${text}</h1>`;

const p = (text, opts = {}) =>
  `<p style="margin:0 0 16px;font-family:${SERIF};font-size:16px;line-height:1.62;color:${opts.color ?? C.ink}">${text}</p>`;

const small = (text) =>
  `<p style="margin:0 0 12px;font-family:${SANS};font-size:13px;line-height:1.6;color:${C.muted}">${text}</p>`;

const button = (text, href) => `
<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:8px 0 4px">
  <tr>
    <td style="background:${C.accent};border-radius:2px">
      <a href="${href}" style="display:inline-block;padding:15px 30px;font-family:${SANS};font-size:14px;font-weight:bold;letter-spacing:.04em;color:#ffffff;text-decoration:none">${text}</a>
    </td>
  </tr>
</table>`;

const rule = () =>
  `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:26px 0"><tr><td style="height:1px;background:${C.line};line-height:1px;font-size:0">&nbsp;</td></tr></table>`;

const image = (src, alt, caption) => `
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:6px 0 20px">
  <tr><td>
    <img src="${SITE}${src}" alt="${alt}" width="552" style="display:block;width:100%;max-width:552px;height:auto;border:0" />
    ${caption ? `<div style="font-family:${SANS};font-size:12px;line-height:1.5;color:${C.muted};padding-top:8px">${caption}</div>` : ""}
  </td></tr>
</table>`;

const quote = (text, attribution) => `
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:6px 0 22px">
  <tr>
    <td style="border-left:3px solid ${C.accent};padding:2px 0 2px 18px">
      <div style="font-family:${SERIF};font-style:italic;font-size:17px;line-height:1.55;color:${C.ink}">&ldquo;${text}&rdquo;</div>
      <div style="font-family:${SANS};font-size:12px;letter-spacing:.06em;text-transform:uppercase;color:${C.muted};padding-top:10px">${attribution}</div>
    </td>
  </tr>
</table>`;

/** The shell. Every email is this, with a different body. */
function shell({ subject, preheader, body, cta, footerNote }) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<meta name="x-apple-disable-message-reformatting" />
<meta name="color-scheme" content="light" />
<meta name="supported-color-schemes" content="light" />
<title>${subject}</title>
<!--[if mso]>
<xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml>
<![endif]-->
</head>
<body style="margin:0;padding:0;background:${C.bone};-webkit-text-size-adjust:100%">

<!-- Preheader: the line the inbox shows next to the subject. Set deliberately,
     because left empty most clients pull the first words of the body instead. -->
<div style="display:none;font-size:1px;color:${C.bone};line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden">${preheader}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;</div>

<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:${C.bone}">
<tr><td align="center" style="padding:28px 12px 40px">

<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="width:600px;max-width:600px;background:${C.paper};border:1px solid ${C.line}">

  <!-- Masthead -->
  <tr>
    <td style="background:${C.ink};padding:22px 24px">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
        <tr>
          <td>
            <div style="font-family:${SERIF};font-size:20px;letter-spacing:.02em;color:${C.bone}">Chef R. Kearse</div>
            <div style="font-family:${SANS};font-size:10px;letter-spacing:.2em;text-transform:uppercase;color:${C.accentSoft};padding-top:6px">Private Chef &amp; Catering</div>
          </td>
          <td align="right" style="font-family:${SANS};font-size:11px;line-height:1.6;color:#a79c8b">
            Richmond &middot; NoVA<br />Washington DC &middot; MD
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- Body -->
  <tr><td style="padding:34px 24px 10px">${body}</td></tr>

  ${cta ? `<tr><td style="padding:0 24px 30px">${button(cta.text, cta.href)}</td></tr>` : ""}

  <!-- Signature -->
  <tr>
    <td style="padding:0 24px 30px">
      ${rule()}
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
        <tr>
          <td style="font-family:${SERIF};font-size:15px;line-height:1.6;color:${C.ink}">
            Chef R. Kearse<br />
            <a href="tel:+18049399246" style="color:${C.accent};text-decoration:none">(804) 939-9246</a><br />
            <a href="mailto:chefrkearse@gmail.com" style="color:${C.accent};text-decoration:none">chefrkearse@gmail.com</a>
          </td>
          <td align="right" style="font-family:${SANS};font-size:12px;line-height:1.7;color:${C.muted}">
            <a href="https://www.instagram.com/chef.rkearse/" style="color:${C.muted};text-decoration:underline">Instagram</a><br />
            <a href="${SITE}/menus" style="color:${C.muted};text-decoration:underline">Menus</a><br />
            <a href="${SITE}/book" style="color:${C.muted};text-decoration:underline">Check a date</a>
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- Footer -->
  <tr>
    <td style="background:${C.bone2};padding:20px 24px;font-family:${SANS};font-size:11px;line-height:1.7;color:${C.muted}">
      ${footerNote ? `<div style="padding-bottom:10px">${footerNote}</div>` : ""}
      Cooking for private tables across Virginia, DC and Maryland since 2018.<br />
      You are receiving this because you enquired, booked, or asked for the seasonal menu.
      <a href="{{unsubscribe_url}}" style="color:${C.muted};text-decoration:underline">Unsubscribe</a>
      or <a href="{{preferences_url}}" style="color:${C.muted};text-decoration:underline">choose what you hear about</a>.
      <div style="padding-top:10px;color:#8a8073">
        Menus are written per event and quoted on enquiry. Prepared in kitchens that handle
        shellfish, fish, dairy, egg, gluten and nuts; cross-contact cannot be ruled out.
      </div>
    </td>
  </tr>

</table>
</td></tr>
</table>
</body>
</html>
`;
}

/* ══════════════════════════════════════════════════════════════════════════
   THE EMAILS
   ══════════════════════════════════════════════════════════════════════════ */

const emails = [];

/* ── Corporate holiday 1 ─────────────────────────────────────────────────── */
emails.push({
  file: "corporate-holiday-01-the-pitch.html",
  subject: "Your team will not remember the hotel ballroom",
  preheader:
    "A chef in your own space, cooking to order, for the same money you are already spending.",
  body: `
${label("Corporate dinners")}
${h1("Nobody has ever gone back to work talking about a hotel ballroom.")}
<div style="height:22px"></div>
${p("Most company dinners are a room you rent, a menu you pick from three options, and a tray of something that was finished an hour before you sat down. It is fine. Nobody complains. Nobody remembers it either.")}
${p("Here is the alternative, and it usually costs about the same.")}
${p("I bring the kitchen to you — your own office, a private room, a venue you like the look of. Food is cooked and plated on site, not reheated. I come out and talk to your table about what they are eating. My team serves, tends the bar, and cleans up so completely that whoever locks up finds nothing to do.")}
${image("/images/dishes/lamb-chops-asparagus-1024.webp", "Two herb-crusted lamb chops on a white plate with grilled asparagus and a charred lemon half.", "Plated on site, to order. Not held under a lamp.")}
${p("<strong>What it works well for:</strong> end-of-quarter dinners, client appreciation, holiday parties, board dinners, a team that has just finished something difficult and deserves a real evening.")}
${p("<strong>What you need to give me:</strong> a date, a headcount, and roughly what you want to spend a head. I will come back with a menu built for your room and your people, including everybody with a dietary requirement, and one number with nothing hidden under it.")}
${quote("Every little detail was well thought out and the service was exceptional. Everything was amazing.", "Beth &middot; private event &middot; Fash, March 2021")}
${p("December fills from the outside in — the first and last weeks of the month go first, and Fridays go before anything else. If you already know your date, it is worth telling me now even if nothing else is decided.")}
`,
  cta: { text: "Check your date", href: `${SITE}/book?service=corporate` },
  footerNote:
    "Sent to people who have enquired about corporate catering or asked to hear about it.",
});

/* ── Corporate holiday 2 ─────────────────────────────────────────────────── */
emails.push({
  file: "corporate-holiday-02-dates-going.html",
  subject: "The December dates that are still open",
  preheader: "Honest scarcity: here is what is actually left, and what I would cook on it.",
  body: `
${label("Corporate dinners")}
${h1("What is actually still open in December.")}
<div style="height:22px"></div>
${p("I wrote to you a couple of weeks ago about bringing a kitchen into your own space rather than renting a ballroom. This is the short follow-up, and it is only useful if it is honest, so:")}
${p("Fridays in the second and third weeks are the first to go every year, and they are going. Weeknights in the first two weeks of December are wide open and are genuinely the better evening for a company dinner — people are not yet exhausted, and nobody is racing to another party.")}
${rule()}
${p("<strong>If you have thirty to sixty people</strong> — plated dinner in your own space works cleanly at this size. Three courses, two choices on the main, everyone with a dietary requirement handled without a separate conversation on the night.")}
${p("<strong>If you have sixty to a hundred and fifty</strong> — stations. A raw and cold station, a seafood station, something carved in front of people. It keeps the room moving and talking rather than seated in rows.")}
${p("<strong>If you have under thirty</strong> — this is where it gets interesting. At that size I can cook something I could not attempt for a hundred, and the evening feels like a dinner party rather than an event.")}
${image("/images/dishes/smoked-beef-sliced-1024.webp", "A slow-smoked beef roast carved into thick slices, showing a dark peppercorn crust and a rosy medium-rare centre.", "Carved at the table. The part people photograph.")}
${p("Tell me the date and the number. If I am free I will send a menu; if I am not, I will say so straight away rather than leaving you waiting.")}
`,
  cta: { text: "Tell me your date", href: `${SITE}/book?service=corporate` },
  footerNote: "Second of two emails about December. There is no third.",
});

/* ── Wedding 1 ───────────────────────────────────────────────────────────── */
emails.push({
  file: "wedding-01-the-difference.html",
  subject: "The food is the thing people actually remember",
  preheader:
    "Not the flowers, not the chairs. What a chef does differently from a banquet caterer.",
  body: `
${label("Weddings")}
${h1("Ask anyone about a wedding they went to. They will tell you about the food.")}
<div style="height:22px"></div>
${p("They will not remember the chair covers or the colour of the napkins. They will remember whether the food was good, and they will remember it for years.")}
${p("Most wedding catering is built to be safe at scale. Cooked early, held warm, plated fast, engineered so that nothing can go badly wrong. It is a reasonable way to feed a hundred people and it is why wedding food has the reputation it has.")}
${p("I work the other way round. I cook on site and I plate to order, and I build the menu around what you two actually like to eat rather than around a package.")}
${quote("The food was fresh, tasty and beautifully presented. All of our guests raved about the delicious meal, and many said it was the best food they had ever had at a wedding.", "Marie R. &middot; wedding &middot; Zola, March 2026")}
${image("/images/dishes/snapper-mango-salsa-1024.webp", "A long roasted fish fillet on a white platter, covered in diced mango, sweet pepper, red onion and cilantro.", "Built around what the couple eats, not around a package.")}
${p("<strong>A few things worth knowing before you talk to anyone:</strong>")}
${p("A venue's in-house caterer is the easy answer and sometimes the right one. Ask whether you are allowed to bring in a chef at all — some venues say no, and that is worth finding out before you fall in love with the room.")}
${p("Two mains is not an extravagance. At most headcounts it costs very little more and it changes how people feel about the meal, because nobody is eating something they would not have chosen.")}
${p("Tell your caterer about allergies at the start, not two weeks out. A guest with a serious allergy should be planned for, not worked around in a rush.")}
${p("And eat at your own wedding. I will put a plate aside for the two of you somewhere quiet, because otherwise you genuinely will not get to taste any of it.")}
`,
  cta: { text: "See if your date is free", href: `${SITE}/book?service=wedding` },
  footerNote: "Sent to couples who asked to hear about wedding catering.",
});

/* ── Wedding 2 ───────────────────────────────────────────────────────────── */
emails.push({
  file: "wedding-02-tasting-invite.html",
  subject: "Come and taste it",
  preheader: "A proper tasting, sat down, with the menu we have been talking about.",
  body: `
${label("Your tasting")}
${h1("There is only so much a menu on paper can tell you.")}
<div style="height:22px"></div>
${p("You have seen the photographs and read the menu. Neither of those is the same as sitting down and eating it, so let us do that.")}
${p("<strong>How a tasting works with me.</strong> The two of you, sat down properly, with the courses we have been discussing. Not samples on a tray — the actual plates, the way your guests will get them. It takes about ninety minutes and it is the most useful conversation we will have.")}
${p("You will change your mind about something. Everybody does, and that is the entire point of doing it before the menu is locked rather than after.")}
${p("Bring whoever is helping you decide. If a parent is paying, bring the parent. It saves a round of phone calls.")}
${image("/images/dishes/lobster-tail-plated-1024.webp", "A split lobster tail plated with butter and lemon, garnished with parsley.", "What you taste is what your guests are served.")}
${p("The consultation and tasting fee is waived when you sign, so if we are a fit it costs you nothing in the end.")}
${p("Reply with two or three evenings that work in the next fortnight and I will confirm one.")}
`,
  cta: { text: "Pick your evenings", href: `${SITE}/contact` },
  footerNote: "Sent to couples who have had a proposal from us.",
});

/* ── Wedding 3: venue coordinators ───────────────────────────────────────── */
emails.push({
  file: "wedding-03-venue-partner.html",
  subject: "A chef your couples will thank you for",
  preheader:
    "For venue coordinators and planners in Central Virginia and the DMV. One conversation, not a pitch deck.",
  body: `
${label("For venues and planners")}
${h1("You get blamed for the food even when it is not yours.")}
<div style="height:22px"></div>
${p("A coordinator introduced me to a couple two years ago. Her aunt is now booking me for an anniversary. That is how this work moves, and it is why this email is short.")}
${p("I am a private chef and caterer working across Richmond, Northern Virginia, DC and Maryland. Plated dinners, family style, stations, passed service. I bring my own serving staff and bartenders, I set up, and I break down completely.")}
${p("<strong>What I can promise you specifically, as the person whose weekend it ruins if it goes wrong:</strong>")}
${p("I walk your kitchen before the day, and I tell you honestly if what the couple wants is not possible in your space. I would rather change the menu than improvise at six o'clock on a Saturday.")}
${p("I do not go around you to the couple, and I do not undercut your preferred list. If you have rules about load-in, power, or what leaves the building, tell me once.")}
${p("Allergies are planned properly and written down, and the servers know which plate is which before they pick it up.")}
${p("Your name does not appear in anything I send anybody unless you tell me it can.")}
${image("/images/dishes/table-setting-1024.webp", "A dining table dressed in white linen with black placemats, folded napkins, wine glasses and white flowers.", "Set, served and cleared. Nothing left for you to deal with.")}
${p("If it is useful, I will come to you, look at the space, and leave you a one-page note on what is realistic there. No charge and no obligation — it is worth more to me to be on your list than to win one wedding.")}
`,
  cta: { text: "Arrange a kitchen walkthrough", href: `${SITE}/contact` },
  footerNote: "Sent to venue coordinators and planners. Reply once and we will not send another.",
});

/* ── Open weekend ────────────────────────────────────────────────────────── */
emails.push({
  file: "open-weekend-01-one-date.html",
  subject: "One Saturday, still open",
  preheader: "Not a promotion. Just a date that is free, and what I would cook on it.",
  body: `
${label("One open date")}
${h1("I have a Saturday free, and I would rather cook than not.")}
<div style="height:22px"></div>
${p("This is not a sale and there is no discount attached to it, because discounting my own work would be a strange way to thank the people who already pay properly for it.")}
${p("It is simply this: I have an open date coming up, you have eaten my food before or asked to hear about it, and if the timing happens to suit you then it suits us both.")}
${p("<strong>The date:</strong> {{OPEN_DATE}}")}
${p("<strong>What I would cook on it:</strong> whatever you want. But if you want me to decide — something from the fire, something from the water, and one thing that gets finished at the table in front of everybody. Eight to sixteen people is the sweet spot for that kind of evening.")}
${image("/images/dishes/pasta-wine-candle-1024.webp", "A bowl of pasta on a dark table beside a glass of red wine and a lit candle.", "The kind of evening this date is good for.")}
${p("If it is no use, ignore this entirely — there is nothing to decline and I will not chase it.")}
`,
  cta: { text: "Take the date", href: `${SITE}/book` },
  footerNote:
    "Sent only to past clients and people on the seasonal list in this area. Replace {{OPEN_DATE}} before sending.",
});

/* ── Win-back ────────────────────────────────────────────────────────────── */
emails.push({
  file: "winback-01-whats-new.html",
  subject: "Something new on the menu",
  preheader: "It has been a while. Here is what has changed since you last ate.",
  body: `
${label("Since we last cooked for you")}
${h1("It has been a while, so here is what is new rather than a reminder that it has been a while.")}
<div style="height:22px"></div>
${p("Nobody wants an email pointing out how long it has been. So instead: here is what has changed in my kitchen since you last sat down at one of my tables.")}
${p("<strong>The fire has got more interesting.</strong> I am smoking more, and carving it in front of people rather than sending it out already plated. It has turned into the part of the evening people talk about.")}
${p("<strong>Seafood has got simpler.</strong> Fewer things on the plate, better sourcing, more heat. The roasted fish with mango and pepper salsa has become the dish people ask for by name.")}
${p("<strong>And I have started doing weekly service</strong> for a few households — four or five dinners cooked and stored, one day a week. It has been the quiet success of the year. If your weeks have got busier since we last spoke, it might be more useful to you than a dinner party.")}
${image("/images/dishes/seafood-crab-roast-1024.webp", "A seafood roast with crab clusters, shrimp, corn and potatoes in a buttery sauce.", "New on the menu since you last ate.")}
${p("No occasion needed, and no obligation from this email. But if there is a birthday or an anniversary somewhere in the next few months, it would be good to cook for you again.")}
`,
  cta: { text: "See what is on the menu now", href: `${SITE}/menus` },
  footerNote: "You will get this once. There is no follow-up to it.",
});

/* ── Seasonal menu drop ──────────────────────────────────────────────────── */
emails.push({
  file: "menu-drop-autumn.html",
  subject: "What I am cooking this season",
  preheader: "The new menu. Nothing to buy, nothing to book. Just read it.",
  body: `
${label("The seasonal menu")}
${h1("What I am cooking this season.")}
<div style="height:22px"></div>
${p("Four times a year I write a new menu and send it to this list before it goes anywhere else. There is nothing to buy in this email. Read it, forward it to whoever you talk to about food, and that is all I want from it.")}
${rule()}
${p("<strong>To start</strong> — clam chowder, properly thick, with the clam liquor in it rather than just cream. Or a mango and sweet pepper salsa with red onion and cilantro, cut fine and dressed an hour before it is eaten.")}
${p("<strong>From the water</strong> — roasted fish under mango and pepper. Lobster tail split and broiled in butter, plain, because it does not need anything else. Shrimp and smoked sausage over stone-ground grits with sharp cheese.")}
${p("<strong>From the fire</strong> — beef, dry-brined overnight, smoked eight hours and carved at the table. Herb-crusted lamb with charred asparagus and a roasted lemon.")}
${image("/images/dishes/shrimp-grits-sausage-1024.webp", "Shrimp and sliced smoked sausage over creamy stone-ground grits, scattered with scallions.", "Shrimp and smoked sausage over stone-ground grits.")}
${p("<strong>To finish</strong> — creme brulee, torched at the table. Strawberries with cream and shortcake, which is not a clever dessert and is not trying to be.")}
${rule()}
${small("Every menu is written for the event it is cooked for, so none of this is fixed. If you see something you want and something you do not, say so — that is how these evenings should work.")}
`,
  cta: { text: "See the full menus", href: `${SITE}/menus` },
  footerNote: "The seasonal menu, four times a year. Forwarding it is the best thing you can do with it.",
});

/* ── Referral 1: thank you and review ────────────────────────────────────── */
emails.push({
  file: "referral-01-thank-you.html",
  subject: "Thank you for last night",
  preheader: "One small favour, and it takes a minute.",
  body: `
${label("Thank you")}
${h1("Thank you for having me.")}
<div style="height:22px"></div>
${p("It was a pleasure to cook for your table. I hope the room was still talking about it after I had packed up and gone.")}
${p("One favour, and then I will leave you alone.")}
${p("Word of mouth is how nearly all of my work arrives, and a review on Google is the version of word of mouth that reaches people who have never met you. It takes a minute and it makes a genuine difference to a business this size.")}
${button("Leave a review", "{{GOOGLE_REVIEW_URL}}")}
<div style="height:14px"></div>
${p("If anything was not right, reply to this instead and tell me. I would much rather hear it from you directly than read it later, and I will put it right.")}
${p("Thank you again. It was a good night.")}
`,
  footerNote:
    "Sent three days after an event. Replace {{GOOGLE_REVIEW_URL}} with the profile's review link.",
});

/* ── Referral 2: the ask ─────────────────────────────────────────────────── */
emails.push({
  file: "referral-02-one-name.html",
  subject: "One name, if anybody comes to mind",
  preheader: "Not a share. Just one person who would like this.",
  body: `
${label("A small ask")}
${h1("Not a share. Just one name.")}
<div style="height:22px"></div>
${p("It has been about a month since I cooked for you, so this is the last you will hear from me unless you want to hear more.")}
${p("Here is the ask, and it is deliberately small: is there one person who would like what you had?")}
${p("Not a post, not a share, not a list of contacts. One name, and a sentence to them from you. That is worth more than any advertising I could pay for, because they will believe you and they will not believe an advert.")}
${p("Reply with a name and I will take it from there, or just forward this to them — whichever is less effort for you.")}
${rule()}
${small("Worth knowing for yourself, too: birthdays, anniversaries and the weeks around the holidays are the busiest dates in my diary, and they get booked earliest. If you already know when you next want a table looked after, telling me early is the whole trick.")}
`,
  cta: { text: "Check a date", href: `${SITE}/book` },
  footerNote: "Sent thirty days after an event. The last email in the sequence.",
});

/* ── Write them out ──────────────────────────────────────────────────────── */
let count = 0;
for (const e of emails) {
  writeFileSync(join(OUT, e.file), shell(e), "utf8");
  count += 1;
  console.log(`  wrote ${e.file}`);
}
console.log(`\n${count} emails written to public/marketing/email\n`);
