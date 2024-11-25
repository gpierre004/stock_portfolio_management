const yahooFinance = require('yahoo-finance2');
const logger = require('./logger');
const pool = require('../config/database');

<<<<<<< HEAD
async function updatestock_prices(symbols) {
=======
async function updateStockPrices(symbols) {
>>>>>>> f16e5c4 (version 1.0.1)
    try {
        for (const symbol of symbols) {
            try {
                const quote = await yahooFinance.quote(symbol);
                
                if (quote) {
                    const date = new Date();
                    const query = `
                        INSERT INTO stock_prices (
                            ticker, date, open, high, low, close, volume, "adjustedClose"
                        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                        ON CONFLICT (ticker, date) 
                        DO UPDATE SET
                            open = EXCLUDED.open,
                            high = EXCLUDED.high,
                            low = EXCLUDED.low,
                            close = EXCLUDED.close,
                            volume = EXCLUDED.volume,
                            "adjustedClose" = EXCLUDED."adjustedClose"
                    `;
                    
                    await pool.query(query, [
                        symbol,
                        date,
                        quote.regularMarketOpen,
                        quote.regularMarketDayHigh,
                        quote.regularMarketDayLow,
                        quote.regularMarketPrice,
                        quote.regularMarketVolume,
                        quote.regularMarketPrice // Using current price as adjusted close
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
        logger.error('Error in updatestock_prices:', error);
=======
        logger.error('Error in updateStockPrices:', error);
>>>>>>> f16e5c4 (version 1.0.1)
        throw error;
    }
}

async function getHistoricalData(symbol, startDate, endDate) {
    try {
        const queryOptions = {
            period1: startDate,
            period2: endDate,
            interval: '1d'
        };
        
        const result = await yahooFinance.historical(symbol, queryOptions);
        
        // Store historical data in database
        for (const data of result) {
            const query = `
                INSERT INTO stock_prices (
                    ticker, date, open, high, low, close, volume, "adjustedClose"
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                ON CONFLICT (ticker, date) 
                DO UPDATE SET
                    open = EXCLUDED.open,
                    high = EXCLUDED.high,
                    low = EXCLUDED.low,
                    close = EXCLUDED.close,
                    volume = EXCLUDED.volume,
                    "adjustedClose" = EXCLUDED."adjustedClose"
            `;
            
            await pool.query(query, [
                symbol,
                data.date,
                data.open,
                data.high,
                data.low,
                data.close,
                data.volume,
                data.adjClose
            ]);
        }
        
        return result;
    } catch (error) {
        logger.error(`Error fetching historical data for ${symbol}:`, error);
        throw error;
    }
}

module.exports = {
<<<<<<< HEAD
    updatestock_prices,
=======
    updateStockPrices,
>>>>>>> f16e5c4 (version 1.0.1)
    getHistoricalData
};
