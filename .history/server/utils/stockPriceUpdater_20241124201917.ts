import yahooFinance from 'yfinance';
import { Sequelize, Op } from 'sequelize';
import { StockPrice, Company, WatchList } from '../models';
import logger from './logger';

interface HistoricalData {
    date: Date;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
    adjClose: number;
}

async function fetchHistoricalData(ticker: string, startDate: Date): Promise<HistoricalData[] | null> {
    try {
        const data = await yahooFinance.getHistorical({
            symbol: ticker,
            from: startDate,
            to: new Date(),
        });
        return data as HistoricalData[];
    } catch (error: any) {
        logger.error(`Error fetching data for ${ticker}: ${error.message}`);
        return null;
    }
}

async function cleanupOldData(fiveYearsAgo: Date) {
    try {
        const deletedCount = await StockPrice.destroy({
            where: {
                date: {
                    [Op.lt]: fiveYearsAgo
                }
            }
        });
        logger.info(`Cleaned up ${deletedCount} records older than 5 years`);
    } catch (error: any) {
        logger.error(`Error cleaning up old data: ${error.message}`);
    }
}

async function updateWatchlistMetrics(ticker: string) {
    try {
        // Get the latest year of stock prices for this ticker
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

        const stockPrices = await StockPrice.findAll({
            where: {
                ticker,
                date: {
                    [Op.gte]: oneYearAgo
                }
            },
            order: [['date', 'DESC']]
        });

        if (stockPrices.length === 0) {
            logger.warn(`No recent stock prices found for ${ticker}`);
            return;
        }

        // Calculate metrics
        const currentPrice = stockPrices[0].close;
        const weekHigh52 = Math.max(...stockPrices.map(price => price.high));
        const percentBelow52WeekHigh = ((weekHigh52 - currentPrice) / weekHigh52) * 100;
        const avgClose = stockPrices.reduce((sum, price) => sum + price.close, 0) / stockPrices.length;

        // Update all watchlist entries for this ticker
        const watchlistEntries = await WatchList.findAll({
            where: { ticker }
        });

        for (const entry of watchlistEntries) {
            const priceChange = currentPrice - (entry.priceWhenAdded as number);
            
            await entry.update({
                currentPrice,
                weekHigh52,
                percentBelow52WeekHigh,
                avgClose,
                priceChange,
                lastUpdated: new Date()
            });
        }

        logger.info(`Updated watchlist metrics for ${ticker}`);
    } catch (error: any) {
        logger.error(`Error updating watchlist metrics for ${ticker}: ${error.message}`);
    }
}

export async function updateStockPrices() {
    try {
        // Get all company tickers
        const companies = await Company.findAll({
            attributes: ['ticker']
        });

        const fiveYearsAgo = new Date();
        fiveYearsAgo.setFullYear(fiveYearsAgo.getFullYear() - 5);

        // Clean up old data first
        await cleanupOldData(fiveYearsAgo);

        for (const company of companies) {
            const historicalData = await fetchHistoricalData(company.ticker, fiveYearsAgo);
            
            if (!historicalData) continue;

            // Process each price record
            for (const data of historicalData) {
                await StockPrice.upsert({
                    ticker: company.ticker,
                    date: data.date,
                    open: data.open,
                    high: data.high,
                    low: data.low,
                    close: data.close,
                    volume: data.volume,
                    adjustedClose: data.adjClose,
                    createdAt: new Date(),
                    updatedAt: new Date()
                }, {
                    fields: ['ticker', 'date']
                });
            }

            // Update watchlist metrics after updating stock prices
            await updateWatchlistMetrics(company.ticker);
            
            logger.info(`Updated stock prices and watchlist metrics for ${company.ticker}`);
        }

        logger.info('Stock price and watchlist update completed successfully');
    } catch (error: any) {
        logger.error(`Error in stock price update job: ${error.message}`);
        throw error;
    }
}

// If running directly
if (process.argv[1] === import.meta.url) {
    updateStockPrices()
        .then(() => process.exit(0))
        .catch(error => {
            logger.error(error);
            process.exit(1);
        });
}

export default {
    updateStockPrices
};
