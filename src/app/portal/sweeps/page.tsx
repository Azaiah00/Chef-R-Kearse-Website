import { requireRolePage } from "@/lib/portal/guard";
import { getProspects, getSweeps, openCorrections } from "@/lib/portal/lead-store";
import { Card, longDate } from "@/components/portal/Ui";
import { IconAlert, IconCheck } from "@/components/portal/Icons";

export const metadata = { title: "Search history" };

/**
 * The engine's own working record — including, deliberately, what it failed to do.
 *
 * Corrections are published rather than hidden because a tool that shows its own
 * failures is one you believe about everything else, and a tool that silently
 * drops what it could not check is one you stop trusting the first time you catch
 * it. There is no version of this that is better quiet.
 */
export default async function SweepsPage() {
  await requireRolePage("owner");
  const sweeps = [...getSweeps()].sort((a, b) => b.run - a.run);
  const open = openCorrections();
  const prospects = getProspects();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="t-h3">Search history</h1>
        <p className="p-muted mt-1 text-sm">
          What the weekly search looked at, what it found, and what it could not confirm
        </p>
      </header>

      {open.length > 0 ? (
        <Card
          title="Open questions"
          action={<IconAlert className="h-4 w-4 p-warn" />}
        >
          <div className="p-card-pad space-y-4">
            <p className="text-sm leading-relaxed">
              {open.length} {open.length === 1 ? "thing" : "things"} the search tried to check
              and could not. They are listed rather than quietly dropped.
            </p>
            {open.map((c, i) => (
              <div key={`${c.run}-${c.subject}`} className="p-hairline pt-3">
                <p className="flex flex-wrap items-center gap-2">
                  <span className="p-badge p-band-C">{c.label}</span>
                  <span className="text-sm font-medium">{c.subject}</span>
                  {i === 0 ? (
                    <span className="p-badge p-band-B">Worth the most</span>
                  ) : null}
                </p>
                <p className="p-muted mt-1.5 text-[0.8125rem] leading-relaxed">{c.what}</p>
              </div>
            ))}
          </div>
        </Card>
      ) : null}

      {sweeps.map((s) => {
        const found = prospects.filter((p) => p.sweepRun === s.run).length;
        const resolved = s.corrections.filter((c) => c.resolvedISO !== null);
        const unresolved = s.corrections.filter((c) => c.resolvedISO === null);

        return (
          <Card
            key={s.run}
            title={`${s.label} — ${longDate(s.iso)}`}
            action={
              <span className="p-muted text-[0.75rem]">
                {found} {found === 1 ? "prospect" : "prospects"}
              </span>
            }
          >
            <div className="p-card-pad">
              <h3 className="p-title">What was checked</h3>
              <ul className="p-guide-list mt-2">
                {s.sourcesSwept.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>

              <h3 className="p-title mt-5">Corrections</h3>
              <div className="mt-2 space-y-3">
                {/* Open ones first — a resolved correction is history, an open
                    one is a thing somebody still has to do. */}
                {unresolved.map((c) => (
                  <div key={c.subject} className="flex gap-2.5">
                    <IconAlert className="h-4 w-4 shrink-0 p-warn" />
                    <div className="min-w-0 flex-1">
                      <p className="text-[0.8125rem] font-medium">{c.subject}</p>
                      <p className="p-muted mt-0.5 text-[0.8125rem] leading-relaxed">{c.what}</p>
                    </div>
                  </div>
                ))}
                {resolved.map((c) => (
                  <div key={c.subject} className="flex gap-2.5 opacity-70">
                    <IconCheck className="h-4 w-4 shrink-0 p-ok" />
                    <div className="min-w-0 flex-1">
                      <p className="text-[0.8125rem] font-medium">{c.subject}</p>
                      <p className="p-muted mt-0.5 text-[0.8125rem] leading-relaxed">
                        {c.what} — settled {longDate(c.resolvedISO!)}
                      </p>
                    </div>
                  </div>
                ))}
                {s.corrections.length === 0 ? (
                  <p className="p-muted text-[0.8125rem]">
                    Nothing failed on this run.
                  </p>
                ) : null}
              </div>
            </div>
          </Card>
        );
      })}

      <Card title="Why the failures are on display">
        <div className="p-card-pad text-[0.8125rem] leading-relaxed">
          <p>
            Anything the search tried to verify and could not is written down here rather than
            left out. So is anything it got wrong on a previous run and later corrected.
          </p>
          <p className="p-muted mt-2">
            That is on purpose. A system that only ever shows you what it got right is one you
            cannot calibrate — the first time you catch it quietly dropping something, you stop
            believing the rest. Everything on a prospect card is checkable, and the things that
            are not checked yet say so.
          </p>
        </div>
      </Card>
    </div>
  );
}
