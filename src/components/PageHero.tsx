import Image from "next/image";
import Link from "next/link";
import SplitHeading from "@/components/SplitHeading";

interface Props {
  eyebrow: string;
  title: string;
  lede?: string;
  image?: { src: string; alt: string };
  /** Breadcrumb trail, excluding Home */
  crumb: { label: string; href: string };
  cta?: boolean;
}

export default function PageHero({ eyebrow, title, lede, image, crumb, cta = true }: Props) {
  return (
    <section
      className="dark-section grain relative overflow-hidden"
      style={{ paddingTop: "calc(var(--header-h) + 3.5rem)" }}
    >
      {image && (
        <div className="absolute inset-0" aria-hidden="true">
          <Image
            src={image.src}
            alt=""
            fill
            priority
            quality={55}
            sizes="100vw"
            className="object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(18,16,14,.92)_0%,rgba(18,16,14,.72)_55%,rgba(18,16,14,.96)_100%)]" />
        </div>
      )}

      <div className="shell relative z-10 pb-16 md:pb-24">
        <nav aria-label="Breadcrumb" className="t-label text-bone/60">
          <ol className="flex flex-wrap items-center gap-2">
            <li>
              <Link href="/" className="link-underline tap-sm hover:text-bone">
                Home
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li className="text-accent">{crumb.label}</li>
          </ol>
        </nav>

        <p className="t-label mt-10 text-accent">{eyebrow}</p>
        <SplitHeading as="h1" immediate delay={0.1} text={title} className="t-h1 mt-5 max-w-[16ch] text-bone" />
        {lede && <p className="t-lead mt-7 max-w-2xl">{lede}</p>}

        {cta && (
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link href="/book" className="btn btn-primary sm:min-w-[15rem]">
              Check your date
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
