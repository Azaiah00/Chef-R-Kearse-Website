import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy note",
  description:
    "What Chef R. Kearse does with the details you send through this website, and what he does not do with them.",
  alternates: { canonical: "/privacy" },
  robots: { index: true, follow: false },
};

export default function PrivacyPage() {
  return (
    <>
      <PageHero
        eyebrow="Privacy"
        title="What happens to your details."
        crumb={{ label: "Privacy", href: "/privacy" }}
        cta={false}
      />

      <section className="section">
        <div className="shell-text space-y-8">
          <div>
            <h2 className="t-h3">What this site collects</h2>
            <p className="t-lead mt-4">
              Only what you type into the enquiry form: the type of event, your date and
              its flexibility, guest count, location, any notes or dietary information you
              choose to add, and your name, email address and phone number.
            </p>
          </div>

          <div>
            <h2 className="t-h3">What it is used for</h2>
            <p className="t-lead mt-4">
              Answering your enquiry, quoting your event, and nothing else. The message is
              emailed to {site.legalName} at {site.contact.email}. Your details are not
              sold, rented, or added to a marketing list you did not ask to join.
            </p>
          </div>

          <div>
            <h2 className="t-h3">How long it is kept</h2>
            <p className="t-lead mt-4">
              Enquiry emails live in the chef&apos;s inbox for as long as they are useful for
              your event and his records. Ask him to delete yours and he will.
            </p>
          </div>

          <div>
            <h2 className="t-h3">Cookies and tracking</h2>
            <p className="t-lead mt-4">
              This site sets no advertising cookies and runs no third-party tracking
              pixels as delivered. Web fonts are served by Google Fonts, which receives
              your IP address as part of that request. If analytics are added later, this
              page will say so.
            </p>
          </div>

          <div>
            <h2 className="t-h3">Getting in touch about your data</h2>
            <p className="t-lead mt-4">
              Email{" "}
              <a href={`mailto:${site.contact.email}`} className="link-underline text-ink">
                {site.contact.email}
              </a>{" "}
              or call {site.contact.phone}.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
