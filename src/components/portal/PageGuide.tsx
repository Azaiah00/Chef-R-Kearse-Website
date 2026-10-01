"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { StaffRole } from "@/lib/portal/types";
import { TERMS, guideFor } from "@/lib/portal/guide-content";
import { IconChevron, IconSpark } from "./Icons";

/**
 * The "what this page is for" panel.
 *
 * Design decisions worth keeping:
 *
 * It is OPEN by default the first time somebody sees a page, and closed on every
 * visit after that. A help panel you have to find is a help panel nobody reads,
 * and one that never goes away is an insult. Remembering per-page means the chef
 * gets the explanation exactly once on each screen and then gets his screen back.
 *
 * The open/closed state lives in localStorage, wrapped in try/catch because it
 * throws in a private window and comes back empty after cleared site data. If it
 * is unavailable the panel simply opens every time, which is the safe failure.
 *
 * It is a <details> element so it works with a keyboard and a screen reader
 * without any of that being hand-built, and so its contents stay out of the tab
 * order while closed.
 */

const KEY_PREFIX = "rk-guide-seen:";

function hasSeen(route: string): boolean {
  try {
    return window.localStorage.getItem(KEY_PREFIX + route) === "1";
  } catch {
    return false;
  }
}

function markSeen(route: string): void {
  try {
    window.localStorage.setItem(KEY_PREFIX + route, "1");
  } catch {
    // Private window, blocked storage, or a preview. The panel just reopens next
    // time, which is the right way for this to fail.
  }
}

/**
 * Finds the guide for a path, walking up a segment at a time.
 *
 * So /portal/leads/l_001 shows the guide for /portal/leads, and a page with no
 * guide of its own inherits its section's. Stops above /portal, which has its own
 * guide, so there is always either a match or a clean miss.
 */
function resolveGuide(pathname: string, role: StaffRole) {
  const parts = pathname.replace(/\/+$/, "").split("/");
  for (let n = parts.length; n >= 2; n--) {
    const route = parts.slice(0, n).join("/");
    const guide = guideFor(route, role);
    // Skip a guide this reader is not meant to see and keep walking, so the
    // assistant falls through to the section's guide rather than getting
    // nothing. Stopping here would make a role-restricted guide blank the page
    // for everyone else.
    if (guide && (!guide.roles || guide.roles.includes(role))) return { route, guide };
  }
  return { route: pathname, guide: undefined };
}

export default function PageGuide({ role }: { role: StaffRole }) {
  const pathname = usePathname() ?? "";
  const { route, guide } = resolveGuide(pathname, role);
  // Server and first client render must agree, so start closed and open after
  // mount if this is a first visit. Opening in an effect avoids a hydration
  // mismatch on the details element's open attribute.
  const [open, setOpen] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!guide) return;
    if (!hasSeen(route)) setOpen(true);
    setReady(true);
  }, [guide, route]);

  if (!guide) return null;
  if (guide.roles && !guide.roles.includes(role)) return null;

  return (
    <details
      className="p-guide"
      open={open}
      onToggle={(e) => {
        const next = (e.currentTarget as HTMLDetailsElement).open;
        setOpen(next);
        // Mark it seen on the first close, not on open — closing it is the
        // signal that they are done reading.
        if (!next && ready) markSeen(route);
      }}
    >
      <summary className="p-guide-summary">
        <IconSpark className="h-4 w-4 shrink-0" />
        <span className="flex-1">{guide.heading} — what this page is for</span>
        <IconChevron className="p-guide-chevron h-4 w-4 shrink-0" />
      </summary>

      <div className="p-guide-body">
        <p className="p-guide-lead">{guide.oneLine}</p>

        <h3 className="p-guide-h">What you are looking at</h3>
        <ul className="p-guide-list">
          {guide.whatYouSee.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>

        <h3 className="p-guide-h">Do this first</h3>
        <p className="p-guide-do">{guide.doFirst}</p>

        {guide.terms.length > 0 ? (
          <>
            <h3 className="p-guide-h">Words on this page</h3>
            <dl className="p-guide-terms">
              {guide.terms.map((key) => {
                const t = TERMS[key];
                if (!t) return null;
                return (
                  <div key={key}>
                    <dt>{t.term}</dt>
                    <dd>
                      {t.plain}
                      {t.why ? <span className="p-guide-why"> {t.why}</span> : null}
                    </dd>
                  </div>
                );
              })}
            </dl>
          </>
        ) : null}
      </div>
    </details>
  );
}
