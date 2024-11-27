import React, { useState } from 'react';
import { 
    Container, 
    Grid, 
    Typography, 
    TextField, 
    Box 
} from '@mui/material';
import TradingSignals from '../components/TradingSignals';
import BreakoutAnalysis from '../components/BreakoutAnalysis';

const Analysis: React.FC = () => {
    const [selectedTicker, setSelectedTicker] = useState<string>('');

    return (
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" gutterBottom>
                Technical Analysis
            </Typography>
            
            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <BreakoutAnalysis />
                </Grid>
                
                <Grid item xs={12}>
                    <Box sx={{ mb: 3 }}>
                        <TextField
                            label="Enter Stock Symbol"
                            value={selectedTicker}
                            onChange={(e) => setSelectedTicker(e.target.value.toUpperCase())}
                            placeholder="e.g., AAPL"
                            size="small"
                            sx={{ width: 200 }}
                        />
                    </Box>
                    {selectedTicker && <TradingSignals ticker={selectedTicker} />}
                </Grid>
            </Grid>
        </Container>
    );
};

export default Analysis;
