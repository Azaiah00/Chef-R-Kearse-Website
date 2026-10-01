import { NextResponse } from "next/server";
import { z } from "zod";
import { site } from "@/lib/site";
import { BANDS } from "@/lib/portal/scoring";
import { createLead } from "@/lib/portal/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Schema = z.object({
  // Human-readable, for the email that reaches the chef.
  service: z.string().min(1).max(120),
  date: z.string().min(1).max(40),
  flexibility: z.string().max(120).optional().default(""),
  guests: z.string().min(1).max(40),
  place: z.string().min(1).max(160),
  notes: z.string().max(4000).optional().default(""),
  dietary: z.string().max(1000).optional().default(""),
  name: z.string().min(1).max(160),
  email: z.string().email().max(200),
  phone: z.string().min(7).max(40),
  company: z.string().max(200).optional().default(""), // honeypot
  elapsedMs: z.number().optional(),

  // Structured, for scoring and the portal record. Optional so an older cached
  // copy of the form still submits successfully rather than 400-ing on a real
  // customer — the lead is simply scored on what it did send.
  eventType: z
    .enum(["wedding", "corporate", "private-dinner", "milestone", "weekly-service", "other"])
    .optional(),
  guestCount: z.number().int().min(0).max(5000).optional(),
  venueType: z.enum(["my-home", "rented-venue", "office", "outdoor", "undecided"]).optional(),
  budgetBand: z.enum(["under-75", "75-125", "125-200", "200-plus", "unsure"]).optional(),
  decisionMaker: z.enum(["yes", "shared", "no"]).optional(),
  source: z
    .enum(["referral", "google", "instagram", "returning", "wedding-directory", "walk-past", "other"])
    .optional(),
  dateFlexible: z.boolean().optional(),
  depositOk: z.boolean().optional(),
  callOk: z.boolean().optional(),
});

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] as string)
  );

/** Naive in-memory rate limit. Good enough for a brochure site on one region. */
const hits = new Map<string, { n: number; t: number }>();
function limited(ip: string) {
  const now = Date.now();
  const rec = hits.get(ip);
  if (!rec || now - rec.t > 60 * 60 * 1000) {
    hits.set(ip, { n: 1, t: now });
    return false;
  }
  rec.n += 1;
  return rec.n > 8;
}

