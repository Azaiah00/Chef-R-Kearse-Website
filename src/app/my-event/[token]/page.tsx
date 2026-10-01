import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import {
  getLeadByClientToken,
  getMenuForLead,
  getMessages,
  markThreadRead,
} from "@/lib/portal/store";
import { daysBetween } from "@/lib/portal/scoring";
import { generatePrep } from "@/lib/portal/prep";
import { site } from "@/lib/site";
import { Card, longDate } from "@/components/portal/Ui";
import { IconCheck, IconClock, IconMail, IconPhone } from "@/components/portal/Icons";
import MenuBuilder from "@/components/portal/MenuBuilder";
import Thread from "@/components/portal/Thread";
import "../../portal/portal.css";

export const metadata: Metadata = {
  title: "Your event",
  // A guest's event page must never be indexed, and it must not inherit the
  // marketing description or share card from the root layout — this page is
  // private to one person and should produce no preview anywhere.
  description: "Your event with Chef R. Kearse.",
  robots: { index: false, follow: false, nocache: true },
  openGraph: undefined,
  twitter: undefined,
};

/**
 * THE GUEST'S OWN PAGE
 *
 * No account, no password, no app. The link arrives in their confirmation email
 * and everything about their booking lives behind it: the countdown, what
 * happens next and by when, the menu they build themselves, the people they are
 * feeding, and a conversation with the chef and his office.
 *
 * Why this matters commercially: most of the "just checking in" emails a caterer
 * answers are a guest who cannot see the state of their own booking. Show them,
 * and the anxious emails stop — which is time back for the chef and a calmer
 * client who tells people about it.
 *
 * In production the token is single-purpose, expiring and rate-limited, and the
 * page is served with no-index headers. In this demo the tokens are readable
 * strings so you can open them from the portal while presenting.
 */
