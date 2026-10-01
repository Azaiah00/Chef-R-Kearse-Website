import Link from "next/link";
import { requireStaff } from "@/lib/portal/guard";
import { getLeads, getMessages } from "@/lib/portal/store";
import { Card, EmptyState, StageBadge, relativeTime, shortDate } from "@/components/portal/Ui";
import { IconArrowRight, IconChat } from "@/components/portal/Icons";

export const metadata = { title: "Messages" };

export default async function MessagesPage() {
  await requireStaff();

  const threads = getLeads()
    .map((lead) => {
      const messages = getMessages(lead.id);
      const last = messages[messages.length - 1];
      const unread = messages.filter((m) => m.authorType === "client" && !m.readByStaff).length;
      return { lead, messages, last, unread };
    })
    .filter((t) => t.messages.length > 0)
    // Unread first, then most recent.
    .sort((a, b) => {
      if (a.unread !== b.unread) return b.unread - a.unread;
      return (b.last?.at ?? "").localeCompare(a.last?.at ?? "");
    });

  const totalUnread = threads.reduce((s, t) => s + t.unread, 0);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="t-h3">Messages</h1>
        <p className="p-muted mt-1 text-sm">
          {threads.length} conversation{threads.length === 1 ? "" : "s"}
          {totalUnread > 0 ? ` · ${totalUnread} waiting on a reply` : " · nothing waiting"}
        </p>
      </header>

      <Card title="Conversations">
        {threads.length === 0 ? (
          <EmptyState
            title="No conversations yet."
            body="Every message a guest sends from their own event page lands here, and so does every reply."
          />
        ) : (
          <ul className="divide-y divide-[color:var(--color-line-dark)]">
            {threads.map(({ lead, last, unread, messages }) => (
              <li key={lead.id}>
                <Link
                  href={`/portal/leads/${lead.id}`}
                  className="flex items-start gap-3 px-5 py-4 transition-colors hover:bg-[color:color-mix(in_srgb,var(--color-bone)_4%,transparent)]"
                >
                  <span
                    className={`mt-1 h-2 w-2 shrink-0 rounded-full ${unread > 0 ? "bg-[color:var(--color-accent-soft)]" : "bg-transparent"}`}
                    aria-hidden="true"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-baseline gap-2">
                      <span className={`text-sm ${unread > 0 ? "font-semibold" : "font-medium"}`}>
                        {lead.name}
                      </span>
                      <StageBadge stage={lead.stage} />
                      {unread > 0 ? (
                        <span className="p-badge p-band-B">
                          {unread} unread
                        </span>
                      ) : null}
                    </span>
                    <span className="p-muted mt-0.5 block text-[0.75rem]">
                      {lead.ref} · {shortDate(lead.eventDate)} · {lead.guestCount} guests ·{" "}
                      {messages.length} message{messages.length === 1 ? "" : "s"}
                    </span>
                    {last ? (
                      <span className="mt-1.5 block text-[0.8125rem] leading-snug">
                        <span className="p-muted">
                          {last.authorType === "staff" ? "You: " : ""}
                        </span>
                        <span className="line-clamp-2">{last.body}</span>
                      </span>
                    ) : null}
                  </span>
                  <span className="shrink-0 text-right">
                    {last ? (
                      <span className="p-muted block text-[0.6875rem]">
                        {relativeTime(last.at)}
                      </span>
                    ) : null}
                    <IconArrowRight className="p-muted mt-2 ml-auto h-4 w-4" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card title="How this works">
        <div className="p-card-pad">
          <p className="flex items-start gap-2 text-[0.8125rem] leading-relaxed">
            <IconChat className="p-muted mt-0.5 h-4 w-4 shrink-0" />
            <span>
              A guest never needs an account or a password. Their event page arrives as a link in
              their confirmation email and everything about their booking lives there — the menu,
              the timings, the documents and this conversation. Replies show whether the chef
              himself or the office answered, because for a private chef that is the point.
            </span>
          </p>
        </div>
      </Card>
    </div>
  );
}
