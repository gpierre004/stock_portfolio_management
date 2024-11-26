import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import transactionRoutes from './routes/transactionRoutes';
import accountRoutes from './routes/accountRoutes';
import watchlistRoutes from './routes/watchlistRoutes';
import authRoutes from './routes/authRoutes';
import portfolioOptimizationRoutes from './routes/portfolioOptimizationRoutes.js';
import technicalAnalysisRoutes from './routes/technicalAnalysisRoutes.js';
import logger from './utils/logger';

// Initialize cron jobs
import './cron/stockPriceUpdateJob';
import './cron/afterMarketAnalysis';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Debug middleware for auth headers
app.use((req, res, next) => {
  logger.info(`Request path: ${req.path}`);
  logger.info(`Auth header: ${req.headers.authorization}`);
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/watchlist', watchlistRoutes);
app.use('/api/portfolio', portfolioOptimizationRoutes);
app.use('/api/analysis', technicalAnalysisRoutes);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    logger.error('Global error handler:');
    logger.error(err.stack);
    res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: err.message
    });
});

app.listen(port, () => {
    logger.info(`Server running on port ${port}`);
    logger.info('Stock price update and after-market analysis cron jobs initialized');
});
