"use client";

import { useEffect, useRef } from "react";
import { loadMotion, prefersReducedMotion } from "@/lib/motion";

interface Props {
  to: number;
  prefix?: string;
  suffix?: string;
  className?: string;
  duration?: number;
}

export default function CountUp({
  to,
  prefix = "",
  suffix = "",
  className = "",
  duration = 1.6,
}: Props) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    let cancelled = false;
    let revert: (() => void) | undefined;

    loadMotion().then(({ gsap, ScrollTrigger }) => {
      const el = ref.current;
      if (cancelled || !el) return;
      const obj = { v: 0 };
      const ctx = gsap.context(() => {
        gsap.to(obj, {
          v: to,
          duration,
          ease: "expo.out",
          onUpdate: () => {
            el.textContent = `${prefix}${Math.round(obj.v)}${suffix}`;
          },
          scrollTrigger: { trigger: el, start: "top 90%", once: true },
        });
      }, el);
      ScrollTrigger.refresh();
      revert = () => ctx.revert();
    });

    return () => {
      cancelled = true;
      revert?.();
    };
  }, [to, prefix, suffix, duration]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {to}
      {suffix}
    </span>
  );
}
