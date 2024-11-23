import { Request, Response } from 'express';
import { TransactionService } from '../services/transactionService';
import { Transaction } from '../types/transaction';

const transactionService = new TransactionService();

export class TransactionController {
  async getAllTransactions(req: Request, res: Response) {
    try {
      const transactions = await transactionService.getAllTransactions();
      res.json(transactions);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async createTransaction(req: Request, res: Response) {
    try {
      console.log('Received transaction request:', req.body);
      
      const { accountId, ...transactionData } = req.body;
      
      if (!accountId) {
        console.error('Missing accountId in request');
        return res.status(400).json({ error: 'Account ID is required' });
      }

      const transaction: Transaction = {
        ...transactionData,
        account_id: accountId
      };

      console.log('Processing transaction:', transaction);

      const id = await transactionService.createTransaction(transaction);
      console.log('Transaction created with ID:', id);
      
      res.status(201).json({ id });
    } catch (error) {
      console.error('Error creating transaction:', error);
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(400).json({ error: 'Invalid data' });
      }
    }
  }

  async deleteTransaction(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const deleted = await transactionService.deleteTransaction(id);
      
      if (!deleted) {
        res.status(404).json({ error: 'Transaction not found' });
      } else {
        res.status(204).send();
      }
    } catch (error) {
      console.error('Error deleting transaction:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getPortfolioSummary(req: Request, res: Response) {
    try {
      const accountId = req.query.accountId ? parseInt(req.query.accountId as string) : null;
      const summary = await transactionService.getPortfolioSummary(accountId);
      res.json(summary);
    } catch (error) {
      console.error('Error fetching portfolio summary:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}
