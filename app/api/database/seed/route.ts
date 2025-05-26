import { NextResponse } from "next/server";
import { Pool } from "pg";
import * as crypto from "crypto";
import * as dotenv from "dotenv";

// Load environment variables from .env.local if it exists
dotenv.config({ path: '.env.local' });

// Simple password hashing function (for demo purposes)
function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

export async function POST() {
  let pool: Pool | null = null;
  
  try {
    console.log("Starting database seeding...");
    
    // Establish database connection
    const connectionString = process.env.DATABASE_URL;
    
    if (!connectionString) {
      return NextResponse.json(
        { success: false, message: "Database connection string not found in environment variables. Please create a .env.local file with DATABASE_URL." },
        { status: 500 }
      );
    }
    
    pool = new Pool({
      connectionString: connectionString,
      ssl: process.env.POSTGRES_SSL === "true" 
        ? { rejectUnauthorized: false } 
        : undefined,
    });
    
    // Check connection
    await pool.query('SELECT NOW()');
    console.log("Database connection successful");
    
    // Begin transaction
    await pool.query('BEGIN');
    
    try {
      // Delete existing data (if any)
      console.log("Cleaning existing data...");
      await pool.query('DELETE FROM members_needing_attention');
      await pool.query('DELETE FROM top_contributors');
      await pool.query('DELETE FROM team_members_updates');
      await pool.query('DELETE FROM personal_goals');
      await pool.query('DELETE FROM personal_reflections');
      await pool.query('DELETE FROM personal_wins');
      await pool.query('DELETE FROM personal_updates');
      await pool.query('DELETE FROM support_requests');
      await pool.query('DELETE FROM support_needed');
      await pool.query('DELETE FROM growth_opportunities');
      await pool.query('DELETE FROM wins');
      await pool.query('DELETE FROM opportunities_wins');
      await pool.query('DELETE FROM escalations');
      await pool.query('DELETE FROM risks');
      await pool.query('DELETE FROM risks_escalations');
      await pool.query('DELETE FROM stakeholder_expectations');
      await pool.query('DELETE FROM stakeholder_feedback');
      await pool.query('DELETE FROM stakeholder_engagement');
      await pool.query('DELETE FROM delivery_misses_delays');
      await pool.query('DELETE FROM delivery_accomplishments');
      await pool.query('DELETE FROM delivery_performance');
      await pool.query('DELETE FROM team_health');
      await pool.query('DELETE FROM weekly_updates');
      await pool.query('DELETE FROM team_members');
      await pool.query('DELETE FROM sessions');
      await pool.query('DELETE FROM users');
      await pool.query('DELETE FROM teams');
      await pool.query('DELETE FROM organizations');
      
      // Insert users
      console.log("Creating users...");
      const passwordHash = hashPassword('password123');
      const usersQuery = `
        INSERT INTO users (username, password_hash, name, email, role) VALUES 
        ('admin', $1, 'Admin User', 'admin@example.com', 'Administrator'),
        ('teamlead', $2, 'Team Lead', 'teamlead@example.com', 'Team Lead'),
        ('manager', $3, 'Manager User', 'manager@example.com', 'Manager')
        RETURNING id, username, role;
      `;
      
      const usersResult = await pool.query(usersQuery, [passwordHash, passwordHash, passwordHash]);
      const users = usersResult.rows;
      
      // Insert teams
      console.log("Creating teams...");
      const teamsQuery = `
        INSERT INTO teams (name, description) VALUES 
        ('Frontend Platform', 'Frontend development team focusing on UI/UX and component libraries'),
        ('Backend Services', 'Backend team working on APIs and data processing'),
        ('Data Science', 'Machine learning and analytics team'),
        ('DevOps', 'Infrastructure and deployment team'),
        ('Mobile Development', 'iOS and Android development team')
        RETURNING id, name;
      `;
      
      const teamsResult = await pool.query(teamsQuery);
      const teams = teamsResult.rows;
      
      // Insert organizations
      console.log("Creating organizations...");
      const orgsQuery = `
        INSERT INTO organizations (name, description) VALUES 
        ('Acme Corp', 'Main enterprise client'),
        ('Globex Industries', 'Manufacturing sector client'),
        ('TechNova', 'Tech startup client'),
        ('MediHealth', 'Healthcare institution'),
        ('EduLearn', 'Educational institution')
        RETURNING id, name;
      `;
      
      const orgsResult = await pool.query(orgsQuery);
      const organizations = orgsResult.rows;
      
      // Associate users with teams
      console.log("Associating users with teams...");
      for (const user of users) {
        // Assign each user to 1-2 teams
        const teamCount = Math.floor(Math.random() * 2) + 1;
        const shuffledTeams = [...teams].sort(() => Math.random() - 0.5);
        const selectedTeams = shuffledTeams.slice(0, teamCount);
        
        for (const team of selectedTeams) {
          await pool.query(
            'INSERT INTO team_members (user_id, team_id, role) VALUES ($1, $2, $3)',
            [user.id, team.id, user.role]
          );
        }
      }
      
      // Create sample weekly updates (1 per team)
      console.log("Creating weekly updates...");
      for (const team of teams) {
        // Get a random user who is a member of this team
        const teamMembersResult = await pool.query(
          'SELECT user_id FROM team_members WHERE team_id = $1 LIMIT 1',
          [team.id]
        );
        
        if (teamMembersResult.rows.length === 0) continue;
        
        const userId = teamMembersResult.rows[0].user_id;
        const orgId = organizations[Math.floor(Math.random() * organizations.length)].id;
        
        // Create a weekly update for current week
        const today = new Date();
        const formattedDate = today.toISOString().split('T')[0];
        
        const updateInsertResult = await pool.query(
          `INSERT INTO weekly_updates 
          (user_id, team_id, organization_id, week_date, top_3_bullets, status) 
          VALUES ($1, $2, $3, $4, $5, $6)
          RETURNING id`,
          [
            userId, 
            team.id, 
            orgId, 
            formattedDate, 
            'Completed feature X\nFixed critical bug Y\nImproved performance by Z%', 
            'published'
          ]
        );
        
        const updateId = updateInsertResult.rows[0].id;
        
        // Create team health entry
        await pool.query(
          `INSERT INTO team_health 
          (update_id, owner_input, sentiment_score, overall_status, energy_engagement, roles_alignment) 
          VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            updateId,
            'Team is working well together with good communication',
            (Math.random() * 4 + 6).toFixed(1), // Score between 6.0 and 10.0
            'Team is on track with deliverables',
            'High energy and engagement across team members',
            'Roles are well defined and understood'
          ]
        );
        
        // Create delivery performance
        const perfInsertResult = await pool.query(
          `INSERT INTO delivery_performance 
          (update_id, workload_balance) 
          VALUES ($1, $2)
          RETURNING id`,
          [
            updateId,
            ['TooMuch', 'JustRight', 'TooLittle'][Math.floor(Math.random() * 3)]
          ]
        );
        
        const perfId = perfInsertResult.rows[0].id;
        
        // Add accomplishments
        await pool.query(
          `INSERT INTO delivery_accomplishments (performance_id, description)
          VALUES ($1, $2), ($1, $3)`,
          [
            perfId,
            'Completed implementation of new feature on schedule',
            'Reduced load time by 15% through code optimization'
          ]
        );
      }
            
      // Commit transaction
      await pool.query('COMMIT');
      console.log("Database seeding completed successfully!");
      
      return NextResponse.json({ 
        success: true, 
        message: "Database seeded with sample data successfully" 
      });
    } catch (err) {
      // Rollback on error
      await pool.query('ROLLBACK');
      throw err;
    }
  } catch (error) {
    console.error("Error seeding database:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: "Failed to seed database", 
        error: String(error) 
      },
      { status: 500 }
    );
  } finally {
    // Close the database connection
    if (pool) {
      await pool.end();
    }
  }
}