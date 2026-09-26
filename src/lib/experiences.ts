/**
 * Service lines. Every one of these is evidenced by the chef's own public
 * profiles — his Zola vendor listing (weddings, staff, bar, rentals, tastings),
 * his Thumbtack listing (wedding and event catering, personal chef), his Fash
 * listing (catering, personal chef, pastry chef) and his Instagram bio
 * ("Personal Chef and Catering Company serving Richmond, Maryland, DC areas").
 * Nothing here is invented. Capacities and prices are deliberately absent.
 */

export interface Experience {
  slug: string;
  eyebrow: string;
  title: string;
  lede: string;
  body: string;
  includes: string[];
  bestFor: string;
  image: string;
  imageAlt: string;
  ratio: "portrait" | "landscape";
}

export const experiences: Experience[] = [
  {
    slug: "private-dinner",
    eyebrow: "Experience 01",
    title: "The Private Dinner",
    lede: "A restaurant night without the restaurant. In your kitchen, at your table.",
    body: "He arrives with the shopping done, cooks in front of you or out of sight — your call — plates each course, and serves it hot. Date nights, birthdays, anniversaries, a proposal, or a Tuesday you decided deserved better. You choose the mood; he writes the menu around it.",
    includes: [
      "Menu written for your table",
      "Market shopping and prep",
      "Cooked and plated in your kitchen",
      "Course-by-course service",
      "Kitchen left cleaner than he found it",
    ],
    bestFor: "Two to twenty guests at home",
    image: "pasta-wine-candle",
    imageAlt:
      "A plated pasta dish on a dining table with a glass of white wine and a lit candle behind it",
    ratio: "portrait",
  },
  {
    slug: "personal-chef",
    eyebrow: "Experience 02",
    title: "Personal Chef Service",
    lede: "Your week of food, cooked properly, waiting in the fridge.",
    body: "A standing day each week. He plans around how your household actually eats, shops, cooks everything fresh in your kitchen, portions and labels it, and cleans down. No meal-kit boxes, no reheated catering trays — real cooking, made for your week.",
    includes: [
      "Menu planning around your household",
      "All shopping handled",
      "Cooked fresh in your kitchen",
      "Portioned, labelled, stored",
      "Kitchen cleaned down after every session",
    ],
    bestFor: "Households and executives who want to stop thinking about dinner",
    image: "shrimp-asparagus-potatoes",
    imageAlt: "Seared shrimp in a golden sauce next to grilled asparagus and roasted red potatoes in a serving tray",
    ratio: "landscape",
  },
  {
    slug: "weddings",
    eyebrow: "Experience 03",
    title: "Weddings",
    lede: "The meal your guests are still describing a year later.",
    body: "Rehearsal dinner through late-night bites. Seated and plated, family style, stations, or passed — whichever suits the room. Serving staff, bartenders, bar and beverage servingware rentals, delivery, setup, breakdown and cleanup are all part of what he brings.",
    includes: [
      "Consultation and tasting",
      "Seated, family style, stations or passed",
      "Serving staff and bartenders",
      "Bar and beverage servingware rentals",
      "Delivery, setup, breakdown and cleanup",
    ],
    bestFor: "Rehearsal dinners, ceremonies and receptions",
    image: "mango-salsa-platter",
    imageAlt: "A long platter of roasted fish under a heavy layer of mango and pepper salsa",
    ratio: "landscape",
  },
  {
    slug: "events",
    eyebrow: "Experience 04",
    title: "Events & Full-Service Catering",
    lede: "Corporate, milestone, holiday — fed properly, start to finish.",
    body: "Breakfast and brunch service, passed and stationary appetisers, food stations, buffets and seated dinners. Signature cocktails and a mobile bar where you want one. Dessert is not an afterthought — pastry comes out of the same kitchen.",
    includes: [
      "Breakfast, brunch, lunch or dinner service",
      "Passed and stationary appetisers",
      "Food stations and buffets",
      "Signature cocktails and mobile bar",
      "Desserts and pastry",
    ],
    bestFor: "Company dinners, milestones, holidays and private parties",
    image: "seafood-crab-roast",
    imageAlt: "A serving tray holding crab legs alongside roasted vegetables and browned potatoes",
    ratio: "landscape",
  },
];

export const processSteps = [
  {
    n: "01",
    title: "Check your date",
    body: "Two minutes, five questions. Tell him the date, the headcount and roughly what the night is. No account, no obligation.",
  },
  {
    n: "02",
    title: "Menu and tasting",
    body: "He comes back with a menu written for your event. Consultations and tastings are available — and the fee is waived when you sign.",
  },
  {
    n: "03",
    title: "He handles the day",
    body: "Shopping, prep, cooking, plating, service, bar and staff. You are a guest at your own event.",
  },
  {
    n: "04",
    title: "And the clean-up",
    body: "Breakdown and cleanup are part of the job. The last thing he does is leave your kitchen right.",
  },
];
