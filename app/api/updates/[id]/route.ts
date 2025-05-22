import { NextRequest, NextResponse } from "next/server"
import { weeklyUpdates } from "@/lib/mock-data"

type Params = { params: { id: string } };

export async function GET(
  request: NextRequest,
  context: Params
) {
  try {
    const id = context.params.id

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
