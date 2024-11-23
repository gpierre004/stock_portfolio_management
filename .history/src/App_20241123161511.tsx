import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import Dashboard from './pages/Dashboard';
import Watchlist from './pages/Watchlist';

const queryClient = new QueryClient();

function App() {
  const [selectedAccountId, setSelectedAccountId] = React.useState<number | null>(null);

  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <div className="min-h-screen bg-gray-50 flex">
          {/* Left Navigation */}
          <Navigation />

          {/* Main Content */}
          <div className="flex-1">
            <Routes>
              <Route 
                path="/" 
                element={
                  <Dashboard 
                    selectedAccountId={selectedAccountId}
                    setSelectedAccountId={setSelectedAccountId}
                  />
                } 
              />
              <Route path="/watchlist" element={<Watchlist />} />
            </Routes>
          </div>
        </div>
      </QueryClientProvider>
    </BrowserRouter>
  );
}

export default App;
