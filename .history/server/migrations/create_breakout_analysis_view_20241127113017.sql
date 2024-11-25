DROP VIEW IF EXISTS vw_potential_breakouts;

CREATE OR REPLACE VIEW vw_potential_breakouts AS
WITH price_analysis AS (
    SELECT 
        sp.ticker,
        sp."closePrice",
        sp.volume,
        sp."createdAt",
        AVG(sp."closePrice") OVER (
            PARTITION BY sp.ticker 
            ORDER BY sp."createdAt" 
            ROWS BETWEEN 19 PRECEDING AND CURRENT ROW
        ) as sma_20,
        AVG(sp."closePrice") OVER (
            PARTITION BY sp.ticker 
            ORDER BY sp."createdAt" 
            ROWS BETWEEN 49 PRECEDING AND CURRENT ROW
        ) as sma_50,
        AVG(sp.volume) OVER (
            PARTITION BY sp.ticker 
            ORDER BY sp."createdAt" 
            ROWS BETWEEN 19 PRECEDING AND CURRENT ROW
        ) as avg_volume_20,
        (sp."closePrice" - LAG(sp."closePrice", 1) OVER (
            PARTITION BY sp.ticker 
            ORDER BY sp."createdAt"
        )) / NULLIF(LAG(sp."closePrice", 1) OVER (
            PARTITION BY sp.ticker 
            ORDER BY sp."createdAt"
        ), 0) * 100 as price_change_pct,
        MAX(sp."closePrice") OVER (
            PARTITION BY sp.ticker 
            ORDER BY sp."createdAt" 
            ROWS BETWEEN 20 PRECEDING AND CURRENT ROW
        ) as recent_high
    FROM stock_prices sp
    WHERE sp."createdAt" >= (CURRENT_TIMESTAMP - INTERVAL '60 days')
)
SELECT 
    pa.ticker,
    pa."closePrice",
    pa.volume,
    pa."createdAt",
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
WHERE pa."createdAt" = (
    SELECT MAX("createdAt") 
    FROM price_analysis pa2 
    WHERE pa2.ticker = pa.ticker
)
ORDER BY pa.ticker, pa."createdAt" DESC;
