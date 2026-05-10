import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.warn("[db] DATABASE_URL is not set. DB queries will fail until configured.");
}

export const db = new Pool({
  connectionString
});
