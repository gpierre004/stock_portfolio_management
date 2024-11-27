CREATE INDEX IF NOT EXISTS idx_stock_prices_symbol_timestamp 
ON "stock_prices" ("symbol", "timestamp");
