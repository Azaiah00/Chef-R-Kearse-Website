"use client";

import { useEffect, useRef } from "react";
import { loadMotion, prefersReducedMotion } from "@/lib/motion";

/**
 * The signature move. A crimson hairline draws left-to-right as the rule
 * scrolls through the viewport — the red sweep under the blade in his logo,
 * repeated as the section divider for the whole site.
 */
export default function BladeRule({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (prefersReducedMotion()) {
      el.style.setProperty("--blade-progress", "100%");
      return;
    }

    let cancelled = false;
    let revert: (() => void) | undefined;

    loadMotion().then(({ gsap, ScrollTrigger }) => {
      if (cancelled || !ref.current) return;
      const node = ref.current;
      const ctx = gsap.context(() => {
        gsap.fromTo(
          node,
          { "--blade-progress": "0%" },
          {
            "--blade-progress": "100%",
            ease: "none",
            scrollTrigger: {
              trigger: node,
              start: "top 92%",
              end: "top 42%",
              scrub: 0.6,
            },
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
  }, []);

  return <div ref={ref} className={`blade-rule ${className}`} aria-hidden="true" />;
}
