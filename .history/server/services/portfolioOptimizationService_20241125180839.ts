import { Transaction } from '../models/Transaction';
import { StockPrice } from '../models/StockPrice';
import { sequelize } from '../db';
import { QueryTypes } from 'sequelize';

interface PortfolioHolding {
  ticker: string;
  totalQuantity: number;
  totalInvested: number;
  currentValue: number;
}

interface RebalancingSuggestion {
  ticker: string;
  currentAllocation: number;
  targetAllocation: number;
  suggestedAction: 'BUY' | 'SELL';
  quantity: number;
}

interface ScenarioAnalysis {
  ticker: string;
  currentValue: number;
  projectedValue: number;
  difference: number;
}

class PortfolioOptimizationService {
  async getPortfolioHoldings(accountId?: number): Promise<PortfolioHolding[]> {
    const query = `
      WITH latest_prices AS (
        SELECT DISTINCT ON (ticker) ticker, price
        FROM stock_prices
        ORDER BY ticker, timestamp DESC
      ),
      portfolio_summary AS (
        SELECT 
          t.ticker,
          SUM(CASE WHEN t.type = 'BUY' THEN t.quantity ELSE -t.quantity END) as total_quantity,
          SUM(CASE WHEN t.type = 'BUY' THEN t.quantity * t.purchase_price 
              ELSE -t.quantity * t.purchase_price END) as total_invested
        FROM transactions t
        ${accountId ? 'WHERE t.account_id = :accountId' : ''}
        GROUP BY t.ticker
        HAVING SUM(CASE WHEN t.type = 'BUY' THEN t.quantity ELSE -t.quantity END) > 0
      )
      SELECT 
        ps.ticker,
        ps.total_quantity as "totalQuantity",
        ps.total_invested as "totalInvested",
        ps.total_quantity * lp.price as "currentValue"
      FROM portfolio_summary ps
      JOIN latest_prices lp ON ps.ticker = lp.ticker
    `;

    const holdings = await sequelize.query(query, {
      replacements: { accountId },
      type: QueryTypes.SELECT
    }) as PortfolioHolding[];

    return holdings;
  }

  calculateRebalancingSuggestions(
    holdings: PortfolioHolding[],
    targetAllocations: Record<string, number>
  ): RebalancingSuggestion[] {
    const totalValue = holdings.reduce((sum, holding) => sum + holding.currentValue, 0);
    
    return holdings.map(holding => {
      const currentAllocation = (holding.currentValue / totalValue) * 100;
      const targetAllocation = targetAllocations[holding.ticker] || currentAllocation;
      const difference = targetAllocation - currentAllocation;
      const suggestedAction = difference > 0 ? 'BUY' : 'SELL';
      const quantity = Math.abs((difference / 100) * totalValue / (holding.currentValue / holding.totalQuantity));
      
      return {
        ticker: holding.ticker,
        currentAllocation,
        targetAllocation,
        suggestedAction,
        quantity: Math.round(quantity * 100) / 100
      };
    });
  }

  calculateScenarioAnalysis(
    holdings: PortfolioHolding[],
    percentageChange: number
  ): ScenarioAnalysis[] {
    return holdings.map(holding => ({
      ticker: holding.ticker,
      currentValue: holding.currentValue,
      projectedValue: holding.currentValue * (1 + percentageChange / 100),
      difference: holding.currentValue * (percentageChange / 100)
    }));
  }

  async getDividendHistory(accountId?: number) {
    // TODO: Implement dividend tracking
    // This will require additional database tables and integration with financial data APIs
    return [];
  }
}

export default new PortfolioOptimizationService();
