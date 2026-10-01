# The Kitchen Office — portal documentation

The staff portal, the guest event pages, and the qualification engine behind the enquiry form.

Everything here runs inside the same Next.js application as the marketing site. There is no second app, no separate deployment and no extra hosting bill.

---

## What it is

Three surfaces over one set of data.

| Surface | Who | Where | How they get in |
|---|---|---|---|
| Owner dashboard | Chef R. Kearse | `/portal` | Email and password |
| Assistant desk | The events assistant | `/portal` | Email and password |
| Guest event page | Each client | `/my-event/<token>` | A magic link, no account |

The owner and the assistant sign in at the same URL and get **entirely different screens**, not the same screen with boxes hidden. That is deliberate — see "Why two dashboards" below.

---

## Signing in to the demo

| Who | Email | Password |
|---|---|---|
| Chef R. Kearse (owner) | `chefrkearse@gmail.com` | `chef2026` |
| Jordan Ellis (assistant) | `assistant@chefrkearse.com` | `desk2026` |

These are printed on the sign-in page as well, because a demo nobody can get into is not a demo. **Both the credentials and that panel come out before launch.**

Two guest event pages are seeded:

- `/my-event/demo-danielle-brooks` — a confirmed wedding eight days out, menu locked
- `/my-event/demo-marcus-webb` — a corporate dinner with the deposit outstanding and a menu awaiting review

Every screen carries a standing "Demo data" banner. Every guest, date, figure and campaign statistic is invented.

---

## The qualification engine

This is the part that answers the chef's actual complaint: people wasting his time and never becoming clients.

Every enquiry is scored out of 100 on nine signals the moment it arrives, then routed into one of four bands. **The guest never sees a score, and every band gets a courteous reply.** The score only decides how much of the chef's attention the enquiry has earned, and how fast.

| Signal | Weight | What it reads |
|---|---|---|
| Budget band | 22 | The strongest single predictor of a booking |
| Lead time | 18 | Days until the event; rises to a peak in the 21–120 day window, falls either side |
| Event type | 12 | Weddings and corporate weighted to the top — the growth lines |
| Party size | 12 | Fit against the practical minimum and the comfortable band |
| Decision maker | 8 | Whether the enquirer signs off |
| Venue readiness | 8 | How real the event is yet |
| Source | 8 | Referrals and returning clients highest |
| Commitment signals | 7 | Deposit acknowledged, reachable number, open to a call |
| Detail given | 5 | How much they wrote about the occasion |

| Band | Score | Who handles it | Standard | What goes out automatically |
|---|---|---|---|---|
| A — Priority | 75+ | Straight to the chef, flagged on his dashboard | 4 hours | Personal note, real open dates, tasting invitation |
| B — Qualified | 55–74 | Assistant screens, then hands over | 24 hours | Acknowledgement with menus and next step |
| C — Nurture | 35–54 | No chef time. Added to the seasonal list | Automated | Menus, service overview, newsletter opt-in |
| D — Not a fit | under 35 | Closed politely, zero human time | Automated | Gracious decline with the newsletter |

### The one hard rule above the weights

A weighted total alone can be outvoted. An enquiry that is a personal referral, 70 guests, a booked venue, a decision maker, well written and 60 days out scores **80 even at "under $75 a guest"** — which would route it straight to the chef inside four hours. That is exactly the wasted hour this engine exists to prevent.

But it must not be auto-declined either. Somebody that organised with a budget below the floor is a **scope** conversation — family style instead of plated, a shorter menu, fewer guests — not a brush-off. Auto-nurturing them loses real work.

So a below-floor budget **caps the band at B**: a human looks at it, cheaply, within a day, and either re-scopes it or says no kindly. The cap appears in the score breakdown as a tenth line so the office can always see why a high score did not reach the chef.

This was found by the test suite, not by inspection. `npm run test:scoring` covers it.

### Every number here is a proposal, not a finding

None of the weights or thresholds come from Chef Kearse's own booking history, because we do not have it. They are a defensible opening position based on how this kind of work converts generally.

**After roughly thirty scored enquiries**, retune them:

1. Export the enquiries and mark which actually booked.
2. For each signal, compare the average score of bookers against non-bookers. A signal where they barely differ is carrying weight it has not earned.
3. Look at every manual override the chef made and why. An override is him telling you the engine is wrong about something specific — that is the most valuable data in the system, which is why the override requires a written reason.
4. Move weight from the signals that did not separate to the ones that did. Re-run `npm run test:scoring` afterwards; the monotonicity and boundary tests will catch a change that breaks the ordering.

