# THE LEAD ENGINE — plan, channel research, and commission structure
### Chef R. Kearse · prepared for Azaiah · 30 September 2026

Two things in this document. **Part A** is what to take out of the CSL medical-transport
portal and put into Chef Kearse's, and why. **Part B** is the lead finder — the real,
verified channels that will put bookable corporate and wedding work in front of him every
week, the ones I am telling you to skip and why, and the architecture to run it.

**Part C** is your commission arrangement, structured so it survives the first
disagreement.

Everything sourced in Part B was retrieved on 30 September 2026. Anything I could not
verify says **NOT VERIFIED** in place. There are no invented figures in this document.

---

# PART A — What CSL has that this portal should steal

CSL is a better-engineered lead machine than Chef Kearse's portal currently is. Different
industry, same problem: a one-operator business that has to find work it can actually win,
and be told plainly what to do on Monday morning. Nine things transfer.

## A1. The source citation, and the honest "what this does not establish" note

This is the best idea in the whole CSL build and it costs nothing to port.

Every record in CSL carries a `sources[]` array, and each source has a `retrievedISO` and a
`note` that states what the source **establishes** — and, explicitly, what it does not:

> *"Establishes the Sandston facility at 1001 Techpark Place, (804) 737-8400 … Hours and
> pickup terms are **NOT published and are not claimed here**."*

And elsewhere, a source that exists only because the honest URL is a search page rather
than a permalink:

> *"eVA award and solicitation documents sit behind a session-bound search rather than a
> stable permalink, so the search page is cited honestly rather than a fabricated direct
> URL."*

That turns "real facts only" from a rule you hope an agent follows into a field it has to
fill in. It is the single highest-value thing to copy, because the whole lead engine is
worthless the moment Chef Kearse calls a venue and repeats a fact that was not true. CSL
even caught a real instance of this — a prospect's own referral page listing two dead
addresses — and wrote a caution telling the caller not to repeat them.

**Port it verbatim.** Every prospect, every venue, every signal gets `sources[]` with
`retrievedISO` and a note that distinguishes established from assumed.

## A2. The sweep — versioned research runs

CSL numbers its research runs (`W1…W5`, `V1…V2`) with a label, an ISO date and the Monday
of the week, and every record carries the `addedISO` of the run that found it. So the UI
can answer "what did this week produce" and "how has the board changed since August"
without anyone keeping a changelog by hand.

Chef Kearse's portal has a weekly marketing queue but no concept of a research run. Add it.
It is also what makes your retainer legible: five numbered sweeps with dated citations is a
record of work performed.

## A3. The corrections panel — publishing what failed

CSL's fifth run could not re-verify one procurement notice because the state portal kept
refusing a new search term across three attempts. Instead of dropping it, the run recorded
it:

> *"It is recorded in the corrections panel rather than quietly dropped. Worth a manual
> look: it has been the top-scored item on the board for four runs, and it should have
> issued three weeks ago."*

A tool that shows you its own failures is a tool you believe. One that silently drops what
it could not check is one you stop trusting the first time you catch it. Add a corrections
panel per sweep: what was re-checked, what changed, what could not be verified and why.

## A4. Pitch, opening question, caution — the call written before the call

Every CSL prospect carries three pre-written fields, and they are the difference between a
list and a sales tool:

- **`pitch`** — why this prospect specifically, in structural terms rather than promotional
  ones.
- **`openingQuestion`** — the one question that starts a real conversation. CSL's are
  excellent: *"You're eight to five and you're doing splenectomies. When one of those needs
  blood, or needs to move to a 24-hour hospital overnight, what physically has to travel
  with the patient — and who drives it today?"* That is a question only someone who
  understands the business could ask, and it cannot be answered with "no thanks."
- **`caution`** — what will embarrass you on this call. *"Their own referral page is STALE …
  do not repeat those addresses back to anyone."* *"Two of the three already run their own
  pickups and say so on their own websites, so the displacement pitch gets corrected in the
  first thirty seconds."*

**This matters most for you specifically**, because you said you may make the calls
yourself. You are not a chef. The `openingQuestion` and `caution` fields are what let you
sound like you belong on the call. Write them for every prospect.

## A5. `suggestedAction`, including DO NOT PURSUE

CSL's board carries a prospect scored 38 with the action *"DO NOT BID"* and a full
paragraph on why — a hundred miles outside the service radius — plus what the record is
actually for:

> *"The correct use of this record is as evidence, not as a target: it tells Darren that
> eVA does still produce courier work, that it appears with about three weeks of notice,
> and that the next one might be closer."*

A lead engine that only ever says "call this" is a lead engine you learn to ignore. One
that says "not this, and here is what it teaches us" earns the next recommendation. Chef
Kearse is tired of wasted time — an engine with the discipline to decline is exactly the
thing to show him.

## A6. The cluster insight — when the route is the pitch, not the account

CSL's most valuable finding in five runs was not a lead. It was that four prospects sat
within a mile of each other on one road, so one run serves all four and the marginal cost
of stops two, three and four is close to nothing. Every previous lead had been priced as a
standalone stop, which was the worst possible economics for a one-van operation.

**The direct analogue for Chef Kearse is the venue, and it is worth more than any single
lead.** Get onto one venue's approved-caterer list and you inherit a share of every couple
and every company that books that room, permanently, with no further marketing spend. One
relationship, recurring inbound. That is the whole basis of Part B's Tier 3, and it is the
highest-ROI play in this document.

The second analogue is the **open date**. An unbooked Saturday in October is perishable
inventory that expires worthless. The portal already knows his calendar; it should be
scoring prospects by *which open date they could fill*, and surfacing "three prime
Saturdays still open in six weeks" as an action, not a statistic.

