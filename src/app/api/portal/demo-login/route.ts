import { NextResponse } from "next/server";
import { z } from "zod";
import {
  SESSION_COOKIE,
  SESSION_COOKIE_OPTIONS,
  encodeSession,
} from "@/lib/portal/auth";
import { isDemoMode } from "@/lib/portal/demo";
import { getStaff } from "@/lib/portal/store";

/**
 * ONE-TAP DEMO SIGN-IN
 *
 * Signs the caller in as a role — owner or assistant — with no credentials at
 * all, so the chef can be shown his own portal by tapping a button rather than
 * copying a password off the screen mid-conversation.
 *
 * It issues exactly the same signed, http-only session cookie the real sign-in
 * issues, so everything downstream — the role gates, the financial gate, the
 * middleware, every route handler — behaves identically. Nothing about the
 * portal's security model is special-cased for this path; the only thing
 * skipped is proving who you are.
 *
 * Which is, of course, the entire risk. So:
 *
 *   • It returns 404 when demo mode is off — not 403. With the flag off this
 *     endpoint should look like it was never built, because it should not be
 *     there at all.
 *   • It resolves the user from the real staff list by role, so it cannot mint
 *     a session for an account that does not exist.
 *   • It is rate limited like the real login, so it cannot be used to spray
 *     sessions at the app.
 *
 * Turning NEXT_PUBLIC_DEMO_MODE off removes this door completely. That is a
 * launch step, and it is the same moment real accounts get created.
 */

const schema = z.object({
  role: z.enum(["owner", "assistant"]),
});

const attempts = new Map<string, { count: number; first: number }>();
const WINDOW_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 30;

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const rec = attempts.get(ip);
  if (!rec || now - rec.first > WINDOW_MS) {
    attempts.set(ip, { count: 1, first: now });
    return false;
  }
  rec.count += 1;
  return rec.count > MAX_ATTEMPTS;
}

export async function POST(request: Request) {
  // With demo mode off this route does not exist.
  if (!isDemoMode()) {
    return NextResponse.json({ ok: false, error: "Not found." }, { status: 404 });
  }

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown";

  if (rateLimited(ip)) {
    return NextResponse.json(
      { ok: false, error: "Too many attempts. Wait a few minutes and try again." },
      { status: 429 },
    );
  }

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Malformed request." }, { status: 400 });
  }

  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Unrecognised role." }, { status: 400 });
  }

  // Resolved from the real staff list, never invented.
  const user = getStaff().find((u) => u.role === parsed.data.role);
  if (!user) {
    return NextResponse.json(
      { ok: false, error: "No account exists for that role." },
      { status: 404 },
    );
  }

  const response = NextResponse.json({ ok: true, role: user.role, name: user.name });
  response.cookies.set(SESSION_COOKIE, encodeSession(user), {
    ...SESSION_COOKIE_OPTIONS,
    secure: new URL(request.url).protocol === "https:",
  });
  return response;
}
