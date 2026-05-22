import { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import {
    Box, Container, Typography, Paper, Button, Chip, Divider, Grid
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HotelIcon from '@mui/icons-material/Hotel';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PersonIcon from '@mui/icons-material/Person';
import { useAnalytics } from '../lib/analytics/useAnalytics';

interface HotelConfirmationData {
    bookingType: string;
    bookingRef: string;
    hotelId: string;
    hotelName: string;
    city: string;
    country: string;
    category: string;
    checkIn: string;
    checkOut: string;
    nights: number;
    rooms: number;
    guests: number;
    pricePerNight: number;
    totalPrice: number;
    guestName: string;
    guestEmail: string;
    guestPhone: string;
}

export default function HotelConfirmationPage() {
    const router = useRouter();
    const { trackPageView, trackCustomEvent } = useAnalytics();
    const [data, setData] = useState<HotelConfirmationData | null>(null);

    useEffect(() => {
        const raw = sessionStorage.getItem('temp_hotel_confirmation');
        if (raw) {
            const parsed = JSON.parse(raw) as HotelConfirmationData;
            setData(parsed);
            sessionStorage.removeItem('temp_hotel_confirmation');

            trackPageView({
                pageType: 'hotel-confirmation',
                pageName: 'Hotel Confirmation',
                pageTitle: `Booking Confirmed — ${parsed.hotelName}`
            });

            trackCustomEvent('hotelBookingConfirmed', {
                bookingRef: parsed.bookingRef,
                hotelName: parsed.hotelName,
                city: parsed.city,
                nights: parsed.nights,
                totalPrice: parsed.totalPrice
            });
        } else {
            router.replace('/travel-agent');
        }
    }, []);

    if (!data) return null;

    const formatCurrency = (n: number) =>
        new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

    const formatDate = (iso: string) =>
        new Date(iso).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });

    return (
        <>
            <Head>
                <title>Hotel Confirmed — {data.hotelName}</title>
            </Head>

            <Container maxWidth="md" sx={{ py: 5 }}>
                {/* Success header */}
                <Box sx={{ textAlign: 'center', mb: 4 }}>
                    <CheckCircleIcon sx={{ fontSize: 64, color: 'success.main', mb: 1.5 }} />
                    <Typography variant="h4" fontWeight={700} gutterBottom>Hotel Booking Confirmed!</Typography>
                    <Typography variant="body1" color="text.secondary">
                        A confirmation has been sent to <strong>{data.guestEmail}</strong>
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mt: 1.5 }}>
                        <Chip
                            label={`Booking Ref: ${data.bookingRef}`}
                            sx={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.85rem', px: 1, backgroundColor: '#E8F5E9', color: '#2E7D32', border: '1px solid #A5D6A7' }}
                        />
                    </Box>
                </Box>

                {/* Booking details card */}
                <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, overflow: 'hidden', mb: 3 }}>
                    {/* Hotel name */}
                    <Box sx={{ p: 3, bgcolor: '#F3E5F5', display: 'flex', alignItems: 'center', gap: 2 }}>
                        <HotelIcon sx={{ fontSize: 32, color: '#6A1B9A' }} />
                        <Box>
                            <Typography variant="h6" fontWeight={700}>{data.hotelName}</Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <LocationOnIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                                <Typography variant="body2" color="text.secondary">{data.city}, {data.country}</Typography>
                                <Chip label={data.category} size="small" sx={{ fontSize: '0.6rem', height: 18, textTransform: 'capitalize', ml: 0.5 }} variant="outlined" />
                            </Box>
                        </Box>
                    </Box>

                    <Box sx={{ p: 3 }}>
                        <Grid container spacing={3}>
                            {/* Dates */}
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                                    <CalendarTodayIcon sx={{ color: 'primary.main', mt: 0.25 }} />
                                    <Box>
                                        <Typography variant="caption" color="text.secondary" fontWeight={600} display="block">STAY DATES</Typography>
                                        <Typography variant="body2" fontWeight={600}>{formatDate(data.checkIn)}</Typography>
                                        <Typography variant="caption" color="text.secondary">Check-in · {data.nights} night{data.nights > 1 ? 's' : ''} · {data.rooms} room{data.rooms > 1 ? 's' : ''}</Typography>
                                        <Typography variant="body2" fontWeight={600} display="block" sx={{ mt: 0.5 }}>{formatDate(data.checkOut)}</Typography>
                                        <Typography variant="caption" color="text.secondary">Check-out</Typography>
                                    </Box>
                                </Box>
                            </Grid>

                            {/* Guest */}
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                                    <PersonIcon sx={{ color: 'primary.main', mt: 0.25 }} />
                                    <Box>
                                        <Typography variant="caption" color="text.secondary" fontWeight={600} display="block">LEAD GUEST</Typography>
                                        <Typography variant="body2" fontWeight={600}>{data.guestName}</Typography>
                                        <Typography variant="caption" color="text.secondary">{data.guestEmail}</Typography>
                                        <Typography variant="body2" color="text.secondary" display="block">{data.guestPhone}</Typography>
                                        <Typography variant="caption" color="text.secondary">{data.guests} guest{data.guests > 1 ? 's' : ''}</Typography>
                                    </Box>
                                </Box>
                            </Grid>
                        </Grid>

                        <Divider sx={{ my: 2.5 }} />

                        {/* Pricing */}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Box>
                                <Typography variant="caption" color="text.secondary">{formatCurrency(data.pricePerNight)}/night × {data.nights} nights × {data.rooms} room{data.rooms > 1 ? 's' : ''} + taxes</Typography>
                            </Box>
                            <Box sx={{ textAlign: 'right' }}>
                                <Typography variant="h6" fontWeight={700} color="primary.main">
                                    {formatCurrency(data.totalPrice * 1.18)}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">Total paid</Typography>
                            </Box>
                        </Box>
                    </Box>
                </Paper>

                {/* Actions */}
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                    <Button
                        variant="contained"
                        onClick={() => router.push('/travel-agent')}
                        sx={{ borderRadius: 2, textTransform: 'none', px: 3 }}
                    >
                        Plan Another Trip
                    </Button>
                    <Button
                        variant="outlined"
                        onClick={() => router.push('/')}
                        sx={{ borderRadius: 2, textTransform: 'none', px: 3 }}
                    >
                        Back to Home
                    </Button>
                </Box>
            </Container>
        </>
    );
}
