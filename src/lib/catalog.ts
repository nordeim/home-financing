import articlesJson from "@/data/articles.json";
import glossaryJson from "@/data/glossary.json";
import manufacturersJson from "@/data/manufacturers.json";
import statesJson from "@/data/states.json";

export interface Manufacturer {
  slug: string;
  name: string;
  description: string;
  metaDescription: string;
  headquarters: string;
  founded: string;
  priceRange: string;
  homeTypes: string[];
  features: string[];
  category: "Affordable" | "Mid-Range" | "Premium";
}

export interface StateGuide {
  slug: string;
  name: string;
  abbreviation: string;
  lendingClimate: string;
  lendingDescription: string;
  medianHomePrice: string;
  averageLoanAmount: string;
  prefabMarketGrowth: string;
  popularAreas: string[];
  topManufacturers: string[];
}

export interface Article {
  slug: string;
  title: string;
  description: string;
  category: string;
  readTime: string;
  tag?: string;
  publishedAt: string;
  updatedAt?: string;
  authorName: string;
  authorRole: string;
  keywords: string[];
  relatedSlugs: string[];
  content: string;
}

export interface GlossaryTerm {
  term: string;
  definition: string;
}

function priceFloor(range: string): number {
  const match = range.replace(/,/g, "").match(/\$(\d+)/);
  return match ? Number(match[1]) : 0;
}

function categorize(item: { priceRange: string; homeTypes: string[] }): Manufacturer["category"] {
  const floor = priceFloor(item.priceRange);
  if (floor >= 300) return "Premium";
  if (floor >= 150) return "Mid-Range";
  return "Affordable";
}

export const manufacturers: Manufacturer[] = (manufacturersJson as Array<Omit<Manufacturer, "category"> & { category?: string }>).map(
  (item) => ({
    ...item,
    category: categorize(item),
  }),
);

export const states: StateGuide[] = statesJson as StateGuide[];

export const articles: Article[] = (articlesJson as Article[]).map((article) => ({
  ...article,
  relatedSlugs: article.relatedSlugs ?? [],
  keywords: article.keywords ?? [],
}));

export const glossary: GlossaryTerm[] = glossaryJson as GlossaryTerm[];

export function getManufacturer(slug: string): Manufacturer | undefined {
  return manufacturers.find((item) => item.slug === slug);
}

export function getState(slug: string): StateGuide | undefined {
  return states.find((item) => item.slug === slug);
}

export function getArticle(slug: string): Article | undefined {
  return articles.find((item) => item.slug === slug);
}

export function authorSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export interface Author {
  slug: string;
  name: string;
  role: string;
  bio: string;
}

const AUTHOR_BIOS: Record<string, string> = {
  "sarah-mitchell":
    "Sarah Mitchell is a mortgage specialist focused on modular and prefab construction. She has helped hundreds of factory-built home buyers close when traditional banks said no.",
  "michael-chen":
    "Michael Chen covers green mortgages, ENERGY STAR incentives, and energy-efficient prefab financing programs.",
  "jennifer-rodriguez":
    "Jennifer Rodriguez writes about manufactured vs. modular classification, chattel lending, and HUD-code financing.",
  "david-thompson":
    "David Thompson is a construction-to-permanent loan specialist who explains draw schedules and factory production timelines.",
  "editorial-team":
    "The ModFii Editorial Team researches official FHA, VA, USDA, CFPB, Fannie Mae, and Freddie Mac guidance for prefab buyers.",
};

export const authors: Author[] = (() => {
  const map = new Map<string, Author>();
  for (const article of articles) {
    const slug = authorSlug(article.authorName);
    if (!map.has(slug)) {
      map.set(slug, {
        slug,
        name: article.authorName,
        role: article.authorRole,
        bio:
          AUTHOR_BIOS[slug] ??
          `${article.authorName} contributes research and analysis on modular, prefab, and manufactured home financing for ModFii.`,
      });
    }
  }
  map.set("editorial-team", {
    slug: "editorial-team",
    name: "ModFii Editorial Team",
    role: "Research & Policy",
    bio: AUTHOR_BIOS["editorial-team"] ?? "",
  });
  map.set("sarah-williams", {
    slug: "sarah-williams",
    name: "Sarah Williams",
    role: "Consumer Lending Editor",
    bio: "Sarah Williams edits rate, down-payment, and first-time buyer coverage across ModFii's state and loan-option guides.",
  });
  map.set("jane-morrison", {
    slug: "jane-morrison",
    name: "Jane Morrison",
    role: "Housing Policy Analyst",
    bio: "Jane Morrison tracks state HFA programs, USDA eligibility, and construction-loan policy that affects factory-built housing.",
  });
  return [...map.values()];
})();

export function getAuthor(slug: string): Author | undefined {
  return authors.find((item) => item.slug === slug);
}

export function articlesByAuthor(slug: string): Article[] {
  return articles.filter((article) => authorSlug(article.authorName) === slug);
}

export function glossaryByLetter(): Array<{ letter: string; terms: GlossaryTerm[] }> {
  const grouped = new Map<string, GlossaryTerm[]>();
  for (const term of glossary) {
    const letter = term.term.charAt(0).toUpperCase();
    const list = grouped.get(letter) ?? [];
    list.push(term);
    grouped.set(letter, list);
  }
  return [...grouped.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([letter, terms]) => ({ letter, terms }));
}

export const SITE = {
  name: "ModFii",
  tagline: "The #1 Prefab Home Mortgage Platform",
  description:
    "Stop losing your dream prefab home to financing nightmares. ModFii connects you with lenders who understand prefab construction, cutting approval times by 50%.",
  email: "team@modfii.com",
  hq: "Headquartered in Nashville, TN",
  nmls: "2537136",
  linkedin: "https://www.linkedin.com/company/modfii",
  twitter: "@ModFii",
} as const;
