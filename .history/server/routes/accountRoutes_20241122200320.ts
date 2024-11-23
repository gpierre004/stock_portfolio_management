import { Router } from 'express';
import { AccountController } from '../controllers/accountController';

const router = Router();
const controller = new AccountController();

router.get('/user/:userId', controller.getAccounts.bind(controller));
router.post('/', controller.createAccount.bind(controller));

export default router;