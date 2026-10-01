"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { MenuDraft } from "@/lib/portal/types";
import { bySlug, dishSrc } from "@/lib/dishes";
import { Card, relativeTime } from "./Ui";
import { IconAlert, IconCheck, IconLock, IconPlus, IconTrash } from "./Icons";

/**
 * THE MENU BUILDER
 *
 * Used by the guest on their own event page and by the chef in the portal. One
 * component, two audiences, one source of truth — so there is never a version of
 * the menu that only one side can see.
 *
 * What makes it worth building rather than emailing a PDF back and forth:
 *   • The guest picks from the chef's own photographed work, so they choose what
 *     they have actually seen.
 *   • They enter their guests' restrictions, and the builder flags the dishes
 *     that collide, per guest, before anybody is embarrassed at a table.
 *   • Comments sit on the course they refer to, so "can we change the fish"
 *     never gets lost in an email chain.
 *   • Locking is explicit and one-way, and the locked menu is what generates the
 *     shopping and prep list on the kitchen side.
 *
 * Prices: nothing is priced here. No verified price exists for this business, so
 * showing an estimate would be inventing one. The panel says so plainly and the
 * chef turns real numbers on in Settings.
 */

const COMMON_RESTRICTIONS = [
  "Vegetarian",
  "Vegan",
  "Gluten-free",
  "Dairy-free",
  "Shellfish allergy",
  "Nut allergy",
  "No pork",
  "No beef",
  "Halal",
  "Kosher",
  "Diabetic",
  "Low sodium",
];

interface Conflict {
  guest: string;
  restriction: string;
  dishes: string[];
}

