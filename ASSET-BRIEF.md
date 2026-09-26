# ASSET BRIEF — Chef R. Kearse

Two parts: the photography he needs to shoot (which is the real unlock), and a
short list of Nano Banana prompts for the handful of places where a generated
plate is legitimate.

---

## Part 1 — The honest assessment of the current photography

Every image on this site is a real photograph of his own work. That is the right
call and it should stay that way. But the raw material has a hard ceiling:

| | Reality |
|---|---|
| Source | Yelp gallery (25) and Instagram reel cover frames (12) |
| Native resolution | **640–1000px on the long edge.** Nothing larger exists publicly |
| Capture | Phone, available light, mostly overhead or 3/4 at arm's length |
| Watermark | 13 of the 25 Yelp images carry his logo strip across the bottom third |
| Colour | Warm and appetising, which is right, but uncorrected and inconsistent |

What that means in practice: after cropping off the watermark strip and the
platform UI, the usable frames are **roughly 800 × 460 to 800 × 1000**. They are
upscaled to 1600px for the site and carry a film-grain overlay that hides the
softness, and at the sizes they render they genuinely look good. But a
full-bleed hero on a 27-inch screen is being asked to do more than the file can
deliver, and that will not change until he shoots properly.

**The single highest-return thing this client can do is spend one day with a
food photographer.** It costs less than a month of his time and it raises the
ceiling on everything — website, Instagram, Google Business Profile, wedding
listings and ads — all at once.

---

## Part 2 — The shot list

One day. One photographer. Natural light where possible, one warm LED panel plus
a bounce card for the dark frames. Shoot RAW. Deliver 3000px+ on the long edge.
Warm grade — amber, char and deep red-brown. No cool blue-white: it kills
appetite.

### A. Hero plates — 6 dishes, 3 frames each (18 files)
The six he wants to be known for. Given what already sells in his gallery, that
is likely: the mango-salsa fish, the lamb chops, the lobster tail and shrimp, the
shrimp and grits, the smoked beef, and one dessert.

For each dish:
1. **3/4 hero**, 50mm or 85mm equivalent, f/2.8–4, plate filling 70% of frame,
   light raking from behind-left, one clean shadow.
2. **Overhead flat**, 35mm equivalent, f/5.6, on a dark slate or worn wood, with
   negative space top-left for type to sit in.
3. **Macro detail**, 100mm equivalent, f/2.8 — the crust, the sauce break, the
   steam. This is the frame that makes people hungry.

> Shoot every hero in both **landscape 16:9** and **portrait 4:5**. The site
> needs both and cropping one from the other loses the composition.

### B. Motion and hands — 8 files
Steam off a pan. Butter foaming. A knife going through something. Sauce being
spooned. Salt from height. The torch on a crème brûlée. Hands plating. Hands
wiping a rim. Shoot these at 1/250 or faster and keep his hands in frame — hands
are the single strongest trust signal on a chef's site.

### C. The chef — 5 files
1. **Portrait, 3/4, in whites, in a client kitchen**, 85mm, f/2, warm window
   light, looking at camera, half-smile. *This replaces
   `public/images/story/chef-portrait-*.webp`, which is currently a crop from a
   1000px group photo — good enough to ship, not good enough to keep.*
2. Same setup, looking down at the pass, working.
3. Wide environmental — him small in a beautiful kitchen.
4. Him plating, over the shoulder.
5. Him talking to guests at a table.

### D. The room and the service — 6 files
Table dressed before guests, golden hour. The same table mid-service with
people in it (motion blur is fine, it reads as life). A bar with a cocktail
being poured. A passed tray leaving the kitchen. Guests laughing with plates in
frame. The knife roll open on a counter.

### E. Hero video loop — 10–15 seconds, vertical and 16:9
One continuous slow move — a push in over a finished plate as steam rises, or a
sauce being spooned in slow motion. No cuts, no music, no text. Delivered under
2.5MB at 1080p. Drop it behind the home hero and the site gains a dimension
nothing else can buy.

