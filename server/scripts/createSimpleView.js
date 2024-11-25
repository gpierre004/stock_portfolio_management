import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const pool = new pg.Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'sp500_analysis',
    password: '1215',
    port: 5432,
});

async function createSimpleView() {
    const client = await pool.connect();
    
    try {
        // Drop the view if it exists
        console.log('1. Dropping existing view...');
        await client.query('DROP VIEW IF EXISTS vw_potential_breakouts;');

        // Create a simple version of the view
        console.log('2. Creating simple view...');
        const createViewSQL = `
            CREATE VIEW vw_potential_breakouts AS
            WITH latest_prices AS (
                SELECT 
                    ticker as symbol,
                    close as "closePrice",
                    volume,
                    date as timestamp
                FROM stock_prices
                WHERE date = (SELECT MAX(date) FROM stock_prices)
            )
            SELECT 
                symbol,
                "closePrice",
                volume,
                timestamp,
                0 as sma_20,
                0 as sma_50,
                0 as price_change_pct,
                false as potential_breakout,
                'Neutral' as trend_status,
                'Normal' as volume_status
            FROM latest_prices;
        `;
        await client.query(createViewSQL);
        console.log('View created successfully');

        // Test the view
        console.log('\n3. Testing the view...');
        const viewData = await client.query('SELECT * FROM vw_potential_breakouts LIMIT 1;');
        console.log('Sample data from view:', viewData.rows[0]);

        console.log('\n4. Checking view definition...');
        const viewDef = await client.query(`
            SELECT pg_get_viewdef('vw_potential_breakouts'::regclass, true);
        `);
        console.log('View definition:', viewDef.rows[0].pg_get_viewdef);

    } catch (error) {
        console.error('Error:', error);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

createSimpleView()
    .then(() => {
        console.log('\nSimple view creation completed successfully');
        process.exit(0);
    })
    .catch(error => {
        console.error('\nSimple view creation failed:', error);
        process.exit(1);
    });
