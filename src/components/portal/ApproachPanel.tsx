"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { Approach, ApproachChannel } from "@/lib/portal/lead-types";
import { IconChat, IconCheck, IconMail, IconPhone, IconUsers } from "./Icons";

/**
 * The same approach, written for every way of making it.
 *
 * COLLAPSED BY DEFAULT, and only on the prospect's own page. Five scripts in an
 * open panel is five screens of text between the caller and the phone number;
 * five scripts on the board would make the board unreadable. So: one line per
 * channel, and the words appear when somebody asks for them.
 *
 * Channels rated "avoid" are shown, not hidden. A script that says "do not use
 * Instagram here, and here is why" is more useful than a missing tab, because
 * the question "should I just DM them?" gets asked either way and this answers
 * it once.
 */

const CHANNELS: {
  key: ApproachChannel;
  label: string;
  icon: (p: { className?: string }) => React.ReactElement;
}[] = [
  { key: "phone", label: "On the phone", icon: IconPhone },
  { key: "email", label: "By email", icon: IconMail },
  { key: "in-person", label: "In person", icon: IconUsers },
  { key: "social", label: "On social", icon: IconChat },
  { key: "text", label: "By text", icon: IconChat },
];

const SUITABILITY: Record<Approach["suitability"], { label: string; band: string }> = {
  good: { label: "Best way in", band: "p-band-A" },
  workable: { label: "Works", band: "p-band-B" },
  avoid: { label: "Don't", band: "p-band-D" },
};

export default function ApproachPanel({
  prospectId,
  approaches,
}: {
  prospectId: string;
  approaches: Approach[];
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [copied, setCopied] = useState<string | null>(null);
  const [drafted, setDrafted] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (approaches.length === 0) return null;

  const ordered = CHANNELS.map((c) => ({
    ...c,
    approach: approaches.find((a) => a.channel === c.key),
  })).filter((c) => c.approach);

  const best = ordered.filter((c) => c.approach!.suitability === "good").map((c) => c.label);

  async function copy(text: string, key: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      setError("Could not copy — select the text and copy it by hand.");
    }
  }

  /** Turns a written approach into a real outreach record, which is the thing
   *  that then counts in the backlog. Until somebody picks one, nothing does. */
  async function draftFrom(a: Approach, label: string) {
    setError(null);
    try {
      const res = await fetch("/api/portal/outreach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prospectId,
          channel: a.channel === "social" || a.channel === "text" ? "form" : a.channel,
          subject: `${label} — from the written approach`,
          body: a.body,
        }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setError(data.error ?? "Could not save that.");
        return;
      }
      setDrafted(a.channel);
      startTransition(() => router.refresh());
    } catch {
      setError("Could not reach the server.");
    }
  }

  return (
    <div className="p-card">
      <div className="p-card-head">
        <h2 className="p-title">How to approach them</h2>
        <span className="p-muted text-[0.75rem]">
          {best.length > 0 ? `Best: ${best.join(", ").toLowerCase()}` : "Read the notes first"}
        </span>
      </div>

      <div className="p-card-pad">
        <p className="p-muted text-[0.8125rem] leading-relaxed">
          The same approach written five ways. Open whichever one you are actually going to do.
          Where a channel would do more harm than good it says so, and says why.
        </p>

        {error ? (
          <p className="p-bad mt-2 text-sm" role="alert">
            {error}
          </p>
        ) : null}

        <div className="mt-3 space-y-2">
          {ordered.map(({ key, label, icon: Icon, approach }) => {
            const a = approach!;
            const s = SUITABILITY[a.suitability];
            return (
              <details key={key} className="p-approach">
                <summary className="p-approach-summary">
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="flex-1 text-left">{label}</span>
                  <span className={`p-badge ${s.band}`}>{s.label}</span>
                </summary>

                <div className="p-approach-body">
                  <p className="p-muted text-[0.8125rem] leading-relaxed">
                    <strong className="text-[color:var(--color-bone)]">When:</strong>{" "}
                    {a.whenToUse}
                  </p>
                  <p
                    className={`mt-1.5 text-[0.8125rem] leading-relaxed ${a.suitability === "avoid" ? "p-warn" : "p-muted"}`}
                  >
                    {a.note}
                  </p>

                  <pre className="p-approach-script">{a.body}</pre>

                  {a.suitability !== "avoid" ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        type="button"
                        className="p-btn p-btn-sm"
                        onClick={() => void copy(a.body, key)}
                      >
                        {copied === key ? (
                          <>
                            <IconCheck className="h-4 w-4" />
                            Copied
                          </>
                        ) : (
                          "Copy the words"
                        )}
                      </button>
                      <button
                        type="button"
                        className="p-btn p-btn-sm p-btn-primary"
                        disabled={drafted === key}
                        onClick={() => void draftFrom(a, label)}
                      >
                        {drafted === key ? "Added to Letters" : "I'm going to use this"}
                      </button>
                    </div>
                  ) : null}
                </div>
              </details>
            );
          })}
        </div>

        <p className="p-muted p-hairline mt-4 pt-3 text-[0.8125rem] leading-relaxed">
          These are scripts, not messages waiting to be sent — they do not show up in the
          backlog on the briefing. Press &ldquo;I&apos;m going to use this&rdquo; and it becomes
          a real draft under Letters, which is the point at which it starts counting.
        </p>
      </div>
    </div>
  );
}
