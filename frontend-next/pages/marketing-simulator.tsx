import React, { useState } from 'react';
import {
    Container,
    Paper,
    Typography,
    Box,
    TextField,
    Button,
    MenuItem,
    FormControl,
    InputLabel,
    Select,
    Slider,
    SelectChangeEvent,
    Grid,
    Divider
} from '@mui/material';
import Head from 'next/head';
import CampaignIcon from '@mui/icons-material/Campaign';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';

export default function MarketingSimulator() {
    // Standard UTM Params
    const [campaign, setCampaign] = useState('summer_sale');
    const [source, setSource] = useState('google');
    const [medium, setMedium] = useState('organic');

    // UX Helpers
    const [quickChannel, setQuickChannel] = useState('organic_search');
    const [days, setDays] = useState(1);

    const handleQuickChannelChange = (event: SelectChangeEvent) => {
        const val = event.target.value;
        setQuickChannel(val);

        // Auto-populate standard UTMs based on channel selection
        switch (val) {
            case 'social_facebook':
                setSource('facebook');
                setMedium('social');
                break;
            case 'social_twitter':
                setSource('twitter');
                setMedium('social');
                break;
            case 'social_instagram':
                setSource('instagram');
                setMedium('social');
                break;
            case 'email':
                setSource('newsletter');
                setMedium('email');
                break;
            case 'organic_search':
                setSource('google');
                setMedium('organic');
                break;
            case 'paid_search':
                setSource('google');
                setMedium('cpc');
                break;
            case 'referral':
                setSource('travel_blog');
                setMedium('referral');
                break;
            case 'direct':
                setSource('direct');
                setMedium('none');
                break;
            default:
                break;
        }
    };

    const handleSubmit = () => {
        if (days > 0) {
            const maxAge = days * 24 * 60 * 60;
            document.cookie = `marketing_simulator_done=true; path=/; max-age=${maxAge}`;
        }

        // Construct Standard UTM URL
        const params = new URLSearchParams();
        if (source) params.set('utm_source', source);
        if (medium) params.set('utm_medium', medium);
        if (campaign) params.set('utm_campaign', campaign);

        // Redirect
        window.location.href = `/?${params.toString()}`;
    };

    return (
        <Container maxWidth="md" sx={{ mt: 8 }}>
            <Head>
                <title>Marketing Channel Simulator</title>
            </Head>
            <Paper elevation={3} sx={{ p: 5, borderRadius: 2 }}>
                <Box sx={{ textAlign: 'center', mb: 5 }}>
                    <CampaignIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                    <Typography variant="h4" component="h1" gutterBottom>
                        Marketing Simulator
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Configure incoming traffic parameters for analytics testing.
                    </Typography>
                </Box>

                <Grid container spacing={4}>
                    {/* Left Side: Quick Select */}
                    <Grid size={{ xs: 12, md: 5 }}>
                        <Box sx={{ p: 3, bgcolor: 'grey.50', borderRadius: 2, height: '100%' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <AutoFixHighIcon color="action" sx={{ mr: 1 }} />
                                <Typography variant="h6">Quick Presets</Typography>
                            </Box>
                            <Typography variant="body2" color="text.secondary" paragraph>
                                Select a common channel to auto-fill the UTM parameters.
                            </Typography>

                            <FormControl fullWidth margin="normal">
                                <InputLabel>Channel Preset</InputLabel>
                                <Select
                                    value={quickChannel}
                                    label="Channel Preset"
                                    onChange={handleQuickChannelChange}
                                >
                                    <MenuItem value="organic_search">Organic Search (Google)</MenuItem>
                                    <MenuItem value="paid_search">Paid Search (Google CPC)</MenuItem>
                                    <Divider />
                                    <MenuItem value="social_facebook">Facebook Post</MenuItem>
                                    <MenuItem value="social_twitter">Twitter/X Post</MenuItem>
                                    <MenuItem value="social_instagram">Instagram Bio</MenuItem>
                                    <Divider />
                                    <MenuItem value="email">Email Newsletter</MenuItem>
                                    <MenuItem value="referral">Blog Referral</MenuItem>
                                    <MenuItem value="direct">Direct Traffic</MenuItem>
                                </Select>
                            </FormControl>
                        </Box>
                    </Grid>

                    {/* Right Side: Manual Config */}
                    <Grid size={{ xs: 12, md: 7 }}>
                        <Box component="form" noValidate autoComplete="off">
                            <Typography variant="h6" gutterBottom>
                                UTM Parameters
                            </Typography>

                            <TextField
                                fullWidth
                                label="Campaign Name (utm_campaign)"
                                value={campaign}
                                onChange={(e) => setCampaign(e.target.value)}
                                margin="normal"
                                helperText="e.g. winter_sale, new_subscriber"
                            />

                            <Grid container spacing={2}>
                                <Grid size={{ xs: 6 }}>
                                    <TextField
                                        fullWidth
                                        label="Source (utm_source)"
                                        value={source}
                                        onChange={(e) => setSource(e.target.value)}
                                        margin="normal"
                                        helperText="e.g. google, facebook"
                                    />
                                </Grid>
                                <Grid size={{ xs: 6 }}>
                                    <TextField
                                        fullWidth
                                        label="Medium (utm_medium)"
                                        value={medium}
                                        onChange={(e) => setMedium(e.target.value)}
                                        margin="normal"
                                        helperText="e.g. cpc, newsletter"
                                    />
                                </Grid>
                            </Grid>

                            <Box sx={{ mt: 4, mb: 1, p: 2, border: '1px dashed grey', borderRadius: 1 }}>
                                <Typography gutterBottom variant="subtitle2">
                                    Simulation Frequency
                                </Typography>
                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                    Don't show this screen again for: <strong>{days} Day(s)</strong>
                                </Typography>
                                <Slider
                                    value={days}
                                    onChange={(_, newValue) => setDays(newValue as number)}
                                    min={0}
                                    max={30}
                                    step={1}
                                    valueLabelDisplay="auto"
                                    sx={{ mt: 1 }}
                                />
                            </Box>

                            <Button
                                fullWidth
                                variant="contained"
                                size="large"
                                onClick={handleSubmit}
                                sx={{ mt: 3, py: 1.5 }}
                            >
                                Launch Simulation 🚀
                            </Button>
                        </Box>
                    </Grid>
                </Grid>
            </Paper>
        </Container>
    );
}
