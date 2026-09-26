import Image from "next/image";
import Link from "next/link";
import Reveal from "@/components/Reveal";
import { dishSrc } from "@/lib/dishes";
import { experiences } from "@/lib/experiences";

export default function ExperienceCards({ limit }: { limit?: number }) {
  const list = limit ? experiences.slice(0, limit) : experiences;

  return (
    <div className="grid gap-x-8 gap-y-14 md:grid-cols-2">
      {list.map((x, i) => (
        <Reveal
          key={x.slug}
          as="article"
          delay={i * 0.06}
          className="group flex flex-col"
        >
          <Link href={`/experiences#${x.slug}`} className="block">
            <div
              className={`grain relative overflow-hidden bg-bone-2 ${
                x.ratio === "portrait" ? "aspect-[4/5]" : "aspect-[16/10]"
              }`}
            >
              <Image
                src={dishSrc(x.image, 1024)}
                alt={x.imageAlt}
                fill
                sizes="(min-width:768px) 44vw, 92vw"
                className="object-cover transition-transform duration-[1.2s] ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-[1.05]"
              />
            </div>
          </Link>

          <p className="t-label mt-6 text-accent">{x.eyebrow}</p>
          <h3 className="t-h3 mt-3">
            <Link href={`/experiences#${x.slug}`} className="link-underline tap-sm">
              {x.title}
            </Link>
          </h3>
          <p className="t-lead mt-3 max-w-[42ch]">{x.lede}</p>
          <p className="t-small mt-4 text-muted">{x.bestFor}</p>
        </Reveal>
      ))}
    </div>
  );
}