## A7. Outreach as records, not a number

CSL originally tracked outreach as three hardcoded numbers in a report and one bundled
.docx. They refactored it so each draft is a record with a status
(`draft → approved → sent → replied → no-response → closed`), and every count is
**derived** via `outreachStats()`. Their own comment on why:

> *"it meant the dashboard's 'outreach drafted' count was a literal that could drift away
> from what was actually written."*

Chef Kearse's portal has messages and a weekly campaign queue but no outreach pipeline for
outbound prospecting. Add it, and derive every number.

## A8. The backlog as the headline — the thing that makes it trustworthy

This is the part most builders would never ship, and it is why CSL's weekly report is good.
Run five deliberately wrote **zero** new outreach drafts and led the briefing with the
backlog instead:

> *"The engine has spent five weeks proving it can find work and Darren has not yet had a
> week where he answered it, so this run deliberately did not write an eighteenth draft.
> Supply is not the constraint and adding to it would only make the pile harder to face."*

And the top item on the board, scored above every real opportunity:

> *"THE BACKLOG — 19 overdue targets and 17 unsent drafts … None of this needs research, a
> tool, or another sweep — it needs one morning."*

Build Chef Kearse's weekly briefing to choose its own headline from what is actually wrong.
If there are twelve un-actioned prospects, the headline is the twelve, not the two new ones.
An engine that flatters itself gets switched off in month three.

## A9. The Company Brain → **the Kitchen Brain**

CSL keeps one authoritative record of the business — credentials, procurement codes,
service radius, insurance, capability-statement content — and *every* generated document
reads from it, so no two outputs disagree and nothing is invented at generation time.

Chef Kearse has none of this, and it is the foundation the whole engine needs. **The Kitchen
Brain** holds, in one place:

- Verified name, service area, phone, email, and the domain situation (see
  `DOMAIN-AND-GBP-RECOVERY.md`)
- Insurance status and limits, ServSafe / food-handler certification, business licence,
  and any health-department permit — **all currently unknown and all required** before he
  can apply to a single venue list. WIPA, for one, requires $1M per occurrence.
- Service models and real price bands, once confirmed — with every figure flagged as
  placeholder until he confirms it
- Signature dishes with real names and real descriptions
- Policies: travel radius and travel fee, minimums, deposit and cancellation terms, staffing
  ratios, what he supplies vs what the venue supplies
- Which venue approved-lists he is on, applied to, or targeting
- Availability rules: lead time, max events per week, blackout dates

Then every proposal, every outreach email, every venue application and every menu is
generated *from* the Brain. That is also what makes this scale to client number two.

## A10. Two smaller ones worth taking

- **Print routes.** CSL has a `(print)` route group with an `AutoPrint` component and
  per-record printable views. Chef Kearse needs printable run sheets, shopping lists, prep
  schedules and quotes — a chef works from paper in a kitchen, not a laptop. He already has
  `RunSheet` and `PrepPanel`; they need print-optimised routes.
- **The engine-status page.** CSL's "AI Team" page shows what each agent does and links to
  its live output. Do this honestly — it is a weekly research sweep, not five sentient
  agents — but *show the work*. It is what justifies a retainer at renewal.

## What I would NOT port

CSL's procurement-code apparatus (NAICS/NIGP as first-class concepts) is right for a
government-contract business and overweight here. Fold the two or three codes that matter
into the Kitchen Brain and move on. And do not adopt the "five AI agents" framing if the
sweep is actually you on a Monday — overstate the automation once and every number in the
portal becomes suspect.

---

# PART B — The lead finder

## B0. The honest shape of this market

There is no single API that returns "people in Richmond who need a private chef next
month." Anyone who tells you otherwise is selling a scraper. What exists is better than
that and worse than that: a set of **public signals that reliably precede catering demand**,
and one channel that may be an actual register of upcoming private events. The engine's job
is to sweep the signals weekly, score them against the Kitchen Brain, and hand you a call
list with the opening question already written.

Ranked by verified signal quality per hour of effort.

---

## TIER 1 — Machine-monitorable feeds. Automate these.

All six verified live on 30 September 2026.

| Source | Feed URL | Signal |
|---|---|---|
| **Richmond BizSense** | `https://richmondbizsense.com/feed/` | The best single source in this research. New business openings, expansions, leases, HQ moves, layoffs, building permits. Verified live headlines included *"Grove Eye Care now open at Regency mall in Henrico"* and *"Breaking Ground: Local building permits for 9.30.26"*. Publishes in one weekday early-morning batch. |
| **Virginia Business** | `https://www.virginiabusiness.com/feed/` | Statewide expansions and capital investment. Multiple items daily. Noisier — carries national wire copy, so keyword-filter for the metro. |
| **Bisnow DC** | `https://www.bisnow.com/feed` | Office leases and HQ moves in the DC corridor. Verified headlines: *"Chipmaker Nvidia Leases Office Space In Downtown D.C."*, *"Top Brokerage Expands With Downtown D.C. Office Move"*. **The feed is national** — `/washington-dc/feed` returns 404, so filter by keyword or use the free regional email newsletter. |
| **ThePhilVA** | `https://thephilva.com/feed/` | Virginia nonprofit community news and events, weekly-to-biweekly, low volume. Best free Virginia-specific nonprofit-event source found. It is a news archive rather than a calendar — many posts are recaps, which lag. |
| **Greater Washington Board of Trade** | `https://www.bot.org/wp-json/tribe/events/v1/events` (JSON) and `https://www.bot.org/events/?ical=1` (iCal) | **The only chamber in this research with a real API.** Both verified returning live data. Corporate policy briefings and executive lunches — the rooms where DC-corridor catering decisions get made. |
| **VCU events** | `https://calendar.vcu.edu/api/2/events` (JSON), `https://calendar.vcu.edu/calendar/1.xml` (RSS), `webcal://calendar.vcu.edu/calendar/1.ics` | Localist platform, all three verified. And it proves VCU units book *off*-campus: a verified listing put a VCU event at Hardywood Park Craft Brewery. |

