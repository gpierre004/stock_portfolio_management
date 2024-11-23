import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import Navigation from './components/Navigation';
import Dashboard from './pages/Dashboard';
import Watchlist from './pages/Watchlist';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';
import theme from './theme';

const queryClient = new QueryClient();

function App() {
  const [selectedAccountId, setSelectedAccountId] = React.useState<number | null>(null);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <QueryClientProvider client={queryClient}>
          <div className="min-h-screen bg-gray-50 flex">
            {/* Left Navigation */}
            <Navigation />

            {/* Main Content */}
            <div className="flex-1">
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route 
                  path="/" 
                  element={
                    <ProtectedRoute>
                      <Dashboard 
                        selectedAccountId={selectedAccountId}
                        setSelectedAccountId={setSelectedAccountId}
                      />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/watchlist" 
                  element={
                    <ProtectedRoute>
                      <Watchlist />
                    </ProtectedRoute>
                  } 
                />
              </Routes>
            </div>
          </div>
        </QueryClientProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
