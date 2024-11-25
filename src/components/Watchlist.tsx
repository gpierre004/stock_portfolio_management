import React from 'react';
import { Link } from 'react-router-dom';
import LoadingCard from './common/LoadingCard';
import ErrorCard from './common/ErrorCard';
import StockCard from './StockCard';
import { GanttChartSquare } from 'lucide-react';

interface WatchlistItem {
    ticker: string;
    currentPrice: number | null;
    priceWhenAdded: number | null;
    priceChange: number | null;
    date_added: string;
    reason: string;
    weekHigh52: number | null;
    percentBelow52WeekHigh: number | null;
    Company: {
        name: string;
        sector: string;
    };
}

export const Watchlist = () => {
    const [watchlist, setWatchlist] = React.useState<WatchlistItem[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);
    const [isUpdating, setIsUpdating] = React.useState(false);
    const [isRefreshing, setIsRefreshing] = React.useState(false);
    const [selectedTicker, setSelectedTicker] = React.useState<string | null>(null);

    const fetchWatchlist = async () => {
        try {
            const response = await fetch('http://localhost:3001/api/watchlist');
            if (!response.ok) {
                throw new Error('Failed to fetch watchlist');
            }
            const data = await response.json();
            setWatchlist(data);
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Failed to fetch watchlist');
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdatePrices = async () => {
        if (isUpdating) return;
        
        setIsUpdating(true);
        try {
            const response = await fetch('http://localhost:3001/api/watchlist/update-prices', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            if (!response.ok) {
                throw new Error('Failed to update prices');
            }
            const result = await response.json();
            alert(result.message);
            await fetchWatchlist();
        } catch (error) {
            console.error('Error updating prices:', error);
            alert('Failed to update prices');
        } finally {
            setIsUpdating(false);
        }
    };

    const handleRefreshWatchlist = async () => {
        if (isRefreshing) return;
        
        setIsRefreshing(true);
        try {
            const response = await fetch('http://localhost:3001/api/watchlist/refresh', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            if (!response.ok) {
                throw new Error('Failed to refresh watchlist');
            }
            const result = await response.json();
            alert(result.message || 'Watchlist refreshed successfully');
            await fetchWatchlist();
        } catch (error) {
            console.error('Error refreshing watchlist:', error);
            alert('Failed to refresh watchlist');
        } finally {
            setIsRefreshing(false);
        }
    };

    const handleCleanup = async () => {
        try {
            const response = await fetch('http://localhost:3001/api/watchlist/cleanup', {
                method: 'POST'
            });
            if (!response.ok) {
                throw new Error('Failed to cleanup watchlist');
            }
            const result = await response.json();
            alert(result.message);
            await fetchWatchlist();
        } catch (error) {
            console.error('Error cleaning up watchlist:', error);
            alert('Failed to cleanup watchlist');
        }
    };

    const handleRowClick = (ticker: string) => {
        setSelectedTicker(selectedTicker === ticker ? null : ticker);
    };

    React.useEffect(() => {
        fetchWatchlist();
    }, []);

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <ErrorCard message={error} />
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <LoadingCard message="Loading watchlist..." />
            </div>
        );
    }

    const formatPrice = (price: number | null): string => {
        return price !== null ? `$${price.toFixed(2)}` : 'N/A';
    };

    const formatPriceChange = (change: number | null): string => {
        if (change === null) return 'N/A';
        const sign = change >= 0 ? '+' : '';
        return `${sign}${change.toFixed(2)}%`;
    };

    const formatPercentBelow52WeekHigh = (percent: number | null): string => {
        if (percent === null) return 'N/A';
        return `-${percent.toFixed(2)}%`;
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <header className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <GanttChartSquare className="w-8 h-8 text-blue-600" />
                            <h1 className="text-2xl font-bold text-gray-900">Watchlist</h1>
                        </div>
                        <nav>
                            <Link to="/" className="text-blue-600 hover:underline">
                                Dashboard
                            </Link>
                        </nav>
                    </div>
                    <div className="mt-4 flex gap-4">
                        <button 
                            onClick={handleUpdatePrices} 
                            className={`px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed`}
                            disabled={isUpdating}
                        >
                            {isUpdating ? 'Updating Prices...' : 'Update Prices'}
                        </button>
                        <button 
                            onClick={handleRefreshWatchlist}
                            className={`px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed`}
                            disabled={isRefreshing}
                        >
                            {isRefreshing ? 'Refreshing...' : 'Refresh Watchlist'}
                        </button>
                        <button 
                            onClick={handleCleanup}
                            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                        >
                            Cleanup Old Items
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
                {watchlist.length === 0 ? (
                    <div className="text-center text-gray-500">No stocks in watchlist</div>
                ) : (
                    <div className="space-y-6">
                        <div className="bg-white shadow overflow-hidden rounded-lg">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ticker</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Price</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price Change</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Below 52W High</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Added</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {watchlist.map((item) => (
                                        <tr 
                                            key={item.ticker}
                                            onClick={() => handleRowClick(item.ticker)}
                                            className={`cursor-pointer hover:bg-gray-50 ${selectedTicker === item.ticker ? 'bg-blue-50' : ''}`}
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.ticker}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {item.Company?.name || 'N/A'}
                                                <div className="text-xs text-gray-400">{item.Company?.sector || 'N/A'}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {formatPrice(item.currentPrice)}
                                            </td>
                                            <td className={`px-6 py-4 whitespace-nowrap text-sm ${item.priceChange !== null ? (item.priceChange >= 0 ? 'text-green-600' : 'text-red-600') : 'text-gray-500'}`}>
                                                {formatPriceChange(item.priceChange)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                                                {formatPercentBelow52WeekHigh(item.percentBelow52WeekHigh)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {item.date_added ? new Date(item.date_added).toLocaleDateString() : 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500">{item.reason || 'N/A'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {selectedTicker && (
                            <div className="mt-6">
                                <StockCard ticker={selectedTicker} />
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
};

export default Watchlist;
