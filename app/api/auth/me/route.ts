import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { findSessionById, findUserById } from "@/lib/mock-data"

export async function GET() {
  try {
    const cookieStore = await cookies()
    const sessionId = cookieStore.get("session_id")?.value

    if (!sessionId) {
      // For preview purposes, return a mock user
      return NextResponse.json({
        id: "preview-user",
        username: "preview",
        name: "Preview User",
        role: "Team Lead",
      })
    }

    // Find the session
    const session = findSessionById(sessionId)

    if (!session) {
      cookieStore.delete("session_id")
      // For preview purposes, return a mock user
      return NextResponse.json({
        id: "preview-user",
        username: "preview",
        name: "Preview User",
        role: "Team Lead",
      })
    }

    // Find the user
    const user = findUserById(session.userId)

    if (!user) {
      cookieStore.delete("session_id")
      // For preview purposes, return a mock user
      return NextResponse.json({
        id: "preview-user",
        username: "preview",
        name: "Preview User",
        role: "Team Lead",
      })
    }

    // Return user data (excluding password)
    const { password: _, ...userData } = user
    return NextResponse.json(userData)
  } catch (error) {
    console.error("Auth check error:", error)
    // For preview purposes, return a mock user
    return NextResponse.json({
      id: "preview-user",
      username: "preview",
      name: "Preview User",
      role: "Team Lead",
    })
  }
}
