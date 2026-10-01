# CLAUDE.md — standing rules for any agent working in this repo

Read this file before you change anything. It exists because the portal's design has
been reverted three times by well-meaning agents who did not know it was settled.

Every coding tool pointed at this repo should read this: Claude Code reads `CLAUDE.md`,
Cursor reads `.cursorrules`, other agents read `AGENTS.md`. The other two files point
here. This is the canonical copy.

---

## 1. THE PORTAL DESIGN IS LOCKED

**The portal's look and layout are settled. Do not redesign, "clean up", "simplify" or
"modernise" them. Build new features *in* this language.**

The client (Azaiah, Real Estate Advancement) has stated this directly. It is locked
until he says otherwise in a new instruction. If you think something here is wrong,
say so in your reply and leave the code alone.

### 1.1 Navigation lives on the LEFT. It is a sidebar, not a top bar.

`src/components/portal/PortalNav.tsx` renders:

- **≥1024px** — `<aside class="p-sidebar">`: a sticky, full-height left rail, 15.5rem
  wide, translucent (`color-mix(in srgb, #0c0b0a 55%, transparent)`) over the page
  glow, with `backdrop-filter: blur(18px) saturate(1.15)` and a hairline right border.
  Logo at the top, nav in the middle, identity block and Sign out pinned at the bottom.
- **<1024px** — `<header class="p-topbar">`: a thin sticky bar holding the logo, the
  avatar and a Menu button. The nav opens as `.p-sidebar.p-sidebar-drawer`, a fixed
  left drawer over a `bg-black/55` scrim.

Do **not** convert this to a horizontal top nav, a hamburger-only nav, or a bottom tab
bar at any breakpoint. `.portal-frame` is `flex-direction: column` and becomes `row` at
1024px; `.portal-stage` is the `flex: 1; min-width: 0` content column. Keep that shape.

### 1.2 The aesthetic, in the words that matter

Modern, sleek, smooth. Dark glass over a warm ambient glow. Specifically:

| Element | Rule |
|---|---|
| Canvas | `.portal-root` — two radial-gradient washes over `#0c0b0a`. Owner runs crimson (`--portal-glow`), assistant runs champagne/sage via `.portal-assistant`. Both roles get a glow; they are different colours on purpose. |
| Cards | `.p-card` — 18px radius, top-edge inset highlight `inset 0 1px 0 #fff/8%`, 1px `#fff/9%` border, gradient fill `#fff 6% → #141210`, soft deep shadow. Glass, not flat panels. |
| Nav links | `.p-nav-link` — 999px pill, 40px min-height, icon + label + optional count badge. Active state is `aria-current="page"`, lifted with a `#fff/8%` fill and an inset top highlight. |
| Buttons | `.p-btn` — 999px pill, 44px. `.p-btn-primary` is a vertical accent gradient with a coloured glow shadow and a `translateY(-1px)` hover. |
| Avatar | `.p-avatar` — 36px circle, double ring: `#fff/16%` inner, brand glow outer. |
| Role pill | `.p-role-pill` — 10px uppercase micro-caps, tracked `0.14em`. |
| Inputs | 12px radius, near-black fill, accent focus ring at `0 0 0 3px`. |
| Entry motion | `#portal-main` runs `portal-rise` — 0.55s, 10px travel, `--ease-out-expo`. |
| Radii | Sidebar-era values are literal (`18px`, `999px`, `12px`, `16px`), **not** the marketing site's `--radius-*` tokens. Do not "harmonise" them back. |

### 1.3 Rules that travel with the design

- Every animation needs a `prefers-reduced-motion: reduce` off-ramp. No exceptions.
- No emoji anywhere in the product. Icons come from `src/components/portal/Icons.tsx`.
- Tap targets: 24px is the WCAG 2.2 AA floor and the project bar; `.p-btn-sm` is 40px,
  and 44px under `@media (pointer: coarse)`. Measure the *effective* target — the
  wrapping `<label>` or `<a>` — not the bare glyph.
- `.p-badge` is `white-space: nowrap` **and** `flex: none`. It must never be allowed to
  shrink; a squeezed nowrap badge spills its text out of the page. Let the row wrap
  instead (`.p-card-head` is `flex-wrap: wrap`).
- The guest-facing client portal is `.client-root` — warm bone paper, **not** the dark
  ops console. Do not unify them.
