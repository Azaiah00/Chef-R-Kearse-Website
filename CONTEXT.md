# CONTEXT — Chef R. Kearse: verified facts and open questions

Everything on the website comes from this file. Nothing was invented. Each fact
below carries its source so it can be re-checked.

Research date: **24 September 2026**.

---

## 1. The finding that matters most

**His website is dead.**

`https://chefrkearse.com` and the underlying Squarespace address
`https://oval-collie-zdkx.squarespace.com` both return:

> **Website Expired** — This account has expired. If you are the site owner, click below to login.

The Squarespace account has lapsed. Every link pointing at chefrkearse.com right
now — his Google Business Profile, his Instagram bio, his Zola vendor page, his
old Google search results — sends a ready-to-book customer to an expired-account
page. There is also **no Wayback Machine capture** of the site, so none of the
old copy, menus or photos can be recovered. This build starts clean.

His old sitemap, recoverable only from Google's indexed titles and snippets, was:
`About` · `Event Intake` · `Culinary Galley` · `Contact` · `Book Now`.

---

## 2. Verified business facts

| Field | Value | Source |
|---|---|---|
| Trading name | Chef R. Kearse | Logo, Google listing |
| Full name of business | Chef R. Kearse Private Chef & Catering | Google listing, Zola |
| Tagline | *"Your invitation to the perfect catered affair."* | His own photo watermark; Yelp "About the Business"; Fash profile |
| Founded | 2018 | Google knowledge panel: "Kearse founded his private chef and catering company in 2018." |
| Background | Third-generation private chef and catering professional | Thumbtack profile |
| Phone (primary) | (804) 939-9246 | Google listing; old site footer |
| Phone (toll free) | (844) 532-7724 | Old site footer |
| Email | chefrkearse@gmail.com | Old site footer |
| Base | Richmond, VA (Glen Allen listed on Fash) | BBB profile; Fash |
| Service area | Richmond, Maryland, DC areas — `#DMVPersonalChef` | His Instagram bio |
| Instagram | [@chef.rkearse](https://www.instagram.com/chef.rkearse/) — 125 posts, ~1,763 followers | Instagram |
| Facebook | [Chef R Kearse](https://www.facebook.com/p/Chef-R-Kearse-100088320616251/) — ~70 followers | Facebook |
| Yelp | 25 photos, 0 recommended reviews, 8 "not currently recommended" | Yelp |
| Zola | Active wedding-vendor listing, "currently accepting new clients" | Zola |
| BBB | Listed as a Caterer in Richmond, VA. **Not BBB accredited** | BBB |
| Company size | 5 (self-reported) | Fash |

### Cuisines (from his Zola vendor profile)
American · BBQ · farm-to-table · fusion · Greek · Italian · Latin American ·
seafood · Southern. Vegan and vegetarian options available.

### Service inclusions (from his Zola vendor profile)
Serving staff · bartenders · delivery and setup · cleanup and breakdown ·
consultations and tastings (**fee-based, waived on contract signing**) · bar and
beverage servingware rentals.

### Service styles (Zola)
Breakfast/brunch · buffet · family style · food stations · passed appetisers ·
seated meals · stationary appetisers.

### Beverage (Zola)
Beer · coffee service · liquor · mobile bar · non-alcoholic · signature
cocktails · wine.

### Real reviews used on the site (all attributed, all dated)

1. **Marie R.**, Zola, 2 March 2026, 5★ — *"the food was fresh, tasty and
   beautifully presented. All of our guests raved about the delicious meal, and
   many said it was the best food they had ever had at a wedding."*
2. **Beth**, Fash, 1 March 2021, 5★ — *"Every little detail was well thought out
   and the service was exceptional… EVERYTHING WAS AMAZING!!"*
3. **James R.**, Fash, 1 March 2021, 5★ — *"Excellent Chef."*

A fourth Fash review (Dustin, 1 March 2021, body text "Everything") was left off
as too thin to be useful. **No review on this site is invented.**

---

## 3. Photography actually used

| Source | Count | What it is |
|---|---|---|
| Yelp business gallery | 25 | His own uploads. Finished, plated dishes plus one photo of the chef, a table setting and his branded knife. The strongest material by far. |
| Instagram | 12 frames | Reel cover frames. Roughly seven are usable; the rest are a selfie, a phone screenshot and two unappetising process shots, all discarded. |

Processing applied: his bottom-edge logo watermark cropped off the 13 Yelp
images that carry it; Yelp's baked-in carousel arrows trimmed from both edges;
Instagram reel-UI gradients and stray floor/table crops removed; everything
resampled to 640/1024/1600 WebP with mild unsharp where upscaled; a tight
portrait crop pulled from the kitchen photo.

**Instagram's API rate-limited the deeper crawl**, so only the 12 most recent
grid frames could be pulled. The other ~113 posts are still worth harvesting
manually if any of them are stronger.

---

## 4. CONFIRM WITH CLIENT

Every item below is either unverified, or a claim the site makes softly and
would make harder once he confirms it. None of them block launch.

**Identity and credentials**
1. Is "third-generation private chef and catering professional" (his Thumbtack
   wording) how he wants it stated? Any detail on the two generations before him?
2. Any culinary school, apprenticeships, certifications, ServSafe, awards, press
   or TV appearances? The site currently claims none — because none is
   documented anywhere public.
3. Is he insured / licensed for catering in VA, MD and DC? Buyers of
   larger events ask, and stating it converts.

**Business facts**
4. Confirm the base address — BBB says Richmond, Fash says Glen Allen. A real
   street address (or at least a confirmed city) unlocks Google Business Profile
   and local schema properly.
5. Confirm the service-area list in `src/lib/site.ts`. It is inferred from
   "Richmond, Maryland, DC areas" plus the obvious Richmond suburbs.
6. Is the (844) toll-free line still live?
7. Does he want a business email on the domain (e.g. `chef@chefrkearse.com`)
   instead of the Gmail address? Strongly recommended.
8. Fash lists "5 employees" and "9 years in business" (the latter conflicts with
   founded-2018). Which is right?

**The offer**
9. **Pricing.** No price for this business exists anywhere public, so the site
    publishes none. Give me real bands — a per-guest range for private dinners,
    a weekly personal-chef range, a wedding minimum — and set
    `site.pricing.published = true` in `src/lib/site.ts` to turn the band table
    on. Even a "from $X per guest" lifts qualified enquiries hard.
10. **Minimums.** Minimum guest count? Minimum spend? Travel radius before a
    travel fee applies, and how much?
11. **Response time.** `site.responsePromise.published` is `false`. If he will
    commit to answering within a stated window, turn it on — it is one of the
    highest-leverage lines on a service site.
12. **Deposit and cancellation policy.** Nothing is stated anywhere on the site
    right now.
13. **Tasting fee** — the site says "fee-based, waived on signing" per his Zola
    listing. Confirm the amount, or confirm we keep it unstated.
14. Does he do **weekly personal chef / meal prep** as a standing service? It is
    on his Fash and Thumbtack profiles, so the site includes it — confirm.
15. Cooking classes, ticketed dinners, gift cards, merch — worth adding?

**Menus**
16. **The dish names on the site are descriptions of what is visible in his own
    photographs, not his menu names.** Every one should be replaced with what he
    actually calls it. They are all in `src/lib/dishes.ts`.
17. Two photographs could not be identified with confidence and are described
    generically: `crab-stuffed-golden` / `crab-stuffed-plated` ("baked stuffing,
    golden top") and `baked-stuffed-platter`. Tell me what they are.
18. Sample menus for each service would be a significant upgrade over a plate
    gallery — three or four written menus at different price points.
19. **No allergen or dietary claim appears anywhere on this site** beyond "vegan
    and vegetarian options are available", which is from his Zola listing. Every
    menu page carries a cross-contamination disclaimer. Any dietary flag he
    wants shown must come from him.

**Operations**
20. Where should enquiries go? Currently `chefrkearse@gmail.com`. Set
    `INQUIRY_TO` in the environment to change it.
21. Does he want a CRM / calendar integration, or is email enough to start?

---

## 5. Competitive picture — Richmond private chefs

| Competitor | What they do well | What they leave open |
|---|---|---|
| **Richmond Private Chef / Ripley Hospitality** (richmondprivatechef.com) | Clear positioning line ("Virginia's Private Chef Experience"), a named chef with a Food Network credit, five testimonials, stated capacities (tasting menu to 20, family style to 100) | No pricing, no real booking path — a generic "Get in touch", thin photography |
| **GastroLove Chefs** | Broad SEO footprint on "private chef [city]" pages | Directory-style, no personality, no named chef |
| **Your Private Chefs** | Same national-directory play, ranks on city pages | Interchangeable; no local proof |
| **Take a Chef** | Dominant on "private chef Richmond" search | Marketplace — takes commission, owns the client relationship |
| **Food Fire Knives** (via Airbnb Experiences) | Distribution through Airbnb, reviews attached | Platform-owned, rigid format |

**The gap nobody in this market has taken:** an owner-operated private chef with
a real face, real photographs of real plates, a fast qualifying booking path,
and honest talk about what things cost. Every competitor is either a faceless
directory or a brochure with a "get in touch" mailto. That is the position this
site takes.

---

## 6. Sources

- Google Business Profile / knowledge panel — `kgmid=/g/11tjpks0s4`
- [Instagram @chef.rkearse](https://www.instagram.com/chef.rkearse/)
- [Zola vendor profile](https://www.zola.com/wedding-vendors/wedding-catering/chef-r-kearse-private-chef-catering)
- [Yelp business page](https://www.yelp.com/biz/chef-r-kearse-no-title)
- [BBB profile](https://www.bbb.org/us/va/richmond/profile/caterer/chef-r-kearse-0603-63421851)
- [Fash profile](https://fash.com/va/richmond/catering/chef-r-kearse-personal-chef-and-catering-services)
- Thumbtack Richmond personal-chef listings
- [Facebook page](https://www.facebook.com/p/Chef-R-Kearse-100088320616251/)
- chefrkearse.com (expired) and oval-collie-zdkx.squarespace.com (expired)
