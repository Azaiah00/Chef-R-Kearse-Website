import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/portal/auth";
import { getLead } from "@/lib/portal/store";

const schema = z.object({
  action: z.literal("toggle-run-sheet"),
  itemId: z.string().min(1).max(60),
});

export async function POST(request: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ ok: false, error: "Not signed in." }, { status: 401 });

  const { id } = await ctx.params;
  const lead = getLead(id);
  if (!lead?.event) {
    return NextResponse.json({ ok: false, error: "No such event." }, { status: 404 });
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

  const item = lead.event.runSheet.find((r) => r.id === parsed.data.itemId);
  if (!item) {
    return NextResponse.json({ ok: false, error: "No such run-sheet item." }, { status: 404 });
  }
  item.done = !item.done;

  lead.timeline.push({
    id: `t_${Date.now().toString(36)}`,
    at: new Date().toISOString(),
    actor: session.name,
    kind: "note",
    summary: `${item.done ? "Completed" : "Reopened"}: ${item.label}`,
  });

  return NextResponse.json({ ok: true, done: item.done });
}