- Lenis smooth scroll belongs to the marketing site only. The portal uses native
  scrolling; Lenis fights the pipeline board's horizontal scroller.

### 1.4 Before you deliver a portal file

The repo on `C:\Users\azaia\OneDrive\Chef-R-Kearse-Website` is the source of truth and
more than one agent works in it. **Diff before you write.** Hash the files you intend
to touch against the copy in that folder, adopt anything newer that you did not write,
and merge your change into it. Never overwrite a portal file you have not just read.

---

## 2. FACTS

- **"R." is part of his name and his brand.** Never ask what it stands for, never
  expand it, never abbreviate it away. It is "Chef R. Kearse".
- **Real facts only.** Never invent a phone number, address, award, review, press
  quote, chef bio, or price. Every price in this build is a placeholder and must be
  labelled as pending client confirmation.
- **Never invent an allergen or dietary claim.** Vegan / GF / nut-free / halal / kosher
  come from the client only. Every menu ships with the cross-contamination disclaimer.
- Unconfirmed items go in the **CONFIRM WITH CLIENT** block in `CONTEXT.md`, not
  scattered through the code as guesses.
- **Higgsfield is OFF for this project.** Generated imagery ships as Nano Banana prompt
  sheets naming the exact destination file. No generated image may depict a dish a
  guest could order, or a wedding that did not happen.

---

## 3. THE BARS

Nothing is done until all of this holds:

```
npx tsc --noEmit                      # 0 errors
npx next lint                         # 0 warnings — the standard is zero, not "few"
npm run build                         # 0 warnings

npm run test:scoring                  #  51   inbound qualification
npm run test:prospects                #  56   outbound scoring + the hard cap
npm run test:feeds                    #  39   feed parsing, no network needed
BASE=<url> npm run test:portal        #  78
BASE=<url> npm run test:pipeline      #  21
BASE=<url> npm run qa:entry           #  16
BASE=<url> npm run test:lead-engine   #  86   outbound engine, roles, seed integrity
BASE=<url> npm run qa:portal          #  "No failures."
```

**347 assertions.** `test-lead-engine` mutates the store, so run it against a
freshly started server — its seed-integrity group runs first, before anything
changes.

`qa-portal.mjs` sweeps 320 / 390 / 768 / 1023 / 1024 / 1440px across both roles and the
guest portal. **1023 and 1024 sit either side of the sidebar breakpoint** — they are the
two widths that catch a broken rail, so never narrow the run without saying why.
`WIDTHS=320,1024` narrows it during iteration; the full sweep is the gate.

Also required: zero console errors, every link resolves, keyboard-only pass through the
booking and sign-in flows, reduced-motion pass, and 404/500/empty/loading/error states
all designed.

---

## 4. ARCHITECTURE YOU SHOULD NOT UNPICK

- `src/app/(site)/` is the marketing route group and owns all marketing chrome — header,
  footer, mobile CTA bar, Lenis, LocalBusiness schema. `src/app/layout.tsx` is a bare
  shell. This split exists because a root layout wraps *every* route, and the portal was
  rendering inside a restaurant header with a `Restaurant` schema on `noindex` pages.
- `src/middleware.ts` is a **routing gate, not a security boundary.** The Edge runtime
  has no `node:crypto`, so it checks cookie presence and reads the role via
  `unverifiedRole()` (base64, no signature check) purely to route. Every page still
  calls `requireStaff()` / `requireRolePage()` itself. Do not move auth into middleware.
- `src/lib/portal/store.ts` is the only data-access path. It is an in-memory
  module-singleton for the demo; Supabase is the production path (see `PORTAL.md`).
- **Client components serialise their props into the page.** `PipelineBoard` takes a
  narrow `BoardLead`, built server-side, that omits money entirely when the viewer may
  not see it. Passing a full `Lead` would ship the assistant the revenue figures in her
  own HTML. Keep that pattern for every new client component.
- `src/lib/portal/demo.ts` — `isDemoMode()` is the single switch for the one-tap role
  buttons, the header Portal link, the printed credentials and `/api/portal/demo-login`.
  It must be `false` before this goes on a real domain.

---

## 5. HOW TO RESPOND TO AZAIAH

Lead with the deliverable. No preamble, no restating the request. Prompts come in full,
copy-pasteable, in code blocks. Professional disagreement goes in one clear paragraph
with the better path — then do the work anyway. Client-confirmation items go in one
labelled block at the end, not sprinkled through the document.
