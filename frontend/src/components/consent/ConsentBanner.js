import React from 'react';
import {
  Box,
  Button,
  Chip,
  Divider,
  Stack,
  Typography,
  useMediaQuery
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import PrivacyTipIcon from '@mui/icons-material/PrivacyTip';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
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
      <Stack spacing={2}>
        <Typography variant="h6" fontWeight={600} color="text.primary">
          Set your cookies
        </Typography>

        <Typography variant="body2" color="text.secondary">
          We use cookies to keep booking secure, analyse traffic, and deliver personalized Adobe Target content.
          Click "Accept All" to allow every category or choose "Manage Cookies" to customize your preferences.
        </Typography>

        <Stack direction="row" spacing={1} flexWrap="wrap">
          {['Functional', 'Analytics', 'Personalization'].map(label => (
            <Chip
              key={label}
              size="small"
              label={label}
              variant="outlined"
              sx={{
                borderColor: theme.palette.primary.main,
                color: theme.palette.primary.dark,
                fontWeight: 500
              }}
            />
          ))}
        </Stack>

        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1.5}
          justifyContent="flex-end"
        >
          <Button
            variant="outlined"
            color="primary"
            onClick={openManager}
            startIcon={<ManageAccountsIcon />}
            sx={{
              borderColor: theme.palette.primary.main,
              color: theme.palette.primary.main,
              '&:hover': { borderColor: theme.palette.primary.dark, backgroundColor: `${theme.palette.primary.main}0a` }
            }}
          >
            Manage Cookies
          </Button>
          <Button
            variant="contained"
            onClick={acceptAll}
            startIcon={<PrivacyTipIcon />}
            sx={{
              backgroundColor: theme.palette.primary.main,
              '&:hover': { backgroundColor: theme.palette.primary.dark }
            }}
          >
            Accept All
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
};

export default ConsentBanner;

