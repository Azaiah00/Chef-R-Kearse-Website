/**
 * PREP AND SHOPPING LIST GENERATOR
 *
 * When a menu locks, this turns it into the two things the kitchen actually
 * needs: a shopping list grouped by where you stand in the shop, and a prep
 * schedule counting backwards from service. Nobody else in this market gives a
 * client that, and it is the feature most likely to make the chef say "how did
 * you know I do it that way".
 *
 * ── A NECESSARY HONESTY NOTE, ALSO PRINTED IN THE UI ────────────────────────
 * The component lines below are derived from what is plainly VISIBLE in each of
 * the chef's photographs — the same basis as the dish titles in
 * src/lib/dishes.ts. They are not his recipes, and the quantities are
 * conventional catering yields, not his. They exist so the generator can be
 * demonstrated end to end on real menu selections.
 *
 * The moment he gives us his real component lists and yields, this map is
 * replaced and the generated lists become genuinely useful rather than
 * illustrative. Until then every generated list carries the notice below, and
 * the item is on the CONFIRM WITH CLIENT list in CONTEXT.md.
 */

import type { MenuDraft } from "./types";
import { bySlug } from "../dishes";

export const PREP_DISCLAIMER =
  "Component lines and quantities are conventional catering estimates derived from what is visible in the photographs. They are not Chef Kearse's recipes or yields — he replaces them in Settings, and until he does this list is for demonstration only.";

export type Section =
  | "Seafood"
  | "Butcher"
  | "Produce"
  | "Dairy & eggs"
  | "Pantry & dry goods"
  | "Bakery"
  | "Bar & non-food";

export const SECTION_ORDER: Section[] = [
  "Seafood",
  "Butcher",
  "Produce",
  "Dairy & eggs",
  "Pantry & dry goods",
  "Bakery",
  "Bar & non-food",
];

interface Component {
  item: string;
  section: Section;
  /** Quantity per guest. */
  per: number;
  unit: string;
  /** Round the scaled total up to this increment (e.g. buy whole lemons). */
  step?: number;
}

/**
 * Prep tasks are expressed as hours before service, so the schedule can be
 * generated for any event time. `-24` means the day before.
 */
interface PrepTask {
  label: string;
  hoursBefore: number;
}

interface DishSpec {
  components: Component[];
  prep: PrepTask[];
  /**
   * Allergen groups plainly visible in the photograph. NEVER presented to a
   * guest as a dietary claim — used only to flag conflicts for staff, always
   * alongside the cross-contamination notice.
   */
  visibleAllergens: string[];
}

