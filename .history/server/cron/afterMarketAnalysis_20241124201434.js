const cron = require('node-cron');
const { refreshWatchList, cleanupWatchList } = require('../utils/watchlistAnalyzer');
const logger = require('../utils/logger');

// Function to check if it's a trading day (Monday-Friday, excluding holidays)
function isTradingDay() {
    const now = new Date();
    const day = now.getDay();
    
    // Check if it's a weekday (1-5, Monday-Friday)
    return day !== 0 && day !== 6;
    // Note: Holiday checking could be added here if needed
}

// Schedule the job to run at 4:15 PM ET every day
// This gives time for the market to close and final prices to be updated
cron.schedule('15 16 * * *', async () => {
    try {
        // Convert current time to ET for logging
        const etTime = new Date().toLocaleString('en-US', { timeZone: 'America/New_York' });
        logger.info(`Starting after-market analysis at ${etTime}`);

        if (!isTradingDay()) {
            logger.info('Not a trading day, skipping analysis');
            return;
        }

        // First cleanup old watchlist entries
        await cleanupWatchList();

        // Then refresh the watchlist with new potential stocks
        await refreshWatchList();

        logger.info('After-market analysis completed successfully');
    } catch (error) {
        logger.error(`Error in after-market analysis: ${error.message}`);
    }
}, {
    timezone: "America/New_York"
});

logger.info('After-market analysis cron job initialized');
