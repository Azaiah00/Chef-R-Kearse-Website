# AUDIT — what was there before, and what this replaces

Scored 1–10, blunt, with the specific fix. Audited 24 September 2026.

---

## The headline

**There was nothing to audit.** `chefrkearse.com` and the Squarespace address
behind it both return *"Website Expired — This account has expired."* The
Squarespace subscription has lapsed and the site is gone. There is no Wayback
Machine capture, so not a single page, photo or line of copy survives.

Meanwhile every channel he owns still points at that dead URL:

- His **Google Business Profile** lists chefrkearse.com as the website.
- His **Instagram bio** (1,763 followers) links `www.chefrkearse.com`.
- His **Zola** wedding-vendor profile lists chefrkearse.com.
- Google still indexes `chefrkearse.com/about`, `/event-intake`,
  `/culinary-galley` and `/contact`, so organic searchers land on the dead page too.

A couple in Richmond searching "private chef Richmond VA", finding him, liking
his food and tapping through is currently meeting an account-suspension notice.
That is the entire audit.

---

## Scores (of the situation as found, not of a site)

| # | Area | Score | What is wrong | The fix, shipped |
|---|---|---|---|---|
| 1 | First impression / positioning | **0/10** | An expired-account page. No positioning of any kind. | A positioning line built from his own tagline, above the fold, with cuisine, city and reason to book inside three seconds. |
| 2 | Mobile UX | **0/10** | Nothing renders. | Mobile-first build. Sticky three-tap bar (Check date · Menus · Call) on every page. All targets ≥44px. Zero horizontal overflow at 390/834/1440. |
| 3 | Speed | **n/a** | — | Static-rendered pages, 102KB shared JS, self-hosted variable fonts (no third-party font request), pre-optimised WebP at three widths, transform-only motion. |
| 4 | Booking path | **0/10** | No path. Best available route was a phone number on a Google listing. | Five-step qualifying enquiry, first tap on a choice he already knows, contact details last. Reaches the chef's inbox directly. |
| 5 | Menu accessibility | **0/10** | Gone. The old site had a "Culinary Galley" page, now unreachable. | Every dish is crawlable HTML text with `MenuSection` / `MenuItem` schema. No PDFs, no images-of-text. |
| 6 | Photography | **4/10** | Real, appetising, and his own — but 640–1000px phone frames, 13 of them with a watermark strip across the bottom third, plus Yelp UI arrows baked into the edges. | Watermarks and UI cropped out, resampled to three widths, film grain to carry the upscale. A full shot list is in `ASSET-BRIEF.md`. |
| 7 | Copy | **0/10** | None exists. | Written for one job: getting a qualified enquiry. His own tagline as the H1, the hosting pain named in the first section, no "welcome to our website". |
| 8 | Local SEO | **2/10** | A Google Business Profile exists and ranks — that is the entire asset, and it points at a dead site. | Validated `FoodEstablishment` + `LocalBusiness` schema with real NAP, service areas, cuisines, offers and only real reviews. `Service`, `Menu`, `FAQPage`, `BreadcrumbList` and `Organization` on the relevant pages. Sitemap, robots, canonicals, per-page metadata. |
| 9 | Google Business Profile completeness | **5/10** | Live and indexed, with a knowledge panel and a founding-year snippet — but the website link is dead, there is no menu link, no booking link, no Posts and no Q&A. | Checklist in `README.md`. First action after DNS: repoint the website link. |
| 10 | Accessibility | **0/10** | — | WCAG 2.2 AA contrast, visible focus rings, skip link, semantic landmarks, keyboard-navigable lightbox, labelled form steps, full `prefers-reduced-motion` off-ramp. |
| 11 | Trust signals | **3/10** | Real five-star reviews exist on Zola and Fash — but they sit on third-party sites the customer has to go and find. Yelp shows zero recommended reviews and eight filtered ones, which reads badly to anyone who looks. | Three real, attributed, dated reviews pulled onto the site with links to source. A photograph of the chef. Founding year. Third-generation story. Everything that is not verifiable is left off. |
| 12 | Conversion instrumentation | **0/10** | — | `inquiry_submitted` pushed to `dataLayer` with the service type, ready for GA4 / Meta. |

---

## What the status quo is costing him

Assumptions are labelled. Replace them with his real numbers and the model still holds.

### 1. The dead link

