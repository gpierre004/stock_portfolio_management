import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';

export const TransactionSchema = z.object({
  ticker: z.string().min(1).max(10),
  purchase_date: z.string(),
  quantity: z.number().positive(),
  type: z.enum(['BUY', 'SELL']),
  comment: z.string().max(200).optional(),
  purchase_price: z.number().positive(),
  description: z.string().max(200).optional(),
});

export const validateTransaction = (req: Request, res: Response, next: NextFunction) => {
  try {
    TransactionSchema.parse(req.body);
    next();
  } catch (error) {
    res.status(400).json({ error: 'Invalid transaction data' });
  }
};