**BizSense Pro** gates the two sharpest products — *New Licenses* and *Breaking Ground*
(building permits). A new business licence is the closest thing in this market to a ledger
of "this company just became a catering buyer." Their subscribe page shows **$45/month** and
**$145/year** alongside copy reading *"Save 50% with annual billing"* — those three do not
reconcile, so confirm the current price before paying. It is the one paid subscription in
this document I would actually buy.

---

## TIER 2 — Public, no feed. Scrape or read weekly.

**The sharpest single signal in this entire research: ribbon cuttings.**

The Hanover Chamber publishes them on a public calendar —
`https://business.hanoverchamberva.com/event-calendar` — with verified upcoming entries
*"Ribbon Cutting - Advance Auto Parts"* (29 Oct) and *"Ribbon Cutting - Uniquely Yours Dog
Care"* (7 Nov). A business cutting a ribbon this month needs food this month, has a budget
approved, and has never had a caterer before. Nothing else in this document is that warm.
Their member directory is public and category-filterable at
`https://business.hanoverchamberva.com/active-member-directory`.

| Source | URL | What to take |
|---|---|---|
| **ChamberRVA** | Events `https://go.chamberrva.com/events/calendar/` · Members `https://go.chamberrva.com/members` | Public, no login, ~24 industry categories. Dues published: BELONG **$1,000** → LEAD **$25,000**, banded by employee count. Note they run their own catered programming and will have an incumbent — the directory's value is as a qualified corporate target list, not as an event feed. |
| **Greater Richmond Convention Center** | `https://www.richmond-center.com/calendar-of-events` | A public forward calendar that **names the host organisation**, months out. Verified: *"VBA/VA Chamber Financial Forecast – Virginia Bankers Association & Virginia Chamber of Commerce"*, *"Commonwealth Prayer Breakfast – Commonwealth Prayer Breakfast Committee"*. **He will almost certainly never cater inside the GRCC** — venues like it run exclusive in-house F&B. The play is indirect and real: every association on that list brings a board dinner, a VIP reception, a sponsor breakfast or a pre-conference off-site into Richmond, and those go outside. **Pitch the association, not the building.** |
| **VSAE** (Virginia Society of Association Executives) | `https://www.vsae.org/calendar` | The sleeper pick. Its members *are* the people who buy meeting catering, and it is headquartered in Richmond. This is a buyer concentration, not a peer group. Verified upcoming Richmond events including an Awards Luncheon & Silent Auction on 4 Dec. Vendor-membership cost NOT VERIFIED. |
| **Chesterfield Chamber** | Widget feed `https://widgets.chesterfieldchamber.com/feeds/events/event.aspx?display=cat&catid=103&cid=1810&wid=1101` | Returns live event data but as an HTML widget, so it needs scraping rather than parsing. `catid=103` is the Non-Profit Committee; other category IDs presumably exist but are NOT VERIFIED. |
| **Virginia Chamber** | `https://vachamber.com/events/upcoming-events/` | Large statewide conferences, several at the Greater Richmond Convention Center. No public member directory — event-signal source only. |

Email alerts worth setting up: **VEDP** (`https://www.vedp.org/news`, email updates only, no
RSS) for expansion and HQ announcements with job counts; the Bisnow DC newsletter; ThePhilVA's
monthly digest.

Two chamber directories are **unreadable without a browser** — the Northern Virginia Chamber
(`web.nvcbusiness.org/atlas/...`) and the DC Chamber
(`members.dcchamber.org/atlas/directory/search`) both return only *"Loading secure
content..."*. Don't plan automation against them.

---

## TIER 3 — The venue play. **Start here. This is the highest-ROI work in the document.**

One venue relationship pays recurring inbound forever. And the research turned up something
genuinely useful: **two direct competitors publish their own preferred-venue maps**, which
together form a verified, named list of every Richmond-area venue that runs an *open*
multi-caterer list.

- **Groovin' Gourmets / Trolley Hospitality** — `https://www.trolleyhouseva.com/groovin-gourmets/venue-partners/richmond` — 37 venues, described on their own page as *"venues that have included us on their preferred caterer lists."*
- **Garnish Catering** — `https://garnishrva.com/venues/` — a section explicitly headed *"VENUE PREFERRED CATERER"*, ~23 venues, plus ~17 more under "Other Local Venues."

**Fourteen venues appear on both lists**, which is hard evidence they run open,
multi-name lists with room to add another name:

> Main Street Station · Maymont · Science Museum of Virginia · Cultural Arts Center of Glen
> Allen · Seven Springs · Mankin Mansion · The Market at Grelen · The Branch Museum ·
> Bolling Haxall House · Virginia Museum of History and Culture · Virginia War Memorial ·
> Tuckahoe Woman's Club · Weinstein JCC · Avonlea Farms

**That is the target list. Work it in order.**

Two of them publish their full approved list, which gives you both the competitive set and
the exact pitch math:

**Cultural Arts Center at Glen Allen** — `https://www.artsglenallen.com/facility-information/approved-caterers`
13 approved caterers named. Their policy, verbatim: *"The following caterers are approved to
cater events at The Center (Use of other caterers, or self-catering, will require a **$500
refundable deposit**)."* Contact named on the page: Christiana Roberts, Events Sales Manager.

