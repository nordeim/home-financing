import {
  boolean,
  index,
  integer,
  numeric,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const lenders = pgTable(
  "lenders",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    slug: varchar("slug", { length: 80 }).notNull().unique(),
    name: varchar("name", { length: 160 }).notNull(),
    description: text("description").notNull(),
    specialties: text("specialties").array().notNull().default([]),
    minCredit: integer("min_credit").notNull().default(620),
    greenMortgage: boolean("green_mortgage").notNull().default(false),
    avgApprovalDays: integer("avg_approval_days").notNull().default(10),
    rateDiscountBps: integer("rate_discount_bps").notNull().default(0),
    nmlsId: varchar("nmls_id", { length: 32 }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index("lenders_green_idx").on(table.greenMortgage)],
);

export const applications = pgTable(
  "applications",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    fullName: varchar("full_name", { length: 120 }).notNull(),
    email: varchar("email", { length: 254 }).notNull(),
    phone: varchar("phone", { length: 32 }).notNull(),
    zipCode: varchar("zip_code", { length: 5 }).notNull(),
    propertyIntent: varchar("property_intent", { length: 32 }).notNull(),
    homeType: varchar("home_type", { length: 32 }).notNull(),
    landStatus: varchar("land_status", { length: 32 }).notNull(),
    manufacturerKnown: boolean("manufacturer_known"),
    manufacturerSlug: varchar("manufacturer_slug", { length: 80 }),
    creditRange: varchar("credit_range", { length: 32 }).notNull(),
    incomeRange: varchar("income_range", { length: 32 }).notNull(),
    budget: varchar("budget", { length: 32 }).notNull(),
    timeline: varchar("timeline", { length: 32 }).notNull(),
    status: varchar("status", { length: 24 }).notNull().default("new"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("applications_email_idx").on(table.email),
    index("applications_created_idx").on(table.createdAt),
    index("applications_zip_idx").on(table.zipCode),
  ],
);

export const applicationMatches = pgTable(
  "application_matches",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    applicationId: uuid("application_id")
      .notNull()
      .references(() => applications.id, { onDelete: "cascade" }),
    lenderId: uuid("lender_id")
      .notNull()
      .references(() => lenders.id, { onDelete: "cascade" }),
    estimatedRate: numeric("estimated_rate", { precision: 5, scale: 3 }).notNull(),
    estimatedPayment: integer("estimated_payment").notNull(),
    matchScore: integer("match_score").notNull(),
    rationale: text("rationale").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index("matches_application_idx").on(table.applicationId)],
);

export const manufacturers = pgTable("manufacturers", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: varchar("slug", { length: 80 }).notNull().unique(),
  name: varchar("name", { length: 160 }).notNull(),
  description: text("description").notNull(),
  headquarters: varchar("headquarters", { length: 160 }).notNull(),
  founded: varchar("founded", { length: 8 }).notNull(),
  priceRange: varchar("price_range", { length: 64 }).notNull(),
  category: varchar("category", { length: 32 }).notNull(),
  homeTypes: text("home_types").array().notNull().default([]),
  features: text("features").array().notNull().default([]),
});

export const states = pgTable("states", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: varchar("slug", { length: 40 }).notNull().unique(),
  name: varchar("name", { length: 64 }).notNull(),
  abbreviation: varchar("abbreviation", { length: 2 }).notNull().unique(),
  lendingClimate: varchar("lending_climate", { length: 32 }).notNull(),
  lendingDescription: text("lending_description").notNull(),
  medianHomePrice: varchar("median_home_price", { length: 24 }).notNull(),
  averageLoanAmount: varchar("average_loan_amount", { length: 24 }).notNull(),
  prefabMarketGrowth: varchar("prefab_market_growth", { length: 16 }).notNull(),
  popularAreas: text("popular_areas").array().notNull().default([]),
  topManufacturers: text("top_manufacturers").array().notNull().default([]),
});

export const articles = pgTable("articles", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: varchar("slug", { length: 160 }).notNull().unique(),
  title: varchar("title", { length: 240 }).notNull(),
  description: text("description").notNull(),
  category: varchar("category", { length: 40 }).notNull(),
  readTime: varchar("read_time", { length: 32 }).notNull(),
  tag: varchar("tag", { length: 40 }),
  publishedAt: varchar("published_at", { length: 16 }).notNull(),
  updatedAt: varchar("updated_at", { length: 16 }),
  authorName: varchar("author_name", { length: 120 }).notNull(),
  authorRole: varchar("author_role", { length: 120 }).notNull(),
  authorSlug: varchar("author_slug", { length: 80 }).notNull(),
  content: text("content").notNull(),
  keywords: text("keywords").array().notNull().default([]),
  relatedSlugs: text("related_slugs").array().notNull().default([]),
});

export const glossaryTerms = pgTable("glossary_terms", {
  id: uuid("id").defaultRandom().primaryKey(),
  term: varchar("term", { length: 160 }).notNull().unique(),
  definition: text("definition").notNull(),
  letter: varchar("letter", { length: 1 }).notNull(),
});

export const loanProducts = pgTable("loan_products", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: varchar("slug", { length: 80 }).notNull().unique(),
  name: varchar("name", { length: 160 }).notNull(),
  downPayment: varchar("down_payment", { length: 40 }).notNull(),
  creditMin: integer("credit_min").notNull(),
  summary: text("summary").notNull(),
  bestFor: text("best_for").notNull(),
});
