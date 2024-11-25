import yahooFinance from 'yahoo-finance2';
import logger from './logger';
import pool from '../config/database';

<<<<<<< HEAD
<<<<<<< HEAD
export async function updatestock_prices(symbols?: string[]): Promise<void> {
=======
export async function updateStockPrices(symbols?: string[]): Promise<void> {
>>>>>>> f16e5c4 (version 1.0.1)
=======
export async function updateStockPrices(symbols?: string[]): Promise<void> {
>>>>>>> f16e5c4 (version 1.0.1)
    try {
        // If no symbols provided, fetch all symbols from the database
        if (!symbols) {
            const result = await pool.query('SELECT ticker FROM companies');
            symbols = result.rows.map(row => row.ticker);
        }

        // Ensure symbols is an array
        if (!Array.isArray(symbols)) {
            symbols = [symbols];
        }

        // Log the symbols we're about to update
        logger.info(`Updating prices for symbols: ${symbols.join(', ')}`);

        for (const symbol of symbols) {
            try {
                const quote = await yahooFinance.quote(symbol);
                
                if (quote) {
                    const now = new Date();
                    const query = `
                        INSERT INTO stock_prices (
                            ticker, date, open, high, low, close, volume, "adjustedClose",
                            "createdAt", "updatedAt"
                        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                        ON CONFLICT (ticker, date) 
                        DO UPDATE SET
                            open = EXCLUDED.open,
                            high = EXCLUDED.high,
                            low = EXCLUDED.low,
                            close = EXCLUDED.close,
                            volume = EXCLUDED.volume,
                            "adjustedClose" = EXCLUDED."adjustedClose",
                            "updatedAt" = EXCLUDED."updatedAt"
                    `;
                    
                    await pool.query(query, [
                        symbol,
                        now,
                        quote.regularMarketOpen,
                        quote.regularMarketDayHigh,
                        quote.regularMarketDayLow,
                        quote.regularMarketPrice,
                        quote.regularMarketVolume,
                        quote.regularMarketPrice, // Using current price as adjusted close
                        now, // createdAt
                        now  // updatedAt
                    ]);
                    
                    logger.info(`Updated price for ${symbol}: ${quote.regularMarketPrice}`);
                }
            } catch (error) {
                logger.error(`Error updating price for symbol ${symbol}:`, error);
                continue; // Continue with next symbol even if one fails
            }
        }
    } catch (error) {
<<<<<<< HEAD
<<<<<<< HEAD
        logger.error('Error in updatestock_prices:', error);
=======
        logger.error('Error in updateStockPrices:', error);
>>>>>>> f16e5c4 (version 1.0.1)
=======
        logger.error('Error in updateStockPrices:', error);
>>>>>>> f16e5c4 (version 1.0.1)
        throw error;
    }
}

export async function getHistoricalData(symbol: string, startDate: Date, endDate: Date): Promise<any> {
    try {
        const queryOptions = {
            period1: startDate,
            period2: endDate,
            interval: '1d' as const // Type assertion to literal type
        };
        
        const result = await yahooFinance.historical(symbol, queryOptions);
        
        // Store historical data in database
        for (const data of result) {
            const now = new Date();
            const query = `
                INSERT INTO stock_prices (
                    ticker, date, open, high, low, close, volume, "adjustedClose",
                    "createdAt", "updatedAt"
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                ON CONFLICT (ticker, date) 
                DO UPDATE SET
                    open = EXCLUDED.open,
                    high = EXCLUDED.high,
                    low = EXCLUDED.low,
                    close = EXCLUDED.close,
                    volume = EXCLUDED.volume,
                    "adjustedClose" = EXCLUDED."adjustedClose",
                    "updatedAt" = EXCLUDED."updatedAt"
            `;
            
            await pool.query(query, [
                symbol,
                data.date,
                data.open,
                data.high,
                data.low,
                data.close,
                data.volume,
                data.adjClose,
                now, // createdAt
                now  // updatedAt
            ]);
        }
        
        return result;
    } catch (error) {
        logger.error(`Error fetching historical data for ${symbol}:`, error);
        throw error;
    }
}
