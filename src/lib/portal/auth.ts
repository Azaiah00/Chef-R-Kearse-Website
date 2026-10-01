/**
 * DEMO AUTHENTICATION
 *
 * Deliberately small, and deliberately not Google/OAuth — that comes later.
 * What this does give you is a real session mechanism rather than a fake one:
 * an HMAC-SHA256 signed, httpOnly, sameSite=lax cookie with an expiry, verified
 * in constant time. Nothing client-side can forge or read it.
 *
 * WHAT THIS IS NOT, stated plainly so nobody mistakes it for production auth:
 *   • Passwords are demo constants in seed.ts, compared in constant time but
 *     not hashed at rest. There is no signup, reset, lockout or 2FA.
 *   • The signing secret falls back to a build-time constant when
 *     PORTAL_SESSION_SECRET is unset, so a public deployment MUST set it.
 *   • There is no per-request database check, so revoking a session means
 *     waiting for the cookie to expire.
 *
 * Swapping in Supabase Auth or an OIDC provider replaces this one file plus the
 * login route. Every other portal file reads the session through
 * `getSession()` / `requireRole()` and does not care where it came from.
 * See PORTAL.md → "Replacing demo auth".
 */

import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import type { Session, StaffRole, StaffUser } from "./types";

export const SESSION_COOKIE = "rk_portal_session";
export const CLIENT_COOKIE = "rk_client_token";

/** Eight hours — one long service day. */
const SESSION_TTL_SECONDS = 8 * 60 * 60;

function secret(): string {
  return (
    process.env.PORTAL_SESSION_SECRET ??
    // Demo fallback. Set PORTAL_SESSION_SECRET before any public deployment.
    "chef-r-kearse-demo-portal-secret-do-not-use-in-production"
  );
}

function b64url(input: Buffer | string): string {
  return Buffer.from(input)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function unb64url(input: string): Buffer {
  const pad = input.length % 4 === 0 ? "" : "=".repeat(4 - (input.length % 4));
  return Buffer.from(input.replace(/-/g, "+").replace(/_/g, "/") + pad, "base64");
}

function sign(payload: string): string {
  return b64url(createHmac("sha256", secret()).update(payload).digest());
}

/** Constant-time string compare that never throws on length mismatch. */
export function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a, "utf8");
  const bb = Buffer.from(b, "utf8");
  if (ab.length !== bb.length) {
    // Still do a comparison so the timing profile does not leak length.
    timingSafeEqual(ab, ab);
    return false;
  }
  return timingSafeEqual(ab, bb);
}

export function encodeSession(user: StaffUser, now: Date = new Date()): string {
  const session: Session = {
    userId: user.id,
    role: user.role,
    name: user.name,
    exp: Math.floor(now.getTime() / 1000) + SESSION_TTL_SECONDS,
  };
  const payload = b64url(JSON.stringify(session));
  return `${payload}.${sign(payload)}`;
}

export function decodeSession(token: string | undefined, now: Date = new Date()): Session | null {
  if (!token) return null;
  const dot = token.lastIndexOf(".");
  if (dot <= 0) return null;

  const payload = token.slice(0, dot);
  const signature = token.slice(dot + 1);
  if (!safeEqual(signature, sign(payload))) return null;

  try {
    const session = JSON.parse(unb64url(payload).toString("utf8")) as Session;
    if (typeof session.exp !== "number" || session.exp * 1000 < now.getTime()) return null;
    if (session.role !== "owner" && session.role !== "assistant") return null;
    if (typeof session.userId !== "string" || typeof session.name !== "string") return null;
    return session;
  } catch {
    return null;
  }
}

/** Reads and verifies the staff session from the request cookies. */
export async function getSession(): Promise<Session | null> {
  const jar = await cookies();
  return decodeSession(jar.get(SESSION_COOKIE)?.value);
}

/**
 * Throws if there is no session, or if the session's role is not allowed.
 * Portal pages call this at the top; the layout redirects on null.
 */
export async function requireRole(...allowed: StaffRole[]): Promise<Session> {
  const session = await getSession();
  if (!session) throw new Error("UNAUTHENTICATED");
  if (allowed.length > 0 && !allowed.includes(session.role)) throw new Error("FORBIDDEN");
  return session;
}

export const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax" as const,
  path: "/",
  maxAge: SESSION_TTL_SECONDS,
  // Secure is set by the route handler based on the request protocol so the
  // demo still works over plain http://localhost.
};

/** Opaque single-purpose token for a client-portal magic link. */
export function newClientToken(): string {
  return b64url(randomBytes(18));
}
