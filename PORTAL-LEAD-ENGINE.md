# The lead engine — how it works and how to run it

Built 1 October 2026. Companion to `PORTAL.md` (the inbound portal) and
`LEAD-ENGINE.md` (the plan and the channel research this implements).

---

## What it is, and what it is not

It finds businesses worth calling, writes the call, and tells you on Monday what
to do first.

**What it is not:** it does not find customers by itself, and nothing in it sends
anything on its own. It reads public feeds, matches them against a list of
keywords, and hands a person a shortlist to judge. Every prospect still needs a
human to decide it is worth pursuing, attach a source, and write the opening
question. Describing it as anything more than that would be a lie the first time
somebody looked closely.

---

## The weekly rhythm

**Monday morning, about twenty minutes.**

1. `npm run sweep` — reads six feeds, prints what matched.
2. Open **/portal/signals** and go through the queue. Keep what is worth a look,
   drop the rest *with a reason*. Two kept out of ten is a good week.
3. Open **/portal/briefing** and work the big box at the top down. It picks what
   matters by what is behind, not by what is new.
4. Send whatever is sitting under **Letters**.

That is the whole operating procedure. Everything else is reference.

---

## The rules that keep it honest

These are the three decisions worth understanding before changing anything.

### Every fact has a source, and every source says what it does not prove

Each prospect carries `sources[]`, and each source has a URL, the date it was
read, and a `note`. The note states what the page **establishes** and, explicitly,
what it **does not**:

> *"Establishes the full 13-name approved list and the $500 refundable deposit…
> The approval criteria — insurance, licensing, certification, any fee to join —
> are NOT published and are not claimed here."*

That second half is the point. It is what lets somebody repeat a fact on a phone
call without being corrected. The API enforces it: a source submitted with a note
under 40 characters is rejected with a 400, so no form, script or future agent can
add an uncited claim.

### A prospect with no citation cannot rank above WARM

`applyProspectCap()` in `src/lib/portal/prospect-scoring.ts` holds any prospect
with zero sources below WARM no matter what it scores. The cap lowers the **band**,
never the number — so attaching a citation lifts it immediately rather than
requiring a re-entry.

Without this the board fills within a month with plausible-sounding entries nobody
can check, and the first time the top item turns out to be a guess, the chef stops
opening the page.

A second cap: `incumbency: "exclusive"` forces DECLINE outright. Some venues are
closed, and recording that is more useful than pretending otherwise.

### The briefing leads with what is behind

`briefingHeadline()` in `lead-store.ts` picks the headline in a fixed order:
overdue actions → unsent letters → empty prime dates → stale venue applications →
*then* this week's new finds. If anything is overdue, overdue is the headline.

An engine that reports fresh discoveries over an untouched backlog gets switched
off in month three, because the number going up is not the same as the business
getting better.

---

## The pages

| Page | What it is for |
|---|---|
| `/portal/start` | Day one. Four ideas, five numbered steps, the full glossary. |
| `/portal/briefing` | Monday. One box at the top chosen by what is behind. |
| `/portal/prospects` | The board and the dossiers. The dossier is the product. |
| `/portal/signals` | This week's raw finds, two taps each. |
| `/portal/venues` | The highest-value page. Grouped by how gettable, not alphabetically. |
| `/portal/outreach` | Letters, with the backlog leading if anything is unsent. |
| `/portal/brain` | Owner only. The facts everything else is built on. |
| `/portal/sweeps` | Owner only. What was checked, and what could not be confirmed. |
| `/print/outreach/[id]` | A letter on white paper. Outside `/portal` so it escapes the sidebar. |

Every page carries a plain-English **"what this page is for"** panel, open the
first time and collapsed after. The text lives in `src/lib/portal/guide-content.ts`
— one file, no components to touch, and rules at the top for anyone editing it.

---

## The approach scripts

Each prospect carries the same approach written five ways: phone, email, in
person, social, text. They sit **collapsed** on that prospect's page and appear
nowhere else — five scripts on a board makes a board nobody reads.

Each is rated **Best way in**, **Works** or **Don't**, and the ones rated *Don't*
carry a reason instead of a script. An Instagram DM to a county arts centre with a
published phone number and a named events manager does not make him look modern;
it makes him look like he could not find either. Writing that down once is more
useful than writing a script he would use badly.

**Scripts are not sendable records.** They deliberately do not count in the
backlog — thirty scripts would read as "thirty messages waiting" and destroy the
one number the briefing exists to protect. Pressing **"I'm going to use this"**
turns one into a real draft under Letters, which is when it starts counting.

Copy lives in `src/lib/portal/lead-approaches.ts`, with the two writing rules at
the top.

---

## Adding a feed or a keyword

Both are data in `src/lib/portal/feed-rules.ts`.

- **A feed** goes in `FEEDS`. Set `geoImplied: true` only if the publication is
  already local — Richmond BizSense only covers Richmond, so demanding the word
  "Richmond" in every headline would throw away most of it.
- **A keyword rule** goes in `RULES`. Phrases must be lower case; matching
  lowercases the text, and the test asserts it.
- **A place** goes in `GEO`. Be generous at the edges: a false positive costs ten
  seconds of triage, a false negative means a real opening is never seen.

**Never add a feed URL you have not confirmed returns items.** A feed that quietly
404s produces an engine that runs every Monday, reports nothing, and looks like a
slow week rather than a broken one.

`npm run test:feeds` tests the matching against fixtures, with no network — so it
tells you whether the search *would* recognise a lead independently of whether a
publisher is up today.

### If every feed fails at once

