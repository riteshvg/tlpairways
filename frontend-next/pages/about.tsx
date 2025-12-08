import { Container, Paper, Typography, Box, Grid, Divider, Button, Chip, Stack } from '@mui/material';
import Head from 'next/head';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import EmailIcon from '@mui/icons-material/Email';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SearchIcon from '@mui/icons-material/Search';
import PersonIcon from '@mui/icons-material/Person';
import PaymentIcon from '@mui/icons-material/Payment';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import DataObjectIcon from '@mui/icons-material/DataObject';

export default function AboutPage() {
    const bookingSteps = [
        { icon: SearchIcon, title: 'Search', number: 1 },
        { icon: FlightTakeoffIcon, title: 'Select', number: 2 },
        { icon: PersonIcon, title: 'Details', number: 3 },
        { icon: PaymentIcon, title: 'Payment', number: 4 },
        { icon: ConfirmationNumberIcon, title: 'Confirm', number: 5 }
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
                {/* First Ticket - Introduction with Email */}
                <Paper
                    sx={{
                        mb: 6,
                        background: 'white',
                        overflow: 'hidden',
                        position: 'relative',
                        boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
                    }}
                >
                    {/* Ticket Header */}
                    <Box sx={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        p: 3,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <Box>
                            <Typography variant="h4" fontWeight="bold" sx={{ fontFamily: 'Playfair Display' }}>
                                TLP Airways
                            </Typography>
                            <Typography variant="caption" sx={{ opacity: 0.9 }}>
                                DEMO BOARDING PASS
                            </Typography>
                        </Box>
                        <FlightTakeoffIcon sx={{ fontSize: 48 }} />
                    </Box>

                    {/* Main Ticket Body */}
                    <Box sx={{ p: 4 }}>
                        <Grid container spacing={4}>
                            {/* Left Side - Flight Route */}
                            <Grid item xs={12} md={8}>
                                <Box sx={{ mb: 3 }}>
                                    <Typography variant="overline" color="text.secondary" fontWeight="bold">
                                        FLIGHT ROUTE
                                    </Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
                                        <Box sx={{ textAlign: 'center' }}>
                                            <Typography variant="h3" fontWeight="bold" color="primary">
                                                DEV
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                Development
                                            </Typography>
                                        </Box>
                                        <Box sx={{ flex: 1, position: 'relative' }}>
                                            <Box sx={{
                                                height: 2,
                                                background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                                                position: 'relative'
                                            }}>
                                                <FlightTakeoffIcon sx={{
                                                    position: 'absolute',
                                                    top: '50%',
                                                    left: '50%',
                                                    transform: 'translate(-50%, -50%) rotate(90deg)',
                                                    color: '#667eea',
                                                    bgcolor: 'white',
                                                    borderRadius: '50%',
                                                    p: 0.5
                                                }} />
                                            </Box>
                                        </Box>
                                        <Box sx={{ textAlign: 'center' }}>
                                            <Typography variant="h3" fontWeight="bold" color="primary">
                                                PRD
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                Production
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Box>

                                <Divider sx={{ my: 3 }} />

                                {/* Ticket Details */}
                                <Grid container spacing={3}>
                                    <Grid item xs={6} sm={3}>
                                        <Typography variant="overline" color="text.secondary" fontSize="0.65rem">
                                            PASSENGER
                                        </Typography>
                                        <Typography variant="body1" fontWeight="bold">
                                            Analytics Team
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={6} sm={3}>
                                        <Typography variant="overline" color="text.secondary" fontSize="0.65rem">
                                            CLASS
                                        </Typography>
                                        <Typography variant="body1" fontWeight="bold">
                                            Enterprise
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={6} sm={3}>
                                        <Typography variant="overline" color="text.secondary" fontSize="0.65rem">
                                            GATE
                                        </Typography>
                                        <Typography variant="body1" fontWeight="bold">
                                            ACDL
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={6} sm={3}>
                                        <Typography variant="overline" color="text.secondary" fontSize="0.65rem">
                                            SEAT
                                        </Typography>
                                        <Typography variant="body1" fontWeight="bold">
                                            1A
                                        </Typography>
                                    </Grid>
                                </Grid>

                                {/* Removed contact section from here - moved to right side */}
                            </Grid>

                            {/* Right Side - Contact Information & Booking Ref */}
                            <Grid item xs={12} md={4}>
                                <Box sx={{
                                    borderLeft: { md: '2px dashed #ddd' },
                                    borderTop: { xs: '2px dashed #ddd', md: 'none' },
                                    pl: { md: 4 },
                                    pt: { xs: 3, md: 0 }
                                }}>
                                    {/* Contact Section */}
                                    <Box sx={{ mb: 3 }}>
                                        <Typography variant="overline" color="text.secondary" fontWeight="bold" display="block" textAlign="center">
                                            CONTACT FOR COLLABORATION
                                        </Typography>

                                        <Box sx={{ textAlign: 'center', mt: 2 }}>
                                            <EmailIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
                                            <Typography variant="body1" fontWeight="bold" color="primary" gutterBottom>
                                                ritesh@thelearningproject.in
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
                                                Available for analytics discussions
                                            </Typography>

                                            <Button
                                                variant="contained"
                                                size="small"
                                                href="mailto:ritesh@thelearningproject.in"
                                                fullWidth
                                                sx={{
                                                    bgcolor: '#667eea',
                                                    fontWeight: 'bold',
                                                    '&:hover': {
                                                        bgcolor: '#764ba2'
                                                    }
                                                }}
                                                startIcon={<EmailIcon />}
                                            >
                                                Send Email
                                            </Button>
                                        </Box>
                                    </Box>

                                    <Divider sx={{ my: 2 }} />

                                    {/* Booking Reference & Barcode */}
                                    <Box sx={{ textAlign: 'center' }}>
                                        <Typography variant="overline" color="text.secondary" fontWeight="bold" fontSize="0.65rem">
                                            BOOKING REF
                                        </Typography>
                                        <Typography variant="h6" fontWeight="bold" color="primary" sx={{ mb: 1 }}>
                                            DEMO2024
                                        </Typography>

                                        {/* Barcode Simulation */}
                                        <Box sx={{
                                            display: 'flex',
                                            gap: '2px',
                                            justifyContent: 'center',
                                            mb: 1,
                                            height: 40
                                        }}>
                                            {[3, 1, 2, 1, 3, 2, 1, 3, 1, 2, 3, 1, 2, 1, 3].map((height, i) => (
                                                <Box
                                                    key={i}
                                                    sx={{
                                                        width: 3,
                                                        height: `${height * 13}px`,
                                                        bgcolor: 'black'
                                                    }}
                                                />
                                            ))}
                                        </Box>
                                        <Typography variant="caption" color="text.secondary">
                                            *DEMO TICKET*
                                        </Typography>
                                    </Box>
                                </Box>
                            </Grid>
                        </Grid>

                        {/* Description */}
                        <Box sx={{
                            mt: 4,
                            p: 3,
                            bgcolor: '#f8f9fa',
                            borderRadius: 2,
                            borderLeft: '4px solid #667eea'
                        }}>
                            <Typography variant="body1" color="text.secondary">
                                <strong>Welcome aboard!</strong> This is a demonstration flight booking application
                                built to showcase a complete e-commerce booking flow with comprehensive
                                Adobe Analytics data layer implementation. Fasten your seatbelt as we take you
                                through a journey of modern web development and analytics excellence.
                            </Typography>
                        </Box>
                    </Box>

                    {/* Perforated Edge Effect */}
                    <Box sx={{
                        height: 20,
                        background: 'repeating-linear-gradient(90deg, transparent, transparent 10px, #ddd 10px, #ddd 20px)',
                        borderTop: '2px dashed #ddd'
                    }} />
                </Paper>

                {/* Second Ticket - Technology & Features */}
                <Paper
                    sx={{
                        mb: 0,
                        background: 'white',
                        overflow: 'hidden',
                        position: 'relative',
                        boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
                    }}
                >
                    {/* Ticket Header */}
                    <Box sx={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        p: 3,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <Box>
                            <Typography variant="h5" fontWeight="bold">
                                Technical Specifications
                            </Typography>
                            <Typography variant="caption" sx={{ opacity: 0.9 }}>
                                TECHNOLOGY STACK & FEATURES
                            </Typography>
                        </Box>
                        <DataObjectIcon sx={{ fontSize: 40 }} />
                    </Box>

                    {/* Ticket Body */}
                    <Box sx={{ p: 5 }}>
                        {/* Technology Stack */}
                        <Box sx={{ mb: 5 }}>
                            <Typography variant="overline" color="text.secondary" fontWeight="bold" gutterBottom>
                                TECHNOLOGY STACK
                            </Typography>
                            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 2 }}>
                                <Chip label="Next.js 16 (React)" color="primary" />
                                <Chip label="Material-UI (MUI)" color="primary" />
                                <Chip label="Adobe Client Data Layer" color="primary" />
                                <Chip label="Adobe Launch" color="primary" />
                                <Chip label="Auth0 Authentication" color="primary" />
                                <Chip label="TypeScript" color="primary" />
                                <Chip label="Node.js Backend" color="primary" />
                            </Stack>
                        </Box>

                        <Divider sx={{ my: 4 }} />

                        {/* Booking Flow - Round Buttons */}
                        <Box sx={{ mb: 5 }}>
                            <Typography variant="overline" color="text.secondary" fontWeight="bold" gutterBottom>
                                5-STEP BOOKING FLOW
                            </Typography>
                            <Box sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                mt: 3,
                                flexWrap: 'wrap',
                                gap: 2
                            }}>
                                {bookingSteps.map((step, index) => {
                                    const IconComponent = step.icon;
                                    return (
                                        <Box key={index} sx={{ textAlign: 'center', flex: '1 1 auto', minWidth: 100 }}>
                                            <Box sx={{
                                                width: 80,
                                                height: 80,
                                                borderRadius: '50%',
                                                bgcolor: '#667eea',
                                                color: 'white',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                mx: 'auto',
                                                mb: 1,
                                                position: 'relative',
                                                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
                                            }}>
                                                <IconComponent sx={{ fontSize: 32 }} />
                                                <Box sx={{
                                                    position: 'absolute',
                                                    top: -8,
                                                    right: -8,
                                                    width: 24,
                                                    height: 24,
                                                    borderRadius: '50%',
                                                    bgcolor: '#764ba2',
                                                    color: 'white',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontSize: '0.75rem',
                                                    fontWeight: 'bold'
                                                }}>
                                                    {step.number}
                                                </Box>
                                            </Box>
                                            <Typography variant="caption" fontWeight="bold" color="text.primary">
                                                {step.title}
                                            </Typography>
                                        </Box>
                                    );
                                })}
                            </Box>
                        </Box>

                        <Divider sx={{ my: 4 }} />

                        {/* ACDL Features */}
                        <Box>
                            <Typography variant="overline" color="text.secondary" fontWeight="bold" gutterBottom>
                                ADOBE CLIENT DATA LAYER (ACDL)
                            </Typography>
                            <Typography variant="body1" color="text.secondary" paragraph sx={{ mt: 2 }}>
                                Production-ready implementation capturing comprehensive user interactions,
                                e-commerce events, and page context throughout the entire booking journey.
                            </Typography>

                            <Grid container spacing={2} sx={{ mt: 2 }}>
                                {dataLayerFeatures.map((feature, index) => (
                                    <Grid item xs={12} sm={6} key={index}>
                                        <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                                            <CheckCircleIcon color="success" sx={{ fontSize: 20, mr: 1, mt: 0.5 }} />
                                            <Typography variant="body2">{feature}</Typography>
                                        </Box>
                                    </Grid>
                                ))}
                            </Grid>

                            {/* Code Example */}
                            <Box sx={{ mt: 4, p: 3, bgcolor: '#f8f9fa', borderRadius: 2, border: '1px solid #ddd' }}>
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
                                        fontFamily: 'monospace',
                                        mt: 2
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
                        </Box>
                    </Box>

                    {/* Perforated Edge Effect */}
                    <Box sx={{
                        height: 20,
                        background: 'repeating-linear-gradient(90deg, transparent, transparent 10px, #ddd 10px, #ddd 20px)',
                        borderTop: '2px dashed #ddd'
                    }} />
                </Paper>
            </Container>
        </>
    );
}
