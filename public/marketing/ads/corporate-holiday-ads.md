# Paid social — Corporate Holiday Parties

Three concepts, written to be handed straight to a media buyer or run by Chef Kearse himself. Each one names the audience, the creative, the exact copy, and what has to be true for it to be worth spending money on.

**Season:** live from the first week of October to the second week of December. Corporate holiday budgets are decided in October, and the decision is usually made by someone who is not enjoying making it.

**Who you are actually talking to:** an office manager, an executive assistant, or an HR lead who has been handed "sort out the holiday party" on top of their real job. They are not looking for the best food in Virginia. They are looking for one supplier who will not embarrass them. Every concept below is written to that person, not to a food lover.

---

## Before spending anything

Three things must be in place or the money is wasted:

1. **A working destination.** The enquiry form must be live on a domain that resolves. Paying to send traffic to a dead link is how the current situation started.
2. **A tracked conversion.** The intake form pushes `inquiry_submitted` to `dataLayer`. Wire that to a conversion event before the first dollar, or you will be optimising blind for the whole season.
3. **A named budget floor.** The bands on the enquiry form are placeholders until Chef Kearse confirms them. Running paid traffic into an unqualified form fills the pipeline with people whose budget was never going to work — the opposite of what the filter is for.

**Suggested opening spend:** $20–30 a day per concept for the first ten days, then kill the two weakest and put everything behind the winner. Do not spread $30 across three concepts; you will learn nothing from any of them.

**Geography:** Richmond metro, Henrico, Chesterfield, Short Pump, Glen Allen, Midlothian; Northern Virginia (Arlington, Alexandria, Fairfax, Tysons); Washington DC; Bethesda and Silver Spring. Radius targeting beats named-city targeting here because the service area is a drive time, not a boundary.

**Exclusions:** anyone who has already submitted an enquiry. Nothing annoys a buyer faster than being advertised to after they have already asked you to call them.

---

## Concept A — The empty conference room

**The insight it runs on:** the alternative to hiring him is not "nothing". It is a room nobody remembers. Name the thing the buyer is quietly worried about.

**Format:** single image, 4:5 for feed, 9:16 cut for stories.

**Image:** use the generated atmosphere plate `corporate-holiday-01` from the prompt sheet — an empty, over-lit corporate function room, deliberately joyless, shot cool and flat. This is the only place in the whole programme where a cool, unappetising grade is correct, because it is the thing being rejected.

**Headline**
> Your team will not remember the ballroom.

**Body**
> A private chef in your own space. Cooked on site, plated to order, served and cleared by his own team. Usually for what you are already paying the hotel.
>
> Richmond, Northern Virginia, DC and Maryland. December dates are going.

**Call to action:** Check your date

**Destination:** `/book?service=corporate`

**Why it should work:** it sells against a specific, familiar experience rather than making a claim about quality that every caterer makes. The buyer recognises the room in the picture.

**What would make it fail:** if the image reads as a real venue that someone recognises, or as a sneer at the buyer's previous choice. Keep it anonymous and keep the tone dry, not superior.

---

## Concept B — Carved in front of you

**The insight it runs on:** the buyer needs one image they can forward to their boss that makes the decision look good. Give them theatre.

**Format:** single image or a four-second silent loop, 1:1 and 9:16.

**Image:** Chef Kearse's own photograph — `/images/dishes/smoked-beef-sliced-1600.webp`. A real dish, his own work, warm grade. Do not generate a substitute; this is exactly the case where a real photograph beats anything generated, and using a generated dish here would misrepresent what a guest is served.

**Headline**
> Eight hours of smoke, carved at your table.

**Body**
> Private chef dinners and full-service catering for companies across Virginia, DC and Maryland. He cooks in your space, comes out and talks to your people about what they are eating, then leaves the place spotless.
>
> Thirty to a hundred and fifty guests. December is filling.

**Call to action:** See the menus

**Destination:** `/menus`

**Why this one goes to the menus page and not the form:** it is a top-of-funnel image with no urgency in it. Someone who taps it is curious, not ready. Send them to the menus, let the site do the work, and retarget them with Concept C.

---

## Concept C — Retargeting: the two numbers

**Audience:** anyone who visited `/menus`, `/experiences` or `/book` in the last thirty days and did not submit. This is where the money actually converts, and it should carry at least half the budget once it has an audience to work with.

**Format:** single image, 4:5 and 9:16.

**Image:** `/images/dishes/table-setting-1600.webp` — his own photograph of a dressed table. Calm, not a hard sell.

**Headline**
> Two things and he can tell you if he is free.

**Body**
> A date and a headcount. That is the whole enquiry. If your date is open he comes back with a menu built for your room; if it is not, he tells you straight away instead of leaving you waiting.
>
> Corporate dinners, thirty to a hundred and fifty guests.

**Call to action:** Check your date

**Destination:** `/book?service=corporate`

**Why it should work:** the single biggest reason a warm visitor does not enquire is not price, it is not knowing how much effort the enquiry will be. This ad answers that and nothing else.

---

## Measuring it honestly

Do not judge these on clicks. A cheap click into an unqualified enquiry costs more than an expensive click into a booking, because the expensive part of this business is Chef Kearse's time.

The numbers that matter, in order:

1. **Cost per A or B band enquiry.** The portal scores every enquiry on arrival, so this is knowable within a day. C and D band enquiries from paid traffic are a cost, not a result.
2. **Cost per booked event.** The only number that pays for anything.
3. **Band mix by concept.** If one concept produces volume and the other produces bookings, the volume one is losing money however good its click-through rate looks.

A fair benchmark for a first season in this market: expect to spend more than feels comfortable to learn which concept works, and expect the retargeting concept to carry the campaign once it has an audience. Judge the whole thing at the end of November, not in week two.

---

## What is not in here, and why

There is no discount, no "book by Friday", and no invented scarcity. The dates genuinely do fill from the outside in and Fridays genuinely do go first, so the urgency in Concept A is true. Inventing a deadline would work once and cost his reputation with exactly the kind of repeat corporate client this campaign exists to win.
