"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { site } from "@/lib/site";

/**
 * The three things a phone visitor must reach in one tap.
 * Hidden on the booking page itself so it never competes with the form.
 */
export default function MobileCtaBar() {
  const pathname = usePathname();
  if (pathname === "/book") return null;

  return (
    <div className="no-print fixed inset-x-0 bottom-0 z-40 grid grid-cols-3 border-t border-line-dark bg-ink text-bone md:hidden">
      <Link
        href="/book"
        className="flex min-h-[60px] flex-col items-center justify-center gap-1 bg-accent text-white"
      >
        <span className="t-label">Check date</span>
      </Link>
      <Link
        href="/menus"
        className="flex min-h-[60px] flex-col items-center justify-center gap-1 border-x border-line-dark"
      >
        <span className="t-label">Menus</span>
      </Link>
      <a
        href={`tel:${site.contact.phoneHref}`}
        className="flex min-h-[60px] flex-col items-center justify-center gap-1"
      >
        <span className="t-label">Call</span>
      </a>
    </div>
  );
}
