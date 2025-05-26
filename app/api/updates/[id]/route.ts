import { NextRequest, NextResponse } from "next/server"
import { weeklyUpdates } from "@/lib/mock-data"

type Params = { params: { id: string } };

export async function GET(
  request: NextRequest,
  context: Params
) {
  try {
    console.log("GET /api/updates/[id] - Starting to process request");
    const id = context.params.id
    console.log("Looking for update with ID:", id);
    
    // Check if we have global data that should be used
    if (typeof global !== 'undefined' && global.__mockData && global.__mockData.weeklyUpdatesStore) {
      console.log("Global store exists with", global.__mockData.weeklyUpdatesStore.length, "updates");
      if (global.__mockData.weeklyUpdatesStore.length > weeklyUpdates.length) {
        console.log("Updating weeklyUpdates from global store");
        // Update our local reference
        weeklyUpdates.length = 0; // Clear the array
        weeklyUpdates.push(...global.__mockData.weeklyUpdatesStore); // Add all items
      }
    }
    
    console.log("Searching through", weeklyUpdates.length, "updates");
    
    // Find the update with the matching ID
    const update = weeklyUpdates.find((update) => update.id === id)

    if (!update) {
      return NextResponse.json({ error: "Update not found" }, { status: 404 })
    }

    return NextResponse.json(update)
  } catch (error) {
    console.error("Error fetching update:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
