import { withPageAuthRequired } from '@auth0/nextjs-auth0';
import { useUser } from '@auth0/nextjs-auth0/client';
import {
    Container,
    Typography,
    Paper,
    Box,
    Avatar,
    Grid,
    Button,
    Divider,
} from '@mui/material';
import Head from 'next/head';

/**
 * Profile Page - MPA Version
 * 
 * Protected page (requires authentication)
 * Displays user information from Auth0
 */
function ProfilePage() {
    const { user } = useUser();

    if (!user) {
        return null; // withPageAuthRequired handles redirect
    }

    return (
        <>
            <Head>
                <title>My Profile - TLAirways</title>
                <meta name="description" content="User profile" />
            </Head>

            <Container maxWidth="md" sx={{ mt: 8, mb: 8 }}>
                <Paper elevation={3} sx={{ p: 4 }}>
                    {/* Header */}
                    <Box sx={{ textAlign: 'center', mb: 4 }}>
                        <Avatar
                            src={user.picture}
                            alt={user.name}
                            sx={{ width: 120, height: 120, mx: 'auto', mb: 2 }}
                        />
                        <Typography variant="h4" gutterBottom>
                            {user.name}
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            {user.email}
                        </Typography>
                    </Box>

                    <Divider sx={{ my: 3 }} />

                    {/* User Details */}
                    <Grid container spacing={3}>
                        <Grid item xs={12} sm={6}>
                            <Typography variant="subtitle2" color="text.secondary">
                                Name
                            </Typography>
                            <Typography variant="body1">{user.name}</Typography>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <Typography variant="subtitle2" color="text.secondary">
                                Email
                            </Typography>
                            <Typography variant="body1">{user.email}</Typography>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <Typography variant="subtitle2" color="text.secondary">
                                Email Verified
                            </Typography>
                            <Typography variant="body1">
                                {user.email_verified ? '✅ Yes' : '❌ No'}
                            </Typography>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <Typography variant="subtitle2" color="text.secondary">
                                User ID
                            </Typography>
                            <Typography variant="body1" sx={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>
                                {user.sub}
                            </Typography>
                        </Grid>
                    </Grid>

                    <Divider sx={{ my: 3 }} />

                    {/* Actions */}
                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                        <Button component="a" href="/" variant="outlined">
                            Back to Home
                        </Button>
                        <Button component="a" href="/search" variant="contained">
                            Search Flights
                        </Button>
                        <Button href="/api/auth/logout" variant="outlined" color="error">
                            Logout
                        </Button>
                    </Box>

                    {/* Debug Info */}
                    <Box sx={{ mt: 4, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                        <Typography variant="subtitle2" gutterBottom>
                            Full User Object (Debug):
                        </Typography>
                        <Box
                            component="pre"
                            sx={{
                                fontSize: '0.75rem',
                                overflow: 'auto',
                                maxHeight: 200,
                                p: 1,
                                bgcolor: 'grey.900',
                                color: 'grey.100',
                                borderRadius: 1,
                            }}
                        >
                            {JSON.stringify(user, null, 2)}
                        </Box>
                    </Box>

                    {/* MPA Info */}
                    <Paper sx={{ p: 2, mt: 3, bgcolor: 'warning.light' }}>
                        <Typography variant="caption">
                            <strong>MPA Note:</strong> This page is protected by{' '}
                            <code>withPageAuthRequired</code>. Unauthenticated users are redirected
                            to login. This is server-side protection!
                        </Typography>
                    </Paper>
                </Paper>
            </Container>
        </>
    );
}

// Server-side authentication check
export default withPageAuthRequired(ProfilePage);
