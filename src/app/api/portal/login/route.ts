import { NextResponse } from "next/server";
import { z } from "zod";
import {
  SESSION_COOKIE,
  SESSION_COOKIE_OPTIONS,
  encodeSession,
  safeEqual,
} from "@/lib/portal/auth";
import { findStaffByEmail } from "@/lib/portal/store";

const schema = z.object({
  email: z.string().trim().min(3).max(200),
  password: z.string().min(1).max(200),
});

/**
 * Very small rate limit, per IP. In-memory, so it resets with the server — the
 * same honest limitation the store carries. Production moves this to the edge
 * or to Postgres alongside real auth.
 */
const attempts = new Map<string, { count: number; first: number }>();
const WINDOW_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 10;

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

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Malformed request." }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "Enter an email address and a password." },
      { status: 400 },
    );
  }

  const user = findStaffByEmail(parsed.data.email);

  // One message for both failure modes, so the response never reveals which
  // addresses exist.
  const rejection = NextResponse.json(
    { ok: false, error: "No account matches that email and password." },
    { status: 401 },
  );

  if (!user) {
    // Still spend the comparison so timing does not distinguish the two paths.
    safeEqual(parsed.data.password, "constant-time-padding-value");
    return rejection;
  }
  if (!safeEqual(parsed.data.password, user.demoPassword)) return rejection;

  const response = NextResponse.json({ ok: true, role: user.role });
  response.cookies.set(SESSION_COOKIE, encodeSession(user), {
    ...SESSION_COOKIE_OPTIONS,
    secure: new URL(request.url).protocol === "https:",
  });
  return response;
}
