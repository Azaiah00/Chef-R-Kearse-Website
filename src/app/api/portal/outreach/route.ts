import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/portal/auth";
import { addOutreach, getProspect, setOutreachStatus } from "@/lib/portal/lead-store";

/**
 * Outreach drafts: create one against a prospect, or move its status.
 *
 * Timestamps are not accepted from the client. Moving a record to "sent" stamps
 * sentISO and sentBy in the store, from the server clock and the session — the
 * date a message went out is the one number in this engine most likely to be
 * argued about later.
 */

const createSchema = z.object({
  prospectId: z.string().trim().min(1).max(60),
  channel: z.enum(["email", "call", "form", "in-person"]),
  subject: z.string().trim().min(1).max(300),
  body: z.string().trim().min(1).max(20000),
});

const statusSchema = z.object({
  id: z.string().trim().min(1).max(60),
  status: z.enum(["draft", "approved", "sent", "replied", "no-response", "closed"]),
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

  if (!getProspect(parsed.data.prospectId)) {
    return NextResponse.json({ ok: false, error: "No such prospect." }, { status: 404 });
  }

  const rec = addOutreach(parsed.data, session.name);
  return NextResponse.json({ ok: true, id: rec.id, status: rec.status });
}

export async function PATCH(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ ok: false, error: "Not signed in." }, { status: 401 });

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Malformed request." }, { status: 400 });
  }

  const parsed = statusSchema.safeParse(raw);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return NextResponse.json(
      { ok: false, error: first ? `${first.path.join(".")}: ${first.message}` : "Could not read that." },
      { status: 400 },
    );
  }

  const rec = setOutreachStatus(parsed.data.id, parsed.data.status, session.role);
  if (!rec) return NextResponse.json({ ok: false, error: "No such outreach record." }, { status: 404 });

  return NextResponse.json({
    ok: true,
    status: rec.status,
    sentISO: rec.sentISO,
    sentBy: rec.sentBy,
  });
}
