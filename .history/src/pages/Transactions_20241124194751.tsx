import React from 'react';
import TransactionList from '../components/TransactionList';
import TransactionForm from '../components/TransactionForm';
import AccountSelector from '../components/AccountSelector';
import ErrorBoundary from '../components/ErrorBoundary';

const Transactions: React.FC = () => {
  const [selectedAccountId, setSelectedAccountId] = React.useState<number | null>(null);

  return (
    <>
      {/* Top Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <h1 className="text-xl font-semibold text-gray-900">Transactions</h1>
            <div className="flex items-center space-x-4">
              <AccountSelector
                selectedAccountId={selectedAccountId}
                onAccountChange={setSelectedAccountId}
              />
            </div>
          </div>
        </div>
      </nav>

      {/* Content Area */}
      <main className="p-8">
        <div className="flex gap-8">
          {/* Left Side - Add Transaction Form */}
          <div className="w-1/2">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Add Transaction</h2>
              <ErrorBoundary>
                <TransactionForm 
                  onClose={() => {}} 
                  accountId={selectedAccountId}
                />
              </ErrorBoundary>
            </div>
          </div>

          {/* Right Side - Recent Transactions */}
          <div className="w-1/2">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Transactions</h2>
              <ErrorBoundary>
                <TransactionList accountId={selectedAccountId} />
              </ErrorBoundary>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default Transactions;
