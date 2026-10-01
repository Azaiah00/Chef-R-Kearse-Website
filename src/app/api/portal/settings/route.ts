import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/portal/auth";
import { resetDemoData, setAssistantSeesFinancials } from "@/lib/portal/store";

const schema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("assistant-financials"), value: z.boolean() }),
  z.object({ action: z.literal("reset-demo") }),
]);

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ ok: false, error: "Not signed in." }, { status: 401 });

  // Settings are the owner's alone. Checked here as well as on the page, because
  // a route handler is reachable directly.
  if (session.role !== "owner") {
    return NextResponse.json({ ok: false, error: "Not your settings to change." }, { status: 403 });
  }

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Malformed request." }, { status: 400 });
  }

  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Unrecognised setting." }, { status: 400 });
  }

  if (parsed.data.action === "assistant-financials") {
    setAssistantSeesFinancials(parsed.data.value);
  } else {
    resetDemoData();
  }

  return NextResponse.json({ ok: true });
}
