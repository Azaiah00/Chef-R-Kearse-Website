import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/portal/auth";
import { regenerateQueue, setQueueStatus } from "@/lib/portal/store";

const schema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("status"),
    id: z.string().min(1).max(200),
    status: z.enum(["proposed", "approved", "sent", "skipped"]),
  }),
  z.object({
    action: z.literal("regenerate"),
    weekOf: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  }),
]);

export async function POST(request: Request) {
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
    return NextResponse.json({ ok: false, error: "Unrecognised action." }, { status: 400 });
  }

  if (parsed.data.action === "status") {
    // "sent" is reserved for the delivery job, not a human. Nobody should be able
    // to mark something sent from the interface — that would put a false record
    // in front of the chef.
    if (parsed.data.status === "sent") {
      return NextResponse.json(
        { ok: false, error: "Only the delivery job can mark something as sent." },
        { status: 403 },
      );
    }
    const item = setQueueStatus(parsed.data.id, parsed.data.status);
    if (!item) return NextResponse.json({ ok: false, error: "No such item." }, { status: 404 });
    return NextResponse.json({ ok: true });
  }

  regenerateQueue(parsed.data.weekOf);
  return NextResponse.json({ ok: true });
}
