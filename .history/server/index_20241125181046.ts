import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import transactionRoutes from './routes/transactionRoutes';
import accountRoutes from './routes/accountRoutes';
import watchlistRoutes from './routes/watchlistRoutes';
import authRoutes from './routes/authRoutes';
import portfolioOptimizationRoutes from './routes/portfolioOptimizationRoutes.js';
import logger from './utils/logger';

// Initialize cron jobs
import './cron/stockPriceUpdateJob';
import './cron/afterMarketAnalysis';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/watchlist', watchlistRoutes);
app.use('/api/portfolio', portfolioOptimizationRoutes);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    logger.error(err.stack);
    res.status(500).json({
        success: false,
        error: 'Internal server error'
    });
});

app.listen(port, () => {
    logger.info(`Server running on port ${port}`);
    logger.info('Stock price update and after-market analysis cron jobs initialized');
});
