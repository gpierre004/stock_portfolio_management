import { useState, useEffect } from 'react';
import { Container, Typography, Box, CircularProgress, Alert, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { watchlistService } from '../services/watchlistService';
import WatchlistGrid from '../components/WatchlistGrid';
import { WatchlistItem } from '../types/watchlist';

const Watchlist = () => {
  const [watchlistItems, setWatchlistItems] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [newTicker, setNewTicker] = useState('');
  const [reason, setReason] = useState('');

  const fetchWatchlist = async () => {
    try {
      setLoading(true);
      const data = await watchlistService.getWatchlist();
      setWatchlistItems(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch watchlist. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWatchlist();
  }, []);

  const handleAddToWatchlist = async () => {
    if (!newTicker.trim()) return;

    try {
      await watchlistService.addToWatchlist(newTicker.toUpperCase(), reason);
      await fetchWatchlist();
      setOpenAddDialog(false);
      setNewTicker('');
      setReason('');
    } catch (err) {
      setError('Failed to add stock to watchlist. Please try again.');
    }
  };

  const handleRemoveFromWatchlist = async (id: number) => {
    try {
      await watchlistService.removeFromWatchlist(id);
      await fetchWatchlist();
    } catch (err) {
      setError('Failed to remove stock from watchlist. Please try again.');
    }
  };

  const handleToggleInterested = async (id: number, interested: boolean) => {
    try {
      await watchlistService.updateWatchlistItem(id, { interested });
      setWatchlistItems(items =>
        items.map(item =>
          item.id === id ? { ...item, interested } : item
        )
      );
    } catch (err) {
      setError('Failed to update watchlist item. Please try again.');
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl">
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4} mt={3}>
        <Typography variant="h4" component="h1">
          Watchlist
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => setOpenAddDialog(true)}
        >
          Add Stock
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <WatchlistGrid 
        items={watchlistItems}
        onRemoveItem={handleRemoveFromWatchlist}
        onToggleInterested={handleToggleInterested}
      />

      <Dialog open={openAddDialog} onClose={() => setOpenAddDialog(false)}>
        <DialogTitle>Add Stock to Watchlist</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Ticker Symbol"
            fullWidth
            value={newTicker}
            onChange={(e) => setNewTicker(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Reason (Optional)"
            fullWidth
            multiline
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddDialog(false)}>Cancel</Button>
          <Button onClick={handleAddToWatchlist} variant="contained" color="primary">
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Watchlist;
