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

async function checkTableStructure() {
    const client = await pool.connect();
    
    try {
        console.log('Checking stock_prices table structure...');
        
        const tableInfo = await client.query(`
            SELECT column_name, data_type, column_default, is_nullable
            FROM information_schema.columns
            WHERE table_name = 'stock_prices'
            ORDER BY ordinal_position;
        `);
        
        console.log('\nColumns in stock_prices table:');
        console.table(tableInfo.rows);

        const sampleData = await client.query(`
            SELECT *
            FROM stock_prices
            LIMIT 1;
        `);
        
        console.log('\nSample row from stock_prices:');
        console.log(sampleData.rows[0]);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        client.release();
        await pool.end();
    }
}

checkTableStructure()
    .then(() => {
        console.log('Check completed');
        process.exit(0);
    })
    .catch(error => {
        console.error('Check failed:', error);
        process.exit(1);
    });
