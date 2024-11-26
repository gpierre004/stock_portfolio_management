import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Dashboard from './pages/Dashboard';
import Analysis from './pages/Analysis';
import Login from './pages/Login';
import Landing from './pages/Landing';
import Navigation from './components/Navigation';
import ProtectedRoute from './components/ProtectedRoute';
import Watchlist from './pages/Watchlist';

const queryClient = new QueryClient();

function App() {
  const [selectedAccountId, setSelectedAccountId] = useState<number | null>(null);

  return (
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
  );
}

export default App;
