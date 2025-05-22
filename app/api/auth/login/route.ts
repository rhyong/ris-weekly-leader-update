import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { findUserByCredentials, hashPassword, createSession } from "@/lib/mock-data"

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json()

    // Hash the password
    const hashedPassword = hashPassword(password)

    // Find user by credentials
    const user = findUserByCredentials(username, hashedPassword)

    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Create a session
    const session = createSession(user.id)

    // Set a session cookie
    const cookieStore = await cookies()
    cookieStore.set({
      name: "session_id",
      value: session.id,
      httpOnly: true,
      expires: session.expires,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    })

    // Return user data (excluding password)
    const { password: _, ...userData } = user
    return NextResponse.json(userData)
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
