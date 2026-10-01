import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/portal/auth";
import { addProspect, deleteProspect } from "@/lib/portal/lead-store";
import { scoreInputSchema, sourceSchema } from "@/lib/portal/lead-schemas";

/**
 * Collection-level operations on outbound prospects: add one by hand, or remove
 * one. Everything that acts on a single existing prospect lives in
 * ./[id]/route.ts.
 *
 * The actor on every write comes from the session. Nothing here reads a role, a
 * name or an orgId from the request body — same rule as the inbound routes.
 */

const createSchema = z.object({
  name: z.string().trim().min(1).max(200),
  category: z.enum([
    "corporate",
    "nonprofit-gala",
    "venue",
    "planner",
    "association",
    "institution",
    "production",
  ]),
  city: z.string().trim().max(120).default(""),
  state: z.string().trim().max(40).default(""),
  phone: z.string().trim().max(40).nullable().default(null),
  website: z.string().trim().max(600).nullable().default(null),
  contactName: z.string().trim().max(160).nullable().default(null),
  contactRole: z.string().trim().max(160).nullable().default(null),
  whyItFits: z.string().trim().min(1).max(4000),
  pitch: z.string().trim().min(1).max(4000),
  openingQuestion: z.string().trim().min(1).max(2000),
  caution: z.string().trim().max(4000).nullable().default(null),
  suggestedAction: z.string().trim().min(1).max(4000),
  targetDates: z.array(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).max(40).default([]),
  scoreInput: scoreInputSchema,
  sources: z.array(sourceSchema).max(20).default([]),
  owner: z.enum(["owner", "assistant", "agent"]).default("agent"),
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
      {
        ok: false,
        error: first ? `${first.path.join(".")}: ${first.message}` : "Could not read that.",
        issues: parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`),
      },
      { status: 400 },
    );
  }

  const p = addProspect(
    {
      ...parsed.data,
      // sourceCount is derived from the sources actually attached, inside the
      // store. A caller cannot assert it and so cannot bypass the hard cap.
      scoreInput: { ...parsed.data.scoreInput, sourceCount: parsed.data.sources.length },
      sourcedBy: session.role === "owner" ? "chef" : "assistant",
    },
    session.name,
  );

  return NextResponse.json({
    ok: true,
    id: p.id,
    ref: p.ref,
    priority: p.priority,
    total: p.score.total,
    cappedBy: p.score.cappedBy,
  });
}

const deleteSchema = z.object({ id: z.string().min(1).max(60) });

export async function DELETE(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ ok: false, error: "Not signed in." }, { status: 401 });
  // Owner-only, mirroring enquiry deletion. A prospect record carries commission
  // attribution, so removing one is not an assistant's call.
  if (session.role !== "owner") {
    return NextResponse.json(
      { ok: false, error: "Only the owner can remove a prospect." },
      { status: 403 },
    );
  }

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Malformed request." }, { status: 400 });
  }

  const parsed = deleteSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "No prospect named." }, { status: 400 });
  }

  const result = deleteProspect(parsed.data.id, session.name);
  if (!result.ok) {
    return NextResponse.json({ ok: false, error: "No such prospect." }, { status: 404 });
  }
  return NextResponse.json({ ok: true, name: result.name });
}
