import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/portal/auth";
import {
  addProspectNote,
  assignProspect,
  attachSource,
  getProspect,
  setProspectNextAction,
  setProspectStatus,
} from "@/lib/portal/lead-store";
import { sourceSchema } from "@/lib/portal/lead-schemas";

/**
 * Operations on a single outbound prospect.
 *
 * Note the absence of an `actor` field in every variant below. The inbound
 * routes still accept one for historical reasons; this one does not, because the
 * session already knows who is calling and a body-supplied actor is a hole.
 */

const schema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("status"),
    status: z.enum([
      "new",
      "researched",
      "contacted",
      "conversation",
      "quoted",
      "won",
      "lost",
      "declined",
    ]),
  }),
  z.object({
    action: z.literal("nextAction"),
    iso: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .nullable(),
  }),
  z.object({
    action: z.literal("assign"),
    owner: z.enum(["owner", "assistant", "agent"]),
  }),
  z.object({
    action: z.literal("note"),
    body: z.string().trim().min(1).max(4000),
  }),
  z.object({
    action: z.literal("source"),
    source: sourceSchema,
  }),
]);

export async function PATCH(request: Request, ctx: { params: Promise<{ id: string }> }) {
  // Auth is checked here, not only on the page. A route handler is a public
  // endpoint until it says otherwise.
  const session = await getSession();
  if (!session) return NextResponse.json({ ok: false, error: "Not signed in." }, { status: 401 });

  const { id } = await ctx.params;
  if (!getProspect(id)) {
    return NextResponse.json({ ok: false, error: "No such prospect." }, { status: 404 });
  }

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

  const actor = session.name;
  const body = parsed.data;

  switch (body.action) {
    case "status": {
      const p = setProspectStatus(id, body.status, actor);
      return NextResponse.json({ ok: true, status: p?.status, nextActionBy: p?.nextActionBy ?? null });
    }
    case "nextAction": {
      const p = setProspectNextAction(id, body.iso, actor);
      return NextResponse.json({ ok: true, nextActionBy: p?.nextActionBy ?? null });
    }
    case "assign": {
      const p = assignProspect(id, body.owner, actor);
      return NextResponse.json({ ok: true, owner: p?.owner });
    }
    case "note": {
      addProspectNote(id, body.body, actor);
      return NextResponse.json({ ok: true });
    }
    case "source": {
      // Attaching a source re-scores the prospect, because the source count
      // feeds the hard cap — a record held at WARM for having no citation lifts
      // the moment one arrives. The response returns the new band so the client
      // can show that immediately rather than waiting for a refresh.
      const p = attachSource(id, body.source, actor);
      return NextResponse.json({
        ok: true,
        priority: p?.priority,
        total: p?.score.total,
        cappedBy: p?.score.cappedBy ?? null,
        sourceCount: p?.sources.length ?? 0,
      });
    }
  }
}
