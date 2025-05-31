import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  try {
    console.log("GET /api/teams - Starting to process request");
    
    // Query the database to get all teams
    const result = await query(`
      SELECT id, name, description
      FROM teams
      ORDER BY name ASC
    `, []);
    
    console.log(`Found ${result.rows.length} teams`);
    
    // Return the teams
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("Error fetching teams:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}