import { updateNullCurrentPrices } from '../utils/stockPriceUpdater';

async function main() {
    try {
        await updateNullCurrentPrices();
        console.log('Successfully updated null current prices');
        process.exit(0);
    } catch (error) {
        console.error('Error updating prices:', error);
        process.exit(1);
    }
}

main();
