import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

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
        // Drop existing view
        await client.query('DROP VIEW IF EXISTS vw_potential_breakouts;');
        console.log('Dropped existing view if it existed');

        // Create the view
        const createViewSQL = `
        CREATE VIEW vw_potential_breakouts AS
        WITH price_analysis AS (
            SELECT 
                sp.symbol,
                sp."closePrice",
                sp.volume,
                sp."timestamp",
                AVG(sp."closePrice") OVER (
                    PARTITION BY sp.symbol 
                    ORDER BY sp."timestamp" 
                    ROWS BETWEEN 19 PRECEDING AND CURRENT ROW
                ) as sma_20,
                AVG(sp."closePrice") OVER (
                    PARTITION BY sp.symbol 
                    ORDER BY sp."timestamp" 
                    ROWS BETWEEN 49 PRECEDING AND CURRENT ROW
                ) as sma_50,
                AVG(sp.volume) OVER (
                    PARTITION BY sp.symbol 
                    ORDER BY sp."timestamp" 
                    ROWS BETWEEN 19 PRECEDING AND CURRENT ROW
                ) as avg_volume_20,
                (sp."closePrice" - LAG(sp."closePrice", 1) OVER (
                    PARTITION BY sp.symbol 
                    ORDER BY sp."timestamp"
                )) / NULLIF(LAG(sp."closePrice", 1) OVER (
                    PARTITION BY sp.symbol 
                    ORDER BY sp."timestamp"
                ), 0) * 100 as price_change_pct,
                MAX(sp."closePrice") OVER (
                    PARTITION BY sp.symbol 
                    ORDER BY sp."timestamp" 
                    ROWS BETWEEN 20 PRECEDING AND CURRENT ROW
                ) as recent_high
            FROM "stock_prices" sp
            WHERE sp."timestamp" >= (CURRENT_TIMESTAMP - interval '60 days')
        )
        SELECT 
            pa.symbol,
            pa."closePrice",
            pa.volume,
            pa."timestamp",
            pa.sma_20,
            pa.sma_50,
            pa.avg_volume_20,
            pa.price_change_pct,
            CASE 
                WHEN pa."closePrice" > pa.sma_20 
                AND pa.sma_20 > pa.sma_50 
                AND pa.volume > pa.avg_volume_20 * 1.5
                AND pa."closePrice" >= pa.recent_high * 0.95
                AND pa.price_change_pct > 0
                THEN true
                ELSE false
            END as potential_breakout,
            CASE
                WHEN pa."closePrice" > pa.sma_20 
                AND pa.sma_20 > pa.sma_50 THEN 'Strong uptrend'
                WHEN pa."closePrice" > pa.sma_20 THEN 'Moderate uptrend'
                WHEN pa."closePrice" < pa.sma_20 
                AND pa.sma_20 < pa.sma_50 THEN 'Downtrend'
                ELSE 'Neutral'
            END as trend_status,
            CASE
                WHEN pa.volume > pa.avg_volume_20 * 2 THEN 'Very High'
                WHEN pa.volume > pa.avg_volume_20 * 1.5 THEN 'High'
                WHEN pa.volume > pa.avg_volume_20 THEN 'Above Average'
                ELSE 'Normal'
            END as volume_status
        FROM price_analysis pa
        WHERE pa."timestamp" = (
            SELECT MAX("timestamp") 
            FROM price_analysis pa2 
            WHERE pa2.symbol = pa.symbol
        )
        ORDER BY pa.symbol, pa."timestamp" DESC;`;

        await client.query(createViewSQL);
        console.log('Created vw_potential_breakouts view');

        // Create the index
        const createIndexSQL = `
        CREATE INDEX IF NOT EXISTS idx_stock_prices_symbol_timestamp 
        ON "stock_prices" (symbol, "timestamp");`;

        await client.query(createIndexSQL);
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
