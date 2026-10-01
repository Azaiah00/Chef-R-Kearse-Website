import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/portal/auth";
import { dismissSignal, promoteSignal } from "@/lib/portal/lead-store";

/**
 * Triage a feed signal: promote it to a prospect, or dismiss it.
 *
 * A dismissal REQUIRES a reason, enforced by the schema's min(1) rather than
 * left to the UI. That is not bureaucracy: a dismissal with a reason is how the
 * keyword rules in feed-rules.ts get better, and an unexplained one teaches
 * nothing and will be re-surfaced by the next sweep.
 */

const schema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("promote"),
    id: z.string().trim().min(1).max(60),
  }),
  z.object({
    action: z.literal("dismiss"),
    id: z.string().trim().min(1).max(60),
    reason: z
      .string()
      .trim()
      .min(1, "say why this is being dismissed — an unexplained dismissal teaches the rules nothing")
      .max(2000),
  }),
]);

export async function PATCH(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ ok: false, error: "Not signed in." }, { status: 401 });

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Malformed request." }, { status: 400 });
  }

  const parsed = schema.safeParse(raw);
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

  const actor = session.role === "owner" ? "chef" : "assistant";

  if (parsed.data.action === "promote") {
    const p = promoteSignal(parsed.data.id, actor);
    if (!p) {
      return NextResponse.json(
        { ok: false, error: "No such signal, or it has already been promoted." },
        { status: 404 },
      );
    }
    return NextResponse.json({ ok: true, prospectId: p.id, ref: p.ref, priority: p.priority });
  }

  const s = dismissSignal(parsed.data.id, parsed.data.reason, actor);
  if (!s) return NextResponse.json({ ok: false, error: "No such signal." }, { status: 404 });
  return NextResponse.json({ ok: true, id: s.id });
}
