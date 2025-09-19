import React from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  useTheme,
} from '@mui/material';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import SecurityIcon from '@mui/icons-material/Security';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';

const services = [
  {
    id: 1,
    title: 'Premium Experience',
    description: 'Enjoy luxury amenities and exceptional service throughout your journey',
    icon: FlightTakeoffIcon,
  },
  {
    id: 2,
    title: 'Safe & Secure',
    description: 'Your safety is our top priority with state-of-the-art security measures',
    icon: SecurityIcon,
  },
  {
    id: 3,
    title: '24/7 Support',
    description: 'Round-the-clock customer support to assist you at every step',
    icon: SupportAgentIcon,
  },
  {
    id: 4,
    title: 'Best Deals',
    description: 'Exclusive offers and competitive prices for every destination',
    icon: LocalOfferIcon,
  },
];

const WhyChooseUs = () => {
  const theme = useTheme();

  return (
    <Box sx={{ py: 8, backgroundColor: 'background.paper' }}>
      <Container maxWidth="xl">
        <Typography
          variant="h2"
          align="center"
          sx={{ mb: 6, color: 'text.primary' }}
        >
          Why Choose Us
        </Typography>
        <Grid container spacing={4}>
          {services.map((service) => (
            <Grid item xs={12} sm={6} md={3} key={service.id}>
              <Paper
                elevation={0}
                sx={{
                  p: 4,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  backgroundColor: 'background.default',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                  },
                }}
              >
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    backgroundColor: 'primary.main',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 3,
                  }}
                >
                  <service.icon
                    sx={{
                      fontSize: 40,
                      color: 'white',
                    }}
                  />
                </Box>
                <Typography
                  variant="h5"
                  component="h3"
                  gutterBottom
                  sx={{
                    fontFamily: 'Playfair Display',
                    fontWeight: 600,
                  }}
                >
                  {service.title}
                </Typography>
                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{ mt: 1 }}
                >
                  {service.description}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default WhyChooseUs; 