import Image from "next/image";
import Link from "next/link";
import Hero from "@/components/home/Hero";
import ProofStrip from "@/components/home/ProofStrip";
import SignatureRail from "@/components/home/SignatureRail";
import ExperienceCards from "@/components/ExperienceCards";
import ProcessSteps from "@/components/ProcessSteps";
import Testimonials from "@/components/Testimonials";
import CtaBand from "@/components/CtaBand";
import Reveal from "@/components/Reveal";
import SplitHeading from "@/components/SplitHeading";
import BladeRule from "@/components/BladeRule";
import ParallaxImage from "@/components/ParallaxImage";
import CountUp from "@/components/CountUp";
import { site } from "@/lib/site";

export default function HomePage() {
  return (
    <>
      <Hero />
      <ProofStrip />

      {/* ——— The problem, stated plainly ——— */}
      <section className="section" aria-labelledby="pitch-heading">
        <div className="shell grid gap-12 lg:grid-cols-[0.82fr_1.18fr] lg:gap-20">
          <div>
            <p className="t-label text-accent">Why people call</p>
            <div className="mt-5">
              <BladeRule />
            </div>
            <Reveal delay={0.08} className="mt-10">
              <div className="grain relative aspect-[4/5] overflow-hidden bg-bone-2">
                <Image
                  src="/images/dishes/pasta-wine-candle-1024.webp"
                  alt="A plated pasta dish on a dining table with a glass of white wine and a lit candle behind it"
                  fill
                  sizes="(min-width:1024px) 34vw, 92vw"
                  className="object-cover"
                />
              </div>
              <p className="t-small mt-4 max-w-[30ch] text-muted">
                A Tuesday that got treated like an occasion.
              </p>
            </Reveal>
          </div>
          <div className="lg:pt-4">
            <SplitHeading
              id="pitch-heading"
              text="You want the night. Not the shopping, the plating, or the pile of dishes."
              className="t-h2 max-w-[20ch]"
            />
            <Reveal delay={0.1} className="mt-8 grid gap-6 sm:grid-cols-2">
              <p className="t-lead">
                Hosting is supposed to be a pleasure. Most of the time it is three days of
                planning, a morning at the market, an afternoon you spend facing the stove
                instead of your guests, and a kitchen you are still cleaning at midnight.
              </p>
              <p className="t-lead">
                Chef Kearse takes all of it. He writes the menu, sources the food, cooks it
                in your kitchen, plates every course, serves it, and cleans down before he
                leaves. You get the evening you were actually picturing.
              </p>
            </Reveal>
            <Reveal delay={0.16} className="mt-9">
              <Link href="/experiences" className="btn btn-ghost">
                What he does
              </Link>
            </Reveal>
          </div>
        </div>
      </section>

      <SignatureRail />

      {/* ——— Experiences ——— */}
      <section className="section" aria-labelledby="exp-heading">
        <div className="shell">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="t-label text-accent">What he does</p>
              <SplitHeading
                id="exp-heading"
                text="Four ways to put him in your kitchen."
                className="t-h2 mt-5 max-w-[16ch]"
              />
            </div>
            <p className="t-lead max-w-md lg:text-right">
              Dinner for two or dinner for two hundred — the difference is scale, not
              standard.
            </p>
          </div>
          <div className="mt-8">
            <BladeRule />
          </div>
          <div className="mt-14">
            <ExperienceCards />
          </div>
        </div>
      </section>

      {/* ——— The chef ——— */}
      <section className="dark-section grain relative overflow-hidden" aria-labelledby="chef-heading">
        <div className="shell section grid items-center gap-14 lg:grid-cols-2 lg:gap-24">
          <Reveal>
            <div className="grain relative aspect-[4/5] overflow-hidden border border-bone/10">
              <Image
                src="/images/story/chef-portrait-800.webp"
                alt="Chef R. Kearse in a black chef's coat, standing in a client's kitchen during service"
                fill
                sizes="(min-width:1024px) 42vw, 92vw"
                className="object-cover object-top"
              />
            </div>
          </Reveal>

          <div>
            <p className="t-label text-accent">The chef</p>
            <SplitHeading
              id="chef-heading"
              text="Third generation. First name basis."
              className="t-h2 mt-5 max-w-[14ch] text-bone"
            />
            <p className="t-lead mt-7">
              Chef R. Kearse is a third-generation private chef and catering professional.
              In {site.founded} he founded his own company in Richmond, and he has been
              cooking for private tables across Virginia, Maryland and Washington DC ever
              since — intimate dinners one night, a two-hundred-cover wedding the next.
            </p>
            <p className="t-lead mt-5">
              He cooks one way: seasonal, seasoned properly, plated with intent, served
              hot. You get the chef himself, not a rotating crew sent by an agency.
            </p>

            <ul className="mt-12 grid grid-cols-3 gap-6 border-t border-line-dark pt-8">
              <li>
                <p className="t-serif-italic text-4xl text-bone md:text-5xl">
                  {site.founded}
                </p>
                <p className="t-label mt-3 text-bone/65">Founded his own kitchen</p>
              </li>
              <li>
                <p className="t-serif-italic text-4xl text-bone md:text-5xl">
                  <CountUp to={3} suffix="rd" />
                </p>
                <p className="t-label mt-3 text-bone/65">Generation cooking</p>
              </li>
              <li>
                <p className="t-serif-italic text-4xl text-bone md:text-5xl">
                  <CountUp to={9} suffix="+" />
                </p>
                <p className="t-label mt-3 text-bone/65">Cuisines on his menus</p>
              </li>
            </ul>

            <Link href="/about" className="btn btn-ghost-light mt-10">
              His story
            </Link>
          </div>
        </div>
      </section>

      {/* ——— Process ——— */}
      <section className="section" aria-labelledby="process-heading">
        <div className="shell">
          <p className="t-label text-accent">How it works</p>
          <SplitHeading
            id="process-heading"
            text="From your date to your dining room."
            className="t-h2 mt-5 max-w-[18ch]"
          />
          <div className="mt-16">
            <ProcessSteps />
          </div>
        </div>
      </section>

      {/* ——— Full-bleed atmosphere ——— */}
      <ParallaxImage
        src="/images/dishes/table-setting-1600.webp"
        alt="A dining table dressed in white linen with black placemats, folded napkins, wine glasses and white flowers"
        width={1600}
        height={2414}
        sizes="100vw"
        className="h-[52vh] w-full md:h-[76vh]"
        strength={12}
      />

      {/* ——— Reviews ——— */}
      <section className="section" aria-labelledby="reviews-heading">
        <div className="shell">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="t-label text-accent">In their words</p>
              <SplitHeading
                id="reviews-heading"
                text="What the guests said afterwards."
                className="t-h2 mt-5 max-w-[16ch]"
              />
            </div>
            <p className="t-small max-w-sm text-muted lg:text-right">
              Every review below is a real, published review with its source and date. No
              invented quotes appear anywhere on this site.
            </p>
          </div>
          <div className="mt-8">
            <BladeRule />
          </div>
          <div className="mt-14">
            <Testimonials />
          </div>
        </div>
      </section>

      {/* ——— Weddings teaser ——— */}
      <section className="section-sm" aria-labelledby="wed-heading">
        <div className="shell grid items-stretch gap-0 overflow-hidden border border-line md:grid-cols-2">
          <div className="grain relative min-h-[18rem] md:min-h-[26rem]">
            <Image
              src="/images/dishes/lobster-shrimp-scampi-1024.webp"
              alt="A split lobster tail standing over linguine with shrimp in a light garlic butter sauce"
              fill
              sizes="(min-width:768px) 44vw, 92vw"
              className="object-cover"
            />
          </div>
          <div className="flex flex-col justify-center bg-paper p-8 md:p-14">
            <p className="t-label text-accent">Weddings</p>
            <h2 id="wed-heading" className="t-h3 mt-4 max-w-[18ch]">
              The one thing every guest remembers, and every couple under-plans.
            </h2>
            <p className="t-lead mt-5 max-w-[42ch]">
              Rehearsal dinner through late-night bites — seated, family style, stations or
              passed, with staff, bartenders and cleanup handled.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/weddings" className="btn btn-primary">
                Wedding catering
              </Link>
              <Link href="/book" className="btn btn-ghost">
                Check your date
              </Link>
            </div>
          </div>
        </div>
      </section>

      <CtaBand />
    </>
  );
}
