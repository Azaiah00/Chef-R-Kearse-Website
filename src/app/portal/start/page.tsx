import Link from "next/link";
import { requireStaff } from "@/lib/portal/guard";
import { Card } from "@/components/portal/Ui";
import Tour from "@/components/portal/Tour";
import { TERMS } from "@/lib/portal/guide-content";
import { IconArrowRight } from "@/components/portal/Icons";

export const metadata = { title: "Start here" };

/**
 * The page you send somebody to on day one.
 *
 * Numbered, short, and written for a chef rather than for a developer. It exists
 * because a tour is good for a first five minutes and useless a week later when
 * he has forgotten what band B meant — this page is the thing he can come back to.
 *
 * It deliberately does NOT list every feature. Four things to understand, five
 * steps to follow, and the glossary. Everything else is explained on the page it
 * belongs to.
 */

interface Step {
  title: string;
  body: string;
  href?: string;
  linkLabel?: string;
  owner?: boolean;
}

const OWNER_STEPS: Step[] = [
  {
    title: "Fill in the five blanks on the Kitchen Brain",
    body:
      "Your insurance limit, your food-safety certificate, your business licence, your health permits, and whether you are registered with the state as a small business and on eVA. Every one of them shows as an orange NOT CONFIRMED label until you fill it in, and venues ask for all of them. Nothing can be sent to a venue until this is done, so it is genuinely first.",
    href: "/portal/brain",
    linkLabel: "Open the Kitchen Brain",
  },
  {
    title: "Tell us your prices and how far you travel",
    body:
      "Every price in here is currently a placeholder and marked as one. Until you confirm your real numbers, the portal will not quote anybody. Same for your travel radius, your minimum, and your deposit and cancellation terms.",
    href: "/portal/settings",
    linkLabel: "Open settings",
  },
  {
    title: "Read the Monday briefing",
    body:
      "One box at the top tells you the most useful thing you could do this week. It is chosen by what is behind, not by what is new — so if something is late, late comes first. Do that box and stop.",
    href: "/portal/briefing",
    linkLabel: "Open the briefing",
  },
  {
    title: "Make two phone calls",
    body:
      "Open Prospects, take the top two cards, and ring them. Each one has a question written out to open the call with, and a box telling you what not to say. Both of the top two are venues, and getting onto a venue's caterer list is the single most valuable thing in this system.",
    href: "/portal/prospects",
    linkLabel: "Open prospects",
  },
  {
    title: "Send the two letters that are already written",
    body:
      "There are two venue applications sitting as drafts. Read them, change anything that does not sound like you, and send them. A written letter nobody sends is worth nothing.",
    href: "/portal/outreach",
    linkLabel: "Open the letters",
  },
];

const ASSISTANT_STEPS: Step[] = [
  {
    title: "Start at your desk, from the top",
    body:
      "The jobs at the top of your desk are the ones that are late or nearly late. Work down. Anything new can wait behind anything old, however interesting the new thing looks.",
    href: "/portal",
    linkLabel: "Open my desk",
  },
  {
    title: "Answer anything unread in Messages",
    body:
      "Clients write in about their events, and what you reply appears on their own private page. A same-day answer is most of the reason somebody books him over another chef.",
    href: "/portal/messages",
    linkLabel: "Open messages",
  },
  {
    title: "Reply to the A and B enquiries",
    body:
      "Every enquiry gets a letter when it arrives. A and B need a real person — that is you. C and D have already had a polite reply and need nothing.",
    href: "/portal/leads",
    linkLabel: "Open enquiries",
  },
  {
    title: "Work the call list",
    body:
      "Open any prospect and you get one question to start the call with, plus a Before you dial box. Read that box every single time — it is there because one wrong sentence loses the call.",
    href: "/portal/prospects",
    linkLabel: "Open the call list",
  },
  {
    title: "Chase the menus that are not finished",
    body:
      "Nobody can shop for an event whose menu is still changing. The Menus page shows how many choices each client has made out of how many they need.",
    href: "/portal/menus",
    linkLabel: "Open menus",
  },
];

