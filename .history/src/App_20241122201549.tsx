import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import TransactionList from './components/TransactionList';
import TransactionForm from './components/TransactionForm';
import PortfolioSummary from './components/PortfolioSummary';
import AccountSelector from './components/AccountSelector';
import ErrorBoundary from './components/ErrorBoundary';
import { PlusCircle } from 'lucide-react';

const queryClient = new QueryClient();

function App() {
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [selectedAccountId, setSelectedAccountId] = React.useState<number | null>(null);

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <ErrorBoundary>
                <TransactionList accountId={selectedAccountId} />
              </ErrorBoundary>
            </div>
            <div>
              <ErrorBoundary>
                <PortfolioSummary accountId={selectedAccountId} />
              </ErrorBoundary>
            </div>
          </div>
        </main>

        {isFormOpen && (
          <TransactionForm 
            onClose={() => setIsFormOpen(false)} 
            accountId={selectedAccountId}
          />
        )}
      </div>
    </QueryClientProvider>
  );
}

export default App;
