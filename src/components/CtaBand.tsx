import Link from "next/link";
import Image from "next/image";
import SplitHeading from "@/components/SplitHeading";
import { site } from "@/lib/site";

export default function CtaBand({
  heading = "Tell him the date. He'll tell you what dinner could be.",
  sub = "Five short questions. No account, no obligation, no auto-reply from a booking platform — it goes straight to the chef.",
}: {
  heading?: string;
  sub?: string;
}) {
  return (
    <section className="dark-section grain relative overflow-hidden" aria-labelledby="cta-heading">
      <div className="absolute inset-0" aria-hidden="true">
        <Image
          src="/images/dishes/lobster-shrimp-scampi-1024.webp"
          alt=""
          fill
          quality={60}
          sizes="100vw"
          className="object-cover object-right opacity-40"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(18,16,14,.98)_0%,rgba(18,16,14,.93)_38%,rgba(18,16,14,.55)_78%,rgba(18,16,14,.4)_100%)]" />
      </div>

      <div className="shell relative z-10 section">
        <div className="max-w-3xl">
          <p className="t-label text-accent">Availability</p>
          <SplitHeading id="cta-heading" text={heading} className="t-h2 mt-5 max-w-[20ch] text-bone" />
          <p className="t-lead mt-6 max-w-xl">{sub}</p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link href="/book" className="btn btn-primary sm:min-w-[16rem]">
              Check your date
            </Link>
            <a href={`tel:${site.contact.phoneHref}`} className="btn btn-ghost-light">
              Call {site.contact.phone}
            </a>
          </div>

          <p className="t-small mt-6 text-muted-dark">
            Prefer email? {" "}
            <a href={`mailto:${site.contact.email}`} className="link-underline text-bone/80">
              {site.contact.email}
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
