import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

// Create a new pool instance
const pool = new pg.Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'sp500_analysis',
    password: '1215',
    port: 5432,
});

async function executeMigrations() {
    const client = await pool.connect();
    
    try {
        // Read the SQL file
        const sqlFilePath = path.join(__dirname, '../migrations/create_breakout_analysis_view.sql');
        const sqlContent = await fs.readFile(sqlFilePath, 'utf8');

        // Execute the SQL
        await client.query(sqlContent);
        console.log('Successfully executed breakout analysis view creation');

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
