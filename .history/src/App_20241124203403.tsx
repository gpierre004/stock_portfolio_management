import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import Navigation from './components/Navigation';
import Dashboard from './pages/Dashboard';
import Watchlist from './pages/Watchlist';
import Login from './pages/Login';
import Landing from './pages/Landing';
import Transactions from './pages/Transactions';
import ProtectedRoute from './components/ProtectedRoute';
import theme from './theme';

const queryClient = new QueryClient();

// Helper component to conditionally render Navigation
const NavigationWrapper = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const publicPaths = ['/', '/login'];
  const showNavigation = !publicPaths.includes(location.pathname);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {showNavigation && <Navigation />}
      <div className={`flex-1 ${!showNavigation ? 'w-full' : ''}`}>
        {children}
      </div>
    </div>
  );
};

function App() {
  const [selectedAccountId, setSelectedAccountId] = React.useState<number | null>(null);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <QueryClientProvider client={queryClient}>
          <NavigationWrapper>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />

              {/* Protected Routes */}
              <Route 
                path="/dashboard" 
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
              <Route 
                path="/transactions" 
                element={
                  <ProtectedRoute>
                    <Transactions />
                  </ProtectedRoute>
                } 
              />
            </Routes>
          </NavigationWrapper>
        </QueryClientProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
