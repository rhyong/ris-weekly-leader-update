import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  try {
    console.log("GET /api/organizations - Starting to process request");
    
    // Query the database to get all organizations
    const result = await query(`
      SELECT id, name, description
      FROM organizations
      ORDER BY name ASC
    `, []);
    
    console.log(`Found ${result.rows.length} organizations`);
    
    // Return the organizations
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("Error fetching organizations:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}