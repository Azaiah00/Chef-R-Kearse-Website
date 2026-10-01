import { redirect } from "next/navigation";
import { getSession } from "./auth";
import type { Session, StaffRole } from "./types";

/**
 * Page-level gate for server components.
 *
 * Every page under /portal calls this first. No session means a redirect to the
 * login screen rather than a thrown error, so a staff member whose cookie has
 * simply expired gets a sign-in box instead of an error page.
 */
export async function requireStaff(): Promise<Session> {
  const session = await getSession();
  if (!session) redirect("/portal/login");
  return session;
}

/**
 * As above, but also enforces a role.
 *
 * Role isolation is checked HERE, on the server, before any data is read — not
 * by hiding a link in the navigation. An assistant who types /portal/money into
 * the address bar is redirected, because the page never renders for her, and the
 * revenue figures are never fetched or sent to her browser at all.
 */
export async function requireRolePage(...allowed: StaffRole[]): Promise<Session> {
  const session = await requireStaff();
  if (allowed.length > 0 && !allowed.includes(session.role)) redirect("/portal");
  return session;
}
