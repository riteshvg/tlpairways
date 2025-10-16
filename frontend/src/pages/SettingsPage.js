import React, { useState, useEffect } from 'react';
import usePageView from '../hooks/usePageView';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Switch,
  FormControlLabel,
  Divider,
  Button,
  Alert,
  Snackbar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Card,
  CardContent,
  TextField,
  Chip,
  Stack,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Email as EmailIcon,
  Security as SecurityIcon,
  Language as LanguageIcon,
  Palette as PaletteIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Code as CodeIcon,
  Refresh as RefreshIcon,
  ContentCopy as ContentCopyIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  getCurrentAdobeScriptUrl,
  saveAdobeScriptUrl,
  resetToDefaultAdobeScript,
  validateAdobeScriptUrl,
  detectAdobeEnvironment,
  ADOBE_SCRIPT_PRESETS,
} from '../utils/adobeScriptManager';

const SettingsPage = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  // Track page view with settings-specific context
  usePageView({
    pageCategory: 'account',
    sections: ['notification-settings', 'privacy-settings', 'account-preferences'],
    userLoyaltyTier: user?.loyaltyTier || 'bronze'
  });
  
  const [settings, setSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    marketingEmails: true,
    flightUpdates: true,
    priceAlerts: false,
    darkMode: false,
    language: 'en',
    currency: 'INR',
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  // Adobe Script Management State
  const [adobeScriptUrl, setAdobeScriptUrl] = useState('');
  const [currentEnvironment, setCurrentEnvironment] = useState('development');
  const [scriptValidation, setScriptValidation] = useState({ isValid: true, error: null });
  const [copied, setCopied] = useState(false);

  // Load current Adobe script URL on mount
  useEffect(() => {
    const currentUrl = getCurrentAdobeScriptUrl();
    setAdobeScriptUrl(currentUrl);
    setCurrentEnvironment(detectAdobeEnvironment(currentUrl));
  }, []);

  if (!isAuthenticated || !user) {
    navigate('/login');
    return null;
  }

  const handleSettingChange = (setting) => (event) => {
    setSettings({
      ...settings,
      [setting]: event.target.checked,
    });
  };

  const handleSaveSettings = () => {
    // In a real app, this would save to your backend
    console.log('Saving settings:', settings);
    setSnackbar({
      open: true,
      message: 'Settings saved successfully!',
      severity: 'success',
    });
  };

  const handleDeleteAccount = () => {
    // In a real app, this would show a confirmation dialog
    setSnackbar({
      open: true,
      message: 'Account deletion feature coming soon!',
      severity: 'info',
    });
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Adobe Script Management Handlers
  const handleAdobeScriptChange = (event) => {
    const newUrl = event.target.value;
    setAdobeScriptUrl(newUrl);
    
    // Validate URL as user types
    const validation = validateAdobeScriptUrl(newUrl);
    setScriptValidation(validation);
    setCurrentEnvironment(detectAdobeEnvironment(newUrl));
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
      setCurrentEnvironment(detectAdobeEnvironment(defaultUrl));
      setScriptValidation({ isValid: true, error: null });
      
      setSnackbar({
        open: true,
        message: 'Reset to default Adobe Launch script! Please reload the page.',
        severity: 'info',
      });
    }
  };

  const handleSetPresetScript = (presetKey) => {
    const presetUrl = ADOBE_SCRIPT_PRESETS[presetKey];
    setAdobeScriptUrl(presetUrl);
    setCurrentEnvironment(presetKey);
    setScriptValidation({ isValid: true, error: null });
  };

  const handleCopyScriptUrl = () => {
    navigator.clipboard.writeText(adobeScriptUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Settings
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your account preferences and notifications
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Adobe Launch Script Manager - Top Section */}
        <Grid item xs={12}>
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

            {/* Current Environment Badge */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 1, opacity: 0.9 }}>
                Current Environment:
              </Typography>
              <Chip 
                label={currentEnvironment.toUpperCase()}
                color={
                  currentEnvironment === 'production' ? 'success' :
                  currentEnvironment === 'staging' ? 'warning' :
                  currentEnvironment === 'development' ? 'info' : 'default'
                }
                icon={<CheckCircleIcon />}
                sx={{ fontWeight: 600 }}
              />
            </Box>

            {/* Script URL Input */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 1, opacity: 0.9 }}>
                Adobe Launch Script URL:
              </Typography>
              <TextField
                fullWidth
                value={adobeScriptUrl}
                onChange={handleAdobeScriptChange}
                error={!scriptValidation.isValid}
                helperText={scriptValidation.error}
                placeholder="https://assets.adobedtm.com/..."
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
                InputProps={{
                  endAdornment: (
                    <Tooltip title={copied ? 'Copied!' : 'Copy URL'}>
                      <IconButton 
                        size="small" 
                        onClick={handleCopyScriptUrl}
                        sx={{ color: copied ? 'success.main' : 'inherit' }}
                      >
                        {copied ? <CheckCircleIcon /> : <ContentCopyIcon />}
                      </IconButton>
                    </Tooltip>
                  )
                }}
              />
            </Box>

            {/* Quick Presets */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 1, opacity: 0.9 }}>
                Quick Switch (Presets):
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                <Button
                  variant={currentEnvironment === 'development' ? 'contained' : 'outlined'}
                  size="small"
                  onClick={() => handleSetPresetScript('development')}
                  sx={{ 
                    color: currentEnvironment === 'development' ? 'white' : 'white',
                    borderColor: 'white',
                    '&:hover': { borderColor: 'white', backgroundColor: 'rgba(255,255,255,0.1)' }
                  }}
                >
                  Development
                </Button>
                <Button
                  variant={currentEnvironment === 'staging' ? 'contained' : 'outlined'}
                  size="small"
                  onClick={() => handleSetPresetScript('staging')}
                  sx={{ 
                    color: currentEnvironment === 'staging' ? 'white' : 'white',
                    borderColor: 'white',
                    '&:hover': { borderColor: 'white', backgroundColor: 'rgba(255,255,255,0.1)' }
                  }}
                >
                  Staging
                </Button>
                <Button
                  variant={currentEnvironment === 'production' ? 'contained' : 'outlined'}
                  size="small"
                  onClick={() => handleSetPresetScript('production')}
                  sx={{ 
                    color: currentEnvironment === 'production' ? 'white' : 'white',
                    borderColor: 'white',
                    '&:hover': { borderColor: 'white', backgroundColor: 'rgba(255,255,255,0.1)' }
                  }}
                >
                  Production
                </Button>
              </Stack>
            </Box>

            {/* Action Buttons */}
            <Stack direction="row" spacing={2}>
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
            <Alert severity="info" sx={{ mt: 2, backgroundColor: 'rgba(255,255,255,0.95)' }}>
              <Typography variant="body2">
                <strong>Note:</strong> After saving, you must <strong>reload the page</strong> for the new script to take effect. 
                The Adobe Launch script loads during initial page load.
              </Typography>
            </Alert>
          </Paper>
        </Grid>

        {/* Notification Settings */}
        <Grid item xs={12}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              <NotificationsIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Notifications
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <List>
              <ListItem>
                <ListItemIcon>
                  <EmailIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Email Notifications"
                  secondary="Receive important updates via email"
                />
                <ListItemSecondaryAction>
                  <Switch
                    checked={settings.emailNotifications}
                    onChange={handleSettingChange('emailNotifications')}
                  />
                </ListItemSecondaryAction>
              </ListItem>

              <ListItem>
                <ListItemIcon>
                  <EmailIcon />
                </ListItemIcon>
                <ListItemText
                  primary="SMS Notifications"
                  secondary="Receive updates via text message"
                />
                <ListItemSecondaryAction>
                  <Switch
                    checked={settings.smsNotifications}
                    onChange={handleSettingChange('smsNotifications')}
                  />
                </ListItemSecondaryAction>
              </ListItem>

              <ListItem>
                <ListItemIcon>
                  <EmailIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Marketing Emails"
                  secondary="Receive promotional offers and updates"
                />
                <ListItemSecondaryAction>
                  <Switch
                    checked={settings.marketingEmails}
                    onChange={handleSettingChange('marketingEmails')}
                  />
                </ListItemSecondaryAction>
              </ListItem>

              <ListItem>
                <ListItemIcon>
                  <NotificationsIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Flight Updates"
                  secondary="Get notified about flight changes and delays"
                />
                <ListItemSecondaryAction>
                  <Switch
                    checked={settings.flightUpdates}
                    onChange={handleSettingChange('flightUpdates')}
                  />
                </ListItemSecondaryAction>
              </ListItem>

              <ListItem>
                <ListItemIcon>
                  <NotificationsIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Price Alerts"
                  secondary="Get notified when flight prices drop"
                />
                <ListItemSecondaryAction>
                  <Switch
                    checked={settings.priceAlerts}
                    onChange={handleSettingChange('priceAlerts')}
                  />
                </ListItemSecondaryAction>
              </ListItem>
            </List>
          </Paper>
        </Grid>

        {/* Appearance Settings */}
        <Grid item xs={12}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              <PaletteIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Appearance
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <List>
              <ListItem>
                <ListItemIcon>
                  <PaletteIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Dark Mode"
                  secondary="Switch between light and dark themes"
                />
                <ListItemSecondaryAction>
                  <Switch
                    checked={settings.darkMode}
                    onChange={handleSettingChange('darkMode')}
                  />
                </ListItemSecondaryAction>
              </ListItem>
            </List>
          </Paper>
        </Grid>

        {/* Language & Currency */}
        <Grid item xs={12}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              <LanguageIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Language & Currency
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Language
                </Typography>
                <Typography variant="body1">
                  English (US)
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Currency
                </Typography>
                <Typography variant="body1">
                  Indian Rupee (INR)
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Security Settings */}
        <Grid item xs={12}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              <SecurityIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Security
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <List>
              <ListItem>
                <ListItemIcon>
                  <SecurityIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Two-Factor Authentication"
                  secondary="Add an extra layer of security to your account"
                />
                <ListItemSecondaryAction>
                  <Button variant="outlined" size="small">
                    Enable
                  </Button>
                </ListItemSecondaryAction>
              </ListItem>

              <ListItem>
                <ListItemIcon>
                  <SecurityIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Change Password"
                  secondary="Update your account password"
                />
                <ListItemSecondaryAction>
                  <Button variant="outlined" size="small">
                    Change
                  </Button>
                </ListItemSecondaryAction>
              </ListItem>
            </List>
          </Paper>
        </Grid>

        {/* Danger Zone */}
        <Grid item xs={12}>
          <Card sx={{ border: '1px solid', borderColor: 'error.main' }}>
            <CardContent>
              <Typography variant="h6" color="error" gutterBottom>
                Danger Zone
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                These actions are irreversible. Please proceed with caution.
              </Typography>
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={handleDeleteAccount}
              >
                Delete Account
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Save Button */}
        <Grid item xs={12}>
          <Box display="flex" justifyContent="flex-end">
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={handleSaveSettings}
              size="large"
            >
              Save Settings
            </Button>
          </Box>
        </Grid>
      </Grid>

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

export default SettingsPage;
