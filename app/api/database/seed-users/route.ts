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
    console.log("Starting user data seeding...");
    
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
      // Delete existing user-related data (if any)
      console.log("Cleaning existing user data...");
      await pool.query('DELETE FROM team_members');
      await pool.query('DELETE FROM sessions');
      await pool.query('DELETE FROM users');
      
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
      
      // Get existing teams
      console.log("Fetching teams...");
      const teamsResult = await pool.query('SELECT id, name FROM teams');
      const teams = teamsResult.rows;
      
      if (teams.length === 0) {
        // Insert default teams if none exist
        console.log("No teams found, creating default teams...");
        const teamsQuery = `
          INSERT INTO teams (name, description) VALUES 
          ('Frontend Platform', 'Frontend development team focusing on UI/UX and component libraries'),
          ('Backend Services', 'Backend team working on APIs and data processing'),
          ('Data Science', 'Machine learning and analytics team'),
          ('DevOps', 'Infrastructure and deployment team'),
          ('Mobile Development', 'iOS and Android development team')
          RETURNING id, name;
        `;
        
        const newTeamsResult = await pool.query(teamsQuery);
        const newTeams = newTeamsResult.rows;
        
        // Associate users with teams
        console.log("Associating users with teams...");
        for (const user of users) {
          // Assign each user to 1-2 teams
          const teamCount = Math.floor(Math.random() * 2) + 1;
          const shuffledTeams = [...newTeams].sort(() => Math.random() - 0.5);
          const selectedTeams = shuffledTeams.slice(0, teamCount);
          
          for (const team of selectedTeams) {
            await pool.query(
              'INSERT INTO team_members (user_id, team_id, role) VALUES ($1, $2, $3)',
              [user.id, team.id, user.role]
            );
          }
        }
      } else {
        // Associate users with existing teams
        console.log("Associating users with existing teams...");
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
      }
            
      // Commit transaction
      await pool.query('COMMIT');
      console.log("User data seeding completed successfully!");
      
      return NextResponse.json({ 
        success: true, 
        message: "User data seeded successfully" 
      });
    } catch (err) {
      // Rollback on error
      await pool.query('ROLLBACK');
      throw err;
    }
  } catch (error) {
    console.error("Error seeding user data:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: "Failed to seed user data", 
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