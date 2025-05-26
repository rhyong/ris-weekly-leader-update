import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { findSessionById, findUserById } from "@/lib/auth-db"

export async function GET(request: Request) {
  try {
    // Check for session ID in multiple sources with better logging
    const { searchParams } = new URL(request.url);
    const sidParam = searchParams.get('sid');
    
    const cookieStore = await cookies()
    // Try both cookie names to handle potential inconsistencies
    const cookieSessionId = cookieStore.get("session_id")?.value || cookieStore.get("sessionId")?.value
    
    // Use the session ID from query parameters if available, otherwise use the cookie
    const sessionId = sidParam || cookieSessionId
    
    // Log the session ID source and the actual session ID for debugging
    if (sidParam) {
      console.log(`Me API: Using session ID from query parameter: ${sidParam.substring(0, 8)}...`);
    } else if (cookieSessionId) {
      console.log(`Me API: Using session ID from cookie: ${cookieSessionId.substring(0, 8)}...`);
    } else {
      console.log(`Me API: No session ID found in query params or cookies`);
    }

    if (!sessionId) {
      return NextResponse.json({ error: "No session found" }, { status: 401 })
    }

    // Find the session
    const session = await findSessionById(sessionId)

    if (!session) {
      cookieStore.delete("session_id")
      return NextResponse.json({ error: "Invalid session" }, { status: 401 })
    }

    // Find the user
    const user = await findUserById(session.user_id)

    if (!user) {
      cookieStore.delete("session_id")
      return NextResponse.json({ error: "User not found" }, { status: 401 })
    }

    // Return user data
    return NextResponse.json(user)
  } catch (error) {
    console.error("Auth check error:", error)
    return NextResponse.json({ error: "Authentication error" }, { status: 500 })
  }
}