**Maymont** — `https://maymont.org/rentals/catering/`
Six "Premier Caterers" named. Verbatim: *"Working with other outside caterers is discouraged
and will incur an **outside catering fee of $600**, plus additional requirements."* Critically,
Maymont also maintains *"a supplemental list of Approved Caterers who have been pre-screened"*
at a discounted fee — **that second tier is the realistic first rung.** Ask for it by name.

### The pitch math, and it is the whole argument

The venue charges **the couple** $500–$600 for choosing an off-list chef. That fee is not a
cost to Chef Kearse — it is the friction that loses him the booking, because a couple weighing
two chefs will pick the one that doesn't add $600 to the invoice. Getting on-list removes it.

So the ask to the venue is not "please feature me." It is: *"your clients are paying a $600
penalty to work with me. Put me on the pre-screened list and that goes away for them, and you
get a chef who'll make your room look good."* That is a conversation about their client's
experience, not about your marketing.

**The incumbent set to differentiate against**, appearing on both published lists:
A Sharper Palate · Groovin' Gourmets · Mosaic Catering + Events · Garnish.

### Venues with no kitchen — they *must* use outside catering

The highest-value category, because outside catering isn't tolerated, it's required.

- **Prince George's County Parks historic venues** — `https://www.pgparks.com/facilities-rentals/historic-site-rentals` — five named venues (Billingsley House, Newton White Mansion, Prince George's Ballroom, Oxon Hill Manor *(page states temporarily closed)*, Snow Hill Manor). Verified detail: each *"has warming kitchens"* — a warming kitchen with no production kitchen is the definitive signal. **No approved-caterer list is published**, so call each site.
- **Here Comes The Guide's BYO-catering indexes**, filterable by region:
  `https://www.herecomestheguide.com/wedding-venues/virginia/byo-catering` and
  `https://www.herecomestheguide.com/wedding-venues/washington-dc/byo-catering`.
  These pages are JavaScript-rendered — a human has to browse and transcribe them, which is a
  good two-hour job for a Saturday and worth more than a month of cold calls.
- **Dumbarton House**, Georgetown — `https://dumbartonhouse.org/book/preferred-professionals/` — the most open door found in DC. Outside catering is permitted with clear, meetable requirements, verbatim: *"you may work with any vendor you choose, providing they: have a DC business license, have proof of sufficient insurance, review necessary Dumbarton House rules and regulations, make an on-site appointment with the Rental Events Coordinator prior to your event."*

