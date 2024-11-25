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

async function verifyDatabaseSchema() {
    const client = await pool.connect();
    
    try {
        console.log('1. Checking stock_prices table structure...');
        const tableInfo = await client.query(`
            SELECT column_name, data_type, column_default, is_nullable
            FROM information_schema.columns
            WHERE table_name = 'stock_prices'
            ORDER BY ordinal_position;
        `);
        console.log('\nstock_prices table columns:');
        console.table(tableInfo.rows);

        console.log('\n2. Checking sample data from stock_prices...');
        const sampleData = await client.query(`
            SELECT *
            FROM stock_prices
            LIMIT 1;
        `);
        console.log('\nSample row from stock_prices:');
        console.log(sampleData.rows[0]);

        console.log('\n3. Checking if view exists...');
        const viewCheck = await client.query(`
            SELECT EXISTS (
                SELECT FROM pg_views
                WHERE viewname = 'vw_potential_breakouts'
            );
        `);
        console.log('View exists:', viewCheck.rows[0].exists);

        if (viewCheck.rows[0].exists) {
            console.log('\n4. Checking view definition...');
            const viewDef = await client.query(`
                SELECT pg_get_viewdef('vw_potential_breakouts'::regclass, true);
            `);
            console.log('\nView definition:');
            console.log(viewDef.rows[0].pg_get_viewdef);

            console.log('\n5. Checking sample data from view...');
            const viewData = await client.query(`
                SELECT *
                FROM vw_potential_breakouts
                LIMIT 1;
            `);
            console.log('\nSample row from view:');
            console.log(viewData.rows[0]);
        }

    } catch (error) {
        console.error('Error verifying database schema:', error);
    } finally {
        client.release();
        await pool.end();
    }
}

verifyDatabaseSchema()
    .then(() => {
        console.log('\nVerification completed');
        process.exit(0);
    })
    .catch(error => {
        console.error('\nVerification failed:', error);
        process.exit(1);
    });
