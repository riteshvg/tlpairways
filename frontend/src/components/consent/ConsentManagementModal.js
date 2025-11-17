import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  Stack,
  Switch,
  Typography
} from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import { useConsent, CONSENT_CATEGORIES } from '../../context/ConsentContext';

const ConsentManagementModal = () => {
  const {
    isModalOpen,
    closeManager,
    preferences,
    saveGranularPreferences,
    acceptAll,
    rejectAll
  } = useConsent();
  const [draftPreferences, setDraftPreferences] = useState(preferences);

  useEffect(() => {
    if (isModalOpen) {
      setDraftPreferences(preferences);
    }
  }, [isModalOpen, preferences]);

  const handleToggle = (categoryId) => (event) => {
    const { checked } = event.target;
    setDraftPreferences((prev) => ({
      ...prev,
      [categoryId]: checked
    }));
  };

  const handleSave = () => {
    saveGranularPreferences(draftPreferences, {
      source: 'consentModal',
      method: 'granular'
    });
  };

  const handleClose = () => {
    closeManager();
  };

  return (
    <Dialog
      open={isModalOpen}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      aria-labelledby="consent-management-dialog"
      PaperProps={{
        sx: {
          borderRadius: 0,
          border: (theme) => `1px solid ${theme.palette.divider}`
        }
      }}
    >
      <DialogTitle 
        id="consent-management-dialog" 
        sx={{ 
          pb: 1,
          fontWeight: 600,
          fontSize: '1.25rem'
        }}
      >
        Customise Your Cookie Preferences
      </DialogTitle>
      <DialogContent dividers sx={{ borderTop: 'none', borderBottom: 'none' }}>
        <Stack spacing={3}>
          <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
            This website stores or retrieves information on your browser using cookies. This information might include details about you, your preferences, or your device. Cookies help the website function properly and can help provide a more personalised experience tailored to you. We respect your right to privacy, and you can choose to opt out of cookies at any time, with the exception of 'Strictly Necessary Cookies.' Please be aware that blocking cookies may impact your experience on the site and services we are able to offer you. For more information, please refer to our{' '}
            <Typography 
              component="a" 
              href="/cookie-policy" 
              sx={{ color: 'error.main', textDecoration: 'underline', fontWeight: 500 }}
            >
              Cookie Policy.
            </Typography>
          </Typography>

          <Divider />

          <Typography variant="h6" fontWeight={600}>
            Manage Consent Preferences
          </Typography>

          {CONSENT_CATEGORIES.map((category) => {
            const isLocked = category.required;
            const checked = draftPreferences[category.id];

            return (
              <Box key={category.id}>
                <Stack 
                  direction="row" 
                  justifyContent="space-between" 
                  alignItems="flex-start" 
                  spacing={2}
                  sx={{ 
                    py: 1.5,
                    borderBottom: '1px solid',
                    borderColor: 'divider'
                  }}
                >
                  <Box sx={{ flex: 1, cursor: 'pointer' }}>
                    <Typography 
                      variant="subtitle1" 
                      fontWeight={600} 
                      display="flex" 
                      alignItems="center" 
                      gap={1}
                      sx={{ mb: 0.5 }}
                    >
                      {isLocked && <LockIcon fontSize="small" color="action" />}
                      {category.label}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {category.description}
                    </Typography>
                  </Box>
                  <FormControlLabel
                    control={
                      <Switch
                        id={`consent-switch-${category.id}`}
                        color="error"
                        checked={checked}
                        onChange={handleToggle(category.id)}
                        disabled={isLocked}
                        inputProps={{ 'aria-label': `${category.label} toggle` }}
                      />
                    }
                    label=""
                    sx={{ marginRight: 0, marginLeft: 2 }}
                  />
                </Stack>
              </Box>
            );
          })}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'flex-end', px: 3, py: 2.5, gap: 1.5 }}>
        <Button
          id="consent-modal-save-settings"
          variant="outlined"
          onClick={handleSave}
          disabled={!isModalOpen}
          sx={{
            borderColor: 'error.main',
            color: 'error.main',
            textTransform: 'none',
            fontWeight: 600,
            px: 3,
            '&:hover': { 
              borderColor: 'error.dark',
              backgroundColor: (theme) => `${theme.palette.error.main}0a` 
            }
          }}
        >
          Save Settings
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConsentManagementModal;

