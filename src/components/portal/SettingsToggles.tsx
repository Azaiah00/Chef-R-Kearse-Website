"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Card } from "./Ui";
import { IconSpark } from "./Icons";

export default function SettingsToggles({
  assistantSeesFinancials,
}: {
  assistantSeesFinancials: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [busy, setBusy] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function post(body: Record<string, unknown>) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/portal/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setError(data.error ?? "That did not save.");
        setBusy(false);
        return;
      }
      startTransition(() => router.refresh());
      setBusy(false);
    } catch {
      setError("Could not reach the server.");
      setBusy(false);
    }
  }

  const disabled = busy || pending;

  return (
    <Card title="Who sees what">
      <div className="p-card-pad">
        <label htmlFor="fin-toggle" className="flex cursor-pointer items-start gap-3">
          <input
            id="fin-toggle"
            type="checkbox"
            checked={assistantSeesFinancials}
            disabled={disabled}
            onChange={(e) => post({ action: "assistant-financials", value: e.target.checked })}
            className="mt-1 h-4 w-4 shrink-0 accent-[color:var(--color-accent)]"
          />
          <span>
            <span className="block text-[0.9375rem] font-medium">
              Let your assistant see revenue figures
            </span>
            <span className="p-muted mt-1 block max-w-prose text-[0.8125rem] leading-relaxed">
              Off by default, and deliberately so. She needs the diary, the guests and the
              run-sheets to do her job — not what each event is worth. With this off, quoted
              values, booked values, deposit amounts and every revenue panel are not merely hidden
              from her screen: they are never fetched or sent to her browser at all. Turn it on the
              day she starts invoicing.
            </span>
          </span>
        </label>

        <div className="p-hairline mt-5 pt-5">
          <p className="p-title">Reset the demonstration</p>
          <p className="p-muted mt-2 max-w-prose text-[0.8125rem] leading-relaxed">
            Puts every enquiry, menu, message and campaign back to how it started. Useful before
            showing somebody, or after clicking around.
          </p>
          {confirmReset ? (
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                className="p-btn p-btn-sm p-btn-primary"
                disabled={disabled}
                onClick={async () => {
                  await post({ action: "reset-demo" });
                  setConfirmReset(false);
                }}
              >
                Yes, reset it
              </button>
              <button
                type="button"
                className="p-btn p-btn-sm"
                onClick={() => setConfirmReset(false)}
              >
                Leave it
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="p-btn p-btn-sm mt-3"
              onClick={() => setConfirmReset(true)}
            >
              <IconSpark className="h-4 w-4" />
              Reset the demo data
            </button>
          )}
        </div>

        {error ? (
          <p role="alert" className="p-bad mt-4 text-[0.8125rem]">
            {error}
          </p>
        ) : null}
      </div>
    </Card>
  );
}
