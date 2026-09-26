# DESIGN.md — Chef R. Kearse

The styling source of truth for this site. Every token below is implemented in
`src/app/globals.css`. If a value here and a value in the code disagree, the
code is wrong — fix the code.

---

## 1. Where the palette came from

Nothing here was invented or "picked to look nice". The three brand colours were
sampled pixel-by-pixel out of the client's own logo file
(`Downloads/Real Advancement/Clients/Chef R. Kearse/unnamed.webp`, 1119 × 349):

| Sampled from | RGB | Hex | Count in file |
|---|---|---|---|
| Knife handle + "PRIVATE CHEF" | 171, 36, 23 | **#AB2417** | 45,961 px |
| Blade body | 11, 11, 11 | **#0B0B0B** | 168,702 px |
| Script wordmark | 255, 255, 255 | **#FFFFFF** | 7,473 px (antialiased to ~#DCDCDC) |

Everything else is derived from those three.

### Token set

```
/* Surfaces */
--color-ink          #12100E   warm near-black — page ink, dark sections
--color-ink-2        #1E1A17   raised dark surface
--color-ink-3        #342E28   dark hairline / third-level dark
--color-bone         #F7F3EC   page background (warm paper)
--color-bone-2       #EFE7D9   alternating section background
--color-paper        #FFFDF9   cards, inputs, raised light surface
--color-line         #E2D8C7   hairline on light
--color-line-dark    #3A332C   hairline on dark
--color-muted        #6D6456   secondary text on light
--color-muted-dark   #A79C8B   secondary text on dark

/* Brand accent — one accent, held */
--color-accent       #AB2417   sampled from the logo
--color-accent-hi    #C62D1C   hover / gradient high
--color-accent-lo    #8A1B10   pressed / gradient low
--color-accent-tint  #F4E4E0   accent wash

/* Semantic */
--color-success      #2F6B46
--color-warn         #9A6A12
--color-danger       #A32117
```

**Rule of restraint:** exactly one accent. Crimson is used for the eyebrow
labels, the primary button, the blade rules, numerals and nothing else. It is
never a background field — it is appetite and urgency in small doses, which is
precisely what red does well and what red ruins when it is a wall.

### Why light, not dark

The mark is a **black** knife. On a black site it disappears. On warm bone paper
it lands exactly as drawn — and cream/charcoal/one-red is the editorial register
that reads as expensive rather than as "restaurant template". The site alternates
bone and ink so the food photography still gets full-bleed dark moments where it
sings, and both logo lockups exist for that:

- `public/images/brand/logo-ink.png` — black blade, white script. For bone surfaces.
- `public/images/brand/logo-bone.png` — bone blade, ink script. For dark surfaces and photos.

Both were rebuilt from the supplied raster: background keyed out, art segmented
into blade / handle / wordmark, and each region re-flattened to the exact
sampled brand colours, then trimmed and resampled. See §7 for why the original
still needs replacing.

---

## 2. Type

| Role | Family | Notes |
|---|---|---|
| Display | **Fraunces Variable** | `opsz` 9–144, `SOFT`, `WONK`, wght 100–900 |
| Text / UI | **Inter Variable** | wght 100–900 |

Both are **self-hosted** via `@fontsource-variable/*`. There is no Google Fonts
request: it is faster, it removes a third-party from the critical path, and it
removes an IP-address disclosure from the privacy note.

Fraunces was chosen over the obvious editorial serifs because its `SOFT` and
`WONK` axes give it warmth and a slight irregularity — it reads hand-made rather
than corporate, which is the whole proposition of a private chef. It is set at
`SOFT 20–40, WONK 1` throughout.

### Scale (fluid, clamp-based)

| Class | Size | Line-height | Tracking |
|---|---|---|---|
| `.t-display` | `clamp(3.1rem, 10.5vw, 9rem)` | 0.92 | −0.032em |
| `.t-h1` | `clamp(2.5rem, 6.4vw, 5.25rem)` | 0.98 | −0.028em |
| `.t-h2` | `clamp(2rem, 4.6vw, 3.6rem)` | 1.02 | −0.024em |
| `.t-h3` | `clamp(1.4rem, 2.4vw, 2rem)` | 1.12 | −0.018em |
| `.t-lead` | `clamp(1.09rem, 1.35vw, 1.3rem)` | 1.6 | — |
| body | 1.0625rem (17px) | 1.65 | — |
| `.t-small` | 0.875rem | 1.55 | — |
| `.t-label` | 0.6875rem, 600 | 1 | 0.2em, uppercase |

Body text never drops below 17px. Menu-style copy is readable at arm's length on
a phone, which is where most of this traffic reads it.

---

## 3. Layout

