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

    // If there's no session, return demo data for the preview
    if (!sessionId) {
      console.log("No session found, returning demo data");
      const demoUpdates = [
        {
          id: "demo-1",
          week_date: "2025-05-12",
          team_name: "Frontend Platform",
          client_org: "Acme Corp",
          created_at: "2025-05-12T10:30:00Z",
          updated_at: "2025-05-12T14:45:00Z",
        },
        {
          id: "demo-2",
          week_date: "2025-05-05",
          team_name: "Frontend Platform",
          client_org: "Acme Corp",
          created_at: "2025-05-05T09:15:00Z",
          updated_at: "2025-05-05T16:30:00Z",
        },
      ];
      return NextResponse.json(demoUpdates);
    }

    // Find the session from the database
    const session = await findSessionById(sessionId);

    if (!session) {
      console.log("Invalid session, returning demo data");
      cookieStore.delete("session_id");
      // Return demo data for invalid session
      const demoUpdates = [
        {
          id: "demo-1",
          week_date: "2025-05-12",
          team_name: "Frontend Platform",
          client_org: "Acme Corp",
          created_at: "2025-05-12T10:30:00Z",
          updated_at: "2025-05-12T14:45:00Z",
        },
        {
          id: "demo-2",
          week_date: "2025-05-05",
          team_name: "Frontend Platform",
          client_org: "Acme Corp",
          created_at: "2025-05-05T09:15:00Z",
          updated_at: "2025-05-05T16:30:00Z",
        },
      ];
      return NextResponse.json(demoUpdates);
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
    
    // Default to preview-user for unauthenticated requests
    let userId = "preview-user";

    // If there's a valid session, use the real user ID from the database
    if (sessionId) {
      const session = await findSessionById(sessionId);
      if (session) {
        userId = session.user_id;
        console.log("Valid session found, using user ID:", userId);
      } else {
        console.log("Session not found in database");
      }
    }

    console.log("Using user ID for update:", userId);

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
