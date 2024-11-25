import yahooFinance from 'yahoo-finance2';
import { StockPrice } from '../models/StockPrice';
import logger from './logger';

export async function updateStockPrices(symbols: string[]): Promise<void> {
    try {
        for (const symbol of symbols) {
            try {
                const quote = await yahooFinance.quote(symbol);
                
                if (quote) {
                    await StockPrice.create({
                        symbol,
                        price: quote.regularMarketPrice,
                        timestamp: new Date(),
                        volume: quote.regularMarketVolume,
                        change: quote.regularMarketChange,
                        changePercent: quote.regularMarketChangePercent
                    });
                    logger.info(`Updated price for ${symbol}: ${quote.regularMarketPrice}`);
                }
            } catch (error) {
                logger.error(`Error updating price for symbol ${symbol}:`, error);
                continue; // Continue with next symbol even if one fails
            }
        }
    } catch (error) {
        logger.error('Error in updateStockPrices:', error);
        throw error;
    }
}

export async function getHistoricalData(symbol: string, startDate: Date, endDate: Date): Promise<any> {
    try {
        const queryOptions = {
            period1: startDate.toISOString(),
            period2: endDate.toISOString(),
            interval: '1d'
        };
        
        const result = await yahooFinance.historical(symbol, queryOptions);
        return result;
    } catch (error) {
        logger.error(`Error fetching historical data for ${symbol}:`, error);
        throw error;
    }
}