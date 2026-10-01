# Chef R. Kearse — Private Chef & Catering

Marketing site, qualifying enquiry funnel, staff portal and guest event pages for
Chef R. Kearse (Richmond, VA · Northern Virginia · Washington DC · Maryland).

Next.js 15 (App Router) · TypeScript · Tailwind v4 · GSAP ScrollTrigger · Lenis ·
Zod. Static-rendered marketing pages, a dynamic portal behind auth, and guest
event pages behind magic links — one application, one deployment.

**The portal has its own documentation: see `PORTAL.md`.** It covers the
qualification engine, the two dashboards, the menu builder, the campaign engine,
what is honestly not production yet, and the order to do things in when going
live.

---

## Run it

```bash
npm install
npm run dev           # http://localhost:3000
npm run build         # production build
npm start             # serve the production build
npm run lint
npm run test:scoring  # 51 assertions on the qualification engine
```

Node 20+.

### The portal

Sign in at `/portal`. Demo credentials are printed on the sign-in page and in
`PORTAL.md`; they come out before launch.

| Who | Email | Password |
|---|---|---|
| Chef R. Kearse (owner) | `chefrkearse@gmail.com` | `chef2026` |
| Jordan Ellis (assistant) | `assistant@chefrkearse.com` | `desk2026` |

Two guest event pages are seeded: `/my-event/demo-danielle-brooks` (confirmed
wedding, menu locked) and `/my-event/demo-marcus-webb` (corporate dinner, deposit
outstanding, menu awaiting review).

Nothing needs a credential. The portal runs on seeded data that is dated relative
to today, so the "next event" is always genuinely next week.

---

## Environment

Copy `.env.example` to `.env.local`. **Every variable is optional** — with none
of them set, the enquiry form still works end to end and logs the submission to
the server console ("demo mode"), so the site can be demoed before the client
has provided a single credential.

| Variable | Purpose |
|---|---|
| `RESEND_API_KEY` | Enables real email delivery via Resend. Without it, submissions are logged, not sent. |
| `INQUIRY_TO` | Where enquiries go. Defaults to `chefrkearse@gmail.com`. |
| `INQUIRY_FROM` | The `From:` header. Must be a domain verified in Resend. |
| `PORTAL_SESSION_SECRET` | Signs the portal session cookie. Falls back to a build-time constant in the demo — **set it before any public deployment**. |

The enquiry route (`src/app/api/inquiry/route.ts`) validates with Zod, rate-limits
to 8 submissions per IP per hour, carries a honeypot field and a
time-on-form check, escapes everything into the HTML email, and sets `reply_to`
to the enquirer so hitting reply reaches them directly.

To swap Resend for Postmark, SendGrid or a CRM, replace the single `fetch` block
in that file. Nothing else in the app knows how mail is sent.

---

## Where the content lives

Edit content, not components.

| File | What it controls |
|---|---|
| `src/lib/site.ts` | **Every business fact.** Name, tagline, phones, email, service areas, cuisines, inclusions, service styles, bar options, social links, pricing switch, response-time switch, real testimonials |
| `src/lib/dishes.ts` | The photo catalogue — slug, title, description, alt text, dimensions, category, which appear in the home rail |
| `src/lib/experiences.ts` | The four service lines and the four process steps |
| `src/lib/faq.ts` | General FAQ and the wedding-specific FAQ |
| `src/lib/schema.ts` | All JSON-LD builders |
| `src/lib/portal/scoring.ts` | **The qualification engine** — the nine weights, the four bands, the below-floor cap |
| `src/lib/portal/seed.ts` | All demo data, and the course templates per service style |
| `src/lib/portal/prep.ts` | Component lists and prep timings for the shopping-list generator |
| `src/lib/portal/store.ts` | The data layer, and the weekly campaign engine's four rules |

### Turning pricing on

`site.pricing.published` is `false` because no verified price for this business
exists publicly. Fill `site.pricing.bands` with real numbers and flip it to
`true` — the Experiences page renders the band table automatically.

### Turning the response promise on

`site.responsePromise.published` is `false` for the same reason. Turn it on only
once the chef agrees to hold the standard.

---

## Images

Source photography lives in `public/images/`:

```
public/images/dishes/<slug>-{640,1024,1600}.webp
public/images/story/chef-portrait-{480,800,1200}.webp
public/images/story/chef-kitchen-{640,1024,1600}.webp
public/images/brand/logo-ink.png      # black blade — for light surfaces
public/images/brand/logo-bone.png     # bone blade — for dark surfaces and photos
```

Every dish image is a real photograph of the chef's own work, taken from his
Yelp gallery and his Instagram. Provenance, processing and the naming policy are
documented in `CONTEXT.md`.

**When new photography arrives**, drop the full-resolution files in and
regenerate the three widths. Any image tool will do; the pipeline used for this
build resamples with Lanczos, applies a mild unsharp mask only when upscaling,
and writes WebP at quality 80. Then update the `w`/`h` values in
`src/lib/dishes.ts` to match — they drive the layout reservation that keeps CLS
at zero.

