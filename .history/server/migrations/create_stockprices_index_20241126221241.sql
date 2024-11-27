IF NOT EXISTS (
    SELECT * FROM sys.indexes 
    WHERE name = 'idx_stock_prices_symbol_timestamp' 
    AND object_id = OBJECT_ID('stock_prices')
)
BEGIN
    CREATE INDEX idx_stock_prices_symbol_timestamp 
    ON "stock_prices" (ticker, "C");
END;
GO
