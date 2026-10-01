import type { Metadata } from "next";
import { getSession } from "@/lib/portal/auth";
import { actionQueue, findStaffById, unreadForStaff } from "@/lib/portal/store";
import { getSignals, outreachStats, overdueProspects } from "@/lib/portal/lead-store";
import PortalNav from "@/components/portal/PortalNav";
import PageGuide from "@/components/portal/PageGuide";
import { DemoBanner } from "@/components/portal/Ui";
import "./portal.css";

export const metadata: Metadata = {
  title: { default: "The Kitchen Office", template: "%s · The Kitchen Office" },
  // Overrides the marketing description inherited from the root layout, and
  // strips the site-wide Open Graph card — neither belongs on a staff tool.
  description: "Bookings, guests, menus and marketing for Chef R. Kearse.",
  robots: { index: false, follow: false, nocache: true },
  openGraph: undefined,
  twitter: undefined,
};

/**
 * The portal shell.
 *
 * The login page lives under /portal/login and renders its own <main>, so this
 * layout deliberately does not gate — each page calls requireRole() itself and
 * the shell only draws navigation when there is a session. That keeps the
 * unauthenticated route free of any nav that hints at what is inside.
 */
export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  if (!session) {
    return <div className="portal-root">{children}</div>;
  }

  /*
   * The skip link lives here now.
   *
   * It used to come from SiteHeader, which the root layout put on every route —
   * including this one. Moving the marketing chrome into its own route group
   * fixed the portal rendering inside a restaurant header and footer, but it
   * also took the skip link with it, so the portal carries its own.
   */

  const user = findStaffById(session.userId);
  const queue = actionQueue();
  const relevant = queue.filter(
    (a) => a.owner === "either" || a.owner === session.role,
  );
  const unread = unreadForStaff().length;

  return (
    <div className={`portal-root portal-${session.role}`}>
      <a
        href="#portal-main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:bg-accent focus:px-4 focus:py-3 focus:text-white"
      >
        Skip to content
      </a>
      <div className="portal-frame">
        <PortalNav
          name={session.name}
          role={session.role}
          title={user?.title ?? ""}
          initials={user?.initials ?? "??"}
          actionCount={relevant.filter((a) => a.urgency === "overdue").length}
          unreadCount={unread}
          overdueCount={overdueProspects().length}
          signalCount={getSignals("new").length}
          draftCount={outreachStats().waiting}
        />
        <div className="portal-stage">
          <DemoBanner />
          <main id="portal-main" className="p-shell pb-24 pt-6 md:pb-16">
            {/*
              The plain-English guide for whatever page this is.

              Mounted once here rather than added to each page, because it reads
              the route itself — which means every page gets it, including any
              page added later, and there is one place to change how guidance
              behaves rather than fifteen.

              It sits above the page's own header on purpose: a first-time reader
              should meet the explanation before the data. It collapses itself
              permanently once closed, so a second visit is uncluttered.
            */}
            <div className="mb-6">
              <PageGuide role={session.role} />
            </div>
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
