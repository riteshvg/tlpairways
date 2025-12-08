import { Container, Paper, Typography, Box, Grid, Card, CardContent, Divider, Button, Chip, Stack } from '@mui/material';
import Head from 'next/head';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import CodeIcon from '@mui/icons-material/Code';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import EmailIcon from '@mui/icons-material/Email';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SearchIcon from '@mui/icons-material/Search';
import PersonIcon from '@mui/icons-material/Person';
import PaymentIcon from '@mui/icons-material/Payment';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import DataObjectIcon from '@mui/icons-material/DataObject';

export default function AboutPage() {
    const bookingSteps = [
        {
            icon: SearchIcon,
            title: 'Search Flights',
            description: 'Browse available flights with dynamic pricing and real-time availability',
            dataLayer: 'searchInitiated, pageView events'
        },
        {
            icon: FlightTakeoffIcon,
            title: 'Select Flights',
            description: 'Choose onward and return flights with detailed flight information',
            dataLayer: 'flightSelection, productView events'
        },
        {
            icon: PersonIcon,
            title: 'Traveller Details',
            description: 'Enter passenger information with validation and ancillary services',
            dataLayer: 'checkoutInitiated, formInteraction events'
        },
        {
            icon: PaymentIcon,
            title: 'Payment',
            description: 'Complete booking with multiple payment options',
            dataLayer: 'paymentInfo, checkoutProgress events'
        },
        {
            icon: ConfirmationNumberIcon,
            title: 'Confirmation',
            description: 'Receive booking confirmation with comprehensive purchase data',
            dataLayer: 'purchase event with pageData, viewData, revenue, customer data'
        }
    ];

    const dataLayerFeatures = [
        'Adobe Client Data Layer (ACDL) implementation',
        'Comprehensive page view tracking with context',
        'E-commerce tracking (product views, add to cart, purchase)',
        'User authentication and session tracking',
        'Search context and booking flow tracking',
        'Revenue and conversion tracking',
        'Custom events for user interactions',
        'Consent management integration',
        'Server-side and client-side data layer support'
    ];

    return (
        <>
            <Head>
                <title>About TLP Airways - Demo Flight Booking Application</title>
                <meta name="description" content="Learn about TLP Airways demo application, its booking flow, and comprehensive Adobe Data Layer implementation for analytics tracking." />
            </Head>

            <Container maxWidth="lg" sx={{ mt: 6, mb: 10 }}>
                {/* Hero Section */}
                <Paper
                    sx={{
                        p: 6,
                        mb: 6,
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        textAlign: 'center'
                    }}
                >
                    <FlightTakeoffIcon sx={{ fontSize: 64, mb: 2 }} />
                    <Typography variant="h3" gutterBottom fontWeight="bold">
                        TLP Airways
                    </Typography>
                    <Typography variant="h5" gutterBottom sx={{ opacity: 0.9 }}>
                        A Demo Flight Booking Application
                    </Typography>
                    <Typography variant="body1" sx={{ mt: 2, maxWidth: 800, mx: 'auto', opacity: 0.95 }}>
                        Built to demonstrate a complete e-commerce booking flow with comprehensive
                        Adobe Analytics data layer implementation
                    </Typography>
                </Paper>

                {/* Demo Notice */}
                <Paper sx={{ p: 4, mb: 6, bgcolor: '#fff3e0', borderLeft: '4px solid #ff9800' }}>
                    <Typography variant="h6" gutterBottom color="warning.dark" fontWeight="bold">
                        ⚠️ Demo Application Notice
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        This is a <strong>demonstration application</strong> designed for learning and showcasing
                        analytics implementation. No real flights are booked, no actual payments are processed,
                        and no real travel services are provided. All data, flights, and transactions are simulated
                        for educational purposes.
                    </Typography>
                </Paper>

                {/* About the Application */}
                <Box sx={{ mb: 6 }}>
                    <Typography variant="h4" gutterBottom fontWeight="bold" color="primary">
                        About This Application
                    </Typography>
                    <Divider sx={{ mb: 3 }} />

                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                            <Card sx={{ height: '100%' }}>
                                <CardContent>
                                    <CodeIcon color="primary" sx={{ fontSize: 40, mb: 2 }} />
                                    <Typography variant="h6" gutterBottom fontWeight="bold">
                                        Purpose
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        TLP Airways is a fully functional flight booking demo application built to
                                        demonstrate best practices in:
                                    </Typography>
                                    <Box component="ul" sx={{ mt: 2, pl: 2 }}>
                                        <li>E-commerce user experience design</li>
                                        <li>Multi-step booking flow implementation</li>
                                        <li>Analytics and data layer integration</li>
                                        <li>Modern web application architecture</li>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <Card sx={{ height: '100%' }}>
                                <CardContent>
                                    <AnalyticsIcon color="secondary" sx={{ fontSize: 40, mb: 2 }} />
                                    <Typography variant="h6" gutterBottom fontWeight="bold">
                                        Technology Stack
                                    </Typography>
                                    <Stack spacing={1} sx={{ mt: 2 }}>
                                        <Chip label="Next.js 16 (React)" size="small" />
                                        <Chip label="Material-UI (MUI)" size="small" />
                                        <Chip label="Adobe Client Data Layer" size="small" />
                                        <Chip label="Adobe Launch" size="small" />
                                        <Chip label="Auth0 Authentication" size="small" />
                                        <Chip label="TypeScript" size="small" />
                                    </Stack>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                </Box>

                {/* Booking Flow */}
                <Box sx={{ mb: 6 }}>
                    <Typography variant="h4" gutterBottom fontWeight="bold" color="primary">
                        Complete Booking Flow
                    </Typography>
                    <Divider sx={{ mb: 3 }} />

                    <Grid container spacing={3}>
                        {bookingSteps.map((step, index) => {
                            const IconComponent = step.icon;
                            return (
                                <Grid item xs={12} md={6} lg={4} key={index}>
                                    <Card sx={{ height: '100%', position: 'relative' }}>
                                        <Box
                                            sx={{
                                                position: 'absolute',
                                                top: 16,
                                                right: 16,
                                                bgcolor: 'primary.main',
                                                color: 'white',
                                                width: 32,
                                                height: 32,
                                                borderRadius: '50%',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontWeight: 'bold'
                                            }}
                                        >
                                            {index + 1}
                                        </Box>
                                        <CardContent>
                                            <IconComponent color="primary" sx={{ fontSize: 40, mb: 2 }} />
                                            <Typography variant="h6" gutterBottom fontWeight="bold">
                                                {step.title}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary" paragraph>
                                                {step.description}
                                            </Typography>
                                            <Box sx={{ mt: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                                                <Typography variant="caption" color="primary" fontWeight="bold" display="block" gutterBottom>
                                                    <DataObjectIcon sx={{ fontSize: 14, mr: 0.5, verticalAlign: 'middle' }} />
                                                    Data Layer Events:
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {step.dataLayer}
                                                </Typography>
                                            </Box>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            );
                        })}
                    </Grid>
                </Box>

                {/* Data Layer Implementation */}
                <Box sx={{ mb: 6 }}>
                    <Typography variant="h4" gutterBottom fontWeight="bold" color="primary">
                        <AnalyticsIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                        Comprehensive Data Layer Implementation
                    </Typography>
                    <Divider sx={{ mb: 3 }} />

                    <Paper sx={{ p: 4, bgcolor: '#e8f5e9' }}>
                        <Typography variant="h6" gutterBottom fontWeight="bold" color="success.dark">
                            Adobe Client Data Layer (ACDL)
                        </Typography>
                        <Typography variant="body1" paragraph color="text.secondary">
                            This application features a <strong>production-ready Adobe Client Data Layer</strong> implementation
                            that captures comprehensive user interactions, e-commerce events, and page context throughout
                            the entire booking journey.
                        </Typography>

                        <Typography variant="subtitle1" gutterBottom fontWeight="bold" sx={{ mt: 3 }}>
                            Key Features:
                        </Typography>
                        <Grid container spacing={2}>
                            {dataLayerFeatures.map((feature, index) => (
                                <Grid item xs={12} sm={6} key={index}>
                                    <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                                        <CheckCircleIcon color="success" sx={{ fontSize: 20, mr: 1, mt: 0.5 }} />
                                        <Typography variant="body2">{feature}</Typography>
                                    </Box>
                                </Grid>
                            ))}
                        </Grid>

                        <Box sx={{ mt: 4, p: 3, bgcolor: 'white', borderRadius: 1, border: '1px solid #c8e6c9' }}>
                            <Typography variant="subtitle2" gutterBottom fontWeight="bold">
                                Example: Purchase Event Structure
                            </Typography>
                            <Box
                                component="pre"
                                sx={{
                                    bgcolor: '#263238',
                                    color: '#aed581',
                                    p: 2,
                                    borderRadius: 1,
                                    overflow: 'auto',
                                    fontSize: '0.75rem',
                                    fontFamily: 'monospace'
                                }}
                            >
                                {`{
  event: 'purchase',
  eventData: {
    pageData: { /* Complete page context */ },
    viewData: { /* Session & user info */ },
    revenue: { /* Transaction details */ },
    customer: { /* Customer information */ },
    products: [ /* Product array */ ],
    searchContext: { /* Search criteria */ },
    bookingContext: { /* Booking details */ }
  }
}`}
                            </Box>
                        </Box>
                    </Paper>
                </Box>

                {/* Use Cases */}
                <Box sx={{ mb: 6 }}>
                    <Typography variant="h4" gutterBottom fontWeight="bold" color="primary">
                        Ideal For
                    </Typography>
                    <Divider sx={{ mb: 3 }} />

                    <Grid container spacing={3}>
                        <Grid item xs={12} md={4}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom fontWeight="bold">
                                        Learning & Training
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Perfect for understanding e-commerce flows, analytics implementation,
                                        and modern web development practices.
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom fontWeight="bold">
                                        Portfolio Showcase
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Demonstrates full-stack development capabilities, UX design,
                                        and analytics integration expertise.
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom fontWeight="bold">
                                        Testing & POC
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Use as a reference implementation for testing analytics tools,
                                        tag management, and tracking strategies.
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                </Box>

                {/* Contact Section */}
                <Paper
                    sx={{
                        p: 6,
                        textAlign: 'center',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white'
                    }}
                >
                    <EmailIcon sx={{ fontSize: 48, mb: 2 }} />
                    <Typography variant="h4" gutterBottom fontWeight="bold">
                        Let's Collaborate
                    </Typography>
                    <Typography variant="body1" paragraph sx={{ opacity: 0.9, maxWidth: 600, mx: 'auto' }}>
                        Interested in discussing analytics implementation, data layer architecture,
                        or potential collaboration opportunities? I'd love to hear from you!
                    </Typography>
                    <Button
                        variant="contained"
                        size="large"
                        href="mailto:ritesh@thelearningproject.in"
                        sx={{
                            mt: 2,
                            bgcolor: 'white',
                            color: '#667eea',
                            fontWeight: 'bold',
                            px: 4,
                            '&:hover': {
                                bgcolor: '#f5f5f5'
                            }
                        }}
                        startIcon={<EmailIcon />}
                    >
                        ritesh@thelearningproject.in
                    </Button>

                    <Box sx={{ mt: 4, pt: 4, borderTop: '1px solid rgba(255,255,255,0.2)' }}>
                        <Typography variant="body2" sx={{ opacity: 0.8 }}>
                            Built with ❤️ for the analytics and development community
                        </Typography>
                    </Box>
                </Paper>
            </Container>
        </>
    );
}
