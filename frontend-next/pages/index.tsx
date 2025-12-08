import { useUser } from '@auth0/nextjs-auth0/client';
import {
    Container,
    Typography,
    Button,
    Box,
    Paper,
    Grid,
    Card,
    CardContent,
    CardActions,
    Chip
} from '@mui/material';
import Head from 'next/head';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import SearchIcon from '@mui/icons-material/Search';
import PersonIcon from '@mui/icons-material/Person';
import { usePageView } from '../lib/analytics/useAnalytics';
import { useEffect } from 'react';
import { pushUserContext, pushPageView } from '../lib/analytics/dataLayer';

/**
 * Homepage - MPA Version
 * 
 * Demonstrates:
 * - Server-side Adobe pageView (already pushed in _document.tsx)
 * - Client-side enhanced pageView with full data
 * - Material-UI theming
 * - Auth0 integration
 * - Navigation to other pages
 */
export default function Home() {
    const { user, isLoading } = useUser();

    // Track page view with enhanced data - wait for auth to load
    useEffect(() => {
        if (!isLoading) {
            pushPageView({
                pageType: 'home',
                pageName: 'Homepage',
                pageTitle: 'TLAirways - Book Flights Across India',
                pageDescription: 'Book affordable flights across India with TLAirways',
                pageCategory: 'landing',
                sections: ['hero', 'destinations', 'features', 'cta'],
                user: user
            });
        }
    }, [user, isLoading]);

    // Track user context when user state changes
    useEffect(() => {
        if (!isLoading) {
            pushUserContext({
                isAuthenticated: !!user,
                userId: user?.sub || null,
                userSegment: user ? 'registered' : 'anonymous'
            });
        }
    }, [user, isLoading]);

    // Featured destinations
    const destinations = [
        { city: 'Mumbai', code: 'BOM', image: '🏙️', price: '₹3,499' },
        { city: 'Delhi', code: 'DEL', image: '🏛️', price: '₹4,299' },
        { city: 'Bangalore', code: 'BLR', image: '🌳', price: '₹3,999' },
        { city: 'Hyderabad', code: 'HYD', image: '🏰', price: '₹3,799' },
    ];

    return (
        <>
            <Head>
                <title>TLP Airways | NEXT - Premium Air Travel</title>
                <meta name="description" content="Book affordable flights across India with TLP Airways" />
            </Head>

            {/* Hero Section */}
            <Box
                sx={{
                    background: 'linear-gradient(135deg, #00695C 0%, #26A69A 100%)',
                    color: 'white',
                    py: 8,
                    mb: 6,
                }}
            >
                <Container maxWidth="lg">
                    <Box sx={{ textAlign: 'center' }}>
                        <FlightTakeoffIcon sx={{ fontSize: 60, mb: 2 }} />
                        <Typography variant="h2" component="h1" gutterBottom>
                            Welcome to TLAirways
                        </Typography>
                        <Typography variant="h5" sx={{ mb: 4, opacity: 0.9 }}>
                            Your Journey Begins Here
                        </Typography>

                        {user ? (
                            <Box>
                                <Typography variant="h6" sx={{ mb: 2 }}>
                                    Welcome back, {user.name}!
                                </Typography>
                                <Button
                                    component="a"
                                    href="/search"
                                    variant="contained"
                                    size="large"
                                    sx={{
                                        bgcolor: 'white',
                                        color: 'primary.main',
                                        '&:hover': { bgcolor: 'grey.100' },
                                        mr: 2,
                                    }}
                                    startIcon={<SearchIcon />}
                                >
                                    Search Flights
                                </Button>
                                <Button
                                    component="a"
                                    href="/profile"
                                    variant="outlined"
                                    size="large"
                                    sx={{
                                        borderColor: 'white',
                                        color: 'white',
                                        '&:hover': { borderColor: 'grey.100', bgcolor: 'rgba(255,255,255,0.1)' },
                                    }}
                                    startIcon={<PersonIcon />}
                                >
                                    My Profile
                                </Button>
                            </Box>
                        ) : (
                            <Box>
                                <Button
                                    component="a"
                                    href="/api/auth/login"
                                    variant="contained"
                                    size="large"
                                    sx={{
                                        bgcolor: 'white',
                                        color: 'primary.main',
                                        '&:hover': { bgcolor: 'grey.100' },
                                        mr: 2,
                                    }}
                                >
                                    Login to Book
                                </Button>
                                <Button
                                    component="a"
                                    href="/search"
                                    variant="outlined"
                                    size="large"
                                    sx={{
                                        borderColor: 'white',
                                        color: 'white',
                                        '&:hover': { borderColor: 'grey.100', bgcolor: 'rgba(255,255,255,0.1)' },
                                    }}
                                >
                                    Browse Flights
                                </Button>
                            </Box>
                        )}
                    </Box>
                </Container>
            </Box>

            {/* Featured Destinations */}
            <Container maxWidth="lg" sx={{ mb: 8 }}>
                <Typography variant="h4" component="h2" gutterBottom sx={{ mb: 4 }}>
                    ✈️ Popular Destinations
                </Typography>

                <Grid container spacing={3}>
                    {destinations.map((dest) => (
                        <Grid size={{ xs: 12, sm: 6, md: 3 }} key={dest.code}>
                            <Card
                                sx={{
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    transition: 'transform 0.2s',
                                    '&:hover': {
                                        transform: 'translateY(-4px)',
                                        boxShadow: 4,
                                    },
                                }}
                            >
                                <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
                                    <Typography variant="h1" sx={{ fontSize: '4rem', mb: 2 }}>
                                        {dest.image}
                                    </Typography>
                                    <Typography variant="h5" component="h3" gutterBottom>
                                        {dest.city}
                                    </Typography>
                                    <Chip label={dest.code} size="small" sx={{ mb: 2 }} />
                                    <Typography variant="h6" color="primary">
                                        Starting from {dest.price}
                                    </Typography>
                                </CardContent>
                                <CardActions sx={{ justifyContent: 'center', pb: 2 }}>
                                    <Button
                                        component="a"
                                        href={`/search?to=${dest.code}`}
                                        variant="contained"
                                        size="small"
                                    >
                                        Search Flights
                                    </Button>
                                </CardActions>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Container>

            {/* Why Choose Us */}
            <Box sx={{ bgcolor: 'background.default', py: 8, mb: 6 }}>
                <Container maxWidth="lg">
                    <Typography variant="h4" component="h2" gutterBottom sx={{ mb: 4, textAlign: 'center' }}>
                        Why Choose TLAirways?
                    </Typography>

                    <Grid container spacing={4}>
                        <Grid size={{ xs: 12, md: 4 }}>
                            <Paper sx={{ p: 3, textAlign: 'center', height: '100%' }}>
                                <Typography variant="h2" sx={{ mb: 2 }}>💰</Typography>
                                <Typography variant="h6" gutterBottom>Best Prices</Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Competitive fares and exclusive deals on flights across India
                                </Typography>
                            </Paper>
                        </Grid>
                        <Grid size={{ xs: 12, md: 4 }}>
                            <Paper sx={{ p: 3, textAlign: 'center', height: '100%' }}>
                                <Typography variant="h2" sx={{ mb: 2 }}>⚡</Typography>
                                <Typography variant="h6" gutterBottom>Fast Booking</Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Book your flight in minutes with our streamlined process
                                </Typography>
                            </Paper>
                        </Grid>
                        <Grid size={{ xs: 12, md: 4 }}>
                            <Paper sx={{ p: 3, textAlign: 'center', height: '100%' }}>
                                <Typography variant="h2" sx={{ mb: 2 }}>🛡️</Typography>
                                <Typography variant="h6" gutterBottom>Secure &amp; Safe</Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Your data is protected with industry-standard security
                                </Typography>
                            </Paper>
                        </Grid>
                    </Grid>
                </Container>
            </Box>

            {/* MPA Demo Info */}
            <Container maxWidth="lg" sx={{ mb: 6 }}>
                <Paper sx={{ p: 4, bgcolor: 'info.light', color: 'info.contrastText' }}>
                    <Typography variant="h5" gutterBottom>
                        🚀 MPA Demo - Adobe Analytics
                    </Typography>
                    <Typography variant="body1" paragraph>
                        This is a Multi-Page Application (MPA) built with Next.js. The Adobe Data Layer
                        is initialized server-side, eliminating race conditions!
                    </Typography>
                    <Typography variant="body2">
                        ✅ pageView pushed BEFORE Adobe Launch loads<br />
                        ✅ No timeout errors<br />
                        ✅ 100% reliable tracking<br />
                        ✅ Check your browser console for Adobe logs
                    </Typography>
                </Paper>
            </Container>
        </>
    );
}
