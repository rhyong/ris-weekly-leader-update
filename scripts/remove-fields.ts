import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function main() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.POSTGRES_SSL === 'true' 
      ? { rejectUnauthorized: false } 
      : undefined,
  });

  try {
    console.log('Starting database migration to remove energy_engagement and roles_alignment fields...');

    // Begin transaction
    await pool.query('BEGIN');

    try {
      // Check if the columns exist before attempting to drop them
      const checkColumnResult = await pool.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'team_health' 
        AND (column_name = 'energy_engagement' OR column_name = 'roles_alignment')
      `);

      if (checkColumnResult.rows.length > 0) {
        console.log(`Found columns to remove: ${checkColumnResult.rows.map(r => r.column_name).join(', ')}`);
        
        // Drop the columns
        await pool.query(`
          ALTER TABLE team_health
          DROP COLUMN IF EXISTS energy_engagement,
          DROP COLUMN IF EXISTS roles_alignment
        `);
        
        console.log('Columns dropped successfully');
      } else {
        console.log('Columns energy_engagement and roles_alignment do not exist, nothing to drop');
      }

      // Commit transaction
      await pool.query('COMMIT');
      console.log('Migration completed successfully!');
    } catch (err) {
      // Rollback on error
      await pool.query('ROLLBACK');
      throw err;
    }
  } catch (error) {
    console.error('Error executing migration:', error);
    process.exit(1);
  } finally {
    // Close the database connection
    await pool.end();
  }
}

main().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});