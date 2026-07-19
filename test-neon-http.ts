import { neon } from "@neondatabase/serverless";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const connectionString = process.env.DATABASE_URL;
console.log("DATABASE_URL exists:", !!connectionString, "length:", connectionString?.length);

if (!connectionString) {
  console.error("DATABASE_URL missing!");
  process.exit(1);
}

const sql = neon(connectionString);

async function test() {
  try {
    const result = await sql`SELECT NOW()`;
    console.log("HTTP connection SUCCESS:", result[0].now);
  } catch (err: any) {
    console.error("HTTP connection FAILED:", err.message);
  }
}

test();
