"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { Message, StaffRole } from "@/lib/portal/types";
import { relativeTime } from "./Ui";
import { IconArrowRight } from "./Icons";

/**
 * One thread component serves both sides.
 *
 * Staff see it inside the enquiry; the guest sees the same conversation on their
 * own event page. Guests can see which of the two replied — the chef or the
 * office — because "did the chef himself answer me" is information a guest
 * actually wants, and hiding it behind a generic brand voice loses the very
 * thing a private chef is selling.
 */
export default function Thread({
  leadId,
  messages,
  as,
  authorName,
  authorRole,
  token,
}: {
  leadId: string;
  messages: Message[];
  as: "staff" | "client";
  authorName: string;
  authorRole?: StaffRole;
  /** Client-portal token, required when `as` is "client". */
  token?: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const disabled = busy || pending;

  async function send() {
    const text = body.trim();
    if (text.length === 0) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/portal/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leadId,
          as,
          authorName,
          authorRole: authorRole ?? null,
          body: text,
          token,
        }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setError(data.error ?? "That did not send.");
        setBusy(false);
        return;
      }
      setBody("");
      startTransition(() => router.refresh());
      setBusy(false);
    } catch {
      setError("Could not reach the server.");
      setBusy(false);
    }
  }

  const mineIsStaff = as === "staff";

  return (
    <div>
      {messages.length === 0 ? (
        <p className="p-muted px-5 py-6 text-center text-sm">
          No messages yet. Anything sent here reaches{" "}
          {as === "staff" ? "the guest on their own event page" : "Chef Kearse and his office"}.
        </p>
      ) : (
        <ul className="space-y-3 px-5 py-4">
          {messages.map((m) => {
            const isMine = mineIsStaff ? m.authorType === "staff" : m.authorType === "client";
            return (
              <li key={m.id} className={isMine ? "flex justify-end" : "flex justify-start"}>
                <div className={`max-w-[85%] ${isMine ? "text-right" : ""}`}>
                  <p className="p-muted text-[0.6875rem]">
                    {m.authorName}
                    {m.authorType === "staff" && m.authorRole ? (
                      <span> · {m.authorRole === "owner" ? "the chef" : "the office"}</span>
                    ) : null}{" "}
                    · {relativeTime(m.at)}
                  </p>
                  <div
                    className={`mt-1 inline-block rounded-md border px-3.5 py-2.5 text-left text-[0.875rem] leading-relaxed ${
                      isMine
                        ? "border-[color:var(--color-accent)] bg-[color:color-mix(in_srgb,var(--color-accent)_16%,transparent)]"
                        : "border-[color:var(--color-line-dark)] bg-[color:var(--color-ink)]"
                    }`}
                  >
                    {m.body}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <div className="p-hairline px-5 py-4">
        <label htmlFor={`reply-${leadId}`} className="p-title block">
          {as === "staff" ? "Reply to the guest" : "Send a message"}
        </label>
        <textarea
          id={`reply-${leadId}`}
          className="p-textarea mt-2"
          rows={3}
          value={body}
          disabled={disabled}
          placeholder={
            as === "staff"
              ? "They see this on their own event page, and get an email that it is there."
              : "Ask anything about the menu, the timings or the day itself."
          }
          onChange={(e) => setBody(e.target.value)}
          onKeyDown={(e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "Enter") void send();
          }}
        />
        <div className="mt-2 flex items-center justify-between gap-3">
          <p className="p-muted text-[0.75rem]">Ctrl or Cmd + Enter sends</p>
          <button
            type="button"
            className="p-btn p-btn-primary p-btn-sm"
            disabled={disabled || body.trim().length === 0}
            onClick={send}
          >
            {busy ? "Sending…" : "Send"}
            {busy ? null : <IconArrowRight className="h-4 w-4" />}
          </button>
        </div>
        {error ? (
          <p role="alert" className="p-bad mt-2 text-[0.8125rem]">
            {error}
          </p>
        ) : null}
      </div>
    </div>
  );
}
