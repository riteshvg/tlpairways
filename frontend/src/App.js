import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Auth0Provider } from '@auth0/auth0-react';
import theme from './theme/theme';
import { auth0Config } from './config/auth0Config';
import { AuthProvider } from './context/AuthContext';
import { BookingTimerProvider } from './context/BookingTimerContext';
import { ConsentProvider } from './context/ConsentContext';
import ConsentExperience from './components/consent/ConsentExperience';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import UserProfilePage from './pages/UserProfilePage';
import MyBookingsPage from './pages/MyBookingsPage';
import SettingsPage from './pages/SettingsPage';
import ScriptManagerPage from './pages/ScriptManagerPage';
import FlightSearch from './components/FlightSearch';
import SearchResults from './components/SearchResults';
import TravellerDetails from './components/TravellerDetails';
import AncillaryServices from './components/AncillaryServices';
import Payment from './components/Payment';
import BookingConfirmation from './components/BookingConfirmation';
import ProtectedRoute from './components/protected/ProtectedRoute';
import globalClickTracker from './services/GlobalClickTracker';
// Page View Tracker Component - REMOVED
// Individual pages now handle their own page view tracking

function App() {
  // Initialize global click tracking
  useEffect(() => {
    globalClickTracker.init();

    // Log build version for debugging
    console.log('🚀 TLAirways App - Build Version: 2025-01-17-v2');
    console.log('✅ Latest changes: City names fixed, seat selection fixed, payment methods updated');

    // Cleanup on unmount
    return () => {
      globalClickTracker.destroy();
    };
  }, []);

  return (
    <Auth0Provider {...auth0Config}>
      <AuthProvider>
        <BookingTimerProvider>
          <ConsentProvider>
            <ThemeProvider theme={theme}>
              <CssBaseline />
              <Router>
                <Navbar />
                <ConsentExperience />
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/search" element={<FlightSearch />} />
                  <Route path="/search-results" element={<SearchResults />} />
                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute requireAuth={true}>
                        <UserProfilePage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/my-bookings"
                    element={
                      <ProtectedRoute requireAuth={true}>
                        <MyBookingsPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/settings"
                    element={
                      <ProtectedRoute requireAuth={true}>
                        <SettingsPage />
                      </ProtectedRoute>
                    }
                  />
                  {/* Script Manager - public access */}
                  <Route path="/script-manager" element={<ScriptManagerPage />} />
                  {/* Booking flow - guest access allowed */}
                  <Route path="/traveller-details" element={<TravellerDetails />} />
                  <Route path="/ancillary-services" element={<AncillaryServices />} />
                  <Route path="/payment" element={<Payment />} />
                  <Route path="/confirmation" element={<BookingConfirmation />} />
                </Routes>
              </Router>
            </ThemeProvider>
          </ConsentProvider>
        </BookingTimerProvider>
      </AuthProvider>
    </Auth0Provider>
  );
}

export default App; // Build Version: 20251016_163000
