import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { findSessionById } from "@/lib/auth-db"

export async function GET(request: Request) {
  try {
    // Check for session ID in query parameters
    const { searchParams } = new URL(request.url);
    const sidParam = searchParams.get('sid');
    
    const cookieStore = await cookies()
    const cookiesList = cookieStore.getAll()
    const cookieSessionId = cookieStore.get("session_id")?.value
    
    // Use the session ID from query parameters if available, otherwise use the cookie
    const sessionId = sidParam || cookieSessionId

    if (!sessionId) {
      return NextResponse.json({ 
        error: "No session cookie found",
        cookies: cookiesList.map(c => c.name)
      })
    }

    // Find the session
    const session = await findSessionById(sessionId)

    if (!session) {
      return NextResponse.json({ 
        error: "Session not found in database",
        sessionId,
        cookies: cookiesList.map(c => c.name)
      })
    }

    // Return session data (without exposing sensitive details)
    return NextResponse.json({
      sessionExists: true,
      expiresAt: session.expires,
      hasUserId: !!session.user_id,
      cookies: cookiesList.map(c => c.name)
    })
  } catch (error) {
    console.error("Session debug error:", error)
    return NextResponse.json({ error: "Error checking session" }, { status: 500 })
  }
}