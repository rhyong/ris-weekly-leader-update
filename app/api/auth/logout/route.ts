import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { deleteSession } from "@/lib/mock-data"

export async function POST() {
  try {
    const cookieStore = await cookies()
    const sessionId = cookieStore.get("session_id")?.value

    if (sessionId) {
      // Delete the session
      deleteSession(sessionId)

      // Clear the cookie
      cookieStore.delete("session_id")
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Logout error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
