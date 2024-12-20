const yahooFinance = require('yfinance');
const { Sequelize, Op } = require('sequelize');
const { StockPrice, Company } = require('../models');
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

async function updatestock_prices() {
    try {
        // Get all company tickers
        const companies = await Company.findAll({
            attributes: ['ticker']
        });

        const fiveYearsAgo = new Date();
        fiveYearsAgo.setFullYear(fiveYearsAgo.getFullYear() - 5);

        for (const company of companies) {
            const historicalData = await fetchHistoricalData(company.ticker, fiveYearsAgo);
            
            if (!historicalData) continue;

            // Bulk upsert the stock prices
            const stock_prices = historicalData.map(data => ({
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
            }));

            await StockPrice.bulkCreate(stock_prices, {
                updateOnDuplicate: [
                    'open', 'high', 'low', 'close', 
                    'volume', 'adjustedClose', 'updatedAt'
                ]
            });

            logger.info(`Updated stock prices for ${company.ticker}`);
        }

        logger.info('Stock price update completed successfully');
    } catch (error) {
        logger.error(`Error in stock price update job: ${error.message}`);
        throw error;
    }
}

// If running directly
if (require.main === module) {
    updatestock_prices()
        .then(() => process.exit(0))
        .catch(error => {
            logger.error(error);
            process.exit(1);
        });
}

module.exports = { updatestock_prices };
