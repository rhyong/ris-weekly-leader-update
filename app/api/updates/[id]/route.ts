import { NextRequest, NextResponse } from "next/server"
import { getUpdateById } from "@/lib/updates-db"

type Params = { params: { id: string } };

export async function GET(
  request: NextRequest,
  context: Params
) {
  try {
    console.log("GET /api/updates/[id] - Starting to process request");
    // Properly await the context.params
    const { id } = await context.params;
    console.log("Looking for update with ID:", id);
    
    // Get the update from the database using the ID
    const update = await getUpdateById(id)

    if (!update) {
      return NextResponse.json({ error: "Update not found" }, { status: 404 })
    }

    return NextResponse.json(update)
  } catch (error) {
    console.error("Error fetching update:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
