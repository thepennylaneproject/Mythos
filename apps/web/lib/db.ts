import { drizzle } from "drizzle-orm/node-postgres";
import { Pool, type PoolConfig } from "pg";
import { env } from "./env";
import * as schema from "./schema";

const isServerlessPooler = /neon|supabase|render|vercel/i.test(env.DATABASE_URL);
const shouldUseSSL = isServerlessPooler || process.env.PGSSL === "true";

const poolConfig: PoolConfig = {
  connectionString: env.DATABASE_URL,
  max: isServerlessPooler ? 1 : 10,
  keepAlive: true,
  connectionTimeoutMillis: 5_000,
  idleTimeoutMillis: isServerlessPooler ? 1_000 : 10_000,
  ssl: shouldUseSSL ? { rejectUnauthorized: false } : undefined
};

const pool = new Pool(poolConfig);

async function connectWithRetry(retries = 3) {
  let attempt = 0;

  while (attempt <= retries) {
    try {
      const client = await pool.connect();
      client.release();
      return;
    } catch (error) {
      if (attempt === retries) {
        console.error("Failed to establish Postgres connection", error);
        throw error;
      }
      const delay = Math.min(1_000 * 2 ** attempt, 8_000);
      await new Promise((resolve) => setTimeout(resolve, delay));
      attempt += 1;
    }
  }
}

void connectWithRetry();

export const db = drizzle(pool, { schema });
export { pool };
