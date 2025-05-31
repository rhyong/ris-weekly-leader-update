import { query, beginTransaction, commitTransaction, rollbackTransaction } from "./db";
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
 * Helper function to save an array of simple items to a child table
 */
async function saveArrayItems(
  parentId: string,
  parentIdField: string,
  tableName: string, 
  items: string[],
  descriptionField: string = 'description'
): Promise<void> {
  // First delete existing items
  await query(`DELETE FROM ${tableName} WHERE ${parentIdField} = $1`, [parentId]);
  
  // Then insert new non-empty items
  if (Array.isArray(items)) {
    for (const item of items) {
      if (item && item.trim() !== '') {
        await query(`
          INSERT INTO ${tableName} (${parentIdField}, ${descriptionField})
          VALUES ($1, $2)
        `, [parentId, item]);
      }
    }
  }
}

/**
 * Helper function to load an array of simple items from a child table
 */
async function loadArrayItems(
  parentId: string,
  parentIdField: string,
  tableName: string,
  descriptionField: string = 'description'
): Promise<string[]> {
  const result = await query(`
    SELECT * FROM ${tableName} 
    WHERE ${parentIdField} = $1
    ORDER BY created_at
  `, [parentId]);
  
  if (result.rows.length > 0) {
    return result.rows.map(row => row[descriptionField]);
  }
  
  return [''];
}

/**
 * Helper function to find or create a parent record
 */
async function findOrCreateParentRecord(
  tableName: string,
  updateId: string,
  additionalFields: { [key: string]: any } = {}
): Promise<string> {
  // Check if a record already exists
  const existingResult = await query(`
    SELECT id FROM ${tableName} WHERE update_id = $1
  `, [updateId]);
  
  if (existingResult.rows.length > 0) {
    const recordId = existingResult.rows[0].id;
    
    // If there are additional fields to update
    if (Object.keys(additionalFields).length > 0) {
      const updateFields = Object.keys(additionalFields)
        .map((key, index) => `${key} = $${index + 2}`)
        .join(', ');
      
      const updateValues = [recordId, ...Object.values(additionalFields)];
      
      await query(`
        UPDATE ${tableName}
        SET ${updateFields}
        WHERE id = $1
      `, updateValues);
    }
    
    return recordId;
  } else {
    // Create a new record
    const fields = ['update_id', ...Object.keys(additionalFields)];
    const placeholders = fields.map((_, index) => `$${index + 1}`).join(', ');
    const values = [updateId, ...Object.values(additionalFields)];
    
    const newResult = await query(`
      INSERT INTO ${tableName} (${fields.join(', ')})
      VALUES (${placeholders})
      RETURNING id
    `, values);
    
    return newResult.rows[0].id;
  }
}

/**
 * Helper function to ensure a consistent data structure when loading an update
 */
