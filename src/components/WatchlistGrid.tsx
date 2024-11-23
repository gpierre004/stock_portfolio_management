import { Grid, Container, Typography } from '@mui/material';
import WatchlistCard from './WatchlistCard';
import { WatchlistItem } from '../types/watchlist';

interface WatchlistGridProps {
  items: WatchlistItem[];
  onRemoveItem: (id: number) => void;
  onToggleInterested: (id: number, interested: boolean) => void;
}

const WatchlistGrid = ({ items, onRemoveItem, onToggleInterested }: WatchlistGridProps) => {
  if (!items.length) {
    return (
      <Container>
        <Typography variant="h6" color="text.secondary" textAlign="center" mt={4}>
          No stocks in your watchlist. Start adding some!
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl">
      <Grid container spacing={3} padding={3}>
        {items.map((item) => (
          <Grid item key={item.id} xs={12} sm={6} md={4} lg={3}>
            <WatchlistCard 
              item={item} 
              onRemove={onRemoveItem}
              onToggleInterested={onToggleInterested}
            />
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default WatchlistGrid;