const SPECS: Record<string, DishSpec> = {
  "garden-salad": {
    components: [
      { item: "Mixed salad leaves", section: "Produce", per: 0.09, unit: "lb" },
      { item: "Tomatoes", section: "Produce", per: 0.12, unit: "lb" },
      { item: "Cucumber", section: "Produce", per: 0.1, unit: "each", step: 1 },
      { item: "Red onion", section: "Produce", per: 0.05, unit: "each", step: 1 },
      { item: "Olive oil and vinegar", section: "Pantry & dry goods", per: 0.02, unit: "bottle", step: 1 },
    ],
    prep: [
      { label: "Wash and spin leaves", hoursBefore: 6 },
      { label: "Cut tomato, cucumber, onion", hoursBefore: 4 },
      { label: "Dress and plate", hoursBefore: 0.5 },
    ],
    visibleAllergens: [],
  },
  "clam-chowder": {
    components: [
      { item: "Clams", section: "Seafood", per: 0.33, unit: "lb" },
      { item: "Potatoes", section: "Produce", per: 0.2, unit: "lb" },
      { item: "Onion and celery", section: "Produce", per: 0.1, unit: "lb" },
      { item: "Heavy cream", section: "Dairy & eggs", per: 0.15, unit: "pint" },
      { item: "Butter", section: "Dairy & eggs", per: 0.04, unit: "lb" },
      { item: "Bacon or salt pork", section: "Butcher", per: 0.04, unit: "lb" },
    ],
    prep: [
      { label: "Purge and steam clams, reserve liquor", hoursBefore: 24 },
      { label: "Build chowder base", hoursBefore: 20 },
      { label: "Reheat gently, finish with cream", hoursBefore: 1 },
    ],
    visibleAllergens: ["Shellfish", "Dairy"],
  },
  "mango-salsa-plated": {
    components: [
      { item: "Mango", section: "Produce", per: 0.35, unit: "each", step: 1 },
      { item: "Sweet peppers, red and green", section: "Produce", per: 0.3, unit: "each", step: 1 },
      { item: "Red onion", section: "Produce", per: 0.12, unit: "each", step: 1 },
      { item: "Cilantro", section: "Produce", per: 0.1, unit: "bunch", step: 1 },
      { item: "Limes", section: "Produce", per: 0.3, unit: "each", step: 1 },
    ],
    prep: [
      { label: "Dice mango, pepper and onion", hoursBefore: 5 },
      { label: "Dress with lime, rest and season", hoursBefore: 2 },
    ],
    visibleAllergens: [],
  },
  "mango-salsa-platter": {
    components: [
      { item: "Mango", section: "Produce", per: 0.4, unit: "each", step: 1 },
      { item: "Sweet peppers", section: "Produce", per: 0.35, unit: "each", step: 1 },
      { item: "Red onion", section: "Produce", per: 0.12, unit: "each", step: 1 },
      { item: "Cilantro", section: "Produce", per: 0.1, unit: "bunch", step: 1 },
      { item: "Limes", section: "Produce", per: 0.35, unit: "each", step: 1 },
    ],
    prep: [
      { label: "Dice all salsa components", hoursBefore: 5 },
      { label: "Dress and build platter", hoursBefore: 1.5 },
    ],
    visibleAllergens: [],
  },
  "mango-salsa-detail": {
    components: [
      { item: "Mango", section: "Produce", per: 0.25, unit: "each", step: 1 },
      { item: "Sweet peppers", section: "Produce", per: 0.2, unit: "each", step: 1 },
      { item: "Limes", section: "Produce", per: 0.25, unit: "each", step: 1 },
    ],
    prep: [{ label: "Fine-dice for passed service", hoursBefore: 4 }],
    visibleAllergens: [],
  },
  "stuffed-shrimp-platter": {
    components: [
      { item: "Large shrimp, shell on", section: "Seafood", per: 0.4, unit: "lb" },
      { item: "Crab meat for stuffing", section: "Seafood", per: 0.12, unit: "lb" },
      { item: "Breadcrumbs", section: "Pantry & dry goods", per: 0.04, unit: "lb" },
      { item: "Butter", section: "Dairy & eggs", per: 0.04, unit: "lb" },
      { item: "Lemons", section: "Produce", per: 0.25, unit: "each", step: 1 },
    ],
    prep: [
      { label: "Peel, devein and butterfly shrimp", hoursBefore: 24 },
      { label: "Mix stuffing", hoursBefore: 20 },
      { label: "Stuff and tray", hoursBefore: 6 },
      { label: "Bake to order", hoursBefore: 0.5 },
    ],
    visibleAllergens: ["Shellfish", "Dairy", "Gluten"],
  },
  "crab-stuffed-golden": {
    components: [
      { item: "Crab meat", section: "Seafood", per: 0.22, unit: "lb" },
      { item: "White fish fillet", section: "Seafood", per: 0.3, unit: "lb" },
      { item: "Breadcrumbs", section: "Pantry & dry goods", per: 0.04, unit: "lb" },
      { item: "Eggs", section: "Dairy & eggs", per: 0.2, unit: "each", step: 1 },
      { item: "Butter", section: "Dairy & eggs", per: 0.04, unit: "lb" },
    ],
    prep: [
      { label: "Pick crab, check for shell", hoursBefore: 24 },
      { label: "Mix and portion stuffing", hoursBefore: 20 },
      { label: "Assemble and tray", hoursBefore: 6 },
      { label: "Bake in batches", hoursBefore: 0.75 },
    ],
    visibleAllergens: ["Shellfish", "Fish", "Dairy", "Gluten", "Egg"],
  },
  "crab-stuffed-plated": {
    components: [
      { item: "Crab meat", section: "Seafood", per: 0.2, unit: "lb" },
      { item: "White fish fillet", section: "Seafood", per: 0.28, unit: "lb" },
      { item: "Butter", section: "Dairy & eggs", per: 0.04, unit: "lb" },
      { item: "Asparagus", section: "Produce", per: 0.15, unit: "lb" },
    ],
    prep: [
      { label: "Pick crab, check for shell", hoursBefore: 24 },
      { label: "Assemble portions", hoursBefore: 6 },
      { label: "Bake and plate", hoursBefore: 0.5 },
    ],
    visibleAllergens: ["Shellfish", "Fish", "Dairy"],
  },
  "shrimp-grits-sausage": {
    components: [
      { item: "Shrimp", section: "Seafood", per: 0.3, unit: "lb" },
      { item: "Smoked sausage", section: "Butcher", per: 0.15, unit: "lb" },
      { item: "Stone-ground grits", section: "Pantry & dry goods", per: 0.09, unit: "lb" },
      { item: "Sharp cheese", section: "Dairy & eggs", per: 0.05, unit: "lb" },
      { item: "Heavy cream", section: "Dairy & eggs", per: 0.08, unit: "pint" },
      { item: "Scallions", section: "Produce", per: 0.1, unit: "bunch", step: 1 },
    ],
    prep: [
      { label: "Peel and devein shrimp", hoursBefore: 24 },
      { label: "Slice and render sausage", hoursBefore: 8 },
      { label: "Cook grits, hold warm", hoursBefore: 2 },
      { label: "Sear shrimp to order", hoursBefore: 0.25 },
    ],
    visibleAllergens: ["Shellfish", "Dairy"],
  },
  "shrimp-sausage-cream": {
    components: [
      { item: "Shrimp", section: "Seafood", per: 0.3, unit: "lb" },
      { item: "Smoked sausage", section: "Butcher", per: 0.15, unit: "lb" },
      { item: "Heavy cream", section: "Dairy & eggs", per: 0.12, unit: "pint" },
      { item: "Butter", section: "Dairy & eggs", per: 0.04, unit: "lb" },
      { item: "Garlic and shallot", section: "Produce", per: 0.06, unit: "lb" },
      { item: "Parsley", section: "Produce", per: 0.08, unit: "bunch", step: 1 },
    ],
    prep: [
      { label: "Peel and devein shrimp", hoursBefore: 24 },
      { label: "Render sausage, build cream base", hoursBefore: 4 },
      { label: "Finish to order", hoursBefore: 0.25 },
    ],
    visibleAllergens: ["Shellfish", "Dairy"],
  },
  "lamb-chops-asparagus": {
    components: [
      { item: "Lamb rack, frenched", section: "Butcher", per: 0.75, unit: "lb" },
      { item: "Asparagus", section: "Produce", per: 0.2, unit: "lb" },
      { item: "Fresh herbs — parsley, thyme, rosemary", section: "Produce", per: 0.15, unit: "bunch", step: 1 },
      { item: "Breadcrumbs for the crust", section: "Pantry & dry goods", per: 0.03, unit: "lb" },
      { item: "Lemons", section: "Produce", per: 0.35, unit: "each", step: 1 },
      { item: "Garlic", section: "Produce", per: 0.04, unit: "lb" },
    ],
    prep: [
      { label: "Trim and french racks", hoursBefore: 24 },
      { label: "Blitz herb crust", hoursBefore: 20 },
      { label: "Season and crust chops", hoursBefore: 5 },
      { label: "Trim and blanch asparagus", hoursBefore: 4 },
      { label: "Roast chops in batches, rest 8 minutes", hoursBefore: 0.75 },
    ],
    visibleAllergens: ["Gluten"],
  },
  "snapper-mango-salsa": {
    components: [
      { item: "Whole snapper fillet", section: "Seafood", per: 0.45, unit: "lb" },
      { item: "Mango", section: "Produce", per: 0.35, unit: "each", step: 1 },
      { item: "Sweet peppers", section: "Produce", per: 0.3, unit: "each", step: 1 },
      { item: "Red onion", section: "Produce", per: 0.12, unit: "each", step: 1 },
      { item: "Cilantro", section: "Produce", per: 0.1, unit: "bunch", step: 1 },
      { item: "Limes", section: "Produce", per: 0.3, unit: "each", step: 1 },
    ],
    prep: [
      { label: "Portion and pin-bone fillets", hoursBefore: 24 },
      { label: "Dice and dress salsa", hoursBefore: 5 },
      { label: "Roast fish, finish under heat", hoursBefore: 0.5 },
    ],
    visibleAllergens: ["Fish"],
  },
  "lobster-tail-plated": {
    components: [
      { item: "Lobster tails", section: "Seafood", per: 1, unit: "each", step: 1 },
      { item: "Butter", section: "Dairy & eggs", per: 0.08, unit: "lb" },
      { item: "Lemons", section: "Produce", per: 0.35, unit: "each", step: 1 },
      { item: "Parsley", section: "Produce", per: 0.08, unit: "bunch", step: 1 },
    ],
    prep: [
      { label: "Split and clean tails", hoursBefore: 8 },
      { label: "Clarify butter", hoursBefore: 6 },
      { label: "Broil to order", hoursBefore: 0.25 },
    ],
    visibleAllergens: ["Shellfish", "Dairy"],
  },
  "lobster-shrimp-linguine": {
    components: [
      { item: "Lobster tails", section: "Seafood", per: 0.6, unit: "each", step: 1 },
      { item: "Shrimp", section: "Seafood", per: 0.22, unit: "lb" },
      { item: "Linguine", section: "Pantry & dry goods", per: 0.18, unit: "lb" },
      { item: "Butter", section: "Dairy & eggs", per: 0.07, unit: "lb" },
      { item: "Garlic", section: "Produce", per: 0.05, unit: "lb" },
      { item: "Parsley", section: "Produce", per: 0.08, unit: "bunch", step: 1 },
    ],
    prep: [
      { label: "Split tails, peel shrimp", hoursBefore: 24 },
      { label: "Build garlic butter", hoursBefore: 6 },
      { label: "Cook pasta 2 minutes under", hoursBefore: 1 },
      { label: "Finish pasta in the pan to order", hoursBefore: 0.25 },
    ],
    visibleAllergens: ["Shellfish", "Dairy", "Gluten"],
  },
  "smoked-beef-sliced": {
    components: [
      { item: "Beef roast for smoking", section: "Butcher", per: 0.7, unit: "lb" },
      { item: "Cracked black peppercorn", section: "Pantry & dry goods", per: 0.01, unit: "lb" },
      { item: "Coarse salt", section: "Pantry & dry goods", per: 0.01, unit: "lb" },
      { item: "Smoking wood", section: "Bar & non-food", per: 0.05, unit: "bag", step: 1 },
    ],
    prep: [
      { label: "Trim and rub the roast", hoursBefore: 30 },
      { label: "Dry-brine uncovered, refrigerated", hoursBefore: 26 },
      { label: "Light the smoker", hoursBefore: 9 },
      { label: "Smoke to temperature", hoursBefore: 8 },
      { label: "Rest, then carve at the table", hoursBefore: 0.5 },
    ],
    visibleAllergens: [],
  },
  "blackened-roast": {
    components: [
      { item: "Beef or pork roast", section: "Butcher", per: 0.7, unit: "lb" },
      { item: "Blackening spice", section: "Pantry & dry goods", per: 0.02, unit: "lb" },
      { item: "Onions for the tray", section: "Produce", per: 0.25, unit: "each", step: 1 },
    ],
    prep: [
      { label: "Season heavily, rest overnight", hoursBefore: 24 },
      { label: "Sear all faces", hoursBefore: 5 },
      { label: "Roast, rest, carve", hoursBefore: 1 },
    ],
    visibleAllergens: [],
  },
  "smothered-chicken": {
    components: [
      { item: "Chicken, bone-in pieces", section: "Butcher", per: 0.6, unit: "lb" },
      { item: "Onions", section: "Produce", per: 0.35, unit: "each", step: 1 },
      { item: "Flour for the roux", section: "Pantry & dry goods", per: 0.04, unit: "lb" },
      { item: "Stock", section: "Pantry & dry goods", per: 0.2, unit: "quart" },
      { item: "Butter", section: "Dairy & eggs", per: 0.04, unit: "lb" },
    ],
    prep: [
      { label: "Season chicken, rest overnight", hoursBefore: 24 },
      { label: "Brown chicken, build the gravy", hoursBefore: 5 },
      { label: "Braise until tender", hoursBefore: 3 },
      { label: "Reheat and hold", hoursBefore: 0.5 },
    ],
    visibleAllergens: ["Gluten", "Dairy"],
  },
  "seafood-crab-roast": {
    components: [
      { item: "Crab clusters", section: "Seafood", per: 0.6, unit: "lb" },
      { item: "Shrimp", section: "Seafood", per: 0.25, unit: "lb" },
      { item: "Corn on the cob", section: "Produce", per: 0.5, unit: "each", step: 1 },
      { item: "New potatoes", section: "Produce", per: 0.2, unit: "lb" },
      { item: "Smoked sausage", section: "Butcher", per: 0.12, unit: "lb" },
      { item: "Butter", section: "Dairy & eggs", per: 0.09, unit: "lb" },
      { item: "Seafood boil seasoning", section: "Pantry & dry goods", per: 0.02, unit: "lb" },
    ],
    prep: [
      { label: "Thaw and clean crab", hoursBefore: 24 },
      { label: "Par-cook potatoes and corn", hoursBefore: 4 },
      { label: "Build the boil, finish in butter", hoursBefore: 1 },
    ],
    visibleAllergens: ["Shellfish", "Dairy"],
  },
  "baked-stuffed-platter": {
    components: [
      { item: "White fish fillet", section: "Seafood", per: 0.35, unit: "lb" },
      { item: "Crab meat for stuffing", section: "Seafood", per: 0.15, unit: "lb" },
      { item: "Breadcrumbs", section: "Pantry & dry goods", per: 0.04, unit: "lb" },
      { item: "Butter", section: "Dairy & eggs", per: 0.05, unit: "lb" },
      { item: "Lemons", section: "Produce", per: 0.3, unit: "each", step: 1 },
    ],
    prep: [
      { label: "Portion fish, mix stuffing", hoursBefore: 20 },
      { label: "Assemble and tray", hoursBefore: 6 },
      { label: "Bake and platter", hoursBefore: 0.75 },
    ],
    visibleAllergens: ["Fish", "Shellfish", "Dairy", "Gluten"],
  },
  "fried-fish-hushpuppies": {
    components: [
      { item: "White fish fillet", section: "Seafood", per: 0.4, unit: "lb" },
      { item: "Cornmeal", section: "Pantry & dry goods", per: 0.12, unit: "lb" },
      { item: "Frying oil", section: "Pantry & dry goods", per: 0.1, unit: "quart" },
      { item: "Buttermilk", section: "Dairy & eggs", per: 0.08, unit: "pint" },
      { item: "Onion for the hushpuppies", section: "Produce", per: 0.12, unit: "each", step: 1 },
    ],
    prep: [
      { label: "Portion fish, soak in buttermilk", hoursBefore: 12 },
      { label: "Mix hushpuppy batter, rest", hoursBefore: 3 },
      { label: "Bring oil to temperature", hoursBefore: 1 },
      { label: "Fry in batches to order", hoursBefore: 0.25 },
    ],
    visibleAllergens: ["Fish", "Gluten", "Dairy"],
  },
  "creme-brulee-torch": {
    components: [
      { item: "Heavy cream", section: "Dairy & eggs", per: 0.22, unit: "pint" },
      { item: "Egg yolks", section: "Dairy & eggs", per: 1.6, unit: "each", step: 1 },
      { item: "Caster sugar", section: "Pantry & dry goods", per: 0.06, unit: "lb" },
      { item: "Vanilla", section: "Pantry & dry goods", per: 0.02, unit: "pod", step: 1 },
      { item: "Butane for the torch", section: "Bar & non-food", per: 0.02, unit: "canister", step: 1 },
    ],
    prep: [
      { label: "Infuse cream, temper yolks", hoursBefore: 26 },
      { label: "Bake custards in a bain-marie", hoursBefore: 24 },
      { label: "Chill fully", hoursBefore: 12 },
      { label: "Sugar and torch at the table", hoursBefore: 0.25 },
    ],
    visibleAllergens: ["Dairy", "Egg"],
  },
  "dessert-strawberries": {
    components: [
      { item: "Strawberries", section: "Produce", per: 0.22, unit: "lb" },
      { item: "Heavy cream", section: "Dairy & eggs", per: 0.1, unit: "pint" },
      { item: "Sugar", section: "Pantry & dry goods", per: 0.03, unit: "lb" },
      { item: "Shortcake or sponge", section: "Bakery", per: 1, unit: "portion", step: 1 },
    ],
    prep: [
      { label: "Hull and macerate strawberries", hoursBefore: 6 },
      { label: "Whip cream", hoursBefore: 1 },
      { label: "Assemble to order", hoursBefore: 0.25 },
    ],
    visibleAllergens: ["Dairy", "Gluten"],
  },
};

