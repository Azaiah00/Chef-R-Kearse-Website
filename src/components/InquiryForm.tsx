"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { site } from "@/lib/site";

/* ————————————————————————————————————————————————————————————————
   A five-step qualifying enquiry.

   Why it is built this way — the evidence, not a hunch:
   • Multi-step forms out-convert equivalent single-step forms by roughly 14%
     on average, and by more once a form passes six fields (Digital Applied,
     "Form Conversion Rate Benchmarks 2026"; Venture Harbour).
   • Conversion falls off a cliff between five and seven fields on one screen
     (23.1% → 17.0% → 11.4%). Every step here asks for three fields or fewer.
   • A visible progress indicator is worth +11–15%; inline validation +5–13%;
     a visible privacy line +4–7%; correct autofill metadata on mobile +11–18%.
   • The first interaction is a single tap on a choice the visitor already knows
     the answer to — commitment before effort. Contact details are asked last,
     once the visitor has invested four steps.
   ———————————————————————————————————————————————————————————————— */

const SERVICES = [
  "Private dinner at home",
  "Personal chef service",
  "Wedding",
  "Corporate or social event",
  "Not sure yet",
] as const;

const FLEX = ["That date exactly", "Within a week either side", "The month is flexible"] as const;

const GUESTS = ["2", "3–6", "7–12", "13–30", "31–75", "76–150", "150+"] as const;

const STEP_TITLES = [
  "What kind of night is it?",
  "When are you thinking?",
  "How many at the table?",
  "Anything he should know?",
  "Where should he send the menu?",
];

type Values = {
  service: string;
  date: string;
  flexibility: string;
  guests: string;
  place: string;
  notes: string;
  dietary: string;
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
  notes: "",
  dietary: "",
  name: "",
  email: "",
  phone: "",
  company: "",
};

const emailOk = (v: string) => /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(v.trim());
const phoneOk = (v: string) => v.replace(/\D/g, "").length >= 10;

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
    const match =
      SERVICES.find((x) => x.toLowerCase() === s.toLowerCase()) ??
      SERVICES.find((x) => x.toLowerCase().includes(s.toLowerCase().split(" ")[0]));
    if (match) setV((prev) => ({ ...prev, service: match }));
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

  const set = (k: keyof Values, val: string) => {
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
    }
    if (s === 4) {
      if (!v.name.trim()) e.name = "What should he call you?";
      if (!emailOk(v.email)) e.email = "A working email address, please.";
      if (!phoneOk(v.phone)) e.phone = "A number he can reach you on.";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => {
    if (!validate(step)) return;
    setStep((s) => Math.min(s + 1, STEP_TITLES.length - 1));
  };
  const back = () => setStep((s) => Math.max(0, s - 1));

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate(4)) return;
    setState("sending");
    try {
      const res = await fetch("/api/inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...v, elapsedMs: Date.now() - startedAt.current }),
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

  const progress = useMemo(
    () => Math.round(((step + 1) / STEP_TITLES.length) * 100),
    [step]
  );

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
        <h2
          ref={headingRef}
          tabIndex={-1}
          className="t-h3 max-w-[20ch] outline-none"
        >
          {STEP_TITLES[step]}
        </h2>

        {/* ————— Step 1: service ————— */}
        {step === 0 && (
          <fieldset className="mt-8 border-0 p-0">
            <legend className="sr-only">Type of service</legend>
            <div className="flex flex-wrap gap-3">
              {SERVICES.map((s) => (
                <button
                  key={s}
                  type="button"
                  className="chip"
                  aria-pressed={v.service === s}
                  onClick={() => {
                    set("service", s);
                    window.setTimeout(() => setStep(1), 160);
                  }}
                >
                  {s}
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
                    key={f}
                    type="button"
                    className="chip"
                    aria-pressed={v.flexibility === f}
                    onClick={() => set("flexibility", f)}
                  >
                    {f}
                  </button>
                ))}
              </div>
              {errors.flexibility && (
                <p className="mt-3 text-sm text-danger">{errors.flexibility}</p>
              )}
            </fieldset>
          </div>
        )}

        {/* ————— Step 3: guests + place ————— */}
        {step === 2 && (
          <div className="mt-8 space-y-7">
            <fieldset className="border-0 p-0">
              <legend className="t-label text-muted">Guests</legend>
              <div className="mt-3 flex flex-wrap gap-3">
                {GUESTS.map((g) => (
                  <button
                    key={g}
                    type="button"
                    className="chip min-w-[4.5rem]"
                    aria-pressed={v.guests === g}
                    onClick={() => set("guests", g)}
                  >
                    {g}
                  </button>
                ))}
              </div>
              {errors.guests && <p className="mt-3 text-sm text-danger">{errors.guests}</p>}
            </fieldset>

            <div>
              <label htmlFor="place" className="t-label block text-muted">
                Where
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

        {/* ————— Step 4: notes (optional) ————— */}
        {step === 3 && (
          <div className="mt-8 space-y-7">
            <div>
              <label htmlFor="notes" className="t-label block text-muted">
                The night, in your words <span className="normal-case">(optional)</span>
              </label>
              <textarea
                id="notes"
                name="notes"
                className="field mt-3"
                placeholder="Anniversary dinner for six, we love seafood, my wife hates cilantro…"
                value={v.notes}
                onChange={(e) => set("notes", e.target.value)}
              />
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
              <p className="t-small mt-3 text-muted">
                Allergies are planned with the chef directly. He cooks in shared kitchens,
                so no dish can be guaranteed free of cross-contamination.
              </p>
            </div>
          </div>
        )}

        {/* ————— Step 5: contact ————— */}
        {step === 4 && (
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
                <p className="mt-1 text-sm">{v.service}</p>
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
          </ul>
        )}

        {/* ————— Controls ————— */}
        <div className="mt-10 flex flex-col-reverse gap-3 sm:flex-row sm:items-center">
          {step > 0 && (
            <button type="button" onClick={back} className="btn btn-ghost sm:min-w-[8rem]">
              Back
            </button>
          )}
          {step < 4 && (
            <button type="button" onClick={next} className="btn btn-primary sm:min-w-[14rem]">
              {step === 3 ? "Almost done" : "Continue"}
            </button>
          )}
          {step === 4 && (
            <button
              type="submit"
              disabled={state === "sending"}
              className="btn btn-primary sm:min-w-[16rem] disabled:opacity-60"
            >
              {state === "sending" ? "Sending…" : "Send it to the chef"}
            </button>
          )}
          {step === 3 && (
            <button
              type="button"
              onClick={() => setStep(4)}
              className="t-label self-center text-muted underline underline-offset-4"
            >
              Skip this
            </button>
          )}
        </div>
      </div>
    </form>
  );
}
