import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BarChart2, Layout, List } from 'lucide-react';

export default function Navigation() {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

<<<<<<< HEAD
  const navItems = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: Layout
    },
    {
      name: 'Analysis',
      path: '/analysis',
      icon: BarChart2
    },
    {
      name: 'Watchlist',
      path: '/watchlist',
      icon: List
    }
  ];

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`inline-flex items-center px-4 border-b-2 text-sm font-medium ${
                    isActive(item.path)
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
                >
                  <Icon className="w-5 h-5 mr-2" />
                  {item.name}
                </Link>
              );
            })}
          </div>
=======
  const handleLogout = () => {
    authService.logout();
    navigate('/');
  };

  const handleLogin = () => {
    navigate('/login');
  };

  // Don't show navigation on public pages
  const publicPaths = ['/', '/login'];
  if (publicPaths.includes(location.pathname)) {
    return null;
  }

  return (
    <nav className="bg-gray-800 text-white w-64 min-h-screen p-4">
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-center p-4 border-b border-gray-700">
          <span className="text-xl font-semibold">Portfolio Tracker</span>
        </div>

        <div className="flex-1 space-y-2 py-4">
          {isAuthenticated ? (
            <>
              <Link 
                to="/dashboard" 
                className={`flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-700 ${isActive('/dashboard')}`}
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
            </>
          ) : null}
        </div>

        <div className="border-t border-gray-700 p-4">
          {isAuthenticated ? (
            <Button
              onClick={handleLogout}
              variant="outlined"
              color="inherit"
              fullWidth
              className="text-white border-white hover:border-gray-300"
            >
              Logout
            </Button>
          ) : (
            <Button
              onClick={handleLogin}
              variant="outlined"
              color="inherit"
              fullWidth
              className="text-white border-white hover:border-gray-300"
            >
              Login
            </Button>
          )}
<<<<<<< HEAD
>>>>>>> f16e5c4 (version 1.0.1)
=======
>>>>>>> f16e5c4 (version 1.0.1)
        </div>
      </div>
    </nav>
  );
}