**Deprioritise these — verified closed:** Lewis Ginter Botanical Garden (exclusive partnership
with Restaurant Associates), VMFA (*"a full-service catering operation with a retail ABC
license"*), Rust Manor House / NOVA Parks (in-house Great Blue Heron Catering).

### Make this a monitored asset, not a one-off

Diff those competitor venue maps and the two published approved-lists **monthly**. Who got
added, who got dropped, which venue changed its policy. That is competitive intelligence no
competitor of his is running, and it is three HTTP requests a month.

---

## TIER 4 — One-time registrations that pay for a year

| Action | URL | Cost | Note |
|---|---|---|---|
| **SWaM certification** (VA Dept of Small Business & Supplier Diversity) | `https://certification-app.sbsd.virginia.gov/boLogin` | **NOT VERIFIED** | Probably the highest-leverage single action available. It converts a cold call into a preference category at every Virginia public body and at every corporate that tracks diverse spend. DSBSD's own wording: certification *"enable[s] Small, Women, and Minority-owned businesses (SWaM) … to qualify for Virginia's specialized procurement and contracting opportunities."* Do not quote a "Virginia targets X% SWaM spend" figure — I could not verify one. |
| **eVA vendor registration** | `https://www.eva.virginia.gov/` · public search `https://mvendor.cgieva.com/Vendor/public/AllOpportunities.jsp` | **NOT VERIFIED** (eVA has historically charged vendors — confirm) | The gateway to every Virginia public body: state agencies, localities and universities. VCU's own supplier page makes eVA registration step one. The public search page is `robots.txt`-disallowed to automated fetching, so browsability and filtering are unverified. |
| **Virginia Film Office REEL-CREW** | `https://www.film.virginia.org/crew/` → register at `https://va.reel-scout.com/crew_registration.aspx` | **Free** (VFO: *"The VFO provides free listings in our online Production Directory"*) | Catering is explicitly named among the support services. **But be realistic:** VFO's filmography stops at 2022 and there is no public "what's shooting now" list, so this is a 20-minute one-time listing, not a weekly channel. Whether a Catering category exists on the form is NOT VERIFIED (page is robots-disallowed). |
| **NACE Richmond** | `https://www.rvanace.com/member-directory` · national `https://www.nace.net/become-member` | Professional **$380/yr**, Corporate **$315/yr**, Young Professional **$220/yr** (verified) | The catering-specific association, with a Richmond chapter and a **publicly posted member directory including a downloadable PDF** — a ready-made list of every caterer, venue and planner in his home market. Local chapter event fee exists but the amount is NOT PUBLISHED. |
| **WIPA Richmond** | `https://www.wipa.org/richmond/` · `richmond@wipa.org` | **$350/yr + $50 one-time application** (verified) | Planner-heavy, which is the audience. Requires *"Business Insurance of at least $1,000,000 per occurrence"* — check that before applying. The directory is login-gated; the value is the room, not the list. An event is listed for 4 Nov 2026. |
| **Zola** | `https://www.zola.com/faq/360002891772-what-does-it-cost-to-be-listed-on-zola-` | Listing **free** (verified); lead credits NOT PUBLISHED | Best economics of the six wedding marketplaces: *"Listing on Zola is free"* and *"You'll only pay for couples you want to talk to."* Pay-per-lead beats subscription when there's no ad budget. |
| **Destination DC** | `https://washington.org/members/membership/destination-dc-membership-enrollment` | **$1,100/yr** non-hotel (verified verbatim) | Only if he genuinely wants DC corporate work. There is no public convention calendar; the route in is the RFP form and the sales team. |
| **Visit Fairfax (FXVA)** | `https://www.fxva.com/meetings/plan-a-meeting/toolkit/meeting-and-event-services/service-providers/` | NOT PUBLISHED | Publishes searchable service-provider lists explicitly including *"Caterers"*. No submission instructions or cost on the page — call 703-790-0643. |

**On the wedding marketplaces generally:** not one of the six — WeddingPro (The Knot +
WeddingWire), Zola credits, PartySlate, Here Comes The Guide, Wedding Spot — publishes a
price. All route to sales. None exposes a public API. Budget a phone call each, and know that
Wedding Spot has **no caterer category at all** (its own FAQ excludes outside vendors), so skip
it. PartySlate skews corporate and luxury planners, which makes it the best of the six for
reaching *planners* rather than couples.

---

## TIER 5 — The qualification tool: what a gala actually spends on food

This is how you stop guessing whether a nonprofit can afford him.

**IRS Form 990, Schedule G, Part II, line 7 is literally labelled "Food and beverages."**
It is the organisation's own disclosed catering spend on each of its two largest fundraising
events, plus an aggregate for the rest. Form verified at
`https://www.irs.gov/pub/irs-pdf/f990sg.pdf` (Rev. December 2024). Part II is filed when the
organisation reported more than **$15,000** of fundraising-event contributions.

So before the first call you can know: can this gala afford him, and what did the incumbent
charge.

- **Bulk source:** `https://www.irs.gov/charities-non-profits/form-990-series-downloads` —
  monthly XML ZIPs, verified 2019 through August 2026 (latest `2026_TEOS_XML_08A.zip`). Schedule
  G is inside the XML. A one-time parser over VA/DC/MD filers yields a ranked list of every
  organisation in the corridor by disclosed event F&B spend. E-filed returns only.
- **ProPublica Nonprofit Explorer API** — `https://projects.propublica.org/nonprofits/api/v2`,
  free, no API key. Useful for finding organisations (`state[id]=VA&ntee[id]=1` verified
  returning 4,094 results) — **but it exposes only the Form 990 Part VIII aggregate
  (`grsincfndrsng`, `lessdirfndrsng`, `netincfndrsng`), not Schedule G line detail.** The
  catering number is not in the API. The documented `q=` keyword parameter returned 404 in
  testing.

**Be blunt with him about the lag.** A gala held in 2026 lands on the FY2026 Form 990, due
mid-2027, routinely extended about six months, then processed. **Schedule G is a 12–30 month
lagging indicator.** It is a qualification and pricing tool, never an alert. Get the ranking
from Schedule G, then get *this year's* date from the organisation's own website.

Real named galas with public pages surfaced in research — **URLs confirmed to exist, event
details NOT VERIFIED**: Weinstein JCC (`https://weinsteinjcc.org/gala/`), Junior League of
Richmond Centennial Gala, Ronald McDonald House Richmond "Red Shoe Rendezvous", Breakthrough
T1D Richmond Gala, The Steward School Gala, Community Foundation for Northern Virginia "Raise
the Region."

**Note the cross-reference, because it's the warmest lead in this section:** the Weinstein JCC
appears on *both* competitor caterers' preferred-venue lists, which means it hosts
outside-catered events — and it runs its own annual gala.

---

## TIER 6 — The high-upside unverified one: Virginia ABC banquet licences

I want to flag this clearly because it could be the best catering lead source in this entire
document, and it is currently **unconfirmed**. Do not build on it until someone makes one phone
call.

**What is verified:**

- Virginia ABC's own page states: *"Annually, Virginia ABC grants over **28,000 banquet and
  special event licenses**."* (`https://www.abc.virginia.gov/licenses/find-a-license`)
- The **Banquet** licence is for *"individuals (representing themselves or a group/company)
  hosting a private event where alcohol is provided"* at an unlicensed location — i.e. a wedding
  or a private party at a venue with no liquor licence. Private individuals hosting weddings do
  need one. (`https://www.abc.virginia.gov/licenses/banquet-licenses`)
- The **Banquet Special Event** licence, for nonprofits holding charitable/civic/educational/
  political/religious events, costs **$40**.
  (`https://www.abc.virginia.gov/licenses/val/definitions/banquet-special-event`)
- The application captures the **event date and times** and the **event location address** —
  ABC's own application tutorial names an "Event Details > Event Dates and Times" page, a "Day
  and Time Information" page, and a "Location Information > Event Location" page with a required
  "Event Location Address" section.
  (`https://www.abc.virginia.gov/library/licenses/pdfs/val-training/banquet-application-tutorial.pdf`)
- Average ABC processing is **7–10 days**, so licences are typically filed weeks-to-months ahead
  of the event. That is a usable lead window.

**What that would mean if the data is public:** a weekly, legally-public register of upcoming
private events in Virginia — with the date and the venue — filed by the person paying for the
event. For a caterer that is not a signal that precedes demand. It *is* the demand.

**What is NOT verified, and it is the whole question:** whether banquet-licence data is publicly
searchable or obtainable. The Find a License page offers *"a downloadable file of Virginia ABC
Licensees (XLS)"*, but that is most likely the ~20,000 permanent retail licensees, not the
28,000 banquet licences. Whether the licensee search tool exposes banquet licences, and whether
it shows event dates and locations, is unknown.

**How to resolve it, in this order:**

1. Call **Virginia ABC License Records Management, (804) 213-4577** — the number published on
   their own Find a License page — and ask directly: are banquet and special-event licences
   included in the licensee search or the downloadable file, and do the records include the event
   date and location?
2. If not, file a **Virginia FOIA request** (Va. Code § 2.2-3700 *et seq.*) for the banquet
   licence register for a date range, and see what they release and at what cost.
3. Whatever comes back, **record it in the corrections panel** — including a refusal. A
   documented "we asked, here is what they said" is worth more than an open question.

Cost to find out: one phone call. Potential value: the best channel in this document. That is a
good trade, and it is the first thing I would do on Monday.

---

## What I am telling you NOT to do — and why

### Marriage-licence mining. Don't. It is closed in Virginia by statute.

You will be told this is the obvious wedding-lead hack. It is not available to you, and in
Virginia it is affirmatively illegal.

- **Va. Code § 32.1-267(F)** — marriage licence applications filed on or after 1 July 1997, and
  marriage registers, *"shall not be available for general public inspection."* Access requires a
  court order, a lawful subpoena, the applicants' written authorisation, or law-enforcement
  purposes.
- **Va. Code § 32.1-271** — it is unlawful to permit inspection of or disclose vital-record
  information except as authorised; marriage records become public only **25 years** after the
  event.
- **Va. Code § 17.1-293** — secure remote access to circuit-court records is limited to parties,
  counsel, and designated agencies, and states expressly that nothing permits accessed data *"to
  be sold or posted on any other website or in any way redistributed to any third party."*

**Washington DC:** obtainable at **$10 per copy** from DC Superior Court, but the request requires
*"full names, maiden names, and the date of the marriage for both parties"* up front. That is a
verification tool, not a discovery tool. No public marriage index was found.

**Maryland:** the most open of the three. Under Md. Rule 16-912(c)(2) only the *pre-issuance* fact
of application and the § 2-301 medical certificate are withheld, so post-issuance the licence and
its application are inspectable court records — **but counter-only, no bulk mechanism, and no
verified online index.**

And separately from record-access law, the brand argument decides it anyway: **cold-calling a
couple who never opted in is the wrong first impression for a premium private chef.** It reads as
intrusive at precisely the moment they are deciding whether he is the classy choice. The yield
does not justify it. Skip the channel entirely.

### Two more to be realistic about

- **Film and TV catering in Virginia** is a real but thin, relationship-driven market, and the
  Commonwealth publishes no forward-looking production list. Take the free listing; do not build
  expectations on it. DC's own production directory still points at a **2017–2018** edition —
  eight years stale, not a credible channel.
- **Convention centres** run exclusive in-house F&B. He is not catering inside the Greater Richmond
  Convention Center. Mine the calendar for association *names* and pitch their off-site events.

### The compliance line, stated plainly

If you are making outbound calls and sending outbound email on his behalf, that is an agency
relationship and the rules attach to whoever dials and whoever sends:

- **Calls and texts** — TCPA, and A2P 10DLC registration for any SMS. The portal already documents
  this for guest messaging; it applies to prospecting too.
- **Email** — CAN-SPAM: accurate headers, a real physical address, a working unsubscribe, honoured
  promptly.
- **Do-not-call** — scrub business-to-consumer calling against the National DNC registry.
  Business-to-business is treated differently, but "treated differently" is not "exempt," and most
  of your wedding targets are consumers.

None of that is a reason not to do this. It is a reason to do it with the opt-in and suppression
plumbing built from day one rather than retrofitted after a complaint. **Get his lawyer to look at
the outbound programme before the first campaign, and get your commission agreement in writing
before the first call.**

---

## B7. The architecture

New types, extending `src/lib/portal/types.ts`. Everything carries `orgId` like the rest of the
portal, so this is multi-tenant from day one and resells to client number two.

```ts
/** A research run. Every record below points back at the sweep that found it. */
interface Sweep {
  run: number;                 // 1, 2, 3…
  label: string;               // "S1", "S2" — shown as a chip on new records
  iso: string;                 // the day the sweep ran
  weekOf: string;              // Monday of the reporting week
  sourcesSwept: string[];      // what was actually checked, in prose, re-runnable
  corrections: Correction[];   // what changed, and what could NOT be verified
}

/** What failed or changed. Published, never silently dropped. */
interface Correction {
  subject: string;             // the record or claim re-checked
  what: string;                // what changed, or why it could not be verified
  resolvedISO: string | null;  // null while still open
}

/** Evidence. Every factual claim in the engine hangs off one of these. */
interface SourceLink {
  label: string;
  url: string;
  kind: "organization" | "directory" | "search" | "news" | "filing" | "statute";
  retrievedISO: string;
  /** What this source ESTABLISHES — and explicitly what it does NOT. */
  note: string;
}

/** A raw feed hit, before a human decides it is worth pursuing. */
interface Signal {
  id: string; orgId: string;
  source: string;              // "Richmond BizSense", "Hanover Chamber"…
  title: string;
  url: string;
  publishedISO: string;
  matchedRules: string[];      // which keyword rules fired, so scoring is auditable
  triage: "new" | "promoted" | "dismissed";
  dismissReason: string | null;
  promotedToProspectId: string | null;
  sweepRun: number;
}

/** The outbound counterpart to the existing inbound `Lead`. */
interface Prospect {
  id: string; orgId: string; ref: string;
  name: string;
  category: "corporate" | "nonprofit-gala" | "venue" | "planner"
          | "association" | "institution" | "production";
  city: string; state: string;
  phone: string | null; website: string | null;
  contactName: string | null;  // absent rather than invented
  contactRole: string | null;

  fitScore: number;            // 0–100, from the weights below
  priority: "HOT" | "WARM" | "WATCH" | "DECLINE";

  whyItFits: string;           // structural, not promotional
  pitch: string;
  openingQuestion: string;     // the one question that starts a real conversation
  caution: string | null;      // what will embarrass you on this call
  suggestedAction: string;     // including "DO NOT PURSUE — because…"

  targetDates: string[];       // which of HIS open dates this could fill
  estValue: number | null;     // placeholder until he confirms price bands
  status: "new" | "researched" | "contacted" | "conversation"
        | "quoted" | "won" | "lost" | "declined";
  nextActionBy: string | null; // drives the overdue count that leads the briefing
  owner: "chef" | "assistant" | "agent";  // "agent" = Azaiah. Attribution evidence.
  sourcedBy: "agent" | "inbound" | "chef" | "assistant";
  sourcedISO: string;          // immutable. This is the commission record.

  addedISO: string;
  sweepRun: number;
  sources: SourceLink[];       // never empty for a record added by a sweep
}

/** The venue board — the Tier 3 asset, tracked over time. */
interface VenueRecord {
  id: string; orgId: string;
  name: string; url: string;
  listType: "published-open" | "unpublished-open" | "byo-required"
          | "in-house-exclusive" | "unknown";
  caterersNamed: string[];     // verbatim from the venue's own page
  offListFee: number | null;   // the $500 / $600 pitch math
  offListFeeNote: string | null;
  ourStatus: "not-applied" | "applied" | "on-list" | "declined";
  appliedISO: string | null;
  requirements: string[];      // insurance, licence, ServSafe — from the venue
  diffs: { iso: string; added: string[]; removed: string[] }[];
  sources: SourceLink[];
}

/** Outreach as records, so every count is derived and cannot drift. */
interface OutreachRecord {
  id: string; orgId: string;
  prospectId: string;
  channel: "email" | "call" | "form" | "in-person";
  subject: string;
  body: string;                // rendered verbatim in the prospect view
  status: "draft" | "approved" | "sent" | "replied" | "no-response" | "closed";
  draftedISO: string;
  sentISO: string | null;
  responseISO: string | null;
  sentBy: "chef" | "assistant" | "agent" | null;
}
```

### The outbound fit score

Keep it separate from the inbound A/B/C/D engine in `src/lib/portal/scoring.ts` — they answer
different questions. Inbound asks "is this enquiry worth his time." Outbound asks "is this
stranger worth a call." Nine weights summing to 100, same shape as the existing engine so the
breakdown UI is reusable:

| Weight | Factor | Why |
|---|---|---|
| 20 | **Date fit** | Does it land on an open date, and is that date prime? Perishable inventory first. |
| 16 | **Signal freshness** | A ribbon cutting next month beats a Schedule G filing from 2023. |
| 14 | **Access** | Is there a named human and a route in, or is it a switchboard? |
| 12 | **Spend evidence** | Schedule G line 7, published budget, venue tier — evidence, not a guess. |
| 10 | **Distance** | Against his real service radius, with the return leg priced. |
| 10 | **Repeatability** | A venue list or a corporate with quarterly events outranks a one-off. |
| 8 | **Incumbency** | Is a competitor already embedded? Overflow pitch vs open lane. |
| 6 | **Brand fit** | Does this event flatter the work he wants more of? |
| 4 | **Effort** | How much research and how many touches before a decision. |

Then a **hard cap**, exactly like the inbound engine's below-floor budget cap: a prospect with
**no verified source** can never rank above WARM, no matter what it scores. That single rule is
what stops the board filling up with plausible-sounding guesses.

### New routes, all inside the locked sidebar

`/portal/prospects` · `/portal/prospects/[id]` · `/portal/signals` · `/portal/venues` ·
`/portal/outreach` · `/portal/brain` · `/portal/sweeps`

Role split, consistent with what is already there: the chef sees the board, the venue map, the
money and the briefing. The assistant gets the call queue, the outreach drafts and the venue
applications — the work — and no revenue figures unless he switches that on in Settings. Your own
view (`owner: "agent"`) is the call list plus the commission ledger.

### The Monday briefing picks its own headline

Ranked by what is actually wrong, in this order — copy CSL's discipline exactly:

1. Overdue `nextActionBy` dates, counted and valued
2. Outreach drafted but not sent, with the age of the oldest
3. Open prime dates inside the booking window that nothing is competing for
4. Venue applications submitted with no response past a threshold
5. *Then* this week's new prospects
6. Corrections — what was re-checked, what changed, what could not be verified

If item 1 is non-empty, item 1 is the headline. Not the new leads.

---

# PART C — Your commission arrangement

You said you may work the phones yourself and negotiate a commission on what he books. That is a
real business and the right instinct — you are building the asset that generates the leads, so you
should participate in the leads. Three structures, and a recommendation.

**1. Straight commission on booked revenue.** A percentage of food-and-service revenue on any
event you source and close. Simplest, perfectly aligned, nothing owed in a dry month. But he feels
it most on exactly the large events you both want, and it pays you nothing for the weeks you spend
building the engine.

**2. Retainer plus a reduced commission.** A monthly fee for the engine — the sweep, the outreach
drafts, the marketing creative, the portal — plus a smaller percentage on events you source.

**3. Per-qualified-appointment fee plus commission on close.** Pays you for setting the meeting
even when he doesn't close it. **I'd avoid this.** It pays for activity rather than outcome, and it
will strain the relationship the first time three appointments in a row don't convert — he will
conclude he's paying for your calendar, and he'll be half right.

**Take #2.** The retainer funds the work that is real regardless of outcome and survives a slow
month; the commission keeps your incentive pointed at booked covers rather than busywork. It is
also the structure he can budget, which matters more than it sounds — a variable-only cost is the
one an owner cancels first when cash is tight.

And price the **build** separately from the **operation**. The portal and the lead engine are a
capital asset with a useful life of years; the weekly sweep is a service. Folding both into one
commission percentage badly undervalues what you've already built.

## The clauses that decide whether this ends well

Write these down before the first call. Every one of them is a fight you can have cheaply now or
expensively later.

**Attribution — define it mechanically, not by memory.** "Sourced by Azaiah" = a named prospect
you first entered into the portal, with a timestamp, that had no prior inbound contact. The portal
already records `createdAt`, `source` and `owner`; add `sourcedBy` and an immutable `sourcedISO`,
put both in the audit log, and make the ledger the single record you both read from. Neither of you
should ever be reconstructing who found whom from memory.

**The attribution window.** If a prospect you sourced books fourteen months later, does it pay?
Pick a window — twelve months from first contact is the common convention — and write it down.

**What the percentage applies to.** Recommend: **food and service revenue, net of pass-through.**
He should not pay you commission on money that goes straight to a rental company, a venue, or
staffing he sub-contracts. Name alcohol and travel explicitly, one way or the other.

**When it's paid.** On his receipt of the client's final payment, not on booking. A cancelled event
then costs you a commission you never banked, rather than triggering a clawback argument.

**Repeat clients — this is the clause that poisons these deals.** Does a corporate client you
sourced pay you on every event forever? Recommend: full rate on the first event, a reduced rate on
events two through four within 24 months, then it becomes his house account. You get paid properly
for the acquisition; he isn't taxed forever on a relationship he now maintains himself.

**Who owns what.** Say it explicitly: **he owns his guest and client records** — the portal already
takes the position that the client owns their data, and you should honour it. **You own the engine**
— the sweep methodology, the prompt library, the component library, the agency asset library. That
sentence is what lets you run this for client number two without a dispute.

**Exclusivity, in both directions.** Is he committing to route outbound through you? Are you free
to run the same engine for another Richmond chef? That is a direct conflict and you should decide
it now, not the week you sign the second client.

**Who is calling.** If you are dialling and emailing as his business, that is an agency
relationship and it belongs in writing — including which of you carries the TCPA, DNC and CAN-SPAM
obligation. Put it in the agreement rather than discovering it after a complaint.

---

# CONFIRM WITH CLIENT / OPEN ITEMS

Everything below is unknown and blocks specific work. Nothing in this document has guessed at any
of it.

**Blocks the venue applications — get these first, they are the gating items**
1. Does he carry general liability insurance, and at what limit? WIPA requires $1M per occurrence; venues will ask.
2. ServSafe or food-handler certification — current, and for whom on his team?
3. Business licence and any health-department permit, for which jurisdictions?
4. Is he a certified SWaM business in Virginia? If not, does he want to be?
5. Is he registered in eVA?

**Blocks pricing anything**
6. Real price bands by service model. Every figure in this build is a placeholder until he confirms.
7. Travel radius, and the travel fee beyond it.
8. Minimums, deposit terms and cancellation policy.
9. Maximum events per week, and required lead time.

**Blocks the assistant's half of the portal**
10. The assistant's name and email address. Still unknown; the demo button reads "Assistant Portal" for that reason.

**Blocks the outbound programme**
11. Does he approve outbound prospecting in his name at all, and does he want to see every draft before it sends, or approve a template once?
12. His lawyer's review of the outbound programme and of the commission agreement.
13. Commission terms — the eight clauses in Part C.

**To resolve with one phone call each**
14. **Virginia ABC, (804) 213-4577** — are banquet licences in the public search or the downloadable file, and do they carry event date and location? This is the highest-value unknown in the document.
15. Maymont — the supplemental pre-screened Approved Caterers list: criteria, fee, how to apply.
16. Cultural Arts Center at Glen Allen — Christiana Roberts, Events Sales Manager: approval criteria for the approved-caterer list.
17. Science Museum of Virginia, 804.864.1466 — the preferred-caterer list is referenced but not published.
18. eVA vendor registration fee; SWaM certification fee. Neither is published.
19. Richmond BizSense — the $45/mo vs $145/yr vs "save 50%" discrepancy.
20. Whether VCU, University of Richmond, VCU Health, Bon Secours or HCA Virginia keep approved outside-caterer lists. Garnish lists "VCU – ICA" and "University of Richmond Campus" as preferred-caterer venues, so outside catering demonstrably happens on both campuses.

**Known dead ends — recorded so nobody researches them twice**
21. Marriage-licence mining: closed by statute in Virginia; useless in DC; counter-only in Maryland. Do not revisit.
22. Wedding Spot: no caterer category exists.
23. ILEA: no chapter in VA, DC or MD on its official chapter directory. A DC chapter has social accounts but is absent from the official list — unverified whether it is active.
24. Washington Business Journal and Richmond Times-Dispatch: both block automated fetching, so no RSS or alert URL could be confirmed. Someone needs to open them in a browser.
25. Washington Life's Balls and Galas Directory: most recent dated entry is September 2020. Mine once for names, do not wire it into a weekly process.