Almost never six publishers having a bad morning. It is usually a proxy, a VPN or
a firewall. The script says so when all six fail the same way. Try one of the URLs
in a browser on the same machine.

*(Note for the record: in the cloud environment this was built in, all six return
403 — that sandbox only permits outbound requests to an allow-listed set of hosts.
The parsing and matching are proven by the 39 fixture assertions in
`test-feed-parse.mjs`. Expect it to work on a normal machine; confirm on first run.)*

---

## What blocks the valuable work

**Five things, all on `/portal/brain`, all showing as amber NOT CONFIRMED chips.**

1. Liability insurance — carrier and limit
2. ServSafe or food-handler certification — holder and expiry
3. Business licence and health permits — which jurisdictions
4. SWaM certification status with the Virginia DSBSD
5. eVA vendor registration status

Every venue asks for these before adding a caterer to a list, so until they are
filled in, **no venue application can go out** — which is the highest-ROI work in
the engine. They are blank rather than guessed on purpose: a letter claiming a
certificate he does not hold is worse than one that never goes.

Also blank, and blocking anything being quoted: price bands, travel radius and
fee, minimums, deposit and cancellation terms.

---

## The open question worth one phone call

Virginia ABC grants **over 28,000 banquet and special-event licences a year**. The
*Banquet* licence is for individuals hosting a private event at an unlicensed
location — a wedding at a venue with no liquor licence — and the application
captures the **event date, times and venue address**. Processing is 7–10 days, so
filings sit weeks ahead of events.

If that register is publicly obtainable, it is not a signal that precedes catering
demand. It *is* the demand, and it would be the best lead source in this document.

**Whether it is public is unverified.** Resolve it by calling Virginia ABC License
Records Management on **(804) 213-4577**, then by Virginia FOIA request under
Va. Code § 2.2-3700 *et seq.* if refused. Record the answer either way — it is
already sitting as an open correction on `/portal/sweeps`.

---

## Compliance

If anyone is making outbound calls or sending outbound email on the chef's behalf,
that is an agency relationship and the rules attach to whoever dials and whoever
sends:

- **Calls and texts** — TCPA, and A2P 10DLC registration for any SMS programme.
- **Email** — CAN-SPAM: accurate headers, a real physical address, a working
  unsubscribe, honoured promptly.
- **Do-not-call** — scrub consumer calling against the National DNC registry.
  Business-to-business is treated differently; "differently" is not "exempt", and
  most wedding targets are consumers.

**Get the chef's lawyer to review the outbound programme before the first
campaign**, and get the commission agreement in writing before the first call.

### Marriage-licence records are closed. Do not revisit this.

Somebody will suggest it as the obvious wedding-lead source. It is not available:

- **Va. Code § 32.1-267(F)** — applications filed on or after 1 July 1997, and
  marriage registers, *"shall not be available for general public inspection."*
- **Va. Code § 32.1-271** — marriage records become public only after **25 years**.
- **Va. Code § 17.1-293** — secure remote-access court data may not *"be sold or
  posted on any other website or in any way redistributed to any third party."*

DC requires both parties' names *and* the marriage date up front, making it a
verification tool rather than a discovery one. Maryland is inspectable
post-issuance but counter-only, with no bulk route.

And the brand argument settles it regardless: cold-calling a couple who never
opted in is the wrong first impression for a premium private chef.

---

## Architecture notes

- **`lead-store.ts` is the only data-access path**, as `store.ts` is for the
  inbound side. Pages and routes never touch the seed directly.
- **The store is in-memory** and resets on server restart. Supabase is the
  production path — reimplement these functions against Postgres and no page,
  component or form changes. `resetDemoData()` resets both halves.
- **Client component props are serialised into the page** whether rendered or not.
  `ProspectBoard` takes a narrow `BoardProspect` built server-side that omits the
  estimated value entirely when the viewer may not see it. Keep that pattern for
  every new client component; a test asserts the assistant's HTML contains no
  figure.
- **`src/middleware.ts` is a routing gate, not a security boundary.** The Edge
  runtime has no `node:crypto`, so it reads the role unverified purely to route.
  Every page calls `requireStaff()` / `requireRolePage()` itself.
- **The print route lives at `/print`, not `/portal/print`**, because a Next.js
  route group cannot escape a parent layout — and a letter should not arrive with
  a sidebar on it. Middleware covers `/print` too.
- **Scoring is pure.** Same input and radius, same output. Two separate engines:
  `scoring.ts` for inbound enquiries, `prospect-scoring.ts` for outbound
  prospects. They answer different questions; do not merge them.

---

## The gate

Nothing ships until all of this passes.

```bash
npx tsc --noEmit                              # 0 errors
npx next lint                                 # 0 warnings
npm run build                                 # 0 warnings

npm run test:scoring                          #  51
npm run test:prospects                        #  56
npm run test:feeds                            #  39
BASE=<url> npm run test:portal                #  78
BASE=<url> npm run test:pipeline              #  21
BASE=<url> npm run qa:entry                   #  16
BASE=<url> npm run test:lead-engine           #  86
BASE=<url> npm run qa:portal                  # "No failures."
```

**347 assertions.** `qa-portal` sweeps 320 / 390 / 768 / 1023 / 1024 / 1440px
across both roles and the guest portal — **1023 and 1024 sit either side of the
sidebar breakpoint**, so never narrow that run without saying why.

Two things about running the suites:

- **`test-lead-engine.mjs` mutates the store**, so run it against a freshly
  started server. Its seed-integrity group runs first, before anything changes.
- **Never put `pkill` in the same bash command as a build or a test.** It kills
  the shell and you will spend an hour debugging a stale bundle.
