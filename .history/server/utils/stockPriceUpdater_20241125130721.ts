import yahooFinance from 'yahoo-finance2';
import logger from './logger';
import pool from '../config/database';

async function updateNullCurrentPrices() {
    try {
        const query = `
            UPDATE transactions t 
            SET current_price = (
                SELECT close 
                FROM stock_prices sp 
                WHERE TRIM(sp.ticker) = TRIM(t.ticker) 
                ORDER BY date DESC 
                LIMIT 1
            ) 
            WHERE t.current_price IS NULL;
        `;
        await pool.query(query);
        logger.info('Updated null current_prices in transactions table');
    } catch (error) {
        logger.error('Error updating null current_prices:', error);
        throw error;
    }
}

<<<<<<< HEAD
<<<<<<< HEAD
async function updatestock_prices(symbols?: string | string[]) {
=======
async function updateStockPrices(symbols?: string | string[]) {
>>>>>>> f16e5c4 (version 1.0.1)
=======
async function updateStockPrices(symbols?: string | string[]) {
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
                const quote = await yahooFinance.quote(symbol.trim());
                
                if (quote) {
                    const now = new Date();
                    // Update stock_prices table
                    const stockPriceQuery = `
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
                    
                    await pool.query(stockPriceQuery, [
                        symbol.trim(),
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

                    // Update current_price in transactions table with trimmed ticker comparison
                    const updateTransactionsQuery = `
                        UPDATE transactions 
                        SET current_price = $1, "updatedAt" = $2
                        WHERE TRIM(ticker) = $3
                    `;

                    await pool.query(updateTransactionsQuery, [
                        quote.regularMarketPrice,
                        now,
                        symbol.trim()
                    ]);
                    
                    logger.info(`Updated price for ${symbol.trim()}: ${quote.regularMarketPrice}`);
                }
            } catch (error) {
                logger.error(`Error updating price for symbol ${symbol}:`, error);
                continue; // Continue with next symbol even if one fails
            }
        }

        // Update any remaining null current_prices
        await updateNullCurrentPrices();
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

async function getHistoricalData(symbol: string, startDate: Date, endDate: Date) {
    try {
        const queryOptions = {
            period1: startDate,
            period2: endDate,
            interval: "1d" as "1d" | "1wk" | "1mo"  // Explicitly type as allowed interval
        };
        
        const result = await yahooFinance.historical(symbol.trim(), queryOptions);
        
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
                symbol.trim(),
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

            // Update current_price in transactions table with the latest close price
            if (data === result[result.length - 1]) { // Only update with the most recent price
                const updateTransactionsQuery = `
                    UPDATE transactions 
                    SET current_price = $1, "updatedAt" = $2
                    WHERE TRIM(ticker) = $3
                `;

                await pool.query(updateTransactionsQuery, [
                    data.close,
                    now,
                    symbol.trim()
                ]);
            }
        }
        
        // Update any remaining null current_prices
        await updateNullCurrentPrices();
        
        return result;
    } catch (error) {
        logger.error(`Error fetching historical data for ${symbol}:`, error);
        throw error;
    }
}

export {
<<<<<<< HEAD
<<<<<<< HEAD
    updatestock_prices,
=======
    updateStockPrices,
>>>>>>> f16e5c4 (version 1.0.1)
=======
    updateStockPrices,
>>>>>>> f16e5c4 (version 1.0.1)
    getHistoricalData,
    updateNullCurrentPrices
};
