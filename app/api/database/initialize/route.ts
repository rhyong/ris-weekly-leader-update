import { NextResponse } from "next/server";
import { Pool } from "pg";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";

// Load environment variables from .env.local if it exists
dotenv.config({ path: '.env.local' });

export async function POST() {
  let pool: Pool | null = null;
  
  try {
    console.log("Starting database initialization...");
    
    // Establish database connection
    const connectionString = process.env.DATABASE_URL;
    
    if (!connectionString) {
      return NextResponse.json(
        { success: false, message: "Database connection string not found in environment variables. Please create a .env.local file with DATABASE_URL." },
        { status: 500 }
      );
    }
    
    pool = new Pool({
      connectionString: connectionString,
      ssl: process.env.POSTGRES_SSL === "true" 
        ? { rejectUnauthorized: false } 
        : undefined,
    });
    
    // Check connection
    await pool.query('SELECT NOW()');
    console.log("Database connection successful");
    
    // Read the schema.sql file
    const schemaPath = path.join(process.cwd(), "schema.sql");
    const schema = fs.readFileSync(schemaPath, "utf8");
    
    // Execute the schema
    console.log("Running SQL schema...");
    await pool.query(schema);
    
    console.log("Database tables initialized successfully");
    return NextResponse.json({ 
      success: true, 
      message: "Database tables initialized successfully" 
    });
  } catch (error) {
    console.error("Error initializing database:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: "Failed to initialize database", 
        error: String(error) 
      },
      { status: 500 }
    );
  } finally {
    // Close the database connection
    if (pool) {
      await pool.end();
    }
  }
}