import express from 'express';
import { authController } from '../controllers/authController';

const router = express.Router();

// Login route
router.post('/login', authController.login);

// Register route
router.post('/register', authController.register);

export default router;