All of it lives in `src/lib/portal/scoring.ts`, in one place, with the weights as a single exported object.

---

## Why two dashboards

The chef and his assistant do not need the same screen with parts removed. They ask different questions when they open it.

**He asks "what is the state of my business, and what will break if I ignore it."** So he lands on: a computed "needs you" queue, the next events with the four flags that actually blow one up (deposit, menu locked, headcount, allergies logged), pipeline value, the eight-week calendar with open prime dates highlighted, the qualification funnel showing how many hours the filter saved him, and where work is being lost and what it cost.

**She asks "what do I have to get done, and in what order."** So she lands on a work queue grouped into *behind*, *today* and *this week*, with every item phrased as the next physical action — "chase the deposit", not "deposit: outstanding". Then run-sheets per event showing only the items that are hers, guests waiting on a reply with one-tap call and email, and enquiries to screen before they reach him.

### The financial gate is a data gate

By default the assistant sees **no revenue figures at all** — not quoted values, not booked values, not deposit amounts, and no money panels anywhere.

This is not CSS. With the toggle off, those figures are never fetched and never sent to her browser. The test suite asserts it: it fetches `/portal/leads` with her session and confirms the string `$9,600` does not appear in the HTML, then fetches the same page with the owner's session and confirms it does.

The owner turns it on in Settings the day she starts invoicing.

### What we do not know yet

Her screen was built on an assumption about how she works, not on asking her. An events assistant's job is chasing and coordinating, so it is a task queue — but that is a guess, and the portal says so on her own dashboard. **Ask her what she actually chases in a week, and what she wishes she did not have to.** Then rebuild it around the answer.

Her name and email in this build are placeholders.

---

## The guest event page

Magic link, no account, no password, no app. The link goes out with the confirmation email and everything about the booking lives behind it.

- A countdown and the event summary
- **Where things stand** — a five-step ladder derived from real state, so the guest can see exactly what is done and what is waiting on whom
- A conversation with the chef and the office, showing which of the two replied
- The menu builder
- Day-of timings and who is working

The commercial point: most of the "just checking in" emails a caterer answers come from a guest who cannot see the state of their own booking. Show them and those emails stop. That is time back for the chef and a calmer client.

An unrecognised token gets a **helpful page with the phone number**, not a bare 404 — the person holding a dead link is almost never an attacker, it is a guest whose link expired or who copied it out of an email badly.

### Token security

In this demo the tokens are readable strings (`demo-danielle-brooks`) so you can open them from the portal while presenting. **In production they must be opaque, single-purpose, expiring and rate-limited** — `newClientToken()` in `src/lib/portal/auth.ts` already generates the right shape.

What is already enforced: a token resolves to exactly one lead, and every API call carrying a token checks that the token's lead matches the record being changed. Holding one valid link never grants access to another guest's event or menu. The test suite covers both attempts.

---

## The menu builder

One component, used by the guest on their event page and by the chef in the portal, over one source of truth — so there is never a version of the menu only one side can see.

What makes it worth building rather than emailing a PDF back and forth:

- The guest picks from **the chef's own photographed work**, so they choose what they have actually seen.
- They enter their guests' restrictions and the builder **flags the dishes that collide, per guest**, before anybody is embarrassed at a table. Flagged for a human, never auto-cleared.
- Comments sit on the course they refer to, so "can we change the fish" never gets lost in a thread.
- Locking is explicit, one-way, and enforced on the server. A locked menu returns 409 to any edit, from either side, until the chef reopens it.
- **The locked menu generates the shopping and prep list** on the kitchen side.

Nothing is priced. No verified price for this business exists publicly, so showing an estimate would mean inventing one. The panel says so plainly, and real prices switch on from Settings.

---

## Shopping and prep generation

When a menu locks, `src/lib/portal/prep.ts` turns it into a shopping list grouped the way you walk a shop, and a prep schedule counted backwards from service time — with real clock times, including "Day before, 4:00 PM" where a step crosses midnight. Both download as a text file.

**The honest caveat, also printed in the interface:** the component lines are derived from what is *visible* in each of the chef's photographs, the same basis as the dish titles. They are not his recipes and the quantities are conventional catering yields, not his. They exist so the feature can be demonstrated end to end.

The moment he gives us his real component lists and yields, `SPECS` in that file is replaced and the lists become genuinely useful. Until then every generated list carries the notice.

---

