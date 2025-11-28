import React, { useState, useEffect } from 'react';
import usePageView from '../hooks/usePageView';
import {
  Container,
  Typography,
  Box,
  Paper,
  Divider,
  Button,
  Alert,
  Snackbar,
  TextField,
  Stack,
} from '@mui/material';
import {
  Code as CodeIcon,
  Save as SaveIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import {
  getCurrentAdobeScriptUrl,
  saveAdobeScriptUrl,
  resetToDefaultAdobeScript,
  validateAdobeScriptUrl,
  parseScriptInput,
} from '../utils/adobeScriptManager';

const ScriptManagerPage = () => {
  // Track page view
  usePageView({
    pageCategory: 'utility',
    sections: ['script-manager'],
  });

  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  // Adobe Script Management State
  const [adobeScriptUrl, setAdobeScriptUrl] = useState('');
  const [scriptValidation, setScriptValidation] = useState({ isValid: true, error: null });

  // Load current Adobe script URL on mount
  useEffect(() => {
    const currentUrl = getCurrentAdobeScriptUrl();
    setAdobeScriptUrl(currentUrl);
  }, []);

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Adobe Script Management Handlers
  const handleAdobeScriptChange = (event) => {
    const input = event.target.value;
    
    // Parse input to extract URL (handles both full script tags and URLs)
    const { src } = parseScriptInput(input);
    
    // Update with the extracted URL (or original input if not a script tag)
    const urlToDisplay = src || input;
    setAdobeScriptUrl(urlToDisplay);
    
    // Validate URL as user types
    const validation = validateAdobeScriptUrl(input);
    setScriptValidation(validation);
  };

  const handleSaveAdobeScript = () => {
    const validation = validateAdobeScriptUrl(adobeScriptUrl);
    
    if (!validation.isValid) {
      setSnackbar({
        open: true,
        message: `Invalid script URL: ${validation.error}`,
        severity: 'error',
      });
      return;
    }

    const success = saveAdobeScriptUrl(adobeScriptUrl);
    
    if (success) {
      setSnackbar({
        open: true,
        message: 'Adobe Launch script saved! Please reload the page for changes to take effect.',
        severity: 'success',
      });
    } else {
      setSnackbar({
        open: true,
        message: 'Failed to save Adobe Launch script. Please try again.',
        severity: 'error',
      });
    }
  };

  const handleResetAdobeScript = () => {
    const success = resetToDefaultAdobeScript();
    
    if (success) {
      const defaultUrl = getCurrentAdobeScriptUrl();
      setAdobeScriptUrl(defaultUrl);
      setScriptValidation({ isValid: true, error: null });
      
      setSnackbar({
        open: true,
        message: 'Reset to default Adobe Launch script! Please reload the page.',
        severity: 'info',
      });
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Script Manager
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your Adobe Experience Cloud data collection script
        </Typography>
      </Box>

      {/* Adobe Launch Script Manager */}
      <Paper 
        elevation={3} 
        sx={{ 
          p: 3, 
          border: '2px solid', 
          borderColor: 'primary.main',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <CodeIcon sx={{ mr: 1, fontSize: 32 }} />
          <Box>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 0 }}>
              Adobe Launch Script Manager
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Manage your Adobe Experience Cloud data collection script
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ mb: 3, borderColor: 'rgba(255,255,255,0.3)' }} />

        {/* Script URL Input */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 1, opacity: 0.9 }}>
            Adobe Launch Script:
          </Typography>
          <TextField
            fullWidth
            value={adobeScriptUrl}
            onChange={handleAdobeScriptChange}
            error={!scriptValidation.isValid}
            helperText={scriptValidation.error || 'Paste full script tag or just the URL'}
            placeholder='<script src="https://assets.adobedtm.com/..." async></script>'
            variant="outlined"
            size="small"
            sx={{
              backgroundColor: 'white',
              borderRadius: 1,
              '& .MuiOutlinedInput-root': {
                fontFamily: 'monospace',
                fontSize: '0.85rem',
              }
            }}
          />
        </Box>

        {/* Action Buttons */}
        <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSaveAdobeScript}
            disabled={!scriptValidation.isValid}
            sx={{
              backgroundColor: 'white',
              color: 'primary.main',
              '&:hover': { backgroundColor: 'rgba(255,255,255,0.9)' },
              '&:disabled': { backgroundColor: 'rgba(255,255,255,0.3)' }
            }}
          >
            Save Script
          </Button>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleResetAdobeScript}
            sx={{ 
              color: 'white',
              borderColor: 'white',
              '&:hover': { borderColor: 'white', backgroundColor: 'rgba(255,255,255,0.1)' }
            }}
          >
            Reset to Default
          </Button>
        </Stack>

        {/* Info Alert */}
        <Alert severity="info" sx={{ backgroundColor: 'rgba(255,255,255,0.95)' }}>
          <Typography variant="body2">
            <strong>Note:</strong> After saving, you must <strong>reload the page</strong> for the new script to take effect. 
            The Adobe Launch script loads during initial page load.
          </Typography>
        </Alert>
      </Paper>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ScriptManagerPage;

