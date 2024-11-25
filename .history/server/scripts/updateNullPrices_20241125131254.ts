import { updateStockPrices } from '../utils/stockPriceUpdater';
import pool from '../config/database';

async function main() {
    try {
        // First get all unique tickers from transactions
        const tickersResult = await pool.query('SELECT DISTINCT ticker FROM transactions WHERE current_price IS NULL');
        const tickers = tickersResult.rows.map(row => row.ticker);
        
        console.log('Updating prices for tickers:', tickers);
        
        // Update stock prices for these tickers
        await updateStockPrices(tickers);
        
        console.log('Successfully updated prices');
        process.exit(0);
    } catch (error) {
        console.error('Error updating prices:', error);
        process.exit(1);
    }
}

main();
