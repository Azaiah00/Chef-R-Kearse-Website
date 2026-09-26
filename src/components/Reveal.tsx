"use client";

import { useEffect, useRef, type ElementType, type ReactNode } from "react";
import { loadMotion, prefersReducedMotion } from "@/lib/motion";

interface RevealProps {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  /** Seconds of delay before this element starts */
  delay?: number;
  /** Stagger direct children instead of animating the wrapper */
  stagger?: number;
  /** Distance travelled, px */
  y?: number;
  id?: string;
}

/**
 * Scroll-triggered rise. Runs at every breakpoint — mobile included — because
 * it only touches transform and opacity, so it stays on the compositor.
 * Content is visible in the markup; the animation hides it only once GSAP has
 * loaded, so a failed script leaves a readable page rather than a blank one.
 */
export default function Reveal({
  children,
  as: Tag = "div",
  className = "",
  delay = 0,
  stagger,
  y = 26,
  id,
}: RevealProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;

    let cancelled = false;
    let revert: (() => void) | undefined;

    loadMotion().then(({ gsap, ScrollTrigger }) => {
      if (cancelled || !ref.current) return;
      const node = ref.current;
      const targets: Element[] =
        stagger !== undefined ? Array.from(node.children) : [node];
      if (!targets.length) return;

      // Only hide what is still below the fold — anything already on screen
      // stays put rather than flashing out and back in.
      const box = node.getBoundingClientRect();
      if (box.top < window.innerHeight * 0.9) return;

      const ctx = gsap.context(() => {
        gsap.fromTo(
          targets,
          { autoAlpha: 0, y },
          {
            autoAlpha: 1,
            y: 0,
            duration: 1,
            delay,
            ease: "expo.out",
            stagger: stagger ?? 0,
            scrollTrigger: { trigger: node, start: "top 88%", once: true },
          }
        );
      }, node);

      ScrollTrigger.refresh();
      revert = () => ctx.revert();
    });

    return () => {
      cancelled = true;
      revert?.();
    };
  }, [delay, stagger, y]);

  return (
    <Tag id={id} ref={ref as React.Ref<HTMLElement>} className={className}>
      {children}
    </Tag>
  );
}
