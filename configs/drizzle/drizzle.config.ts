import { loadEnvConfig } from "@next/env";
import { defineConfig } from "drizzle-kit";

loadEnvConfig(process.cwd());

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set for Drizzle config");
}

export default defineConfig({
  schema: "../../apps/web/lib/schema.ts",
  out: "../../apps/web/drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: connectionString
  }
});
