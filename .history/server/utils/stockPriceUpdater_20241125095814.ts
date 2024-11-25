import yahooFinance from 'yahoo-finance2';
import logger from './logger';
import { sequelize } from '../config/database';
import StockPriceModel from '../models/StockPrice';

const StockPrice = StockPriceModel(sequelize);

<<<<<<< HEAD
<<<<<<< HEAD
export async function updatestock_prices(symbols: string[]): Promise<void> {
=======
export async function updateStockPrices(symbols: string[]): Promise<void> {
>>>>>>> f16e5c4 (version 1.0.1)
=======
export async function updateStockPrices(symbols: string[]): Promise<void> {
>>>>>>> f16e5c4 (version 1.0.1)
    try {
        for (const symbol of symbols) {
            try {
                const quote = await yahooFinance.quote(symbol);
                
                if (quote) {
                    const date = new Date();
                    await StockPrice.create({
                        ticker: symbol,
                        date: date,
                        open: quote.regularMarketOpen,
                        high: quote.regularMarketDayHigh,
                        low: quote.regularMarketDayLow,
                        close: quote.regularMarketPrice,
                        volume: quote.regularMarketVolume,
                        adjustedClose: quote.regularMarketPrice // Using current price as adjusted close
                    });
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
        return result;
    } catch (error) {
        logger.error(`Error fetching historical data for ${symbol}:`, error);
        throw error;
    }
}
