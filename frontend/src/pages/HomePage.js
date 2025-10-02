import React from 'react';
import { Box, Container, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import HomeBanner from '../components/HomeBanner';
import FeaturedDestinations from '../components/FeaturedDestinations';
import WhyChooseUs from '../components/WhyChooseUs';
import PromotionalBanners from '../components/PromotionalBanners';
import useHomepageDataLayer from '../hooks/useHomepageDataLayer';

const HomePage = () => {
  const navigate = useNavigate();
  // useHomepageDataLayer handles page view tracking
  useHomepageDataLayer();

  // Page view tracking is handled by useHomepageDataLayer hook

  console.log('🏠 HomePage rendered with data layer integration');

  const handleFeaturedDestinationClick = (destinationData) => {
    navigate('/search', {
      state: {
        destination: destinationData.destination,
        destinationCode: destinationData.destinationCode
      }
    });
  };

  const handlePromotionalBannerClick = (bannerData) => {
    // Tracking is handled globally by GlobalClickTracker
    if (bannerData.destinationUrl) {
      navigate(bannerData.destinationUrl);
    }
  };

  const handleWhyChooseUsClick = (feature) => {
    // Tracking is handled globally by GlobalClickTracker
    console.log('Why Choose Us feature clicked:', feature);
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
              data-button-name="newsletter-signup"
              data-section="newsletter"
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