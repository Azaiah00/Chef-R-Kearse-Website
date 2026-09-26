"use client";

import { useEffect, useRef, type ElementType } from "react";
import { loadMotion, prefersReducedMotion, toWords } from "@/lib/motion";

interface Props {
  text: string;
  as?: ElementType;
  className?: string;
  delay?: number;
  /** Fire as soon as the component mounts (hero) rather than on scroll */
  immediate?: boolean;
  id?: string;
}

/**
 * Word-by-word mask reveal — the typographic equivalent of a clean knife cut.
 *
 * The word spans are rendered on the server, so the heading's layout is final
 * from the first paint and nothing below it ever moves. JavaScript only
 * animates elements that are already there. If the script never runs, the
 * heading is simply a normal, fully visible heading.
 */
export default function SplitHeading({
  text,
  as: Tag = "h2",
  className = "",
  delay = 0,
  immediate = false,
  id,
}: Props) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;

    let cancelled = false;
    let revert: (() => void) | undefined;

    loadMotion().then(({ gsap, ScrollTrigger }) => {
      if (cancelled || !ref.current) return;
      const words = Array.from(
        ref.current.querySelectorAll<HTMLElement>("[data-word]")
      );
      if (!words.length) return;

      const ctx = gsap.context(() => {
        gsap.set(words, { yPercent: 112 });
        gsap.to(words, {
          yPercent: 0,
          duration: 1.15,
          delay,
          ease: "expo.out",
          stagger: 0.055,
          ...(immediate
            ? {}
            : { scrollTrigger: { trigger: ref.current!, start: "top 92%", once: true } }),
        });
      }, ref.current);

      ScrollTrigger.refresh();
      revert = () => ctx.revert();
    });

    return () => {
      cancelled = true;
      revert?.();
    };
  }, [delay, immediate, text]);

  return (
    <Tag id={id} ref={ref as React.Ref<HTMLElement>} className={className}>
      {toWords(text).map((chunk, i) =>
        /^\s+$/.test(chunk) ? (
          <span key={i}> </span>
        ) : (
          <span
            key={i}
            style={{
              display: "inline-block",
              overflow: "hidden",
              verticalAlign: "bottom",
              paddingBottom: "0.1em",
              marginBottom: "-0.1em",
            }}
          >
            <span data-word style={{ display: "inline-block", willChange: "transform" }}>
              {chunk}
            </span>
          </span>
        )
      )}
    </Tag>
  );
}
