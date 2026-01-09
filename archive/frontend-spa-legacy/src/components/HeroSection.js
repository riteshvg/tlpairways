import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  ToggleButtonGroup,
  ToggleButton,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import { useNavigate } from 'react-router-dom';

const HeroSection = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const [tripType, setTripType] = useState('oneway');
  const [departureDate, setDepartureDate] = useState(null);
  const [returnDate, setReturnDate] = useState(null);
  const [passengers, setPassengers] = useState(1);

  const handleSearch = () => {
    // Navigate to search page with form data
    navigate('/search', {
      state: {
        tripType,
        departureDate,
        returnDate,
        passengers,
      },
    });
  };

  return (
    <Box
      sx={{
        position: 'relative',
        height: '80vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundImage: 'url(https://images.unsplash.com/photo-1436491865332-7a61a109cc05?ixlib=rb-4.0.3)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
        },
      }}
    >
      <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1 }}>
        <Grid container spacing={4} alignItems="center">
          <Grid item xs={12} md={6}>
            <Box sx={{ color: 'white', textAlign: isMobile ? 'center' : 'left' }}>
              <Typography
                variant="h1"
                sx={{
                  fontFamily: 'Garamond, serif',
                  fontWeight: 700,
                  mb: 2,
                  fontSize: isMobile ? '2.5rem' : '3.5rem',
                }}
              >
                Discover Your Next Adventure
              </Typography>
              <Typography
                variant="h5"
                sx={{
                  mb: 4,
                  fontWeight: 400,
                  fontSize: isMobile ? '1.25rem' : '1.5rem',
                }}
              >
                Experience premium air travel with TLAirways
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper
              elevation={3}
              sx={{
                p: 4,
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                borderRadius: 2,
              }}
            >
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <ToggleButtonGroup
                    value={tripType}
                    exclusive
                    onChange={(e, value) => value && setTripType(value)}
                    fullWidth
                  >
                    <ToggleButton value="oneway">One Way</ToggleButton>
                    <ToggleButton value="roundtrip">Round Trip</ToggleButton>
                  </ToggleButtonGroup>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="From"
                    variant="outlined"
                    placeholder="City or Airport"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="To"
                    variant="outlined"
                    placeholder="City or Airport"
                  />
                </Grid>
                <Grid item xs={12} md={tripType === 'roundtrip' ? 6 : 12}>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                      label="Departure Date"
                      value={departureDate}
                      onChange={(newValue) => setDepartureDate(newValue)}
                      renderInput={(params) => (
                        <TextField {...params} fullWidth />
                      )}
                      minDate={new Date()}
                    />
                  </LocalizationProvider>
                </Grid>
                {tripType === 'roundtrip' && (
                  <Grid item xs={12} md={6}>
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                      <DatePicker
                        label="Return Date"
                        value={returnDate}
                        onChange={(newValue) => setReturnDate(newValue)}
                        renderInput={(params) => (
                          <TextField {...params} fullWidth />
                        )}
                        minDate={departureDate || new Date()}
                      />
                    </LocalizationProvider>
                  </Grid>
                )}
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel>Passengers</InputLabel>
                    <Select
                      value={passengers}
                      onChange={(e) => setPassengers(e.target.value)}
                      label="Passengers"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                        <MenuItem key={num} value={num}>
                          {num} {num === 1 ? 'Passenger' : 'Passengers'}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    onClick={handleSearch}
                    startIcon={<FlightTakeoffIcon />}
                    sx={{
                      py: 1.5,
                      mt: 2,
                      backgroundColor: 'primary.main',
                      '&:hover': {
                        backgroundColor: 'primary.dark',
                      },
                    }}
                  >
                    Search Flights
                  </Button>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default HeroSection; 