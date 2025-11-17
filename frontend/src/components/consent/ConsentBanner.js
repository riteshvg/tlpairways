import React from 'react';
import {
  Box,
  Button,
  Stack,
  Typography,
  useMediaQuery
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useConsent } from '../../context/ConsentContext';

const bannerStyles = (isDesktop, theme) => ({
  position: 'fixed',
  bottom: 32,
  right: 32,
  width: isDesktop ? 420 : 'calc(100% - 32px)',
  maxWidth: 460,
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.text.primary,
  borderRadius: 0,
  padding: '20px 24px',
  boxShadow: '0 30px 70px rgba(0,0,0,0.2)',
  zIndex: 1300,
  border: `1px solid ${theme.palette.primary.main}1f`,
  transform: 'translateX(0)',
  transition: 'transform 0.35s ease, opacity 0.35s ease'
});

const ConsentBanner = () => {
  const {
    isBannerVisible,
    acceptAll,
    rejectAll,
    openManager
  } = useConsent();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));

  if (!isBannerVisible) {
    return null;
  }

  return (
    <Box sx={bannerStyles(isDesktop, theme)}>
      <Stack spacing={2.5}>
        <Typography variant="h6" fontWeight={600} color="text.primary">
          Customise Your Cookie Preferences
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
          This website stores or retrieves information on your browser using cookies. This information might include details about you, your preferences, or your device. Cookies help the website function properly and can help provide a more personalised experience tailored to you. We respect your right to privacy, and you can choose to opt out of cookies at any time, with the exception of 'Strictly Necessary Cookies.' Please be aware that blocking cookies may impact your experience on the site and services we are able to offer you. For more information, please refer to our{' '}
          <Typography 
            component="a" 
            href="/cookie-policy" 
            sx={{ color: theme.palette.error.main, textDecoration: 'underline', fontWeight: 500 }}
          >
            Cookie Policy.
          </Typography>
        </Typography>

        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1.5}
          justifyContent="flex-start"
        >
          <Button
            id="consent-banner-accept-all"
            variant="contained"
            onClick={acceptAll}
            sx={{
              backgroundColor: theme.palette.error.main,
              color: '#fff',
              textTransform: 'none',
              fontWeight: 600,
              px: 3,
              '&:hover': { backgroundColor: theme.palette.error.dark }
            }}
          >
            Accept All
          </Button>
          
          <Button
            id="consent-banner-manage-preferences"
            variant="outlined"
            onClick={openManager}
            sx={{
              borderColor: theme.palette.error.main,
              color: theme.palette.error.main,
              textTransform: 'none',
              fontWeight: 600,
              px: 3,
              '&:hover': { 
                borderColor: theme.palette.error.dark,
                backgroundColor: `${theme.palette.error.main}0a` 
              }
            }}
          >
            Manage Consent Preferences
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
};

export default ConsentBanner;

