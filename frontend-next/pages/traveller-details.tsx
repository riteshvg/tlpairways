import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { useUser } from '@auth0/nextjs-auth0/client';
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
import BookingSteps from '../components/BookingSteps';
import { useAnalytics } from '../lib/analytics/useAnalytics';
import { pushUserContext } from '../lib/analytics/dataLayer';

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

// Generate PNR
function generatePNR(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let pnr = '';
    for (let i = 0; i < 6; i++) {
        pnr += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return pnr;
}

export default function TravellerDetailsPage() {
    const router = useRouter();
    const { user, isLoading } = useUser();
    const { trackPageView } = useAnalytics();
    const pageViewTracked = useRef(false); // Prevent duplicate page views
    const {
        onwardFlightId,
        returnFlightId,
        originCode,
        destinationCode,
        date,
        returnDate,
        adults = '1',
        children = '0',
        infants = '0',
        passengers = '1',
        cabinClass = 'economy',
        tripType = 'oneway',
        travelPurpose,
        paymentType,
    } = router.query;

    const userDataPushed = useRef(false);

    // Push independent userData object once when user is authenticated
    useEffect(() => {
        if (!isLoading && user && !userDataPushed.current) {
            pushUserContext({
                isAuthenticated: true,
                userId: user.sub || null,
                userSegment: 'registered'
            });
            userDataPushed.current = true;
            console.log('✅ Independent userData pushed on traveller-details');
        }
    }, [user, isLoading]);

    const [onwardFlight, setOnwardFlight] = useState<any>(null);
    const [returnFlight, setReturnFlight] = useState<any>(null);
    const [travellers, setTravellers] = useState<Traveller[]>([]);
    const [contactEmail, setContactEmail] = useState('yougotjunkedbro@gmail.com');
    const [contactPhone, setContactPhone] = useState('');
    const [showLoginBanner, setShowLoginBanner] = useState(true);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' as 'info' | 'success' | 'error' });

    // Random data generators
    const generateRandomName = () => {
        const firstNames = [
            'Aarav', 'Aditya', 'Akshay', 'Arjun', 'Deepak', 'Gaurav', 'Harsh', 'Karan', 'Manish', 'Nikhil',
            'Priya', 'Sneha', 'Anita', 'Kavya', 'Meera', 'Pooja', 'Riya', 'Sakshi', 'Tanya', 'Vidya'
        ];
        const lastNames = [
            'Sharma', 'Patel', 'Singh', 'Kumar', 'Gupta', 'Verma', 'Jain', 'Agarwal', 'Malhotra', 'Chopra',
            'Reddy', 'Nair', 'Iyer', 'Menon', 'Pillai', 'Rao', 'Joshi', 'Mehta', 'Agarwal', 'Bansal'
        ];
        return {
            firstName: firstNames[Math.floor(Math.random() * firstNames.length)],
            lastName: lastNames[Math.floor(Math.random() * lastNames.length)]
        };
    };

    const generateRandomEmail = (firstName: string, lastName: string) => {
        const domains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'rediffmail.com'];
        const domain = domains[Math.floor(Math.random() * domains.length)];
        return `${firstName.toLowerCase()}.${lastName.toLowerCase()}${Math.floor(Math.random() * 100)}@${domain}`;
    };

    const generateRandomPhone = () => {
        const prefixes = ['6', '7', '8', '9'];
        const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
        const remaining = Math.floor(Math.random() * 100000000).toString().padStart(8, '0');
        return prefix + remaining;
    };

    const generateRandomDateOfBirth = () => {
        const start = new Date(1950, 0, 1);
        const end = new Date(2005, 11, 31);
        const randomDate = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
        return format(randomDate, 'yyyy-MM-dd');
    };

    const generateRandomGender = () => {
        const genders = ['male', 'female', 'other'];
        return genders[Math.floor(Math.random() * genders.length)];
    };

    const generateRandomNationality = () => {
        const nationalities = [
            'Indian', 'American', 'British', 'Canadian', 'Australian', 'German', 'French', 'Italian', 'Spanish', 'Japanese'
        ];
        return nationalities[Math.floor(Math.random() * nationalities.length)];
    };

    const generateRandomPassportNumber = () => {
        const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const numbers = '0123456789';
        let passport = '';
        for (let i = 0; i < 2; i++) {
            passport += letters[Math.floor(Math.random() * letters.length)];
        }
        for (let i = 0; i < 7; i++) {
            passport += numbers[Math.floor(Math.random() * numbers.length)];
        }
        return passport;
    };

    const handleFillRandomDetails = () => {
        const updatedTravellers = travellers.map(() => {
            const { firstName, lastName } = generateRandomName();
            return {
                firstName,
                lastName,
                email: generateRandomEmail(firstName, lastName),
                phone: generateRandomPhone(),
                dateOfBirth: generateRandomDateOfBirth(),
                gender: generateRandomGender(),
                passportNumber: generateRandomPassportNumber(),
                nationality: generateRandomNationality(),
            };
        });

        setTravellers(updatedTravellers);

        // Keep the default test email, only fill phone number
        setContactPhone(generateRandomPhone());

        setSnackbar({
            open: true,
            message: `Filled random details for ${travellers.length} passenger${travellers.length > 1 ? 's' : ''}`,
            severity: 'success'
        });
    };

    const handleClearAllDetails = () => {
        const clearedTravellers = travellers.map(() => ({
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
            dateOfBirth: '',
            gender: '',
            passportNumber: '',
            nationality: '',
        }));

        setTravellers(clearedTravellers);
        setContactEmail('');
        setContactPhone('');

        setSnackbar({
            open: true,
            message: 'Cleared all passenger details',
            severity: 'info'
        });
    };

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

    // Track page view with booking context
    useEffect(() => {
        if (onwardFlight && date && !pageViewTracked.current) {
            const formatDate = (dateStr: string) => {
                const d = new Date(dateStr);
                return d.toISOString().split('T')[0];
            };

            const adultCount = parseInt(adults as string) || 1;
            const childCount = parseInt(children as string) || 0;
            const infantCount = parseInt(infants as string) || 0;
            const totalPassengers = adultCount + childCount + infantCount;

            const pnr = generatePNR();
            const searchId = `search_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;

            const bookingContext = {
                searchId,
                pnr,
                selectedFlights: {
                    onward: {
                        flightNumber: onwardFlight.flightNumber,
                        origin: onwardFlight.origin,
                        originCity: onwardFlight.originCity,
                        destination: onwardFlight.destination,
                        destinationCity: onwardFlight.destinationCity,
                        departureTime: onwardFlight.departureTime,
                        arrivalTime: onwardFlight.arrivalTime,
                        duration: onwardFlight.duration,
                        departureDate: formatDate(date as string),
                        cabinClass: cabinClass as string,
                        price: {
                            currency: 'INR',
                            amount: onwardFlight.currentPrice
                        }
                    },
                    ...(returnFlight ? {
                        return: {
                            flightNumber: returnFlight.flightNumber,
                            origin: returnFlight.origin,
                            originCity: returnFlight.originCity,
                            destination: returnFlight.destination,
                            destinationCity: returnFlight.destinationCity,
                            departureTime: returnFlight.departureTime,
                            arrivalTime: returnFlight.arrivalTime,
                            duration: returnFlight.duration,
                            departureDate: formatDate(returnDate as string),
                            cabinClass: cabinClass as string,
                            price: {
                                currency: 'INR',
                                amount: returnFlight.currentPrice
                            }
                        }
                    } : {})
                },
                totalPrice: (onwardFlight?.currentPrice || 0) + (returnFlight?.currentPrice || 0),
                tripType: tripType as string,
                passengers: {
                    total: totalPassengers,
                    breakdown: {
                        adults: adultCount,
                        children: childCount,
                        infants: infantCount
                    }
                },
                cabinClass: cabinClass as string,
                travelPurpose: travelPurpose as string,
                paymentType: paymentType as string,
                userContext: {
                    isLoggedIn: !!user,
                    userId: user?.sub || null
                }
            };

            trackPageView(
                {
                    pageType: 'booking',
                    pageName: 'Traveller Details',
                    pageTitle: 'Traveller Details - TLP Airways',
                    pageCategory: 'booking',
                    bookingStep: 'traveller-details',
                    bookingStepNumber: 1,
                    totalBookingSteps: 4,
                    sections: ['passengerForm', 'contactDetails', 'flightSummary']
                },
                { bookingContext }
            );

            // Mark as tracked
            pageViewTracked.current = true;
        }
    }, [onwardFlight, date, isLoading]); // Simplified dependencies - only track when flight data is ready

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

        window.location.href = `/ancillary-services?${queryParams.toString()}`;
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

            <BookingSteps activeStep={0} />

            <Container maxWidth="xl" sx={{ mt: 4, mb: 8 }}>
                {/* Optional Login Banner - Subtle & Dismissible */}
                {showLoginBanner && !user && (
                    <Alert
                        severity="info"
                        onClose={() => setShowLoginBanner(false)}
                        sx={{ mb: 3 }}
                        action={
                            <Button
                                color="inherit"
                                size="small"
                                onClick={() => {
                                    // Construct the current page URL with all query params to return after login
                                    const currentPath = window.location.pathname + window.location.search;
                                    window.location.href = `/auth/login?returnTo=${encodeURIComponent(currentPath)}`;
                                }}
                                sx={{ fontWeight: 'bold' }}
                            >
                                Sign In
                            </Button>
                        }
                    >
                        <Typography variant="body2">
                            <strong>Save time on future bookings!</strong> Sign in to auto-fill traveler details and earn loyalty points.
                        </Typography>
                    </Alert>
                )}

                <Typography variant="h4" gutterBottom>
                    Traveller Details
                </Typography>

                <Grid container spacing={4}>
                    {/* Left Column - Forms */}
                    <Grid size={{ xs: 12, md: 8 }}>
                        {/* Destination Personalization Banner - Adobe Target */}
                        <Box
                            id="destination-promo-banner"
                            data-mbox="traveller-destination-banner"
                            sx={{
                                mb: 4,
                                p: 0,
                                borderRadius: 2,
                                overflow: 'hidden',
                                height: 180,
                                background: 'linear-gradient(135deg, #1a237e 0%, #0d47a1 50%, #01579b 100%)',
                                position: 'relative',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            {/* Empty placeholder - Content will be injected by Adobe Target */}
                            {/* Decorative Elements */}
                            <Box
                                sx={{
                                    position: 'absolute',
                                    right: -20,
                                    top: -20,
                                    width: 200,
                                    height: 200,
                                    borderRadius: '50%',
                                    background: 'rgba(255,255,255,0.1)',
                                }}
                            />
                            <Box
                                sx={{
                                    position: 'absolute',
                                    right: 60,
                                    bottom: -40,
                                    width: 120,
                                    height: 120,
                                    borderRadius: '50%',
                                    background: 'rgba(255,255,255,0.05)',
                                }}
                            />
                            <Box
                                sx={{
                                    position: 'absolute',
                                    left: -30,
                                    bottom: -30,
                                    width: 150,
                                    height: 150,
                                    borderRadius: '50%',
                                    background: 'rgba(255,255,255,0.08)',
                                }}
                            />
                        </Box>

                        <form id="traveller-form" onSubmit={handleSubmit}>
                            {/* Contact Details */}
                            <Paper sx={{ p: 3, mb: 3 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                    <Typography variant="h6">
                                        Contact Information
                                    </Typography>
                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                        <Button
                                            variant="contained"
                                            color="secondary"
                                            size="small"
                                            onClick={handleFillRandomDetails}
                                            sx={{ fontSize: '0.75rem' }}
                                        >
                                            Fill Random Details
                                        </Button>
                                        <Button
                                            variant="outlined"
                                            size="small"
                                            onClick={handleClearAllDetails}
                                            sx={{ fontSize: '0.75rem' }}
                                        >
                                            Clear All
                                        </Button>
                                    </Box>
                                </Box>
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
                                        <Typography
                                            variant="caption"
                                            color="text.secondary"
                                            sx={{ mt: 0.5, display: 'block', fontSize: '0.75rem' }}
                                        >
                                            💡 Default test email is pre-filled. You can clear and enter your own email to receive booking confirmations.
                                        </Typography>
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

                            {/* Submit button moved to sidebar */}
                        </form>
                    </Grid>

                    {/* Right Column - Flight Summary */}
                    <Grid size={{ xs: 12, md: 4 }}>
                        <Paper sx={{ p: 3, position: 'sticky', top: 180 }}>
                            <Typography variant="h6" gutterBottom>
                                Flight Summary
                            </Typography>

                            {renderFlightPreview(onwardFlight, false)}
                            {returnFlight && renderFlightPreview(returnFlight, true)}

                            <Divider sx={{ my: 2 }} />

                            <Box sx={{ mt: 3 }}>
                                <Typography variant="h6" gutterBottom>
                                    Price Summary
                                </Typography>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                    <Box>
                                        <Typography fontWeight="medium">Onward Flight</Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {onwardFlight?.airline} {onwardFlight?.flightNumber}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {(cabinClass as string).charAt(0).toUpperCase() + (cabinClass as string).slice(1)} Class
                                        </Typography>
                                    </Box>
                                    <Box sx={{ textAlign: 'right' }}>
                                        <Typography>
                                            ₹{(onwardFlight?.currentPrice * parseInt(passengers as string)).toLocaleString()}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            (₹{onwardFlight?.currentPrice?.toLocaleString()} x {passengers} passenger{parseInt(passengers as string) > 1 ? 's' : ''})
                                        </Typography>
                                    </Box>
                                </Box>

                                {returnFlight && (
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, mt: 2 }}>
                                        <Box>
                                            <Typography fontWeight="medium">Return Flight</Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {returnFlight?.airline} {returnFlight?.flightNumber}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {(cabinClass as string).charAt(0).toUpperCase() + (cabinClass as string).slice(1)} Class
                                            </Typography>
                                        </Box>
                                        <Box sx={{ textAlign: 'right' }}>
                                            <Typography>
                                                ₹{(returnFlight?.currentPrice * parseInt(passengers as string)).toLocaleString()}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                (₹{returnFlight?.currentPrice?.toLocaleString()} x {passengers} passenger{parseInt(passengers as string) > 1 ? 's' : ''})
                                            </Typography>
                                        </Box>
                                    </Box>
                                )}

                                <Divider sx={{ my: 2 }} />

                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                    <Typography variant="subtitle1" fontWeight="bold">Total Price</Typography>
                                    <Box sx={{ textAlign: 'right' }}>
                                        <Typography variant="subtitle1" color="primary" fontWeight="bold">
                                            ₹{(totalPrice * parseInt(passengers as string)).toLocaleString()}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            (₹{totalPrice?.toLocaleString()} x {passengers} passenger{parseInt(passengers as string) > 1 ? 's' : ''})
                                        </Typography>
                                    </Box>
                                </Box>
                            </Box>

                            <Button
                                type="submit"
                                form="traveller-form"
                                variant="contained"
                                color="primary"
                                size="large"
                                fullWidth
                                sx={{ mt: 3, py: 1.5 }}
                            >
                                Continue to Add-ons
                            </Button>
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
