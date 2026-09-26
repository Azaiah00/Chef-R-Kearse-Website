import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

const ROUTES: { path: string; priority: number; freq: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
  { path: "/", priority: 1, freq: "monthly" },
  { path: "/book", priority: 0.95, freq: "monthly" },
  { path: "/experiences", priority: 0.9, freq: "monthly" },
  { path: "/weddings", priority: 0.9, freq: "monthly" },
  { path: "/menus", priority: 0.85, freq: "monthly" },
  { path: "/gallery", priority: 0.7, freq: "monthly" },
  { path: "/about", priority: 0.7, freq: "yearly" },
  { path: "/faq", priority: 0.6, freq: "yearly" },
  { path: "/contact", priority: 0.6, freq: "yearly" },
  { path: "/privacy", priority: 0.1, freq: "yearly" },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return ROUTES.map((r) => ({
    url: new URL(r.path, site.url).toString(),
    lastModified: now,
    changeFrequency: r.freq,
    priority: r.priority,
  }));
}
