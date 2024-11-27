import { Sequelize, Op } from 'sequelize';
import { User, WatchList, StockPrice, Company } from '../models';
import logger from './logger';

// Constants
const DAYS_THRESHOLD = 90;
const PRICE_DROP_THRESHOLD = 0.25;
const RECOVERY_THRESHOLD = 0.70;
const VOLUME_INCREASE_THRESHOLD = 1.5;
const WATCH_LIST_THRESHOLD = 0.25;
const TREND_PERIOD = 1080;
const DEFAULT_USER_ID = 3;

async function ensureDefaultUser() {
    try {
        let defaultUser = await User.findByPk(DEFAULT_USER_ID);
        if (!defaultUser) {
            defaultUser = await User.create({
                id: DEFAULT_USER_ID,
                username: 'gbeljour',
                email: 'gbeljour@me.com',
                password: '1215'
            });
            logger.info('Created default user successfully');
        }
        return defaultUser;
    } catch (error) {
        logger.error('Error ensuring default user: ' + error.message);
        throw new Error('Unable to ensure default user exists');
    }
}

async function getPotentialStocks() {
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    try {
        const potentialStocks = await StockPrice.findAll({
            attributes: [
                'ticker',
                [Sequelize.fn('MAX', Sequelize.col('high')), '52WeekHigh'],
                [Sequelize.fn('AVG', Sequelize.col('close')), 'avgClose'],
                [Sequelize.fn('AVG', Sequelize.col('volume')), 'avgVolume'],
                [Sequelize.literal('(SELECT close FROM "stock_prices" sp WHERE sp."ticker" = "StockPrice"."ticker" ORDER BY date DESC LIMIT 1)'), 'currentPrice'],
                [Sequelize.literal('(SELECT volume FROM "stock_prices" sp WHERE sp."ticker" = "StockPrice"."ticker" ORDER BY date DESC LIMIT 1)'), 'currentVolume'],
            ],
            include: [{ 
                model: Company,
                attributes: ['name', 'sector', 'industry']
            }],
            where: {
                date: { [Op.gte]: oneYearAgo }
            },
            group: ['ticker', 'Company.ticker', 'Company.name', 'Company.sector', 'Company.industry'],
            having: Sequelize.and(
                Sequelize.literal(`
                    (SELECT close FROM "stock_prices" sp WHERE sp."ticker" = "StockPrice"."ticker" ORDER BY date DESC LIMIT 1) 
                    <= (1 - ${PRICE_DROP_THRESHOLD}) * MAX("StockPrice"."high")
                `),
                Sequelize.literal(`
                    (SELECT close FROM "stock_prices" sp WHERE sp."ticker" = "StockPrice"."ticker" ORDER BY date DESC LIMIT 1) 
                    >= ${RECOVERY_THRESHOLD} * MAX("StockPrice"."high")
                `),
                Sequelize.literal(`
                    (SELECT volume FROM "stock_prices" sp WHERE sp."ticker" = "StockPrice"."ticker" ORDER BY date DESC LIMIT 1)
                    >= ${VOLUME_INCREASE_THRESHOLD} * AVG("StockPrice"."volume")
                `),
                Sequelize.literal(`
                    (SELECT close FROM "stock_prices" sp WHERE sp."ticker" = "StockPrice"."ticker" ORDER BY date DESC LIMIT 1) 
                    > 85
                `)
            ),
            order: [[Sequelize.literal('MAX("StockPrice"."high") - (SELECT close FROM "stock_prices" sp WHERE sp."ticker" = "StockPrice"."ticker" ORDER BY date DESC LIMIT 1)'), 'DESC']]
        });

        logger.info(`Found ${potentialStocks.length} potential stocks`);
        return potentialStocks;
    } catch (error) {
        logger.error('Error finding potential stocks: ' + error.message);
        throw new Error('Unable to find potential stocks');
    }
}

async function addToWatchList(potentialStocks: any[]) {
    let addedCount = 0;
    const today = new Date();
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - DAYS_THRESHOLD);

    try {
        await ensureDefaultUser();

        // Remove stocks older than 90 days
        await WatchList.destroy({
            where: {
                userid: DEFAULT_USER_ID,
                date_added: { [Op.lt]: ninetyDaysAgo }
            }
        });

        for (const stock of potentialStocks) {
            const recentEntry = await WatchList.findOne({
                where: {
                    ticker: stock.ticker,
                    userid: DEFAULT_USER_ID,
                    date_added: { [Op.gte]: ninetyDaysAgo }
                }
            });

            if (!recentEntry) {
                const currentPrice = parseFloat(stock.dataValues.currentPrice);
                const weekHigh52 = parseFloat(stock.dataValues['52WeekHigh']);
                const percentBelow52WeekHigh = ((weekHigh52 - currentPrice) / weekHigh52 * 100).toFixed(2);
                const volumeIncrease = (parseFloat(stock.dataValues.currentVolume) / parseFloat(stock.dataValues.avgVolume) * 100 - 100).toFixed(2);

                await WatchList.create({
                    ticker: stock.ticker,
                    userid: DEFAULT_USER_ID,
                    date_added: today,
                    reason: `Trading ${percentBelow52WeekHigh}% below 52-week high with ${volumeIncrease}% volume increase`,
                    sector: stock.Company.sector,
                    industry: stock.Company.industry,
                    priceWhenAdded: currentPrice,
                    currentPrice,
                    weekHigh52,
                    percentBelow52WeekHigh,
                    avgClose: parseFloat(stock.dataValues.avgClose),
                    metrics: {
                        volumeIncrease: volumeIncrease,
                        industry: stock.Company.industry,
                        priceToAvg: (currentPrice / parseFloat(stock.dataValues.avgClose)).toFixed(2)
                    }
                });
                addedCount++;
            }
        }

        logger.info(`Added ${addedCount} new stocks to watch list`);
        return addedCount;
    } catch (error) {
        logger.error('Error adding stocks to watch list: ' + error.message);
        throw new Error('Unable to add stocks to watch list');
    }
}

export async function refreshWatchList() {
    try {
        await ensureDefaultUser();
        const potentialStocks = await getPotentialStocks();
        const addedCount = await addToWatchList(potentialStocks);
        
        logger.info(`Watch list refreshed. Added ${addedCount} new stocks.`);
        return { message: `Watch list refreshed. Added ${addedCount} new stocks.` };
    } catch (error) {
        logger.error('Error refreshing watch list: ' + error.message);
        throw new Error('Unable to refresh watch list');
    }
}

export async function cleanupWatchList() {
    try {
        await ensureDefaultUser();
        const ninetyDaysAgo = new Date();
        ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - DAYS_THRESHOLD);

        const { count } = await WatchList.destroy({
            where: {
                userid: DEFAULT_USER_ID,
                date_added: { [Op.lt]: ninetyDaysAgo }
            }
        });

        logger.info(`Watch list cleaned up. ${count} old items removed.`);
        return { message: `Watch list cleaned up. ${count} old items removed.` };
    } catch (error) {
        logger.error('Error cleaning up watch list: ' + error.message);
        throw new Error('Unable to clean up watch list');
    }
}

export default {
    refreshWatchList,
    cleanupWatchList
};
