import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/portal/auth";
import { addNote, assignLead, getLead, overrideBand, setStage } from "@/lib/portal/store";

const stages = [
  "new",
  "screened",
  "quoted",
  "tasting",
  "contract",
  "deposit",
  "confirmed",
  "completed",
  "lost",
] as const;

const schema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("stage"),
    actor: z.string().min(1).max(120),
    stage: z.enum(stages),
    note: z.string().max(2000).optional(),
  }),
  z.object({
    action: z.literal("note"),
    actor: z.string().min(1).max(120),
    body: z.string().min(1).max(4000),
  }),
  z.object({
    action: z.literal("override"),
    actor: z.string().min(1).max(120),
    band: z.enum(["A", "B", "C", "D"]),
    reason: z.string().min(1).max(2000),
  }),
  z.object({
    action: z.literal("assign"),
    actor: z.string().min(1).max(120),
    userId: z.string().max(60).nullable(),
  }),
]);

export async function POST(request: Request, ctx: { params: Promise<{ id: string }> }) {
  // Auth is checked here, not only on the page. A route handler is a public
  // endpoint until it says otherwise.
  const session = await getSession();
  if (!session) return NextResponse.json({ ok: false, error: "Not signed in." }, { status: 401 });

  const { id } = await ctx.params;
  if (!getLead(id)) {
    return NextResponse.json({ ok: false, error: "No such enquiry." }, { status: 404 });
  }

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Malformed request." }, { status: 400 });
  }

  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Unrecognised action." }, { status: 400 });
  }

  // The actor is taken from the SESSION, never from the request body. The body's
  // `actor` field is only a convenience for the client and is ignored here.
  const actor = session.name;
  const input = parsed.data;

  switch (input.action) {
    case "stage":
      setStage(id, input.stage, actor, input.note);
      break;
    case "note":
      addNote(id, actor, input.body);
      break;
    case "override":
      // Only the owner may disagree with the engine on the record.
      if (session.role !== "owner") {
        return NextResponse.json(
          { ok: false, error: "Only the chef can override a band." },
          { status: 403 },
        );
      }
      overrideBand(id, input.band, actor, input.reason);
      break;
    case "assign":
      assignLead(id, input.userId, actor);
      break;
  }

  return NextResponse.json({ ok: true });
}
