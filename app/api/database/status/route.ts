import { NextResponse } from "next/server";
import { Pool } from "pg";

export async function GET() {
  try {
    // Get database URL from environment
    const databaseUrl = process.env.DATABASE_URL;

    if (!databaseUrl) {
      return NextResponse.json(
        {
          connected: false,
          message: "DATABASE_URL is not configured in environment variables",
        },
        { status: 500 }
      );
    }

    // Create a new connection for testing
    const testPool = new Pool({
      connectionString: databaseUrl,
      ssl: process.env.NODE_ENV === "production"
        ? { rejectUnauthorized: false }
        : undefined,
    });

    // Test the connection
    const client = await testPool.connect();
    
    try {
      // Execute a simple query to test the connection
      const result = await client.query("SELECT NOW() as current_time");
      
      // Check if users table exists
      const tablesResult = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public'
          AND table_name = 'users'
        );
      `);
      
      const usersTableExists = tablesResult.rows[0].exists;
      
      // Count users if table exists
      let userCount = 0;
      if (usersTableExists) {
        const usersResult = await client.query('SELECT COUNT(*) FROM users');
        userCount = parseInt(usersResult.rows[0].count);
      }
      
      return NextResponse.json({
        connected: true,
        database: {
          version: result.rows[0].current_time,
          tables: {
            users: {
              exists: usersTableExists,
              count: userCount
            }
          }
        },
        message: "Successfully connected to database",
      });
    } finally {
      // Release the client back to the pool
      client.release();
      await testPool.end();
    }
  } catch (error) {
    console.error("Database connection error:", error);
    return NextResponse.json(
      {
        connected: false,
        message: `Failed to connect to database: ${error instanceof Error ? error.message : String(error)}`,
      },
      { status: 500 }
    );
  }
}