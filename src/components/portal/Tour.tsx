"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { StaffRole } from "@/lib/portal/types";
import { tourFor } from "@/lib/portal/guide-content";
import { IconArrowRight, IconCheck, IconSpark } from "./Icons";

/**
 * The guided walk-through.
 *
 * Offered once, on the first visit, as a small invitation rather than a modal
 * that seizes the screen — somebody who already knows what they are doing should
 * be able to ignore it without clicking anything. Once dismissed or finished it
 * never offers itself again, but the "Show me around" button in the sidebar
 * footer always restarts it, so nobody is ever stuck having said no too early.
 *
 * Accessibility: it is a real dialog with role="dialog" and aria-modal, focus
 * moves into it on open and returns to the trigger on close, Escape closes it,
 * and Tab is trapped inside while it is open. Those four things are what make a
 * dialog usable without a mouse, and leaving any of them out is how a keyboard
 * user gets stranded.
 */

const SEEN_KEY = "rk-tour-done";

function tourDone(): boolean {
  try {
    return window.localStorage.getItem(SEEN_KEY) === "1";
  } catch {
    return true; // Storage unavailable: do not nag on every page load.
  }
}

function markTourDone(): void {
  try {
    window.localStorage.setItem(SEEN_KEY, "1");
  } catch {
    /* nothing to do */
  }
}

export default function Tour({
  role,
  autoOffer = false,
  label = "Show me around",
}: {
  role: StaffRole;
  /** True on the landing page only, so the invitation appears once. */
  autoOffer?: boolean;
  label?: string;
}) {
  const steps = tourFor(role);
  const [open, setOpen] = useState(false);
  const [offer, setOffer] = useState(false);
  const [i, setI] = useState(0);
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (autoOffer && !tourDone()) setOffer(true);
  }, [autoOffer]);

  const close = useCallback(() => {
    setOpen(false);
    markTourDone();
    setOffer(false);
    triggerRef.current?.focus();
  }, []);

  // Escape to close, and keep Tab inside the dialog while it is open.
  useEffect(() => {
    if (!open) return;
    const panel = panelRef.current;
    panel?.querySelector<HTMLElement>("[data-tour-focus]")?.focus();

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
        return;
      }
      if (e.key !== "Tab" || !panel) return;
      const focusable = panel.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, i, close]);

  const step = steps[i];
  const last = i === steps.length - 1;

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className="p-btn p-btn-sm w-full"
        onClick={() => {
          setI(0);
          setOffer(false);
          setOpen(true);
        }}
      >
        <IconSpark className="h-4 w-4" />
        {label}
      </button>

      {/* The one-time invitation. A line of text and two buttons, not a modal. */}
      {offer && !open ? (
        <div className="p-tour-offer" role="status">
          <p className="text-[0.8125rem] leading-snug">
            First time here? There is a short walk-through — eight screens, about two
            minutes.
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              type="button"
              className="p-btn p-btn-sm p-btn-primary"
              onClick={() => {
                setI(0);
                setOffer(false);
                setOpen(true);
              }}
            >
              Show me
            </button>
            <button
              type="button"
              className="p-btn p-btn-sm"
              onClick={() => {
                setOffer(false);
                markTourDone();
              }}
            >
              Not now
            </button>
          </div>
        </div>
      ) : null}

      {open ? (
        <>
          <div className="p-tour-scrim" onClick={close} aria-hidden="true" />
          <div
            className="p-tour"
            role="dialog"
            aria-modal="true"
            aria-labelledby="tour-title"
            ref={panelRef}
          >
            <p className="p-title">
              Step {i + 1} of {steps.length}
            </p>
            <h2 id="tour-title" className="p-tour-title">
              {step.title}
            </h2>
            <p className="p-tour-body">{step.body}</p>

            {step.href ? (
              <Link href={step.href} className="p-btn p-btn-sm mt-4" onClick={close}>
                {step.linkLabel ?? "Take me there"}
                <IconArrowRight className="h-4 w-4" />
              </Link>
            ) : null}

            <div className="p-tour-foot">
              <button
                type="button"
                className="p-btn p-btn-sm"
                onClick={close}
                data-tour-focus
              >
                Close
              </button>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="p-btn p-btn-sm"
                  onClick={() => setI((n) => Math.max(0, n - 1))}
                  disabled={i === 0}
                >
                  Back
                </button>
                {last ? (
                  <button type="button" className="p-btn p-btn-sm p-btn-primary" onClick={close}>
                    <IconCheck className="h-4 w-4" />
                    Done
                  </button>
                ) : (
                  <button
                    type="button"
                    className="p-btn p-btn-sm p-btn-primary"
                    onClick={() => setI((n) => Math.min(steps.length - 1, n + 1))}
                  >
                    Next
                    <IconArrowRight className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </>
      ) : null}
    </>
  );
}
