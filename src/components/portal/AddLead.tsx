"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  BUDGET_LABELS,
  DECISION_LABELS,
  EVENT_TYPE_LABELS,
  SOURCE_LABELS,
  VENUE_LABELS,
} from "@/lib/portal/scoring";
import { Card } from "./Ui";
import { IconPlus } from "./Icons";

/**
 * Adding an enquiry that did not come through the website — a phone call, a
 * referral passed on at another event, someone who stopped the chef at a
 * wedding.
 *
 * It runs through the same qualification engine as a web enquiry, so a lead
 * that arrived by phone lands in the same pipeline on the same terms and shows
 * the same score breakdown. The one difference is that nothing typed in here is
 * ever auto-declined: if a person bothered to enter it, a human has already
 * decided it is worth having.
 *
 * Only four fields are required — a name, an email, what kind of event, and
 * where. Everything else improves the score but nobody should be blocked from
 * recording a phone call because they did not ask about the budget.
 */

const EMPTY = {
  name: "",
  email: "",
  phone: "",
  eventType: "private-dinner",
  eventDate: "",
  guestCount: "",
  venueType: "my-home",
  venueCity: "",
  budgetBand: "unsure",
  decisionMaker: "shared",
  source: "referral",
  occasionNotes: "",
  dietaryNotes: "",
  depositOk: false,
  callOk: false,
  dateFlexible: false,
};

