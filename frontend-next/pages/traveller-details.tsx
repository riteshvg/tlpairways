import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
    Container,
    Paper,
    Typography,
    TextField,
    Button,
    Grid,
    Box,
    Divider,
    Card,
    CardContent,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Snackbar,
    Alert,
} from '@mui/material';
import Head from 'next/head';
import { format } from 'date-fns';
import flightsData from '../data/flights.json';

interface Traveller {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    dateOfBirth: string;
    gender: string;
    passportNumber: string;
    nationality: string;
}

export default function TravellerDetailsPage() {
    const router = useRouter();
    const {
        onwardFlightId,
        returnFlightId,
        originCode,
        destinationCode,
        date,
        returnDate,
        passengers = '1',
        cabinClass = 'economy',
        tripType = 'oneway',
    } = router.query;

    const [onwardFlight, setOnwardFlight] = useState<any>(null);
    const [returnFlight, setReturnFlight] = useState<any>(null);
    const [travellers, setTravellers] = useState<Traveller[]>([]);
    const [contactEmail, setContactEmail] = useState('');
    const [contactPhone, setContactPhone] = useState('');
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' as 'info' | 'success' | 'error' });

    // Load flights from data
    useEffect(() => {
        if (onwardFlightId) {
            const allFlights = (flightsData as any).flights || [];
            const onward = allFlights.find((f: any) => f.id === onwardFlightId);
            if (onward) {
                // Calculate price for cabin class
                const basePrice = onward.price;
                const prices = {
                    economy: basePrice,
                    premium_economy: Math.round(basePrice * 1.3),
                    business: Math.round(basePrice * 1.7),
                    first: Math.round(basePrice * 2.2)
                };
                setOnwardFlight({
                    ...onward,
                    prices,
                    currentPrice: (prices as any)[cabinClass as string] || basePrice,
                });
            }
        }

        if (returnFlightId) {
            const allFlights = (flightsData as any).flights || [];
            const returnFlt = allFlights.find((f: any) => f.id === returnFlightId);
            if (returnFlt) {
                const basePrice = returnFlt.price;
                const prices = {
                    economy: basePrice,
                    premium_economy: Math.round(basePrice * 1.3),
                    business: Math.round(basePrice * 1.7),
                    first: Math.round(basePrice * 2.2)
                };
                setReturnFlight({
                    ...returnFlt,
                    prices,
                    currentPrice: (prices as any)[cabinClass as string] || basePrice,
                });
            }
        }
    }, [onwardFlightId, returnFlightId, cabinClass]);

    // Initialize travellers
    useEffect(() => {
        const passengerCount = parseInt(passengers as string) || 1;
        setTravellers(
            Array.from({ length: passengerCount }, () => ({
                firstName: '',
                lastName: '',
                email: '',
                phone: '',
                dateOfBirth: '',
                gender: '',
                passportNumber: '',
                nationality: '',
            }))
        );
    }, [passengers]);

    const handleTravellerChange = (index: number, field: keyof Traveller, value: string) => {
        const newTravellers = [...travellers];
        newTravellers[index] = {
            ...newTravellers[index],
            [field]: value,
        };
        setTravellers(newTravellers);
    };

    const validateForm = () => {
        if (!contactEmail || !contactPhone) {
            setSnackbar({ open: true, message: 'Please fill contact details', severity: 'error' });
            return false;
        }

        for (const traveller of travellers) {
            if (!traveller.firstName || !traveller.lastName || !traveller.dateOfBirth || !traveller.gender) {
                setSnackbar({ open: true, message: 'Please fill all traveller details', severity: 'error' });
                return false;
            }
        }

        return true;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        // Navigate to payment page with full page reload
        const queryParams = new URLSearchParams({
            onwardFlightId: onwardFlightId as string,
            returnFlightId: returnFlightId as string || '',
            originCode: originCode as string,
            destinationCode: destinationCode as string,
            date: date as string,
            returnDate: returnDate as string || '',
            passengers: passengers as string,
            cabinClass: cabinClass as string,
            tripType: tripType as string,
            contactEmail,
            contactPhone,
            travellers: JSON.stringify(travellers),
        });

        window.location.href = `/payment?${queryParams.toString()}`;
    };

    const renderFlightPreview = (flight: any, isReturn: boolean = false) => {
        if (!flight) return null;

        return (
            <Card sx={{ mb: 2 }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        {isReturn ? 'Return Flight' : 'Onward Flight'}
                    </Typography>
                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12, md: 4 }}>
                            <Typography variant="subtitle1">{flight.departureTime}</Typography>
                            <Typography variant="body2" color="text.secondary">
                                {flight.originCity}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {date && format(new Date(isReturn ? (returnDate as string) : (date as string)), 'MMM dd, yyyy')}
                            </Typography>
                        </Grid>
                        <Grid size={{ xs: 12, md: 4 }}>
                            <Box sx={{ textAlign: 'center' }}>
                                <Typography variant="body2" color="text.secondary">
                                    {flight.duration}
                                </Typography>
                                <Divider sx={{ my: 1 }} />
                                <Typography variant="body2" color="text.secondary">
                                    {flight.stops.length === 0 ? 'Direct Flight' : `${flight.stops.length} stop(s)`}
                                </Typography>
                            </Box>
                        </Grid>
                        <Grid size={{ xs: 12, md: 4 }}>
                            <Typography variant="subtitle1">{flight.arrivalTime}</Typography>
                            <Typography variant="body2" color="text.secondary">
                                {flight.destinationCity}
                            </Typography>
                        </Grid>
                    </Grid>
                    <Divider sx={{ my: 2 }} />
                    <Grid container spacing={2}>
                        <Grid size={{ xs: 6 }}>
                            <Typography variant="body2" color="text.secondary" fontWeight="medium">
                                Flight Number
                            </Typography>
                            <Typography variant="body1">{flight.flightNumber}</Typography>
                        </Grid>
                        <Grid size={{ xs: 6 }}>
                            <Typography variant="body2" color="text.secondary" fontWeight="medium">
                                Cabin Class
                            </Typography>
                            <Typography variant="body1">
                                {(cabinClass as string).charAt(0).toUpperCase() + (cabinClass as string).slice(1)}
                            </Typography>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>
        );
    };

    if (!onwardFlight) {
        return (
            <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
                <Typography>Loading flight details...</Typography>
            </Container>
        );
    }

    const totalPrice = (onwardFlight?.currentPrice || 0) + (returnFlight?.currentPrice || 0);

    return (
        <>
            <Head>
                <title>Traveller Details - TLAirways</title>
                <meta name="description" content="Enter traveller details for your booking" />
            </Head>

            <Container maxWidth="xl" sx={{ mt: 4, mb: 8 }}>
                <Typography variant="h4" gutterBottom>
                    Traveller Details
                </Typography>

                <Grid container spacing={4}>
                    {/* Left Column - Forms */}
                    <Grid size={{ xs: 12, md: 8 }}>
                        <form onSubmit={handleSubmit}>
                            {/* Traveller Details */}
                            {travellers.map((traveller, index) => (
                                <Paper key={index} sx={{ p: 3, mb: 3 }}>
                                    <Typography variant="h6" gutterBottom>
                                        Passenger {index + 1}
                                    </Typography>
                                    <Grid container spacing={2}>
                                        <Grid size={{ xs: 12, md: 6 }}>
                                            <TextField
                                                fullWidth
                                                label="First Name"
                                                required
                                                value={traveller.firstName}
                                                onChange={(e) => handleTravellerChange(index, 'firstName', e.target.value)}
                                            />
                                        </Grid>
                                        <Grid size={{ xs: 12, md: 6 }}>
                                            <TextField
                                                fullWidth
                                                label="Last Name"
                                                required
                                                value={traveller.lastName}
                                                onChange={(e) => handleTravellerChange(index, 'lastName', e.target.value)}
                                            />
                                        </Grid>
                                        <Grid size={{ xs: 12, md: 6 }}>
                                            <TextField
                                                fullWidth
                                                label="Date of Birth"
                                                type="date"
                                                required
                                                InputLabelProps={{ shrink: true }}
                                                value={traveller.dateOfBirth}
                                                onChange={(e) => handleTravellerChange(index, 'dateOfBirth', e.target.value)}
                                            />
                                        </Grid>
                                        <Grid size={{ xs: 12, md: 6 }}>
                                            <FormControl fullWidth required>
                                                <InputLabel>Gender</InputLabel>
                                                <Select
                                                    value={traveller.gender}
                                                    label="Gender"
                                                    onChange={(e) => handleTravellerChange(index, 'gender', e.target.value)}
                                                >
                                                    <MenuItem value="male">Male</MenuItem>
                                                    <MenuItem value="female">Female</MenuItem>
                                                    <MenuItem value="other">Other</MenuItem>
                                                </Select>
                                            </FormControl>
                                        </Grid>
                                        <Grid size={{ xs: 12, md: 6 }}>
                                            <TextField
                                                fullWidth
                                                label="Passport Number"
                                                value={traveller.passportNumber}
                                                onChange={(e) => handleTravellerChange(index, 'passportNumber', e.target.value)}
                                            />
                                        </Grid>
                                        <Grid size={{ xs: 12, md: 6 }}>
                                            <TextField
                                                fullWidth
                                                label="Nationality"
                                                value={traveller.nationality}
                                                onChange={(e) => handleTravellerChange(index, 'nationality', e.target.value)}
                                            />
                                        </Grid>
                                    </Grid>
                                </Paper>
                            ))}

                            {/* Contact Details */}
                            <Paper sx={{ p: 3, mb: 3 }}>
                                <Typography variant="h6" gutterBottom>
                                    Contact Information
                                </Typography>
                                <Grid container spacing={2}>
                                    <Grid size={{ xs: 12, md: 6 }}>
                                        <TextField
                                            fullWidth
                                            label="Email"
                                            type="email"
                                            required
                                            value={contactEmail}
                                            onChange={(e) => setContactEmail(e.target.value)}
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 12, md: 6 }}>
                                        <TextField
                                            fullWidth
                                            label="Phone"
                                            type="tel"
                                            required
                                            value={contactPhone}
                                            onChange={(e) => setContactPhone(e.target.value)}
                                        />
                                    </Grid>
                                </Grid>
                            </Paper>

                            <Button
                                type="submit"
                                variant="contained"
                                color="primary"
                                size="large"
                                fullWidth
                                sx={{ py: 1.5 }}
                            >
                                Continue to Payment
                            </Button>
                        </form>
                    </Grid>

                    {/* Right Column - Flight Summary */}
                    <Grid size={{ xs: 12, md: 4 }}>
                        <Paper sx={{ p: 3, position: 'sticky', top: 20 }}>
                            <Typography variant="h6" gutterBottom>
                                Flight Summary
                            </Typography>

                            {renderFlightPreview(onwardFlight, false)}
                            {returnFlight && renderFlightPreview(returnFlight, true)}

                            <Divider sx={{ my: 2 }} />

                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography variant="body1">Passengers:</Typography>
                                <Typography variant="body1">{passengers}</Typography>
                            </Box>

                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                <Typography variant="h6">Total:</Typography>
                                <Typography variant="h6" color="primary">
                                    ₹{(totalPrice * parseInt(passengers as string)).toLocaleString()}
                                </Typography>
                            </Box>
                        </Paper>
                    </Grid>
                </Grid>

                <Snackbar
                    open={snackbar.open}
                    autoHideDuration={6000}
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                >
                    <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
                        {snackbar.message}
                    </Alert>
                </Snackbar>
            </Container>
        </>
    );
}
