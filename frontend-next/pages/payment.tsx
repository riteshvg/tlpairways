import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
    Container,
    Paper,
    Typography,
    Grid,
    Box,
    Button,
    Divider,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Radio,
    RadioGroup,
    FormControlLabel,
    Alert,
    CircularProgress,
    Snackbar,
    FormHelperText,
    Stack
} from '@mui/material';
import Head from 'next/head';
import { format } from 'date-fns';
import flightsData from '../data/flights.json';
import BookingSteps from '../components/BookingSteps';
import AdobeDataLayer from '../components/AdobeDataLayer';

// Constants matching SPA
const CURRENCY_CONFIG = {
    formatPrice: (amount: number, currency = 'INR') => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: currency,
            maximumFractionDigits: 0
        }).format(amount);
    }
};

export default function PaymentPage() {
    const router = useRouter();
    const query = router.query;

    // --- State ---
    const [loading, setLoading] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('credit');
    const [paymentVendor, setPaymentVendor] = useState('');
    const [cardNumber, setCardNumber] = useState('');
    const [expiryDate, setExpiryDate] = useState('');
    const [cvv, setCvv] = useState('');
    const [billingName, setBillingName] = useState('');
    const [validationErrors, setValidationErrors] = useState<any>({});
    const [snackbar, setSnackbar] = useState({ open: false, message: '' });

    // --- Data ---
    const [onwardFlight, setOnwardFlight] = useState<any>(null);
    const [returnFlight, setReturnFlight] = useState<any>(null);
    const [ancillaryServices, setAncillaryServices] = useState<any>({ onward: {}, return: {} });
    const [travellers, setTravellers] = useState<any[]>([]);

    const paymentVendors: any = {
        credit: ['Visa', 'Mastercard', 'American Express', 'Diners Club', 'RuPay'],
        debit: ['Visa Debit', 'Mastercard Debit', 'RuPay Debit', 'Maestro'],
        netbanking: ['HDFC Bank', 'ICICI Bank', 'State Bank of India', 'Axis Bank', 'Kotak Mahindra Bank',
            'Punjab National Bank', 'Bank of Baroda', 'Canara Bank', 'Union Bank', 'IDBI Bank'],
        upi: ['UPI']
    };

    // --- Initialization ---
    useEffect(() => {
        if (!router.isReady) return;

        const {
            onwardFlightId,
            returnFlightId,
            ancillary,
            travellers: travellersJson,
            cabinClass = 'economy'
        } = query;

        // Parse Travellers
        if (travellersJson) {
            try {
                setTravellers(JSON.parse(travellersJson as string));
            } catch (e) {
                console.error("Failed to parse travellers", e);
            }
        }

        // Parse Ancillary
        if (ancillary) {
            try {
                setAncillaryServices(JSON.parse(ancillary as string));
            } catch (e) {
                console.error("Failed to parse ancillary", e);
            }
        }

        // Load Flights
        const allFlights = (flightsData as any).flights || [];
        if (onwardFlightId) {
            const f = allFlights.find((x: any) => x.id === onwardFlightId);
            if (f) {
                const basePrice = f.price;
                const multiplier = cabinClass === 'business' ? 1.7 : cabinClass === 'first' ? 2.2 : 1;
                setOnwardFlight({ ...f, currentPrice: Math.round(basePrice * multiplier), cabinClass });
            }
        }
        if (returnFlightId) {
            const f = allFlights.find((x: any) => x.id === returnFlightId);
            if (f) {
                const basePrice = f.price;
                const multiplier = cabinClass === 'business' ? 1.7 : cabinClass === 'first' ? 2.2 : 1;
                setReturnFlight({ ...f, currentPrice: Math.round(basePrice * multiplier), cabinClass });
            }
        }

    }, [router.isReady, router.query]);

    // --- Calculations ---
    const calculateAncillaryTotal = () => {
        let total = 0;
        const BAGGAGE_PRICES = { 5: 1500, 10: 2800, 15: 4000, 20: 5000 };

        ['onward', 'return'].forEach(direction => {
            const services = ancillaryServices[direction];
            if (!services) return;

            Object.values(services).forEach((sel: any) => {
                if (sel.baggage) {
                    total += (BAGGAGE_PRICES[sel.baggage as keyof typeof BAGGAGE_PRICES] || 0);
                }
                if (sel.seatPrice) {
                    total += sel.seatPrice;
                }
                // Priority/Lounge not implemented in previous step yet
            });
        });
        return total;
    };

    const numPassengers = travellers.length || parseInt(query.passengers as string) || 1;
    const flightTotal = ((onwardFlight?.currentPrice || 0) * numPassengers) +
        ((returnFlight?.currentPrice || 0) * numPassengers);

    const ancillaryTotal = calculateAncillaryTotal();
    const baseFare = flightTotal; // Simplify for now
    const taxes = Math.round(baseFare * 0.05);
    const convenienceFee = Math.round(baseFare * 0.02);
    const surcharge = Math.round(baseFare * 0.01);
    const totalAmount = baseFare + ancillaryTotal + taxes + convenienceFee + surcharge;

    // --- Handlers ---
    const validateForm = () => {
        const errors: any = {};
        if (!paymentVendor) errors.paymentVendor = 'Please select a vendor';

        if (paymentMethod === 'credit' || paymentMethod === 'debit') {
            if (!cardNumber || !/^\d{16}$/.test(cardNumber)) errors.cardNumber = 'Invalid card number';
            if (!expiryDate || !/^\d{2}\/\d{2}$/.test(expiryDate)) errors.expiryDate = 'Invalid expiry (MM/YY)';
            if (!cvv || !/^\d{3,4}$/.test(cvv)) errors.cvv = 'Invalid CVV';
            if (!billingName) errors.billingName = 'Name required';
        } else if (paymentMethod === 'upi') {
            if (!billingName) errors.billingName = 'UPI ID required';
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handlePaymentSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        setLoading(true);

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Prepare Payment Data
        const paymentData = {
            method: paymentMethod,
            vendor: paymentVendor,
            amount: totalAmount,
            transactionId: `TXN_${Date.now()}_MPA`,
            date: new Date().toISOString()
        };

        // Construct confirmation URL parameters
        // We need to pass EVERYTHING to confirmation because we don't have a backend session
        const params = new URLSearchParams();

        // Pass essential IDs and simple data
        params.append('paymentMethod', paymentMethod);
        params.append('transactionId', paymentData.transactionId);
        params.append('amount', totalAmount.toString());

        // We might hit URL length limits if we pass everything. 
        // For MPA demo without backend, maybe we store large objects in sessionStorage 
        // and just pass a reference or rely on the fact that we are in the browser?
        // Let's try passing what we can, but use sessionStorage for the heavy JSONs to be safe like the SPA does for restored state.

        sessionStorage.setItem('temp_confirmation_data', JSON.stringify({
            onwardFlight,
            returnFlight,
            travellers,
            ancillaryServices,
            paymentData,
            query: router.query
        }));

        window.location.href = '/confirmation?source=storage';
    };

    if (!onwardFlight) {
        return <Container><Box sx={{ mt: 4, textAlign: 'center' }}><CircularProgress /></Box></Container>;
    }

    return (
        <>
            <Head>
                <title>Payment - TLAirways</title>
            </Head>

            <AdobeDataLayer pageData={{
                pageType: 'booking',
                pageName: 'Payment',
                pageSection: 'booking',
                pageSubSection: 'payment'
            }} />

            <BookingSteps activeStep={2} />

            <Container maxWidth="xl" sx={{ mt: 4, mb: 10 }}>
                <Grid container spacing={4}>
                    {/* Payment Form - Left */}
                    <Grid size={{ xs: 12, md: 8 }} sx={{ order: { xs: 2, md: 1 } }}>
                        <Paper sx={{ p: 4 }}>
                            <Typography variant="h5" gutterBottom>Payment Details</Typography>

                            <form onSubmit={handlePaymentSubmit}>
                                <FormControl component="fieldset" sx={{ mb: 3 }}>
                                    <RadioGroup row value={paymentMethod} onChange={(e) => {
                                        setPaymentMethod(e.target.value);
                                        setPaymentVendor('');
                                    }}>
                                        <FormControlLabel value="credit" control={<Radio />} label="Credit Card" />
                                        <FormControlLabel value="debit" control={<Radio />} label="Debit Card" />
                                        <FormControlLabel value="upi" control={<Radio />} label="UPI" />
                                        <FormControlLabel value="netbanking" control={<Radio />} label="Net Banking" />
                                    </RadioGroup>
                                </FormControl>

                                <Grid container spacing={3}>
                                    <Grid size={{ xs: 12 }}>
                                        <FormControl fullWidth required error={!!validationErrors.paymentVendor}>
                                            <InputLabel>
                                                {paymentMethod === 'netbanking' ? 'Select Bank' : 'Card/Network'}
                                            </InputLabel>
                                            <Select
                                                value={paymentVendor}
                                                label={paymentMethod === 'netbanking' ? 'Select Bank' : 'Card/Network'}
                                                onChange={(e) => setPaymentVendor(e.target.value)}
                                            >
                                                {paymentVendors[paymentMethod]?.map((v: string) => (
                                                    <MenuItem key={v} value={v}>{v}</MenuItem>
                                                ))}
                                            </Select>
                                            {validationErrors.paymentVendor && <FormHelperText>{validationErrors.paymentVendor}</FormHelperText>}
                                        </FormControl>
                                    </Grid>

                                    {(paymentMethod === 'credit' || paymentMethod === 'debit') && (
                                        <>
                                            <Grid size={{ xs: 12 }}>
                                                <TextField
                                                    fullWidth
                                                    label="Card Number"
                                                    value={cardNumber}
                                                    onChange={(e) => setCardNumber(e.target.value)}
                                                    error={!!validationErrors.cardNumber}
                                                    helperText={validationErrors.cardNumber}
                                                    inputProps={{ maxLength: 16 }}
                                                />
                                            </Grid>
                                            <Grid size={{ xs: 12 }}>
                                                <TextField
                                                    fullWidth
                                                    label="Name on Card"
                                                    value={billingName}
                                                    onChange={(e) => setBillingName(e.target.value)}
                                                    error={!!validationErrors.billingName}
                                                    helperText={validationErrors.billingName}
                                                />
                                            </Grid>
                                            <Grid size={{ xs: 6 }}>
                                                <TextField
                                                    fullWidth
                                                    label="Expiry (MM/YY)"
                                                    value={expiryDate}
                                                    onChange={(e) => setExpiryDate(e.target.value)}
                                                    error={!!validationErrors.expiryDate}
                                                    helperText={validationErrors.expiryDate}
                                                    inputProps={{ maxLength: 5 }}
                                                />
                                            </Grid>
                                            <Grid size={{ xs: 6 }}>
                                                <TextField
                                                    fullWidth
                                                    label="CVV"
                                                    type="password"
                                                    value={cvv}
                                                    onChange={(e) => setCvv(e.target.value)}
                                                    error={!!validationErrors.cvv}
                                                    helperText={validationErrors.cvv}
                                                    inputProps={{ maxLength: 4 }}
                                                />
                                            </Grid>
                                        </>
                                    )}

                                    {paymentMethod === 'upi' && (
                                        <Grid size={{ xs: 12 }}>
                                            <TextField
                                                fullWidth
                                                label="UPI ID (e.g. user@bank)"
                                                value={billingName}
                                                onChange={(e) => setBillingName(e.target.value)}
                                                error={!!validationErrors.billingName}
                                                helperText={validationErrors.billingName}
                                            />
                                        </Grid>
                                    )}

                                    {paymentMethod === 'netbanking' && (
                                        <Grid size={{ xs: 12 }}>
                                            <Alert severity="info">
                                                You will be redirected to {paymentVendor || 'your bank'} to complete payment.
                                            </Alert>
                                        </Grid>
                                    )}
                                </Grid>

                                <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                                    <Button variant="outlined" disabled={loading} onClick={() => router.back()}>
                                        Back
                                    </Button>
                                    <Button
                                        type="submit"
                                        variant="contained"
                                        size="large"
                                        disabled={loading}
                                    >
                                        {loading ? <CircularProgress size={24} /> : `Pay ₹${totalAmount.toLocaleString()}`}
                                    </Button>
                                </Box>
                            </form>
                        </Paper>
                    </Grid>

                    {/* Summary - Right */}
                    <Grid size={{ xs: 12, md: 4 }} sx={{ order: { xs: 1, md: 2 } }}>
                        <Paper sx={{ p: 3, position: 'sticky', top: 120 }}>
                            <Typography variant="h6" gutterBottom>Booking Summary</Typography>

                            {/* Flights */}
                            <Box sx={{ mb: 3 }}>
                                <Typography fontWeight="bold" color="primary" gutterBottom>
                                    {onwardFlight.originCity} → {onwardFlight.destinationCity}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {format(new Date(query.date as string || new Date()), 'EEE, dd MMM yyyy')}
                                </Typography>
                                {returnFlight && (
                                    <>
                                        <Divider sx={{ my: 1 }} />
                                        <Typography fontWeight="bold" color="primary" gutterBottom>
                                            {returnFlight.originCity} → {returnFlight.destinationCity}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {format(new Date(query.returnDate as string || new Date()), 'EEE, dd MMM yyyy')}
                                        </Typography>
                                    </>
                                )}
                            </Box>

                            <Divider sx={{ mb: 2 }} />

                            <Typography variant="h6" gutterBottom>Price Breakdown</Typography>

                            <Stack spacing={1}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography variant="body2">Base Fare ({numPassengers} pax)</Typography>
                                    <Typography variant="body2">₹{baseFare.toLocaleString()}</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography variant="body2">Taxes (5%)</Typography>
                                    <Typography variant="body2">₹{taxes.toLocaleString()}</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography variant="body2">Convenience Fee (2%)</Typography>
                                    <Typography variant="body2">₹{convenienceFee.toLocaleString()}</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography variant="body2">Surcharge (1%)</Typography>
                                    <Typography variant="body2">₹{surcharge.toLocaleString()}</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography variant="body2">Ancillary Services</Typography>
                                    <Typography variant="body2">₹{ancillaryTotal.toLocaleString()}</Typography>
                                </Box>

                                <Divider sx={{ my: 1 }} />

                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography variant="h6">Total Amount</Typography>
                                    <Typography variant="h6" color="primary">₹{totalAmount.toLocaleString()}</Typography>
                                </Box>
                            </Stack>
                        </Paper>
                    </Grid>
                </Grid>
            </Container>
        </>
    );
}
