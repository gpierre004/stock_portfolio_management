-- Drop existing view if it exists
DROP VIEW IF EXISTS vw_potential_breakouts;

-- Create view for identifying potential breakout stocks
CREATE VIEW vw_potential_breakouts AS
WITH price_analysis AS (
    SELECT 
        sp."stockSymbol",
        sp."closePrice",
        sp."volume",
        sp."timestamp",
        -- Calculate 20-day moving average
        AVG(sp."closePrice") OVER (
            PARTITION BY sp."stockSymbol" 
            ORDER BY sp."timestamp" 
            ROWS BETWEEN 19 PRECEDING AND CURRENT ROW
        ) as sma_20,
        -- Calculate 50-day moving average
        AVG(sp."closePrice") OVER (
            PARTITION BY sp."stockSymbol" 
            ORDER BY sp."timestamp" 
            ROWS BETWEEN 49 PRECEDING AND CURRENT ROW
        ) as sma_50,
        -- Calculate average volume over last 20 days
        AVG(sp."volume") OVER (
            PARTITION BY sp."stockSymbol" 
            ORDER BY sp."timestamp" 
            ROWS BETWEEN 19 PRECEDING AND CURRENT ROW
        ) as avg_volume_20,
        -- Calculate price change percentage
        (sp."closePrice" - LAG(sp."closePrice", 1) OVER (
            PARTITION BY sp."stockSymbol" 
            ORDER BY sp."timestamp"
        )) / NULLIF(LAG(sp."closePrice", 1) OVER (
            PARTITION BY sp."stockSymbol" 
            ORDER BY sp."timestamp"
        ), 0) * 100 as price_change_pct,
        -- Identify recent high prices
        MAX(sp."closePrice") OVER (
            PARTITION BY sp."stockSymbol" 
            ORDER BY sp."timestamp" 
            ROWS BETWEEN 20 PRECEDING AND CURRENT ROW
        ) as recent_high
    FROM "stock_prices" sp
    WHERE sp."timestamp" >= NOW() - INTERVAL '60 days'
)
SELECT DISTINCT ON (pa."stockSymbol")
    pa."stockSymbol",
    pa."closePrice",
    pa."volume",
    pa."timestamp",
    pa.sma_20,
    pa.sma_50,
    pa.avg_volume_20,
    pa.price_change_pct,
    CASE 
        WHEN pa."closePrice" > pa.sma_20 
        AND pa.sma_20 > pa.sma_50 
        AND pa."volume" > pa.avg_volume_20 * 1.5
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
        WHEN pa."volume" > pa.avg_volume_20 * 2 THEN 'Very High'
        WHEN pa."volume" > pa.avg_volume_20 * 1.5 THEN 'High'
        WHEN pa."volume" > pa.avg_volume_20 THEN 'Above Average'
        ELSE 'Normal'
    END as volume_status
FROM price_analysis pa
WHERE pa."timestamp" = (SELECT MAX("timestamp") FROM price_analysis pa2 WHERE pa2."stockSymbol" = pa."stockSymbol")
ORDER BY pa."stockSymbol", pa."timestamp" DESC;

-- Create an index to improve view performance
CREATE INDEX IF NOT EXISTS idx_stock_prices_symbol_timestamp 
ON "stock_prices" ("stockSymbol", "timestamp");
