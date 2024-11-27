import React, { useEffect, useState } from 'react';
import { 
    Paper, 
    Table, 
    TableBody, 
    TableCell, 
    TableContainer, 
    TableHead, 
    TableRow,
    Typography,
    Box,
    Chip,
    CircularProgress,
    Alert
} from '@mui/material';
import { API_BASE_URL } from '../config/api';

interface BreakoutStock {
    stockSymbol: string;
    closePrice: number;
    volume: number;
    timestamp: string;
    sma_20: number;
    sma_50: number;
    price_change_pct: number;
    potential_breakout: boolean;
    trend_status: string;
    volume_status: string;
}

const BreakoutAnalysis: React.FC = () => {
    const [breakoutStocks, setBreakoutStocks] = useState<BreakoutStock[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchBreakoutStocks = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/analysis/breakouts`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch breakout stocks');
                }

                const data = await response.json();
                setBreakoutStocks(data.data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred');
            } finally {
                setLoading(false);
            }
        };

        fetchBreakoutStocks();
    }, []);

    const getTrendColor = (trend: string) => {
        switch (trend) {
            case 'Strong uptrend':
                return 'success';
            case 'Moderate uptrend':
                return 'info';
            case 'Downtrend':
                return 'error';
            default:
                return 'default';
        }
    };

    const getVolumeColor = (status: string) => {
        switch (status) {
            case 'Very High':
                return 'error';
            case 'High':
                return 'warning';
            case 'Above Average':
                return 'info';
            default:
                return 'default';
        }
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return <Alert severity="error">{error}</Alert>;
    }

    return (
        <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
                Potential Breakout Stocks
            </Typography>
            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Symbol</TableCell>
                            <TableCell align="right">Price</TableCell>
                            <TableCell align="right">Change %</TableCell>
                            <TableCell align="right">SMA 20</TableCell>
                            <TableCell align="right">SMA 50</TableCell>
                            <TableCell>Trend</TableCell>
                            <TableCell>Volume</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {breakoutStocks.map((stock) => (
                            <TableRow key={stock.stockSymbol}>
                                <TableCell component="th" scope="row">
                                    {stock.stockSymbol}
                                </TableCell>
                                <TableCell align="right">
                                    ${stock.closePrice.toFixed(2)}
                                </TableCell>
                                <TableCell align="right">
                                    <Typography
                                        color={stock.price_change_pct >= 0 ? 'success.main' : 'error.main'}
                                    >
                                        {stock.price_change_pct.toFixed(2)}%
                                    </Typography>
                                </TableCell>
                                <TableCell align="right">
                                    ${stock.sma_20.toFixed(2)}
                                </TableCell>
                                <TableCell align="right">
                                    ${stock.sma_50.toFixed(2)}
                                </TableCell>
                                <TableCell>
                                    <Chip
                                        label={stock.trend_status}
                                        color={getTrendColor(stock.trend_status) as any}
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell>
                                    <Chip
                                        label={stock.volume_status}
                                        color={getVolumeColor(stock.volume_status) as any}
                                        size="small"
                                    />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Paper>
    );
};

export default BreakoutAnalysis;
