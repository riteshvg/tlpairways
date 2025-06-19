import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme/theme';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import FlightSearch from './components/FlightSearch';
import SearchResults from './components/SearchResults';
import TravellerDetails from './components/TravellerDetails';
import AncillaryServices from './components/AncillaryServices';
import Payment from './components/Payment';
import BookingConfirmation from './components/BookingConfirmation';
import analytics from './services/analytics';

// Page View Tracker Component
function PageViewTracker() {
  console.log('PageViewTracker component rendered');
  const location = useLocation();

  useEffect(() => {
    // Don't track page view for confirmation page as it has its own event
    if (location.pathname !== '/confirmation') {
      const pageName = location.pathname === '/' ? 'Homepage' : 
        location.pathname.split('/').pop().split('-').map(word => 
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
      console.log('PageViewTracker fired', location.pathname);
      analytics.pageView(pageName);
    }
  }, [location]);

  return null;
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <PageViewTracker />
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/search" element={<FlightSearch />} />
          <Route path="/search-results" element={<SearchResults />} />
          <Route path="/traveller-details" element={<TravellerDetails />} />
          <Route path="/ancillary-services" element={<AncillaryServices />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/confirmation" element={<BookingConfirmation />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App; 