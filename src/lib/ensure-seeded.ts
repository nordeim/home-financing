import { articles as articleRows } from "@/lib/catalog";
import { authorSlug, glossary, manufacturers, states } from "@/lib/catalog";
import { LENDER_SEEDS, LOAN_PRODUCT_SEEDS } from "@/lib/lenders";
import { db } from "@/db";
import {
  articles,
  glossaryTerms,
  lenders,
  loanProducts,
  manufacturers as manufacturersTable,
  states as statesTable,
} from "@/db/schema";
import { sql } from "drizzle-orm";

const globalForSeed = globalThis as typeof globalThis & {
  __modfiiSeedPromise?: Promise<void>;
};

async function seed(): Promise<void> {
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(lenders);

  if (count > 0) return;

  await db.insert(lenders).values(LENDER_SEEDS).onConflictDoNothing({ target: lenders.slug });

  await db
    .insert(loanProducts)
    .values([...LOAN_PRODUCT_SEEDS])
    .onConflictDoNothing({ target: loanProducts.slug });

  await db
    .insert(manufacturersTable)
    .values(
      manufacturers.map((item) => ({
        slug: item.slug,
        name: item.name,
        description: item.description,
        headquarters: item.headquarters,
        founded: item.founded,
        priceRange: item.priceRange,
        category: item.category,
        homeTypes: item.homeTypes,
        features: item.features,
      })),
    )
    .onConflictDoNothing({ target: manufacturersTable.slug });

  await db
    .insert(statesTable)
    .values(
      states.map((item) => ({
        slug: item.slug,
        name: item.name,
        abbreviation: item.abbreviation,
        lendingClimate: item.lendingClimate,
        lendingDescription: item.lendingDescription,
        medianHomePrice: item.medianHomePrice,
        averageLoanAmount: item.averageLoanAmount,
        prefabMarketGrowth: item.prefabMarketGrowth,
        popularAreas: item.popularAreas,
        topManufacturers: item.topManufacturers,
      })),
    )
    .onConflictDoNothing({ target: statesTable.slug });

  await db
    .insert(articles)
    .values(
      articleRows.map((item) => ({
        slug: item.slug,
        title: item.title,
        description: item.description,
        category: item.category,
        readTime: item.readTime,
        tag: item.tag ?? null,
        publishedAt: item.publishedAt,
        updatedAt: item.updatedAt ?? null,
        authorName: item.authorName,
        authorRole: item.authorRole,
        authorSlug: authorSlug(item.authorName),
        content: item.content,
        keywords: item.keywords,
        relatedSlugs: item.relatedSlugs,
      })),
    )
    .onConflictDoNothing({ target: articles.slug });

  await db
    .insert(glossaryTerms)
    .values(
      glossary.map((item) => ({
        term: item.term,
        definition: item.definition,
        letter: item.term.charAt(0).toUpperCase(),
      })),
    )
    .onConflictDoNothing({ target: glossaryTerms.term });
}

export function ensureSeeded(): Promise<void> {
  if (!globalForSeed.__modfiiSeedPromise) {
    globalForSeed.__modfiiSeedPromise = seed().catch((error: unknown) => {
      globalForSeed.__modfiiSeedPromise = undefined;
      throw error;
    });
  }
  return globalForSeed.__modfiiSeedPromise;
}
