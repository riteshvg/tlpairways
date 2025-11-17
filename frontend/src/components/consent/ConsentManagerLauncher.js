import React from 'react';
import { Fab, Tooltip, Zoom } from '@mui/material';
import PrivacyTipIcon from '@mui/icons-material/PrivacyTip';
import { useConsent } from '../../context/ConsentContext';

const fabStyles = {
  position: 'fixed',
  bottom: 24,
  left: 24,
  zIndex: 1250
};

const ConsentManagerLauncher = () => {
  const { openManager, isBannerVisible } = useConsent();

  return (
    <Zoom in={!isBannerVisible}>
      <Tooltip title="Privacy & cookie preferences" placement="right">
        <Fab
          id="consent-launcher-button"
          color="primary"
          aria-label="cookie preferences"
          onClick={openManager}
          sx={fabStyles}
          size="medium"
        >
          <PrivacyTipIcon />
        </Fab>
      </Tooltip>
    </Zoom>
  );
};

export default ConsentManagerLauncher;

