import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

// Create a new pool instance
const pool = new pg.Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT || '5432'),
});

async function executeMigrations() {
    const client = await pool.connect();
    
    try {
        // First, drop the view if it exists
        await client.query('DROP VIEW IF EXISTS vw_potential_breakouts CASCADE');
        console.log('Dropped existing view if it existed');

        // Read and execute the view creation migration
        const viewMigrationPath = path.join(__dirname, '../migrations/create_breakout_analysis_view.sql');
        const viewMigrationSQL = fs.readFileSync(viewMigrationPath, 'utf8');
        await client.query(viewMigrationSQL);
        console.log('Created vw_potential_breakouts view');

        // Read and execute the index creation migration
        const indexMigrationPath = path.join(__dirname, '../migrations/create_stock_prices_index.sql');
        const indexMigrationSQL = fs.readFileSync(indexMigrationPath, 'utf8');
        await client.query(indexMigrationSQL);
        console.log('Created index on stock_prices table');

        console.log('Successfully executed all breakout analysis migrations');
    } catch (error) {
        console.error('Error executing migrations:', error);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

// Execute migrations
executeMigrations()
    .then(() => {
        console.log('Migration execution completed');
        process.exit(0);
    })
    .catch((error) => {
        console.error('Migration execution failed:', error);
        process.exit(1);
    });
