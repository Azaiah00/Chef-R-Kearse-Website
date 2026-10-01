/**
 * Shared Zod schemas for the outbound engine's route handlers.
 *
 * These live here rather than in a route file because a Next.js route module may
 * only export the HTTP verbs and a short list of config names — exporting a
 * schema from one fails the build with "does not match the required types of a
 * Next.js Route". Two routes need the source schema, so it belongs in lib.
 */

import { z } from "zod";

export const scoreInputSchema = z.object({
  dateFit: z.enum(["prime-open", "open", "tight", "unknown", "unavailable"]),
  freshness: z.enum(["this-month", "this-quarter", "this-year", "stale"]),
  access: z.enum(["named-decision-maker", "named-contact", "department", "switchboard"]),
  spendEvidence: z.enum(["disclosed-figure", "strong-proxy", "weak-proxy", "none"]),
  distanceMiles: z.number().min(0).max(10000).nullable(),
  repeatability: z.enum(["recurring-list", "recurring-events", "annual", "one-off"]),
  incumbency: z.enum(["open-lane", "weak-incumbent", "strong-incumbent", "exclusive"]),
  brandFit: z.enum(["flagship", "good", "neutral", "off-brand"]),
  effort: z.enum(["low", "medium", "high"]),
});

/**
 * A source with a blank or short note is rejected, deliberately and at the API
 * boundary.
 *
 * The note is the field that says what a source establishes AND what it does
 * not, and the whole engine's credibility rests on it: a caller who repeats a
 * fact that was never verified loses the account. Enforcing it here means no
 * client, no script and no future agent can add an uncited claim through a form.
 */
export const sourceSchema = z.object({
  label: z.string().trim().min(1).max(200),
  url: z.string().trim().url().max(600),
  kind: z.enum(["organization", "directory", "search", "news", "filing", "statute"]),
  retrievedISO: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  note: z
    .string()
    .trim()
    .min(40, "the note must say what this source establishes and, explicitly, what it does not"),
});