### F. Deliverables format
- JPEG or WebP, sRGB, 3000px+ long edge, minimal sharpening.
- Filenames matching the slugs in `src/lib/dishes.ts` so they drop straight in.
- Re-run the image pipeline afterwards — see `README.md`.

---

## Part 3 — Nano Banana prompts

These are **atmosphere, texture and background plates only**. No generated image
on this site may ever depict a dish a guest could order — a guest must never be
shown food that was not cooked. Every prompt below is for something behind or
underneath the real photography.

For each one: generate at the stated aspect, export WebP, drop it at the stated
path, and the site picks it up with no code change.

---

### 1. Hero backdrop — dark kitchen at service
**Replaces the backdrop layer in `src/components/home/Hero.tsx`
(currently `lamb-chops-asparagus-1600.webp`).**
Save as `public/images/atmosphere/hero-kitchen-1600.webp` — 16:9.

```
A dark, moody professional kitchen during service, shot from across the pass at
35mm, f/1.8, shallow depth of field. Deep charcoal and warm amber only. A gas
flame and a stainless pan out of focus in the mid-ground, steam catching a
single warm light from above, brushed steel and worn wood surfaces. No people,
no faces, no food in focus, no text, no logos. Cinematic, film grain, warm
tungsten grade, deep blacks, slightly underexposed. Photographic, not
illustrated. 16:9.
```

### 2. CTA band backdrop — steam and low light
**Replaces the backdrop in `src/components/CtaBand.tsx`.**
Save as `public/images/atmosphere/cta-steam-1600.webp` — 16:9.

```
Extreme close-up of steam rising through a single warm sidelight against a near
black background. Soft volumetric haze, warm amber highlights on the right third,
pure deep black on the left two-thirds. Abstract, no objects identifiable, no
food, no people, no text. Shot at 85mm f/2, heavy film grain, cinematic warm
grade. 16:9.
```

### 3. Paper texture for light sections
Save as `public/images/atmosphere/paper-texture.webp` — square, tileable.

```
A seamless tileable texture of warm off-white cotton rag paper, hex F7F3EC, lit
perfectly flat and even. Extremely subtle fibre grain and a faint deckle
irregularity. No shadows, no folds, no objects, no text, no colour variation
beyond the fibre. Flat scan, top-down, high key. Square, tileable.
```

### 4. Dark linen texture for dark sections
Save as `public/images/atmosphere/linen-dark.webp` — square, tileable.

```
A seamless tileable texture of very dark charcoal linen, hex 12100E, flat even
lighting, subtle woven thread structure visible only at close range. No folds,
no highlights, no objects, no text. Flat scan, top-down. Square, tileable.
```

### 5. Open-Graph / social share card background
**Replaces the photographic layer of `public/og-default.jpg`.**
1200 × 630.

```
A dark cinematic banner background: a warm amber pool of light in the lower
right corner fading into deep charcoal black across the frame, with faint
volumetric haze and a suggestion of brushed steel out of focus. Completely empty
on the left two-thirds so type and a logo can sit there. No food, no people, no
text, no logos, no borders. Film grain, warm tungsten grade. 1200x630.
```

### 6. 404 page backdrop
Save as `public/images/atmosphere/empty-pass-1024.webp` — 4:5.

```
An empty stainless steel kitchen pass under a single warm heat lamp, shot at
50mm f/2.8 from a low three-quarter angle. Nothing on the pass. Deep shadows,
one warm amber highlight along the steel edge, near-black background. No people,
no food, no text. Moody, cinematic, heavy film grain, warm grade. 4:5 portrait.
```

---

### Rules for every generated plate

- Always append: `no text, no words, no letters, no watermark, no logo`.
- Always append the grade: `warm tungsten, deep blacks, film grain, photographic`.
- Never generate a plated dish, a garnish, a menu item, a person's face, or
  anything a guest could mistake for something he cooks.
- Keep every generated image under 300KB as WebP.
- If a generated frame ends up better-looking than his real food photography,
  that is a signal to book the shoot, not to use more generated images.
