IF EXISTS (SELECT * FROM sys.views WHERE name = 'vw_potential_breakouts')
    DROP VIEW vw_potential_breakouts
GO

CREATE VIEW vw_potential_breakouts AS
WITH price_analysis AS (
    SELECT 
        sp.ticker,
        sp.[close],
        sp.volume,
        sp.[date],
        AVG(sp.[close]) OVER (
            PARTITION BY sp.ticker 
            ORDER BY sp.[date] 
            ROWS BETWEEN 19 PRECEDING AND CURRENT ROW
        ) as sma_20,
        AVG(sp.[close]) OVER (
            PARTITION BY sp.ticker 
            ORDER BY sp.[date] 
            ROWS BETWEEN 49 PRECEDING AND CURRENT ROW
        ) as sma_50,
        AVG(sp.volume) OVER (
            PARTITION BY sp.ticker 
            ORDER BY sp.[date] 
            ROWS BETWEEN 19 PRECEDING AND CURRENT ROW
        ) as avg_volume_20,
        (sp.[close] - LAG(sp.[close], 1) OVER (
            PARTITION BY sp.ticker 
            ORDER BY sp.[date]
        )) / NULLIF(LAG(sp.[close], 1) OVER (
            PARTITION BY sp.ticker 
            ORDER BY sp.[date]
        ), 0) * 100 as price_change_pct,
        MAX(sp.[close]) OVER (
            PARTITION BY sp.ticker 
            ORDER BY sp.[date] 
            ROWS BETWEEN 20 PRECEDING AND CURRENT ROW
        ) as recent_high
    FROM stock_prices sp
    WHERE sp.[date] >= DATEADD(day, -60, GETDATE())
)
SELECT 
    pa.ticker,
    pa.[close],
    pa.volume,
    pa.[date],
    pa.sma_20,
    pa.sma_50,
    pa.avg_volume_20,
    pa.price_change_pct,
    CASE 
        WHEN pa.[close] > pa.sma_20 
        AND pa.sma_20 > pa.sma_50 
        AND pa.volume > pa.avg_volume_20 * 1.5
        AND pa.[close] >= pa.recent_high * 0.95
        AND pa.price_change_pct > 0
        THEN 1
        ELSE 0
    END as potential_breakout,
    CASE
        WHEN pa.[close] > pa.sma_20 
        AND pa.sma_20 > pa.sma_50 THEN N'Strong uptrend'
        WHEN pa.[close] > pa.sma_20 THEN N'Moderate uptrend'
        WHEN pa.[close] < pa.sma_20 
        AND pa.sma_20 < pa.sma_50 THEN N'Downtrend'
        ELSE N'Neutral'
    END as trend_status,
    CASE
        WHEN pa.volume > pa.avg_volume_20 * 2 THEN N'Very High'
        WHEN pa.volume > pa.avg_volume_20 * 1.5 THEN N'High'
        WHEN pa.volume > pa.avg_volume_20 THEN N'Above Average'
        ELSE N'Normal'
    END as volume_status
FROM price_analysis pa
WHERE pa.[date] = (
    SELECT MAX([date]) 
    FROM price_analysis pa2 
    WHERE pa2.ticker = pa.ticker
)
ORDER BY pa.ticker, pa.[date] DESC
GO
