import React from 'react';
import { Container, Grid, Typography } from '@mui/material';
import TradingSignals from '../components/TradingSignals';
import BreakoutAnalysis from '../components/BreakoutAnalysis';

const Analysis: React.FC = () => {
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
                    <TradingSignals />
                </Grid>
            </Grid>
        </Container>
    );
};

export default Analysis;
