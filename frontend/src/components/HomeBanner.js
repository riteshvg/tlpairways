import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  IconButton,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';

const destinations = [
  {
    id: 1,
    name: 'Paris',
    image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
    tagline: 'The City of Lights Awaits',
    description: 'Experience the romance and charm of the French capital',
  },
  {
    id: 2,
    name: 'Kyoto',
    image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
    tagline: 'Where Tradition Meets Tranquility',
    description: 'Discover the ancient heart of Japan',
  },
  {
    id: 3,
    name: 'Jaipur',
    image: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
    tagline: 'The Pink City Beckons',
    description: 'Immerse yourself in the royal heritage of Rajasthan',
  },
  {
    id: 4,
    name: 'Rome',
    image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
    tagline: 'Eternal City, Timeless Beauty',
    description: 'Walk through the pages of history',
  },
];

const HomeBanner = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      handleNextSlide();
    }, 6000); // Change slide every 6 seconds

    return () => clearInterval(timer);
  }, [currentSlide]);

  const handleNextSlide = () => {
    setIsTransitioning(true);
    setCurrentSlide((prev) => (prev === destinations.length - 1 ? 0 : prev + 1));
    setTimeout(() => setIsTransitioning(false), 500); // Match transition duration
  };

  const handlePrevSlide = () => {
    setIsTransitioning(true);
    setCurrentSlide((prev) => (prev === 0 ? destinations.length - 1 : prev - 1));
    setTimeout(() => setIsTransitioning(false), 500);
  };

  const handleDotClick = (index) => {
    if (index !== currentSlide) {
      setIsTransitioning(true);
      setCurrentSlide(index);
      setTimeout(() => setIsTransitioning(false), 500);
    }
  };

  const handleExploreFlights = () => {
    navigate('/search', {
      state: {
        destination: destinations[currentSlide].name,
      },
    });
  };

  return (
    <Box
      sx={{
        position: 'relative',
        height: '90vh',
        overflow: 'hidden',
        backgroundColor: 'black',
      }}
    >
      {/* Background Image */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `url(${destinations[currentSlide].image})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          transition: 'opacity 0.5s ease-in-out',
          opacity: isTransitioning ? 0.7 : 1,
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.6) 100%)',
          },
        }}
      />

      {/* Navigation Arrows */}
      <IconButton
        onClick={handlePrevSlide}
        sx={{
          position: 'absolute',
          left: 20,
          top: '50%',
          transform: 'translateY(-50%)',
          color: 'white',
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          '&:hover': {
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
          },
          zIndex: 2,
        }}
      >
        <ArrowBackIosNewIcon />
      </IconButton>
      <IconButton
        onClick={handleNextSlide}
        sx={{
          position: 'absolute',
          right: 20,
          top: '50%',
          transform: 'translateY(-50%)',
          color: 'white',
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          '&:hover': {
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
          },
          zIndex: 2,
        }}
      >
        <ArrowForwardIosIcon />
      </IconButton>

      {/* Content */}
      <Container maxWidth="xl" sx={{ position: 'relative', height: '100%', zIndex: 1 }}>
        <Box
          sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            textAlign: 'center',
            color: 'white',
          }}
        >
          <Typography
            variant="h1"
            sx={{
              fontFamily: 'Garamond, serif',
              fontWeight: 700,
              mb: 2,
              fontSize: { xs: '2.5rem', md: '4rem' },
              textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
              opacity: isTransitioning ? 0.7 : 1,
              transition: 'opacity 0.5s ease-in-out',
            }}
          >
            {destinations[currentSlide].name}
          </Typography>
          <Typography
            variant="h4"
            sx={{
              mb: 2,
              fontWeight: 400,
              fontSize: { xs: '1.25rem', md: '2rem' },
              textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
              opacity: isTransitioning ? 0.7 : 1,
              transition: 'opacity 0.5s ease-in-out',
            }}
          >
            {destinations[currentSlide].tagline}
          </Typography>
          <Typography
            variant="h6"
            sx={{
              mb: 4,
              fontWeight: 300,
              fontSize: { xs: '1rem', md: '1.25rem' },
              maxWidth: '800px',
              textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
              opacity: isTransitioning ? 0.7 : 1,
              transition: 'opacity 0.5s ease-in-out',
            }}
          >
            {destinations[currentSlide].description}
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={handleExploreFlights}
            startIcon={<FlightTakeoffIcon />}
            sx={{
              py: 2,
              px: 6,
              fontSize: '1.2rem',
              backgroundColor: 'primary.main',
              color: 'white',
              '&:hover': {
                backgroundColor: 'primary.dark',
                transform: 'scale(1.05)',
              },
              transition: 'all 0.3s ease',
              opacity: isTransitioning ? 0.7 : 1,
            }}
          >
            Explore Flights
          </Button>
        </Box>
      </Container>

      {/* Navigation Dots */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 20,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: 1,
          zIndex: 2,
        }}
      >
        {destinations.map((_, index) => (
          <Box
            key={index}
            onClick={() => handleDotClick(index)}
            sx={{
              width: 12,
              height: 12,
              borderRadius: '50%',
              backgroundColor: currentSlide === index ? 'white' : 'rgba(255,255,255,0.5)',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              '&:hover': {
                backgroundColor: 'white',
              },
            }}
          />
        ))}
      </Box>
    </Box>
  );
};

export default HomeBanner; 