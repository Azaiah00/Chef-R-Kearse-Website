# Image prompts — Corporate Holiday Parties

For Nano Banana. Six prompts, each one naming exactly where the output goes.

---

## The rule these are all written under

**No generated image may ever depict a dish a guest could order.**

Not a variation of one, not "inspired by" one. If a picture shows food on a plate that someone could reasonably expect to be served, it has to be a real photograph of Chef Kearse's actual work — and he has 37 of those.

Generated imagery here does one job: atmosphere. Rooms, light, texture, surfaces, an empty table, the space before or after people are in it. The moment a generated image sets an expectation about portion, plating or ingredients, it stops being marketing and becomes a false claim about what arrives at the table.

Two consequences worth stating plainly:

- Where a campaign needs to show the food, it uses his photographs. Those are listed in the ad briefs by filename.
- Where a campaign needs a background, a texture, a mood or a rejected alternative, these prompts cover it.

**Every generated file gets the suffix `-gen` in its filename**, so that in a year nobody has to guess which images were photographed and which were made.

---

## A note on the grade

Everything except prompt 01 is warm. Warm amber, deep char, brass, low candlelight. Cool blue-white light suppresses appetite, which is why prompt 01 — the room being rejected — is deliberately cool and flat, and nothing else is.

---

## 01 — The empty function room (the thing being rejected)

**Where it goes:** Concept A in `corporate-holiday-ads.md`. Feed 4:5 and stories 9:16.

**This is the only cool-graded image in the set, and that is the point.** It has to look like the evening nobody remembers.

```
A completely empty hotel function room set for a corporate dinner, photographed
from the doorway at chest height. Round banquet tables with white cloths and
stacked chairs, a small dance floor, a lectern pushed to one side. Flat overhead
fluorescent lighting, cool white balance around 5600K, no warmth anywhere. Beige
patterned carpet, air-conditioning vents visible in a low suspended ceiling, a
folding screen against the back wall. No people, no food, no decoration beyond a
single sad centrepiece. Wide angle, 24mm, deep focus, everything sharp and
slightly too bright. Documentary, unflattering, deliberately joyless. Muted beige
and grey palette. No signage, no logos, no brand names, no readable text
anywhere. Photorealistic.
```

**Negative:** warm light, candlelight, people, food, plates with food, festive decoration, any brand name or logo, any readable text, any recognisable hotel.

**Save as:** `public/images/marketing/corporate-empty-room-gen.webp`

---

## 02 — An office transformed

**Where it goes:** the header image in the corporate holiday email sequence, and as a story background. Landscape 3:2.

```
A modern office interior in the evening, rearranged for a private dinner. Long
communal table dressed with white linen down the centre of an open-plan space,
low brass candle holders with lit candles, wine glasses catching the light,
folded napkins. Floor-to-ceiling windows behind showing a dark city with scattered
lit windows. Warm practical lighting only, candles and a few pendant lights,
amber and brass tones, deep shadows in the corners. Shot at 35mm, f/2, from
standing height along the length of the table, shallow depth of field falling off
toward the far end. Cinematic, editorial, quietly expensive. Warm amber and
charcoal palette. No people. No food on the table — set but not yet served. No
logos, no signage, no readable text. Photorealistic.
```

**Negative:** food on plates, any dish, people, cool blue light, fluorescent light, clutter, brand names, readable text, visible screens.

**Save as:** `public/images/marketing/corporate-office-table-gen.webp`

---

## 03 — Brass, linen and candlelight, close

**Where it goes:** section divider in the emails, subtle background behind type, carousel frame backgrounds. Square 1:1.

```
Extreme close-up of a dressed table surface at candlelight. Heavy white linen
with a visible weave, the base of a brass candlestick with wax caught on it, the
stem of a wine glass throwing a small caustic highlight onto the cloth, a folded
napkin edge entering from one corner. Single warm light source low and to the
left, roughly 2200K, everything else falling into deep shadow. Macro, 100mm,
f/2.8, focus on the brass, background dissolving. Very shallow. Rich amber,
cream and dark brown palette. Fine film grain. No food, no faces, no hands, no
text, no logos. Photorealistic, editorial still life.
```

**Negative:** food, hands, faces, text, logos, cool light, hard flash, plastic, modern minimalism.

**Save as:** `public/images/marketing/texture-linen-brass-gen.webp`

---

## 04 — The pass, mid-service, nothing identifiable on it

**Where it goes:** story frame two in the corporate captions, and a background for the "cooked on site" message. Vertical 9:16.

```
A stainless steel kitchen pass photographed at an angle, mid-service, lit by a
single warm heat lamp above. Steam rising and catching the light. Clean white
plates stacked at one end, a folded service cloth, a squeeze bottle, tweezers
resting on the steel. The steel scratched and used, not new. Warm tungsten light
from above, deep shadow beyond the lamp's reach, high contrast. Shot at 50mm,
f/1.8, from just above the surface looking along it, focus on the steam and the
near plate edge. Cinematic, documentary, working kitchen. Warm amber highlights
against near-black. Fine grain. The plates must be completely empty — no food
anywhere in frame. No faces, no text, no logos. Photorealistic.
```

**Negative:** food of any kind, plated dishes, garnish, faces, identifiable people, text, logos, cool light, clinical brightness.

**Save as:** `public/images/marketing/kitchen-pass-gen.webp`

---

## 05 — Dark textured surface for type

**Where it goes:** behind headline type in ads and story frames where a photograph would fight the words. Both 4:5 and 9:16, generate twice.

```
An abstract dark surface for text to sit on. Deep charcoal slate with a subtle
warm undertone, faint irregular texture, a soft pool of warm amber light entering
from the top right corner and falling away to near-black at the bottom left.
Extremely subtle, almost no detail, nothing that competes for attention. Even,
slightly vignetted. Fine film grain throughout. Charcoal, near-black, with one
warm amber gradient. No objects, no food, no people, no text, no patterns, no
recognisable shapes. Photorealistic texture, not illustration.
```

**Negative:** objects, food, people, text, busy patterns, hard edges, cool tones, gradients that read as purple or blue.

**Save as:** `public/images/marketing/surface-dark-warm-gen.webp`

---

## 06 — The room after everyone has gone

**Where it goes:** closing frame of the story sequence, and the footer image in the second email. Landscape 3:2.

```
A private dining room photographed after a dinner has ended and everyone has
left. Chairs pushed back at irregular angles, crumpled napkins on the table,
wine glasses at different levels, candles burned low with wax pooled, one still
lit. A single warm pendant light overhead, the rest of the room dark. The mess of
a good evening, not an untidy one. Shot at 35mm, f/2, from the head of the table
looking down its length. Warm amber and deep brown, heavy shadow, slight haze.
Cinematic, melancholy, satisfied. Fine grain. No people, no food on any plate —
plates cleared. No text, no logos. Photorealistic.
```

**Negative:** food, leftovers on plates, people, cool light, brightly lit, staged tidiness, text, logos.

**Save as:** `public/images/marketing/room-after-gen.webp`

---

## After generating

1. Save at 1600px on the long edge, WebP, quality 80. The site's other images follow the same spec.
2. Put them in `public/images/marketing/`, which is separate from `public/images/dishes/` on purpose — dishes are photographs of real work, marketing is generated atmosphere, and the folders should never blur.
3. Check every one against the rule at the top before it goes anywhere. If a plate in frame has anything on it, regenerate.
4. Alt text should describe the room or the texture, never imply a dish.
