/**
 * Every image here is a real photograph of Chef R. Kearse's own work, pulled
 * from his Yelp business gallery and his Instagram (@chef.rkearse).
 *
 * IMPORTANT — naming policy: the titles below describe what is plainly visible
 * in each photograph. They are NOT claimed menu names, and no prices, allergen
 * or dietary claims are attached to any of them. The chef's own dish names and
 * descriptions should replace these (see CONTEXT.md → CONFIRM WITH CLIENT).
 */

export type DishCategory = "seafood" | "meat" | "southern" | "sweet" | "craft";

export interface Dish {
  slug: string;
  title: string;
  note: string;
  alt: string;
  w: number;
  h: number;
  category: DishCategory;
  /** Shown in the Signature rail on the home page */
  signature?: boolean;
}

export const dishes: Dish[] = [
  {
    slug: "snapper-mango-salsa",
    title: "Roasted Fish, Mango & Pepper Salsa",
    note: "A whole fillet finished under heat, buried in mango, sweet pepper, red onion and cilantro.",
    alt: "A long roasted fish fillet on a white platter, covered in diced mango, red and green pepper, red onion and cilantro, with an orchid laid at one end.",
    w: 1600,
    h: 1961,
    category: "seafood",
    signature: true,
  },
  {
    slug: "lamb-chops-asparagus",
    title: "Herb-Crusted Lamb Chops",
    note: "Frenched chops with a green herb crust, charred asparagus, roasted lemon alongside.",
    alt: "Two herb-crusted lamb chops resting on a white rectangular plate with grilled asparagus and a charred lemon half.",
    w: 1600,
    h: 1057,
    category: "meat",
    signature: true,
  },
  {
    slug: "lobster-shrimp-scampi",
    title: "Lobster Tail & Shrimp Scampi",
    note: "Split tail set over linguine with shrimp, garlic butter and a scatter of parsley.",
    alt: "A split lobster tail standing over linguine with several shrimp in a light garlic butter sauce, plated in a white bowl.",
    w: 1600,
    h: 2262,
    category: "seafood",
    signature: true,
  },
  {
    slug: "smoked-beef-sliced",
    title: "Smoked Beef, Sliced to Order",
    note: "A peppercorn bark, a clean smoke ring, carved at the table and served warm.",
    alt: "A slow-smoked beef roast carved into thick slices, showing a dark peppercorn crust and a rosy medium-rare centre.",
    w: 1600,
    h: 1057,
    category: "meat",
    signature: true,
  },
  {
    slug: "shrimp-grits-sausage",
    title: "Shrimp & Grits, Smoked Sausage",
    note: "Stone-ground grits under shrimp, sausage, peppers and onions in a golden pan sauce.",
    alt: "A wide white bowl of creamy grits topped with shrimp, sliced smoked sausage, orange peppers and red onion in a golden sauce.",
    w: 1600,
    h: 2572,
    category: "southern",
    signature: true,
  },
  {
    slug: "lobster-tail-plated",
    title: "Butter-Basted Lobster Tail",
    note: "Pulled from the shell, basted, and set back over the plate with a cream sauce.",
    alt: "A butter-basted lobster tail lifted from its shell and set back over it on a white plate with a pale cream sauce and fresh herbs.",
    w: 1600,
    h: 1057,
    category: "seafood",
    signature: true,
  },
  {
    slug: "seafood-crab-roast",
    title: "Crab Legs & Roasted Sides",
    note: "A tray built for the middle of the table — legs, roasted vegetables, everything hot at once.",
    alt: "A serving tray holding crab legs alongside roasted vegetables and browned potatoes.",
    w: 1600,
    h: 1081,
    category: "seafood",
  },
  {
    slug: "lobster-shrimp-linguine",
    title: "Lobster & Shrimp Linguine",
    note: "Two proteins, one pan sauce, finished so the pasta still carries it.",
    alt: "Lobster tail and shrimp arranged over linguine in a shallow white bowl with a light sauce and chopped herbs.",
    w: 1600,
    h: 2262,
    category: "seafood",
  },
  {
    slug: "lobster-tail-pasta",
    title: "Lobster Over Pasta",
    note: "Shell-on presentation, sauce spooned at the last second.",
    alt: "A lobster tail served shell-on over pasta with sauce spooned across the plate.",
    w: 1600,
    h: 1312,
    category: "seafood",
  },
  {
    slug: "shrimp-asparagus-potatoes",
    title: "Seared Shrimp, Asparagus, Roasted Potatoes",
    note: "A clean plate that travels well — the one that works for a seated dinner of twenty.",
    alt: "Seared shrimp in a golden sauce next to grilled asparagus and roasted red potatoes in a black serving tray.",
    w: 1600,
    h: 1057,
    category: "seafood",
  },
  {
    slug: "seafood-cream-pasta",
    title: "Seafood in Cream",
    note: "Rich, restrained, and finished with cracked pepper and parsley.",
    alt: "A white bowl of pasta and seafood in a thick cream sauce, photographed beside a glass of red wine.",
    w: 1600,
    h: 2417,
    category: "seafood",
  },
  {
    slug: "clam-chowder",
    title: "New England Clam Chowder",
    note: "Clams left in the shell, bacon through the base, parsley on top.",
    alt: "A wide bowl of New England clam chowder with clams in the shell, bacon pieces and chopped parsley, with a gold spoon.",
    w: 1600,
    h: 1438,
    category: "seafood",
  },
  {
    slug: "blackened-roast",
    title: "Slow-Roasted, Blackened Crust",
    note: "Hours of low heat, then a hard finish for the crust.",
    alt: "A large roast with a dark, heavily seasoned blackened crust resting in a roasting pan.",
    w: 1600,
    h: 1081,
    category: "meat",
  },
  {
    slug: "smothered-chicken",
    title: "Smothered, Pan-Gravy Finish",
    note: "The Sunday plate, done properly.",
    alt: "Braised meat under a thick pan gravy served in a black skillet.",
    w: 1600,
    h: 2078,
    category: "southern",
  },
  {
    slug: "crab-stuffed-golden",
    title: "Baked Stuffing, Golden Top",
    note: "Browned hard on top, still soft underneath.",
    alt: "A baked seafood stuffing with a deeply golden, craggy top, served on a white platter.",
    w: 1600,
    h: 1057,
    category: "seafood",
  },
  {
    slug: "crab-stuffed-plated",
    title: "Stuffed & Plated",
    note: "Portioned for a seated course, garnished and sent out hot.",
    alt: "A stuffed, golden-topped seafood portion plated with a garnish of cherry tomato and greens.",
    w: 1600,
    h: 1310,
    category: "seafood",
  },
  {
    slug: "stuffed-shrimp-platter",
    title: "Stuffed Shrimp, Passed",
    note: "Built for a tray — one bite, no cutlery, no mess.",
    alt: "A long white platter of baked stuffed shrimp lined up in a row.",
    w: 1600,
    h: 1420,
    category: "seafood",
  },
  {
    slug: "baked-stuffed-platter",
    title: "Baked, Stuffed, Topped to Order",
    note: "Filled, baked hard on top, finished with diced pepper and herb.",
    alt: "Baked stuffed portions on a long white platter, browned on top and finished with diced red and green pepper.",
    w: 1600,
    h: 1532,
    category: "southern",
  },
  {
    slug: "shrimp-sausage-cream",
    title: "Shrimp & Sausage, Cream Sauce",
    note: "Mushrooms, tomato, scallion, and a sauce that holds.",
    alt: "Shrimp, sliced sausage, mushrooms and tomato in a pale cream sauce, served in a white bowl.",
    w: 1600,
    h: 2418,
    category: "southern",
  },
  {
    slug: "fried-fish-hushpuppies",
    title: "Fried Golden, Served Hot",
    note: "Fried to order, drained, plated, moving — never sitting.",
    alt: "Golden fried fish and fritters on a white plate with a dipping sauce and an orchid garnish.",
    w: 1600,
    h: 1057,
    category: "southern",
  },
  {
    slug: "garden-salad",
    title: "Garden Board",
    note: "Cold course. Mixed leaves, egg, tomato, built to look like it was picked that morning.",
    alt: "A mixed leaf salad with cherry tomatoes and sliced boiled egg on a white plate.",
    w: 1600,
    h: 1081,
    category: "southern",
  },
  {
    slug: "dessert-strawberries",
    title: "Chocolate-Dipped, Cream Finish",
    note: "Dessert is not an afterthought on his menus.",
    alt: "Chocolate-dipped strawberries beside a small white dish of cream topped with a sliced strawberry.",
    w: 1600,
    h: 1081,
    category: "sweet",
  },
  {
    slug: "creme-brulee-torch",
    title: "Crème Brûlée, Torched at the Table",
    note: "The sugar goes hard thirty seconds before it reaches the guest.",
    alt: "A ramekin of crème brûlée with a freshly torched sugar crust and a mint leaf, on a wooden board.",
    w: 1600,
    h: 1651,
    category: "sweet",
  },
  {
    slug: "mango-salsa-platter",
    title: "The Salsa Platter",
    note: "The plate people photograph before they eat it.",
    alt: "A long platter of roasted fish under a heavy layer of mango and pepper salsa.",
    w: 1600,
    h: 1081,
    category: "seafood",
  },
  {
    slug: "mango-salsa-plated",
    title: "Plated, Orchid Laid",
    note: "Garnish with intent — never decoration for its own sake.",
    alt: "Roasted fish with mango and pepper salsa, finished with a purple orchid.",
    w: 1600,
    h: 1961,
    category: "seafood",
  },
  {
    slug: "mango-salsa-detail",
    title: "Salsa, Close",
    note: "Knife work you can see from across the room.",
    alt: "Close detail of diced mango, red pepper, green pepper and red onion salsa on a white plate.",
    w: 1600,
    h: 1961,
    category: "seafood",
  },
  {
    slug: "salsa-prep",
    title: "Mise en Place",
    note: "Everything cut by hand, in your kitchen, the day of.",
    alt: "Hands folding diced peppers, onion and tomato together in a glass bowl with a red spatula on a butcher block.",
    w: 1600,
    h: 1594,
    category: "craft",
  },
  {
    slug: "scallops-prep",
    title: "Scallops, Dried and Waiting",
    note: "Patted dry and rested before they ever touch the pan.",
    alt: "Raw sea scallops resting on a paper towel before searing.",
    w: 1600,
    h: 1593,
    category: "craft",
  },
  {
    slug: "butter-pan-texture",
    title: "Butter, Foaming",
    note: "The sound of a dinner starting.",
    alt: "Two cubes of butter melting in a hot stainless steel pan.",
    w: 1600,
    h: 1448,
    category: "craft",
  },
  {
    slug: "pasta-wine-candle",
    title: "Two Covers, One Candle",
    note: "The intimate dinner — the reason most people call in the first place.",
    alt: "A plated pasta dish on a dining table with a glass of white wine and a lit candle behind it.",
    w: 1600,
    h: 1876,
    category: "craft",
  },
  {
    slug: "table-setting",
    title: "The Room, Before",
    note: "Table dressed, glasses set, before a single guest arrives.",
    alt: "A dining table dressed in white linen with black placemats, folded napkins, wine glasses and white flowers.",
    w: 1600,
    h: 2414,
    category: "craft",
  },
  {
    slug: "brand-knife",
    title: "His Own Knife",
    note: "Chef R. Kearse, etched into the blade.",
    alt: "A chef's knife with a red handle resting in its presentation case, the maker's script etched on the blade.",
    w: 1600,
    h: 2106,
    category: "craft",
  },
];

export const bySlug = (slug: string) => dishes.find((d) => d.slug === slug);

export const signatureDishes = dishes.filter((d) => d.signature);

export const dishSrc = (slug: string, width: 640 | 1024 | 1600 = 1600) =>
  `/images/dishes/${slug}-${width}.webp`;

export const categoryLabels: Record<DishCategory, string> = {
  seafood: "Seafood",
  meat: "From the Fire",
  southern: "Southern",
  sweet: "Sweet",
  craft: "In the Kitchen",
};
