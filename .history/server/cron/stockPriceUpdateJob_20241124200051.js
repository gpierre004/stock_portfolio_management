const cron = require('node-cron');
const { updatestock_prices } = require('../utils/stockPriceUpdater');
const logger = require('../utils/logger');

// Function to check if it's market hours (9:30 AM - 4:00 PM ET, Monday-Friday)
function isMarketHours() {
    const now = new Date();
    const day = now.getDay();
    
    // Convert current time to ET
    const etTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }));
    const hours = etTime.getHours();
    const minutes = etTime.getMinutes();
    const currentTime = hours * 100 + minutes;

    // Check if it's a weekday (1-5, Monday-Friday)
    if (day === 0 || day === 6) return false;

    // Check if it's between 9:30 AM and 4:00 PM ET
    return currentTime >= 930 && currentTime <= 1600;
}

// Schedule the job to run every 5 minutes during market hours
cron.schedule('*/5 * * * *', async () => {
    try {
        if (!isMarketHours()) {
            logger.info('Outside market hours, skipping update');
            return;
        }

        logger.info('Starting scheduled stock price update');
        await updatestock_prices();
        logger.info('Completed scheduled stock price update');
    } catch (error) {
        logger.error(`Error in scheduled stock price update: ${error.message}`);
    }
});

logger.info('Stock price update cron job initialized');
