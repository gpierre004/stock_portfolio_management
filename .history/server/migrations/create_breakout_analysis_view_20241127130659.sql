DROP VIEW IF EXISTS vw_potential_breakouts;

CREATE VIEW vw_potential_breakouts AS
 WITH price_analysis AS (
         SELECT sp.ticker,
            sp.close::numeric(18,2) AS "closePrice",
            sp.volume::numeric(18,0) AS volume,
            sp."createdAt",
            first_value(sp.close) OVER (PARTITION BY sp.ticker ORDER BY sp."createdAt" ROWS BETWEEN 19 PRECEDING AND CURRENT ROW)::numeric(18,2) AS sma_20,
            first_value(sp.close) OVER (PARTITION BY sp.ticker ORDER BY sp."createdAt" ROWS BETWEEN 49 PRECEDING AND CURRENT ROW)::numeric(18,2) AS sma_50,
            avg(sp.volume) OVER (PARTITION BY sp.ticker ORDER BY sp."createdAt" ROWS BETWEEN 19 PRECEDING AND CURRENT ROW)::numeric(18,2) AS avg_volume_20,
            ((sp.close - lag(sp.close, 1) OVER (PARTITION BY sp.ticker ORDER BY sp."createdAt")) / NULLIF(lag(sp.close, 1) OVER (PARTITION BY sp.ticker ORDER BY sp."createdAt"), 0::double precision) * 100::double precision)::numeric(18,2) AS price_change_pct,
            max(sp.close) OVER (PARTITION BY sp.ticker ORDER BY sp."createdAt" ROWS BETWEEN 20 PRECEDING AND CURRENT ROW)::numeric(18,2) AS recent_high,
            row_number() OVER (PARTITION BY sp.ticker ORDER BY sp."createdAt" DESC) AS rn
           FROM stock_prices sp
          WHERE sp."createdAt" >= (now() - '60 days'::interval)
        )
 SELECT ticker,
    "closePrice",
    volume,
    "createdAt",
    sma_20,
    sma_50,
    avg_volume_20,
    price_change_pct,
        CASE
            WHEN "closePrice" > sma_20 AND sma_20 > sma_50 AND volume > (avg_volume_20 * 1.5) AND "closePrice" >= (recent_high * 0.95) AND price_change_pct > 0::numeric THEN true
            ELSE false
        END AS potential_breakout,
        CASE
            WHEN "closePrice" > sma_20 AND sma_20 > sma_50 THEN 'Strong uptrend'::text
            WHEN "closePrice" > sma_20 THEN 'Moderate uptrend'::text
            WHEN "closePrice" < sma_20 AND sma_20 < sma_50 THEN 'Downtrend'::text
            ELSE 'Neutral'::text
        END AS trend_status,
        CASE
            WHEN volume > (avg_volume_20 * 2::numeric) THEN 'Very High'::text
            WHEN volume > (avg_volume_20 * 1.5) THEN 'High'::text
            WHEN volume > avg_volume_20 THEN 'Above Average'::text
            ELSE 'Normal'::text
        END AS volume_status
   FROM price_analysis
  WHERE rn = 1
  ORDER BY ticker, "createdAt" DESC;