/* ───────────────────────────────────────────────────────────── outputs ───── */

export interface ShoppingLine {
  item: string;
  section: Section;
  quantity: number;
  unit: string;
  /** Which selected dishes contributed to this line. */
  forDishes: string[];
}

export interface PrepStep {
  label: string;
  hoursBefore: number;
  dish: string;
  /** Rendered clock time when the event's service time is known. */
  when: string | null;
}

export interface GeneratedPrep {
  shopping: { section: Section; lines: ShoppingLine[] }[];
  prep: PrepStep[];
  /** Dishes selected that have no component data yet. */
  unmapped: string[];
  /** Allergen groups visible across the selected menu. */
  allergensPresent: string[];
  /** Guest restrictions that collide with the selected menu. */
  conflicts: { guest: string; restriction: string; dishes: string[] }[];
  disclaimer: string;
}

function roundTo(value: number, step: number | undefined): number {
  if (!step) return Math.round(value * 10) / 10;
  return Math.ceil(value / step) * step;
}

/**
 * Restriction → allergen groups it collides with.
 * Deliberately conservative: it flags for a human rather than clearing a dish.
 */
const RESTRICTION_MAP: Record<string, string[]> = {
  "shellfish allergy": ["Shellfish"],
  shellfish: ["Shellfish"],
  vegetarian: ["Shellfish", "Fish"],
  vegan: ["Shellfish", "Fish", "Dairy", "Egg"],
  "gluten-free": ["Gluten"],
  gluten: ["Gluten"],
  "dairy-free": ["Dairy"],
  "lactose intolerant": ["Dairy"],
  "nut allergy": ["Nuts"],
  pescatarian: [],
  halal: [],
  kosher: ["Shellfish"],
  diabetic: [],
  "no pork": [],
  "no beef": [],
  "low sodium": [],
};