export default async function StartPage() {
  const session = await requireStaff();
  const isOwner = session.role === "owner";
  const steps = isOwner ? OWNER_STEPS : ASSISTANT_STEPS;

  return (
    <div className="space-y-6">
      <header>
        <p className="p-title">Start here</p>
        <h1 className="t-h3 mt-1.5">
          {isOwner ? "Welcome to your office." : "Welcome to your desk."}
        </h1>
        <p className="p-muted mt-2 max-w-[62ch] text-sm leading-relaxed">
          This page explains what this thing is and what to do with it. It takes about five
          minutes to read and you can come back to it any time — the link is at the bottom
          of the menu on the left.
        </p>
      </header>

      {/* ── The four ideas. Everything else follows from these. ───────────── */}
      <Card title="The four things to understand">
        <div className="p-card-pad space-y-4 text-sm leading-relaxed">
          <div>
            <p className="font-medium">1. Two kinds of people come through here.</p>
            <p className="p-muted mt-1">
              An <strong>enquiry</strong> is someone who found you and filled in the form on
              your website. A <strong>prospect</strong> is a business that has not heard of
              you, that we went and found, and that we think is worth a call. They live on
              different pages because they need completely different handling.
            </p>
          </div>
          <div>
            <p className="font-medium">2. Everything gets sorted for you.</p>
            <p className="p-muted mt-1">
              Enquiries get a letter — A, B, C or D — the moment they arrive, based on the
              answers they gave. Prospects get a priority instead: call this week, call this
              month, keep an eye on it, or do not pursue. You can always open either one and
              see exactly how it got that rating, and you can overrule it.
            </p>
          </div>
          <div>
            <p className="font-medium">3. Nothing goes out without a person reading it.</p>
            <p className="p-muted mt-1">
              Letters and emails are written first, read second, sent third. Those are three
              separate steps on purpose. The one exception is the automatic polite reply to
              the C and D enquiries, which exists so you never have to write one.
            </p>
          </div>
          <div>
            <p className="font-medium">4. Every fact in here has a source.</p>
            <p className="p-muted mt-1">
              Every prospect lists the web pages its facts came from and the date we read
              them — and each one also says what it does <em>not</em> prove. That is so you
              can repeat something on a phone call without being corrected. If a card has no
              source on it, the portal holds it back and says so.
            </p>
          </div>
        </div>
      </Card>

      {/* ── The steps. ───────────────────────────────────────────────────── */}
      <Card
        title={isOwner ? "What to do first, in order" : "Your day, in order"}
        action={
          <span className="p-muted text-[0.75rem]">
            {steps.length} steps
          </span>
        }
      >
        <div className="p-card-pad">
          {steps.map((s, n) => (
            <div key={s.title} className="p-step">
              <span className="p-step-n" aria-hidden="true">
                {n + 1}
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-medium">{s.title}</h3>
                <p className="p-muted mt-1 text-sm leading-relaxed">{s.body}</p>
                {s.href ? (
                  <Link href={s.href} className="p-btn p-btn-sm mt-2.5">
                    {s.linkLabel}
                    <IconArrowRight className="h-4 w-4" />
                  </Link>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* ── The glossary, in full. ───────────────────────────────────────── */}
      <Card title="Every word in here, explained">
        <div className="p-card-pad">
          <p className="p-muted text-sm leading-relaxed">
            You should not have to learn new words to run your own business. Where a word on
            screen is not obvious, here is what it means.
          </p>
          <dl className="p-guide-terms mt-4">
            {Object.entries(TERMS).map(([key, t]) => (
              <div key={key}>
                <dt>{t.term}</dt>
                <dd>
                  {t.plain}
                  {t.why ? <span className="p-guide-why"> {t.why}</span> : null}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </Card>

      <Card title="Prefer to be walked through it?">
        <div className="p-card-pad">
          <p className="p-muted text-sm leading-relaxed">
            The walk-through goes through the main screens one at a time, with a link to each
            one. About two minutes.
          </p>
          <div className="mt-3 max-w-xs">
            <Tour role={session.role} label="Start the walk-through" />
          </div>
        </div>
      </Card>

      <p className="p-muted text-[0.8125rem] leading-relaxed">
        Something here not making sense is a problem with the portal, not with you. Tell
        Azaiah which bit and it gets rewritten.
      </p>
    </div>
  );
}
