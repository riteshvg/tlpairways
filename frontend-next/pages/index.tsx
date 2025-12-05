import { useUser } from '@auth0/nextjs-auth0/client';
import { Container, Typography, Button, Box, Paper, Avatar } from '@mui/material';
import Head from 'next/head';

/**
 * Homepage - Test page for Auth0 integration
 * 
 * This page demonstrates:
 * - Auth0 login/logout
 * - User session management
 * - Material-UI theming
 */
export default function Home() {
    const { user, error, isLoading } = useUser();

    if (isLoading) {
        return (
            <Container maxWidth="md" sx={{ mt: 8, textAlign: 'center' }}>
                <Typography variant="h4">Loading...</Typography>
            </Container>
        );
    }

    if (error) {
        return (
            <Container maxWidth="md" sx={{ mt: 8 }}>
                <Paper sx={{ p: 4, bgcolor: 'error.light' }}>
                    <Typography variant="h5" color="error">
                        Error: {error.message}
                    </Typography>
                </Paper>
            </Container>
        );
    }

    return (
        <>
            <Head>
                <title>TLAirways - MPA Test</title>
                <meta name="description" content="TLAirways Multi-Page Application" />
            </Head>

            <Container maxWidth="md" sx={{ mt: 8 }}>
                <Paper elevation={3} sx={{ p: 4 }}>
                    <Typography variant="h3" component="h1" gutterBottom color="primary">
                        🚀 TLAirways MPA
                    </Typography>

                    <Typography variant="h5" gutterBottom sx={{ mb: 4 }}>
                        Phase 0 - Authentication Test
                    </Typography>

                    {user ? (
                        <Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                                <Avatar
                                    src={user.picture}
                                    alt={user.name}
                                    sx={{ width: 64, height: 64, mr: 2 }}
                                />
                                <Box>
                                    <Typography variant="h6">{user.name}</Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {user.email}
                                    </Typography>
                                </Box>
                            </Box>

                            <Box sx={{ mt: 3, p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
                                <Typography variant="subtitle2" gutterBottom>
                                    User Info:
                                </Typography>
                                <pre style={{ fontSize: '12px', overflow: 'auto' }}>
                                    {JSON.stringify(user, null, 2)}
                                </pre>
                            </Box>

                            <Button
                                variant="contained"
                                color="primary"
                                href="/api/auth/logout"
                                sx={{ mt: 3 }}
                            >
                                Logout
                            </Button>
                        </Box>
                    ) : (
                        <Box>
                            <Typography variant="body1" paragraph>
                                Welcome to TLAirways MPA! Please login to continue.
                            </Typography>

                            <Button
                                variant="contained"
                                color="primary"
                                size="large"
                                href="/api/auth/login"
                            >
                                Login with Auth0
                            </Button>
                        </Box>
                    )}

                    <Box sx={{ mt: 4, pt: 3, borderTop: 1, borderColor: 'divider' }}>
                        <Typography variant="caption" color="text.secondary">
                            ✅ Next.js 16 | ✅ Material-UI | ✅ Auth0 | ✅ TypeScript
                        </Typography>
                    </Box>
                </Paper>
            </Container>
        </>
    );
}