export default function MenuBuilder({
  menu,
  as,
  authorName,
  token,
  conflicts,
}: {
  menu: MenuDraft;
  as: "staff" | "client";
  authorName: string;
  token?: string;
  /** Computed server-side from the same data the kitchen sees. */
  conflicts: Conflict[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [commentFor, setCommentFor] = useState<string | null>(null);
  const [commentBody, setCommentBody] = useState("");
  const [showAddGuest, setShowAddGuest] = useState(false);
  const [guestLabel, setGuestLabel] = useState("");
  const [guestRestrictions, setGuestRestrictions] = useState<string[]>([]);
  const [guestNotes, setGuestNotes] = useState("");

  const locked = menu.status === "locked";
  const disabled = busy || pending || locked;

  async function post(action: string, payload: Record<string, unknown> = {}) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/portal/menus/${menu.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, as, authorName, token, ...payload }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setError(data.error ?? "That did not save.");
        setBusy(false);
        return false;
      }
      startTransition(() => router.refresh());
      setBusy(false);
      return true;
    } catch {
      setError("Could not reach the server.");
      setBusy(false);
      return false;
    }
  }

  function togglePick(courseId: string, slug: string, picks: number, selected: string[]) {
    let next: string[];
    if (selected.includes(slug)) {
      next = selected.filter((s) => s !== slug);
    } else if (selected.length < picks) {
      next = [...selected, slug];
    } else {
      // At the limit: replace the oldest choice rather than silently refusing,
      // which is what people expect from a "pick two" control.
      next = [...selected.slice(1), slug];
    }
    void post("select", { courseId, slugs: next });
  }

  const totalChosen = menu.courses.reduce((s, c) => s + c.selected.length, 0);
  const totalNeeded = menu.courses.reduce((s, c) => s + c.picks, 0);
  const complete = totalChosen >= totalNeeded;

  const conflictsByDish = new Map<string, Conflict[]>();
  for (const c of conflicts) {
    for (const d of c.dishes) {
      const list = conflictsByDish.get(d) ?? [];
      list.push(c);
      conflictsByDish.set(d, list);
    }
  }

  return (
    <div className="space-y-6">
      {/* ── Status strip ───────────────────────────────────────────────────── */}
      <Card>
        <div className="p-card-pad">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <span
              className={`p-badge ${
                locked ? "p-ok" : menu.status === "submitted" ? "p-warn" : menu.status === "changes_requested" ? "p-bad" : "p-muted"
              }`}
            >
              {locked ? (
                <>
                  <IconLock className="h-3 w-3" /> Locked
                </>
              ) : menu.status === "changes_requested" ? (
                "Changes requested"
              ) : menu.status === "submitted" ? (
                "With the chef"
              ) : (
                "Draft"
              )}
            </span>
            <span className="p-muted text-[0.8125rem]">
              {menu.serviceStyle} · {menu.guestCount} guests · version {menu.version} · edited{" "}
              {relativeTime(menu.updatedAt)}
            </span>
          </div>

          <div className="mt-3 flex items-center gap-3">
            <div className="p-meter flex-1">
              <span style={{ width: `${Math.min(100, Math.round((totalChosen / totalNeeded) * 100))}%` }} />
            </div>
            <span className="p-muted shrink-0 text-[0.75rem] tabular-nums">
              {totalChosen}/{totalNeeded} chosen
            </span>
          </div>

          {locked ? (
            <p className="p-muted mt-3 text-[0.8125rem] leading-relaxed">
              This menu is locked{menu.lockedAt ? ` — ${relativeTime(menu.lockedAt)}` : ""}. Nothing
              can change it now, which is what lets the kitchen order and prep against it. If
              something must change, {as === "client" ? "send a message and the chef will reopen it" : "reopen it below"}.
            </p>
          ) : null}

          {/* Actions differ by side. */}
          <div className="mt-4 flex flex-wrap gap-2">
            {as === "client" && !locked ? (
              <button
                type="button"
                className="p-btn p-btn-primary p-btn-sm"
                disabled={busy || pending || !complete}
                onClick={() => post("status", { status: "submitted" })}
              >
                {complete ? "Send to the chef" : `Choose ${totalNeeded - totalChosen} more first`}
              </button>
            ) : null}

            {as === "staff" ? (
              <>
                {!locked ? (
                  <button
                    type="button"
                    className="p-btn p-btn-primary p-btn-sm"
                    disabled={busy || pending || !complete}
                    onClick={() => post("status", { status: "locked" })}
                  >
                    <IconLock className="h-4 w-4" />
                    Lock the menu
                  </button>
                ) : (
                  <button
                    type="button"
                    className="p-btn p-btn-sm"
                    disabled={busy || pending}
                    onClick={() => post("status", { status: "draft" })}
                  >
                    Reopen it
                  </button>
                )}
                {menu.status === "submitted" ? (
                  <button
                    type="button"
                    className="p-btn p-btn-sm"
                    disabled={busy || pending}
                    onClick={() => post("status", { status: "changes_requested" })}
                  >
                    Ask for changes
                  </button>
                ) : null}
              </>
            ) : null}
          </div>

          {error ? (
            <p role="alert" className="p-bad mt-3 text-[0.8125rem]">
              {error}
            </p>
          ) : null}
        </div>
      </Card>

      {/* ── Dietary conflicts, above the menu because they change choices. ── */}
      {conflicts.length > 0 ? (
        <Card title="Worth a look before you finish">
          <div className="p-card-pad">
            <p className="p-warn flex items-start gap-2 text-[0.8125rem] leading-relaxed">
              <IconAlert className="mt-0.5 h-4 w-4 shrink-0" />
              <span>
                {conflicts.length} of your guests have a restriction that clashes with something
                chosen. Nothing is blocked — the chef plates around this all the time — but he
                should know now rather than on the day.
              </span>
            </p>
            <ul className="mt-3 space-y-2">
              {conflicts.map((c, i) => (
                <li key={i} className="text-[0.8125rem] leading-snug">
                  <span className="font-medium">{c.guest}</span>{" "}
                  <span className="p-muted">— {c.restriction}</span>
                  <span className="p-muted"> clashes with </span>
                  {c.dishes.join(", ")}
                </li>
              ))}
            </ul>
          </div>
        </Card>
      ) : null}

      {/* ── The courses ────────────────────────────────────────────────────── */}
      {menu.courses.map((course) => {
        const courseComments = menu.comments.filter((c) => c.courseId === course.id);
        return (
          <Card
            key={course.id}
            title={course.name}
            action={
              <span className={`p-badge ${course.selected.length >= course.picks ? "p-ok" : "p-muted"}`}>
                choose {course.picks} · {course.selected.length} chosen
              </span>
            }
          >
            <div className="p-card-pad">
              <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {course.offered.map((slug) => {
                  const dish = bySlug(slug);
                  if (!dish) return null;
                  const isSelected = course.selected.includes(slug);
                  const dishConflicts = conflictsByDish.get(dish.title) ?? [];
                  return (
                    <li key={slug}>
                      <button
                        type="button"
                        disabled={disabled}
                        aria-pressed={isSelected}
                        onClick={() => togglePick(course.id, slug, course.picks, course.selected)}
                        className={`group block w-full overflow-hidden rounded-md border text-left transition-colors ${
                          isSelected
                            ? "border-[color:var(--color-accent)]"
                            : "border-[color:var(--color-line-dark)] hover:border-[color:var(--color-muted)]"
                        } ${disabled ? "cursor-default opacity-90" : "cursor-pointer"}`}
                      >
                        <span className="relative block aspect-[4/3] overflow-hidden bg-[color:var(--color-ink)]">
                          <Image
                            src={dishSrc(slug, 640)}
                            alt={dish.alt}
                            width={640}
                            height={480}
                            className="h-full w-full object-cover"
                            sizes="(min-width: 1024px) 20vw, (min-width: 640px) 40vw, 90vw"
                          />
                          {isSelected ? (
                            <span className="absolute top-2 right-2 grid h-7 w-7 place-items-center rounded-full bg-[color:var(--color-accent)] text-white">
                              <IconCheck className="h-4 w-4" />
                            </span>
                          ) : null}
                        </span>
                        <span className="block px-3 py-2.5">
                          <span className="block text-[0.875rem] leading-snug font-medium">
                            {dish.title}
                          </span>
                          <span className="p-muted mt-1 block text-[0.75rem] leading-snug">
                            {dish.note}
                          </span>
                          {dishConflicts.length > 0 ? (
                            <span className="p-warn mt-1.5 flex items-start gap-1 text-[0.6875rem] leading-snug">
                              <IconAlert className="mt-px h-3 w-3 shrink-0" />
                              <span>
                                Clashes with {dishConflicts.map((c) => c.guest).join(", ")}
                              </span>
                            </span>
                          ) : null}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>

              {/* Course-level conversation. */}
              {courseComments.length > 0 ? (
                <ul className="p-hairline mt-4 space-y-2.5 pt-4">
                  {courseComments.map((c) => (
                    <li key={c.id}>
                      <p className="p-muted text-[0.6875rem]">
                        {c.authorName}
                        {c.authorType === "staff" ? " · the chef" : ""} · {relativeTime(c.at)}
                      </p>
                      <p className="mt-0.5 text-[0.8125rem] leading-relaxed">{c.body}</p>
                    </li>
                  ))}
                </ul>
              ) : null}

              {commentFor === course.id ? (
                <div className="p-hairline mt-4 pt-4">
                  <label htmlFor={`comment-${course.id}`} className="p-title block">
                    A note on this course
                  </label>
                  <textarea
                    id={`comment-${course.id}`}
                    className="p-textarea mt-2"
                    rows={2}
                    value={commentBody}
                    onChange={(e) => setCommentBody(e.target.value)}
                    placeholder={
                      as === "client"
                        ? "Anything you want changed, asked or explained."
                        : "What the guest should know about this course."
                    }
                  />
                  <div className="mt-2 flex gap-2">
                    <button
                      type="button"
                      className="p-btn p-btn-sm p-btn-primary"
                      disabled={busy || pending || commentBody.trim().length === 0}
                      onClick={async () => {
                        const ok = await post("comment", {
                          courseId: course.id,
                          body: commentBody.trim(),
                        });
                        if (ok) {
                          setCommentBody("");
                          setCommentFor(null);
                        }
                      }}
                    >
                      Add the note
                    </button>
                    <button
                      type="button"
                      className="p-btn p-btn-sm"
                      onClick={() => {
                        setCommentFor(null);
                        setCommentBody("");
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  className="p-btn p-btn-sm mt-4"
                  onClick={() => {
                    setCommentFor(course.id);
                    setCommentBody("");
                  }}
                >
                  <IconPlus className="h-4 w-4" />
                  Add a note on this course
                </button>
              )}
            </div>
          </Card>
        );
      })}

      {/* ── Add-ons ────────────────────────────────────────────────────────── */}
      <Card title="Service and extras">
        <ul className="divide-y divide-[color:var(--color-line-dark)]">
          {menu.addOns.map((addOn) => (
            <li key={addOn.id} className="px-5">
              <label className="p-check-row">
                <input
                  type="checkbox"
                  checked={addOn.selected}
                  disabled={disabled}
                  onChange={() => post("addon", { addOnId: addOn.id })}
                  className="mt-1 h-4 w-4 shrink-0 accent-[color:var(--color-accent)]"
                />
                <span className="min-w-0 flex-1">
                  <span className="block text-[0.875rem] font-medium">{addOn.label}</span>
                  {addOn.note ? (
                    <span className="p-muted block text-[0.8125rem] leading-snug">{addOn.note}</span>
                  ) : null}
                </span>
              </label>
            </li>
          ))}
        </ul>
      </Card>

      {/* ── Guest dietary ──────────────────────────────────────────────────── */}
      <Card
        title="Who you're feeding"
        action={<span className="p-muted text-[0.8125rem]">{menu.guestDietary.length} noted</span>}
      >
        <div className="p-card-pad">
          <p className="p-muted text-[0.8125rem] leading-relaxed">
            Add anyone with an allergy or a way of eating. You do not need names — &ldquo;two
            vegetarians on table four&rdquo; is enough. The chef would rather know now.
          </p>

          {menu.guestDietary.length > 0 ? (
            <ul className="p-hairline mt-4 space-y-3 pt-4">
              {menu.guestDietary.map((g) => (
                <li key={g.id} className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[0.875rem] font-medium">{g.label}</p>
                    <ul className="mt-1 flex flex-wrap gap-1.5">
                      {g.restrictions.map((r) => (
                        <li key={r} className="p-badge p-warn">
                          {r}
                        </li>
                      ))}
                    </ul>
                    {g.notes ? (
                      <p className="p-muted mt-1 text-[0.8125rem] leading-snug">{g.notes}</p>
                    ) : null}
                  </div>
                  {!locked ? (
                    <button
                      type="button"
                      className="p-btn p-btn-sm shrink-0"
                      aria-label={`Remove ${g.label}`}
                      disabled={busy || pending}
                      onClick={() => post("remove-guest", { guestId: g.id })}
                    >
                      <IconTrash className="h-4 w-4" />
                    </button>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : null}

          {!locked ? (
            showAddGuest ? (
              <div className="p-hairline mt-4 pt-4">
                <label htmlFor="guest-label" className="p-title block">
                  Who
                </label>
                <input
                  id="guest-label"
                  className="p-input mt-2"
                  value={guestLabel}
                  onChange={(e) => setGuestLabel(e.target.value)}
                  placeholder="Aunt Rosalie, or “two guests on table 4”"
                />

                <p className="p-title mt-4">What to avoid</p>
                <ul className="mt-2 flex flex-wrap gap-1.5">
                  {COMMON_RESTRICTIONS.map((r) => {
                    const on = guestRestrictions.includes(r);
                    return (
                      <li key={r}>
                        <button
                          type="button"
                          aria-pressed={on}
                          onClick={() =>
                            setGuestRestrictions((prev) =>
                              prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r],
                            )
                          }
                          className={`p-badge ${on ? "p-warn" : "p-muted"}`}
                        >
                          {r}
                        </button>
                      </li>
                    );
                  })}
                </ul>

                <label htmlFor="guest-notes" className="p-title mt-4 block">
                  Anything else
                </label>
                <textarea
                  id="guest-notes"
                  className="p-textarea mt-2"
                  rows={2}
                  value={guestNotes}
                  onChange={(e) => setGuestNotes(e.target.value)}
                  placeholder="How serious it is, and anything the chef should know."
                />

                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    className="p-btn p-btn-sm p-btn-primary"
                    disabled={
                      busy || pending || guestLabel.trim().length === 0 || guestRestrictions.length === 0
                    }
                    onClick={async () => {
                      const ok = await post("add-guest", {
                        label: guestLabel.trim(),
                        restrictions: guestRestrictions,
                        notes: guestNotes.trim(),
                      });
                      if (ok) {
                        setGuestLabel("");
                        setGuestRestrictions([]);
                        setGuestNotes("");
                        setShowAddGuest(false);
                      }
                    }}
                  >
                    Add them
                  </button>
                  <button type="button" className="p-btn p-btn-sm" onClick={() => setShowAddGuest(false)}>
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button type="button" className="p-btn p-btn-sm mt-4" onClick={() => setShowAddGuest(true)}>
                <IconPlus className="h-4 w-4" />
                Add someone
              </button>
            )
          ) : null}

          <p className="p-muted p-hairline mt-4 pt-4 text-[0.75rem] leading-relaxed">
            Prepared in a kitchen that handles shellfish, fish, dairy, egg, gluten and nuts.
            Cross-contact cannot be ruled out, so anyone with a severe allergy should speak to the
            chef directly as well as noting it here.
          </p>
        </div>
      </Card>

      {/* ── Pricing, handled honestly. ─────────────────────────────────────── */}
      <Card title="What this costs">
        <div className="p-card-pad">
          <p className="text-[0.8125rem] leading-relaxed">
            Nothing on this page is priced, because Chef Kearse quotes every event on what it
            actually takes — the menu, the headcount, the service style and the venue. Your quote
            comes from him, not from a calculator.
          </p>
          <p className="p-muted mt-2 text-[0.8125rem] leading-relaxed">
            {as === "staff"
              ? "Turn on published pricing in Settings and a per-guest estimate appears here for the guest, clearly labelled as an estimate."
              : "Ask him anything about cost in the messages and you will get a real answer."}
          </p>
        </div>
      </Card>
    </div>
  );
}
