import { Card, CardContent, Typography, Box, Chip, Tooltip } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import { format } from 'date-fns';
import { WatchlistItem } from '../types/watchlist';

interface WatchlistCardProps {
  item: WatchlistItem;
}

const WatchlistCard = ({ item }: WatchlistCardProps) => {
  const priceChangePercent = ((item.currentPrice - item.priceWhenAdded) / item.priceWhenAdded) * 100;
  const isPriceUp = priceChangePercent > 0;

  return (
    <Card 
      sx={{ 
        minWidth: 300,
        maxWidth: 400,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.2s',
        '&:hover': {
          transform: 'scale(1.02)',
          boxShadow: 3,
        },
      }}
    >
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h5" component="div" fontWeight="bold">
            {item.ticker}
          </Typography>
          <Chip 
            label={item.sector}
            size="small"
            color="primary"
            sx={{ borderRadius: 1 }}
          />
        </Box>

        <Box display="flex" alignItems="center" mb={2}>
          <Typography variant="h6" component="div">
            ${item.currentPrice.toFixed(2)}
          </Typography>
          <Box display="flex" alignItems="center" ml={1}>
            {isPriceUp ? (
              <TrendingUpIcon color="success" />
            ) : (
              <TrendingDownIcon color="error" />
            )}
            <Typography 
              variant="body2" 
              color={isPriceUp ? 'success.main' : 'error.main'}
              ml={0.5}
            >
              {priceChangePercent.toFixed(2)}%
            </Typography>
          </Box>
        </Box>

        <Box mb={2}>
          <Typography variant="body2" color="text.secondary">
            52W High: ${item.weekHigh52.toFixed(2)}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Below 52W High: {item.percentBelow52WeekHigh.toFixed(2)}%
          </Typography>
        </Box>

        <Box mb={2}>
          {item.industry && (
            <Typography variant="body2" color="text.secondary">
              Industry: {item.industry}
            </Typography>
          )}
          <Typography variant="body2" color="text.secondary">
            Added: {format(new Date(item.date_added), 'MMM dd, yyyy')}
          </Typography>
        </Box>

        {item.reason && (
          <Tooltip title={item.reason}>
            <Typography 
              variant="body2" 
              color="text.secondary"
              sx={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
              }}
            >
              Reason: {item.reason}
            </Typography>
          </Tooltip>
        )}

        {item.metrics && (
          <Box mt={2}>
            <Typography variant="body2" fontWeight="bold">
              Key Metrics:
            </Typography>
            <Box display="flex" flexWrap="wrap" gap={1} mt={1}>
              {Object.entries(item.metrics).map(([key, value]) => (
                <Chip
                  key={key}
                  label={`${key}: ${value}`}
                  size="small"
                  variant="outlined"
                  sx={{ borderRadius: 1 }}
                />
              ))}
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default WatchlistCard;
