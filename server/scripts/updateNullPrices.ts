<<<<<<< HEAD
import { updatestock_prices } from '../utils/stockPriceUpdater';
=======
import { updateStockPrices } from '../utils/stockPriceUpdater';
>>>>>>> f16e5c4 (version 1.0.1)
import pool from '../config/database';

async function main() {
    try {
        // First get all unique tickers from transactions
        const tickersResult = await pool.query('SELECT DISTINCT ticker FROM transactions WHERE current_price IS NULL');
        const tickers = tickersResult.rows.map(row => row.ticker);
        
        console.log('Updating prices for tickers:', tickers);
        
        // Update stock prices for these tickers
<<<<<<< HEAD
        await updatestock_prices(tickers);
=======
        await updateStockPrices(tickers);
>>>>>>> f16e5c4 (version 1.0.1)
        
        console.log('Successfully updated prices');
        process.exit(0);
    } catch (error) {
        console.error('Error updating prices:', error);
        process.exit(1);
    }
}

main();
