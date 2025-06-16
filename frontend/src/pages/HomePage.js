import React from 'react';
import { Box, Container, Typography, Grid } from '@mui/material';
import HomeBanner from '../components/HomeBanner';

const HomePage = () => {
  return (
    <Box>
      {/* Hero Banner */}
      <HomeBanner />

      {/* Why Choose Us Section */}
      <Box sx={{ bgcolor: 'grey.100', py: 8 }}>
        <Container maxWidth="xl">
          <Typography
            variant="h3"
            sx={{
              textAlign: 'center',
              mb: 6,
              fontFamily: 'Garamond, serif',
              fontWeight: 600,
            }}
          >
            Why Choose TLP Airways?
          </Typography>
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center', p: 2 }}>
                <Typography variant="h5" gutterBottom sx={{ fontFamily: 'Garamond, serif' }}>
                  Premium Service
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Experience luxury and comfort with our premium service offerings
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center', p: 2 }}>
                <Typography variant="h5" gutterBottom sx={{ fontFamily: 'Garamond, serif' }}>
                  Best Prices
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Get the best value for your money with our competitive pricing
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center', p: 2 }}>
                <Typography variant="h5" gutterBottom sx={{ fontFamily: 'Garamond, serif' }}>
                  Safety First
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Your safety is our top priority with state-of-the-art aircraft
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default HomePage; 