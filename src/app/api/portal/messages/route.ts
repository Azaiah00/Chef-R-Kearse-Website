import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/portal/auth";
import { addMessage, getLead, getLeadByClientToken } from "@/lib/portal/store";

const schema = z.object({
  leadId: z.string().min(1).max(60),
  as: z.enum(["staff", "client"]),
  authorName: z.string().min(1).max(120),
  authorRole: z.enum(["owner", "assistant"]).nullable().optional(),
  body: z.string().min(1).max(4000),
  /** Required for client sends — proves the sender owns that event. */
  token: z.string().max(120).optional(),
});

export async function POST(request: Request) {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Malformed request." }, { status: 400 });
  }

  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Message could not be read." }, { status: 400 });
  }
  const input = parsed.data;

  if (input.as === "staff") {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ ok: false, error: "Not signed in." }, { status: 401 });
    }
    if (!getLead(input.leadId)) {
      return NextResponse.json({ ok: false, error: "No such enquiry." }, { status: 404 });
    }
    // Identity comes from the session, never the body.
    addMessage(input.leadId, "staff", session.name, session.role, input.body);
    return NextResponse.json({ ok: true });
  }

  // Client side. The token must resolve to exactly this lead — otherwise a guest
  // with one valid link could post into somebody else's event by changing the id.
  if (!input.token) {
    return NextResponse.json({ ok: false, error: "Link is missing or expired." }, { status: 401 });
  }
  const lead = getLeadByClientToken(input.token);
  if (!lead || lead.id !== input.leadId) {
    return NextResponse.json({ ok: false, error: "Link is not valid for this event." }, { status: 403 });
  }

  addMessage(lead.id, "client", lead.name, null, input.body);
  return NextResponse.json({ ok: true });
}
