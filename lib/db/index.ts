import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;

if (!connectionString && process.env.NODE_ENV === 'production') {
  console.warn("DATABASE_URL is not set. Database connection will fail at runtime.");
}

const pool = new Pool({
  connectionString: connectionString || "",
  ssl: connectionString?.includes("supabase")
    ? { rejectUnauthorized: false }
    : false,
});

export const db = drizzle(pool, { schema });