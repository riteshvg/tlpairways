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
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ReplayIcon from '@mui/icons-material/Replay';
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
    >
      <DialogTitle id="consent-management-dialog">
        Privacy & Cookie Preferences
      </DialogTitle>
      <DialogContent dividers>
        <Stack spacing={3}>
          {CONSENT_CATEGORIES.map((category) => {
            const isLocked = category.required;
            const checked = draftPreferences[category.id];

            return (
              <Box
                key={category.id}
                sx={{
                  border: '1px solid',
                  borderColor: checked ? 'success.light' : 'divider',
                  borderRadius: 2,
                  padding: 2,
                  backgroundColor: checked ? 'success.50' : 'background.paper'
                }}
              >
                <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
                  <Box>
                    <Typography variant="subtitle1" fontWeight={600} display="flex" alignItems="center" gap={1}>
                      {checked ? (
                        <CheckCircleOutlineIcon color="success" fontSize="small" />
                      ) : (
                        isLocked ? <LockIcon fontSize="small" color="action" /> : null
                      )}
                      {category.label}
                      {isLocked && (
                        <Typography component="span" variant="caption" color="text.secondary">
                          (Always on)
                        </Typography>
                      )}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      {category.description}
                    </Typography>
                  </Box>
                  <FormControlLabel
                    control={
                      <Switch
                        color="success"
                        checked={checked}
                        onChange={handleToggle(category.id)}
                        disabled={isLocked}
                        inputProps={{ 'aria-label': `${category.label} toggle` }}
                      />
                    }
                    label=""
                    sx={{ marginRight: 0 }}
                  />
                </Stack>
              </Box>
            );
          })}

          <Divider />

          <Stack spacing={1}>
            <Typography variant="subtitle2">
              What happens if I disable personalization & analytics?
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Adobe Target experiences, destination trivia, ancillary upsells, and performance insights rely on these categories.
              Disabling them keeps core booking features intact but removes tailored offers and diagnostics.
            </Typography>
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'space-between', px: 3, py: 2 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
          <Button
            variant="outlined"
            color="inherit"
            startIcon={<ReplayIcon />}
            onClick={() => setDraftPreferences(preferences)}
          >
            Reset changes
          </Button>
        </Stack>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
          <Button color="inherit" onClick={rejectAll}>
            Reject optional
          </Button>
          <Button onClick={acceptAll}>Accept all</Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={!isModalOpen}
          >
            Save preferences
          </Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
};

export default ConsentManagementModal;

