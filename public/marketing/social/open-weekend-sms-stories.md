# Open Weekend Fill — SMS and story copy

The triggered campaign. It fires only when a Friday or Saturday inside the next twenty-one days has no confirmed event against it, and it goes to past clients and the seasonal list in that region — nobody else.

---

## The rule this campaign is built on

**No discount. Ever.**

It is tempting, and it is the wrong move. Discounting an open date teaches the people who already pay properly that his price is negotiable if they wait, and it prices the open date below the work. Within a season you have trained your best clients to hold off.

What converts an open date instead is a specific date, a specific idea of what he would cook on it, and a tone that makes clear this is a note rather than a promotion. "I have a Saturday free and I would rather cook than not" is honest, it is flattering to the person receiving it, and it costs nothing.

---

## SMS

**Before a single message goes out**, all of this has to be true. It is not optional and the penalties are per message:

- Explicit written opt-in, collected with a visible disclosure at the point of collection. A phone number given on an enquiry form is not consent to be marketed to.
- STOP and HELP handled automatically, and STOP honoured immediately and permanently.
- Quiet hours respected. Nothing before 9am or after 8pm in the recipient's own timezone.
- The number registered for A2P 10DLC with the campaign type declared.
- Business name in the first message to any recipient, so nobody has to guess who is texting them.

The portal's Audience page repeats this, and no SMS sends until it is all in place.

### Variant A — the short one

Keep it under 160 characters so it lands as a single segment.

```
Chef R. Kearse here. I have Sat {{DATE}} open and thought of you.
Same food, your table. Want it? Reply YES and I'll hold it.
Reply STOP to opt out.
```

**Characters:** 148. One segment.

### Variant B — for a past client specifically

```
{{FIRST_NAME}} — Chef Kearse. Sat {{DATE}} came free. If you've
been thinking about doing another one, it's yours before I offer
it anywhere. Reply YES. STOP to opt out.
```

**Characters:** 157. One segment.

**Which to use:** B for anyone who has booked before, A for the seasonal list. B converts better by a wide margin because it is true — a past client genuinely should get first refusal, and telling them so is not flattery.

### What not to send

- No "last chance", no countdown, no "only today".
- No price in an SMS. A number without context invites a negotiation.
- Never more than one message per open date per person, and never the same person twice in a quarter.

---

## Story frames

Three frames. The whole sequence takes eight seconds to watch.

**Frame 1** — a dish photograph, warm and close. `pasta-wine-candle` or `lobster-shrimp-linguine`.
Text over it: *One Saturday free.*

**Frame 2** — the dark warm surface, `surface-dark-warm-gen`, with the date set large in the display serif.
Text over it: **{{DATE}}**
Smaller, beneath: *Eight to sixteen people. Whatever you want cooked.*

**Frame 3** — `table-setting`, with the link sticker.
Text over it: *Take it.*
Link: `/book`

**Rule for frame 2:** the date must be a real open date, checked against the diary that morning. Posting a date that is already booked is the one thing that makes this campaign look like theatre instead of an offer.

---

## Feed caption, if the date is more than ten days out

For a date under ten days out, use stories and SMS only — a feed post about a date three days away reads as desperation and sits on the profile afterwards.

> I have a Saturday free on {{DATE}}.
>
> No discount attached to it, because discounting my own work would be a strange way to thank the people who already pay properly for it.
>
> It is just this: the date is open, and if the timing happens to suit you then it suits us both. Eight to sixteen people is the sweet spot. Something from the fire, something from the water, and one thing finished at the table in front of everybody.
>
> If it is no use, ignore it entirely.

**Pair with:** `pasta-wine-candle` or `smoked-beef-sliced`.

---

## How to tell whether it is working

The right measure is not the reply rate. It is **how many open prime dates end the three-week window still open.**

If that number falls, the campaign is doing its job even when individual sends get no replies — because a booked date often comes from someone who saw the story, said nothing, and enquired a week later about a different date entirely.

The number that would mean stop: if past clients start waiting for an open-date message instead of booking in advance. Watch the average lead time on repeat bookings. If it shortens over a season, the campaign is training the wrong behaviour and should be limited to the seasonal list only.
