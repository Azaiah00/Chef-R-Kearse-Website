import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/portal/auth";
import { BrainConfirmError, updateBrain } from "@/lib/portal/lead-store";

/**
 * The Kitchen Brain.
 *
 * OWNER ONLY. Every generated proposal, email, venue application and menu reads
 * from the Brain, so this is the one endpoint where an unconfirmed fact becomes a
 * confirmed one. The assistant must not be able to assert that he carries a
 * million in liability cover or holds a current ServSafe certificate — not
 * because she would do it dishonestly, but because she has no way to know, and a
 * venue application built on a wrong credential is worse than no application.
 *
 * The store additionally enforces that confirming a credential clears its
 * matching CONFIRM WITH CLIENT entry in the same write, and throws
 * BrainConfirmError otherwise. That surfaces here as a 400 with the explanation.
 */

const priceBandSchema = z.object({
  label: z.string().trim().min(1).max(120),
  perGuestLow: z.number().min(0).max(100000).nullable(),
  perGuestHigh: z.number().min(0).max(100000).nullable(),
  placeholder: z.boolean(),
});

const schema = z
  .object({
    legalName: z.string().trim().min(1).max(200).optional(),
    brandName: z.string().trim().min(1).max(200).optional(),
    phone: z.string().trim().max(40).optional(),
    tollFree: z.string().trim().max(40).nullable().optional(),
    email: z.string().trim().email().max(200).optional(),
    baseCity: z.string().trim().max(120).optional(),
    baseState: z.string().trim().max(40).optional(),
    serviceAreas: z.array(z.string().trim().min(1).max(160)).max(40).optional(),
    foundedYear: z.number().int().min(1800).max(2200).nullable().optional(),

    liabilityInsuranceLimit: z.number().min(0).max(1_000_000_000).nullable().optional(),
    insuranceCarrier: z.string().trim().max(200).nullable().optional(),
    servSafeHolder: z.string().trim().max(200).nullable().optional(),
    servSafeExpiryISO: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .nullable()
      .optional(),
    businessLicenceJurisdictions: z.array(z.string().trim().min(1).max(160)).max(40).optional(),
    healthPermitJurisdictions: z.array(z.string().trim().min(1).max(160)).max(40).optional(),
    swamCertified: z.boolean().nullable().optional(),
    evaRegistered: z.boolean().nullable().optional(),

    priceBands: z.array(priceBandSchema).max(20).optional(),
    travelRadiusMiles: z.number().min(0).max(5000).nullable().optional(),
    travelFeeNote: z.string().trim().max(2000).nullable().optional(),
    minimumNote: z.string().trim().max(2000).nullable().optional(),
    depositNote: z.string().trim().max(2000).nullable().optional(),
    cancellationNote: z.string().trim().max(2000).nullable().optional(),

    maxEventsPerWeek: z.number().int().min(0).max(100).nullable().optional(),
    minLeadTimeDays: z.number().int().min(0).max(365).nullable().optional(),

    capabilities: z.array(z.string().trim().min(1).max(300)).max(60).optional(),
    cuisines: z.array(z.string().trim().min(1).max(120)).max(60).optional(),
    confirmWithClient: z.array(z.string().trim().min(1).max(1000)).max(60).optional(),
  })
  .strict();

export async function PATCH(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ ok: false, error: "Not signed in." }, { status: 401 });
  if (session.role !== "owner") {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Only the owner can change the Kitchen Brain. Every proposal and venue application reads from it, so a credential has to be asserted by the person who holds it.",
      },
      { status: 403 },
    );
  }

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Malformed request." }, { status: 400 });
  }

  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return NextResponse.json(
      {
        ok: false,
        error: first ? `${first.path.join(".")}: ${first.message}` : "Could not read that.",
        issues: parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`),
      },
      { status: 400 },
    );
  }

  try {
    const brain = updateBrain(parsed.data, session.name);
    return NextResponse.json({ ok: true, confirmWithClient: brain.confirmWithClient.length });
  } catch (err) {
    if (err instanceof BrainConfirmError) {
      return NextResponse.json({ ok: false, error: err.message }, { status: 400 });
    }
    throw err;
  }
}
