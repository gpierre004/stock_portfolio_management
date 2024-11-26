import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import logger from '../utils/logger';

interface JwtPayload {
  userId: number;
  email: string;
}

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        email: string;
      };
    }
  }
}

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  logger.info(`Auth header received: ${authHeader}`);

  const token = authHeader && authHeader.split(' ')[1];
  logger.info(`Token extracted: ${token ? 'Present' : 'Missing'}`);

  if (!token) {
    logger.warn('No token provided');
    return res.status(401).json({
      success: false,
      error: 'Authentication token is required'
    });
  }

  try {
    const secret = process.env.JWT_SECRET || 'your-secret-key';
    logger.info(`Using JWT secret: ${secret.substring(0, 3)}...`);

    const decoded = jwt.verify(token, secret) as JwtPayload;
    logger.info(`Token verified successfully for user: ${decoded.email}`);

    req.user = {
      id: decoded.userId,
      email: decoded.email
    };
    next();
  } catch (error) {
    logger.error('Token verification failed:', error);
    return res.status(403).json({
      success: false,
      error: 'Invalid or expired token',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
