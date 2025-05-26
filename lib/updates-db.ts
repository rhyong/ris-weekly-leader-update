import { query } from "./db";
import { randomUUID } from "crypto";

// Types for weekly updates
export interface WeeklyUpdate {
  id: string;
  user_id: string;
  team_id: string;
  organization_id: string;
  week_date: string;
  top_3_bullets?: string;
  status?: string;
  created_at: string;
  updated_at: string;
}

export interface WeeklyUpdateListItem {
  id: string;
  week_date: string;
  team_name: string;
  client_org: string;
  created_at: string;
  updated_at: string;
}

export interface UpdateData {
  [key: string]: any;
}

/**
 * Get all weekly updates for a user
 */
export async function getUpdatesByUserId(userId: string): Promise<WeeklyUpdateListItem[]> {
  try {
    console.log(`Fetching updates for user ${userId}`);
    
    const result = await query(`
      SELECT wu.id, wu.week_date, t.name as team_name, o.name as client_org, 
             wu.created_at, wu.updated_at
      FROM weekly_updates wu
      JOIN teams t ON wu.team_id = t.id
      JOIN organizations o ON wu.organization_id = o.id
      WHERE wu.user_id = $1
      ORDER BY wu.week_date DESC
    `, [userId]);

    return result.rows;
  } catch (error) {
    console.error("Error getting updates for user:", error);
    return [];
  }
}

/**
 * Get a single weekly update by ID
 */
export async function getUpdateById(updateId: string): Promise<any> {
  try {
    console.log(`Fetching update with ID ${updateId}`);
    
    // Get the basic update data
    const updateResult = await query(`
      SELECT wu.id, wu.user_id, wu.team_id, wu.organization_id, wu.week_date, 
             wu.top_3_bullets, wu.status, wu.created_at, wu.updated_at,
             t.name as team_name, o.name as client_org
      FROM weekly_updates wu
      JOIN teams t ON wu.team_id = t.id
      JOIN organizations o ON wu.organization_id = o.id
      WHERE wu.id = $1
    `, [updateId]);

    if (updateResult.rows.length === 0) {
      return null;
    }
    
    const update = updateResult.rows[0];
    
    // This will hold all the update data for different sections
    const data: UpdateData = {
      meta: {
        date: update.week_date,
        team_name: update.team_name,
        client_org: update.client_org
      }
    };
    
    // Load team health data
    const teamHealthResult = await query(`
      SELECT * FROM team_health WHERE update_id = $1
    `, [updateId]);
    
    if (teamHealthResult.rows.length > 0) {
      data.team_health = teamHealthResult.rows[0];
    }
    
    // More queries for other sections would go here
    // For now, return the basic update with available data
    
    return {
      id: update.id,
      userId: update.user_id,
      weekDate: update.week_date,
      teamName: update.team_name,
      clientOrg: update.client_org,
      data: data,
      createdAt: update.created_at,
      updatedAt: update.updated_at
    };
  } catch (error) {
    console.error("Error getting update by ID:", error);
    return null;
  }
}

/**
 * Find or create team and organization
 */
async function findOrCreateTeamAndOrg(teamName: string, clientOrg: string): Promise<{teamId: string, orgId: string}> {
  try {
    // Try to find the team first
    const teamResult = await query(`
      SELECT id FROM teams WHERE name = $1
    `, [teamName]);
    
    let teamId;
    if (teamResult.rows.length > 0) {
      teamId = teamResult.rows[0].id;
      console.log(`Found existing team with ID: ${teamId}`);
    } else {
      // Create a new team
      const newTeamResult = await query(`
        INSERT INTO teams (name) VALUES ($1) RETURNING id
      `, [teamName]);
      teamId = newTeamResult.rows[0].id;
      console.log(`Created new team with ID: ${teamId}`);
    }
    
    // Try to find the organization
    const orgResult = await query(`
      SELECT id FROM organizations WHERE name = $1
    `, [clientOrg]);
    
    let orgId;
    if (orgResult.rows.length > 0) {
      orgId = orgResult.rows[0].id;
      console.log(`Found existing organization with ID: ${orgId}`);
    } else {
      // Create a new organization
      const newOrgResult = await query(`
        INSERT INTO organizations (name) VALUES ($1) RETURNING id
      `, [clientOrg]);
      orgId = newOrgResult.rows[0].id;
      console.log(`Created new organization with ID: ${orgId}`);
    }
    
    return { teamId, orgId };
  } catch (error) {
    console.error("Error finding or creating team and org:", error);
    throw error;
  }
}

