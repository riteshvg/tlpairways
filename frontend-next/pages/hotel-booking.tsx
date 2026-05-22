import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import {
    Box, Container, Typography, Paper, Grid, TextField, Button,
    FormControl, InputLabel, Select, MenuItem, Divider, Chip,
    Alert
} from '@mui/material';
import HotelIcon from '@mui/icons-material/Hotel';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PersonIcon from '@mui/icons-material/Person';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { addDays } from 'date-fns';
import { useAnalytics } from '../lib/analytics/useAnalytics';

interface GuestDetails {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
}

export default function HotelBookingPage() {
    const router = useRouter();
    const { trackPageView, trackCustomEvent } = useAnalytics();

    const {
        hotelId = '',
        hotelName = '',
        cityCode = '',
        city = '',
        country = '',
        pricePerNight = '0',
        category = 'luxury',
        checkIn: checkInParam = '',
        checkOut: checkOutParam = '',
        guests: guestsParam = '',
    } = router.query as Record<string, string>;

    const [checkIn, setCheckIn] = useState<Date | null>(addDays(new Date(), 14));
    const [checkOut, setCheckOut] = useState<Date | null>(addDays(new Date(), 17));
    const [rooms, setRooms] = useState(1);
    const [guests, setGuests] = useState(2);
    const [guest, setGuest] = useState<GuestDetails>({ firstName: '', lastName: '', email: '', phone: '' });
    const [errors, setErrors] = useState<Partial<GuestDetails>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!router.isReady) return;
        if (checkInParam) setCheckIn(new Date(checkInParam));
        if (checkOutParam) setCheckOut(new Date(checkOutParam));
        if (guestsParam) setGuests(Math.max(1, parseInt(guestsParam, 10)));
        trackPageView({
            pageType: 'hotel-booking',
            pageName: 'Hotel Booking',
            pageTitle: `Book ${hotelName} — TLP Airways`
        });
    }, [router.isReady, hotelName, checkInParam, checkOutParam, guestsParam]);

    const nights = checkIn && checkOut
        ? Math.max(1, Math.round((checkOut.getTime() - checkIn.getTime()) / 86400000))
        : 3;
    const pricePerNightNum = parseInt(pricePerNight, 10) || 0;
    const totalPrice = pricePerNightNum * nights * rooms;

    const formatCurrency = (n: number) =>
        new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

    const validate = () => {
        const errs: Partial<GuestDetails> = {};
        if (!guest.firstName.trim()) errs.firstName = 'Required';
        if (!guest.lastName.trim()) errs.lastName = 'Required';
        if (!guest.email.trim() || !/\S+@\S+\.\S+/.test(guest.email)) errs.email = 'Valid email required';
        if (!guest.phone.trim() || guest.phone.length < 7) errs.phone = 'Valid phone required';
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleConfirm = async () => {
        if (!validate()) return;
        setIsSubmitting(true);

        const bookingRef = `HTL${Date.now().toString().slice(-8).toUpperCase()}`;

        trackCustomEvent('hotelBookingInitiated', {
            hotelId,
            hotelName,
            cityCode,
            checkIn: checkIn?.toISOString(),
            checkOut: checkOut?.toISOString(),
            nights,
            rooms,
            guests,
            totalPrice
        });

        // Store booking data for confirmation page
        const confirmationData = {
            bookingType: 'hotel',
            bookingRef,
            hotelId,
            hotelName,
            city,
            country,
            category,
            checkIn: checkIn?.toISOString(),
            checkOut: checkOut?.toISOString(),
            nights,
            rooms,
            guests,
            pricePerNight: pricePerNightNum,
            totalPrice,
            guestName: `${guest.firstName} ${guest.lastName}`,
            guestEmail: guest.email,
            guestPhone: guest.phone,
        };

        sessionStorage.setItem('temp_hotel_confirmation', JSON.stringify(confirmationData));

        // Navigate to payment page with hotel context
        const params = new URLSearchParams({
            bookingType: 'hotel',
            hotelId,
            hotelName,
            city,
            nights: String(nights),
            rooms: String(rooms),
            totalPrice: String(totalPrice),
        });
        router.push(`/payment?${params.toString()}`);
    };

    if (!router.isReady) return null;

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Head>
                <title>Book {hotelName || 'Hotel'} — TLP Airways</title>
            </Head>

            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                    <HotelIcon color="primary" />
                    <Typography variant="h5" fontWeight={700}>Hotel Booking</Typography>
                    <Chip label="Via AI Travel Agent" size="small" sx={{ backgroundColor: '#E3F2FD', color: '#1565C0', fontSize: '0.65rem' }} />
                </Box>

                <Grid container spacing={3}>
                    {/* Left: Form */}
                    <Grid size={{ xs: 12, md: 8 }}>
                        {/* Hotel summary */}
                        <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 2.5, mb: 3 }}>
                            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                                <HotelIcon sx={{ color: '#6A1B9A', mt: 0.25 }} />
                                <Box>
                                    <Typography variant="h6" fontWeight={700}>{hotelName}</Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.25 }}>
                                        <LocationOnIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                                        <Typography variant="caption" color="text.secondary">{city}, {country}</Typography>
                                        <Chip label={category} size="small" sx={{ fontSize: '0.6rem', height: 18, textTransform: 'capitalize', ml: 0.5 }} variant="outlined" />
                                    </Box>
                                </Box>
                                <Box sx={{ ml: 'auto', textAlign: 'right' }}>
                                    <Typography variant="h6" fontWeight={700} color="secondary.main">{formatCurrency(pricePerNightNum)}</Typography>
                                    <Typography variant="caption" color="text.secondary">per night</Typography>
                                </Box>
                            </Box>
                        </Paper>

                        {/* Stay dates + room config */}
                        <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 2.5, mb: 3 }}>
                            <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>Stay Details</Typography>
                            <Grid container spacing={2}>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <DatePicker
                                        label="Check-in"
                                        value={checkIn}
                                        onChange={d => { setCheckIn(d); if (d && checkOut && d >= checkOut) setCheckOut(addDays(d, 1)); }}
                                        minDate={new Date()}
                                        slotProps={{ textField: { fullWidth: true, size: 'small' } }}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <DatePicker
                                        label="Check-out"
                                        value={checkOut}
                                        onChange={d => setCheckOut(d)}
                                        minDate={checkIn ? addDays(checkIn, 1) : addDays(new Date(), 1)}
                                        slotProps={{ textField: { fullWidth: true, size: 'small' } }}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <FormControl fullWidth size="small">
                                        <InputLabel>Rooms</InputLabel>
                                        <Select value={rooms} label="Rooms" onChange={e => setRooms(Number(e.target.value))}>
                                            {[1, 2, 3, 4].map(n => <MenuItem key={n} value={n}>{n} Room{n > 1 ? 's' : ''}</MenuItem>)}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <FormControl fullWidth size="small">
                                        <InputLabel>Guests</InputLabel>
                                        <Select value={guests} label="Guests" onChange={e => setGuests(Number(e.target.value))}>
                                            {[1, 2, 3, 4, 5, 6].map(n => <MenuItem key={n} value={n}>{n} Guest{n > 1 ? 's' : ''}</MenuItem>)}
                                        </Select>
                                    </FormControl>
                                </Grid>
                            </Grid>
                        </Paper>

                        {/* Guest details */}
                        <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 2.5, mb: 3 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                <PersonIcon color="primary" sx={{ fontSize: 20 }} />
                                <Typography variant="subtitle1" fontWeight={700}>Lead Guest Details</Typography>
                            </Box>
                            <Grid container spacing={2}>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <TextField fullWidth size="small" label="First Name" value={guest.firstName} onChange={e => setGuest(g => ({ ...g, firstName: e.target.value }))} error={!!errors.firstName} helperText={errors.firstName} required />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <TextField fullWidth size="small" label="Last Name" value={guest.lastName} onChange={e => setGuest(g => ({ ...g, lastName: e.target.value }))} error={!!errors.lastName} helperText={errors.lastName} required />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <TextField fullWidth size="small" label="Email" type="email" value={guest.email} onChange={e => setGuest(g => ({ ...g, email: e.target.value }))} error={!!errors.email} helperText={errors.email} required />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <TextField fullWidth size="small" label="Phone" value={guest.phone} onChange={e => setGuest(g => ({ ...g, phone: e.target.value }))} error={!!errors.phone} helperText={errors.phone} required />
                                </Grid>
                            </Grid>
                        </Paper>

                        <Alert severity="info" variant="outlined" sx={{ mb: 3 }}>
                            This is a demo booking — no real reservation will be made. Payment is simulated.
                        </Alert>
                    </Grid>

                    {/* Right: Price summary */}
                    <Grid size={{ xs: 12, md: 4 }}>
                        <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 2.5, position: 'sticky', top: 80 }}>
                            <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>Price Summary</Typography>

                            <Box sx={{ mb: 1.5 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                    <Typography variant="body2" color="text.secondary">{formatCurrency(pricePerNightNum)} × {nights} night{nights > 1 ? 's' : ''}</Typography>
                                    <Typography variant="body2">{formatCurrency(pricePerNightNum * nights)}</Typography>
                                </Box>
                                {rooms > 1 && (
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                        <Typography variant="body2" color="text.secondary">× {rooms} rooms</Typography>
                                        <Typography variant="body2">{formatCurrency(pricePerNightNum * nights * rooms)}</Typography>
                                    </Box>
                                )}
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                    <Typography variant="body2" color="text.secondary">Taxes & fees (18%)</Typography>
                                    <Typography variant="body2">{formatCurrency(totalPrice * 0.18)}</Typography>
                                </Box>
                            </Box>

                            <Divider sx={{ my: 1.5 }} />

                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                <Typography variant="subtitle1" fontWeight={700}>Total</Typography>
                                <Typography variant="subtitle1" fontWeight={700} color="primary.main">
                                    {formatCurrency(totalPrice * 1.18)}
                                </Typography>
                            </Box>

                            <Button
                                fullWidth
                                variant="contained"
                                size="large"
                                onClick={handleConfirm}
                                disabled={isSubmitting}
                                sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700 }}
                            >
                                Proceed to Payment
                            </Button>
                            <Button
                                fullWidth
                                variant="text"
                                size="small"
                                onClick={() => router.push('/travel-agent')}
                                sx={{ mt: 1, textTransform: 'none', color: 'text.secondary' }}
                            >
                                ← Back to Travel Agent
                            </Button>
                        </Paper>
                    </Grid>
                </Grid>
            </Container>
        </LocalizationProvider>
    );
}
