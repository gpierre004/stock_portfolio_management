import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
<<<<<<< HEAD
<<<<<<< HEAD
=======
=======
>>>>>>> f16e5c4 (version 1.0.1)
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import Navigation from './components/Navigation';
>>>>>>> f16e5c4 (version 1.0.1)
import Dashboard from './pages/Dashboard';
import Analysis from './pages/Analysis';
import Login from './pages/Login';
import Landing from './pages/Landing';
<<<<<<< HEAD
<<<<<<< HEAD
import Navigation from './components/Navigation';
=======
=======
>>>>>>> f16e5c4 (version 1.0.1)
import Transactions from './pages/Transactions';
>>>>>>> f16e5c4 (version 1.0.1)
import ProtectedRoute from './components/ProtectedRoute';
import Watchlist from './pages/Watchlist';

const queryClient = new QueryClient();

// Helper component to conditionally render Navigation
const NavigationWrapper = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const publicPaths = ['/', '/login'];
  const showNavigation = !publicPaths.includes(location.pathname);
<<<<<<< HEAD
=======

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
>>>>>>> f16e5c4 (version 1.0.1)

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
  const [selectedAccountId, setSelectedAccountId] = useState<number | null>(null);

  return (
<<<<<<< HEAD
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <>
                    <Navigation />
                    <Dashboard
                      selectedAccountId={selectedAccountId}
                      setSelectedAccountId={setSelectedAccountId}
                    />
                  </>
                </ProtectedRoute>
              }
            />
            <Route
              path="/analysis"
              element={
                <ProtectedRoute>
                  <>
                    <Navigation />
                    <Analysis
                      selectedAccountId={selectedAccountId}
                      setSelectedAccountId={setSelectedAccountId}
                    />
                  </>
                </ProtectedRoute>
              }
            />
            <Route
              path="/watchlist"
              element={
                <ProtectedRoute>
                  <>
                    <Navigation />
                    <Watchlist />
                  </>
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </QueryClientProvider>
=======
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
>>>>>>> f16e5c4 (version 1.0.1)
  );
}

export default App;
