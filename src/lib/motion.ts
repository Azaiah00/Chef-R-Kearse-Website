"use client";

import type { gsap as GsapType } from "gsap";
import type { ScrollTrigger as ScrollTriggerType } from "gsap/ScrollTrigger";

export interface Motion {
  gsap: typeof GsapType;
  ScrollTrigger: typeof ScrollTriggerType;
}

let ready: Promise<Motion> | null = null;

/**
 * GSAP is ~45KB and nothing above the fold needs it to render. Loading it as a
 * dynamic import keeps it out of the initial bundle, so hydration finishes
 * before the animation code is even parsed. Every caller awaits the same
 * promise, so it is fetched once.
 */
export function loadMotion(): Promise<Motion> {
  if (ready) return ready;
  ready = Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(
    ([{ gsap }, { ScrollTrigger }]) => {
      gsap.registerPlugin(ScrollTrigger);
      ScrollTrigger.config({ ignoreMobileResize: true });
      return { gsap, ScrollTrigger };
    }
  );
  return ready;
}

export function prefersReducedMotion() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Desktop-only behaviours (scroll-driven horizontal travel) gate on this. */
export function isDesktop() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(min-width: 1024px) and (pointer: fine)").matches;
}

/** Run a callback once the browser is idle, with a hard ceiling. */
export function onIdle(fn: () => void, timeout = 1200) {
  if (typeof window === "undefined") return () => {};
  const w = window as Window & {
    requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number;
    cancelIdleCallback?: (id: number) => void;
  };
  if (typeof w.requestIdleCallback === "function") {
    const id = w.requestIdleCallback(fn, { timeout });
    return () => w.cancelIdleCallback?.(id);
  }
  const id = window.setTimeout(fn, 200);
  return () => window.clearTimeout(id);
}

/**
 * Splits a string into words for the masked heading reveal. Returned as data so
 * the spans can be rendered by React on the server — mutating a heading's DOM
 * after hydration changes its line box and shifts everything below it, which is
 * exactly the layout shift this site is not allowed to have.
 */
export function toWords(text: string): string[] {
  return text.split(/(\s+)/).filter((chunk) => chunk.length > 0);
}
