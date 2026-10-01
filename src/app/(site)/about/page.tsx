import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import PageHero from "@/components/PageHero";
import Reveal from "@/components/Reveal";
import BladeRule from "@/components/BladeRule";
import SplitHeading from "@/components/SplitHeading";
import Testimonials from "@/components/Testimonials";
import CtaBand from "@/components/CtaBand";
import ParallaxImage from "@/components/ParallaxImage";
import { site } from "@/lib/site";
import { breadcrumbSchema, jsonLd } from "@/lib/schema";

export const metadata: Metadata = {
  title: "About Chef R. Kearse — Third-generation private chef, Richmond VA",
  description:
    `Chef R. Kearse founded his private chef and catering company in ${site.founded}. A third-generation chef cooking for private tables across Richmond, Northern Virginia, Washington DC and Maryland.`,
  alternates: { canonical: "/about" },
};

const VALUES = [
  {
    t: "Cooked, not assembled",
    b: "Everything is prepped and cooked for your event. Nothing arrives pre-made in a tray to be warmed through on site.",
  },
  {
    t: "The chef is the chef",
    b: "You book him, he cooks. Staff and bartenders come with him for the bigger nights — the food stays his.",
  },
  {
    t: "Plated with intent",
    b: "Garnish earns its place or it does not go on the plate. Colour, height and heat are all deliberate.",
  },
  {
    t: "You are a guest at your own party",
    b: "Shopping, prep, service, breakdown and cleanup are all his. You host; you do not work.",
  },
];

export default function AboutPage() {
  const schema = jsonLd(
    breadcrumbSchema([
      { name: "Home", path: "/" },
      { name: "About", path: "/about" },
    ])
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      <PageHero
        eyebrow="The chef"
        title="Third generation. First name basis."
        lede={`Chef R. Kearse is a third-generation private chef and catering professional. He founded his own company in ${site.founded} and has been cooking for private tables across Virginia, Maryland and Washington DC ever since.`}
        crumb={{ label: "About", href: "/about" }}
        image={{ src: "/images/story/chef-kitchen-1024.webp", alt: "" }}
      />

      <section className="section" aria-labelledby="story-heading">
        <div className="shell grid gap-14 lg:grid-cols-[0.95fr_1.05fr] lg:gap-20">
          <Reveal>
            <div className="grain relative aspect-[4/5] overflow-hidden bg-bone-2">
              <Image
                src="/images/story/chef-portrait-800.webp"
                alt="Chef R. Kearse in a black chef's coat in a client's kitchen"
                fill
                sizes="(min-width:1024px) 44vw, 92vw"
                className="object-cover object-top"
                priority
              />
            </div>
            <p className="t-small mt-4 text-muted">
              Chef R. Kearse, mid-service, in a client&apos;s kitchen.
            </p>
          </Reveal>

          <div>
            <p className="t-label text-accent">The story</p>
            <SplitHeading
              id="story-heading"
              text="A kitchen he grew up in, and one he built himself."
              className="t-h2 mt-5 max-w-[17ch]"
            />
            <div className="mt-8 space-y-5">
              <p className="t-lead">
                Cooking runs three generations deep in the Kearse family. He learned it the
                way it usually gets passed down — standing next to someone who already knew
                how, being handed the small jobs first, then the ones that mattered.
              </p>
              <p className="t-lead">
                In {site.founded} he took that training and went out on his own, founding
                Chef R. Kearse Private Chef &amp; Catering in Richmond. Since then he has
                been committed to delivering exceptional meals and creating unforgettable
                occasions — an intimate dinner for two one night, a full reception the next.
              </p>
              <p className="t-lead">
                His range is wide on purpose: Southern and seafood at the centre, with
                American, BBQ, farm-to-table, Italian, Greek, Latin American and fusion
                menus built around the table he is cooking for. What does not change is the
                standard — real ingredients, proper seasoning, food that reaches the guest
                hot and looking like someone cared.
              </p>
            </div>

            <div className="mt-10">
              <BladeRule />
            </div>

            <ul className="mt-10 grid grid-cols-2 gap-8 sm:grid-cols-3">
              <li>
                <p className="t-label text-muted">Founded</p>
                <p className="t-serif-italic mt-2 text-3xl">{site.founded}</p>
              </li>
              <li>
                <p className="t-label text-muted">Based in</p>
                <p className="t-serif-italic mt-2 text-3xl">
                  {site.location.city}, {site.location.region}
                </p>
              </li>
              <li>
                <p className="t-label text-muted">Cooking across</p>
                <p className="t-serif-italic mt-2 text-3xl">VA · DC · MD</p>
              </li>
            </ul>
          </div>
        </div>
      </section>

      <ParallaxImage
        src="/images/dishes/butter-pan-texture-1600.webp"
        alt="Two cubes of butter melting in a hot stainless steel pan"
        width={1600}
        height={1448}
        sizes="100vw"
        className="h-[42vh] w-full md:h-[62vh]"
        strength={14}
      />

      <section className="dark-section section" aria-labelledby="values-heading">
        <div className="shell">
          <p className="t-label text-accent">How he works</p>
          <SplitHeading
            id="values-heading"
            text="Four rules he does not bend."
            className="t-h2 mt-5 max-w-[16ch] text-bone"
          />
          <ul className="mt-14 grid gap-x-10 gap-y-12 md:grid-cols-2">
            {VALUES.map((v, i) => (
              <Reveal as="li" key={v.t} delay={i * 0.06}>
                <span className="t-serif-italic text-4xl text-accent">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="t-h3 mt-4 text-bone">{v.t}</h3>
                <p className="t-small mt-3 max-w-[44ch] text-muted-dark">{v.b}</p>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      <section className="section" aria-labelledby="about-reviews">
        <div className="shell">
          <p className="t-label text-accent">In their words</p>
          <SplitHeading
            id="about-reviews"
            text="What the guests said afterwards."
            className="t-h2 mt-5 max-w-[16ch]"
          />
          <div className="mt-14">
            <Testimonials />
          </div>
          <p className="t-small mt-10 text-muted">
            Read more on{" "}
            <Link href={site.social.zola} className="link-underline text-ink">
              Zola
            </Link>{" "}
            and{" "}
            <Link href={site.social.yelp} className="link-underline text-ink">
              Yelp
            </Link>
            .
          </p>
        </div>
      </section>

      <CtaBand />
    </>
  );
}
