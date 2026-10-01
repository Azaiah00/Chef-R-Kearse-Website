"use client";

import { useState } from "react";
import type { Campaign, CampaignAsset } from "@/lib/portal/types";
import { Card } from "./Ui";
import { IconChevron, IconDownload, IconMail, IconMegaphone, IconSpark } from "./Icons";

const KIND_LABEL: Record<CampaignAsset["kind"], string> = {
  email: "Email",
  social: "Social",
  ad: "Ad brief",
  "prompt-sheet": "Image prompts",
  plan: "Strategy",
};

/**
 * Every campaign, with its creative sitting right there to download.
 *
 * The brief was explicit: the campaign design should already be in the portal,
 * ready for him to take. So nothing here is a "coming soon" — each file is
 * written, in the repository, and served from /public/marketing.
 */
export default function CampaignList({
  campaigns,
  masterPlan,
}: {
  campaigns: Campaign[];
  masterPlan: CampaignAsset;
}) {
  const [open, setOpen] = useState<string | null>(campaigns[0]?.id ?? null);

  return (
    <Card
      title="Campaigns and creative"
      action={
        <span className="p-muted text-[0.8125rem]">
          {campaigns.reduce((s, c) => s + c.assets.length, 0) + 1} files
        </span>
      }
    >
      {/* The plan itself, first, because it explains everything under it. */}
      <div className="p-card-pad p-hairline border-t-0">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="flex items-center gap-2 text-[0.9375rem] font-medium">
              <IconSpark className="p-ok h-4 w-4 shrink-0" />
              {masterPlan.title}
            </p>
            <p className="p-muted mt-1 max-w-prose text-[0.8125rem] leading-snug">
              {masterPlan.description}
            </p>
          </div>
          <a href={masterPlan.file} download className="p-btn p-btn-sm p-btn-primary shrink-0">
            <IconDownload className="h-4 w-4" />
            Download
          </a>
        </div>
      </div>

      <ul className="divide-y divide-[color:var(--color-line-dark)]">
        {campaigns.map((c) => {
          const isOpen = open === c.id;
          const bookRate = c.kpi.enquiries === 0 ? null : c.kpi.booked / c.kpi.enquiries;
          return (
            <li key={c.id}>
              <div className="px-5 py-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-[0.9375rem] font-medium">{c.name}</p>
                      <span
                        className={`p-badge ${c.status === "live" ? "p-ok" : c.status === "seasonal" ? "p-warn" : "p-muted"}`}
                      >
                        {c.status}
                      </span>
                      {c.channels.map((ch) => (
                        <span key={ch} className="p-badge p-muted">
                          {ch}
                        </span>
                      ))}
                    </div>
                    <p className="p-muted mt-1.5 max-w-prose text-[0.8125rem] leading-snug">
                      {c.goal}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="p-btn p-btn-sm shrink-0"
                    aria-expanded={isOpen}
                    onClick={() => setOpen(isOpen ? null : c.id)}
                  >
                    {c.assets.length} file{c.assets.length === 1 ? "" : "s"}
                    <IconChevron
                      className={`h-4 w-4 transition-transform ${isOpen ? "rotate-90" : ""}`}
                    />
                  </button>
                </div>

                <dl className="mt-3 grid gap-x-6 gap-y-2 sm:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <dt className="p-title">Who it goes to</dt>
                    <dd className="mt-1 text-[0.8125rem] leading-snug">{c.audience}</dd>
                  </div>
                  <div>
                    <dt className="p-title">How often</dt>
                    <dd className="mt-1 text-[0.8125rem] leading-snug">{c.cadence}</dd>
                  </div>
                  <div>
                    <dt className="p-title">Enquiries</dt>
                    <dd className="mt-1 text-[0.8125rem] tabular-nums">{c.kpi.enquiries}</dd>
                  </div>
                  <div>
                    <dt className="p-title">Booked</dt>
                    <dd className="mt-1 text-[0.8125rem] tabular-nums">
                      {c.kpi.booked}
                      {bookRate !== null ? (
                        <span className="p-muted"> · {Math.round(bookRate * 100)}% of enquiries</span>
                      ) : null}
                    </dd>
                  </div>
                </dl>

                {isOpen ? (
                  <ul className="p-hairline mt-4 space-y-2.5 pt-4">
                    {c.assets.map((a) => (
                      <li key={a.id} className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="flex flex-wrap items-center gap-2 text-[0.875rem] font-medium">
                            {a.kind === "email" ? (
                              <IconMail className="p-muted h-4 w-4 shrink-0" />
                            ) : (
                              <IconMegaphone className="p-muted h-4 w-4 shrink-0" />
                            )}
                            {a.title}
                            <span className="p-badge p-muted">{KIND_LABEL[a.kind]}</span>
                          </p>
                          <p className="p-muted mt-1 text-[0.8125rem] leading-snug">
                            {a.description}
                          </p>
                        </div>
                        <div className="flex shrink-0 gap-2">
                          {a.kind === "email" ? (
                            <a
                              href={a.file}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-btn p-btn-sm"
                            >
                              Preview
                            </a>
                          ) : null}
                          <a href={a.file} download className="p-btn p-btn-sm">
                            <IconDownload className="h-4 w-4" />
                            <span className="sr-only">Download {a.title}</span>
                          </a>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