function restrictionGroups(restriction: string): string[] {
  const key = restriction.trim().toLowerCase();
  if (RESTRICTION_MAP[key]) return RESTRICTION_MAP[key];
  // Substring fallback so "Severe shellfish allergy" still matches.
  for (const [k, v] of Object.entries(RESTRICTION_MAP)) {
    if (key.includes(k)) return v;
  }
  return [];
}

export function generatePrep(menu: MenuDraft, serviceTime?: string | null): GeneratedPrep {
  const selected = menu.courses.flatMap((c) => c.selected);
  const guests = Math.max(1, menu.guestCount);

  const lineMap = new Map<string, ShoppingLine>();
  const prep: PrepStep[] = [];
  const unmapped: string[] = [];
  const allergens = new Set<string>();
  const dishAllergens = new Map<string, string[]>();

  for (const slug of selected) {
    const spec = SPECS[slug];
    const title = bySlug(slug)?.title ?? slug;
    if (!spec) {
      unmapped.push(title);
      continue;
    }
    for (const c of spec.components) {
      const key = `${c.item}|${c.unit}`;
      const existing = lineMap.get(key);
      const qty = c.per * guests;
      if (existing) {
        existing.quantity += qty;
        if (!existing.forDishes.includes(title)) existing.forDishes.push(title);
      } else {
        lineMap.set(key, {
          item: c.item,
          section: c.section,
          quantity: qty,
          unit: c.unit,
          forDishes: [title],
        });
      }
    }
    for (const t of spec.prep) {
      prep.push({ label: t.label, hoursBefore: t.hoursBefore, dish: title, when: null });
    }
    for (const a of spec.visibleAllergens) allergens.add(a);
    dishAllergens.set(title, spec.visibleAllergens);
  }

  // Round every line once, at the end, so combined quantities round sensibly.
  for (const line of lineMap.values()) {
    const step = Object.values(SPECS)
      .flatMap((s) => s.components)
      .find((c) => c.item === line.item && c.unit === line.unit)?.step;
    line.quantity = roundTo(line.quantity, step);
  }

  const bySection = SECTION_ORDER.map((section) => ({
    section,
    lines: [...lineMap.values()]
      .filter((l) => l.section === section)
      .sort((a, b) => a.item.localeCompare(b.item)),
  })).filter((g) => g.lines.length > 0);

  // Clock times, when we know when service starts.
  if (serviceTime) {
    const parsed = parseServiceTime(serviceTime);
    if (parsed !== null) {
      for (const step of prep) {
        const totalMinutes = parsed - Math.round(step.hoursBefore * 60);
        step.when = formatClock(totalMinutes);
      }
    }
  }

  prep.sort((a, b) => b.hoursBefore - a.hoursBefore);

  const conflicts: GeneratedPrep["conflicts"] = [];
  for (const guest of menu.guestDietary) {
    for (const restriction of guest.restrictions) {
      const groups = restrictionGroups(restriction);
      if (groups.length === 0) continue;
      const clashing = [...dishAllergens.entries()]
        .filter(([, a]) => a.some((x) => groups.includes(x)))
        .map(([title]) => title);
      if (clashing.length > 0) {
        conflicts.push({ guest: guest.label, restriction, dishes: clashing });
      }
    }
  }

  return {
    shopping: bySection,
    prep,
    unmapped,
    allergensPresent: [...allergens].sort(),
    conflicts,
    disclaimer: PREP_DISCLAIMER,
  };
}