export default function AddLead() {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [v, setV] = useState({ ...EMPTY });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<{ ref: string; band: string; total: number } | null>(null);

  const set = <K extends keyof typeof EMPTY>(k: K, val: (typeof EMPTY)[K]) => {
    setV((prev) => ({ ...prev, [k]: val }));
    setError(null);
  };

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/portal/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: v.name.trim(),
          email: v.email.trim(),
          phone: v.phone.trim(),
          eventType: v.eventType,
          eventDate: /^\d{4}-\d{2}-\d{2}$/.test(v.eventDate) ? v.eventDate : null,
          dateFlexible: v.dateFlexible,
          guestCount: Number(v.guestCount) || 0,
          venueType: v.venueType,
          venueCity: v.venueCity.trim(),
          budgetBand: v.budgetBand,
          decisionMaker: v.decisionMaker,
          source: v.source,
          occasionNotes: v.occasionNotes.trim(),
          dietaryNotes: v.dietaryNotes.trim(),
          depositOk: v.depositOk,
          callOk: v.callOk,
          workedWithChefBefore: v.source === "returning",
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
        ref?: string;
        band?: string;
        total?: number;
      };
      if (!res.ok || !data.ok) {
        setError(data.error ?? "That did not save.");
        setBusy(false);
        return;
      }
      setDone({ ref: data.ref ?? "", band: data.band ?? "", total: data.total ?? 0 });
      setV({ ...EMPTY });
      startTransition(() => router.refresh());
    } catch {
      setError("Could not reach the server.");
    }
    setBusy(false);
  }

  if (!open) {
    return (
      <button type="button" className="p-btn p-btn-sm" onClick={() => setOpen(true)}>
        <IconPlus className="h-4 w-4" />
        Add an enquiry
      </button>
    );
  }

  return (
    <Card title="Add an enquiry">
      <form onSubmit={submit} className="p-card-pad" noValidate>
        {done ? (
          <div className="p-hairline mb-4 border-t-0 pb-4">
            <p className="p-ok text-sm font-medium">
              Added as {done.ref} — scored {done.total}/100, band {done.band}
            </p>
            <p className="p-muted mt-1 text-[0.8125rem] leading-snug">
              It is in the pipeline now, and the dashboards have already picked it up.
            </p>
          </div>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="al-name" className="p-title block">
              Name
            </label>
            <input
              id="al-name"
              className="p-input mt-2"
              value={v.name}
              required
              onChange={(e) => set("name", e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="al-email" className="p-title block">
              Email
            </label>
            <input
              id="al-email"
              type="email"
              className="p-input mt-2"
              value={v.email}
              required
              onChange={(e) => set("email", e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="al-phone" className="p-title block">
              Phone
            </label>
            <input
              id="al-phone"
              type="tel"
              className="p-input mt-2"
              value={v.phone}
              onChange={(e) => set("phone", e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="al-type" className="p-title block">
              Event
            </label>
            <select
              id="al-type"
              className="p-select mt-2"
              value={v.eventType}
              onChange={(e) => set("eventType", e.target.value)}
            >
              {Object.entries(EVENT_TYPE_LABELS).map(([k, label]) => (
                <option key={k} value={k}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="al-date" className="p-title block">
              Date
            </label>
            <input
              id="al-date"
              type="date"
              className="p-input mt-2"
              value={v.eventDate}
              onChange={(e) => set("eventDate", e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="al-guests" className="p-title block">
              Guests
            </label>
            <input
              id="al-guests"
              type="number"
              min={0}
              inputMode="numeric"
              className="p-input mt-2"
              value={v.guestCount}
              onChange={(e) => set("guestCount", e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="al-venue" className="p-title block">
              Where
            </label>
            <select
              id="al-venue"
              className="p-select mt-2"
              value={v.venueType}
              onChange={(e) => set("venueType", e.target.value)}
            >
              {Object.entries(VENUE_LABELS).map(([k, label]) => (
                <option key={k} value={k}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="al-city" className="p-title block">
              Town or city
            </label>
            <input
              id="al-city"
              className="p-input mt-2"
              value={v.venueCity}
              required
              onChange={(e) => set("venueCity", e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="al-budget" className="p-title block">
              Budget a head
            </label>
            <select
              id="al-budget"
              className="p-select mt-2"
              value={v.budgetBand}
              onChange={(e) => set("budgetBand", e.target.value)}
            >
              {Object.entries(BUDGET_LABELS).map(([k, label]) => (
                <option key={k} value={k}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="al-decision" className="p-title block">
              Decision
            </label>
            <select
              id="al-decision"
              className="p-select mt-2"
              value={v.decisionMaker}
              onChange={(e) => set("decisionMaker", e.target.value)}
            >
              {Object.entries(DECISION_LABELS).map(([k, label]) => (
                <option key={k} value={k}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="al-source" className="p-title block">
              How they came to us
            </label>
            <select
              id="al-source"
              className="p-select mt-2"
              value={v.source}
              onChange={(e) => set("source", e.target.value)}
            >
              {Object.entries(SOURCE_LABELS).map(([k, label]) => (
                <option key={k} value={k}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="al-notes" className="p-title block">
              What they said
            </label>
            <textarea
              id="al-notes"
              rows={3}
              className="p-textarea mt-2"
              placeholder="The occasion, who is coming, anything they mentioned on the call."
              value={v.occasionNotes}
              onChange={(e) => set("occasionNotes", e.target.value)}
            />
            <p className="p-muted mt-1.5 text-[0.75rem] leading-snug">
              Worth writing properly — how much detail an enquiry carries is one of the nine
              things the score reads.
            </p>
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="al-diet" className="p-title block">
              Allergies or dietary, if mentioned
            </label>
            <input
              id="al-diet"
              className="p-input mt-2"
              value={v.dietaryNotes}
              onChange={(e) => set("dietaryNotes", e.target.value)}
            />
          </div>
        </div>

        <div className="mt-4 space-y-2">
          <label className="p-check-row">
            <input
              type="checkbox"
              checked={v.dateFlexible}
              onChange={(e) => set("dateFlexible", e.target.checked)}
              className="mt-0.5 shrink-0 accent-[color:var(--color-accent)]"
            />
            <span className="text-[0.875rem]">The date is flexible</span>
          </label>
          <label className="p-check-row">
            <input
              type="checkbox"
              checked={v.depositOk}
              onChange={(e) => set("depositOk", e.target.checked)}
              className="mt-0.5 shrink-0 accent-[color:var(--color-accent)]"
            />
            <span className="text-[0.875rem]">They accept that a date is held with a deposit</span>
          </label>
          <label className="p-check-row">
            <input
              type="checkbox"
              checked={v.callOk}
              onChange={(e) => set("callOk", e.target.checked)}
              className="mt-0.5 shrink-0 accent-[color:var(--color-accent)]"
            />
            <span className="text-[0.875rem]">Happy to take a call</span>
          </label>
        </div>

        {error ? (
          <p role="alert" className="p-bad mt-3 text-[0.8125rem]">
            {error}
          </p>
        ) : null}

        <div className="mt-5 flex flex-wrap gap-2">
          <button type="submit" className="p-btn p-btn-primary p-btn-sm" disabled={busy}>
            {busy ? "Adding…" : "Add it to the pipeline"}
          </button>
          <button
            type="button"
            className="p-btn p-btn-sm"
            onClick={() => {
              setOpen(false);
              setDone(null);
              setError(null);
            }}
          >
            Close
          </button>
        </div>
      </form>
    </Card>
  );
}
