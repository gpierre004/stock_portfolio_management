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
  accountId: z.number().positive({ message: "Account ID is required" })
});

export const validateTransaction = (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = TransactionSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ 
        error: 'Invalid transaction data',
        details: result.error.errors
      });
    }
    next();
  } catch (error) {
    console.error('Validation error:', error);
    res.status(400).json({ error: 'Invalid transaction data' });
  }
};
