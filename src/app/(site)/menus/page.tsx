import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import PageHero from "@/components/PageHero";
import Reveal from "@/components/Reveal";
import BladeRule from "@/components/BladeRule";
import SplitHeading from "@/components/SplitHeading";
import CtaBand from "@/components/CtaBand";
import { dishes, dishSrc, categoryLabels, type DishCategory } from "@/lib/dishes";
import { site } from "@/lib/site";
import { breadcrumbSchema, jsonLd, menuSchema } from "@/lib/schema";

export const metadata: Metadata = {
  title: "Menus — Sample plates and the range he cooks",
  description:
    "Southern, seafood, American, BBQ, farm-to-table, Italian, Greek, Latin American and fusion. Sample plates from Chef R. Kearse. Menus are written per event.",
  alternates: { canonical: "/menus" },
};

const ORDER: DishCategory[] = ["seafood", "meat", "southern", "sweet"];

export default function MenusPage() {
  const schema = jsonLd(
    breadcrumbSchema([
      { name: "Home", path: "/" },
      { name: "Menus", path: "/menus" },
    ]),
    menuSchema()
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      <PageHero
        eyebrow="Menus"
        title="There is no fixed menu. That is the point."
        lede="Every menu is written for the night it is cooked for — your guests, your kitchen, your occasion. What follows is the range, shown through plates he has actually sent out."
        crumb={{ label: "Menus", href: "/menus" }}
        image={{ src: "/images/dishes/shrimp-grits-sausage-1024.webp", alt: "" }}
      />

      {/* Cuisines */}
      <section className="section-sm border-b border-line" aria-labelledby="cuisine-heading">
        <div className="shell">
          <h2 id="cuisine-heading" className="t-label text-accent">
            He cooks
          </h2>
          <ul className="mt-6 flex flex-wrap gap-x-3 gap-y-3">
            {site.cuisines.map((c) => (
              <li key={c} className="border border-line bg-paper px-4 py-2 text-[0.9375rem]">
                {c}
              </li>
            ))}
          </ul>
          <p className="t-small mt-6 max-w-2xl text-muted">
            Vegan and vegetarian options are available across every service. Allergies and
            dietary requirements are handled directly with the chef when you enquire — nothing
            on this page carries a dietary or allergen claim, and every kitchen he works in is
            a shared one, so cross-contamination cannot be ruled out.
          </p>
        </div>
      </section>

      {ORDER.map((cat, ci) => {
        const list = dishes.filter((d) => d.category === cat);
        if (!list.length) return null;
        return (
          <section
            key={cat}
            id={cat}
            className={`section scroll-mt-24 ${ci % 2 === 1 ? "bg-bone-2" : ""}`}
            aria-labelledby={`${cat}-heading`}
          >
            <div className="shell">
              <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <SplitHeading
                  id={`${cat}-heading`}
                  text={categoryLabels[cat]}
                  className="t-h2"
                />
                <p className="t-label text-muted">
                  {String(list.length).padStart(2, "0")} plates
                </p>
              </div>
              <div className="mt-7">
                <BladeRule />
              </div>

              <ul className="mt-12 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
                {list.map((d, i) => (
                  <Reveal as="li" key={d.slug} delay={(i % 3) * 0.06}>
                    <div className="grain relative aspect-[5/4] overflow-hidden bg-bone-2">
                      <Image
                        src={dishSrc(d.slug, 1024)}
                        alt={d.alt}
                        fill
                        sizes="(min-width:1024px) 30vw, (min-width:640px) 45vw, 92vw"
                        loading={ci === 0 && i < 3 ? "eager" : "lazy"}
                        className="object-cover"
                      />
                    </div>
                    <h3 className="t-h3 mt-5 text-[1.3rem]">{d.title}</h3>
                    <p className="t-small mt-2 text-muted">{d.note}</p>
                  </Reveal>
                ))}
              </ul>
            </div>
          </section>
        );
      })}

      {/* Pricing honesty block */}
      <section className="dark-section section" aria-labelledby="price-heading">
        <div className="shell grid gap-12 lg:grid-cols-[1fr_1fr] lg:gap-20">
          <div>
            <p className="t-label text-accent">What it costs</p>
            <SplitHeading
              id="price-heading"
              text="Quoted per event, never off a price list."
              className="t-h2 mt-5 max-w-[16ch] text-bone"
            />
          </div>
          <div>
            <p className="t-lead">
              Two dinners for eight can be a thousand dollars apart depending on the
              proteins, the courses, the staff on the floor and whether there is a bar. A
              published per-head number would be wrong for almost everyone who read it.
            </p>
            <p className="t-lead mt-5">
              So the quote comes after the conversation: tell him the date, the headcount
              and the kind of night it is, and he will come back with a menu and a number
              for that event. Consultations and tastings are available, and the fee is
              waived when you sign.
            </p>
            <Link href="/book" className="btn btn-primary mt-9">
              Get a quote for your date
            </Link>
          </div>
        </div>
      </section>

      <CtaBand />
    </>
  );
}
