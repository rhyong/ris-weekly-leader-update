import { Pool } from "pg";
import * as dotenv from "dotenv";
import fs from "fs";
import path from "path";

// Load environment variables from .env.local
dotenv.config({ path: ".env.local" });

// Database connection configuration
const pool = new Pool({
  // Support both connection string and individual parameters
  connectionString: process.env.DATABASE_URL,
  // Fall back to individual parameters if no connection string
  user: process.env.POSTGRES_USER || "postgres",
  password: process.env.POSTGRES_PASSWORD || "postgres",
  host: process.env.POSTGRES_HOST || "localhost",
  port: Number.parseInt(process.env.POSTGRES_PORT || "5432"),
  database: process.env.POSTGRES_DB || "weekly_leader_updates",
  ssl:
    process.env.POSTGRES_SSL === "true"
      ? {
          rejectUnauthorized: false,
        }
      : undefined,
});

async function resetDatabase() {
  try {
    console.log("Starting database reset...");

    // Start transaction
    await pool.query("BEGIN");

    // Drop all tables in the correct order (respecting foreign key constraints)
    console.log("Dropping existing tables...");

    // Create a function to drop all tables
    const dropTablesQuery = `
    DO $$ 
    DECLARE
      r RECORD;
    BEGIN
      -- Disable all triggers
      FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        EXECUTE 'ALTER TABLE IF EXISTS public.' || quote_ident(r.tablename) || ' DISABLE TRIGGER ALL';
      END LOOP;
      
      -- Drop all tables
      FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        EXECUTE 'DROP TABLE IF EXISTS public.' || quote_ident(r.tablename) || ' CASCADE';
      END LOOP;
      
      -- Drop all functions
      FOR r IN (SELECT proname FROM pg_proc WHERE pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')) LOOP
        EXECUTE 'DROP FUNCTION IF EXISTS public.' || quote_ident(r.proname) || ' CASCADE';
      END LOOP;
    END $$;
    `;

    await pool.query(dropTablesQuery);

    // Re-apply schema
    console.log("Re-applying schema...");
    const schemaPath = path.join(process.cwd(), "schema.sql");
    const schema = fs.readFileSync(schemaPath, "utf8");
    await pool.query(schema);

    // Commit transaction
    await pool.query("COMMIT");

    console.log(
      "Database reset complete. All tables have been dropped and recreated."
    );
    console.log(
      "Run 'npm run seed' to populate the database with sample data."
    );
  } catch (error) {
    // Rollback on error
    await pool.query("ROLLBACK");
    console.error("Error during database reset:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run the reset function
resetDatabase();
