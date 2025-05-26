import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { findSessionById, getUpdatesByUserId, saveUpdate, weeklyUpdates } from "@/lib/mock-data"

export async function GET() {
  try {
    console.log("GET /api/updates - Starting to process request");
    console.log("Current weeklyUpdates array length:", weeklyUpdates.length);
    
    // Check if we have global data that should be used
    if (typeof global !== 'undefined' && global.__mockData && global.__mockData.weeklyUpdatesStore) {
      console.log("Global store exists with", global.__mockData.weeklyUpdatesStore.length, "updates");
      if (global.__mockData.weeklyUpdatesStore.length > weeklyUpdates.length) {
        console.log("Updating weeklyUpdates from global store");
        // Update our local reference
        weeklyUpdates.length = 0; // Clear the array
        weeklyUpdates.push(...global.__mockData.weeklyUpdatesStore); // Add all items
      }
    }
    
    // For development/preview purposes, return mock data even without authentication
    // This ensures the history page works in the preview environment
    const cookieStore = await cookies()
    const sessionId = cookieStore.get("session_id")?.value

    // If there's no session, return mock data for demo purposes
    if (!sessionId) {
      const mockUpdates = [
        {
          id: "1",
          week_date: "2025-05-12",
          team_name: "Frontend Platform",
          client_org: "Acme Corp",
          created_at: "2025-05-12T10:30:00Z",
          updated_at: "2025-05-12T14:45:00Z",
        },
        {
          id: "2",
          week_date: "2025-05-05",
          team_name: "Frontend Platform",
          client_org: "Acme Corp",
          created_at: "2025-05-05T09:15:00Z",
          updated_at: "2025-05-05T16:30:00Z",
        },
      ]
      return NextResponse.json(mockUpdates)
    }

    // Find the session
    const session = findSessionById(sessionId)

    if (!session) {
      cookieStore.delete("session_id")
      // For demo purposes, return mock data even if session is invalid
      const mockUpdates = [
        {
          id: "1",
          week_date: "2025-05-12",
          team_name: "Frontend Platform",
          client_org: "Acme Corp",
          created_at: "2025-05-12T10:30:00Z",
          updated_at: "2025-05-12T14:45:00Z",
        },
        {
          id: "2",
          week_date: "2025-05-05",
          team_name: "Frontend Platform",
          client_org: "Acme Corp",
          created_at: "2025-05-05T09:15:00Z",
          updated_at: "2025-05-05T16:30:00Z",
        },
      ]
      return NextResponse.json(mockUpdates)
    }

    // Get updates for this user
    const updates = getUpdatesByUserId(session.userId)

    // Format the response to match the expected structure
    const formattedUpdates = updates.map(({ id, weekDate, teamName, clientOrg, createdAt, updatedAt }) => ({
      id,
      week_date: weekDate,
      team_name: teamName,
      client_org: clientOrg,
      created_at: createdAt,
      updated_at: updatedAt,
    }))

    return NextResponse.json(formattedUpdates)
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
    
    let userId = "preview-user";

    // If there's a valid session, use the real user ID
    if (sessionId) {
      const session = findSessionById(sessionId);
      if (session) {
        userId = session.userId;
        console.log("Valid session found, using user ID:", userId);
      } else {
        console.log("Session ID not found in active sessions");
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

    // Save the update using our mock data function
    try {
      console.log("Saving update with userId:", userId, "isNewUpdate:", isNewUpdate);
      
      // Ensure weeklyUpdates is defined
      if (!weeklyUpdates) {
        console.error("weeklyUpdates array is not defined");
        return NextResponse.json({ 
          error: "Database error", 
          message: "Mock data storage is not available" 
        }, { status: 500 });
      }
      
      // Check if an update already exists for this date and user
      const existingUpdateIndex = weeklyUpdates.findIndex(
        (update) => update.userId === userId && update.weekDate === weekDate
      );
      
      console.log("API - Existing update index check:", existingUpdateIndex);
      
      // Handle whether to create new or update existing
      let effectiveWeekDate = weekDate;
      let updateId = existingUpdateId;
      
      // Case 1: New update (no existingUpdateId provided)
      if (isNewUpdate === true) {
        console.log("Processing as a new update");
        
        // If there's an existing update with the same date, make the date unique
        if (existingUpdateIndex >= 0) {
          const timestamp = new Date().getTime();
          effectiveWeekDate = `${weekDate}-${timestamp}`;
          console.log("Forcing new update by modifying date:", effectiveWeekDate);
        }
      } 
      // Case 2: Editing an existing update (existingUpdateId provided)
      else if (existingUpdateId) {
        console.log("Processing as an edit to existing update:", existingUpdateId);
        
        // Find the update with this ID
        const specificUpdateIndex = weeklyUpdates.findIndex(
          (update) => update.id === existingUpdateId
        );
        
        if (specificUpdateIndex >= 0) {
          console.log("Found specific update to edit at index:", specificUpdateIndex);
          // Use the ID we're editing, not the date-matched one
          updateId = existingUpdateId;
          // Use the current date from the request
          effectiveWeekDate = weekDate;
        } else {
          console.warn("Specified update ID not found:", existingUpdateId);
        }
      }
      
      try {
        // If we have an updateId and we're not creating a new update, pass it to ensure we update the correct record
        const update = isNewUpdate ? 
          saveUpdate(userId, effectiveWeekDate, teamName, clientOrg, data) :
          saveUpdate(userId, effectiveWeekDate, teamName, clientOrg, data, updateId);
        
        console.log("Update saved successfully with ID:", update.id);
        
        // Return the result
        return NextResponse.json({ 
          id: update.id, 
          success: true,
          wasNewUpdate: existingUpdateIndex < 0 || isNewUpdate === true,
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
      console.error("Error checking for existing updates:", saveError);
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