export default async function ClientEventPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const lead = getLeadByClientToken(token);

  /*
   * An unrecognised token gets a helpful page rather than a bare 404.
   *
   * The person holding a dead link is almost never an attacker — it is a guest
   * whose link has expired, who copied it out of an email badly, or who is on a
   * different device. Showing them "404 Not Found" tells them nothing and makes
   * them ring up annoyed. Showing them the phone number solves it.
   *
   * KNOWN CAVEAT, recorded rather than hidden: this returns HTTP 200 rather than
   * 404. Calling Next's `notFound()` here would be the semantically correct
   * status, but it fires after the root layout has begun streaming, so Next
   * cannot change the status line and appends the 404 content at 200 anyway —
   * the same streaming limitation the portal middleware works around. Since this
   * route is `noindex, nofollow, nocache` and must never be crawled, the status
   * code has no search consequence, and a useful page is worth more than a
   * correct-but-empty one. Revisit if these pages ever become public.
   */
  if (!lead) {
    return (
      <div className="client-root grid min-h-dvh place-items-center px-4 py-12">
        <div className="w-full max-w-md text-center">
          <Image
            src="/images/brand/logo-ink.png"
            alt={`${site.name} — Private Chef & Catering`}
            width={440}
            height={125}
            className="mx-auto h-10 w-[141px]"
            priority
          />
          <h1 className="t-h3 mt-8">This link is not working.</h1>
          <p className="t-lead mt-4">
            Event links expire, and they are tied to one event — so an old one, or one copied
            from the wrong email, will land here.
          </p>
          <p className="t-small mt-6 text-muted">
            Call or email and a new one will be sent straight over. Nothing about your booking
            has changed.
          </p>
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <a href={`tel:${site.contact.phoneHref}`} className="p-btn p-btn-primary">
              <IconPhone className="h-4 w-4" />
              {site.contact.phone}
            </a>
            <a href={`mailto:${site.contact.email}`} className="p-btn">
              <IconMail className="h-4 w-4" />
              Email the office
            </a>
          </div>
          <Link href="/" className="link-underline t-small mt-8 inline-block text-muted">
            Back to the website
          </Link>
        </div>
      </div>
    );
  }

  const menu = getMenuForLead(lead.id);
  const messages = getMessages(lead.id);
  markThreadRead(lead.id, "client");

  const daysOut = lead.eventDate
    ? daysBetween(new Date(), new Date(`${lead.eventDate}T12:00:00Z`))
    : null;
  const prep = menu ? generatePrep(menu, lead.event?.serviceTime ?? null) : null;
  const firstName = lead.name.split(" ")[0];

  /* The next-steps ladder. Derived from real state, not a static graphic — a
     guest can see exactly where they are and what is waiting on whom. */
  const steps = [
    { label: "Enquiry received", done: true, note: `Reference ${lead.ref}` },
    {
      label: "Menu agreed",
      done: menu?.status === "locked",
      note:
        menu?.status === "locked"
          ? "Locked — this is what will be cooked"
          : menu?.status === "submitted"
            ? "With the chef for review"
            : menu
              ? "Yours to build below"
              : "The chef will open this for you shortly",
    },
    {
      label: "Date secured",
      done: Boolean(lead.event?.depositPaid),
      note: lead.event?.depositPaid
        ? "Deposit received, the date is yours"
        : "Held for you until the deposit is in",
    },
    {
      label: "Final headcount",
      done: Boolean(lead.event),
      note: lead.event ? `${lead.guestCount} guests confirmed` : "Confirm about ten days out",
    },
    {
      label: "Service",
      done: daysOut !== null && daysOut < 0,
      note: lead.event?.serviceTime
        ? `First course at ${lead.event.serviceTime}`
        : longDate(lead.eventDate),
    },
  ];

  return (
    <div className="client-root">
      <a
        href="#event-main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:bg-accent focus:px-4 focus:py-3 focus:text-white"
      >
        Skip to content
      </a>
      <header className="border-b border-[color:var(--color-line)]">
        <div className="p-shell flex flex-wrap items-center justify-between gap-4 py-4">
          <Link href="/" aria-label={`${site.name} — home`}>
            <Image
              src="/images/brand/logo-ink.png"
              alt={`${site.name} — Private Chef & Catering`}
              width={440}
              height={125}
              className="h-9 w-[127px]"
              priority
            />
          </Link>
          <div className="flex flex-wrap gap-2">
            <a href={`tel:${site.contact.phoneHref}`} className="p-btn p-btn-sm">
              <IconPhone className="h-4 w-4" />
              {site.contact.phone}
            </a>
            <a href={`mailto:${site.contact.email}`} className="p-btn p-btn-sm">
              <IconMail className="h-4 w-4" />
              Email
            </a>
          </div>
        </div>
      </header>

      <main id="event-main" className="p-shell space-y-6 py-8 pb-20">
        {/* ── The headline. What, when, how long. ─────────────────────────── */}
        <div className="client-card px-5 py-6 sm:px-7 sm:py-8">
          <p className="p-title">Your event</p>
          <h1 className="t-h2 mt-2">{longDate(lead.eventDate)}</h1>
          <p className="t-lead mt-3">
            {firstName}, everything about your event lives on this page — the menu, the timings,
            and a direct line to Chef Kearse and his office. No password, no app. Keep the link.
          </p>

          <dl className="mt-6 grid gap-4 sm:grid-cols-3">
            <div>
              <dt className="p-title">Guests</dt>
              <dd className="p-figure-sm mt-1.5">{lead.guestCount}</dd>
            </div>
            <div>
              <dt className="p-title">Service</dt>
              <dd className="mt-1.5 text-[0.9375rem]">
                {lead.event?.serviceStyle ?? menu?.serviceStyle ?? "To be confirmed"}
              </dd>
            </div>
            <div>
              <dt className="p-title">
                {daysOut !== null && daysOut >= 0 ? "Countdown" : "Status"}
              </dt>
              <dd className="p-figure-sm mt-1.5">
                {daysOut === null
                  ? "Date TBC"
                  : daysOut < 0
                    ? "Delivered"
                    : daysOut === 0
                      ? "Today"
                      : `${daysOut} days`}
              </dd>
            </div>
          </dl>
        </div>

        {/* ── Where you are. The anxiety-killer. ──────────────────────────── */}
        <Card title="Where things stand">
          <ol className="divide-y divide-[color:var(--color-line)]">
            {steps.map((step, i) => (
              <li key={step.label} className="flex items-start gap-3 px-5 py-3.5">
                <span
                  className={`mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full border text-[0.6875rem] font-semibold ${
                    step.done
                      ? "border-[color:var(--color-accent)] bg-[color:var(--color-accent)] text-white"
                      : "border-[color:var(--color-line)] text-[color:var(--color-muted)]"
                  }`}
                  aria-hidden="true"
                >
                  {step.done ? <IconCheck className="h-3.5 w-3.5" /> : i + 1}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[0.9375rem] font-medium">{step.label}</span>
                  <span className="p-muted block text-[0.8125rem] leading-snug">{step.note}</span>
                </span>
                {step.done ? (
                  <span className="sr-only">Complete</span>
                ) : (
                  <span className="sr-only">Not yet complete</span>
                )}
              </li>
            ))}
          </ol>
        </Card>

        {/* ── Conversation. ──────────────────────────────────────────────── */}
        <Card title="Talk to the chef">
          <Thread
            leadId={lead.id}
            messages={messages}
            as="client"
            authorName={lead.name}
            token={token}
          />
        </Card>

        {/* ── The menu builder. ──────────────────────────────────────────── */}
        {menu && prep ? (
          <section>
            <div className="mb-4">
              <h2 className="t-h3">Your menu</h2>
              <p className="t-lead mt-2">
                Choose from Chef Kearse&apos;s own work — every photograph is a dish he has cooked.
                Tell him who you are feeding and he will plate around it. Nothing is final until he
                locks it with you.
              </p>
            </div>
            <MenuBuilder
              menu={menu}
              as="client"
              authorName={lead.name}
              token={token}
              conflicts={prep.conflicts}
            />
          </section>
        ) : (
          <Card title="Your menu">
            <div className="p-card-pad">
              <p className="text-[0.9375rem] leading-relaxed">
                Chef Kearse will open your menu here once you have spoken about the shape of the
                evening. You will be able to choose your courses, tell him about any allergies, and
                see exactly what he has planned.
              </p>
            </div>
          </Card>
        )}

        {/* ── Day-of timings. ────────────────────────────────────────────── */}
        {lead.event ? (
          <Card title="On the day">
            <div className="p-card-pad">
              <ol className="space-y-3.5">
                <li className="flex items-start gap-3">
                  <IconClock className="p-muted mt-0.5 h-4 w-4 shrink-0" />
                  <div>
                    <p className="text-[0.9375rem] font-medium">{lead.event.loadInTime}</p>
                    <p className="p-muted text-[0.8125rem]">
                      The team arrives and takes over the kitchen
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <IconClock className="p-muted mt-0.5 h-4 w-4 shrink-0" />
                  <div>
                    <p className="text-[0.9375rem] font-medium">{lead.event.serviceTime}</p>
                    <p className="p-muted text-[0.8125rem]">First course goes out</p>
                  </div>
                </li>
              </ol>
              <p className="p-hairline p-muted mt-4 pt-4 text-[0.8125rem] leading-relaxed">
                Looking after you on the night: {lead.event.staffAssigned.join(", ")}.
              </p>
            </div>
          </Card>
        ) : null}

        <p className="p-muted text-center text-[0.75rem] leading-relaxed">
          This page is private to you and is not indexed by search engines. If you would rather not
          use it, everything here can be done over the phone — {site.contact.phone}.
        </p>
      </main>
    </div>
  );
}
