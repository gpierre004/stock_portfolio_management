import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { Button } from '@mui/material';

export default function Navigation() {
  const location = useLocation();
  const navigate = useNavigate();
  const isAuthenticated = authService.isAuthenticated();

  const isActive = (path: string) => {
    return location.pathname === path ? 'bg-gray-700' : '';
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const handleLogin = () => {
    navigate('/login');
  };

  // Don't show navigation on login page
  if (location.pathname === '/login') {
    return null;
  }

  return (
    <nav className="bg-gray-800 text-white w-64 min-h-screen p-4">
      <div className="space-y-2">
        {isAuthenticated ? (
          <>
            <Link 
              to="/" 
              className={`flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-700 ${isActive('/')}`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <span>Dashboard</span>
            </Link>

            <Link 
              to="/watchlist" 
              className={`flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-700 ${isActive('/watchlist')}`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <span>Watchlist</span>
            </Link>

            <Link 
              to="/transactions" 
              className={`flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-700 ${isActive('/transactions')}`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <span>Transactions</span>
            </Link>

            <div className="mt-auto pt-4">
              <Button
                onClick={handleLogout}
                variant="outlined"
                color="inherit"
                fullWidth
                sx={{ mt: 2 }}
              >
                Logout
              </Button>
            </div>
          </>
        ) : (
          <div className="pt-4">
            <Button
              onClick={handleLogin}
              variant="outlined"
              color="inherit"
              fullWidth
              sx={{ mt: 2 }}
            >
              Login
            </Button>
          </div>
        )}
      </div>
    </nav>
  );
}
