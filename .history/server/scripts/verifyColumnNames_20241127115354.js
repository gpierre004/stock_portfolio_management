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

async function verifyColumnNames() {
    const client = await pool.connect();
    
    try {
        console.log('1. Getting stock_prices table column names...');
        const columnQuery = `
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns
            WHERE table_name = 'stock_prices'
            ORDER BY ordinal_position;
        `;
        const columns = await client.query(columnQuery);
        console.log('\nColumns in stock_prices:');
        console.table(columns.rows);

        console.log('\n2. Getting sample data with column names...');
        const sampleQuery = `
            SELECT *
            FROM stock_prices
            LIMIT 1;
        `;
        const sample = await client.query(sampleQuery);
        console.log('\nSample data with column names:');
        console.log(sample.rows[0]);

        // Try a simple aggregation to verify data types
        console.log('\n3. Testing basic aggregation...');
        const aggQuery = `
            SELECT 
                ticker,
                COUNT(*) as count,
                AVG(close) as avg_close,
                MAX(volume) as max_volume
            FROM stock_prices
            GROUP BY ticker
            LIMIT 1;
        `;
        const agg = await client.query(aggQuery);
        console.log('\nAggregation result:');
        console.log(agg.rows[0]);

    } catch (error) {
        console.error('Error during column verification:', error);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

verifyColumnNames()
    .then(() => {
        console.log('\nColumn verification completed successfully');
        process.exit(0);
    })
    .catch(error => {
        console.error('\nColumn verification failed:', error);
        process.exit(1);
    });
