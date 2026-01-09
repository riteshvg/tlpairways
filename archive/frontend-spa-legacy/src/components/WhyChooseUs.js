import React from 'react';
import { Box, Typography, Grid, Card, CardContent } from '@mui/material';
import {
  Star as StarIcon,
  Security as SecurityIcon,
  Speed as SpeedIcon,
  Support as SupportIcon
} from '@mui/icons-material';

const features = [
  {
    id: 'premium-service',
    icon: <StarIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
    title: 'Premium Service',
    description: 'Experience luxury and comfort with our premium service offerings and world-class amenities',
    stats: '99.8% Customer Satisfaction'
  },
  {
    id: 'best-prices',
    icon: <SpeedIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
    title: 'Best Prices',
    description: 'Get the best value for your money with our competitive pricing and exclusive deals',
    stats: 'Up to 40% Savings'
  },
  {
    id: 'safety-first',
    icon: <SecurityIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
    title: 'Safety First',
    description: 'Your safety is our top priority with state-of-the-art aircraft and certified pilots',
    stats: '100% Safety Record'
  },
  {
    id: '24-7-support',
    icon: <SupportIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
    title: '24/7 Support',
    description: 'Round-the-clock customer support to assist you with all your travel needs',
    stats: '24/7 Customer Care'
  }
];

const WhyChooseUs = ({ onFeatureClick }) => {
  const handleFeatureClick = (feature) => {
    onFeatureClick(feature.id, {
      featureTitle: feature.title,
      featureStats: feature.stats
    });
  };

  return (
    <Box>
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
        {features.map((feature) => (
          <Grid item xs={12} md={6} lg={3} key={feature.id}>
            <Card
              sx={{
                height: '100%',
                textAlign: 'center',
                p: 2,
                cursor: 'pointer',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 6px 20px rgba(0,0,0,0.1)'
                }
              }}
              onClick={() => handleFeatureClick(feature)}
            >
              <CardContent>
                <Box sx={{ mb: 3 }}>
                  {feature.icon}
                </Box>
                <Typography
                  variant="h5"
                  gutterBottom
                  sx={{
                    fontFamily: 'Garamond, serif',
                    fontWeight: 600,
                    color: 'text.primary'
                  }}
                >
                  {feature.title}
                </Typography>
                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{ mb: 2, minHeight: '60px' }}
                >
                  {feature.description}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: 'primary.main',
                    fontWeight: 600,
                    fontSize: '0.9rem'
                  }}
                >
                  {feature.stats}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default WhyChooseUs;