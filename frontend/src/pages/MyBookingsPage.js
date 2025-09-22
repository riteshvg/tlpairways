import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import useUserAnalytics from '../hooks/useUserAnalytics';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  FlightTakeoff as FlightIcon,
  CalendarToday as CalendarIcon,
  LocationOn as LocationIcon,
  Person as PersonIcon,
  Receipt as ReceiptIcon,
  Cancel as CancelIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const MyBookingsPage = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { trackBookingHistoryView } = useUserAnalytics();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);

  // Mock data - in a real app, this would come from your backend
  useEffect(() => {
    if (isAuthenticated) {
      // Track booking history view
      trackBookingHistoryView({
        totalBookings: 3,
        activeBookings: 2,
        cancelledBookings: 1,
        filterApplied: 'none',
        sortBy: 'date',
        dateRange: 'all',
        pageNumber: 1
      });
      
      // Simulate API call
      setTimeout(() => {
        setBookings([
          {
            id: 'BK001',
            flightNumber: 'TL101',
            origin: 'Delhi (DEL)',
            destination: 'Mumbai (BOM)',
            departureDate: '2024-03-20',
            departureTime: '08:00',
            arrivalTime: '10:15',
            passengers: 2,
            totalAmount: 9000,
            status: 'Confirmed',
            bookingDate: '2024-03-15',
            cabinClass: 'Economy',
          },
          {
            id: 'BK002',
            flightNumber: 'TL205',
            origin: 'Mumbai (BOM)',
            destination: 'London (LHR)',
            departureDate: '2024-04-10',
            departureTime: '14:30',
            arrivalTime: '18:45',
            passengers: 1,
            totalAmount: 45000,
            status: 'Confirmed',
            bookingDate: '2024-03-20',
            cabinClass: 'Business',
          },
          {
            id: 'BK003',
            flightNumber: 'TL301',
            origin: 'Delhi (DEL)',
            destination: 'Bangalore (BLR)',
            departureDate: '2024-02-15',
            departureTime: '16:00',
            arrivalTime: '18:30',
            passengers: 1,
            totalAmount: 5200,
            status: 'Completed',
            bookingDate: '2024-02-10',
            cabinClass: 'Economy',
          },
        ]);
        setLoading(false);
      }, 1000);
    } else {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const handleCancelBooking = (booking) => {
    setSelectedBooking(booking);
    setCancelDialogOpen(true);
  };

  const confirmCancelBooking = () => {
    // In a real app, this would call your backend API
    setBookings(bookings.filter(booking => booking.id !== selectedBooking.id));
    setCancelDialogOpen(false);
    setSelectedBooking(null);
  };

  const handleDownloadTicket = (booking) => {
    // In a real app, this would generate and download the ticket
    console.log('Downloading ticket for booking:', booking.id);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Confirmed':
        return 'success';
      case 'Pending':
        return 'warning';
      case 'Cancelled':
        return 'error';
      case 'Completed':
        return 'info';
      default:
        return 'default';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          My Bookings
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your flight bookings and reservations
        </Typography>
      </Box>

      {bookings.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <FlightIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              No Bookings Found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              You haven't made any bookings yet. Start exploring our flights!
            </Typography>
            <Button
              variant="contained"
              startIcon={<FlightIcon />}
              onClick={() => navigate('/search')}
            >
              Book a Flight
            </Button>
          </CardContent>
        </Card>
      ) : (
        <TableContainer component={Paper} elevation={2}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Booking ID</TableCell>
                <TableCell>Flight</TableCell>
                <TableCell>Route</TableCell>
                <TableCell>Date & Time</TableCell>
                <TableCell>Passengers</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {bookings.map((booking) => (
                <TableRow key={booking.id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {booking.id}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" fontWeight="medium">
                        {booking.flightNumber}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {booking.cabinClass}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2">
                        {booking.origin} → {booking.destination}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2">
                        {booking.departureDate}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {booking.departureTime} - {booking.arrivalTime}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {booking.passengers} {booking.passengers === 1 ? 'Passenger' : 'Passengers'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {formatCurrency(booking.totalAmount)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={booking.status}
                      color={getStatusColor(booking.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Box display="flex" gap={1}>
                      <IconButton
                        size="small"
                        onClick={() => handleDownloadTicket(booking)}
                        title="Download Ticket"
                      >
                        <DownloadIcon fontSize="small" />
                      </IconButton>
                      {booking.status === 'Confirmed' && (
                        <IconButton
                          size="small"
                          onClick={() => handleCancelBooking(booking)}
                          title="Cancel Booking"
                          color="error"
                        >
                          <CancelIcon fontSize="small" />
                        </IconButton>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Cancel Booking Dialog */}
      <Dialog open={cancelDialogOpen} onClose={() => setCancelDialogOpen(false)}>
        <DialogTitle>Cancel Booking</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to cancel booking {selectedBooking?.id}? 
            This action cannot be undone and you may be subject to cancellation fees.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelDialogOpen(false)}>Keep Booking</Button>
          <Button onClick={confirmCancelBooking} color="error" variant="contained">
            Cancel Booking
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default MyBookingsPage;
