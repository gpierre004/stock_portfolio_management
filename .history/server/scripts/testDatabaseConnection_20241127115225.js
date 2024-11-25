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

async function testConnection() {
    const client = await pool.connect();
    
    try {
        console.log('1. Testing database connection...');
        const result = await client.query('SELECT NOW()');
        console.log('Database connection successful:', result.rows[0].now);

        console.log('\n2. Testing stock_prices table...');
        const stockCount = await client.query('SELECT COUNT(*) FROM stock_prices');
        console.log('Number of records in stock_prices:', stockCount.rows[0].count);

        console.log('\n3. Getting sample stock data...');
        const stockSample = await client.query(`
            SELECT ticker, date, close, volume 
            FROM stock_prices 
            ORDER BY date DESC 
            LIMIT 1
        `);
        console.log('Latest stock record:', stockSample.rows[0]);

        console.log('\n4. Testing view...');
        const viewExists = await client.query(`
            SELECT EXISTS (
                SELECT FROM pg_views
                WHERE viewname = 'vw_potential_breakouts'
            );
        `);
        console.log('View exists:', viewExists.rows[0].exists);

        if (viewExists.rows[0].exists) {
            const viewSample = await client.query('SELECT COUNT(*) FROM vw_potential_breakouts');
            console.log('Number of records in view:', viewSample.rows[0].count);
        }

    } catch (error) {
        console.error('Error during database test:', error);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

testConnection()
    .then(() => {
        console.log('\nDatabase connection test completed successfully');
        process.exit(0);
    })
    .catch(error => {
        console.error('\nDatabase connection test failed:', error);
        process.exit(1);
    });
