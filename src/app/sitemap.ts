import { articles, manufacturers, states } from "@/lib/catalog";
import type { MetadataRoute } from "next";

const STATIC_PATHS = [
  "/",
  "/get-started",
  "/learn",
  "/financing",
  "/calculator",
  "/mortgage",
  "/glossary",
  "/resources",
  "/modular-home-financing",
  "/construction-loans",
  "/adu-financing",
  "/tiny-home-financing",
  "/construction-loans/fha",
  "/construction-loans/va",
  "/construction-loans/usda",
  "/modular-home-financing/rates",
  "/modular-home-financing/cost",
  "/modular-home-financing/down-payment",
  "/modular-home-financing/with-land",
  "/modular-home-financing/without-land",
  "/modular-home-financing/loan-options",
  "/modular-home-financing/loan-options/fha",
  "/modular-home-financing/fha-modular-manufactured",
  "/modular-home-financing/loan-options/va",
  "/modular-home-financing/va-modular-prefab",
  "/modular-home-financing/loan-options/usda",
  "/modular-home-financing/loan-options/construction-loan",
  "/modular-home-financing/construction-loans-modular",
  "/modular-home-financing/chattel-vs-mortgage",
  "/modular-home-financing/states",
  "/modular-home-financing/manufacturers",
  "/compare/modular-vs-manufactured-financing",
  "/compare/fha-vs-conventional-prefab",
  "/compare/prefab-vs-site-built-costs",
  "/about",
  "/editorial-policy",
  "/corrections",
  "/privacy-policy",
  "/terms",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const staticEntries = STATIC_PATHS.map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date("2026-01-21"),
    changeFrequency: "weekly" as const,
    priority: path === "/" ? 1 : 0.7,
  }));

  return [
    ...staticEntries,
    ...articles.map((article) => ({
      url: `${base}/learn/${article.slug}`,
      lastModified: new Date(article.updatedAt ?? article.publishedAt),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    ...states.map((state) => ({
      url: `${base}/modular-home-financing/states/${state.slug}`,
      lastModified: new Date("2026-01-15"),
      changeFrequency: "monthly" as const,
      priority: 0.55,
    })),
    ...manufacturers.map((item) => ({
      url: `${base}/modular-home-financing/manufacturers/${item.slug}`,
      lastModified: new Date("2026-01-15"),
      changeFrequency: "monthly" as const,
      priority: 0.55,
    })),
  ];
}
