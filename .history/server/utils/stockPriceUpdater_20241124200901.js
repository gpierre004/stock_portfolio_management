const yahooFinance = require('yfinance');
const { Sequelize, Op } = require('sequelize');
const { StockPrice, Company, WatchList } = require('../models');
const logger = require('./logger');

async function fetchHistoricalData(ticker, startDate) {
    try {
        const data = await yahooFinance.historical({
            symbol: ticker,
            from: startDate,
            to: new Date(),
        });
        return data;
    } catch (error) {
        logger.error(`Error fetching data for ${ticker}: ${error.message}`);
        return null;
    }
}

async function cleanupOldData(fiveYearsAgo) {
    try {
        const deletedCount = await StockPrice.destroy({
            where: {
                date: {
                    [Op.lt]: fiveYearsAgo
                }
            }
        });
        logger.info(`Cleaned up ${deletedCount} records older than 5 years`);
    } catch (error) {
        logger.error(`Error cleaning up old data: ${error.message}`);
    }
}

async function updateWatchlistMetrics(ticker) {
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
            const priceChange = currentPrice - entry.priceWhenAdded;
            
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
    } catch (error) {
        logger.error(`Error updating watchlist metrics for ${ticker}: ${error.message}`);
    }
}

async function updateStockPrices() {
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
    } catch (error) {
        logger.error(`Error in stock price update job: ${error.message}`);
        throw error;
    }
}

// If running directly
if (require.main === module) {
    updateStockPrices()
        .then(() => process.exit(0))
        .catch(error => {
            logger.error(error);
            process.exit(1);
        });
}

module.exports = { updateStockPrices };