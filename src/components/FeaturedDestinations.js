import React from 'react';
import { Grid, Card, CardMedia, CardContent, Typography, Button, Box } from '@mui/material';
import { FlightTakeoffIcon } from '@mui/icons-material/FlightTakeoff';

const featuredDestinations = [
  {
    id: 1,
    destination: 'Dubai',
    destinationCode: 'DXB',
    image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    price: 'From ₹25,000',
    description: 'Experience luxury and modern architecture',
    duration: '3h 45m'
  },
  {
    id: 2,
    destination: 'Singapore',
    destinationCode: 'SIN',
    image: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    price: 'From ₹18,000',
    description: 'The Lion City awaits your adventure',
    duration: '5h 20m'
  },
  {
    id: 3,
    destination: 'Bangkok',
    destinationCode: 'BKK',
    image: 'https://images.unsplash.com/photo-1563492065-1a71ac7b5f24?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    price: 'From ₹15,000',
    description: 'Vibrant culture and amazing street food',
    duration: '3h 15m'
  },
  {
    id: 4,
    destination: 'Maldives',
    destinationCode: 'MLE',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    price: 'From ₹35,000',
    description: 'Paradise islands and crystal clear waters',
    duration: '2h 30m'
  }
];

const FeaturedDestinations = ({ onDestinationClick }) => {
  const handleDestinationClick = (destination) => {
    onDestinationClick({
      destination: destination.destination,
      destinationCode: destination.destinationCode,
      price: destination.price,
      duration: destination.duration,
      featuredPosition: destination.id
    });
  };

  return (
    <Grid container spacing={4}>
      {featuredDestinations.map((destination) => (
        <Grid item xs={12} sm={6} md={3} key={destination.id}>
          <Card
            sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              cursor: 'pointer',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              '&:hover': {
                transform: 'translateY(-8px)',
                boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
              }
            }}
            onClick={() => handleDestinationClick(destination)}
          >
            <CardMedia
              component="img"
              height="200"
              image={destination.image}
              alt={destination.destination}
              sx={{
                objectFit: 'cover'
              }}
            />
            <CardContent sx={{ flexGrow: 1, p: 3 }}>
              <Typography
                variant="h6"
                component="h3"
                gutterBottom
                sx={{
                  fontFamily: 'Garamond, serif',
                  fontWeight: 600,
                  color: 'primary.main'
                }}
              >
                {destination.destination}
              </Typography>
              
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: 2, minHeight: '40px' }}
              >
                {destination.description}
              </Typography>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography
                  variant="h6"
                  sx={{
                    color: 'primary.main',
                    fontWeight: 600
                  }}
                >
                  {destination.price}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  {destination.duration}
                </Typography>
              </Box>
              
              <Button
                variant="outlined"
                size="small"
                startIcon={<FlightTakeoffIcon />}
                sx={{
                  width: '100%',
                  borderColor: 'primary.main',
                  color: 'primary.main',
                  '&:hover': {
                    borderColor: 'primary.dark',
                    backgroundColor: 'primary.light',
                    color: 'primary.dark'
                  }
                }}
              >
                Book Now
              </Button>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default FeaturedDestinations;