```
--shell        min(100% - 2rem, 88rem)   /  min(100% - 5rem, 88rem) at ≥768px
--shell-narrow min(100% - 2rem, 62rem)   /  min(100% - 5rem, 62rem)
--shell-text   min(100% - 2rem, 44rem)   /  min(100% - 5rem, 44rem)
--header-h     72px / 86px at ≥768px
```

Section rhythm: `.section` = `clamp(4.5rem, 10vw, 9.5rem)` block padding;
`.section-sm` = `clamp(3rem, 6vw, 5.5rem)`.

Radii are near-zero on purpose (2–4px). Rounded corners read as software; square
corners read as print.

**CSS layering matters here.** Base element styles live in `@layer base` and the
component classes in `@layer components`, so Tailwind utilities always win.
Anything added outside a layer will silently override utility classes — that bug
cost a full round of visual QA on this build, so do not add unlayered rules.

---

## 4. Motion — "the cut"

The logo is a chef's knife with a crimson sweep beneath the blade. That sweep is
the one gesture the whole site repeats.

| Move | Where | Implementation |
|---|---|---|
| **Blade rule** | Every section divider | `BladeRule` — a crimson hairline draws left→right, scrubbed to scroll |
| **Word rise** | Every heading | `SplitHeading` — words masked and lifted, 55ms stagger, `expo.out` |
| **Plate rail** | Home, signature dishes | Pinned horizontal scroll on desktop; snap-scroll swipe rail on phone |
| **Slow drift** | Full-bleed photography | `ParallaxImage` — ±% translate, transform only |
| **Hero settle** | Home hero | Backdrop scales 1.16 → 1.04 over 2.2s; card wipes open on a clip-path |
| **Count** | Chef stats | `CountUp`, scroll-triggered once |

Rules that are not negotiable:

- **transform and opacity only.** No layout-animating properties anywhere.
- **No motion-library work during LCP.** GSAP is loaded and registered client
  side; the hero's first paint is server-rendered HTML and a priority image.
- **Every animation has a reduced-motion off-ramp.** `prefers-reduced-motion:
  reduce` disables Lenis, skips all ScrollTriggers, forces reveals visible and
  turns the pinned rail back into a normal scroller. Verified.
- **Motion runs on mobile too** — reveals, blade rules, parallax and the count
  all run on a phone. Only *pinning* is desktop-gated (`min-width: 1024px` and
  `pointer: fine`), because pinning on a touch device fights the user's thumb.
- **Maximum two effects visible at once.** Everything is tinted to the brand
  tokens; no default library colours appear anywhere.

Smooth scroll is Lenis, wired into the GSAP ticker so pinned and scrubbed
timelines stay in sync, and disabled outright for reduced motion.

---

## 5. Components

| Class | Purpose |
|---|---|
| `.btn` / `.btn-primary` / `.btn-ghost` / `.btn-ghost-light` | 52px min height, 2px radius, uppercase 13px/0.14em |
| `.field` | 54px min height, `#FFFDF9` on a `#E2D8C7` hairline, crimson focus ring |
| `.chip` | 48px min height selectable token, `aria-pressed` drives the filled state |
| `.blade-rule` | The signature divider |
| `.grain` | SVG `feTurbulence` overlay at 0.4 / `overlay` blend |
| `.link-underline` | Underline wipes in from the left on hover and focus |
| `.tap` / `.tap-sm` | Vertical padding that gives inline text links a finger-sized hit area |

**Grain is load-bearing, not decoration.** The client's source photography is
640–1000px. A film-grain overlay on every photographic surface hides the
softness of upscaled frames and reads as editorial rather than as low-res.

---

## 6. Accessibility

- WCAG 2.2 AA contrast throughout. Crimson `#AB2417` on bone `#F7F3EC` is 7.0:1;
  ink on bone is 16:1; bone on ink is 15.4:1.
- Visible focus ring on every interactive element (`:focus-visible`, 2px accent,
  3px offset), recoloured to bone inside dark sections.
- Skip link, one `<h1>` per page, semantic landmarks, labelled breadcrumbs.
- The enquiry form moves focus to each new step heading — but never on first
  paint, so no stray focus ring appears before anyone has interacted.
- Gallery lightbox: Escape to close, arrow keys to move, `aria-modal`, body
  scroll locked.
- All interactive controls are ≥44px in at least one dimension; buttons, chips
  and fields are ≥48px.

---

## 7. Known asset debt

The supplied logo is a **1119 × 349 raster with a grey textured background baked
in** and visible compression artefacts. The lockups shipped here are the best
that can be recovered from it, and they are good enough for launch at the sizes
used — but the honest recommendation is to redraw the mark as SVG: the blade and
sweep are simple enough to trace cleanly, and the script wordmark should be
re-set or hand-drawn. That would give infinite scale, a proper favicon, and
animation-ready paths for the blade rule.

The photography is the bigger constraint. See `ASSET-BRIEF.md`.
