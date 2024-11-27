import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import db from '../config/database.ts';
import logger from '../utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function executeMigrations() {
    try {
        // First, drop the view if it exists
        await db.query('DROP VIEW IF EXISTS vw_potential_breakouts CASCADE');
        logger.info('Dropped existing view if it existed');

        // Read and execute the view creation migration
        const viewMigrationPath = path.join(__dirname, '../migrations/create_breakout_analysis_view.sql');
        const viewMigrationSQL = fs.readFileSync(viewMigrationPath, 'utf8');
        await db.query(viewMigrationSQL);
        logger.info('Created vw_potential_breakouts view');

        // Read and execute the index creation migration
        const indexMigrationPath = path.join(__dirname, '../migrations/create_stock_prices_index.sql');
        const indexMigrationSQL = fs.readFileSync(indexMigrationPath, 'utf8');
        await db.query(indexMigrationSQL);
        logger.info('Created index on stock_prices table');

        logger.info('Successfully executed all breakout analysis migrations');
    } catch (error) {
        logger.error('Error executing migrations:', error);
        throw error;
    }
}

// Execute migrations
executeMigrations()
    .then(() => {
        logger.info('Migration execution completed');
        process.exit(0);
    })
    .catch((error) => {
        logger.error('Migration execution failed:', error);
        process.exit(1);
    });