export async function POST(req: Request) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown";

  if (limited(ip)) {
    return NextResponse.json({ ok: false, error: "rate_limited" }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "bad_json" }, { status: 400 });
  }

  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "invalid" }, { status: 400 });
  }
  const d = parsed.data;

  // Bots fill hidden fields, and they fill forms faster than people read them.
  if (d.company.trim() !== "" || (d.elapsedMs !== undefined && d.elapsedMs < 2500)) {
    return NextResponse.json({ ok: true, skipped: true });
  }

  /* ── Score it, record it, route it ──────────────────────────────────────────
     Every enquiry becomes a scored record in the portal before anything is
     emailed. The guest never sees a number and every band gets a courteous
     answer — the score only decides how much of the chef's attention it earns
     and how fast. Band D is closed automatically, which is the whole point of
     the filter: no human time is spent on it at all.                          */
  const lead = createLead({
    name: d.name,
    email: d.email,
    phone: d.phone,
    eventType: d.eventType ?? "other",
    eventDate: /^\d{4}-\d{2}-\d{2}$/.test(d.date) ? d.date : null,
    dateFlexible: d.dateFlexible ?? false,
    guestCount: d.guestCount ?? 0,
    venueType: d.venueType ?? "undecided",
    venueCity: d.place,
    budgetBand: d.budgetBand ?? "unsure",
    decisionMaker: d.decisionMaker ?? "shared",
    source: d.source ?? "other",
    occasionNotes: d.notes,
    dietaryNotes: d.dietary,
    depositOk: d.depositOk ?? false,
    callOk: d.callOk ?? false,
    workedWithChefBefore: d.source === "returning",
  });

  const routing = BANDS[lead.score.band];

  const subject =
    `[${lead.score.band} · ${lead.score.total}/100] ${lead.ref} — ${d.service} — ${d.date} — ${d.guests} guests`;

  const lines: [string, string][] = [
    ["Reference", lead.ref],
    ["Qualification", `${lead.score.total}/100 — band ${lead.score.band} (${routing.label})`],
    ["How to handle it", `${routing.routing}. ${routing.sla}.`],
    ["Service", d.service],
    ["Date", d.date],
    ["Date flexibility", d.flexibility || "—"],
    ["Guests", d.guests],
    ["Where", `${d.place}${d.venueType ? ` — ${d.venueType.replace(/-/g, " ")}` : ""}`],
    ["Budget band given", d.budgetBand ? d.budgetBand.replace(/-/g, " to ").replace("under to", "under ") : "—"],
    ["Decision maker", d.decisionMaker ?? "—"],
    ["Found him via", d.source ?? "—"],
    ["Deposit acknowledged", d.depositOk ? "Yes" : "No"],
    ["Happy to take a call", d.callOk ? "Yes" : "No"],
    ["Notes", d.notes || "—"],
    ["Allergies / dietary", d.dietary || "—"],
    ["Name", d.name],
    ["Email", d.email],
    ["Phone", d.phone],
    [
      "Why it scored this",
      lead.score.lines.map((l) => `${l.label} ${l.points}/${l.max} — ${l.reason}`).join("\n"),
    ],
  ];

  const text = lines.map(([k, v]) => `${k}: ${v}`).join("\n");
  const html = `<!doctype html><html><body style="font-family:Georgia,serif;background:#f7f3ec;padding:24px;color:#12100e">
<table role="presentation" style="max-width:640px;margin:0 auto;background:#fffdf9;border:1px solid #e2d8c7;border-collapse:collapse">
<tr><td style="background:#12100e;color:#f7f3ec;padding:20px 24px">
  <div style="font-family:Helvetica,Arial,sans-serif;font-size:11px;letter-spacing:.2em;text-transform:uppercase;color:#ab2417">New enquiry</div>
  <div style="font-size:22px;margin-top:8px">${esc(d.service)} &middot; ${esc(d.date)}</div>
</td></tr>
${lines
  .map(
    ([k, v]) => `<tr>
  <td style="padding:14px 24px;border-bottom:1px solid #efe7d9">
    <div style="font-family:Helvetica,Arial,sans-serif;font-size:10px;letter-spacing:.18em;text-transform:uppercase;color:#6d6456">${esc(k)}</div>
    <div style="font-size:16px;margin-top:6px;white-space:pre-wrap">${esc(v)}</div>
  </td></tr>`
  )
  .join("")}
<tr><td style="padding:18px 24px;font-family:Helvetica,Arial,sans-serif;font-size:12px;color:#6d6456">
  Reply straight to this email to reach ${esc(d.name)}.
</td></tr>
</table></body></html>`;

  const key = process.env.RESEND_API_KEY;
  const to = process.env.INQUIRY_TO || site.contact.email;
  const from = process.env.INQUIRY_FROM || "Website Enquiry <onboarding@resend.dev>";

  if (!key) {
    // Demo mode: the site is fully usable before a single credential exists.
    // The lead is still scored and still lands in the portal, which is what
    // makes the whole thing demonstrable end to end with no credentials at all.
    console.info("[inquiry] RESEND_API_KEY not set — logging instead of sending.\n", text);
    return NextResponse.json({
      ok: true,
      delivered: false,
      mode: "log",
      ref: lead.ref,
      band: lead.score.band,
    });
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: d.email,
        subject,
        text,
        html,
      }),
    });
    if (!res.ok) {
      const detail = await res.text();
      console.error("[inquiry] resend failed", res.status, detail);
      return NextResponse.json({ ok: false, error: "send_failed" }, { status: 502 });
    }
  } catch (err) {
    console.error("[inquiry] resend threw", err);
    return NextResponse.json({ ok: false, error: "send_failed" }, { status: 502 });
  }

  return NextResponse.json({ ok: true, delivered: true, ref: lead.ref, band: lead.score.band });
}