His Google Business Profile ranks and has a knowledge panel. A well-optimised
private-chef GBP in a market this size is documented as producing **10–15
enquiries a month at zero ad spend**.<sup>[1]</sup> Every one of those people
who taps "Website" today lands on an expired-account page.

Take the conservative end and assume only half of them would have converted
anywhere near a booking:

| | |
|---|---|
| Enquiries currently lost to the dead link | ~10 / month *(assumption)* |
| Enquiry → booking rate | 20% *(assumption)* |
| Bookings lost | **2 / month** |
| Average private-dinner ticket | $1,000 *(2026 US mid-market: a ~10-guest dinner runs $900–$1,600)*<sup>[2]</sup> |
| **Revenue leaking out per month** | **≈ $2,000** |
| **Per year** | **≈ $24,000** |

That is before a single new visitor.

### 2. Platform commission

Chef-booking marketplaces take **20–30% commission**.<sup>[1]</sup> Every
booking moved from a marketplace to a direct enquiry keeps that margin.

| | |
|---|---|
| Marketplace bookings per month | 3 *(assumption)* |
| Average ticket | $1,000 |
| Commission at 25% | $250 per booking |
| **Kept per month by owning the booking path** | **$750** |
| **Per year** | **$9,000** |

### 3. What the funnel design is worth

The enquiry form is not a contact form with extra steps. Each decision is
evidence-backed:

| Lever | Documented effect | Applied here |
|---|---|---|
| Multi-step vs single-step, same fields | **+14%** average; **+21%** once past six fields; **+32%** for a 10-field form split across three steps<sup>[3]</sup> | Ten fields across five steps |
| Fields per screen | Conversion falls 23.1% → 17.0% → 11.4% at 3 → 5 → 7 fields<sup>[3]</sup> | Never more than three fields on a screen |
| Progress indicator | **+11–15%**<sup>[3]</sup> | Step count and a percentage bar |
| Inline validation | **+5–13%**<sup>[3]</sup> | On blur, per field |
| Visible privacy line | **+4–7%**<sup>[3]</sup> | Above the submit button |
| Correct autofill metadata on mobile | **+11–18%**<sup>[3]</sup> | `autocomplete` on every contact field |
| Commitment before effort | Contact details asked last, after four steps of investment | First tap is a single choice |
| Page speed | Every extra second costs **7–12%** of conversions<sup>[4]</sup> | Static render, 102KB shared JS, no third-party requests |

Compounded conservatively against a plain single-screen contact form, the form
alone should be worth **35–60% more completed enquiries** off the same traffic.

### 4. Speed of reply — the free one

Response time is the highest-leverage variable and it costs nothing: **every
hour of delay increases the chance the customer books someone else by roughly
30%**.<sup>[1]</sup> The enquiry lands in his inbox with the date, headcount,
location and occasion already in the subject line, so a useful reply takes two
minutes rather than an exchange of four emails.

### 5. The total

| Line | Per year |
|---|---|
| Stop leaking GBP traffic to a dead link | ≈ $24,000 |
| Move marketplace bookings direct | ≈ $9,000 |
| Funnel design on the same traffic | 35–60% more enquiries |
| Wedding and private-event leads | Highest-margin channel, currently unserved by any owned page |
| **Cost of the status quo** | **$30,000+ a year, plus every wedding that never called** |

---

## Sources

1. Chef Justin Jennings, *How to Find Private Chef Clients* (2026) — Google
   Business Profile at 10–15 enquiries/month; marketplace commission 20–30%;
   the 30%-per-hour response-time decay; 70% of bookings from referrals.
2. Chefpost, *How Much Does a Private Chef Cost? 2026 Price Guide* — US
   in-home dinner $65–150 per guest; a ~10-guest dinner party $900–$1,600.
3. Digital Applied, *Form Conversion Rate Benchmarks 2026: 100+ Data Points* —
   field-count cliff, multi-step lift, progress indicator, inline validation,
   privacy line, autofill metadata. Venture Harbour corroborates the multi-step
   finding.
4. KrishaWeb, *Website Conversion Rate Benchmarks by Industry: 2026 Data* —
   7–12% conversion cost per additional second of load time; mobile carries
   65–75% of traffic while converting at roughly half the desktop rate.

Every figure marked *(assumption)* is exactly that. Swap in his real numbers
before this goes in front of him.
