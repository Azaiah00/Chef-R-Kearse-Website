import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/portal/auth";
import { getVenue, recordVenueDiff, setVenueStatus } from "@/lib/portal/lead-store";

/**
 * Operations on a venue record: move our application status, or record a diff of
 * the venue's published caterer list.
 *
 * Note what the status action does NOT accept: an application date. That is
 * stamped server-side in the store, because an appliedISO is evidence of when we
 * asked, and evidence a client can set is not evidence.
 */

const schema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("status"),
    status: z.enum(["not-applied", "applied", "on-list", "declined"]),
  }),
  z.object({
    action: z.literal("diff"),
    added: z.array(z.string().trim().min(1).max(200)).max(60).default([]),
    removed: z.array(z.string().trim().min(1).max(200)).max(60).default([]),
    iso: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .optional(),
  }),
]);

export async function PATCH(request: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ ok: false, error: "Not signed in." }, { status: 401 });

  const { id } = await ctx.params;
  if (!getVenue(id)) {
    return NextResponse.json({ ok: false, error: "No such venue." }, { status: 404 });
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

  if (parsed.data.action === "status") {
    const v = setVenueStatus(id, parsed.data.status, session.name);
    return NextResponse.json({ ok: true, ourStatus: v?.ourStatus, appliedISO: v?.appliedISO ?? null });
  }

  const { added, removed, iso } = parsed.data;
  if (added.length === 0 && removed.length === 0) {
    return NextResponse.json(
      { ok: false, error: "A diff needs at least one added or removed name." },
      { status: 400 },
    );
  }
  const v = recordVenueDiff(id, added, removed, iso);
  return NextResponse.json({
    ok: true,
    diffs: v?.diffs.length ?? 0,
    caterersNamed: v?.caterersNamed.length ?? 0,
  });
}
