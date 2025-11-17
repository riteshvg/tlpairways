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
  maxWidth: 400,
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.text.primary,
  borderRadius: 2,
  padding: '20px 24px',
  boxShadow: '0px 8px 16px rgba(0, 105, 92, 0.15)',
  zIndex: 1300,
  border: `1px solid ${theme.palette.primary.light}40`,
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
      <Stack spacing={2}>
        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
          This website stores or retrieves information on your browser using cookies.
        </Typography>

        <Stack
          direction="column"
          spacing={1.5}
        >
          <Button
            id="consent-banner-accept-all"
            variant="contained"
            color="primary"
            onClick={acceptAll}
            fullWidth
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              py: 1.25,
              '&:hover': { 
                backgroundColor: theme.palette.primary.dark,
                boxShadow: '0px 4px 8px rgba(0, 105, 92, 0.2)'
              }
            }}
          >
            Accept All
          </Button>
          
          <Button
            id="consent-banner-reject-all"
            variant="outlined"
            color="error"
            onClick={rejectAll}
            fullWidth
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              py: 1.25,
              borderWidth: 2,
              '&:hover': { 
                borderWidth: 2,
                backgroundColor: `${theme.palette.error.main}0a` 
              }
            }}
          >
            Reject All
          </Button>
          
          <Button
            id="consent-banner-manage-preferences"
            variant="outlined"
            color="primary"
            onClick={openManager}
            fullWidth
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              py: 1.25,
              borderWidth: 2,
              '&:hover': { 
                borderWidth: 2,
                backgroundColor: `${theme.palette.primary.main}0a` 
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

