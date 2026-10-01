import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * PORTAL ROUTE GATE
 *
 * Why this exists, given every portal page already calls `requireStaff()`:
 *
 * A `redirect()` inside a server component fires AFTER the layout above it has
 * begun streaming. Next cannot un-send those bytes, so instead of an HTTP 307 it
 * appends `<meta http-equiv="refresh" content="1;url=/portal/login">` and
 * returns 200. No portal data leaks — the page never renders — but a signed-out
 * visitor sits on a blank shell for a second before being bounced, and anything
 * that reads status codes rather than HTML believes the page exists.
 *
 * Middleware runs before any rendering, so it issues a real 307 immediately.
 *
 * ── DIVISION OF LABOUR, STATED CLEARLY ──────────────────────────────────────
 * This middleware checks only that a session cookie is PRESENT. It does not
 * verify the signature, because middleware runs in the Edge runtime where
 * `node:crypto` and its constant-time comparison are unavailable.
 *
 * That is deliberate and it is safe, because verification still happens in two
 * places that cannot be bypassed:
 *   • every portal page, through `requireStaff()` / `requireRolePage()`
 *   • every portal route handler, through `getSession()`
 *
 * So a forged or expired cookie gets past this middleware and is then rejected
 * by the page or the API. Middleware is here for routing and for the visitor's
 * experience; it is not the security boundary, and nothing should ever be
 * written that assumes it is.
 */

const SESSION_COOKIE = "rk_portal_session";

/** Pages only the owner should reach. Enforced properly by the page itself. */
/**
 * Owner-only paths.
 *
 * The Kitchen Brain is here because it is the one page where an unconfirmed fact
 * becomes a confirmed one, and every proposal and venue application reads from
 * it — the assistant must not be able to assert a credential she has no way to
 * verify. Sweeps is here because it is the engine's own working record.
 */
const OWNER_ONLY = ["/portal/settings", "/portal/brain", "/portal/sweeps"];

/**
 * Reads the role out of the session cookie WITHOUT verifying its signature.
 *
 * This is safe for exactly one purpose — deciding where to send a browser — and
 * for nothing else. The Edge runtime has no `node:crypto`, so the signature
 * cannot be checked here. Somebody could hand-craft a cookie claiming
 * `role: "owner"` and get past this function; they would then hit
 * `requireRolePage("owner")` on the page itself, which verifies the signature
 * properly and bounces them.
 *
 * So: this is a routing hint. It is never an authorisation decision.
 */
function unverifiedRole(token: string | undefined): string | null {
  if (!token) return null;
  const dot = token.lastIndexOf(".");
  if (dot <= 0) return null;
  try {
    const payload = token.slice(0, dot);
    const pad = payload.length % 4 === 0 ? "" : "=".repeat(4 - (payload.length % 4));
    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/") + pad);
    const parsed = JSON.parse(json) as { role?: unknown };
    return typeof parsed.role === "string" ? parsed.role : null;
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const cookie = request.cookies.get(SESSION_COOKIE)?.value;
  const hasCookie = cookie !== undefined;

  // The sign-in page is the one portal route a signed-out visitor should reach.
  if (pathname === "/portal/login") {
    if (hasCookie) {
      // Already signed in: send them to the dashboard rather than a login form.
      // If the cookie turns out to be invalid, the dashboard's own gate bounces
      // them straight back here and the cookie is replaced on the next sign-in.
      return NextResponse.redirect(new URL("/portal", request.url));
    }
    return NextResponse.next();
  }

  if (!hasCookie) {
    const url = new URL("/portal/login", request.url);
    // A printable document is staff-only too, so a signed-out visitor goes to
    // the same sign-in page rather than seeing a letter.
    // Remember where they were heading so sign-in can return them there once
    // the production auth flow supports it.
    if (pathname !== "/portal") url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  // Send a non-owner away from owner-only pages with a real 307, so the
  // assistant never sees a blank shell before being bounced. The page's own
  // `requireRolePage("owner")` is what actually enforces this.
  if (OWNER_ONLY.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    if (unverifiedRole(cookie) !== "owner") {
      return NextResponse.redirect(new URL("/portal", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  /**
   * Portal pages only.
   *
   * Deliberately excluded:
   *   • /api/portal/* — route handlers return a JSON 401, which is the correct
   *     answer for a fetch. A 307 to an HTML login page would break the client.
   *   • /my-event/* — guests authenticate with a magic-link token in the path,
   *     not a cookie, and must never be sent to a staff sign-in screen.
   *   • everything public.
   */
  // /print carries the printable staff documents. They live outside /portal
  // because a print page must escape the portal layout — a letter should not
  // arrive with a sidebar on it — but they are staff-only all the same, so the
  // routing gate covers them too. Each page still calls requireStaff() itself;
  // this middleware is a convenience, never the boundary.
  matcher: ["/portal", "/portal/:path*", "/print", "/print/:path*"],
};
