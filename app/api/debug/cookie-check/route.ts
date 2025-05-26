import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    // Get all cookies from the request
    const cookieStore = await cookies()
    const cookiesList = cookieStore.getAll()
    
    // Check specific cookie values
    const sessionId = cookieStore.get("session_id")?.value
    
    // Get all request headers for debugging
    const requestHeaders = Object.fromEntries(
      [...request.headers.entries()].map(([key, value]) => [
        key, 
        key.toLowerCase() === 'cookie' ? '(hidden for privacy)' : value
      ])
    )
    
    // Return comprehensive debug information
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      cookies: {
        count: cookiesList.length,
        names: cookiesList.map(c => c.name),
        session_id: sessionId ? {
          exists: true,
          value_preview: `${sessionId.substring(0, 8)}...`,
          expires: cookieStore.get("session_id")?.expires,
          path: cookieStore.get("session_id")?.path,
          // Don't include full value for security
        } : { exists: false },
      },
      headers: requestHeaders,
      serverInfo: {
        process_env: {
          NODE_ENV: process.env.NODE_ENV,
        }
      }
    })
  } catch (error) {
    console.error("Cookie debug error:", error)
    return NextResponse.json({ 
      error: "Error checking cookies",
      message: (error as Error).message
    }, { status: 500 })
  }
}