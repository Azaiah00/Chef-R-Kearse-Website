"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { dishes, dishSrc, categoryLabels, type DishCategory } from "@/lib/dishes";

const FILTERS: { key: "all" | DishCategory; label: string }[] = [
  { key: "all", label: "Everything" },
  { key: "seafood", label: categoryLabels.seafood },
  { key: "meat", label: categoryLabels.meat },
  { key: "southern", label: categoryLabels.southern },
  { key: "sweet", label: categoryLabels.sweet },
  { key: "craft", label: categoryLabels.craft },
];

export default function GalleryGrid() {
  const [filter, setFilter] = useState<"all" | DishCategory>("all");
  const [open, setOpen] = useState<number | null>(null);

  const list = filter === "all" ? dishes : dishes.filter((d) => d.category === filter);

  const close = useCallback(() => setOpen(null), []);
  const step = useCallback(
    (dir: 1 | -1) =>
      setOpen((i) => (i === null ? null : (i + dir + list.length) % list.length)),
    [list.length]
  );

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, close, step]);

  const active = open === null ? null : list[open];

  return (
    <>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Filter the gallery">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            className="chip"
            aria-pressed={filter === f.key}
            onClick={() => {
              setFilter(f.key);
              setOpen(null);
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      <ul className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5 lg:grid-cols-4">
        {list.map((d, i) => (
          <li key={d.slug} className="contents">
            <button
              type="button"
              onClick={() => setOpen(i)}
              className="group relative block w-full overflow-hidden bg-bone-2 text-left"
              style={{ aspectRatio: "4 / 5" }}
              aria-label={`Open larger view: ${d.title}`}
            >
              <Image
                src={dishSrc(d.slug, 640)}
                alt={d.alt}
                fill
                sizes="(min-width:1024px) 23vw, (min-width:768px) 31vw, 47vw"
                loading={i < 4 ? "eager" : "lazy"}
                className="object-cover transition-transform duration-[1.1s] ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-[1.06]"
              />
              <span className="pointer-events-none absolute inset-x-0 bottom-0 bg-[linear-gradient(0deg,rgba(18,16,14,.86),transparent)] p-3 pt-10 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100">
                <span className="t-label block text-bone">{d.title}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>

      {active && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={active.title}
          className="fixed inset-0 z-[60] flex flex-col bg-ink/97 p-4 md:p-8"
          onClick={close}
        >
          <div className="flex items-start justify-between gap-6">
            <div>
              <p className="t-label text-accent">{categoryLabels[active.category]}</p>
              <h2 className="t-h3 mt-2 text-bone">{active.title}</h2>
            </div>
            <button
              type="button"
              onClick={close}
              className="grid h-12 w-12 shrink-0 place-items-center border border-line-dark text-bone"
              aria-label="Close"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
                <path
                  d="M6 6l12 12M18 6L6 18"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  fill="none"
                />
              </svg>
            </button>
          </div>

          <div
            className="relative mt-5 min-h-0 flex-1"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={dishSrc(active.slug, 1600)}
              alt={active.alt}
              fill
              sizes="100vw"
              className="object-contain"
            />
          </div>

          <div
            className="mt-5 flex items-center justify-between gap-6"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="t-small max-w-lg text-muted-dark">{active.note}</p>
            <div className="flex shrink-0 gap-2">
              <button
                type="button"
                onClick={() => step(-1)}
                className="grid h-12 w-12 place-items-center border border-line-dark text-bone"
                aria-label="Previous photo"
              >
                &#8592;
              </button>
              <button
                type="button"
                onClick={() => step(1)}
                className="grid h-12 w-12 place-items-center border border-line-dark text-bone"
                aria-label="Next photo"
              >
                &#8594;
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
