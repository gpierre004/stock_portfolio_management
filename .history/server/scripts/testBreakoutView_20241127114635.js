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

async function testBreakoutView() {
    const client = await pool.connect();
    
    try {
        console.log('Testing view existence...');
        const viewCheck = await client.query(`
            SELECT EXISTS (
                SELECT FROM pg_views
                WHERE viewname = 'vw_potential_breakouts'
            );
        `);
        console.log('View exists:', viewCheck.rows[0].exists);

        if (viewCheck.rows[0].exists) {
            console.log('\nTesting view data...');
            const viewData = await client.query('SELECT * FROM vw_potential_breakouts LIMIT 5;');
            console.log('Sample data from view:', viewData.rows);

            console.log('\nTesting breakout stocks query...');
            const breakoutStocks = await client.query(`
                SELECT * FROM vw_potential_breakouts 
                WHERE potential_breakout = true 
                ORDER BY volume_status DESC, trend_status DESC 
                LIMIT 5;
            `);
            console.log('Sample breakout stocks:', breakoutStocks.rows);
        }

    } catch (error) {
        console.error('Error testing view:', error);
    } finally {
        client.release();
        await pool.end();
    }
}

testBreakoutView()
    .then(() => {
        console.log('Test completed');
        process.exit(0);
    })
    .catch(error => {
        console.error('Test failed:', error);
        process.exit(1);
    });