function getDefaultDataStructure(): UpdateData {
  return {
    meta: {
      date: new Date().toISOString().split('T')[0],
      team_name: '',
      client_org: ''
    },
    top_3_bullets: '',
    team_health: {
      owner_input: '',
      sentiment_score: 3.5,
      overall_status: '',
      energy_engagement: '',
      roles_alignment: ''
    },
    delivery_performance: {
      workload_balance: 'JustRight',
      accomplishments: [''],
      misses_delays: ['']
    },
    stakeholder_engagement: {
      stakeholder_nps: null,
      feedback_notes: [''],
      expectation_shift: ['']
    },
    risks_escalations: {
      risks: [{ title: '', description: '', severity: 'Green' }],
      escalations: ['']
    },
    opportunities_wins: {
      wins: [''],
      growth_ops: ['']
    },
    support_needed: {
      requests: ['']
    },
    personal_updates: {
      personal_wins: [''],
      leadership_focus: {
        skill: '',
        practice: ''
      },
      reflections: [''],
      goals: [{ description: '', status: 'Green', update: '' }],
      support_needed: ''
    },
    team_members_updates: {
      people_changes: '',
      top_contributors: [{ name: '', achievement: '', recognition: '' }],
      members_needing_attention: [{ name: '', issue: '', support_plan: '', delivery_risk: 'Low' }]
    }
  };
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
 * Get a single weekly update by ID with all related data
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
    
    // Start with default data structure to ensure all fields exist
    const data = getDefaultDataStructure();
    
    // Update meta data from the database
    // Ensure the date is properly formatted as yyyy-MM-dd for the form
    let formattedDate = update.week_date;
    try {
      const dateObj = new Date(update.week_date);
      if (!isNaN(dateObj.getTime())) {
        formattedDate = dateObj.toISOString().split('T')[0]; // format as yyyy-MM-dd
        console.log(`Converted date from ${update.week_date} to ${formattedDate}`);
      }
    } catch (e) {
      console.error("Error formatting date:", e);
    }
    
    data.meta = {
      date: formattedDate,
      team_name: update.team_name,
      client_org: update.client_org
    };
    data.top_3_bullets = update.top_3_bullets || '';
    
    // Load team_health data
    const teamHealthResult = await query(`
      SELECT * FROM team_health WHERE update_id = $1
    `, [updateId]);
    
    if (teamHealthResult.rows.length > 0) {
      const teamHealth = teamHealthResult.rows[0];
      data.team_health = {
        owner_input: teamHealth.owner_input || '',
        sentiment_score: teamHealth.sentiment_score || 3.5,
        overall_status: teamHealth.overall_status || '',
        energy_engagement: teamHealth.energy_engagement || '',
        roles_alignment: teamHealth.roles_alignment || ''
      };
    }
    
    // Load delivery_performance data
    const deliveryPerfResult = await query(`
      SELECT * FROM delivery_performance WHERE update_id = $1
    `, [updateId]);
    
    let deliveryPerfId = null;
    if (deliveryPerfResult.rows.length > 0) {
      deliveryPerfId = deliveryPerfResult.rows[0].id;
      data.delivery_performance.workload_balance = 
        deliveryPerfResult.rows[0].workload_balance || 'JustRight';
    }
    
    // If we found delivery performance, load accomplishments and misses
    if (deliveryPerfId) {
      // Load accomplishments
      const accomplishmentsResult = await query(`
        SELECT * FROM delivery_accomplishments 
        WHERE performance_id = $1
        ORDER BY created_at
      `, [deliveryPerfId]);
      
      if (accomplishmentsResult.rows.length > 0) {
        data.delivery_performance.accomplishments = accomplishmentsResult.rows.map(row => row.description);
      }
      
      // Load misses and delays
      const missesResult = await query(`
        SELECT * FROM delivery_misses_delays 
        WHERE performance_id = $1
        ORDER BY created_at
      `, [deliveryPerfId]);
      
      if (missesResult.rows.length > 0) {
        data.delivery_performance.misses_delays = missesResult.rows.map(row => row.description);
      }
    }
    
    // Load stakeholder_engagement data
    const stakeholderEngResult = await query(`
      SELECT * FROM stakeholder_engagement WHERE update_id = $1
    `, [updateId]);
    
    let stakeholderEngId = null;
    if (stakeholderEngResult.rows.length > 0) {
      stakeholderEngId = stakeholderEngResult.rows[0].id;
      data.stakeholder_engagement.stakeholder_nps = stakeholderEngResult.rows[0].stakeholder_nps;
    }
    
    // If we found stakeholder engagement, load feedback and expectations
    if (stakeholderEngId) {
      // Load feedback
      const feedbackResult = await query(`
        SELECT * FROM stakeholder_feedback 
        WHERE engagement_id = $1
        ORDER BY created_at
      `, [stakeholderEngId]);
      
      if (feedbackResult.rows.length > 0) {
        data.stakeholder_engagement.feedback_notes = feedbackResult.rows.map(row => row.feedback);
      }
      
      // Load expectations
      const expectationsResult = await query(`
        SELECT * FROM stakeholder_expectations 
        WHERE engagement_id = $1
        ORDER BY created_at
      `, [stakeholderEngId]);
      
      if (expectationsResult.rows.length > 0) {
        data.stakeholder_engagement.expectation_shift = expectationsResult.rows.map(row => row.expectation);
      }
    }
    
    // Load risks_escalations data
    const risksEscResult = await query(`
      SELECT * FROM risks_escalations WHERE update_id = $1
    `, [updateId]);
    
    let risksEscId = null;
    if (risksEscResult.rows.length > 0) {
      risksEscId = risksEscResult.rows[0].id;
      // Clear default entry
      data.risks_escalations.risks = [];
      data.risks_escalations.escalations = [];
    }
    
    // If we found risks & escalations, load risks and escalations
    if (risksEscId) {
      // Load risks
      const risksResult = await query(`
        SELECT * FROM risks 
        WHERE risks_escalations_id = $1
        ORDER BY created_at
      `, [risksEscId]);
      
      if (risksResult.rows.length > 0) {
        data.risks_escalations.risks = risksResult.rows.map(row => ({
          title: row.title || '',
          description: row.description || '',
          severity: row.severity || 'Green'
        }));
      } else {
        // Provide at least one empty risk
        data.risks_escalations.risks = [{ title: '', description: '', severity: 'Green' }];
      }
      
      // Load escalations
      const escalationsResult = await query(`
        SELECT * FROM escalations 
        WHERE risks_escalations_id = $1
        ORDER BY created_at
      `, [risksEscId]);
      
      if (escalationsResult.rows.length > 0) {
        data.risks_escalations.escalations = escalationsResult.rows.map(row => row.description);
      } else {
        // Provide at least one empty escalation
        data.risks_escalations.escalations = [''];
      }
    }
    
    // Load opportunities_wins data
    const oppsWinsResult = await query(`
      SELECT * FROM opportunities_wins WHERE update_id = $1
    `, [updateId]);
    
    let oppsWinsId = null;
    if (oppsWinsResult.rows.length > 0) {
      oppsWinsId = oppsWinsResult.rows[0].id;
      // Clear default entries
      data.opportunities_wins.wins = [];
      data.opportunities_wins.growth_ops = [];
    }
    
    // If we found opportunities & wins, load wins and growth opportunities
    if (oppsWinsId) {
      // Load wins
      const winsResult = await query(`
        SELECT * FROM wins 
        WHERE opportunities_wins_id = $1
        ORDER BY created_at
      `, [oppsWinsId]);
      
      if (winsResult.rows.length > 0) {
        data.opportunities_wins.wins = winsResult.rows.map(row => row.description);
      } else {
        // Provide at least one empty win
        data.opportunities_wins.wins = [''];
      }
      
      // Load growth opportunities
      const growthOpsResult = await query(`
        SELECT * FROM growth_opportunities 
        WHERE opportunities_wins_id = $1
        ORDER BY created_at
      `, [oppsWinsId]);
      
      if (growthOpsResult.rows.length > 0) {
        data.opportunities_wins.growth_ops = growthOpsResult.rows.map(row => row.description);
      } else {
        // Provide at least one empty growth opportunity
        data.opportunities_wins.growth_ops = [''];
      }
    }
    
    // Load support_needed data
    const supportNeededResult = await query(`
      SELECT * FROM support_needed WHERE update_id = $1
    `, [updateId]);
    
    let supportNeededId = null;
    if (supportNeededResult.rows.length > 0) {
      supportNeededId = supportNeededResult.rows[0].id;
      // Clear default entry
      data.support_needed.requests = [];
    }
    
    // If we found support needed, load requests
    if (supportNeededId) {
      // Load support requests
      const requestsResult = await query(`
        SELECT * FROM support_requests 
        WHERE support_needed_id = $1
        ORDER BY created_at
      `, [supportNeededId]);
      
      if (requestsResult.rows.length > 0) {
        data.support_needed.requests = requestsResult.rows.map(row => row.description);
      } else {
        // Provide at least one empty request
        data.support_needed.requests = [''];
      }
    }
    
    // Load personal_updates data
    const personalUpdatesResult = await query(`
      SELECT * FROM personal_updates WHERE update_id = $1
    `, [updateId]);
    
    let personalUpdatesId = null;
    if (personalUpdatesResult.rows.length > 0) {
      const personalUpdate = personalUpdatesResult.rows[0];
      personalUpdatesId = personalUpdate.id;
      
      data.personal_updates.support_needed = personalUpdate.support_needed || '';
      
      // Clear default entries
      data.personal_updates.personal_wins = [];
      data.personal_updates.reflections = [];
      data.personal_updates.goals = [];
    }
    
    // If we found personal updates, load wins, reflections, and goals
    if (personalUpdatesId) {
      // Load personal wins
      const winsResult = await query(`
        SELECT * FROM personal_wins 
        WHERE personal_update_id = $1
        ORDER BY created_at
      `, [personalUpdatesId]);
      
      if (winsResult.rows.length > 0) {
        data.personal_updates.personal_wins = winsResult.rows.map(row => row.description);
      } else {
        // Provide at least one empty win
        data.personal_updates.personal_wins = [''];
      }
      
      // Load reflections
      const reflectionsResult = await query(`
        SELECT * FROM personal_reflections 
        WHERE personal_update_id = $1
        ORDER BY created_at
      `, [personalUpdatesId]);
      
      if (reflectionsResult.rows.length > 0) {
        data.personal_updates.reflections = reflectionsResult.rows.map(row => row.description);
      } else {
        // Provide at least one empty reflection
        data.personal_updates.reflections = [''];
      }
      
      // Load goals
      const goalsResult = await query(`
        SELECT * FROM personal_goals 
        WHERE personal_update_id = $1
        ORDER BY created_at
      `, [personalUpdatesId]);
      
      if (goalsResult.rows.length > 0) {
        data.personal_updates.goals = goalsResult.rows.map(row => ({
          description: row.description || '',
          status: row.status || 'Green',
          update: row.update_text || ''
        }));
      } else {
        // Provide at least one empty goal
        data.personal_updates.goals = [{ description: '', status: 'Green', update: '' }];
      }
    }
    
    // Load team_members_updates data
    const teamMembersUpdatesResult = await query(`
      SELECT * FROM team_members_updates WHERE update_id = $1
    `, [updateId]);
    
    let teamMembersUpdatesId = null;
    if (teamMembersUpdatesResult.rows.length > 0) {
      const teamMembersUpdate = teamMembersUpdatesResult.rows[0];
      teamMembersUpdatesId = teamMembersUpdate.id;
      
      data.team_members_updates.people_changes = teamMembersUpdate.people_changes || '';
      
      // Clear default entries
      data.team_members_updates.top_contributors = [];
      data.team_members_updates.members_needing_attention = [];
    }
    
    // If we found team members updates, load top contributors and members needing attention
    if (teamMembersUpdatesId) {
      // Load top contributors
      const contributorsResult = await query(`
        SELECT * FROM top_contributors 
        WHERE team_members_update_id = $1
        ORDER BY created_at
      `, [teamMembersUpdatesId]);
      
      if (contributorsResult.rows.length > 0) {
        data.team_members_updates.top_contributors = contributorsResult.rows.map(row => ({
          name: row.name || '',
          achievement: row.achievement || '',
          recognition: row.recognition || ''
        }));
      } else {
        // Provide at least one empty contributor
        data.team_members_updates.top_contributors = [{ name: '', achievement: '', recognition: '' }];
      }
      
      // Load members needing attention
      const membersResult = await query(`
        SELECT * FROM members_needing_attention 
        WHERE team_members_update_id = $1
        ORDER BY created_at
      `, [teamMembersUpdatesId]);
      
      if (membersResult.rows.length > 0) {
        data.team_members_updates.members_needing_attention = membersResult.rows.map(row => ({
          name: row.name || '',
          issue: row.issue || '',
          support_plan: row.support_plan || '',
          delivery_risk: row.delivery_risk || 'Low'
        }));
      } else {
        // Provide at least one empty member
        data.team_members_updates.members_needing_attention = [{ name: '', issue: '', support_plan: '', delivery_risk: 'Low' }];
      }
    }
    
    // Log the structure of the data we're returning
    console.log("Returning update data with sections:", Object.keys(data));
    
    // Format the date consistently for the response
    let formattedWeekDate = update.week_date;
    try {
      const dateObj = new Date(update.week_date);
      if (!isNaN(dateObj.getTime())) {
        formattedWeekDate = dateObj.toISOString().split('T')[0];
      }
    } catch (e) {
      console.error("Error formatting weekDate for response:", e);
    }
    
    return {
      id: update.id,
      userId: update.user_id,
      weekDate: formattedWeekDate,
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
    
    // Begin transaction
    await beginTransaction();
    
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
    console.log(`Successfully saved weekly update with ID: ${savedUpdate.id}`);
    
    // Save team_health data if it exists
    if (data.team_health) {
      // Check if a team_health record already exists for this update
      const teamHealthResult = await query(`
        SELECT id FROM team_health WHERE update_id = $1
      `, [savedUpdate.id]);
      
      const teamHealth = data.team_health;
      
      if (teamHealthResult.rows.length > 0) {
        // Update existing team_health record
        await query(`
          UPDATE team_health 
          SET owner_input = $1, sentiment_score = $2, overall_status = $3, 
              energy_engagement = $4, roles_alignment = $5
          WHERE update_id = $6
        `, [
          teamHealth.owner_input || null,
          teamHealth.sentiment_score || 3.5,
          teamHealth.overall_status || null,
          teamHealth.energy_engagement || null,
          teamHealth.roles_alignment || null,
          savedUpdate.id
        ]);
      } else {
        // Create new team_health record
        await query(`
          INSERT INTO team_health (
            update_id, owner_input, sentiment_score, overall_status, 
            energy_engagement, roles_alignment
          ) VALUES ($1, $2, $3, $4, $5, $6)
        `, [
          savedUpdate.id,
          teamHealth.owner_input || null,
          teamHealth.sentiment_score || 3.5,
          teamHealth.overall_status || null,
          teamHealth.energy_engagement || null,
          teamHealth.roles_alignment || null
        ]);
      }
    }
    
    // Save delivery_performance data if it exists
    if (data.delivery_performance) {
      const deliveryPerf = data.delivery_performance;
      let deliveryPerfId;
      
      // Check if a delivery_performance record already exists
      const deliveryPerfResult = await query(`
        SELECT id FROM delivery_performance WHERE update_id = $1
      `, [savedUpdate.id]);
      
      if (deliveryPerfResult.rows.length > 0) {
        // Update existing record
        deliveryPerfId = deliveryPerfResult.rows[0].id;
        await query(`
          UPDATE delivery_performance
          SET workload_balance = $1
          WHERE id = $2
        `, [
          deliveryPerf.workload_balance || 'JustRight',
          deliveryPerfId
        ]);
      } else {
        // Create new record
        const newDeliveryPerfResult = await query(`
          INSERT INTO delivery_performance (update_id, workload_balance)
          VALUES ($1, $2)
          RETURNING id
        `, [
          savedUpdate.id,
          deliveryPerf.workload_balance || 'JustRight'
        ]);
        deliveryPerfId = newDeliveryPerfResult.rows[0].id;
      }
      
      // Handle accomplishments - First delete existing ones
      await query(`
        DELETE FROM delivery_accomplishments WHERE performance_id = $1
      `, [deliveryPerfId]);
      
      // Then insert new ones
      if (Array.isArray(deliveryPerf.accomplishments)) {
        for (const item of deliveryPerf.accomplishments) {
          if (item && item.trim() !== '') {
            await query(`
              INSERT INTO delivery_accomplishments (performance_id, description)
              VALUES ($1, $2)
            `, [deliveryPerfId, item]);
          }
        }
      }
      
      // Handle misses and delays - First delete existing ones
      await query(`
        DELETE FROM delivery_misses_delays WHERE performance_id = $1
      `, [deliveryPerfId]);
      
      // Then insert new ones
      if (Array.isArray(deliveryPerf.misses_delays)) {
        for (const item of deliveryPerf.misses_delays) {
          if (item && item.trim() !== '') {
            await query(`
              INSERT INTO delivery_misses_delays (performance_id, description)
              VALUES ($1, $2)
            `, [deliveryPerfId, item]);
          }
        }
      }
    }
    
    // Save stakeholder_engagement data if it exists
    if (data.stakeholder_engagement) {
      const stakeholderEng = data.stakeholder_engagement;
      let stakeholderEngId;
      
      // Check if a stakeholder_engagement record already exists
      const stakeholderEngResult = await query(`
        SELECT id FROM stakeholder_engagement WHERE update_id = $1
      `, [savedUpdate.id]);
      
      if (stakeholderEngResult.rows.length > 0) {
        // Update existing record
        stakeholderEngId = stakeholderEngResult.rows[0].id;
        await query(`
          UPDATE stakeholder_engagement
          SET stakeholder_nps = $1
          WHERE id = $2
        `, [
          stakeholderEng.stakeholder_nps !== null ? stakeholderEng.stakeholder_nps : null,
          stakeholderEngId
        ]);
      } else {
        // Create new record
        const newStakeholderEngResult = await query(`
          INSERT INTO stakeholder_engagement (update_id, stakeholder_nps)
          VALUES ($1, $2)
          RETURNING id
        `, [
          savedUpdate.id,
          stakeholderEng.stakeholder_nps !== null ? stakeholderEng.stakeholder_nps : null
        ]);
        stakeholderEngId = newStakeholderEngResult.rows[0].id;
      }
      
      // Handle feedback notes - First delete existing ones
      await query(`
        DELETE FROM stakeholder_feedback WHERE engagement_id = $1
      `, [stakeholderEngId]);
      
      // Then insert new ones
      if (Array.isArray(stakeholderEng.feedback_notes)) {
        for (const item of stakeholderEng.feedback_notes) {
          if (item && item.trim() !== '') {
            await query(`
              INSERT INTO stakeholder_feedback (engagement_id, feedback)
              VALUES ($1, $2)
            `, [stakeholderEngId, item]);
          }
        }
      }
      
      // Handle expectation shifts - First delete existing ones
      await query(`
        DELETE FROM stakeholder_expectations WHERE engagement_id = $1
      `, [stakeholderEngId]);
      
      // Then insert new ones
      if (Array.isArray(stakeholderEng.expectation_shift)) {
        for (const item of stakeholderEng.expectation_shift) {
          if (item && item.trim() !== '') {
            await query(`
              INSERT INTO stakeholder_expectations (engagement_id, expectation)
              VALUES ($1, $2)
            `, [stakeholderEngId, item]);
          }
        }
      }
    }
    
    // Save risks_escalations data if it exists
    if (data.risks_escalations) {
      const risksEsc = data.risks_escalations;
      let risksEscId;
      
      // Check if a risks_escalations record already exists
      const risksEscResult = await query(`
        SELECT id FROM risks_escalations WHERE update_id = $1
      `, [savedUpdate.id]);
      
      if (risksEscResult.rows.length > 0) {
        // Record already exists
        risksEscId = risksEscResult.rows[0].id;
      } else {
        // Create new record
        const newRisksEscResult = await query(`
          INSERT INTO risks_escalations (update_id)
          VALUES ($1)
          RETURNING id
        `, [savedUpdate.id]);
        risksEscId = newRisksEscResult.rows[0].id;
      }
      
      // Handle risks - First delete existing ones
      await query(`
        DELETE FROM risks WHERE risks_escalations_id = $1
      `, [risksEscId]);
      
      // Then insert new ones
      if (Array.isArray(risksEsc.risks)) {
        for (const risk of risksEsc.risks) {
          if (risk && risk.title && risk.title.trim() !== '') {
            await query(`
              INSERT INTO risks (risks_escalations_id, title, description, severity)
              VALUES ($1, $2, $3, $4)
            `, [
              risksEscId, 
              risk.title, 
              risk.description || '', 
              risk.severity || 'Green'
            ]);
          }
        }
      }
      
      // Handle escalations - First delete existing ones
      await query(`
        DELETE FROM escalations WHERE risks_escalations_id = $1
      `, [risksEscId]);
      
      // Then insert new ones
      if (Array.isArray(risksEsc.escalations)) {
        for (const item of risksEsc.escalations) {
          if (item && item.trim() !== '') {
            await query(`
              INSERT INTO escalations (risks_escalations_id, description)
              VALUES ($1, $2)
            `, [risksEscId, item]);
          }
        }
      }
    }
    
    // Save opportunities_wins data if it exists
    if (data.opportunities_wins) {
      const oppsWins = data.opportunities_wins;
      let oppsWinsId;
      
      // Check if an opportunities_wins record already exists
      const oppsWinsResult = await query(`
        SELECT id FROM opportunities_wins WHERE update_id = $1
      `, [savedUpdate.id]);
      
      if (oppsWinsResult.rows.length > 0) {
        // Record already exists
        oppsWinsId = oppsWinsResult.rows[0].id;
      } else {
        // Create new record
        const newOppsWinsResult = await query(`
          INSERT INTO opportunities_wins (update_id)
          VALUES ($1)
          RETURNING id
        `, [savedUpdate.id]);
        oppsWinsId = newOppsWinsResult.rows[0].id;
      }
      
      // Handle wins - First delete existing ones
      await query(`
        DELETE FROM wins WHERE opportunities_wins_id = $1
      `, [oppsWinsId]);
      
      // Then insert new ones
      if (Array.isArray(oppsWins.wins)) {
        for (const item of oppsWins.wins) {
          if (item && item.trim() !== '') {
            await query(`
              INSERT INTO wins (opportunities_wins_id, description)
              VALUES ($1, $2)
            `, [oppsWinsId, item]);
          }
        }
      }
      
      // Handle growth opportunities - First delete existing ones
      await query(`
        DELETE FROM growth_opportunities WHERE opportunities_wins_id = $1
      `, [oppsWinsId]);
      
      // Then insert new ones
      if (Array.isArray(oppsWins.growth_ops)) {
        for (const item of oppsWins.growth_ops) {
          if (item && item.trim() !== '') {
            await query(`
              INSERT INTO growth_opportunities (opportunities_wins_id, description)
              VALUES ($1, $2)
            `, [oppsWinsId, item]);
          }
        }
      }
    }
    
    // Save support_needed data if it exists
    if (data.support_needed) {
      const supportNeeded = data.support_needed;
      let supportNeededId;
      
      // Check if a support_needed record already exists
      const supportNeededResult = await query(`
        SELECT id FROM support_needed WHERE update_id = $1
      `, [savedUpdate.id]);
      
      if (supportNeededResult.rows.length > 0) {
        // Record already exists
        supportNeededId = supportNeededResult.rows[0].id;
      } else {
        // Create new record
        const newSupportNeededResult = await query(`
          INSERT INTO support_needed (update_id)
          VALUES ($1)
          RETURNING id
        `, [savedUpdate.id]);
        supportNeededId = newSupportNeededResult.rows[0].id;
      }
      
      // Handle support requests - First delete existing ones
      await query(`
        DELETE FROM support_requests WHERE support_needed_id = $1
      `, [supportNeededId]);
      
      // Then insert new ones
      if (Array.isArray(supportNeeded.requests)) {
        for (const item of supportNeeded.requests) {
          if (item && item.trim() !== '') {
            await query(`
              INSERT INTO support_requests (support_needed_id, description)
              VALUES ($1, $2)
            `, [supportNeededId, item]);
          }
        }
      }
    }
    
    // Save personal_updates data if it exists
    if (data.personal_updates) {
      const personalUpdates = data.personal_updates;
      let personalUpdatesId;
      
      // Check if a personal_updates record already exists
      const personalUpdatesResult = await query(`
        SELECT id FROM personal_updates WHERE update_id = $1
      `, [savedUpdate.id]);
      
      if (personalUpdatesResult.rows.length > 0) {
        // Update existing record
        personalUpdatesId = personalUpdatesResult.rows[0].id;
        await query(`
          UPDATE personal_updates
          SET support_needed = $1
          WHERE id = $2
        `, [
          personalUpdates.support_needed || null,
          personalUpdatesId
        ]);
      } else {
        // Create new record
        const newPersonalUpdatesResult = await query(`
          INSERT INTO personal_updates (
            update_id, support_needed
          )
          VALUES ($1, $2)
          RETURNING id
        `, [
          savedUpdate.id,
          personalUpdates.support_needed || null
        ]);
        personalUpdatesId = newPersonalUpdatesResult.rows[0].id;
      }
      
      // Handle personal wins - First delete existing ones
      await query(`
        DELETE FROM personal_wins WHERE personal_update_id = $1
      `, [personalUpdatesId]);
      
      // Then insert new ones
      if (Array.isArray(personalUpdates.personal_wins)) {
        for (const item of personalUpdates.personal_wins) {
          if (item && item.trim() !== '') {
            await query(`
              INSERT INTO personal_wins (personal_update_id, description)
              VALUES ($1, $2)
            `, [personalUpdatesId, item]);
          }
        }
      }
      
      // Handle reflections - First delete existing ones
      await query(`
        DELETE FROM personal_reflections WHERE personal_update_id = $1
      `, [personalUpdatesId]);
      
      // Then insert new ones
      if (Array.isArray(personalUpdates.reflections)) {
        for (const item of personalUpdates.reflections) {
          if (item && item.trim() !== '') {
            await query(`
              INSERT INTO personal_reflections (personal_update_id, description)
              VALUES ($1, $2)
            `, [personalUpdatesId, item]);
          }
        }
      }
      
      // Handle goals - First delete existing ones
      await query(`
        DELETE FROM personal_goals WHERE personal_update_id = $1
      `, [personalUpdatesId]);
      
      // Then insert new ones
      if (Array.isArray(personalUpdates.goals)) {
        for (const goal of personalUpdates.goals) {
          if (goal && goal.description && goal.description.trim() !== '') {
            await query(`
              INSERT INTO personal_goals (
                personal_update_id, description, status, update_text
              )
              VALUES ($1, $2, $3, $4)
            `, [
              personalUpdatesId,
              goal.description,
              goal.status || 'Green',
              goal.update || null
            ]);
          }
        }
      }
    }
    
    // Save team_members_updates data if it exists
    if (data.team_members_updates) {
      const teamMembersUpdates = data.team_members_updates;
      let teamMembersUpdatesId;
      
      // Check if a team_members_updates record already exists
      const teamMembersUpdatesResult = await query(`
        SELECT id FROM team_members_updates WHERE update_id = $1
      `, [savedUpdate.id]);
      
      if (teamMembersUpdatesResult.rows.length > 0) {
        // Update existing record
        teamMembersUpdatesId = teamMembersUpdatesResult.rows[0].id;
        await query(`
          UPDATE team_members_updates
          SET people_changes = $1
          WHERE id = $2
        `, [
          teamMembersUpdates.people_changes || null,
          teamMembersUpdatesId
        ]);
      } else {
        // Create new record
        const newTeamMembersUpdatesResult = await query(`
          INSERT INTO team_members_updates (update_id, people_changes)
          VALUES ($1, $2)
          RETURNING id
        `, [
          savedUpdate.id,
          teamMembersUpdates.people_changes || null
        ]);
        teamMembersUpdatesId = newTeamMembersUpdatesResult.rows[0].id;
      }
      
      // Handle top contributors - First delete existing ones
      await query(`
        DELETE FROM top_contributors WHERE team_members_update_id = $1
      `, [teamMembersUpdatesId]);
      
      // Then insert new ones
      if (Array.isArray(teamMembersUpdates.top_contributors)) {
        for (const contributor of teamMembersUpdates.top_contributors) {
          if (contributor && contributor.name && contributor.name.trim() !== '') {
            await query(`
              INSERT INTO top_contributors (
                team_members_update_id, name, achievement, recognition
              )
              VALUES ($1, $2, $3, $4)
            `, [
              teamMembersUpdatesId,
              contributor.name,
              contributor.achievement || '',
              contributor.recognition || null
            ]);
          }
        }
      }
      
      // Handle members needing attention - First delete existing ones
      await query(`
        DELETE FROM members_needing_attention WHERE team_members_update_id = $1
      `, [teamMembersUpdatesId]);
      
      // Then insert new ones
      if (Array.isArray(teamMembersUpdates.members_needing_attention)) {
        for (const member of teamMembersUpdates.members_needing_attention) {
          if (member && member.name && member.name.trim() !== '') {
            await query(`
              INSERT INTO members_needing_attention (
                team_members_update_id, name, issue, support_plan, delivery_risk
              )
              VALUES ($1, $2, $3, $4, $5)
            `, [
              teamMembersUpdatesId,
              member.name,
              member.issue || '',
              member.support_plan || null,
              member.delivery_risk || 'Low'
            ]);
          }
        }
      }
    }
    
    // Commit the transaction
    await commitTransaction();
    
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
    // Rollback the transaction if there was an error
    await rollbackTransaction();
    console.error("Error saving update:", error);
    throw error;
  }
}