import React from 'react';
import { Box, Container, Typography, Grid, Card, CardContent, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import HomeBanner from '../components/HomeBanner';
import FeaturedDestinations from '../components/FeaturedDestinations';
import WhyChooseUs from '../components/WhyChooseUs';
import PromotionalBanners from '../components/PromotionalBanners';
import useHomepageDataLayer from '../hooks/useHomepageDataLayer';

const HomePage = () => {
  const navigate = useNavigate();
  const {
    trackHomepageInteraction,
    trackNavigationInteraction,
    trackFeaturedDestinationClick,
    trackPromotionalBannerClick
  } = useHomepageDataLayer();

  console.log('🏠 HomePage rendered with data layer integration');

  const handleWhyChooseUsClick = (feature) => {
    trackHomepageInteraction('why-choose-us-click', {
      feature,
      section: 'why-choose-us'
    });
  };

  const handleNavigationClick = (destination) => {
    trackNavigationInteraction(destination);
    navigate(`/search?destination=${encodeURIComponent(destination)}`);
  };

  const handlePromotionalBannerClick = (bannerData) => {
    trackPromotionalBannerClick(bannerData);
  };

  const handleFeaturedDestinationClick = (destinationData) => {
    trackFeaturedDestinationClick(destinationData);
    navigate('/search', {
      state: {
        destination: destinationData.destination,
        destinationCode: destinationData.destinationCode
      }
    });
  };

  return (
    <Box>
      {/* Hero Banner with Data Layer Integration */}
      <HomeBanner />

      {/* Featured Destinations Section */}
      <Box sx={{ py: 8 }}>
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
            Featured Destinations
          </Typography>
          <FeaturedDestinations onDestinationClick={handleFeaturedDestinationClick} />
        </Container>
      </Box>

      {/* Promotional Banners */}
      <Box sx={{ py: 4, bgcolor: 'primary.light' }}>
        <Container maxWidth="xl">
          <PromotionalBanners onBannerClick={handlePromotionalBannerClick} />
        </Container>
      </Box>

      {/* Why Choose Us Section */}
      <Box sx={{ bgcolor: 'grey.100', py: 8 }}>
        <Container maxWidth="xl">
          <WhyChooseUs onFeatureClick={handleWhyChooseUsClick} />
        </Container>
      </Box>

      {/* Newsletter Signup Section */}
      <Box sx={{ py: 8, bgcolor: 'primary.main', color: 'white' }}>
        <Container maxWidth="md">
          <Box sx={{ textAlign: 'center' }}>
            <Typography
              variant="h4"
              gutterBottom
              sx={{
                fontFamily: 'Garamond, serif',
                fontWeight: 600,
                mb: 3
              }}
            >
              Stay Updated with TLP Airways
            </Typography>
            <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
              Get exclusive offers and travel updates delivered to your inbox
            </Typography>
            <Button
              variant="outlined"
              size="large"
              sx={{
                color: 'white',
                borderColor: 'white',
                px: 4,
                py: 1.5,
                '&:hover': {
                  borderColor: 'white',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)'
                }
              }}
              onClick={() => trackHomepageInteraction('newsletter-signup-click', {
                section: 'newsletter'
              })}
            >
              Subscribe to Newsletter
            </Button>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default HomePage; 