import React from 'react';
import { Box, Grid, Card, CardContent, Typography, Button, Chip } from '@mui/material';
import {
  FlightTakeoff as FlightTakeoffIcon,
  LocalOffer as OfferIcon,
  Timer as TimerIcon
} from '@mui/icons-material';

const promotionalBanners = [
  {
    id: 'summer-sale',
    title: 'Summer Sale',
    offer: 'Up to 50% Off',
    description: 'Book your summer getaway now and save big on international flights',
    category: 'seasonal-offer',
    validUntil: '2024-08-31',
    destination: 'All International Routes',
    backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    textColor: 'white',
    ctaText: 'Book Now',
    ctaDestination: 'search-page'
  },
  {
    id: 'business-class',
    title: 'Business Class Upgrade',
    offer: 'Free Upgrade',
    description: 'Book economy and get a free upgrade to business class on select routes',
    category: 'service-upgrade',
    validUntil: '2024-07-31',
    destination: 'Europe & Asia',
    backgroundColor: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    textColor: 'white',
    ctaText: 'Upgrade Now',
    ctaDestination: 'search-page'
  },
  {
    id: 'early-bird',
    title: 'Early Bird Special',
    offer: '30% Off',
    description: 'Book 60 days in advance and enjoy exclusive early bird discounts',
    category: 'advance-booking',
    validUntil: '2024-12-31',
    destination: 'All Destinations',
    backgroundColor: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    textColor: 'white',
    ctaText: 'Book Early',
    ctaDestination: 'search-page'
  }
];

const PromotionalBanners = ({ onBannerClick }) => {
  const handleBannerClick = (banner) => {
    onBannerClick({
      bannerId: banner.id,
      bannerTitle: banner.title,
      bannerOffer: banner.offer,
      bannerDestination: banner.destination,
      bannerPosition: promotionalBanners.indexOf(banner) + 1,
      bannerCategory: banner.category,
      ctaText: banner.ctaText,
      ctaDestination: banner.ctaDestination
    });
  };

  const formatValidUntil = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays > 0) {
      return `${diffDays} days left`;
    }
    return 'Expires soon';
  };

  return (
    <Grid container spacing={3}>
      {promotionalBanners.map((banner) => (
        <Grid item xs={12} md={4} key={banner.id}>
          <Card
            sx={{
              height: '100%',
              background: banner.backgroundColor,
              color: banner.textColor,
              cursor: 'pointer',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              '&:hover': {
                transform: 'scale(1.02)',
                boxShadow: '0 8px 25px rgba(0,0,0,0.2)'
              }
            }}
            onClick={() => handleBannerClick(banner)}
          >
            <CardContent sx={{ p: 4, height: '100%', display: 'flex', flexDirection: 'column' }}>
              {/* Header */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <OfferIcon sx={{ fontSize: 24 }} />
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}
                  >
                    {banner.title}
                  </Typography>
                </Box>
                <Chip
                  label={formatValidUntil(banner.validUntil)}
                  size="small"
                  sx={{
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    color: 'white',
                    fontSize: '0.75rem'
                  }}
                  icon={<TimerIcon sx={{ fontSize: 16 }} />}
                />
              </Box>

              {/* Offer */}
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  mb: 2,
                  textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                }}
              >
                {banner.offer}
              </Typography>

              {/* Description */}
              <Typography
                variant="body1"
                sx={{
                  mb: 2,
                  opacity: 0.9,
                  flexGrow: 1,
                  lineHeight: 1.6
                }}
              >
                {banner.description}
              </Typography>

              {/* Destination */}
              <Typography
                variant="body2"
                sx={{
                  mb: 3,
                  opacity: 0.8,
                  fontStyle: 'italic'
                }}
              >
                Valid for: {banner.destination}
              </Typography>

              {/* CTA Button */}
              <Button
                variant="contained"
                size="large"
                startIcon={<FlightTakeoffIcon />}
                data-button-name={banner.id}
                data-section="promotional-banners"
                data-target={banner.ctaDestination}
                sx={{
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  border: '1px solid rgba(255,255,255,0.3)',
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.3)',
                    transform: 'translateY(-2px)'
                  },
                  transition: 'all 0.3s ease',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}
              >
                {banner.ctaText}
              </Button>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default PromotionalBanners;
