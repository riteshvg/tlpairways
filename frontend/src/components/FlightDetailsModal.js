import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Grid,
  Box,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
} from '@mui/material';
import {
  FlightTakeoff,
  FlightLand,
  AccessTime,
  AirplaneTicket,
  EventSeat,
  LocalAirport,
  Flight,
  Luggage,
  Restaurant,
  Wifi,
  LocalMovies,
  Security,
} from '@mui/icons-material';
import { format } from 'date-fns';

const FlightDetailsModal = ({ open, onClose, flight }) => {
  if (!flight) return null;

  const renderFlightSegment = (segment) => {
    // Parse the date strings into Date objects
    const departureDate = new Date(segment.departureTime);
    const arrivalDate = new Date(segment.arrivalTime);

    return (
      <Box key={segment.segmentId} sx={{ mb: 2 }}>
        <Typography variant="subtitle1" color="primary" gutterBottom>
          {segment.flightNumber}
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={5}>
            <Typography variant="body1">
              {format(departureDate, 'HH:mm')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {format(departureDate, 'MMM dd, yyyy')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {segment.origin.city} ({segment.origin.iata_code})
            </Typography>
          </Grid>
          <Grid item xs={2}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                {segment.duration}
              </Typography>
              <Divider sx={{ my: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  →
                </Typography>
              </Divider>
              <Typography variant="body2" color="text.secondary">
                {segment.aircraft}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={5}>
            <Typography variant="body1">
              {format(arrivalDate, 'HH:mm')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {format(arrivalDate, 'MMM dd, yyyy')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {segment.destination.city} ({segment.destination.iata_code})
            </Typography>
          </Grid>
        </Grid>
      </Box>
    );
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Typography variant="h5" component="div">
          Flight Details - {flight.flightNumber}
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          {flight.airline}
        </Typography>
      </DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={3}>
          {/* Flight Segments */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              {flight.segments ? 'Flight Itinerary' : 'Flight Details'}
            </Typography>
            {flight.segments ? (
              flight.segments.map((segment, index) => 
                renderFlightSegment(segment)
              )
            ) :
              <Box sx={{ mb: 3 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <FlightTakeoff sx={{ mr: 1 }} />
                      <Box>
                        <Typography variant="subtitle1">
                          {format(new Date(flight.departureTime), 'HH:mm')}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {flight.origin.iata_code}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {format(new Date(flight.departureTime), 'MMM dd, yyyy')}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <FlightLand sx={{ mr: 1 }} />
                      <Box>
                        <Typography variant="subtitle1">
                          {format(new Date(flight.arrivalTime), 'HH:mm')}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {flight.destination.iata_code}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {format(new Date(flight.arrivalTime), 'MMM dd, yyyy')}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <AccessTime sx={{ mr: 1 }} />
                  <Typography variant="body1">
                    Duration: {flight.duration}
                  </Typography>
                </Box>
              </Box>
            }
          </Grid>

          {/* Flight Information */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Flight Information
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon>
                  <AirplaneTicket />
                </ListItemIcon>
                <ListItemText 
                  primary="Price" 
                  secondary={`₹${typeof flight.price === 'object' 
                    ? flight.price.amount?.toLocaleString() 
                    : flight.price?.toLocaleString() || 'Price not available'}`} 
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <EventSeat />
                </ListItemIcon>
                <ListItemText 
                  primary="Available Seats" 
                  secondary={flight.availableSeats || 'Not available'} 
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <LocalAirport />
                </ListItemIcon>
                <ListItemText 
                  primary="Aircraft" 
                  secondary={flight.aircraft || 'Not available'} 
                />
              </ListItem>
            </List>
          </Grid>

          {/* Flight Details */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Additional Information
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon>
                  <Luggage />
                </ListItemIcon>
                <ListItemText 
                  primary="Baggage Allowance" 
                  secondary={`Cabin: ${flight.flightDetails?.baggageAllowance?.cabin || 'Not specified'}, Checked: ${flight.flightDetails?.baggageAllowance?.checked || 'Not specified'}`} 
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Restaurant />
                </ListItemIcon>
                <ListItemText 
                  primary="Meal Options" 
                  secondary={flight.meal_options?.map(meal => meal.name).join(', ') || 'No meal options available'} 
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Security />
                </ListItemIcon>
                <ListItemText 
                  primary="Safety Rating" 
                  secondary={flight.flightDetails?.safetyRecord?.safetyRating || 'Not available'} 
                />
              </ListItem>
            </List>
          </Grid>

          {/* Ancillary Services */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Available Services
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {flight.flightDetails?.ancillaryServices?.map((service, index) => (
                <Chip
                  key={index}
                  icon={
                    service.includes('WiFi') ? <Wifi /> :
                    service.includes('Entertainment') ? <LocalMovies /> :
                    <Restaurant />
                  }
                  label={service}
                  variant="outlined"
                />
              )) || (
                <Typography variant="body2" color="text.secondary">
                  No additional services available
                </Typography>
              )}
            </Box>
          </Grid>

          {/* Policies */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Policies
            </Typography>
            <List>
              <ListItem>
                <ListItemText 
                  primary="Cancellation Policy" 
                  secondary={flight.flightDetails?.cancellationPolicy || 'Not available'} 
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="Refund Policy" 
                  secondary={flight.flightDetails?.refundPolicy || 'Not available'} 
                />
              </ListItem>
            </List>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FlightDetailsModal; 