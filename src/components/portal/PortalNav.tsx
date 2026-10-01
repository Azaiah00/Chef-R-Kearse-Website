"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import type { StaffRole } from "@/lib/portal/types";
import {
  IconArrowRight,
  IconCalendar,
  IconCart,
  IconChat,
  IconClipboard,
  IconClock,
  IconFlame,
  IconGauge,
  IconInbox,
  IconLock,
  IconLogout,
  IconMail,
  IconMegaphone,
  IconMenuBook,
  IconSettings,
  IconSpark,
  IconUsers,
} from "./Icons";
import Tour from "./Tour";

interface NavItem {
  href: string;
  label: string;
  icon: (p: { className?: string }) => React.ReactElement;
  /** Which roles see it. Empty means both. */
  roles?: StaffRole[];
  badge?: "actions" | "unread" | "overdue" | "signals" | "drafts";
}

interface NavGroup {
  /** Null for the first group, which needs no label above the first item. */
  heading: string | null;
  items: NavItem[];
}

/**
 * The two roles get different navigation, in a different order, because they do
 * different jobs.
 *
 * The owner opens this to answer "what is the state of my business and what
 * needs me" — so he lands on the dashboard and his second item is the pipeline.
 *
 * The assistant opens it to answer "what do I have to get done" — so she lands
 * on her desk, and the first three items are all work queues. She does not get
 * a Money tab at all, and the pipeline she sees shows no revenue figures unless
 * the owner switches that on in Settings.
 *
 * ── WHY THESE ARE GROUPED ───────────────────────────────────────────────────
 * The outbound engine took the owner's rail from eight items to fifteen, and a
 * flat list of fifteen is a list nobody reads — the eye gives up around nine.
 *
 * The split is not cosmetic, it is the actual mental model: "Work coming in" is
 * everything where somebody contacted him, "Finding work" is everything where we
 * go and get it, and "Setup" is the things you touch rarely. Somebody who knows
 * which of those three they want can find the tab without reading the others.
 *
 * The headings use .p-title, the same micro-caps already used on every card in
 * the portal, so this adds a level of structure without adding a new look.
 */
const OWNER_NAV: NavGroup[] = [
  {
    heading: null,
    items: [
      { href: "/portal", label: "Dashboard", icon: IconGauge, badge: "actions" },
      { href: "/portal/briefing", label: "Monday briefing", icon: IconSpark, badge: "overdue" },
    ],
  },
  {
    heading: "Work coming in",
    items: [
      { href: "/portal/leads", label: "Pipeline", icon: IconUsers },
      { href: "/portal/messages", label: "Messages", icon: IconChat, badge: "unread" },
      { href: "/portal/events", label: "Events", icon: IconCalendar },
      { href: "/portal/menus", label: "Menus", icon: IconMenuBook },
    ],
  },
  {
    heading: "Finding work",
    items: [
      { href: "/portal/prospects", label: "Prospects", icon: IconFlame },
      { href: "/portal/signals", label: "This week's finds", icon: IconArrowRight, badge: "signals" },
      { href: "/portal/venues", label: "Venues", icon: IconCart },
      { href: "/portal/outreach", label: "Letters", icon: IconMail, badge: "drafts" },
    ],
  },
  {
    heading: "Setup",
    items: [
      { href: "/portal/marketing", label: "Marketing", icon: IconMegaphone },
      { href: "/portal/audience", label: "Mailing list", icon: IconInbox },
      { href: "/portal/brain", label: "Kitchen Brain", icon: IconLock },
      { href: "/portal/sweeps", label: "Search history", icon: IconClock },
      { href: "/portal/settings", label: "Settings", icon: IconSettings },
    ],
  },
];

const ASSISTANT_NAV: NavGroup[] = [
  {
    heading: null,
    items: [
      { href: "/portal", label: "My desk", icon: IconClipboard, badge: "actions" },
      { href: "/portal/briefing", label: "Monday briefing", icon: IconSpark, badge: "overdue" },
    ],
  },
  {
    heading: "Work coming in",
    items: [
      { href: "/portal/messages", label: "Messages", icon: IconChat, badge: "unread" },
      { href: "/portal/leads", label: "Enquiries", icon: IconUsers },
      { href: "/portal/events", label: "Events", icon: IconCalendar },
      { href: "/portal/menus", label: "Menus", icon: IconMenuBook },
    ],
  },
  {
    heading: "Finding work",
    items: [
      { href: "/portal/prospects", label: "Call list", icon: IconFlame },
      { href: "/portal/signals", label: "This week's finds", icon: IconArrowRight, badge: "signals" },
      { href: "/portal/venues", label: "Venues", icon: IconCart },
      { href: "/portal/outreach", label: "Letters", icon: IconMail, badge: "drafts" },
    ],
  },
  {
    heading: "Setup",
    items: [
      { href: "/portal/marketing", label: "Marketing", icon: IconMegaphone },
      { href: "/portal/audience", label: "Mailing list", icon: IconInbox },
    ],
  },
];