/** "6:30 PM" → minutes past midnight, or null if unparseable. */
function parseServiceTime(value: string): number | null {
  const m = /^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i.exec(value.trim());
  if (!m) return null;
  let h = Number(m[1]);
  const min = Number(m[2]);
  const mer = m[3]?.toUpperCase();
  if (mer === "PM" && h !== 12) h += 12;
  if (mer === "AM" && h === 12) h = 0;
  if (h > 23 || min > 59) return null;
  return h * 60 + min;
}

/** Minutes past midnight, possibly negative, → "Day before, 4:00 PM". */
function formatClock(totalMinutes: number): string {
  let minutes = totalMinutes;
  let dayLabel = "";
  while (minutes < 0) {
    minutes += 1440;
    dayLabel = dayLabel === "" ? "Day before, " : "Two days before, ";
  }
  const h24 = Math.floor(minutes / 60) % 24;
  const m = minutes % 60;
  const mer = h24 >= 12 ? "PM" : "AM";
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${dayLabel}${h12}:${String(m).padStart(2, "0")} ${mer}`;
}

/** Plain-text export for the shopping list, used by the download control. */
export function shoppingListText(menu: MenuDraft, generated: GeneratedPrep, leadName: string): string {
  const lines: string[] = [
    `SHOPPING LIST — ${leadName}`,
    `${menu.serviceStyle} · ${menu.guestCount} guests · menu v${menu.version}`,
    "",
    PREP_DISCLAIMER,
    "",
  ];
  for (const group of generated.shopping) {
    lines.push(group.section.toUpperCase());
    for (const l of group.lines) {
      lines.push(`  [ ] ${l.quantity} ${l.unit}  ${l.item}`);
    }
    lines.push("");
  }
  if (generated.allergensPresent.length > 0) {
    lines.push(`ALLERGENS VISIBLE ACROSS THIS MENU: ${generated.allergensPresent.join(", ")}`);
    lines.push(
      "Prepared in a kitchen that handles shellfish, fish, dairy, egg, gluten and nuts. Cross-contact cannot be ruled out.",
    );
  }
  return lines.join("\n");
}
