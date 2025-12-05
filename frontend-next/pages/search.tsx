import { useState } from 'react';
import { useRouter } from 'next/router';
import {
    Container,
    Typography,
    Paper,
    TextField,
    Button,
    Grid,
    Box,
    MenuItem,
    Chip,
} from '@mui/material';
import Head from 'next/head';
import SearchIcon from '@mui/icons-material/Search';
import FlightIcon from '@mui/icons-material/Flight';

/**
 * Search Page - MPA Version
 * 
 * Flight search form with:
 * - Origin/destination selection
 * - Date selection
 * - Passenger count
 * - Trip type (one-way/round-trip)
 */
export default function SearchPage() {
    const router = useRouter();

    // Pre-fill from URL params if available
    const [searchData, setSearchData] = useState({
        from: router.query.from || '',
        to: router.query.to || '',
        departDate: '',
        returnDate: '',
        passengers: 1,
        tripType: 'one-way',
    });

    // Major Indian cities
    const cities = [
        { code: 'BOM', name: 'Mumbai' },
        { code: 'DEL', name: 'Delhi' },
        { code: 'BLR', name: 'Bangalore' },
        { code: 'HYD', name: 'Hyderabad' },
        { code: 'MAA', name: 'Chennai' },
        { code: 'CCU', name: 'Kolkata' },
        { code: 'PNQ', name: 'Pune' },
        { code: 'AMD', name: 'Ahmedabad' },
    ];

    const handleChange = (field: string) => (event: any) => {
        setSearchData({
            ...searchData,
            [field]: event.target.value,
        });
    };

    const handleSearch = () => {
        // Build query params
        const params = new URLSearchParams({
            from: searchData.from,
            to: searchData.to,
            departDate: searchData.departDate,
            passengers: searchData.passengers.toString(),
            tripType: searchData.tripType,
        });

        if (searchData.tripType === 'round-trip' && searchData.returnDate) {
            params.append('returnDate', searchData.returnDate);
        }

        // Navigate to results page
        router.push(`/results?${params.toString()}`);
    };

    const isValid = searchData.from && searchData.to && searchData.departDate;

    return (
        <>
            <Head>
                <title>Search Flights - TLAirways</title>
                <meta name="description" content="Search for flights across India" />
            </Head>

            <Container maxWidth="md" sx={{ mt: 8, mb: 8 }}>
                <Paper elevation={3} sx={{ p: 4 }}>
                    {/* Header */}
                    <Box sx={{ textAlign: 'center', mb: 4 }}>
                        <FlightIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                        <Typography variant="h4" component="h1" gutterBottom>
                            Search Flights
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            Find the best flights across India
                        </Typography>
                    </Box>

                    {/* Trip Type */}
                    <Box sx={{ mb: 3 }}>
                        <Button
                            variant={searchData.tripType === 'one-way' ? 'contained' : 'outlined'}
                            onClick={() => setSearchData({ ...searchData, tripType: 'one-way' })}
                            sx={{ mr: 2 }}
                        >
                            One Way
                        </Button>
                        <Button
                            variant={searchData.tripType === 'round-trip' ? 'contained' : 'outlined'}
                            onClick={() => setSearchData({ ...searchData, tripType: 'round-trip' })}
                        >
                            Round Trip
                        </Button>
                    </Box>

                    {/* Search Form */}
                    <Grid container spacing={3}>
                        {/* From */}
                        <Grid item xs={12} md={6}>
                            <TextField
                                select
                                fullWidth
                                label="From"
                                value={searchData.from}
                                onChange={handleChange('from')}
                                required
                            >
                                {cities.map((city) => (
                                    <MenuItem key={city.code} value={city.code}>
                                        {city.name} ({city.code})
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>

                        {/* To */}
                        <Grid item xs={12} md={6}>
                            <TextField
                                select
                                fullWidth
                                label="To"
                                value={searchData.to}
                                onChange={handleChange('to')}
                                required
                            >
                                {cities.map((city) => (
                                    <MenuItem key={city.code} value={city.code}>
                                        {city.name} ({city.code})
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>

                        {/* Depart Date */}
                        <Grid item xs={12} md={searchData.tripType === 'round-trip' ? 6 : 12}>
                            <TextField
                                fullWidth
                                type="date"
                                label="Departure Date"
                                value={searchData.departDate}
                                onChange={handleChange('departDate')}
                                InputLabelProps={{ shrink: true }}
                                inputProps={{ min: new Date().toISOString().split('T')[0] }}
                                required
                            />
                        </Grid>

                        {/* Return Date (if round-trip) */}
                        {searchData.tripType === 'round-trip' && (
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    type="date"
                                    label="Return Date"
                                    value={searchData.returnDate}
                                    onChange={handleChange('returnDate')}
                                    InputLabelProps={{ shrink: true }}
                                    inputProps={{ min: searchData.departDate || new Date().toISOString().split('T')[0] }}
                                />
                            </Grid>
                        )}

                        {/* Passengers */}
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                type="number"
                                label="Passengers"
                                value={searchData.passengers}
                                onChange={handleChange('passengers')}
                                inputProps={{ min: 1, max: 9 }}
                            />
                        </Grid>
                    </Grid>

                    {/* Search Button */}
                    <Box sx={{ mt: 4, textAlign: 'center' }}>
                        <Button
                            variant="contained"
                            size="large"
                            startIcon={<SearchIcon />}
                            onClick={handleSearch}
                            disabled={!isValid}
                            sx={{ minWidth: 200 }}
                        >
                            Search Flights
                        </Button>
                    </Box>

                    {/* MPA Info */}
                    <Box sx={{ mt: 4, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                            <strong>MPA Note:</strong> This page uses URL parameters instead of React context.
                            Search params will be in the URL, making it shareable and SEO-friendly!
                        </Typography>
                    </Box>
                </Paper>

                {/* Quick Links */}
                <Box sx={{ mt: 4, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                        Popular Routes:
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', flexWrap: 'wrap' }}>
                        <Chip label="BOM → DEL" onClick={() => setSearchData({ ...searchData, from: 'BOM', to: 'DEL' })} />
                        <Chip label="DEL → BLR" onClick={() => setSearchData({ ...searchData, from: 'DEL', to: 'BLR' })} />
                        <Chip label="BLR → HYD" onClick={() => setSearchData({ ...searchData, from: 'BLR', to: 'HYD' })} />
                        <Chip label="HYD → MAA" onClick={() => setSearchData({ ...searchData, from: 'HYD', to: 'MAA' })} />
                    </Box>
                </Box>
            </Container>
        </>
    );
}
