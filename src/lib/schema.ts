import { site, testimonials } from "./site";
import { dishes } from "./dishes";

const abs = (path: string) => new URL(path, site.url).toString();

export const organizationSchema = () => ({
  "@type": "Organization",
  "@id": `${site.url}/#organization`,
  name: site.legalName,
  alternateName: site.name,
  url: site.url,
  logo: {
    "@type": "ImageObject",
    url: abs("/images/brand/logo-ink.png"),
    width: 1100,
    height: 312,
  },
  foundingDate: String(site.founded),
  sameAs: [
    site.social.instagram,
    site.social.facebook,
    site.social.yelp,
    site.social.zola,
  ],
});

export const localBusinessSchema = () => ({
  "@type": ["FoodEstablishment", "LocalBusiness"],
  "@id": `${site.url}/#business`,
  name: site.legalName,
  alternateName: site.name,
  description: site.positioning,
  url: site.url,
  telephone: site.contact.phoneHref,
  email: site.contact.email,
  image: abs("/images/dishes/snapper-mango-salsa-1600.webp"),
  logo: abs("/images/brand/logo-ink.png"),
  slogan: site.tagline,
  foundingDate: String(site.founded),
  servesCuisine: [...site.cuisines],
  acceptsReservations: "True",
  address: {
    "@type": "PostalAddress",
    addressLocality: site.location.city,
    addressRegion: site.location.region,
    addressCountry: site.location.country,
  },
  areaServed: site.serviceAreas.map((name) => ({ "@type": "Place", name })),
  sameAs: [
    site.social.instagram,
    site.social.facebook,
    site.social.yelp,
    site.social.zola,
  ],
  makesOffer: [
    "Private chef dinners",
    "Weekly personal chef service",
    "Wedding catering",
    "Corporate and social event catering",
    "Full-service catering with staff and bar",
  ].map((name) => ({
    "@type": "Offer",
    itemOffered: { "@type": "Service", name },
  })),
  review: testimonials.map((t) => ({
    "@type": "Review",
    reviewRating: { "@type": "Rating", ratingValue: t.rating, bestRating: 5 },
    author: { "@type": "Person", name: t.author },
    datePublished: t.date,
    reviewBody: t.quote,
    publisher: { "@type": "Organization", name: t.source },
  })),
});

export const websiteSchema = () => ({
  "@type": "WebSite",
  "@id": `${site.url}/#website`,
  url: site.url,
  name: site.legalName,
  publisher: { "@id": `${site.url}/#organization` },
  inLanguage: "en-US",
});

export const serviceSchema = (name: string, description: string, slug: string) => ({
  "@type": "Service",
  "@id": `${site.url}${slug}#service`,
  name,
  description,
  serviceType: name,
  provider: { "@id": `${site.url}/#business` },
  areaServed: site.serviceAreas.map((a) => ({ "@type": "Place", name: a })),
  url: abs(slug),
});

/**
 * Menu schema built only from real photographed plates. No prices are declared
 * because no price for this business is verified anywhere public.
 */
export const menuSchema = () => ({
  "@type": "Menu",
  "@id": `${site.url}/menus#menu`,
  name: "Sample plates — Chef R. Kearse",
  description:
    "A selection of real plates from Chef R. Kearse events. Every menu is written for the individual event.",
  inLanguage: "en-US",
  hasMenuSection: [
    { id: "seafood", name: "Seafood" },
    { id: "meat", name: "From the Fire" },
    { id: "southern", name: "Southern" },
    { id: "sweet", name: "Sweet" },
  ].map((section) => ({
    "@type": "MenuSection",
    name: section.name,
    hasMenuItem: dishes
      .filter((d) => d.category === section.id)
      .map((d) => ({
        "@type": "MenuItem",
        name: d.title,
        description: d.note,
        image: abs(`/images/dishes/${d.slug}-1024.webp`),
      })),
  })),
});

export const faqSchema = (items: { q: string; a: string }[]) => ({
  "@type": "FAQPage",
  mainEntity: items.map((i) => ({
    "@type": "Question",
    name: i.q,
    acceptedAnswer: { "@type": "Answer", text: i.a },
  })),
});

export const breadcrumbSchema = (trail: { name: string; path: string }[]) => ({
  "@type": "BreadcrumbList",
  itemListElement: trail.map((t, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: t.name,
    item: abs(t.path),
  })),
});

/** Wraps any number of nodes into one @graph block. */
export const jsonLd = (...nodes: object[]) => ({
  "@context": "https://schema.org",
  "@graph": nodes,
});
