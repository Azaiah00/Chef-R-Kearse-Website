"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { loadMotion, prefersReducedMotion } from "@/lib/motion";

interface Props {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  imgClassName?: string;
  sizes?: string;
  priority?: boolean;
  quality?: number;
  /** How far the image drifts inside its frame, as a % of its own height */
  strength?: number;
  grain?: boolean;
}

/**
 * An image locked inside a fixed frame that drifts slowly as you scroll. Runs on
 * mobile too — it is a single transform, so it stays on the compositor.
 */
export default function ParallaxImage({
  src,
  alt,
  width,
  height,
  className = "",
  imgClassName = "",
  sizes = "100vw",
  priority = false,
  quality,
  strength = 9,
  grain = true,
}: Props) {
  const frame = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    let cancelled = false;
    let revert: (() => void) | undefined;

    loadMotion().then(({ gsap, ScrollTrigger }) => {
      const f = frame.current;
      const i = inner.current;
      if (cancelled || !f || !i) return;
      const ctx = gsap.context(() => {
        gsap.fromTo(
          i,
          { yPercent: -strength / 2 },
          {
            yPercent: strength / 2,
            ease: "none",
            scrollTrigger: { trigger: f, start: "top bottom", end: "bottom top", scrub: true },
          }
        );
      }, f);
      ScrollTrigger.refresh();
      revert = () => ctx.revert();
    });

    return () => {
      cancelled = true;
      revert?.();
    };
  }, [strength]);

  return (
    <div
      ref={frame}
      className={`relative overflow-hidden bg-ink-2 ${grain ? "grain" : ""} ${className}`}
    >
      <div ref={inner} className="absolute inset-0 scale-[1.14] will-change-transform">
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          sizes={sizes}
          priority={priority}
          quality={quality}
          className={`h-full w-full object-cover ${imgClassName}`}
        />
      </div>
    </div>
  );
}
