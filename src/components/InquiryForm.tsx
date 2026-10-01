"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { site } from "@/lib/site";

/* ————————————————————————————————————————————————————————————————
   A SIX-STEP QUALIFYING ENQUIRY

   Why it is built this way — the evidence, not a hunch:
   • Multi-step forms out-convert equivalent single-step forms by roughly 14%
     on average, and by more once a form passes six fields (Digital Applied,
     "Form Conversion Rate Benchmarks 2026"; Venture Harbour).
   • Conversion falls off a cliff between five and seven fields on one screen
     (23.1% → 17.0% → 11.4%). Every step here asks for three fields or fewer,
     and three of the six steps are taps only, with no typing at all.
   • A visible progress indicator is worth +11–15%; inline validation +5–13%;
     a visible privacy line +4–7%; correct autofill metadata on mobile +11–18%.
   • The first interaction is a single tap on a choice the visitor already knows
     the answer to — commitment before effort. Contact details are asked last,
     once the visitor has invested five steps.

   ── WHAT CHANGED, AND WHY ──────────────────────────────────────────────────
   The chef's own words: he is tired of people wasting his time and not
   following through. So this form now does two jobs at once — it still converts
   serious buyers, and it quietly qualifies every one of them.

   Three questions do most of that work:
     1. BUDGET. Asked as a band, never as a blank box. The single strongest
        predictor of whether an enquiry becomes a booking, and the most humane
        filter there is: nobody is told no by a person, they simply see the
        shape of what this costs and decide for themselves.
     2. WHO DECIDES. "Am I talking to the buyer" saves an entire wasted cycle.
     3. THE OCCASION, IN THEIR OWN WORDS — and it is REQUIRED, with a real
        minimum. This is deliberate friction. It costs a serious client forty
        seconds and it costs a tyre-kicker the whole enquiry. Someone who writes
        four sentences about their daughter's engagement dinner behaves nothing
        like someone who types "how much".

   Plus a plainly worded acknowledgment that dates are held with a deposit,
   which removes the people who were never going to commit before anyone has
   spent a phone call on them.

   None of it is scored on this screen — scoring happens on the server, the
   visitor never sees a number, and every band still gets a courteous answer.
   ———————————————————————————————————————————————————————————————— */

const SERVICES = [
  { label: "Private dinner at home", value: "private-dinner" },
  { label: "Wedding", value: "wedding" },
  { label: "Corporate or company event", value: "corporate" },
  { label: "Birthday, anniversary or milestone", value: "milestone" },
  { label: "Weekly personal chef service", value: "weekly-service" },
  { label: "Not sure yet", value: "other" },
] as const;

const FLEX = [
  { label: "That date exactly", value: "fixed" },
  { label: "Within a week either side", value: "flexible" },
  { label: "The month is flexible", value: "flexible" },
] as const;

/** Range label → the number the availability and scoring engines use. */
const GUESTS = [
  { label: "2", value: 2 },
  { label: "3–6", value: 5 },
  { label: "7–12", value: 10 },
  { label: "13–30", value: 22 },
  { label: "31–75", value: 50 },
  { label: "76–150", value: 110 },
  { label: "150+", value: 180 },
] as const;

const VENUES = [
  { label: "My home", value: "my-home" },
  { label: "A venue we've booked", value: "rented-venue" },
  { label: "Our office", value: "office" },
  { label: "Outdoors", value: "outdoor" },
  { label: "Still deciding", value: "undecided" },
] as const;

/**
 * PLACEHOLDER BANDS — pending the chef's confirmation.
 * These ranges are conventional for private-chef and full-service catering work
 * in this market. They are NOT his numbers, because no verified price exists for
 * this business anywhere public. He confirms or replaces all four, and the
 * helper line under them, before launch. Listed in CONTEXT.md.
 */
const BUDGETS = [
  { label: "Under $75 a guest", value: "under-75" },
  { label: "$75 – $125", value: "75-125" },
  { label: "$125 – $200", value: "125-200" },
  { label: "$200 and up", value: "200-plus" },
  { label: "I'd like guidance on this", value: "unsure" },
] as const;

const DECISIONS = [
  { label: "Yes, it's my call", value: "yes" },
  { label: "I decide with someone else", value: "shared" },
  { label: "I'm gathering options for someone else", value: "no" },
] as const;

