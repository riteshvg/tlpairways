import React, { useState, useEffect } from 'react';
import {
    Container,
    Paper,
    Typography,
    Switch,
    FormControlLabel,
    Box,
    Alert,
    CircularProgress,
    Divider,
    Chip
} from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

interface EmailSettings {
    emailEnabled: boolean;
    envOverride?: boolean;
    envValue?: string;
    lastUpdated?: string;
}

const SettingsPage: React.FC = () => {
    const [settings, setSettings] = useState<EmailSettings | null>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // Fetch current settings
    const fetchSettings = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await fetch('/api/email/settings');

            if (!response.ok) {
                throw new Error('Failed to fetch settings');
            }

            const data = await response.json();
            setSettings(data);
        } catch (err: any) {
            setError(err.message || 'Failed to load settings');
            console.error('Error fetching settings:', err);
        } finally {
            setLoading(false);
        }
    };

    // Update email enabled setting
    const handleToggleEmail = async (enabled: boolean) => {
        try {
            setUpdating(true);
            setError(null);
            setSuccessMessage(null);

            const response = await fetch('/api/email/settings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ emailEnabled: enabled })
            });

            if (!response.ok) {
                throw new Error('Failed to update settings');
            }

            const data = await response.json();
            setSettings(data.settings);
            setSuccessMessage(data.message);

            // Clear success message after 3 seconds
            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (err: any) {
            setError(err.message || 'Failed to update settings');
            console.error('Error updating settings:', err);
            // Revert the toggle on error
            await fetchSettings();
        } finally {
            setUpdating(false);
        }
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    if (loading) {
        return (
            <Container maxWidth="md" sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
                <CircularProgress />
            </Container>
        );
    }

    return (
        <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
            <Paper elevation={3} sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <EmailIcon sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
                    <Typography variant="h4" component="h1">
                        Email Settings
                    </Typography>
                </Box>

                <Divider sx={{ mb: 3 }} />

                {error && (
                    <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
                        {error}
                    </Alert>
                )}

                {successMessage && (
                    <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccessMessage(null)}>
                        {successMessage}
                    </Alert>
                )}

                {settings?.envOverride && (
                    <Alert severity="warning" icon={<WarningIcon />} sx={{ mb: 3 }}>
                        <Typography variant="body2">
                            <strong>Environment Variable Override Active</strong>
                            <br />
                            The EMAIL_ENABLED environment variable is set to "{settings.envValue}".
                            This setting will be overridden by the environment variable until it is removed.
                        </Typography>
                    </Alert>
                )}

                <Box sx={{ mb: 4 }}>
                    <FormControlLabel
                        control={
                            <Switch
                                checked={settings?.emailEnabled || false}
                                onChange={(e) => handleToggleEmail(e.target.checked)}
                                disabled={updating || settings?.envOverride}
                                color="primary"
                                size="medium"
                            />
                        }
                        label={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography variant="h6">
                                    Enable Email Sending
                                </Typography>
                                {settings?.emailEnabled ? (
                                    <Chip
                                        icon={<CheckCircleIcon />}
                                        label="Enabled"
                                        color="success"
                                        size="small"
                                    />
                                ) : (
                                    <Chip
                                        icon={<WarningIcon />}
                                        label="Disabled"
                                        color="warning"
                                        size="small"
                                    />
                                )}
                            </Box>
                        }
                    />

                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1, ml: 4 }}>
                        {settings?.emailEnabled
                            ? 'Booking confirmation emails will be sent to customers.'
                            : 'Email sending is disabled. No emails will be sent (test mode).'}
                    </Typography>
                </Box>

                <Divider sx={{ mb: 3 }} />

                <Box>
                    <Typography variant="h6" gutterBottom>
                        Why disable emails?
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                        When testing the application with fake email addresses, bounced emails can cause
                        your domain to be marked as SPAM by email service providers. Disable email sending
                        during testing to prevent this issue.
                    </Typography>

                    <Typography variant="body2" color="text.secondary" paragraph>
                        <strong>When to disable:</strong>
                    </Typography>
                    <ul style={{ marginTop: 0 }}>
                        <li>
                            <Typography variant="body2" color="text.secondary">
                                Testing with fake or invalid email addresses
                            </Typography>
                        </li>
                        <li>
                            <Typography variant="body2" color="text.secondary">
                                Development and debugging
                            </Typography>
                        </li>
                        <li>
                            <Typography variant="body2" color="text.secondary">
                                Demo environments
                            </Typography>
                        </li>
                    </ul>

                    <Typography variant="body2" color="text.secondary" paragraph>
                        <strong>When to enable:</strong>
                    </Typography>
                    <ul style={{ marginTop: 0 }}>
                        <li>
                            <Typography variant="body2" color="text.secondary">
                                Production environment with real customers
                            </Typography>
                        </li>
                        <li>
                            <Typography variant="body2" color="text.secondary">
                                Testing with valid email addresses
                            </Typography>
                        </li>
                    </ul>
                </Box>

                {settings?.lastUpdated && (
                    <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                        <Typography variant="caption" color="text.secondary">
                            Last updated: {new Date(settings.lastUpdated).toLocaleString()}
                        </Typography>
                    </Box>
                )}
            </Paper>
        </Container>
    );
};

export default SettingsPage;
