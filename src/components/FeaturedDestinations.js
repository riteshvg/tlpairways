import React from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  useTheme,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

const destinations = [
  {
    id: 1,
    title: 'Maldives',
    description: 'Experience paradise with our exclusive beach resort packages',
    image: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?ixlib=rb-4.0.3',
    price: '₹25,999',
  },
  {
    id: 2,
    title: 'Dubai',
    description: 'Discover luxury shopping and desert adventures',
    image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?ixlib=rb-4.0.3',
    price: '₹32,999',
  },
  {
    id: 3,
    title: 'Bangkok',
    description: 'Immerse yourself in vibrant culture and street food',
    image: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?ixlib=rb-4.0.3',
    price: '₹18,999',
  },
];

const FeaturedDestinations = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  return (
    <Box sx={{ py: 8, backgroundColor: 'background.default' }}>
      <Container maxWidth="xl">
        <Typography
          variant="h2"
          align="center"
          sx={{ mb: 6, color: 'text.primary' }}
        >
          Featured Destinations
        </Typography>
        <Grid container spacing={4}>
          {destinations.map((destination) => (
            <Grid item xs={12} md={4} key={destination.id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                  },
                }}
              >
                <CardMedia
                  component="img"
                  height="240"
                  image={destination.image}
                  alt={destination.title}
                  sx={{
                    objectFit: 'cover',
                  }}
                />
                <CardContent sx={{ flexGrow: 1, p: 3 }}>
                  <Typography
                    variant="h5"
                    component="h3"
                    gutterBottom
                    sx={{
                      fontFamily: 'Playfair Display',
                      fontWeight: 600,
                    }}
                  >
                    {destination.title}
                  </Typography>
                  <Typography
                    variant="body1"
                    color="text.secondary"
                    paragraph
                    sx={{ mb: 3 }}
                  >
                    {destination.description}
                  </Typography>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      mt: 'auto',
                    }}
                  >
                    <Typography
                      variant="h6"
                      color="primary"
                      sx={{ fontWeight: 600 }}
                    >
                      From {destination.price}
                    </Typography>
                    <Button
                      variant="outlined"
                      color="primary"
                      onClick={() => navigate('/search')}
                      sx={{
                        borderWidth: 2,
                        '&:hover': {
                          borderWidth: 2,
                          backgroundColor: 'primary.main',
                          color: 'white',
                        },
                      }}
                    >
                      Book Now
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default FeaturedDestinations; 