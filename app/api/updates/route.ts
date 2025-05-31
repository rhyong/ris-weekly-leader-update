import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { findSessionById } from "@/lib/auth-db"
import { getUpdatesByUserId, saveUpdate } from "@/lib/updates-db"

export async function GET() {
  try {
    console.log("GET /api/updates - Starting to process request");
    
    // For authenticated users, get their updates from the database
    const cookieStore = await cookies();
    const sessionId = cookieStore.get("session_id")?.value;

    // If there's no session, return an error
    if (!sessionId) {
      console.log("No session found, returning authentication error");
      return NextResponse.json({ 
        error: "Authentication required", 
        message: "You must be logged in to view updates"
      }, { status: 401 });
    }

    // Find the session from the database
    const session = await findSessionById(sessionId);

    if (!session) {
      console.log("Invalid session, deleting cookie and returning error");
      cookieStore.delete("session_id");
      // Return error for invalid session
      return NextResponse.json({ 
        error: "Invalid session", 
        message: "Your session has expired or is invalid. Please log in again."
      }, { status: 401 });
    }

    // Get updates for this user from the database
    const updates = await getUpdatesByUserId(session.user_id);
    console.log(`Found ${updates.length} updates for user ${session.user_id}`);
    
    // The database function now returns data in the expected format
    return NextResponse.json(updates);
  } catch (error) {
    console.error("Error fetching updates:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    console.log("POST /api/updates - Starting to process request");
    
    const cookieStore = await cookies();
    const sessionId = cookieStore.get("session_id")?.value;
    console.log("Session ID from cookies:", sessionId ? "Found" : "Not found");
    
    // Require authentication for POST requests
    if (!sessionId) {
      console.log("No session found, returning authentication error");
      return NextResponse.json({ 
        error: "Authentication required", 
        message: "You must be logged in to save updates"
      }, { status: 401 });
    }
    
    // Get user from session
    const session = await findSessionById(sessionId);
    if (!session) {
      console.log("Invalid session, returning error");
      cookieStore.delete("session_id");
      return NextResponse.json({ 
        error: "Invalid session", 
        message: "Your session has expired or is invalid. Please log in again."
      }, { status: 401 });
    }
    
    // Use the user ID from the session
    const userId = session.user_id;
    console.log("Valid session found, using user ID:", userId);

    // Parse request body
    const requestBody = await request.json();
    console.log("Request body received:", JSON.stringify({
      weekDate: requestBody.weekDate,
      teamName: requestBody.teamName,
      clientOrg: requestBody.clientOrg,
      isNewUpdate: requestBody.isNewUpdate,
      dataKeys: requestBody.data ? Object.keys(requestBody.data) : "No data"
    }));
    
    const { weekDate, teamName, clientOrg, data, isNewUpdate, existingUpdateId } = requestBody;

    // Validate required fields
    if (!weekDate || !teamName || !clientOrg) {
      console.error("Missing required fields in request:", { weekDate, teamName, clientOrg });
      return NextResponse.json({ 
        error: "Missing required fields", 
        details: { weekDate: !weekDate, teamName: !teamName, clientOrg: !clientOrg } 
      }, { status: 400 });
    }

    // Save the update using our database functions
    try {
      console.log("Saving update with userId:", userId, "isNewUpdate:", isNewUpdate);
      
      // Handle whether to create new or update existing
      let effectiveWeekDate = weekDate;
      
      // If creating a new update but one might already exist for this date, make the date unique
      if (isNewUpdate === true) {
        console.log("Processing as a new update");
      } 
      // If editing an existing update, use the provided ID
      else if (existingUpdateId) {
        console.log("Processing as an edit to existing update:", existingUpdateId);
      }
      
      try {
        // Save to database using our new function
        const update = await saveUpdate(
          userId, 
          effectiveWeekDate, 
          teamName, 
          clientOrg, 
          data, 
          isNewUpdate ? undefined : existingUpdateId
        );
        
        console.log("Update saved successfully with ID:", update.id);
        
        // Return the result
        return NextResponse.json({ 
          id: update.id, 
          success: true,
          wasNewUpdate: isNewUpdate === true,
          weekDate: effectiveWeekDate
        });
      } catch (innerError) {
        console.error("Error in saveUpdate function:", innerError);
        return NextResponse.json({ 
          error: "Save error", 
          message: String(innerError)
        }, { status: 500 });
      }
    } catch (saveError) {
      console.error("Error saving update:", saveError);
      return NextResponse.json({ 
        error: "Database error", 
        message: String(saveError) 
      }, { status: 500 });
    }
  } catch (error) {
    console.error("Error saving update:", error);
    return NextResponse.json({ error: "Internal server error", message: String(error) }, { status: 500 });
  }
}