/**
 * Save a weekly update (create new or update existing)
 */
export async function saveUpdate(
  userId: string,
  weekDate: string,
  teamName: string,
  clientOrg: string,
  data: any,
  updateId?: string
): Promise<any> {
  // Don't allow preview-user to save updates to the database
  if (userId === "preview-user") {
    console.log("Preview user cannot save updates to the database");
    return {
      id: randomUUID(),
      userId,
      weekDate,
      teamName,
      clientOrg,
      data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  try {
    console.log(`Saving update for user ${userId}, date ${weekDate}, team ${teamName}`);
    
    // Get team and org IDs
    const { teamId, orgId } = await findOrCreateTeamAndOrg(teamName, clientOrg);
    
    // Extract top 3 bullets if available
    const top3Bullets = data.top_3_bullets || '';
    
    let result;
    
    // Check if this is an update to an existing record
    if (updateId) {
      console.log(`Updating existing update with ID: ${updateId}`);
      
      // Update the main weekly update record
      result = await query(`
        UPDATE weekly_updates 
        SET team_id = $1, organization_id = $2, week_date = $3, top_3_bullets = $4
        WHERE id = $5 AND user_id = $6
        RETURNING id, user_id, team_id, organization_id, week_date, top_3_bullets, created_at, updated_at
      `, [teamId, orgId, weekDate, top3Bullets, updateId, userId]);
      
      if (result.rows.length === 0) {
        throw new Error("Update not found or not authorized to modify");
      }
    } else {
      // Check if an update already exists for this week and team
      const existingResult = await query(`
        SELECT id FROM weekly_updates 
        WHERE team_id = $1 AND week_date = $2
      `, [teamId, weekDate]);
      
      if (existingResult.rows.length > 0) {
        const existingId = existingResult.rows[0].id;
        console.log(`Found existing update for this week and team: ${existingId}`);
        
        // Update the existing record
        result = await query(`
          UPDATE weekly_updates 
          SET user_id = $1, top_3_bullets = $2
          WHERE id = $3
          RETURNING id, user_id, team_id, organization_id, week_date, top_3_bullets, created_at, updated_at
        `, [userId, top3Bullets, existingId]);
      } else {
        // Create a new update
        console.log(`Creating new update for week ${weekDate}`);
        result = await query(`
          INSERT INTO weekly_updates (user_id, team_id, organization_id, week_date, top_3_bullets)
          VALUES ($1, $2, $3, $4, $5)
          RETURNING id, user_id, team_id, organization_id, week_date, top_3_bullets, created_at, updated_at
        `, [userId, teamId, orgId, weekDate, top3Bullets]);
      }
    }
    
    const savedUpdate = result.rows[0];
    console.log(`Successfully saved update with ID: ${savedUpdate.id}`);
    
    // In a real implementation, we'd also save all the related data in their respective tables
    // For now, we'll just return the basic update info along with the data that was passed in
    
    return {
      id: savedUpdate.id,
      userId: savedUpdate.user_id,
      weekDate: savedUpdate.week_date,
      teamName,
      clientOrg,
      data,
      createdAt: savedUpdate.created_at,
      updatedAt: savedUpdate.updated_at
    };
  } catch (error) {
    console.error("Error saving update:", error);
    throw error;
  }
}