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

async function executeMigrations() {
    const client = await pool.connect();
    
    try {
        // First drop the view if it exists
        await client.query('DROP VIEW IF EXISTS vw_potential_breakouts;');
        console.log('Successfully dropped existing view');

        // Then create the new view
        const createViewSQL = `
        CREATE VIEW vw_potential_breakouts AS
        WITH price_analysis AS (
            SELECT 
                sp.ticker,
                sp.close,
                sp.volume,
                sp.date,
                AVG(sp.close) OVER (
                    PARTITION BY sp.ticker 
                    ORDER BY sp.date 
                    ROWS BETWEEN 19 PRECEDING AND CURRENT ROW
                ) as sma_20,
                AVG(sp.close) OVER (
                    PARTITION BY sp.ticker 
                    ORDER BY sp.date 
                    ROWS BETWEEN 49 PRECEDING AND CURRENT ROW
                ) as sma_50,
                AVG(sp.volume) OVER (
                    PARTITION BY sp.ticker 
                    ORDER BY sp.date 
                    ROWS BETWEEN 19 PRECEDING AND CURRENT ROW
                ) as avg_volume_20,
                (sp.close - LAG(sp.close, 1) OVER (
                    PARTITION BY sp.ticker 
                    ORDER BY sp.date
                )) / NULLIF(LAG(sp.close, 1) OVER (
                    PARTITION BY sp.ticker 
                    ORDER BY sp.date
                ), 0) * 100 as price_change_pct,
                MAX(sp.close) OVER (
                    PARTITION BY sp.ticker 
                    ORDER BY sp.date 
                    ROWS BETWEEN 20 PRECEDING AND CURRENT ROW
                ) as recent_high
            FROM stock_prices sp
            WHERE sp.date >= CURRENT_DATE - INTERVAL '60 days'
        )
        SELECT 
            pa.ticker,
            pa.close,
            pa.volume,
            pa.date,
            pa.sma_20,
            pa.sma_50,
            pa.avg_volume_20,
            pa.price_change_pct,
            CASE 
                WHEN pa.close > pa.sma_20 
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
        WHERE pa."createdAt" = (
            SELECT MAX("createdAt") 
            FROM price_analysis pa2 
            WHERE pa2.ticker = pa.ticker
        )`;

        await client.query(createViewSQL);
        console.log('Successfully created new view');

        console.log('Successfully executed all breakout analysis migrations');
    } catch (error) {
        console.error('Error executing migrations:', error);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

executeMigrations()
    .then(() => {
        console.log('Migration execution completed');
        process.exit(0);
    })
    .catch((error) => {
        console.error('Migration execution failed:', error);
        process.exit(1);
    });
