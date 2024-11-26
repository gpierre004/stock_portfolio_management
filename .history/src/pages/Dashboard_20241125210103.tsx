import React from 'react';
import TransactionList from '../components/TransactionList';
import TransactionForm from '../components/TransactionForm';
import PortfolioSummary from '../components/PortfolioSummary';
import PortfolioOptimization from '../components/PortfolioOptimization';
import AccountSelector from '../components/AccountSelector';
import ErrorBoundary from '../components/ErrorBoundary';
import { PlusCircle } from 'lucide-react';

interface DashboardProps {
  selectedAccountId: number | null;
  setSelectedAccountId: (id: number | null) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ selectedAccountId, setSelectedAccountId }) => {
  const [isFormOpen, setIsFormOpen] = React.useState(false);

  return (
    <>
      {/* Top Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <h1 className="text-xl font-semibold text-gray-900">Stock Portfolio Manager</h1>
            <div className="flex items-center space-x-4">
              <AccountSelector
                selectedAccountId={selectedAccountId}
                onAccountChange={setSelectedAccountId}
              />
              <button
                onClick={() => setIsFormOpen(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <PlusCircle className="w-5 h-5 mr-2" />
                Add Transaction
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Content Area */}
      <main className="p-8 space-y-8">
        {/* Portfolio Summary and Transactions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <ErrorBoundary>
            <PortfolioSummary accountId={selectedAccountId} />
          </ErrorBoundary>

          <ErrorBoundary>
            <TransactionList accountId={selectedAccountId} />
          </ErrorBoundary>
        </div>

        {/* Portfolio Optimization */}
        <div>
          <ErrorBoundary>
            <PortfolioOptimization accountId={selectedAccountId} />
          </ErrorBoundary>
        </div>
      </main>

      {/* Transaction Form Modal */}
      {isFormOpen && (
        <TransactionForm 
          onClose={() => setIsFormOpen(false)} 
          accountId={selectedAccountId}
        />
      )}
    </>
  );
};

export default Dashboard;
