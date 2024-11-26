import { Transaction, StockPrice, sequelize } from '../models/index.js';
import { QueryTypes } from 'sequelize';

/**
 * @typedef {Object} PortfolioHolding
 * @property {string} ticker
 * @property {number} totalQuantity
 * @property {number} totalInvested
 * @property {number} currentValue
 */

/**
 * @typedef {Object} RebalancingSuggestion
 * @property {string} ticker
 * @property {number} currentAllocation
 * @property {number} targetAllocation
 * @property {'BUY' | 'SELL'} suggestedAction
 * @property {number} quantity
 */

/**
 * @typedef {Object} ScenarioAnalysis
 * @property {string} ticker
 * @property {number} currentValue
 * @property {number} projectedValue
 * @property {number} difference
 */

class PortfolioOptimizationService {
  /**
   * @param {number} [accountId]
   * @returns {Promise<PortfolioHolding[]>}
   */
  async getPortfolioHoldings(accountId) {
    const query = `
      WITH latest_prices AS (
        SELECT DISTINCT ON (ticker) ticker, close
        FROM stock_prices
        ORDER BY ticker, date DESC
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
    });

    return holdings;
  }

  /**
   * @param {PortfolioHolding[]} holdings
   * @param {Record<string, number>} targetAllocations
   * @returns {RebalancingSuggestion[]}
   */
  calculateRebalancingSuggestions(holdings, targetAllocations) {
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

  /**
   * @param {PortfolioHolding[]} holdings
   * @param {number} percentageChange
   * @returns {ScenarioAnalysis[]}
   */
  calculateScenarioAnalysis(holdings, percentageChange) {
    return holdings.map(holding => ({
      ticker: holding.ticker,
      currentValue: holding.currentValue,
      projectedValue: holding.currentValue * (1 + percentageChange / 100),
      difference: holding.currentValue * (percentageChange / 100)
    }));
  }

  /**
   * @param {number} [accountId]
   * @returns {Promise<any[]>}
   */
  async getDividendHistory(accountId) {
    // TODO: Implement dividend tracking
    // This will require additional database tables and integration with financial data APIs
    return [];
  }
}

export default new PortfolioOptimizationService();
