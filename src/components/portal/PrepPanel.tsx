"use client";

import { useState } from "react";
import type { GeneratedPrep } from "@/lib/portal/prep";
import type { MenuStatus } from "@/lib/portal/types";
import { Card } from "./Ui";
import { IconCart, IconClock, IconDownload, IconSpark } from "./Icons";

/**
 * The locked menu, turned into work.
 *
 * Two views of the same generated data: a shopping list grouped the way you
 * walk a shop, and a prep schedule counting backwards from the moment the first
 * course goes out. The download hands the shopping list over as a text file so
 * it can go on a phone or a clipboard without the portal being open.
 */
export default function PrepPanel({
  prep,
  menuStatus,
  guestCount,
  serviceTime,
}: {
  prep: GeneratedPrep;
  menuStatus: MenuStatus;
  guestCount: number;
  serviceTime: string | null;
}) {
  const [view, setView] = useState<"shopping" | "prep">("shopping");
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  const totalLines = prep.shopping.reduce((s, g) => s + g.lines.length, 0);
  const checkedCount = Object.values(checked).filter(Boolean).length;

  function download() {
    const lines: string[] = [];
    lines.push(`SHOPPING LIST — ${guestCount} guests`);
    lines.push("");
    lines.push(prep.disclaimer);
    lines.push("");
    for (const group of prep.shopping) {
      lines.push(group.section.toUpperCase());
      for (const l of group.lines) lines.push(`  [ ] ${l.quantity} ${l.unit}  ${l.item}`);
      lines.push("");
    }
    if (prep.allergensPresent.length > 0) {
      lines.push(`ALLERGENS VISIBLE ACROSS THIS MENU: ${prep.allergensPresent.join(", ")}`);
      lines.push(
        "Prepared in a kitchen that handles shellfish, fish, dairy, egg, gluten and nuts. Cross-contact cannot be ruled out.",
      );
      lines.push("");
    }
    lines.push("PREP SCHEDULE");
    for (const p of prep.prep) {
      lines.push(`  ${p.when ?? `${p.hoursBefore}h before`}  —  ${p.label} (${p.dish})`);
    }

    const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "shopping-and-prep.txt";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  if (totalLines === 0) {
    return (
      <Card title="Shopping and prep">
        <p className="p-card-pad p-muted text-[0.8125rem] leading-relaxed">
          Nothing to generate yet — choose dishes on the menu and the list builds itself.
        </p>
      </Card>
    );
  }

  return (
    <Card
      title="Shopping and prep"
      action={
        <button type="button" onClick={download} className="p-btn p-btn-sm">
          <IconDownload className="h-4 w-4" />
          Download
        </button>
      }
    >
      <div className="p-card-pad p-hairline border-t-0">
        <p className="flex items-start gap-2 text-[0.8125rem] leading-relaxed">
          <IconSpark className="p-ok mt-0.5 h-4 w-4 shrink-0" />
          <span>
            Generated from the {menuStatus === "locked" ? "locked" : "current"} menu, scaled to{" "}
            {guestCount} guests
            {serviceTime ? `, counted back from ${serviceTime}` : ""}. It rebuilds itself whenever
            the menu or the headcount changes.
          </span>
        </p>
      </div>

      <div className="p-card-pad p-hairline flex gap-2">
        <button
          type="button"
          onClick={() => setView("shopping")}
          className={`p-btn p-btn-sm ${view === "shopping" ? "p-btn-primary" : ""}`}
          aria-pressed={view === "shopping"}
        >
          <IconCart className="h-4 w-4" />
          Shopping · {totalLines}
        </button>
        <button
          type="button"
          onClick={() => setView("prep")}
          className={`p-btn p-btn-sm ${view === "prep" ? "p-btn-primary" : ""}`}
          aria-pressed={view === "prep"}
        >
          <IconClock className="h-4 w-4" />
          Prep · {prep.prep.length}
        </button>
      </div>

      {view === "shopping" ? (
        <div>
          {checkedCount > 0 ? (
            <p className="p-card-pad p-muted p-hairline text-[0.75rem] tabular-nums">
              {checkedCount} of {totalLines} picked up
            </p>
          ) : null}
          <ul className="divide-y divide-[color:var(--color-line-dark)]">
            {prep.shopping.map((group) => (
              <li key={group.section} className="px-5 py-3.5">
                <p className="p-title">{group.section}</p>
                <ul className="mt-2 space-y-1.5">
                  {group.lines.map((line) => {
                    const key = `${group.section}-${line.item}`;
                    const isChecked = Boolean(checked[key]);
                    return (
                      <li key={key}>
                        <label className="p-check-row">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() =>
                              setChecked((prev) => ({ ...prev, [key]: !prev[key] }))
                            }
                            className="mt-1 h-4 w-4 shrink-0 accent-[color:var(--color-accent)]"
                          />
                          <span className={`min-w-0 flex-1 ${isChecked ? "p-muted line-through" : ""}`}>
                            <span className="text-[0.875rem]">
                              <span className="font-medium tabular-nums">
                                {line.quantity} {line.unit}
                              </span>{" "}
                              {line.item}
                            </span>
                            <span className="p-muted block text-[0.6875rem] leading-snug">
                              {line.forDishes.join(" · ")}
                            </span>
                          </span>
                        </label>
                      </li>
                    );
                  })}
                </ul>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <ol className="divide-y divide-[color:var(--color-line-dark)]">
          {prep.prep.map((step, i) => (
            <li key={i} className="flex items-start gap-3 px-5 py-2.5">
              <span className="w-[8.5rem] shrink-0 text-[0.8125rem] font-medium tabular-nums">
                {step.when ?? `${step.hoursBefore}h before`}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[0.875rem] leading-snug">{step.label}</span>
                <span className="p-muted block text-[0.6875rem]">{step.dish}</span>
              </span>
            </li>
          ))}
        </ol>
      )}

      {prep.unmapped.length > 0 ? (
        <p className="p-card-pad p-hairline p-warn text-[0.8125rem] leading-snug">
          No component list yet for: {prep.unmapped.join(", ")}. Add one in Settings and it joins
          the list automatically.
        </p>
      ) : null}

      <p className="p-card-pad p-hairline p-muted text-[0.75rem] leading-relaxed">{prep.disclaimer}</p>
    </Card>
  );
}