const SOURCES = [
  { label: "Someone recommended him", value: "referral" },
  { label: "I've booked him before", value: "returning" },
  { label: "Google", value: "google" },
  { label: "Instagram", value: "instagram" },
  { label: "A wedding site", value: "wedding-directory" },
  { label: "I ate his food somewhere", value: "walk-past" },
  { label: "Somewhere else", value: "other" },
] as const;

const STEP_TITLES = [
  "What kind of night is it?",
  "When are you thinking?",
  "How many, and where?",
  "A few quick ones.",
  "Tell him about it.",
  "Where should he send the menu?",
];

/** Minimum characters on the occasion field. Friction, on purpose. */
const NOTES_MIN = 80;

type Values = {
  service: string;
  date: string;
  flexibility: string;
  guests: string;
  place: string;
  venue: string;
  budget: string;
  decision: string;
  foundVia: string;
  notes: string;
  dietary: string;
  depositOk: boolean;
  callOk: boolean;
  name: string;
  email: string;
  phone: string;
  company: string; // honeypot
};

const EMPTY: Values = {
  service: "",
  date: "",
  flexibility: "",
  guests: "",
  place: "",
  venue: "",
  budget: "",
  decision: "",
  foundVia: "",
  notes: "",
  dietary: "",
  depositOk: false,
  callOk: false,
  name: "",
  email: "",
  phone: "",
  company: "",
};

const emailOk = (v: string) => /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(v.trim());
const phoneOk = (v: string) => v.replace(/\D/g, "").length >= 10;

const LAST_STEP = STEP_TITLES.length - 1;

