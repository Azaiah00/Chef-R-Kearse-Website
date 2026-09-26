# Chef R. Kearse — Private Chef & Catering

Marketing site and enquiry funnel for Chef R. Kearse (Richmond, VA · Northern
Virginia · Washington DC · Maryland).

Next.js 15 (App Router) · TypeScript · Tailwind v4 · GSAP ScrollTrigger · Lenis ·
Zod. Static-rendered marketing pages, one dynamic API route for enquiries.

---

## Run it

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
npm start        # serve the production build
npm run lint
```

Node 20+.

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

---

## Deploying

### Vercel

1. Push the repository, import it in Vercel. Framework is detected; no build
   configuration needed.
2. Add `RESEND_API_KEY`, `INQUIRY_TO` and `INQUIRY_FROM` in project settings.
3. Add `chefrkearse.com` and `www.chefrkearse.com` as domains.
4. **Cancel the expired Squarespace subscription** and repoint DNS at Vercel.
   Until this happens the live domain still shows "Website Expired".
5. Change `site.url` in `src/lib/site.ts` if the domain is anything other than
   `https://chefrkearse.com` — it drives canonicals, the sitemap and all schema.

### The hour after launch

- [ ] Google Business Profile → change the website link from the dead URL to the live site
- [ ] GBP → add the menu link (`/menus`) and the booking link (`/book`)
- [ ] GBP → confirm primary category **Personal Chef**, secondary **Caterer**
- [ ] GBP → set attributes: catering, reservations, wheelchair accessible where true
- [ ] GBP → upload eight of the new photos, then keep a weekly cadence
- [ ] GBP → seed Q&A with five entries from `/faq`
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

Production build, Chromium, 24 September 2026.

**Lighthouse — desktop preset**

| Route | Perf | A11y | Best practices | SEO | LCP | CLS |
|---|---|---|---|---|---|---|
| `/` | 97 | 100 | 100 | 100 | 1.1s | 0 |
| `/book` | 100 | 100 | 100 | 100 | 0.8s | 0.001 |
| `/weddings` | 99 | 100 | 100 | 100 | 1.0s | 0.007 |
| `/menus` | 99 | 100 | 100 | 100 | 1.0s | 0 |

**Accessibility, best practices and SEO score 100 on all ten routes**, desktop
and mobile.

**Core Web Vitals — Pixel 5 emulation, 4x CPU throttle, 1.6 Mbps**

Measured directly with `PerformanceObserver` (`scripts/cls2.mjs`):

| Route | CLS | | Route | CLS |
|---|---|---|---|---|
| `/` | 0.0001 | | `/about` | 0.0093 |
| `/book` | 0.0004 | | `/faq` | 0.000 |
| `/menus` | 0.000 | | `/contact` | 0.000 |
| `/gallery` | 0.000 | | `/privacy` | 0.000 |
| `/weddings` | 0.0095 | | `/experiences` | 0.0137 |

Every route is an order of magnitude inside the 0.1 "good" threshold.

**Known measurement artefact.** Lighthouse's *mobile* preset intermittently
reports exactly 0.3001 CLS on a random route, roughly one run in three. The
trace shows a single shift carrying `had_recent_input: true` — which the spec
excludes from CLS — attributed to a node collapsing to a zero-size rect, which
nothing in this codebase does. It never reproduces under direct measurement with
the same emulation and throttling (table above), never appears on the desktop
preset, and never appears twice on the same route. Two real defects were found
and fixed while chasing it: an unsized footer logo, and a font-swap reflow (see
the font notes in `globals.css`). Re-check it on Vercel after deploy; if it is
still there on real hardware it is worth another look.

**Mobile Lighthouse performance** lands between 86 and 96 on the routes that
carry the least imagery and 66–92 on the image-heavy ones, entirely as a
function of how many of the chef's photographs each page loads over a simulated
slow-4G connection. It rises on its own when the photography is replaced with
properly exposed, properly sized files — see `ASSET-BRIEF.md`.

**Everything else, verified**

- Production build compiles with **zero warnings and zero type errors**
- 13 routes prerendered as static, one dynamic API route
- 120KB First Load JS on the heaviest route (GSAP is a dynamic import and is not
  in the initial bundle)
- **Zero console errors or warnings** on every route, desktop and mobile
- **Zero failed network requests**; no third-party requests at all
- **Zero horizontal overflow** at 390 / 834 / 1440
- Enquiry API verified: valid payload accepted, honeypot silently dropped,
  sub-2.5s submission silently dropped, malformed payload rejected with 400,
  rate limit enforced
- JSON-LD parses on all ten routes and emits the expected types
- `/robots.txt` and `/sitemap.xml` serve correctly
- 404 route returns a real 404 with a designed page
- Reduced-motion pass: smooth scroll off, scroll-driven travel off, all reveals
  visible, the horizontal rail falls back to a native scroller
- Keyboard pass through the five-step enquiry form
- Gallery lightbox: Escape, arrow keys, focus handling, scroll lock

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