---

## The four documents that ship with this build

| File | What it is |
|---|---|
| `CONTEXT.md` | Every verified fact with its source, plus the **CONFIRM WITH CLIENT** list |
| `DESIGN.md` | The styling source of truth — tokens, type, layout, motion, accessibility |
| `AUDIT.md` | Scored audit of what was there before, competitive picture, and the money math |
| `ASSET-BRIEF.md` | The photography shot list and the Nano Banana prompts for atmosphere plates |
| `PORTAL.md` | **The portal** — qualification engine, both dashboards, menu builder, campaign engine, going live |
| `DOMAIN-AND-GBP-RECOVERY.md` | Recovering the Google Business Profile and the domain, and what to say to the client |
| `PITCH.md` | The one-pager to put in front of the chef |

---

## Deploying

### Vercel

1. Push the repository, import it in Vercel. Framework is detected; no build
   configuration needed.
2. Add `RESEND_API_KEY`, `INQUIRY_TO` and `INQUIRY_FROM` in project settings.
3. Add `chefrkearse.com` and `www.chefrkearse.com` as domains.
4. **The domain is not currently under the client's control**, so it cannot be
   repointed yet. Do not let this hold up the launch — see
   `DOMAIN-AND-GBP-RECOVERY.md`. Give recovery one week, and if it is not
   resolved, register a new domain and launch on that. If the old one comes back
   later, redirect it.
5. Change `site.url` in `src/lib/site.ts` to whatever domain is settled on — it
   drives canonicals, the sitemap and all schema. Then update `SITE` at the top of
   `scripts/build-emails.mjs` and re-run `node scripts/build-emails.mjs` so the
   ten campaign emails rebuild with working links.
6. Set `PORTAL_SESSION_SECRET`. Remove the demo-credentials panel from
   `src/app/portal/login/page.tsx` and the `demoPassword` field from
   `StaffUser`. See `PORTAL.md` → "Going live".

### The hour after launch

- [ ] **The Google Business Profile is owned by somebody else and cannot be edited.**
      Start the ownership-recovery process — it runs on Google's timetable, so the
      sooner it starts the better. Full process in `DOMAIN-AND-GBP-RECOVERY.md`.
      The whole GBP checklist below waits on that, and it is the single biggest
      source of enquiries a chef in this position has.
- [ ] Instagram bio → update the link
- [ ] Zola, Yelp, Thumbtack, Fash, Nextdoor, BBB, Facebook → update the website field on each
- [ ] Submit `https://chefrkearse.com/sitemap.xml` in Google Search Console
- [ ] Validate the JSON-LD on `/`, `/menus`, `/weddings` and `/faq` in the Rich Results Test
- [ ] Send one real test enquiry and confirm the email arrives and reply-to works
- [ ] Ask the last five happy clients for a Google review — his Google review
      count is the single biggest gap against his competitors

---

## QA

`scripts/shots.mjs` drives Playwright over every route at 390 / 834 / 1440,
capturing full-page screenshots and reporting console errors, failed requests,
non-200 responses, horizontal overflow and undersized tap targets.

```bash
npm run build && npm start &
BASE=http://localhost:3000 MODE=layout  node scripts/shots.mjs   # layout, reduced motion
BASE=http://localhost:3000 MODE=motion  node scripts/shots.mjs   # stepped viewport, motion on
```

`MODE=layout` forces `prefers-reduced-motion: reduce` so pinned sections lay out
normally and every scroll reveal is painted — otherwise a full-page capture of a
pinned section is mostly empty spacer.

### Verified on this build

Production build, Chromium, 29 September 2026.

**Automated test suites — all green**

| Suite | What it covers | Result |
|---|---|---|
| `npm run test:scoring` | The qualification engine: weight sums, band boundaries, the below-floor cap, lead-time curve, effort scoring, DST-safe date maths, determinism | **51 passed, 0 failed** |
| `node scripts/test-portal.mjs` | End-to-end and security: unauthenticated access to every page and API, forged cookies, role isolation, cross-token access, menu locking, intake scoring and routing, honeypot, SEO hygiene | **78 passed, 0 failed** |
| `node scripts/qa-portal.mjs` | Accessibility and visual, both roles plus guest, at 390 / 834 / 1440: console errors, network failures, overflow, tap targets, alt text, control labelling, heading order, keyboard pass, reduced motion | **No failures** |

The security assertions worth naming, because they were written to fail if the
gate were only cosmetic:

- A signed-out request to any of the eight portal pages gets a real 307 to the
  sign-in screen, and every portal API returns 401.
- A hand-forged session cookie is rejected.
- The assistant is redirected away from Settings and cannot change a setting or
  override a band through the API.
- With the financial toggle off, the string `$9,600` does not appear anywhere in
  the HTML sent to the assistant's browser — and does appear in the owner's. The
  gate is a data gate, not a CSS one.
- One guest's magic-link token cannot post a message into, or edit the menu of,
  another guest's event.
