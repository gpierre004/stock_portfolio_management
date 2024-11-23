import { Request, Response } from 'express';
import { AccountService } from '../services/accountService';

const accountService = new AccountService();

export class AccountController {
  async getAllAccounts(req: Request, res: Response) {
    try {
      const accounts = await accountService.getAllAccounts();
      res.json(accounts);
    } catch (error) {
      console.error('Error fetching all accounts:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getAccounts(req: Request, res: Response) {
    try {
      const userId = parseInt(req.params.userId);
      const accounts = await accountService.getAccounts(userId);
      res.json(accounts);
    } catch (error) {
      console.error('Error fetching accounts:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async createAccount(req: Request, res: Response) {
    try {
      const account = await accountService.createAccount(req.body);
      res.status(201).json(account);
    } catch (error) {
      console.error('Error creating account:', error);
      res.status(400).json({ error: 'Invalid data' });
    }
  }
}
