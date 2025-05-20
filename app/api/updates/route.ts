import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { findSessionById, getUpdatesByUserId, saveUpdate } from "@/lib/mock-data"

export async function GET() {
  try {
    // For development/preview purposes, return mock data even without authentication
    // This ensures the history page works in the preview environment
    const sessionId = cookies().get("session_id")?.value

    // If there's no session, return mock data for demo purposes
    if (!sessionId) {
      const mockUpdates = [
        {
          id: "1",
          week_date: "2025-05-12",
          team_name: "Frontend Platform",
          client_org: "Acme Corp",
          created_at: "2025-05-12T10:30:00Z",
          updated_at: "2025-05-12T14:45:00Z",
        },
        {
          id: "2",
          week_date: "2025-05-05",
          team_name: "Frontend Platform",
          client_org: "Acme Corp",
          created_at: "2025-05-05T09:15:00Z",
          updated_at: "2025-05-05T16:30:00Z",
        },
      ]
      return NextResponse.json(mockUpdates)
    }

    // Find the session
    const session = findSessionById(sessionId)

    if (!session) {
      cookies().delete("session_id")
      // For demo purposes, return mock data even if session is invalid
      const mockUpdates = [
        {
          id: "1",
          week_date: "2025-05-12",
          team_name: "Frontend Platform",
          client_org: "Acme Corp",
          created_at: "2025-05-12T10:30:00Z",
          updated_at: "2025-05-12T14:45:00Z",
        },
        {
          id: "2",
          week_date: "2025-05-05",
          team_name: "Frontend Platform",
          client_org: "Acme Corp",
          created_at: "2025-05-05T09:15:00Z",
          updated_at: "2025-05-05T16:30:00Z",
        },
      ]
      return NextResponse.json(mockUpdates)
    }

    // Get updates for this user
    const updates = getUpdatesByUserId(session.userId)

    // Format the response to match the expected structure
    const formattedUpdates = updates.map(({ id, weekDate, teamName, clientOrg, createdAt, updatedAt }) => ({
      id,
      week_date: weekDate,
      team_name: teamName,
      client_org: clientOrg,
      created_at: createdAt,
      updated_at: updatedAt,
    }))

    return NextResponse.json(formattedUpdates)
  } catch (error) {
    console.error("Error fetching updates:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const sessionId = cookies().get("session_id")?.value
    let userId = "preview-user"

    // If there's a valid session, use the real user ID
    if (sessionId) {
      const session = findSessionById(sessionId)
      if (session) {
        userId = session.userId
      }
    }

    const { weekDate, teamName, clientOrg, data } = await request.json()

    // Save the update using our mock data function
    const update = saveUpdate(userId, weekDate, teamName, clientOrg, data)

    return NextResponse.json({ id: update.id, success: true })
  } catch (error) {
    console.error("Error saving update:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
