import Reveal from "@/components/Reveal";
import { testimonials } from "@/lib/site";

function Stars({ n }: { n: number }) {
  return (
    <span className="flex gap-1" aria-label={`${n} out of 5 stars`}>
      {Array.from({ length: n }).map((_, i) => (
        <svg key={i} viewBox="0 0 24 24" className="h-4 w-4 text-accent" aria-hidden="true">
          <path
            fill="currentColor"
            d="m12 3.6 2.6 5.3 5.9.85-4.25 4.15 1 5.85L12 17l-5.25 2.75 1-5.85L3.5 9.75l5.9-.85L12 3.6Z"
          />
        </svg>
      ))}
    </span>
  );
}

export default function Testimonials({ dark = false }: { dark?: boolean }) {
  return (
    <div className="grid gap-x-8 gap-y-12 md:grid-cols-3">
      {testimonials.map((t, i) => (
        <Reveal as="figure" key={t.author} delay={i * 0.08} className="flex flex-col">
          <Stars n={t.rating} />
          <blockquote
            className={`t-serif-italic mt-6 text-[1.35rem] leading-[1.42] ${
              dark ? "text-bone" : "text-ink"
            }`}
          >
            &ldquo;{t.quote}&rdquo;
          </blockquote>
          <figcaption
            className={`t-small mt-6 ${dark ? "text-muted-dark" : "text-muted"}`}
          >
            <span className={dark ? "text-bone" : "text-ink"}>{t.author}</span>
            {" · "}
            {t.context}
            <br />
            <a
              href={t.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="link-underline tap-sm"
            >
              Verified on {t.source}, {t.dateLabel}
            </a>
          </figcaption>
        </Reveal>
      ))}
    </div>
  );
}