## The weekly campaign engine

The chef asked for a marketing tab that updates itself weekly so he can see what is going out and grab what he wants.

`composeWeeklyQueue()` in `src/lib/portal/store.ts` rebuilds the queue from four rules, in priority order:

1. **Open date pressure.** Any Friday or Saturday inside 21 days with no confirmed event queues the Open Weekend campaign for that date. Highest value, because it converts idle capacity.
2. **Seasonal window.** A campaign whose active months include this month or next queues its next touch.
3. **Segment state.** Lapsed subscribers past 180 days with no send in 90 queue the win-back; completed events past three days with no review queue the referral ask.
4. **Always-on floor.** If fewer than three items met a rule, the wedding campaign fills the gap — an empty marketing week is worse than a quiet one.

**Every queued item carries the rule that put it there**, printed under it in the interface, so it never feels like a black box.

**Nothing sends without approval.** That is not configurable in this build. A marketing automation that emails a chef's past clients without him having read it is a liability, not a feature — one clumsy line in front of a wedding client costs more than the campaign earns.

In production this runs as a scheduled job on Monday at 06:00 local. In demo mode it runs at cold start and from the "Rebuild the queue" control.

### The creative is real and it is already in there

Nineteen finished files under `public/marketing/`, downloadable from the Marketing tab:

- **Ten HTML emails**, brand-styled, table-based, tested for the clients that matter, every one with an unsubscribe line
- **Two paid-social ad briefs** — headline, body, call to action, targeting, and the exact image to pair with each
- **Two image-prompt sheets** for Nano Banana, each prompt naming its destination file
- **Four caption and story sets**, written in his voice, ready to paste
- **One twelve-month strategy document** with the calendar, segments, budget shape and what to measure

The emails are generated from one shell by `scripts/build-emails.mjs`, so the brand cannot drift between campaigns. Edit the shell, run `node scripts/build-emails.mjs`, and all ten rebuild.

**No Higgsfield on this project** — generated imagery ships as written prompts for the client to run in Nano Banana himself.

**Two absolute rules in every prompt sheet:** no generated image may depict a dish a guest could order, and no generated image may depict a wedding that did not happen. Generated imagery is atmosphere only — rooms, light, texture, an empty table.

---

## Architecture

```
src/lib/portal/
  types.ts     every domain type; ORG_ID for multi-tenancy
  scoring.ts   the qualification engine, the bands, the hard cap
  seed.ts      demo data, dated relative to today so it never goes stale
  store.ts     the data access layer + the derived intelligence
  prep.ts      shopping and prep generation from a locked menu
  auth.ts      HMAC signed-cookie sessions
  guard.ts     requireStaff / requireRolePage for pages

src/app/portal/          staff surfaces
src/app/my-event/[token] guest surfaces
src/app/api/portal/      route handlers
src/middleware.ts        the route gate
src/components/portal/   portal UI
```

**Everything goes through `store.ts`.** No page, component or route handler touches the data any other way. That is the whole point: moving to Supabase means reimplementing the functions in that one file against Postgres, and nothing else changes.

### Multi-tenancy from the first line

Every record carries `orgId`. In demo mode there is exactly one org, but the schema does not need migrating to run a second chef, a restaurant group, or the agency's own instance. Retrofitting this later would have been expensive; doing it now cost nothing.

### Where authorisation actually happens

Three layers, and only two of them are the security boundary:

1. **`src/middleware.ts`** — routing only. Checks that a session cookie is *present* and issues a real 307 if not. It does not verify the signature, because middleware runs in the Edge runtime where `node:crypto` is unavailable. A forged cookie gets past it. **This is not the security boundary and nothing should ever be written that assumes it is.**
2. **Pages** — `requireStaff()` / `requireRolePage("owner")`, which verify the signature. An assistant who types `/portal/settings` is redirected before the page renders, so the data is never fetched or sent.
3. **Route handlers** — `getSession()` on every one. A route handler is a public endpoint until it says otherwise.

Identity always comes from the session, never from the request body. The client sends an `actor` field for convenience; the server ignores it and uses the session's name.

### Why the middleware exists at all

A `redirect()` inside a server component fires after the layout above it has begun streaming. Next cannot un-send those bytes, so instead of a 307 it appends `<meta http-equiv="refresh" content="1;url=/portal/login">` and returns 200. No data leaks — the page never renders — but a signed-out visitor sits on a blank shell for a second, and anything reading status codes believes the page exists. Middleware runs before rendering, so it answers properly.