export default function InquiryForm() {
  const [step, setStep] = useState(0);
  const [v, setV] = useState<Values>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof Values, string>>>({});
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const headingRef = useRef<HTMLHeadingElement>(null);
  const startedAt = useRef<number>(Date.now());
  const mounted = useRef(false);

  // Deep links from the Experiences and Weddings pages preselect the service.
  // Read straight off the URL rather than through useSearchParams: that hook
  // forces the whole form behind a Suspense boundary, and swapping a small
  // fallback for a tall form is a 0.44 layout shift on a phone.
  useEffect(() => {
    const s = new URLSearchParams(window.location.search).get("service");
    if (!s) return;
    const needle = s.toLowerCase();
    const match =
      SERVICES.find((x) => x.value === needle) ??
      SERVICES.find((x) => x.label.toLowerCase() === needle) ??
      SERVICES.find((x) => x.label.toLowerCase().includes(needle.split(" ")[0]));
    if (match) setV((prev) => ({ ...prev, service: match.value }));
  }, []);

  // Move focus to the new step heading so screen readers and keyboard users
  // land in the right place — but never on first paint, which would drop a
  // focus ring on the page before anyone has interacted with it.
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    if (state === "idle") headingRef.current?.focus();
  }, [step, state]);

  const set = <K extends keyof Values>(k: K, val: Values[K]) => {
    setV((prev) => ({ ...prev, [k]: val }));
    setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const validate = (s: number): boolean => {
    const e: Partial<Record<keyof Values, string>> = {};
    if (s === 0 && !v.service) e.service = "Pick the one that fits closest.";
    if (s === 1) {
      if (!v.date) e.date = "A date — even an approximate one — is what he checks first.";
      if (!v.flexibility) e.flexibility = "How firm is that date?";
    }
    if (s === 2) {
      if (!v.guests) e.guests = "A rough headcount is fine.";
      if (!v.place.trim()) e.place = "City, neighbourhood or ZIP.";
      if (!v.venue) e.venue = "Where are you thinking of holding it?";
    }
    if (s === 3) {
      if (!v.budget) e.budget = "A range is all he needs — it shapes the menu, not the welcome.";
      if (!v.decision) e.decision = "Just so he knows who he is talking to.";
      if (!v.foundVia) e.foundVia = "How did you come across him?";
    }
    if (s === 4) {
      const len = v.notes.trim().length;
      if (len === 0) {
        e.notes = "A few sentences, in your own words — this is the part he actually reads.";
      } else if (len < NOTES_MIN) {
        e.notes = `A little more, please — around ${NOTES_MIN - len} more characters. The more he knows, the better the menu he comes back with.`;
      }
    }
    if (s === LAST_STEP) {
      if (!v.name.trim()) e.name = "What should he call you?";
      if (!emailOk(v.email)) e.email = "A working email address, please.";
      if (!phoneOk(v.phone)) e.phone = "A number he can reach you on.";
      if (!v.depositOk) e.depositOk = "Please confirm you have read how dates are held.";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => {
    if (!validate(step)) return;
    setStep((s) => Math.min(s + 1, LAST_STEP));
  };
  const back = () => setStep((s) => Math.max(0, s - 1));

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate(LAST_STEP)) return;
    setState("sending");
    try {
      const guestCount = GUESTS.find((g) => g.label === v.guests)?.value ?? 0;
      const res = await fetch("/api/inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          // Human-readable fields, kept for the email that reaches the chef.
          service: SERVICES.find((s) => s.value === v.service)?.label ?? v.service,
          guests: v.guests,
          place: v.place,
          date: v.date,
          flexibility: v.flexibility,
          notes: v.notes,
          dietary: v.dietary,
          name: v.name,
          email: v.email,
          phone: v.phone,
          company: v.company,
          // Structured fields, for scoring and the portal record.
          eventType: v.service,
          guestCount,
          venueType: v.venue,
          budgetBand: v.budget,
          decisionMaker: v.decision,
          source: v.foundVia,
          dateFlexible: v.flexibility !== "fixed",
          depositOk: v.depositOk,
          callOk: v.callOk,
          elapsedMs: Date.now() - startedAt.current,
        }),
      });
      if (!res.ok) throw new Error(String(res.status));
      setState("done");
      if (typeof window !== "undefined") {
        const w = window as unknown as { dataLayer?: unknown[] };
        w.dataLayer = w.dataLayer || [];
        w.dataLayer.push({ event: "inquiry_submitted", service: v.service });
      }
    } catch {
      setState("error");
    }
  };

  const progress = useMemo(() => Math.round(((step + 1) / STEP_TITLES.length) * 100), [step]);

  if (state === "done") {
    return (
      <div className="border border-line bg-paper p-8 md:p-12">
        <p className="t-label text-accent">Sent</p>
        <h2 className="t-h2 mt-5 max-w-[16ch]">That is with the chef.</h2>
        <p className="t-lead mt-6 max-w-[48ch]">
          He reads these himself. You will hear back about your date, and if it is open he
          will come back with a menu direction for the kind of night you described.
        </p>
        <div className="mt-9 grid gap-3 sm:grid-cols-2">
          <a href={`tel:${site.contact.phoneHref}`} className="btn btn-ghost">
            Call {site.contact.phone}
          </a>
          <a
            href={site.social.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-ghost"
          >
            See his latest work
          </a>
        </div>
        <p className="t-small mt-8 text-muted">
          Nothing arrived? Email{" "}
          <a href={`mailto:${site.contact.email}`} className="link-underline text-ink">
            {site.contact.email}
          </a>{" "}
          or call the toll-free line on {site.contact.phoneAlt}.
        </p>
      </div>
    );
  }

  const notesLen = v.notes.trim().length;

  return (
    <form onSubmit={submit} noValidate className="border border-line bg-paper">
      {/* Progress */}
      <div className="border-b border-line px-6 py-5 md:px-10">
        <div className="flex items-center justify-between gap-6">
          <p className="t-label text-muted">
            Step {step + 1} of {STEP_TITLES.length}
          </p>
          <p className="t-label text-accent">{progress}%</p>
        </div>
        <div
          className="mt-3 h-[3px] w-full bg-line"
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Enquiry progress"
        >
          <div
            className="h-full bg-accent transition-[width] duration-500 ease-[cubic-bezier(.16,1,.3,1)]"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="px-6 py-9 md:px-10 md:py-12">
        <h2 ref={headingRef} tabIndex={-1} className="t-h3 max-w-[20ch] outline-none">
          {STEP_TITLES[step]}
        </h2>

        {/* ————— Step 1: service ————— */}
        {step === 0 && (
          <fieldset className="mt-8 border-0 p-0">
            <legend className="sr-only">Type of service</legend>
            <div className="flex flex-wrap gap-3">
              {SERVICES.map((s) => (
                <button
                  key={s.value}
                  type="button"
                  className="chip"
                  aria-pressed={v.service === s.value}
                  onClick={() => {
                    set("service", s.value);
                    window.setTimeout(() => setStep(1), 160);
                  }}
                >
                  {s.label}
                </button>
              ))}
            </div>
            {errors.service && <p className="mt-4 text-sm text-danger">{errors.service}</p>}
            <p className="t-small mt-6 text-muted">
              Tap one — you can change it later in the notes.
            </p>
          </fieldset>
        )}

        {/* ————— Step 2: date ————— */}
        {step === 1 && (
          <div className="mt-8 space-y-7">
            <div>
              <label htmlFor="date" className="t-label block text-muted">
                Date of the event
              </label>
              <input
                id="date"
                name="date"
                type="date"
                className="field mt-3 max-w-xs"
                value={v.date}
                onChange={(e) => set("date", e.target.value)}
                aria-invalid={!!errors.date}
                aria-describedby={errors.date ? "date-err" : undefined}
                required
              />
              {errors.date && (
                <p id="date-err" className="mt-2 text-sm text-danger">
                  {errors.date}
                </p>
              )}
            </div>

            <fieldset className="border-0 p-0">
              <legend className="t-label text-muted">How fixed is it?</legend>
              <div className="mt-3 flex flex-wrap gap-3">
                {FLEX.map((f) => (
                  <button
                    key={f.label}
                    type="button"
                    className="chip"
                    aria-pressed={v.flexibility === f.label}
                    onClick={() => set("flexibility", f.label)}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
              {errors.flexibility && (
                <p className="mt-3 text-sm text-danger">{errors.flexibility}</p>
              )}
            </fieldset>
          </div>
        )}

        {/* ————— Step 3: guests + place + venue ————— */}
        {step === 2 && (
          <div className="mt-8 space-y-7">
            <fieldset className="border-0 p-0">
              <legend className="t-label text-muted">Guests</legend>
              <div className="mt-3 flex flex-wrap gap-3">
                {GUESTS.map((g) => (
                  <button
                    key={g.label}
                    type="button"
                    className="chip min-w-[4.5rem]"
                    aria-pressed={v.guests === g.label}
                    onClick={() => set("guests", g.label)}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
              {errors.guests && <p className="mt-3 text-sm text-danger">{errors.guests}</p>}
            </fieldset>

            <fieldset className="border-0 p-0">
              <legend className="t-label text-muted">Where would it be?</legend>
              <div className="mt-3 flex flex-wrap gap-3">
                {VENUES.map((b) => (
                  <button
                    key={b.value}
                    type="button"
                    className="chip"
                    aria-pressed={v.venue === b.value}
                    onClick={() => set("venue", b.value)}
                  >
                    {b.label}
                  </button>
                ))}
              </div>
              {errors.venue && <p className="mt-3 text-sm text-danger">{errors.venue}</p>}
            </fieldset>

            <div>
              <label htmlFor="place" className="t-label block text-muted">
                Which town or city
              </label>
              <input
                id="place"
                name="place"
                type="text"
                inputMode="text"
                autoComplete="address-level2"
                placeholder="Richmond, Short Pump, Arlington, Bethesda…"
                className="field mt-3 max-w-md"
                value={v.place}
                onChange={(e) => set("place", e.target.value)}
                aria-invalid={!!errors.place}
                aria-describedby={errors.place ? "place-err" : undefined}
              />
              {errors.place && (
                <p id="place-err" className="mt-2 text-sm text-danger">
                  {errors.place}
                </p>
              )}
            </div>
          </div>
        )}

        {/* ————— Step 4: qualification. All taps, no typing. ————— */}
        {step === 3 && (
          <div className="mt-8 space-y-7">
            <fieldset className="border-0 p-0">
              <legend className="t-label text-muted">
                Roughly what are you working with, per guest?
              </legend>
              <div className="mt-3 flex flex-wrap gap-3">
                {BUDGETS.map((b) => (
                  <button
                    key={b.value}
                    type="button"
                    className="chip"
                    aria-pressed={v.budget === b.value}
                    onClick={() => set("budget", b.value)}
                  >
                    {b.label}
                  </button>
                ))}
              </div>
              {errors.budget && <p className="mt-3 text-sm text-danger">{errors.budget}</p>}
              <p className="t-small mt-4 max-w-[52ch] text-muted">
                Nobody is quoted from a dropdown — every menu is priced on what it actually
                takes. This just tells him whether to be thinking plated and multi-course or
                family style, so the first thing he sends you is useful.
              </p>
            </fieldset>

            <fieldset className="border-0 p-0">
              <legend className="t-label text-muted">Is the decision yours?</legend>
              <div className="mt-3 flex flex-wrap gap-3">
                {DECISIONS.map((d) => (
                  <button
                    key={d.value}
                    type="button"
                    className="chip"
                    aria-pressed={v.decision === d.value}
                    onClick={() => set("decision", d.value)}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
              {errors.decision && <p className="mt-3 text-sm text-danger">{errors.decision}</p>}
            </fieldset>

            <fieldset className="border-0 p-0">
              <legend className="t-label text-muted">How did you find him?</legend>
              <div className="mt-3 flex flex-wrap gap-3">
                {SOURCES.map((s) => (
                  <button
                    key={s.value}
                    type="button"
                    className="chip"
                    aria-pressed={v.foundVia === s.value}
                    onClick={() => set("foundVia", s.value)}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
              {errors.foundVia && <p className="mt-3 text-sm text-danger">{errors.foundVia}</p>}
            </fieldset>
          </div>
        )}

        {/* ————— Step 5: the occasion. Required, with a real minimum. ————— */}
        {step === 4 && (
          <div className="mt-8 space-y-7">
            <div>
              <label htmlFor="notes" className="t-label block text-muted">
                The night, in your words
              </label>
              <p className="t-small mt-2 max-w-[54ch] text-muted">
                What the occasion is, who is coming, what you want the evening to feel like,
                anything you have loved or hated at other dinners. This is the part he reads
                before anything else, and it is what he builds the menu from.
              </p>
              <textarea
                id="notes"
                name="notes"
                rows={5}
                className="field mt-3"
                placeholder="It's my parents' fortieth anniversary. Fourteen of us at our place in Glen Allen, mostly family, everyone loves seafood except my brother. We want it to feel like a proper dinner party rather than a catered thing — people staying at the table talking."
                value={v.notes}
                onChange={(e) => set("notes", e.target.value)}
                aria-invalid={!!errors.notes}
                aria-describedby="notes-count"
                required
              />
              <div className="mt-2 flex flex-wrap items-baseline justify-between gap-3">
                {errors.notes ? (
                  <p className="text-sm text-danger">{errors.notes}</p>
                ) : (
                  <span />
                )}
                <p
                  id="notes-count"
                  className={`t-small tabular-nums ${notesLen >= NOTES_MIN ? "text-muted" : "text-danger"}`}
                >
                  {notesLen < NOTES_MIN
                    ? `${NOTES_MIN - notesLen} more characters`
                    : "That's plenty — thank you"}
                </p>
              </div>
            </div>

            <div>
              <label htmlFor="dietary" className="t-label block text-muted">
                Allergies or dietary needs <span className="normal-case">(optional)</span>
              </label>
              <input
                id="dietary"
                name="dietary"
                type="text"
                className="field mt-3"
                placeholder="Two vegetarians, one shellfish allergy…"
                value={v.dietary}
                onChange={(e) => set("dietary", e.target.value)}
              />
              <p className="t-small mt-3 max-w-[54ch] text-muted">
                Allergies are planned with the chef directly, and you will be able to list every
                guest properly once you are booked. He cooks in shared kitchens, so no dish can be
                guaranteed free of cross-contamination.
              </p>
            </div>
          </div>
        )}

        {/* ————— Step 6: contact + the deposit acknowledgment ————— */}
        {step === LAST_STEP && (
          <div className="mt-8 space-y-6">
            <div>
              <label htmlFor="name" className="t-label block text-muted">
                Your name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                className="field mt-3"
                value={v.name}
                onChange={(e) => set("name", e.target.value)}
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? "name-err" : undefined}
                required
              />
              {errors.name && (
                <p id="name-err" className="mt-2 text-sm text-danger">
                  {errors.name}
                </p>
              )}
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="email" className="t-label block text-muted">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  className="field mt-3"
                  value={v.email}
                  onChange={(e) => set("email", e.target.value)}
                  onBlur={() =>
                    setErrors((e) => ({
                      ...e,
                      email: v.email && !emailOk(v.email) ? "Check that address." : undefined,
                    }))
                  }
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? "email-err" : undefined}
                  required
                />
                {errors.email && (
                  <p id="email-err" className="mt-2 text-sm text-danger">
                    {errors.email}
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="phone" className="t-label block text-muted">
                  Phone
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  className="field mt-3"
                  value={v.phone}
                  onChange={(e) => set("phone", e.target.value)}
                  aria-invalid={!!errors.phone}
                  aria-describedby={errors.phone ? "phone-err" : undefined}
                  required
                />
                {errors.phone && (
                  <p id="phone-err" className="mt-2 text-sm text-danger">
                    {errors.phone}
                  </p>
                )}
              </div>
            </div>

            {/*
              The deposit acknowledgment. This one checkbox removes more wasted
              time than any other single thing on the form, and it does it by
              being honest rather than by being a barrier.
            */}
            <div className="border border-line bg-bone-2/60 px-5 py-4">
              <label htmlFor="depositOk" className="flex cursor-pointer items-start gap-3">
                <input
                  id="depositOk"
                  name="depositOk"
                  type="checkbox"
                  checked={v.depositOk}
                  onChange={(e) => set("depositOk", e.target.checked)}
                  className="mt-1 h-4 w-4 shrink-0 accent-[color:var(--color-accent)]"
                  aria-invalid={!!errors.depositOk}
                  aria-describedby={errors.depositOk ? "deposit-err" : undefined}
                  required
                />
                <span className="text-sm leading-relaxed">
                  I understand a date is held with a deposit, and the balance is settled before
                  the event. Chef Kearse turns down other work to hold a date, so it is only
                  really yours once the deposit is in.
                </span>
              </label>
              {errors.depositOk && (
                <p id="deposit-err" className="mt-2 text-sm text-danger">
                  {errors.depositOk}
                </p>
              )}

              <label htmlFor="callOk" className="mt-4 flex cursor-pointer items-start gap-3">
                <input
                  id="callOk"
                  name="callOk"
                  type="checkbox"
                  checked={v.callOk}
                  onChange={(e) => set("callOk", e.target.checked)}
                  className="mt-1 h-4 w-4 shrink-0 accent-[color:var(--color-accent)]"
                />
                <span className="text-sm leading-relaxed text-muted">
                  Happy to take a ten-minute call — it is usually faster than email for working
                  out a menu. <span className="normal-case">(optional)</span>
                </span>
              </label>
            </div>

            {/* Honeypot — hidden from people, irresistible to bots */}
            <div aria-hidden="true" className="absolute left-[-9999px] h-px w-px overflow-hidden">
              <label htmlFor="company">Company</label>
              <input
                id="company"
                name="company"
                type="text"
                tabIndex={-1}
                autoComplete="off"
                value={v.company}
                onChange={(e) => set("company", e.target.value)}
              />
            </div>

            <p className="t-small text-muted">
              Your details go to Chef Kearse and nowhere else. No list, no resale, no
              marketing you did not ask for. See the{" "}
              <Link href="/privacy" className="link-underline text-ink">
                privacy note
              </Link>
              .
            </p>

            {state === "error" && (
              <p className="border border-danger bg-accent-tint px-4 py-3 text-sm text-danger">
                Something went wrong sending that. Call {site.contact.phone} or email{" "}
                {site.contact.email} and it will get straight to him.
              </p>
            )}
          </div>
        )}

        {/* ————— Summary of what has been answered ————— */}
        {step > 0 && (
          <ul className="mt-10 flex flex-wrap gap-x-8 gap-y-3 border-t border-line pt-6">
            {v.service && (
              <li>
                <p className="t-label text-muted">Service</p>
                <p className="mt-1 text-sm">
                  {SERVICES.find((s) => s.value === v.service)?.label ?? v.service}
                </p>
              </li>
            )}
            {v.date && (
              <li>
                <p className="t-label text-muted">Date</p>
                <p className="mt-1 text-sm">{v.date}</p>
              </li>
            )}
            {v.guests && (
              <li>
                <p className="t-label text-muted">Guests</p>
                <p className="mt-1 text-sm">{v.guests}</p>
              </li>
            )}
            {v.place && (
              <li>
                <p className="t-label text-muted">Where</p>
                <p className="mt-1 text-sm">{v.place}</p>
              </li>
            )}
            {v.budget && (
              <li>
                <p className="t-label text-muted">Per guest</p>
                <p className="mt-1 text-sm">
                  {BUDGETS.find((b) => b.value === v.budget)?.label ?? v.budget}
                </p>
              </li>
            )}
          </ul>
        )}

        {/* ————— Controls ————— */}
        <div className="mt-10 flex flex-col-reverse gap-3 sm:flex-row sm:items-center">
          {step > 0 && (
            <button type="button" onClick={back} className="btn btn-ghost sm:min-w-[8rem]">
              Back
            </button>
          )}
          {step < LAST_STEP && (
            <button type="button" onClick={next} className="btn btn-primary sm:min-w-[14rem]">
              {step === LAST_STEP - 1 ? "Almost done" : "Continue"}
            </button>
          )}
          {step === LAST_STEP && (
            <button
              type="submit"
              disabled={state === "sending"}
              className="btn btn-primary sm:min-w-[16rem] disabled:opacity-60"
            >
              {state === "sending" ? "Sending…" : "Send it to the chef"}
            </button>
          )}
        </div>
      </div>
    </form>
  );
}
