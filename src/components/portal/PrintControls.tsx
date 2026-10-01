"use client";

import Link from "next/link";

/**
 * Print and back.
 *
 * It does NOT auto-print on mount. A print dialog nobody asked for is hostile —
 * it steals focus, it is confusing on a phone, and a screen reader announces a
 * modal that appeared for no reason. Offer the button; let the person press it.
 */
export default function PrintControls({ backHref }: { backHref: string }) {
  return (
    <div className="print-controls">
      <button type="button" className="print-btn print-btn-primary" onClick={() => window.print()}>
        Print this
      </button>
      <Link href={backHref} className="print-btn">
        Back
      </Link>
      <span className="print-hint">
        Your browser&apos;s print dialog also offers &ldquo;Save as PDF&rdquo;.
      </span>
    </div>
  );
}
