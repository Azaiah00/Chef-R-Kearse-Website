import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/portal/auth";
import { addLeadByHand, deleteLead } from "@/lib/portal/store";

/**
 * Collection-level operations on enquiries: create one by hand, or remove one.
 *
 * Stage changes and everything else that acts on a single existing enquiry live
 * in ./[id]/route.ts.
 */

const createSchema = z.object({
  name: z.string().trim().min(1).max(160),
  email: z.string().trim().email().max(200),
  phone: z.string().trim().max(40).default(""),
  eventType: z.enum([
    "wedding",
    "corporate",
    "private-dinner",
    "milestone",
    "weekly-service",
    "other",
  ]),
  eventDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .nullable()
    .optional(),
  dateFlexible: z.boolean().default(false),
  guestCount: z.number().int().min(0).max(5000).default(0),
  venueType: z.enum(["my-home", "rented-venue", "office", "outdoor", "undecided"]),
  venueCity: z.string().trim().max(160).default(""),
  budgetBand: z.enum(["under-75", "75-125", "125-200", "200-plus", "unsure"]),
  decisionMaker: z.enum(["yes", "shared", "no"]).default("shared"),
  source: z
    .enum(["referral", "google", "instagram", "returning", "wedding-directory", "walk-past", "other"])
    .default("other"),
  occasionNotes: z.string().max(4000).default(""),
  dietaryNotes: z.string().max(1000).default(""),
  depositOk: z.boolean().default(false),
  callOk: z.boolean().default(false),
  workedWithChefBefore: z.boolean().default(false),
});

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ ok: false, error: "Not signed in." }, { status: 401 });

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Malformed request." }, { status: 400 });
  }

  const parsed = createSchema.safeParse(raw);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return NextResponse.json(
      { ok: false, error: first ? `${first.path.join(".")}: ${first.message}` : "Could not read that." },
      { status: 400 },
    );
  }

  const lead = addLeadByHand(
    {
      ...parsed.data,
      eventDate: parsed.data.eventDate ?? null,
      workedWithChefBefore: parsed.data.workedWithChefBefore || parsed.data.source === "returning",
    },
    session.name,
  );

  return NextResponse.json({
    ok: true,
    id: lead.id,
    ref: lead.ref,
    band: lead.score.band,
    total: lead.score.total,
  });
}

const deleteSchema = z.object({ id: z.string().min(1).max(60) });

export async function DELETE(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ ok: false, error: "Not signed in." }, { status: 401 });

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Malformed request." }, { status: 400 });
  }

  const parsed = deleteSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "No enquiry named." }, { status: 400 });
  }

  const result = deleteLead(parsed.data.id);
  if (!result.ok) {
    return NextResponse.json({ ok: false, error: "No such enquiry." }, { status: 404 });
  }

  return NextResponse.json({ ok: true, name: result.name });
}
