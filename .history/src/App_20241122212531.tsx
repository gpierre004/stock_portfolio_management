import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import TransactionList from './components/TransactionList';
import TransactionForm from './components/TransactionForm';
import PortfolioSummary from './components/PortfolioSummary';
import AccountSelector from './components/AccountSelector';
import Navigation from './components/Navigation';
import ErrorBoundary from './components/ErrorBoundary';
import { PlusCircle } from 'lucide-react';

const queryClient = new QueryClient();

function App() {
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [selectedAccountId, setSelectedAccountId] = React.useState<number | null>(null);

  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <div className="min-h-screen bg-gray-50 flex">
          {/* Left Navigation */}
          <Navigation />

          {/* Main Content */}
          <div className="flex-1">
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
            <main className="p-8">
              <div className="flex gap-8">
                {/* Portfolio Summary */}
                <ErrorBoundary>
                  <PortfolioSummary accountId={selectedAccountId} />
                </ErrorBoundary>

                {/* Recent Transactions */}
                <ErrorBoundary>
                  <TransactionList accountId={selectedAccountId} />
                </ErrorBoundary>
              </div>
            </main>
          </div>

          {/* Transaction Form Modal */}
          {isFormOpen && (
            <TransactionForm 
              onClose={() => setIsFormOpen(false)} 
              accountId={selectedAccountId}
            />
          )}
        </div>
      </QueryClientProvider>
    </BrowserRouter>
  );
}

export default App;
