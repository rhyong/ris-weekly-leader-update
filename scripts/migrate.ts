import fs from "fs";
import path from "path";
import { Pool } from "pg";
import * as dotenv from "dotenv";

// Load environment variables from .env.local
dotenv.config({ path: ".env.local" });

// Database connection configuration
const pool = new Pool({
  // Support both connection string and individual parameters
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.POSTGRES_SSL === "true"
      ? {
          rejectUnauthorized: false,
        }
      : undefined,
});

async function migrate() {
  try {
    console.log("Starting database migration...");

    // Read the schema.sql file
    const schemaPath = path.join(process.cwd(), "schema.sql");
    const schema = fs.readFileSync(schemaPath, "utf8");

    // Execute the SQL
    await pool.query(schema);

    console.log("Database migration completed successfully!");
  } catch (error) {
    console.error("Error during migration:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run the migration
migrate();
