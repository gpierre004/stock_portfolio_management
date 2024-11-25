import React from 'react';
import TransactionList from '../components/TransactionList';
import AccountSelector from '../components/AccountSelector';
import ErrorBoundary from '../components/ErrorBoundary';
import { PlusCircle } from 'lucide-react';
import TransactionForm from '../components/TransactionForm';

const Transactions: React.FC = () => {
  const [selectedAccountId, setSelectedAccountId] = React.useState<number | null>(null);
  const [isFormOpen, setIsFormOpen] = React.useState(false);

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
      <main className="p-8">
        <ErrorBoundary>
          <TransactionList accountId={selectedAccountId} />
        </ErrorBoundary>
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

export default Transactions;
