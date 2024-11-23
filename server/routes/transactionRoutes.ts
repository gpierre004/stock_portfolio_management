import { Router } from 'express';
import { TransactionController } from '../controllers/transactionController';
import { validateTransaction } from '../middleware/validation';

const router = Router();
const controller = new TransactionController();

router.get('/', controller.getAllTransactions.bind(controller));
router.post('/', validateTransaction, controller.createTransaction.bind(controller));
router.delete('/:id', controller.deleteTransaction.bind(controller));
router.get('/portfolio/summary', controller.getPortfolioSummary.bind(controller));

export default router;