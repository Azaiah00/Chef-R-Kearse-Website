import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/portal/auth";
import {
  addGuestDietary,
  addMenuComment,
  getLeadByClientToken,
  getMenu,
  removeGuestDietary,
  setMenuSelection,
  setMenuStatus,
  toggleMenuAddOn,
} from "@/lib/portal/store";

const base = {
  as: z.enum(["staff", "client"]),
  authorName: z.string().min(1).max(120),
  token: z.string().max(120).optional(),
};

const schema = z.discriminatedUnion("action", [
  z.object({ ...base, action: z.literal("select"), courseId: z.string().max(60), slugs: z.array(z.string().max(80)).max(12) }),
  z.object({ ...base, action: z.literal("addon"), addOnId: z.string().max(60) }),
  z.object({
    ...base,
    action: z.literal("status"),
    status: z.enum(["draft", "submitted", "changes_requested", "locked"]),
  }),
  z.object({ ...base, action: z.literal("comment"), courseId: z.string().max(60).nullable(), body: z.string().min(1).max(4000) }),
  z.object({
    ...base,
    action: z.literal("add-guest"),
    label: z.string().min(1).max(120),
    restrictions: z.array(z.string().max(60)).min(1).max(12),
    notes: z.string().max(1000),
  }),
  z.object({ ...base, action: z.literal("remove-guest"), guestId: z.string().max(60) }),
]);

export async function POST(request: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const menu = getMenu(id);
  if (!menu) return NextResponse.json({ ok: false, error: "No such menu." }, { status: 404 });

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Malformed request." }, { status: 400 });
  }

  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Unrecognised action." }, { status: 400 });
  }
  const input = parsed.data;

  /* ── Authorisation ───────────────────────────────────────────────────────
     Staff prove themselves with the session cookie. A guest proves themselves
     with a token that must resolve to the lead this menu belongs to, so holding
     one valid link never grants access to another event's menu.                */
  let actorName: string;
  if (input.as === "staff") {
    const session = await getSession();
    if (!session) return NextResponse.json({ ok: false, error: "Not signed in." }, { status: 401 });
    actorName = session.name;
  } else {
    if (!input.token) {
      return NextResponse.json({ ok: false, error: "Link is missing or expired." }, { status: 401 });
    }
    const lead = getLeadByClientToken(input.token);
    if (!lead || lead.id !== menu.leadId) {
      return NextResponse.json({ ok: false, error: "Link is not valid for this menu." }, { status: 403 });
    }
    actorName = lead.name;
  }

  // A locked menu is locked. Only staff may reopen it, and nothing else may
  // change while it is locked — that guarantee is what the shopping list and the
  // kitchen's ordering depend on.
  const isReopen = input.action === "status" && input.status === "draft";
  if (menu.status === "locked" && !(input.as === "staff" && isReopen)) {
    return NextResponse.json(
      { ok: false, error: "This menu is locked. Ask the chef to reopen it." },
      { status: 409 },
    );
  }

  // Guests may not lock a menu or mark their own changes as requested.
  if (input.as === "client" && input.action === "status" && input.status !== "submitted") {
    return NextResponse.json(
      { ok: false, error: "Only the chef can do that." },
      { status: 403 },
    );
  }

  switch (input.action) {
    case "select":
      setMenuSelection(menu.id, input.courseId, input.slugs);
      break;
    case "addon":
      toggleMenuAddOn(menu.id, input.addOnId);
      break;
    case "status":
      setMenuStatus(menu.id, input.status, actorName);
      break;
    case "comment":
      addMenuComment(menu.id, input.as, actorName, input.courseId, input.body);
      break;
    case "add-guest":
      addGuestDietary(menu.id, input.label, input.restrictions, input.notes);
      break;
    case "remove-guest":
      removeGuestDietary(menu.id, input.guestId);
      break;
  }

  return NextResponse.json({ ok: true });
}
