import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Auth0Provider } from '@auth0/auth0-react';
import theme from './theme/theme';
import { auth0Config } from './config/auth0Config';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import UserProfilePage from './pages/UserProfilePage';
import MyBookingsPage from './pages/MyBookingsPage';
import SettingsPage from './pages/SettingsPage';
import FlightSearch from './components/FlightSearch';
import SearchResults from './components/SearchResults';
import TravellerDetails from './components/TravellerDetails';
import AncillaryServices from './components/AncillaryServices';
import Payment from './components/Payment';
import BookingConfirmation from './components/BookingConfirmation';
import ProtectedRoute from './components/protected/ProtectedRoute';
import analytics from './services/analytics';

// Page View Tracker Component
function PageViewTracker() {
  const location = useLocation();

  React.useEffect(() => {
    if (location.pathname === '/') {
      // Only fire once per mount (i.e., on initial load or refresh)
      analytics.pageView('Homepage');
    }
    // No dependency on location, so this effect only runs on mount/unmount
    // eslint-disable-next-line
  }, []);

  return null;
}

function App() {
  return (
    <Auth0Provider {...auth0Config}>
      <AuthProvider>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Router>
            <PageViewTracker />
            <Navbar />
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/search" element={<FlightSearch />} />
              <Route path="/search-results" element={<SearchResults />} />
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute>
                    <UserProfilePage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/my-bookings" 
                element={
                  <ProtectedRoute>
                    <MyBookingsPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/settings" 
                element={
                  <ProtectedRoute>
                    <SettingsPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/traveller-details" 
                element={
                  <ProtectedRoute>
                    <TravellerDetails />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/ancillary-services" 
                element={
                  <ProtectedRoute>
                    <AncillaryServices />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/payment" 
                element={
                  <ProtectedRoute>
                    <Payment />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/confirmation" 
                element={
                  <ProtectedRoute>
                    <BookingConfirmation />
                  </ProtectedRoute>
                } 
              />
            </Routes>
          </Router>
        </ThemeProvider>
      </AuthProvider>
    </Auth0Provider>
  );
}

export default App; 