CREATE TABLE "application_matches" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"application_id" uuid NOT NULL,
	"lender_id" uuid NOT NULL,
	"estimated_rate" numeric(5, 3) NOT NULL,
	"estimated_payment" integer NOT NULL,
	"match_score" integer NOT NULL,
	"rationale" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "applications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"full_name" varchar(120) NOT NULL,
	"email" varchar(254) NOT NULL,
	"phone" varchar(32) NOT NULL,
	"zip_code" varchar(5) NOT NULL,
	"property_intent" varchar(32) NOT NULL,
	"home_type" varchar(32) NOT NULL,
	"land_status" varchar(32) NOT NULL,
	"manufacturer_known" boolean,
	"manufacturer_slug" varchar(80),
	"credit_range" varchar(32) NOT NULL,
	"income_range" varchar(32) NOT NULL,
	"budget" varchar(32) NOT NULL,
	"timeline" varchar(32) NOT NULL,
	"status" varchar(24) DEFAULT 'new' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "articles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" varchar(160) NOT NULL,
	"title" varchar(240) NOT NULL,
	"description" text NOT NULL,
	"category" varchar(40) NOT NULL,
	"read_time" varchar(32) NOT NULL,
	"tag" varchar(40),
	"published_at" varchar(16) NOT NULL,
	"updated_at" varchar(16),
	"author_name" varchar(120) NOT NULL,
	"author_role" varchar(120) NOT NULL,
	"author_slug" varchar(80) NOT NULL,
	"content" text NOT NULL,
	"keywords" text[] DEFAULT '{}' NOT NULL,
	"related_slugs" text[] DEFAULT '{}' NOT NULL,
	CONSTRAINT "articles_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "glossary_terms" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"term" varchar(160) NOT NULL,
	"definition" text NOT NULL,
	"letter" varchar(1) NOT NULL,
	CONSTRAINT "glossary_terms_term_unique" UNIQUE("term")
);
--> statement-breakpoint
CREATE TABLE "lenders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" varchar(80) NOT NULL,
	"name" varchar(160) NOT NULL,
	"description" text NOT NULL,
	"specialties" text[] DEFAULT '{}' NOT NULL,
	"min_credit" integer DEFAULT 620 NOT NULL,
	"green_mortgage" boolean DEFAULT false NOT NULL,
	"avg_approval_days" integer DEFAULT 10 NOT NULL,
	"rate_discount_bps" integer DEFAULT 0 NOT NULL,
	"nmls_id" varchar(32),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "lenders_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "loan_products" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" varchar(80) NOT NULL,
	"name" varchar(160) NOT NULL,
	"down_payment" varchar(40) NOT NULL,
	"credit_min" integer NOT NULL,
	"summary" text NOT NULL,
	"best_for" text NOT NULL,
	CONSTRAINT "loan_products_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "manufacturers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" varchar(80) NOT NULL,
	"name" varchar(160) NOT NULL,
	"description" text NOT NULL,
	"headquarters" varchar(160) NOT NULL,
	"founded" varchar(8) NOT NULL,
	"price_range" varchar(64) NOT NULL,
	"category" varchar(32) NOT NULL,
	"home_types" text[] DEFAULT '{}' NOT NULL,
	"features" text[] DEFAULT '{}' NOT NULL,
	CONSTRAINT "manufacturers_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "states" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" varchar(40) NOT NULL,
	"name" varchar(64) NOT NULL,
	"abbreviation" varchar(2) NOT NULL,
	"lending_climate" varchar(32) NOT NULL,
	"lending_description" text NOT NULL,
	"median_home_price" varchar(24) NOT NULL,
	"average_loan_amount" varchar(24) NOT NULL,
	"prefab_market_growth" varchar(16) NOT NULL,
	"popular_areas" text[] DEFAULT '{}' NOT NULL,
	"top_manufacturers" text[] DEFAULT '{}' NOT NULL,
	CONSTRAINT "states_slug_unique" UNIQUE("slug"),
	CONSTRAINT "states_abbreviation_unique" UNIQUE("abbreviation")
);
--> statement-breakpoint
ALTER TABLE "application_matches" ADD CONSTRAINT "application_matches_application_id_applications_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."applications"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "application_matches" ADD CONSTRAINT "application_matches_lender_id_lenders_id_fk" FOREIGN KEY ("lender_id") REFERENCES "public"."lenders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "matches_application_idx" ON "application_matches" USING btree ("application_id");--> statement-breakpoint
CREATE INDEX "applications_email_idx" ON "applications" USING btree ("email");--> statement-breakpoint
CREATE INDEX "applications_created_idx" ON "applications" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "applications_zip_idx" ON "applications" USING btree ("zip_code");--> statement-breakpoint
CREATE INDEX "lenders_green_idx" ON "lenders" USING btree ("green_mortgage");