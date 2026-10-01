import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { requireStaff } from "@/lib/portal/guard";
import { getBrain, getOutreach, getProspect } from "@/lib/portal/lead-store";
import { longDate } from "@/components/portal/Ui";
import PrintControls from "@/components/portal/PrintControls";
import "./print.css";

export const metadata: Metadata = {
  title: "Print",
  robots: { index: false, follow: false, nocache: true },
};

/**
 * A printable letter.
 *
 * Deliberately not styled like the rest of the portal: white paper, black ink,
 * no glass, no accent washes. A letter that arrives looking like a dashboard is
 * not a letter.
 *
 * Every contact detail is read from the Kitchen Brain rather than hardcoded, so
 * there is one place his phone number lives and a printed letter can never carry
 * a stale one.
 */
export default async function PrintOutreachPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireStaff();
  const { id } = await params;
  const record = getOutreach().find((o) => o.id === id);
  if (!record) notFound();

  const prospect = getProspect(record.prospectId);
  const brain = getBrain();

  return (
    <div className="print-page">
      <PrintControls backHref={`/portal/prospects/${record.prospectId}`} />

      <article className="print-sheet">
        <header className="print-head">
          <p className="print-name">{brain.brandName}</p>
          <p className="print-meta">
            {brain.baseCity}, {brain.baseState}
            <br />
            {brain.phone}
            {brain.tollFree ? ` · ${brain.tollFree}` : ""}
            <br />
            {brain.email}
          </p>
        </header>

        <p className="print-date">{longDate(record.draftedISO)}</p>

        {prospect ? (
          <address className="print-to">
            {prospect.contactName ? (
              <>
                {prospect.contactName}
                {prospect.contactRole ? `, ${prospect.contactRole}` : ""}
                <br />
              </>
            ) : null}
            {prospect.name}
            {prospect.city ? (
              <>
                <br />
                {prospect.city}, {prospect.state}
              </>
            ) : null}
          </address>
        ) : null}

        <p className="print-subject">{record.subject}</p>

        {/* Verbatim. Line breaks are the author's and are preserved. */}
        <pre className="print-body">{record.body}</pre>
      </article>

      <p className="print-foot-note">
        <Link href={`/portal/prospects/${record.prospectId}`}>
          ← Back to {prospect?.name ?? "the prospect"}
        </Link>
      </p>
    </div>
  );
}