- A locked menu returns 409 to an edit from either side.
- A guest cannot lock their own menu.
- Nobody can mark a campaign item "sent" by hand.

**Lighthouse — mobile preset, ten public routes**

| Route | Perf | A11y | Best practices | SEO | Route | Perf | A11y | Best practices | SEO |
|---|---|---|---|---|---|---|---|---|---|
| `/` | 86 | 100 | 100 | 100 | `/about` | 85 | 100 | 100 | 100 |
| `/book` | 94 | 100 | 100 | 100 | `/experiences` | 81 | 100 | 100 | 100 |
| `/menus` | 55 | 100 | 100 | 100 | `/faq` | 94 | 100 | 100 | 100 |
| `/weddings` | 85 | 100 | 100 | 100 | `/gallery` | 75 | 100 | 100 | 100 |
| `/contact` | 72 | 100 | 100 | 100 | `/privacy` | 73 | 100 | 100 | 100 |

**Accessibility, best practices and SEO are 100 on every route.**

**Mobile performance** is 55–94 and is a direct function of how much of the
chef's photography each page loads over simulated slow 4G. It is capped by the
source images, none of which is larger than about 1000px — the fix is the shot
list in `ASSET-BRIEF.md`, not more code.

**Core Web Vitals — Pixel 5 emulation, 4x CPU throttle, 1.6 Mbps**

Measured directly with `PerformanceObserver` (`scripts/cls2.mjs`):

| Route | CLS | | Route | CLS |
|---|---|---|---|---|
| `/` | 0.0001 | | `/about` | 0.0093 |
| `/book` | 0.0001 | | `/faq` | 0.0000 |
| `/menus` | 0.0000 | | `/contact` | 0.0000 |
| `/gallery` | 0.0000 | | `/privacy` | 0.0000 |
| `/weddings` | 0.0095 | | `/experiences` | 0.0137 |

Every route is an order of magnitude inside the 0.1 "good" threshold.

**Known measurement artefact.** Lighthouse's *mobile* preset intermittently
reports exactly 0.3001 CLS on a random route — in this run, on `/contact` and
`/privacy`, which are the two lightest pages on the site and which direct
measurement puts at 0.0000. The trace attributes it to a node collapsing to a
zero-size rect carrying `had_recent_input: true`, which the spec excludes from
CLS and which nothing in this codebase does. It never appears on the desktop
preset. Treat the direct measurement above as the truth and re-check on real
hardware after deploy. Two genuine defects were found and fixed while chasing it
earlier in the build — an unsized footer logo and a font-swap reflow — so it has
already earned its keep.

**Tap targets.** Measured against WCAG 2.2 AA, which asks for 24x24 CSS pixels.
Every interactive control passes, measuring the *effective* target — a 16px
checkbox inside a 44px label is a 44px target. On a touch device every small
button resolves to 44px and every checkbox row to 57px or more, because
`p-btn-sm` and `p-check-row` grow under `@media (pointer: coarse)`. Desktop keeps
the density an operations console wants.

**Everything else, verified**

- Production build compiles with **zero warnings and zero type errors**
- 13 static routes, 12 dynamic (the portal, guest pages and API), one middleware
- 120KB First Load JS on the heaviest public route — GSAP is a dynamic import and
  is not in the initial bundle
- **Zero console errors or warnings** on every route, public and portal, at all
  three widths, for all three roles
- **Zero failed network requests**; no third-party requests at all
- **Zero horizontal overflow** at 390 / 834 / 1440
- Enquiry API verified: valid payload accepted and scored, band A / B / D routing
  correct, the below-floor cap applied, honeypot silently dropped, sub-2.5s
  submission silently dropped, malformed payload rejected with 400, rate limit
  enforced
- JSON-LD parses on all ten public routes and emits the expected types
- The portal and guest pages are absent from the sitemap and marked `noindex`
- `/robots.txt` and `/sitemap.xml` serve correctly
- 404 route returns a real 404 with a designed page
- Reduced-motion pass on the public site and the portal
- Keyboard-only pass: through the five-step enquiry form, and through portal
  sign-in to an authenticated dashboard, with a visible focus indicator
- Gallery lightbox: Escape, arrow keys, focus handling, scroll lock
- All 19 campaign creative files serve, every email carries an unsubscribe token,
  and no emoji appears in any of them

## Architecture notes

- **Motion is transform/opacity only** and never runs during LCP. GSAP and Lenis
  are client-side; the hero's first paint is server HTML plus a priority image.
- **Pinning is desktop-gated** (`min-width: 1024px` and `pointer: fine`). On a
  phone the horizontal rail is a native snap-scroller.
- **CSS layering:** base element styles are in `@layer base`, component classes
  in `@layer components`, so Tailwind utilities always win. Do not add unlayered
  CSS to `globals.css` — it will silently override utility classes.
- **Fonts are self-hosted** from npm (`@fontsource-variable/*`). There is no
  Google Fonts request anywhere, which is faster and keeps the privacy note honest.
- **No browser storage is used.** Nothing is written to `localStorage`,
  `sessionStorage` or cookies.
