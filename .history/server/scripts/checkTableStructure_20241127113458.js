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
        const result = await client.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'stock_prices';
        `);
        console.log('Table structure:', result.rows);

        // Also get a sample row
        const sampleRow = await client.query('SELECT * FROM stock_prices LIMIT 1');
        console.log('\nSample row:', sampleRow.rows[0]);
    } catch (error) {
        console.error('Error checking table structure:', error);
    } finally {
        client.release();
        await pool.end();
    }
}

checkTableStructure()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
