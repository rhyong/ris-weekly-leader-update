import { Client } from "pg";
import * as crypto from "crypto";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: ".env.local" });

const DATABASE_URL = process.env.DATABASE_URL;

// Simple password hashing function (for demo purposes)
function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

async function seedDatabase() {
  console.log("Starting database seeding...");

  const client = new Client({
    connectionString: DATABASE_URL,
  });

  try {
    await client.connect();
    console.log("Connected to database");

    // Begin transaction
    await client.query("BEGIN");

    // Delete existing data (if any)
    console.log("Cleaning existing data...");
    await client.query("DELETE FROM members_needing_attention");
    await client.query("DELETE FROM top_contributors");
    await client.query("DELETE FROM team_members_updates");
    await client.query("DELETE FROM personal_goals");
    await client.query("DELETE FROM personal_reflections");
    await client.query("DELETE FROM personal_wins");
    await client.query("DELETE FROM personal_updates");
    await client.query("DELETE FROM support_requests");
    await client.query("DELETE FROM support_needed");
    await client.query("DELETE FROM growth_opportunities");
    await client.query("DELETE FROM wins");
    await client.query("DELETE FROM opportunities_wins");
    await client.query("DELETE FROM escalations");
    await client.query("DELETE FROM risks");
    await client.query("DELETE FROM risks_escalations");
    await client.query("DELETE FROM stakeholder_expectations");
    await client.query("DELETE FROM stakeholder_feedback");
    await client.query("DELETE FROM stakeholder_engagement");
    await client.query("DELETE FROM delivery_misses_delays");
    await client.query("DELETE FROM delivery_accomplishments");
    await client.query("DELETE FROM delivery_performance");
    await client.query("DELETE FROM team_health");
    await client.query("DELETE FROM weekly_updates");
    await client.query("DELETE FROM team_members");
    await client.query("DELETE FROM sessions");
    await client.query("DELETE FROM users");
    await client.query("DELETE FROM teams");
    await client.query("DELETE FROM organizations");

    // Insert users
    console.log("Creating users...");
    const usersQuery = `
      INSERT INTO users (username, password_hash, name, email, role) VALUES 
      ('admin', $1, 'Admin User', 'admin@example.com', 'Administrator'),
      ('teamlead', $2, 'Team Lead', 'teamlead@example.com', 'Team Lead'),
      ('manager', $3, 'Manager User', 'manager@example.com', 'Manager')
      RETURNING id, username, role;
    `;

    const passwordHash = hashPassword("password123");
    const usersResult = await client.query(usersQuery, [
      passwordHash,
      passwordHash,
      passwordHash,
    ]);
    const users = usersResult.rows;

    console.log(`Created ${users.length} users`);

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

    const teamsResult = await client.query(teamsQuery);
    const teams = teamsResult.rows;

    console.log(`Created ${teams.length} teams`);

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

    const orgsResult = await client.query(orgsQuery);
    const organizations = orgsResult.rows;

    console.log(`Created ${organizations.length} organizations`);

    // Associate users with teams
    console.log("Associating users with teams...");
    for (const user of users) {
      const randomTeams = teams
        .sort(() => 0.5 - Math.random())
        .slice(0, Math.ceil(Math.random() * 2) + 1); // 1-3 teams per user

      for (const team of randomTeams) {
        await client.query(
          "INSERT INTO team_members (user_id, team_id, role) VALUES ($1, $2, $3)",
          [user.id, team.id, user.role]
        );
      }
    }

    console.log("Created team memberships");

    // Create weekly updates for past 4 weeks
    console.log("Creating weekly updates...");
    const today = new Date();
    let updatesCount = 0;

    for (let weekOffset = 0; weekOffset < 4; weekOffset++) {
      const weekDate = new Date(today);
      weekDate.setDate(today.getDate() - 7 * weekOffset);

      // Format as YYYY-MM-DD
      const formattedDate = weekDate.toISOString().split("T")[0];

      // Create 1-3 updates per week
      const updateCount = Math.ceil(Math.random() * 3);

      for (let i = 0; i < updateCount; i++) {
        const randomUserIndex = Math.floor(Math.random() * users.length);
        const randomTeamIndex = Math.floor(Math.random() * teams.length);
        const randomOrgIndex = Math.floor(Math.random() * organizations.length);

        const user = users[randomUserIndex];
        const team = teams[randomTeamIndex];
        const org = organizations[randomOrgIndex];

        // Create weekly update
        const updateInsertResult = await client.query(
          `INSERT INTO weekly_updates 
          (user_id, team_id, organization_id, week_date, top_3_bullets, status) 
          VALUES ($1, $2, $3, $4, $5, $6)
          RETURNING id`,
          [
            user.id,
            team.id,
            org.id,
            formattedDate,
            "Completed feature X\nFixed critical bug Y\nImproved performance by Z%",
            Math.random() > 0.3 ? "published" : "draft",
          ]
        );

        const updateId = updateInsertResult.rows[0].id;
        updatesCount++;

        // Create team health entry
        const healthInsertResult = await client.query(
          `INSERT INTO team_health 
          (update_id, owner_input, traffic_light, sentiment_score, overall_status, energy_engagement, roles_alignment) 
          VALUES ($1, $2, $3, $4, $5, $6, $7)
          RETURNING id`,
          [
            updateId,
            "Team is working well together with good communication",
            ["Green", "Yellow", "Red"][Math.floor(Math.random() * 3)],
            (Math.random() * 4 + 6).toFixed(1), // Score between 6.0 and 10.0
            "Team is on track with deliverables",
            "High energy and engagement across team members",
            "Roles are well defined and understood",
          ]
        );

        // Create delivery performance
        const perfInsertResult = await client.query(
          `INSERT INTO delivery_performance 
          (update_id, workload_balance, velocity_delta, defects) 
          VALUES ($1, $2, $3, $4)
          RETURNING id`,
          [
            updateId,
            ["TooMuch", "JustRight", "TooLittle"][
              Math.floor(Math.random() * 3)
            ],
            Math.floor(Math.random() * 10) - 5, // Between -5 and +5
            Math.floor(Math.random() * 5), // 0-4 defects
          ]
        );

        const perfId = perfInsertResult.rows[0].id;

        // Add accomplishments
        await client.query(
          `INSERT INTO delivery_accomplishments (performance_id, description)
          VALUES ($1, $2), ($1, $3)`,
          [
            perfId,
            "Completed implementation of new feature on schedule",
            "Reduced load time by 15% through code optimization",
          ]
        );

        // Add misses/delays
        if (Math.random() > 0.7) {
          await client.query(
            `INSERT INTO delivery_misses_delays (performance_id, description)
            VALUES ($1, $2)`,
            [perfId, "Delayed integration testing due to environment issues"]
          );
        }

        // Create stakeholder engagement
        const engagementResult = await client.query(
          `INSERT INTO stakeholder_engagement (update_id, stakeholder_nps)
          VALUES ($1, $2)
          RETURNING id`,
          [
            updateId,
            (Math.random() * 3 + 7).toFixed(1), // 7.0-10.0 score
          ]
        );

        const engagementId = engagementResult.rows[0].id;

        // Add stakeholder feedback
        await client.query(
          `INSERT INTO stakeholder_feedback (engagement_id, feedback)
          VALUES ($1, $2)`,
          [engagementId, "Client is pleased with progress and communication"]
        );

        // Create risks and escalations
        const risksResult = await client.query(
          `INSERT INTO risks_escalations (update_id)
          VALUES ($1)
          RETURNING id`,
          [updateId]
        );

        const risksId = risksResult.rows[0].id;

        // Add risks conditionally
        if (Math.random() > 0.5) {
          await client.query(
            `INSERT INTO risks (risks_escalations_id, title, description, severity)
            VALUES ($1, $2, $3, $4)`,
            [
              risksId,
              "Dependency Risk",
              "External API integration may be delayed",
              ["Green", "Yellow", "Red"][Math.floor(Math.random() * 3)],
            ]
          );
        }

        // Create opportunities and wins
        const opportunitiesResult = await client.query(
          `INSERT INTO opportunities_wins (update_id)
          VALUES ($1)
          RETURNING id`,
          [updateId]
        );

        const opportunitiesId = opportunitiesResult.rows[0].id;

        // Add wins
        await client.query(
          `INSERT INTO wins (opportunities_wins_id, description)
          VALUES ($1, $2)`,
          [
            opportunitiesId,
            "Successfully launched new feature with positive feedback",
          ]
        );

        // Add growth opportunities
        await client.query(
          `INSERT INTO growth_opportunities (opportunities_wins_id, description)
          VALUES ($1, $2)`,
          [
            opportunitiesId,
            "Opportunity to expand feature set based on user demand",
          ]
        );

        // Create personal updates
        const personalResult = await client.query(
          `INSERT INTO personal_updates 
          (update_id, leadership_focus_skill, leadership_focus_practice, support_needed)
          VALUES ($1, $2, $3, $4)
          RETURNING id`,
          [
            updateId,
            "Communication",
            "Holding effective 1:1s with team members",
            "Need guidance on handling complex stakeholder situation",
          ]
        );

        const personalId = personalResult.rows[0].id;

        // Add personal wins
        await client.query(
          `INSERT INTO personal_wins (personal_update_id, description)
          VALUES ($1, $2)`,
          [
            personalId,
            "Successfully mediated team conflict and improved collaboration",
          ]
        );
      }
    }

    console.log(`Created ${updatesCount} weekly updates with related data`);

    // Commit transaction
    await client.query("COMMIT");
    console.log("Database seeding completed successfully!");
  } catch (err) {
    // Rollback on error
    await client.query("ROLLBACK");
    console.error("Error seeding database:", err);
    throw err;
  } finally {
    await client.end();
  }
}

// Execute the seed function
seedDatabase()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Fatal error during seeding:", err);
    process.exit(1);
  });