export default function PortalNav({
  name,
  role,
  title,
  initials,
  actionCount,
  unreadCount,
  overdueCount = 0,
  signalCount = 0,
  draftCount = 0,
}: {
  name: string;
  role: StaffRole;
  title: string;
  initials: string;
  actionCount: number;
  unreadCount: number;
  overdueCount?: number;
  signalCount?: number;
  draftCount?: number;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const groups = role === "owner" ? OWNER_NAV : ASSISTANT_NAV;

  const isCurrent = (href: string) =>
    href === "/portal" ? pathname === "/portal" : pathname.startsWith(href);

  const badgeFor = (item: NavItem): number => {
    if (item.badge === "actions") return actionCount;
    if (item.badge === "unread") return unreadCount;
    if (item.badge === "overdue") return overdueCount;
    if (item.badge === "signals") return signalCount;
    if (item.badge === "drafts") return draftCount;
    return 0;
  };

  async function signOut() {
    await fetch("/api/portal/logout", { method: "POST" });
    router.replace("/portal/login");
    router.refresh();
  }

  function links(onPick?: () => void) {
    return groups.map((group) => (
      <li key={group.heading ?? "top"}>
        {group.heading ? (
          <p className="p-nav-heading" aria-hidden="true">
            {group.heading}
          </p>
        ) : null}
        {/* A labelled sub-list, so a screen reader hears the grouping rather
            than one undifferentiated run of fifteen links. */}
        <ul aria-label={group.heading ?? undefined} className="flex flex-col gap-1">
          {group.items.map((item) => {
            const count = badgeFor(item);
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onPick}
                  className="p-nav-link"
                  aria-current={isCurrent(item.href) ? "page" : undefined}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="min-w-0 flex-1">{item.label}</span>
                  {count > 0 ? (
                    <span className="p-badge p-band-B" aria-label={`${count} needing attention`}>
                      {count}
                    </span>
                  ) : null}
                </Link>
              </li>
            );
          })}
        </ul>
      </li>
    ));
  }

  function identity() {
    return (
      <div className="flex items-center gap-3 px-2">
        <span className="p-avatar" aria-hidden="true">
          {initials}
        </span>
        <div className="min-w-0">
          <p className="truncate text-[0.8125rem] leading-tight font-medium">{name}</p>
          <p className="p-role-pill truncate">{title}</p>
        </div>
      </div>
    );
  }

  const rail = (drawer: boolean) => (
    <>
      <Link href="/portal" className="px-2" aria-label="The Kitchen Office — home">
        <Image
          src="/images/brand/logo-bone.png"
          alt=""
          width={440}
          height={125}
          className="h-8 w-[113px]"
          priority
        />
      </Link>
      <nav aria-label="Portal" className="mt-5 min-h-0 flex-1 overflow-y-auto">
        <ul className="flex flex-col">{links(drawer ? () => setOpen(false) : undefined)}</ul>
      </nav>
      <div className="mt-4 space-y-3 border-t border-[color:color-mix(in_srgb,#fff_8%,transparent)] pt-4">
        {/*
          Help sits above the identity block, at the bottom of the rail, because
          that is where somebody looks when they are stuck — and because putting
          it at the top would make a confident user feel talked down to.

          "Start here" is a real page they can return to; the walk-through offers
          itself once on the first visit and is always restartable from here.
        */}
        <Link
          href="/portal/start"
          onClick={drawer ? () => setOpen(false) : undefined}
          className="p-nav-link"
          aria-current={pathname.startsWith("/portal/start") ? "page" : undefined}
        >
          <IconSpark className="h-4 w-4 shrink-0" />
          <span className="min-w-0 flex-1">Start here</span>
        </Link>
        <Tour role={role} autoOffer />
        {identity()}
        <button type="button" onClick={signOut} className="p-btn p-btn-sm w-full" aria-label="Sign out">
          <IconLogout className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Phone: a thin bar. The tabs live in a drawer so the desk stays full width. */}
      <header className="p-topbar sticky top-0 z-40 lg:hidden">
        <div className="flex items-center gap-3 px-4 py-3">
          <Link href="/portal" className="shrink-0" aria-label="The Kitchen Office — home">
            <Image
              src="/images/brand/logo-bone.png"
              alt=""
              width={440}
              height={125}
              className="h-8 w-[113px]"
              priority
            />
          </Link>
          <div className="ml-auto flex items-center gap-2">
            <span className="p-avatar" aria-hidden="true">
              {initials}
            </span>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="portal-mobile-nav"
              className="p-btn p-btn-sm"
            >
              {open ? "Close" : "Menu"}
            </button>
          </div>
        </div>
      </header>

      <aside className="p-sidebar hidden lg:flex">{rail(false)}</aside>

      {open ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 bg-black/55 lg:hidden"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
          />
          <aside id="portal-mobile-nav" className="p-sidebar p-sidebar-drawer lg:hidden">
            {rail(true)}
          </aside>
        </>
      ) : null}
    </>
  );
}
