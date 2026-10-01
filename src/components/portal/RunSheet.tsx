"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { EventDetail, StaffRole } from "@/lib/portal/types";
import { Card } from "./Ui";

export default function RunSheet({
  leadId,
  items,
  role,
}: {
  leadId: string;
  items: EventDetail["runSheet"];
  role: StaffRole;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [busyId, setBusyId] = useState<string | null>(null);
  const done = items.filter((i) => i.done).length;

  async function toggle(itemId: string) {
    setBusyId(itemId);
    await fetch(`/api/portal/events/${leadId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "toggle-run-sheet", itemId }),
    });
    startTransition(() => router.refresh());
    setBusyId(null);
  }

  return (
    <Card
      title="Run-sheet"
      action={
        <span className={`p-badge ${done === items.length ? "p-ok" : "p-muted"}`}>
          {done}/{items.length}
        </span>
      }
    >
      <div className="p-card-pad">
        <div className="p-meter mb-4">
          <span style={{ width: `${items.length === 0 ? 0 : Math.round((done / items.length) * 100)}%` }} />
        </div>
        <ul className="space-y-2.5">
          {items.map((item) => {
            const mine = item.owner === role;
            return (
              <li key={item.id}>
                <label className="p-check-row">
                  <input
                    type="checkbox"
                    checked={item.done}
                    disabled={busyId === item.id || pending}
                    onChange={() => toggle(item.id)}
                    className="mt-0.5 h-4 w-4 shrink-0 accent-[color:var(--color-accent)]"
                  />
                  <span className="min-w-0 flex-1">
                    <span
                      className={`block text-[0.8125rem] leading-snug ${item.done ? "p-muted line-through" : ""}`}
                    >
                      {item.label}
                    </span>
                    <span className="p-muted block text-[0.6875rem]">
                      {item.owner === "owner" ? "Chef" : "Office"}
                      {mine ? " · yours" : ""}
                    </span>
                  </span>
                </label>
              </li>
            );
          })}
        </ul>
      </div>
    </Card>
  );
}
