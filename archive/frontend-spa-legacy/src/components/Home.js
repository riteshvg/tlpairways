import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Button,
  Box,
  Paper,
  Grid,
} from '@mui/material';
import { FlightTakeoff, FlightLand, Search } from '@mui/icons-material';
import TargetContentSlot from './TargetContentSlot';
import { syncTargetForView, ensureTargetPageParamsCallback } from '../utils/adobeTargetUtils';

const Home = () => {
  const navigate = useNavigate();

  useEffect(() => {
    ensureTargetPageParamsCallback();

    const locale = typeof navigator !== 'undefined' ? navigator.language : 'en-US';

    syncTargetForView(
      'home',
      {
        pageName: 'home',
        pageType: 'landing',
        siteSection: 'homepage',
        language: locale,
      },
      {
        pageName: 'home',
        siteSection: 'homepage',
        language: locale,
      }
    );
  }, []);

  return (
    <Container maxWidth="xl">
      {/* Hero Section */}
      <Box
        sx={{
          position: 'relative',
          height: '60vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundImage: 'url(https://images.unsplash.com/photo-1436491865332-7a61a109cc05?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2074&q=80)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
          },
        }}
      >
        <Box sx={{ position: 'relative', textAlign: 'center', color: 'white' }}>
          <Typography variant="h2" component="h1" gutterBottom>
            Book Your Next Adventure
          </Typography>
          <Typography variant="h5" gutterBottom>
            Find and book flights to destinations around the world
          </Typography>
          <Button
            variant="contained"
            size="large"
            startIcon={<Search />}
            onClick={() => navigate('/search')}
            sx={{ mt: 4 }}
          >
            Search Flights
          </Button>
        </Box>
      </Box>

      <TargetContentSlot
        id="target-home-hero"
        region="home-hero-offer"
        sx={{ mt: 4 }}
      />

      {/* Features Section */}
      <Box sx={{ py: 8 }}>
        <Typography variant="h3" component="h2" textAlign="center" gutterBottom>
          Why Choose Us
        </Typography>
        <Grid container spacing={4} sx={{ mt: 4 }}>
          <Grid item xs={12} md={4}>
            <Paper elevation={3} sx={{ p: 4, height: '100%' }}>
              <Box sx={{ textAlign: 'center' }}>
                <FlightTakeoff sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                <Typography variant="h5" gutterBottom>
                  Best Flight Deals
                </Typography>
                <Typography color="text.secondary">
                  Find the most competitive prices for your journey with our extensive network of airlines
                </Typography>
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper elevation={3} sx={{ p: 4, height: '100%' }}>
              <Box sx={{ textAlign: 'center' }}>
                <FlightLand sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                <Typography variant="h5" gutterBottom>
                  Global Coverage
                </Typography>
                <Typography color="text.secondary">
                  Access flights to and from major cities worldwide with multiple airline options
                </Typography>
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper elevation={3} sx={{ p: 4, height: '100%' }}>
              <Box sx={{ textAlign: 'center' }}>
                <Search sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                <Typography variant="h5" gutterBottom>
                  Easy Booking
                </Typography>
                <Typography color="text.secondary">
                  Simple and intuitive booking process with instant confirmation
                </Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      <TargetContentSlot
        id="target-home-midpage"
        region="home-midpage-offer"
        sx={{ my: 4 }}
      />

      {/* Call to Action */}
      <Box sx={{ py: 8, textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom>
          Ready to Start Your Journey?
        </Typography>
        <Button
          variant="contained"
          size="large"
          onClick={() => navigate('/search')}
          sx={{ mt: 2 }}
        >
          Book Now
        </Button>
      </Box>
    </Container>
  );
};

export default Home; 