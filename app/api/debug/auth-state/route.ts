import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { findSessionById, findUserById } from "@/lib/auth-db"

export async function GET(request: Request) {
  try {
    // Get session information from various sources
    const { searchParams } = new URL(request.url);
    const sidParam = searchParams.get('sid');
    
    const cookieStore = await cookies();
    const cookiesList = cookieStore.getAll();
    const cookieSessionId = cookieStore.get("session_id")?.value;
    
    // Use the session ID from query parameters if available, otherwise use the cookie
    const sessionId = sidParam || cookieSessionId;
    
    // Initialize response object
    const response: any = {
      // Basic info
      timestamp: new Date().toISOString(),
      requestHeaders: Object.fromEntries(request.headers.entries()),
      cookies: cookiesList.map(c => ({ 
        name: c.name, 
        value: c.name === "session_id" ? `${c.value.substring(0, 8)}...` : "hidden" 
      })),
      
      // Session info
      sessionId: sessionId ? `${sessionId.substring(0, 8)}...` : null,
      sessionSource: sidParam ? "query" : (cookieSessionId ? "cookie" : "none"),
    };
    
    // Get session details if we have a session ID
    if (sessionId) {
      const session = await findSessionById(sessionId);
      
      if (session) {
        response.session = {
          exists: true,
          userId: session.user_id,
          expires: session.expires,
          isExpired: new Date(session.expires) < new Date()
        };
        
        // Try to get user information
        const user = await findUserById(session.user_id);
        if (user) {
          response.user = {
            exists: true,
            id: user.id,
            username: user.username,
            name: user.name,
            role: user.role
          };
        } else {
          response.user = { exists: false, error: "User not found" };
        }
      } else {
        response.session = { exists: false, error: "Session not found" };
      }
    }
    
    return NextResponse.json(response);
  } catch (error) {
    console.error("Auth state debug error:", error);
    return NextResponse.json({ 
      error: "Error checking auth state",
      message: (error as Error).message
    }, { status: 500 });
  }
}