"use client";

import { useState } from "react";

export default function FaqAccordion({
  items,
  dark = false,
  headingLevel = "h3",
}: {
  items: readonly { q: string; a: string }[];
  dark?: boolean;
  /** Set so the page's heading order never skips a level. */
  headingLevel?: "h2" | "h3";
}) {
  const [open, setOpen] = useState<number | null>(0);
  const H = headingLevel;

  return (
    <ul className={`border-t ${dark ? "border-line-dark" : "border-line"}`}>
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <li key={item.q} className={`border-b ${dark ? "border-line-dark" : "border-line"}`}>
            <H>
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : i)}
                aria-expanded={isOpen}
                aria-controls={`faq-panel-${i}`}
                id={`faq-btn-${i}`}
                className="flex w-full items-start justify-between gap-6 py-6 text-left"
              >
                <span
                  className={`t-h3 text-[1.15rem] md:text-[1.35rem] ${
                    isOpen ? "text-accent" : ""
                  }`}
                >
                  {item.q}
                </span>
                <span
                  aria-hidden="true"
                  className={`relative mt-2 block h-4 w-4 shrink-0 transition-transform duration-300 ${
                    isOpen ? "rotate-45" : ""
                  }`}
                >
                  <span className="absolute left-0 top-1/2 h-px w-4 -translate-y-1/2 bg-current" />
                  <span className="absolute left-1/2 top-0 h-4 w-px -translate-x-1/2 bg-current" />
                </span>
              </button>
            </H>
            <div
              id={`faq-panel-${i}`}
              role="region"
              aria-labelledby={`faq-btn-${i}`}
              hidden={!isOpen}
              className="pb-7"
            >
              <p className={`max-w-[62ch] ${dark ? "text-muted-dark" : "text-muted"}`}>
                {item.a}
              </p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
