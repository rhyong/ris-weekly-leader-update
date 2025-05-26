import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { findSessionById, findUserById, getTeamMembersForUser, updateUserProfile } from "@/lib/auth-db"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const isDebug = searchParams.get('debug') === 'true';
    const sidParam = searchParams.get('sid');
    
    const cookieStore = await cookies()
    const allCookies = cookieStore.getAll();
    
    // Try both cookie names to handle potential inconsistencies
    const cookieSessionId = cookieStore.get("session_id")?.value || cookieStore.get("sessionId")?.value
    
    // Use the session ID from query parameters if available, otherwise use the cookie
    const sessionId = sidParam || cookieSessionId
    
    console.log(`Profile API: Session ID source - ${sidParam ? 'query parameter' : 'cookie'}`)

    if (isDebug) {
      return NextResponse.json({
        message: "Profile API Debug Info",
        cookies: allCookies.map(c => ({ name: c.name, value: c.value ? c.value.substring(0, 8) + '...' : 'none' })),
        hasSessionId: !!sessionId,
        sessionIdPrefix: sessionId ? sessionId.substring(0, 8) + '...' : 'none'
      });
    }
    
    if (!sessionId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
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
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Get team members
    const teamMembers = await getTeamMembersForUser(user.id)

    // Return user data and team members
    return NextResponse.json({ user, teamMembers })
  } catch (error) {
    console.error("User profile error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    // Get session ID from various sources
    const { searchParams } = new URL(request.url);
    const sidParam = searchParams.get('sid');
    
    const cookieStore = await cookies()
    // Try both cookie names to handle potential inconsistencies
    const cookieSessionId = cookieStore.get("session_id")?.value || cookieStore.get("sessionId")?.value
    
    // Use the session ID from query parameters if available, otherwise use the cookie
    const sessionId = sidParam || cookieSessionId
    
    console.log(`Profile Update API: Session ID source - ${sidParam ? 'query parameter' : 'cookie'}`);
    console.log(`Profile Update API: Session ID - ${sessionId ? sessionId.substring(0, 8) + '...' : 'none'}`);
    
    if (!sessionId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Find the session
    const session = await findSessionById(sessionId)

    if (!session) {
      cookieStore.delete("session_id")
      return NextResponse.json({ error: "Invalid session" }, { status: 401 })
    }

    // Get the update data
    const updateData = await request.json()
    console.log(`Profile Update API: Update data for user ${session.user_id}:`, updateData);

    // Update the user profile
    const updatedUser = await updateUserProfile(session.user_id, updateData)

    if (!updatedUser) {
      return NextResponse.json({ error: "Failed to update user" }, { status: 500 })
    }

    // Get team members
    const teamMembers = await getTeamMembersForUser(updatedUser.id)

    // Return updated user data and team members
    return NextResponse.json({ user: updatedUser, teamMembers })
  } catch (error) {
    console.error("Update user profile error:", error)
    return NextResponse.json({ 
      error: "Internal server error", 
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}