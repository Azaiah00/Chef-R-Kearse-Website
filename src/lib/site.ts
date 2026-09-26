/**
 * Single source of truth for every verified business fact on this site.
 * Nothing in here is invented. Sources are noted per field.
 * Anything unverified lives in CONTEXT.md under "CONFIRM WITH CLIENT" and is
 * NOT rendered until it is turned on here.
 */

export const site = {
  /** Legal / trading name as it appears on his Google listing and logo */
  name: "Chef R. Kearse",
  legalName: "Chef R. Kearse Private Chef & Catering",
  shortName: "Chef R. Kearse",
  /** His own tagline — appears on his photo watermark, Yelp "About the Business" and Fash profile */
  tagline: "Your invitation to the perfect catered affair.",
  positioning:
    "Third-generation private chef and caterer bringing plated, restaurant-grade dinners and full-service catering to homes and venues across Richmond, Northern Virginia, Washington DC and Maryland.",

  /** Replace with the live domain once DNS is pointed. Used for canonical URLs + schema. */
  url: "https://chefrkearse.com",

  founded: 2018, // Google knowledge panel: "Kearse founded his private chef and catering company in 2018."

  contact: {
    /** Primary — Google listing + his old site footer */
    phone: "(804) 939-9246",
    phoneHref: "+18049399246",
    /** Toll-free — his old site footer */
    phoneAlt: "(844) 532-7724",
    phoneAltHref: "+18445327724",
    /** His old site footer */
    email: "chefrkearse@gmail.com",
  },

  /** Base city per BBB listing (Richmond, VA). Service area per his Instagram bio. */
  location: {
    city: "Richmond",
    region: "VA",
    regionName: "Virginia",
    country: "US",
  },

  /** From his Instagram bio: "serving Richmond, Maryland, DC areas" */
  serviceAreas: [
    "Richmond, VA",
    "Glen Allen, VA",
    "Midlothian, VA",
    "Short Pump, VA",
    "Chesterfield, VA",
    "Henrico, VA",
    "Charlottesville, VA",
    "Northern Virginia",
    "Washington, DC",
    "Maryland",
  ],

  social: {
    instagram: "https://www.instagram.com/chef.rkearse/",
    instagramHandle: "@chef.rkearse",
    facebook: "https://www.facebook.com/p/Chef-R-Kearse-100088320616251/",
    yelp: "https://www.yelp.com/biz/chef-r-kearse-no-title",
    zola: "https://www.zola.com/wedding-vendors/wedding-catering/chef-r-kearse-private-chef-catering",
    thumbtack: "https://www.thumbtack.com/va/richmond/personal-chefs",
    google:
      "https://www.google.com/search?q=Chef+R.+Kearse+Private+Chef+%26+Catering&kgmid=/g/11tjpks0s4",
  },

  /**
   * Cuisines listed on his Zola vendor profile.
   */
  cuisines: [
    "Southern",
    "Seafood",
    "American",
    "BBQ",
    "Farm to table",
    "Italian",
    "Greek",
    "Latin American",
    "Fusion",
  ],

  /**
   * Service inclusions listed on his Zola vendor profile.
   */
  inclusions: [
    "Serving staff",
    "Bartenders",
    "Delivery and setup",
    "Cleanup and breakdown",
    "Consultations and tastings",
    "Bar and beverage servingware rentals",
  ],

  /** Presentation styles listed on his Zola vendor profile. */
  serviceStyles: [
    "Seated, plated dinner",
    "Family style",
    "Passed appetizers",
    "Stationary appetizers",
    "Food stations",
    "Buffet",
    "Breakfast and brunch",
  ],

  /** Beverage services listed on his Zola vendor profile. */
  beverage: [
    "Signature cocktails",
    "Mobile bar",
    "Wine",
    "Beer",
    "Liquor",
    "Coffee service",
    "Non-alcoholic",
  ],

  /**
   * PRICING IS NOT PUBLISHED.
   * No verified price exists for this business in any public source, so nothing
   * is shown. When the chef confirms his real numbers, fill `bands` and flip
   * `published` to true — the Experiences page renders the band table automatically.
   */
  pricing: {
    published: false,
    note: "Every menu is quoted per event. Pricing below is a placeholder pending the chef's confirmation.",
    bands: [
      { label: "Private dinner in your home", from: "", unit: "per guest" },
      { label: "Weekly personal chef service", from: "", unit: "per week" },
      { label: "Weddings and full-service catering", from: "", unit: "per guest" },
      { label: "Corporate and social events", from: "", unit: "per guest" },
    ],
  },

  /**
   * RESPONSE PROMISE — pending client confirmation (see CONTEXT.md).
   * Set `published: true` only once the chef agrees to hold the standard.
   */
  responsePromise: {
    published: false,
    text: "Every inquiry is answered personally, usually within a few hours.",
  },
} as const;

export type Site = typeof site;

/** Real, attributed reviews only. Source and date required for every entry. */
export const testimonials = [
  {
    quote:
      "The food was fresh, tasty and beautifully presented. All of our guests raved about the delicious meal, and many said it was the best food they had ever had at a wedding.",
    author: "Marie R.",
    context: "Wedding",
    source: "Zola",
    sourceUrl: site.social.zola,
    date: "2026-03-02",
    dateLabel: "March 2026",
    rating: 5,
  },
  {
    quote:
      "Every little detail was well thought out and the service was exceptional. Everything was amazing.",
    author: "Beth",
    context: "Private event",
    source: "Fash",
    sourceUrl:
      "https://fash.com/va/richmond/catering/chef-r-kearse-personal-chef-and-catering-services",
    date: "2021-03-01",
    dateLabel: "March 2021",
    rating: 5,
  },
  {
    quote: "Excellent chef.",
    author: "James R.",
    context: "Catering",
    source: "Fash",
    sourceUrl:
      "https://fash.com/va/richmond/catering/chef-r-kearse-personal-chef-and-catering-services",
    date: "2021-03-01",
    dateLabel: "March 2021",
    rating: 5,
  },
] as const;

export const navLinks = [
  { href: "/experiences", label: "Experiences" },
  { href: "/menus", label: "Menus" },
  { href: "/weddings", label: "Weddings" },
  { href: "/gallery", label: "Gallery" },
  { href: "/about", label: "About" },
  { href: "/faq", label: "FAQ" },
] as const;
