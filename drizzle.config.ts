import type { Config } from "drizzle-kit";

export default {
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    // Runtime DATABASE_URL wins (see .env); fallback matches docker-compose.yml
    url:
      process.env.DATABASE_URL ??
      "postgresql://home_financing_user:home_financing_secret@localhost:5434/home_financing_dev",
  },
  strict: true,
  verbose: true,
} satisfies Config;
