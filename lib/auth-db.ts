import { query, hashPassword } from "./db";
import { randomUUID } from "crypto";

// User type definition
export interface User {
  id: string;
  username: string;
  name: string;
  role: string;
  email?: string;
  teamName?: string;
  clientOrg?: string;
  bio?: string;
  profileImage?: string;
}

// Session type definition
export interface Session {
  id: string;
  user_id: string;
  expires: Date;
}

// Team member type definition
export interface TeamMember {
  id: string;
  name: string;
  role: string;
  email?: string;
}

/**
 * Find a user by their credentials
 */
export async function findUserByCredentials(
  username: string,
  password: string
): Promise<User | null> {
  try {
    console.log(`Checking credentials for ${username}`);
    
    // Hash the password to compare with stored hash
    const hashedPassword = hashPassword(password);
    
    // Query the database for the user
    const result = await query(
      "SELECT id, username, name, role, email FROM users WHERE username = $1 AND password_hash = $2",
      [username, hashedPassword]
    );

    if (result.rows.length === 0) {
      console.log(`Invalid credentials for ${username}`);
      return null;
    }

    console.log(`Valid credentials for ${username}`);
    return result.rows[0];
  } catch (error) {
    console.error("Error finding user by credentials:", error);
    return null;
  }
}

/**
 * Find a user by their ID
 */
export async function findUserById(userId: string): Promise<User | null> {
  try {
    // Simpler query that only includes columns we know exist
    const result = await query(
      "SELECT id, username, name, role, email FROM users WHERE id = $1",
      [userId]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return result.rows[0];
  } catch (error) {
    console.error("Error finding user by ID:", error);
    return null;
  }
}

/**
 * Create a new session for a user
 */
export async function createSession(userId: string): Promise<Session | null> {
  try {
    const sessionId = randomUUID();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 1 week

    // Insert the session into the database
    await query(
      "INSERT INTO sessions (id, user_id, token, expires_at) VALUES ($1, $2, $3, $4)",
      [sessionId, userId, sessionId, expiresAt]
    );

    console.log(`Created session ${sessionId} for user ${userId}`);

    return {
      id: sessionId,
      user_id: userId,
      expires: expiresAt,
    };
  } catch (error) {
    console.error("Error creating session:", error);
    return null;
  }
}

/**
 * Find a session by its ID
 */
export async function findSessionById(sessionId: string): Promise<Session | null> {
  try {
    console.log(`Searching for session with token: ${sessionId.substring(0, 8)}...`);
    
    // First try with token field
    let result = await query(
      "SELECT id, user_id, expires_at FROM sessions WHERE token = $1 AND expires_at > NOW()",
      [sessionId]
    );

    // If no results, try with id field as fallback
    if (result.rows.length === 0) {
      console.log(`Trying to find session with id instead of token...`);
      result = await query(
        "SELECT id, user_id, expires_at FROM sessions WHERE id = $1 AND expires_at > NOW()",
        [sessionId]
      );
    }

    if (result.rows.length === 0) {
      console.log(`Session ${sessionId.substring(0, 8)}... not found or expired`);
      
      // Log all active sessions for debugging
      const activeSessionsResult = await query(
        "SELECT id, user_id, expires_at FROM sessions WHERE expires_at > NOW() LIMIT 5"
      );
      
      if (activeSessionsResult.rows.length > 0) {
        console.log(`Found ${activeSessionsResult.rows.length} active sessions`);
        activeSessionsResult.rows.forEach(session => {
          console.log(`- Session ID: ${session.id.substring(0, 8)}..., User ID: ${session.user_id}`);
        });
      } else {
        console.log("No active sessions found in database");
      }
      
      return null;
    }

    console.log(`Found session for user ID: ${result.rows[0].user_id}`);
    return {
      id: result.rows[0].id,
      user_id: result.rows[0].user_id,
      expires: result.rows[0].expires_at,
    };
  } catch (error) {
    console.error("Error finding session:", error);
    return null;
  }
}

/**
 * Delete a session
 */
export async function deleteSession(sessionId: string): Promise<boolean> {
  try {
    await query("DELETE FROM sessions WHERE token = $1", [sessionId]);
    console.log(`Deleted session ${sessionId}`);
    return true;
  } catch (error) {
    console.error("Error deleting session:", error);
    return false;
  }
}

/**
 * Get team members for a user
 */
export async function getTeamMembersForUser(userId: string): Promise<TeamMember[]> {
  try {
    // Get teams the user belongs to
    const teamsResult = await query(
      `SELECT team_id FROM team_members WHERE user_id = $1`,
      [userId]
    );

    if (teamsResult.rows.length === 0) {
      return [];
    }

    // Get all team members from these teams (excluding the current user)
    const teamIds = teamsResult.rows.map(row => row.team_id);
    const membersResult = await query(
      `SELECT u.id, u.name, tm.role, u.email 
       FROM team_members tm
       JOIN users u ON tm.user_id = u.id
       WHERE tm.team_id = ANY($1::uuid[]) AND u.id != $2`,
      [teamIds, userId]
    );

    return membersResult.rows;
  } catch (error) {
    console.error("Error getting team members:", error);
    return [];
  }
}

/**
 * Update user profile
 */
export async function updateUserProfile(
  userId: string,
  updatedData: Partial<User>
): Promise<User | null> {
  try {
    // Log input data
    console.log(`Updating profile for user ${userId} with data:`, updatedData);
    
    // Don't allow updating sensitive fields
    const { id, password, ...safeData } = updatedData as any;
    
    // Only include fields that exist in the database - based on error message
    // We know these columns exist: id, username, name, role, email
    const validColumns = ["name", "role", "email"];
    
    // Build the query dynamically based on provided fields
    const updateFields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    Object.entries(safeData).forEach(([key, value]) => {
      // Only include fields that are in the validColumns list
      if (value !== undefined && validColumns.includes(key)) {
        updateFields.push(`${key} = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      }
    });

    console.log("Update fields:", updateFields);
    console.log("Update values:", values);

    if (updateFields.length === 0) {
      console.log("No fields to update, returning current user");
      return await findUserById(userId);
    }

    values.push(userId);
    const updateQuery = `
      UPDATE users 
      SET ${updateFields.join(', ')} 
      WHERE id = $${paramIndex}
      RETURNING id, username, name, role, email
    `;
    
    console.log("Generated SQL query:", updateQuery);

    const result = await query(updateQuery, values);
    
    if (result.rows.length === 0) {
      console.log("No rows updated");
      return null;
    }

    console.log("Profile updated successfully, returning user:", result.rows[0]);
    return result.rows[0];
  } catch (error) {
    console.error("Error updating user profile:", error);
    return null;
  }
}