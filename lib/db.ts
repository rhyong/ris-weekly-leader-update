import { Pool } from "pg";
import { createHash } from "crypto";

// Database connection configuration
let pool: Pool;

if (process.env.DATABASE_URL) {
  // Use the DATABASE_URL from .env.local if available
  console.log("Using DATABASE_URL from environment");
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' 
      ? { rejectUnauthorized: false } 
      : undefined
  });
} else {
  // Fall back to individual connection parameters
  console.log("Using individual database connection parameters");
  pool = new Pool({
    user: process.env.POSTGRES_USER || "postgres",
    password: process.env.POSTGRES_PASSWORD || "postgres",
    host: process.env.POSTGRES_HOST || "localhost",
    port: Number.parseInt(process.env.POSTGRES_PORT || "5432"),
    database: process.env.POSTGRES_DB || "weekly_leadership_updates",
    ssl:
      process.env.POSTGRES_SSL === "true"
        ? {
            rejectUnauthorized: false,
          }
        : undefined,
  });
}

// Helper function to hash passwords
export function hashPassword(password: string): string {
  return createHash("sha256").update(password).digest("hex");
}

// Helper function to query the database
export async function query(text: string, params?: any[]) {
  try {
    const start = Date.now();
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log("Executed query", { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error("Error executing query", { text, error });
    throw error;
  }
}

// Helper function to get a client from the pool
export async function getClient() {
  const client = await pool.connect();
  const query = client.query;
  const release = client.release;

  // Set a timeout of 5 seconds, after which we will log this client's last query
  const timeout = setTimeout(() => {
    console.error("A client has been checked out for more than 5 seconds!");
    console.error(
      `The last executed query on this client was: ${client.lastQuery}`
    );
  }, 5000);

  // Monkey patch the query method to keep track of the last query executed
  client.query = (...args: any[]) => {
    client.lastQuery = args;
    return query.apply(client, args);
  };

  client.release = () => {
    clearTimeout(timeout);
    client.query = query;
    client.release = release;
    return release.apply(client);
  };

  return client;
}

/**
 * Begin a database transaction
 */
export async function beginTransaction(): Promise<void> {
  await query('BEGIN');
  console.log("Transaction started");
}

/**
 * Commit a database transaction
 */
export async function commitTransaction(): Promise<void> {
  await query('COMMIT');
  console.log("Transaction committed");
}

/**
 * Rollback a database transaction
 */
export async function rollbackTransaction(): Promise<void> {
  await query('ROLLBACK');
  console.log("Transaction rolled back");
}

export default {
  query,
  getClient,
  hashPassword,
  beginTransaction,
  commitTransaction,
  rollbackTransaction,
};