---

## Demo mode: what is honestly not production

The store lives in module memory on the server. It survives navigation and every mutation inside a running server, which is what a live demo needs. It does **not** survive a restart, and on a serverless host each cold start begins again from the seed.

Two consequences, fine for a demo and unacceptable in production:

- Changes made while presenting persist for that session and then reset.
- Two people browsing simultaneously may land on different server instances and see different state.

Also not production:

- **Auth.** Demo passwords, compared in constant time but not hashed at rest. No signup, reset, lockout or two-factor. `PORTAL_SESSION_SECRET` falls back to a build-time constant, so a public deployment **must** set it.
- **No realtime.** The floor-view sync across devices needs Supabase Realtime or a WebSocket.
- **No email or SMS delivery.** Enquiries are scored and recorded; approving a campaign item records the decision and sends nothing.
- **No payments.** Deposits and balances are tracked, not collected.
- **Client tokens** are readable demo strings, not opaque expiring ones.

---

## Going live

In the order that matters.

### 1. Set the session secret

```bash
PORTAL_SESSION_SECRET="$(openssl rand -base64 48)"
```

Non-negotiable before any public deployment.

### 2. Replace demo auth

Everything reads the session through `getSession()` / `requireRolePage()`, so this is `src/lib/portal/auth.ts` plus the login route, and nothing else.

Supabase Auth is the natural fit given the rest of the stack: it brings real password hashing, resets, email verification, two-factor and Google sign-in, and its JWT can be verified in Edge middleware with WebCrypto — which would let the middleware become a real gate rather than a routing hint.

Then remove the demo-credentials panel from `src/app/portal/login/page.tsx` and the `demoPassword` field from `StaffUser`.

### 3. Move the store to Postgres

Reimplement `store.ts` against Supabase. The baseline tables follow the types in `types.ts`. Three things to get right:

- **Row-level security scoped by `orgId`**, so a staff account can never read another org's data, and verify it by attempting a cross-tenant read rather than assuming.
- **Race safety on any write that reserves capacity.** A booking confirmation and a run-sheet update are fine; if a future version reserves a date or a table, that write needs a database-level constraint or a serialised transaction, not an optimistic client check. Test it with concurrent requests.
- **Timezones explicit.** Store UTC, render in the restaurant's local timezone, and test a booking across a DST boundary. `daysBetween()` in `scoring.ts` is already date-only and DST-safe, and the test suite checks both boundaries.

### 4. Connect the integrations

Each behind its own adapter so it stays optional and swappable: Resend or Postmark for email, Twilio for SMS, Stripe Payment Intents for deposits and tickets. **Never touch raw card data** — Stripe Elements only.

SMS needs explicit written opt-in with a disclosure at collection, STOP and HELP handling, quiet hours, and A2P 10DLC registration. The Audience page states this; none of it is optional and the penalties are per message.

### 5. Real client tokens

Swap the demo strings for `newClientToken()` output, store a hash rather than the token, give each an expiry, and rate-limit lookups.

---

## Running the checks

```bash
npm run test:scoring          # 51 assertions on the qualification engine
npm run build && npm start &
node scripts/test-portal.mjs  # 78 end-to-end and security assertions
node scripts/qa-portal.mjs    # accessibility and visual pass, all roles, 3 widths
```

`test-portal.mjs` is the one that matters most. It covers the things that would actually hurt: whether a signed-out stranger can reach any portal page or API, whether the assistant can reach the owner's settings or override a band, whether one guest's magic link reaches another guest's event or menu, whether a locked menu is really locked, whether the intake scores and routes correctly, whether the honeypot works, and whether the portal stays out of the sitemap.

`qa-portal.mjs` measures tap targets against **WCAG 2.2 AA (24px)**, which is this project's stated bar, and reports 24–43px separately as comfort notes rather than failures — the familiar 44px figure is Level AAA. It measures the effective target, so a 16px checkbox inside a 44px label is correctly read as a 44px target.

---

## Known measurement artefact

Lighthouse's **mobile** preset intermittently reports exactly `0.3001` CLS on a random public route. It reported it on `/contact` and `/privacy` in one run; direct `PerformanceObserver` measurement under identical Pixel 5 emulation and throttling reports `0.0000` for both, and those are the two lightest pages on the site. It never appears on the desktop preset.

Treat the direct measurement as the truth and re-check on real hardware after deploy. Two genuine defects were found and fixed while chasing this earlier in the build, so it has already earned its keep.
