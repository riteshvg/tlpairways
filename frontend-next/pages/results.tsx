import { useRouter } from 'next/router';
import {
    Container,
    Typography,
    Paper,
    Box,
    Card,
    CardContent,
    Button,
    Grid,
    Chip,
    Divider,
} from '@mui/material';
import Head from 'next/head';
import Link from 'next/link';
import FlightIcon from '@mui/icons-material/Flight';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';

/**
 * Results Page - MPA Version
 * 
 * Displays mock flight search results based on URL parameters
 */
export default function ResultsPage() {
    const router = useRouter();
    const { from, to, departDate, passengers = '1', tripType } = router.query;

    // Mock flight data
    const mockFlights = [
        {
            id: 1,
            airline: 'TL Airways',
            flightNumber: 'TL101',
            departure: '06:00',
            arrival: '08:30',
            duration: '2h 30m',
            price: 3499,
            stops: 'Non-stop',
        },
        {
            id: 2,
            airline: 'TL Airways',
            flightNumber: 'TL203',
            departure: '10:15',
            arrival: '12:45',
            duration: '2h 30m',
            price: 2999,
            stops: 'Non-stop',
        },
        {
            id: 3,
            airline: 'TL Airways',
            flightNumber: 'TL305',
            departure: '14:30',
            arrival: '17:00',
            duration: '2h 30m',
            price: 3299,
            stops: 'Non-stop',
        },
        {
            id: 4,
            airline: 'TL Airways',
            flightNumber: 'TL407',
            departure: '18:45',
            arrival: '21:15',
            duration: '2h 30m',
            price: 3799,
            stops: 'Non-stop',
        },
    ];

    const cityNames: Record<string, string> = {
        BOM: 'Mumbai',
        DEL: 'Delhi',
        BLR: 'Bangalore',
        HYD: 'Hyderabad',
        MAA: 'Chennai',
        CCU: 'Kolkata',
        PNQ: 'Pune',
        AMD: 'Ahmedabad',
    };

    const fromCity = cityNames[from as string] || from;
    const toCity = cityNames[to as string] || to;

    return (
        <>
            <Head>
                <title>Search Results - {fromCity} to {toCity} - TLAirways</title>
                <meta name="description" content={`Flights from ${fromCity} to ${toCity}`} />
            </Head>

            <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
                {/* Search Summary */}
                <Paper sx={{ p: 3, mb: 4 }}>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} md={8}>
                            <Typography variant="h5" gutterBottom>
                                <FlightIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                                {fromCity} ({from}) → {toCity} ({to})
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                                <Chip label={`${departDate}`} size="small" />
                                <Chip label={`${passengers} Passenger${Number(passengers) > 1 ? 's' : ''}`} size="small" />
                                <Chip label={tripType === 'round-trip' ? 'Round Trip' : 'One Way'} size="small" color="primary" />
                            </Box>
                        </Grid>
                        <Grid item xs={12} md={4} sx={{ textAlign: { md: 'right' } }}>
                            <Button
                                component={Link}
                                href="/search"
                                variant="outlined"
                            >
                                Modify Search
                            </Button>
                        </Grid>
                    </Grid>
                </Paper>

                {/* Results Header */}
                <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" gutterBottom>
                        Available Flights ({mockFlights.length})
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Showing flights for {departDate}
                    </Typography>
                </Box>

                {/* Flight Cards */}
                {mockFlights.map((flight) => (
                    <Card key={flight.id} sx={{ mb: 2 }}>
                        <CardContent>
                            <Grid container spacing={2} alignItems="center">
                                {/* Airline & Flight Number */}
                                <Grid item xs={12} md={2}>
                                    <Typography variant="subtitle1" fontWeight="bold">
                                        {flight.airline}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {flight.flightNumber}
                                    </Typography>
                                </Grid>

                                {/* Departure */}
                                <Grid item xs={4} md={2}>
                                    <Typography variant="h6">{flight.departure}</Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {from}
                                    </Typography>
                                </Grid>

                                {/* Duration */}
                                <Grid item xs={4} md={2}>
                                    <Box sx={{ textAlign: 'center' }}>
                                        <AccessTimeIcon color="action" sx={{ fontSize: 20 }} />
                                        <Typography variant="body2">{flight.duration}</Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {flight.stops}
                                        </Typography>
                                    </Box>
                                </Grid>

                                {/* Arrival */}
                                <Grid item xs={4} md={2}>
                                    <Typography variant="h6">{flight.arrival}</Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {to}
                                    </Typography>
                                </Grid>

                                {/* Price */}
                                <Grid item xs={6} md={2}>
                                    <Box sx={{ textAlign: { md: 'right' } }}>
                                        <Typography variant="h5" color="primary" fontWeight="bold">
                                            ₹{flight.price.toLocaleString()}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            per person
                                        </Typography>
                                    </Box>
                                </Grid>

                                {/* Book Button */}
                                <Grid item xs={6} md={2}>
                                    <Button
                                        variant="contained"
                                        fullWidth
                                        onClick={() => {
                                            // In real app, would navigate to booking
                                            alert(`Booking ${flight.flightNumber} - ₹${flight.price * Number(passengers)}`);
                                        }}
                                    >
                                        Book Now
                                    </Button>
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>
                ))}

                {/* No Results Message */}
                {mockFlights.length === 0 && (
                    <Paper sx={{ p: 6, textAlign: 'center' }}>
                        <Typography variant="h6" gutterBottom>
                            No flights found
                        </Typography>
                        <Typography variant="body2" color="text.secondary" paragraph>
                            Try adjusting your search criteria
                        </Typography>
                        <Button component={Link} href="/search" variant="contained">
                            New Search
                        </Button>
                    </Paper>
                )}

                {/* MPA Info */}
                <Paper sx={{ p: 3, mt: 4, bgcolor: 'success.light' }}>
                    <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                        ✅ MPA Advantage: SEO & Sharing
                    </Typography>
                    <Typography variant="body2">
                        Notice the URL contains all search parameters. This page is:
                    </Typography>
                    <Box component="ul" sx={{ mt: 1, mb: 0 }}>
                        <li><Typography variant="body2">✅ Shareable (copy URL to share search)</Typography></li>
                        <li><Typography variant="body2">✅ Bookmarkable (save for later)</Typography></li>
                        <li><Typography variant="body2">✅ SEO-friendly (search engines can index)</Typography></li>
                        <li><Typography variant="body2">✅ Adobe tracking works perfectly (no race conditions)</Typography></li>
                    </Box>
                </Paper>
            </Container>
        </>
    );
}
