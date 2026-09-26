import { site } from "@/lib/site";

const ITEMS = [
  `Private chef & catering since ${site.founded}`,
  "Third generation in the kitchen",
  "Richmond · Northern Virginia · Washington DC · Maryland",
  "Weddings · Private dinners · Corporate events",
  "Staff, bar and cleanup included",
];

/**
 * A quiet, continuous marquee of hard facts. CSS-only animation so it costs
 * nothing, and it stops dead for reduced-motion users.
 */
export default function ProofStrip() {
  return (
    <section
      aria-label="At a glance"
      className="dark-section overflow-hidden border-y border-line-dark py-4"
    >
      <div className="flex w-max animate-[proof_44s_linear_infinite] gap-10 whitespace-nowrap motion-reduce:animate-none">
        {[0, 1].map((dup) => (
          <ul key={dup} className="flex gap-10" aria-hidden={dup === 1}>
            {ITEMS.map((t) => (
              <li key={t} className="t-label flex items-center gap-10 text-bone/60">
                <span>{t}</span>
                <span aria-hidden="true" className="inline-block h-1 w-1 bg-accent" />
              </li>
            ))}
          </ul>
        ))}
      </div>
      <style>{`@keyframes proof{from{transform:translate3d(0,0,0)}to{transform:translate3d(-50%,0,0)}}`}</style>
    </section>
  );
}
