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
2. **James R.**, Fash, 1 March 2021, 5★ — *"Excellent Chef."*

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

> "Chef R. Kearse" is the brand, exactly as written. The initial is the mark as
> it appears on his logo, his Instagram handle, his email and every listing.
> It is not a question, and it is not to be asked — see CLAUDE.md.

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

### Added with the portal build — the things we invented and he must ratify

Everything in this section was made up on his behalf because we did not have the
answer. None of it is a finding. All of it is changeable in one place.

**The assistant**

22. **Her real name and email.** "Jordan Ellis / assistant@chefrkearse.com" is a
    placeholder in `src/lib/portal/seed.ts` and appears on her sign-in, in the
    conversation threads and on the run-sheets.
23. **What she actually does in a week.** Her whole dashboard is built on the
    assumption that an events assistant's job is chasing and coordinating, so it
    is a task queue. That is a guess. Ask her what she chases, and what she
    wishes she did not have to, and the screen gets rebuilt around the answer.
24. **Should she see revenue figures?** Off by default — she sees the diary, the
    guests and the run-sheets but no quoted or booked values, no deposit amounts
    and no money panels. The chef turns it on in Settings.

**The qualification engine**

25. **All nine weights and the four band thresholds.** A defensible opening
    position, not drawn from his booking history because we do not have it.
    Listed in full in Settings and in `PORTAL.md`. Retune after roughly thirty
    scored enquiries.
26. **The four budget bands on the enquiry form** — under $75, $75–125,
    $125–200, $200+ per guest. Conventional ranges for this kind of work in this
    market. **Not his numbers.** He confirms or replaces all four.
27. **His real service floor**, which is what the below-floor cap keys off. An
    enquiry under the floor is held at band B for a human to re-scope rather than
    reaching him inside four hours.
28. **The practical minimum party size.** Currently assumed: 6 guests for a full
    plated service, comfortable band 12–90, above 150 needs a staffing plan.
29. **The response standards** — 4 hours for band A, 24 hours for band B. These
    are promises the portal will hold him to, so he should agree to them or
    change them.
30. **The 80-character minimum on the occasion field.** Deliberate friction that
    filters out "how much" enquiries. Confirm he is happy to lose the people who
    will not write two sentences.
31. **The deposit acknowledgment wording** on the enquiry form, and whether his
    actual terms match it — a deposit holds the date, balance before the event.
32. **Deposit percentage and cancellation terms.** The demo shows 30%; no real
    figure has been given.

**Menus and the kitchen**

33. **Course structures per service style** — what a plated dinner, family style,
    stations and passed service actually consist of, and how many choices a guest
    gets per course. Currently invented in `COURSE_TEMPLATES`.
34. **Which dishes belong in which course.** Assembled from his photographs, not
    from his menus.
35. **Component lists and yields for the shopping and prep generator.** Derived
    from what is *visible* in each photograph, with conventional catering
    quantities. Not his recipes. Every generated list says so on its face until
    he replaces them.
36. **The prep timings** — how many hours before service each step really
    happens. Currently conventional, not his.
37. **The add-on list** (bartender and mobile bar, extra serving staff, wine
    pairing, coffee, late-night bite) and what each costs.

**Marketing**

38. **Approve every campaign email before anything sends.** Ten finished emails
    are in the portal written in an approximation of his voice. He should read
    all ten — they go out under his name.
39. **The Google review link** for the referral email, once the listing is
    recovered. Placeholder token `{{GOOGLE_REVIEW_URL}}`.
40. **The anecdote in wedding caption 8** references a real booking. Get the
    couple's permission or switch to the general version.
41. **Whether we run the marketing or he does.** Roughly forty hours a quarter to
    run properly.

**Operations**

42. **Where enquiry notifications should go** once email is connected — his
    address, the assistant's, or both.
43. **Whether guests should be able to see prices in the menu builder.** Off
    until real pricing is confirmed.

---

### Added with the lead engine — the five that block the valuable work

These are different from everything above: they are not polish, they are the
gate. Every venue asks for them before it will add a caterer to its list, and the
Kitchen Brain shows each one as an amber NOT CONFIRMED chip until it lands. Until
they are answered, **no venue application can go out** — which is the highest-ROI
work in the whole engine.

They are blank rather than guessed on purpose. A letter claiming a certificate he
does not hold is worse than one that never goes.

44. **General liability insurance — carrier and limit.** Venues ask for this
    first. One industry body (WIPA) requires $1M per occurrence to join at all.
45. **ServSafe or food-handler certification** — who holds it, and when it
    expires.
46. **Business licence and health-department permits** — which jurisdictions. One
    DC venue (Dumbarton House) requires a DC business licence specifically.
47. **SWaM certification** with the Virginia Department of Small Business and
    Supplier Diversity — is he certified, and if not does he want to be? This is
    probably the single highest-leverage registration available to him.
48. **eVA vendor registration** — registered or not. It is how every Virginia
    public body buys, including the universities.

**And these block the engine quoting anybody**

49. **Real price bands by service model.** Every figure in the build is a
    placeholder and is labelled as one. Nothing will be quoted until these land.
50. **Travel radius, and the fee beyond it.** This drives the distance factor in
    the prospect score, which currently falls back to a documented 40-mile
    assumption and says so on every card.
51. **Maximum events per week, and minimum notice.** These drive whether a
    prospect's date is scored as workable.

**One phone call each resolves these**

52. **Virginia ABC, (804) 213-4577** — are banquet licences included in the
    public licensee search or the downloadable file, and do the records carry the
    event date and location? This is the highest-value unknown in the engine and
    it is already sitting as an open correction on /portal/sweeps.
53. **Maymont** — the supplemental pre-screened Approved Caterers list: criteria,
    fee, and how to apply.
54. **Cultural Arts Center at Glen Allen**, Christiana Roberts, (804) 261-6211 —
    the approval criteria for the approved-caterer list. Whatever she says is
    also the checklist for every other venue.
55. **Science Museum of Virginia, 804.864.1466** — their preferred-caterer list
    is referenced on their page but not published.
56. **eVA registration fee and SWaM certification fee.** Neither is published.

**Decisions only he can make**

57. Does he approve outbound prospecting in his name at all? And does he want to
    read every letter before it sends, or approve a template once?
58. His lawyer's review of the outbound programme — TCPA and A2P 10DLC for calls
    and texts, CAN-SPAM for email, National DNC scrubbing for consumer calls.
    This should happen before the first campaign, not after a complaint.

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
