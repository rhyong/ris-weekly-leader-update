import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { hashPassword } from "@/lib/db"
import { findUserByCredentials, createSession } from "@/lib/auth-db"

export async function GET(request: Request) {
  // Simple debug endpoint for login
  return NextResponse.json({
    message: "Login API is working correctly",
    debug: "This is the debug endpoint for login. The POST endpoint should be used for actual login."
  });
}

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json()

    // Log the login attempt (without the password)
    console.log(`Login attempt for username: ${username}`)
    
    // Log login attempt
    console.log(`Attempting login with username: ${username}`)
    
    // Find user by credentials - auth-db.ts will handle the password hashing
    const user = await findUserByCredentials(username, password)
    
    if (!user) {
      console.log(`Login failed for ${username}: Invalid credentials`)
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }
    
    console.log(`Login successful for ${username} (ID: ${user.id})`);

    // Create a session
    const session = await createSession(user.id)
    
    if (!session) {
      console.log(`Failed to create session for ${username}`)
      return NextResponse.json({ error: "Failed to create session" }, { status: 500 })
    }

    // Set a session cookie
    const cookieStore = await cookies()
    
    // Use consistent cookie naming - session_id
    cookieStore.set({
      name: "session_id",
      value: session.id,
      httpOnly: true,
      expires: session.expires,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    })
    
    console.log(`Set cookie session_id with value ${session.id.substring(0, 8)}... for user ${user.id}`);

    // Return user data with session ID
    const response = NextResponse.json({
      ...user,
      sessionId: session.id // Include session ID in response
    });
    
    // Set the session cookie explicitly on the response as well
    // This adds a belt-and-suspenders approach to session cookie setting
    response.cookies.set({
      name: "session_id",
      value: session.id,
      httpOnly: true,
      expires: session.expires,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
    
    console.log(`Set cookie on response: session_id=${session.id.substring(0, 8)}...`);
    
    return response
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
