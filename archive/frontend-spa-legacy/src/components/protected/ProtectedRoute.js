import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ children, requireAuth = false }) => {
  const { isAuthenticated, isLoading, login } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight="50vh"
      >
        <CircularProgress size={40} />
        <Typography variant="body2" sx={{ mt: 2 }}>
          Checking authentication...
        </Typography>
      </Box>
    );
  }

  // If authentication is required but user is not authenticated
  if (requireAuth && !isAuthenticated) {
    // Store the current path and state for redirect after login
    const currentPath = location.pathname + location.search;
    const currentState = location.state;

    // Store both path and state for booking-related pages
    const redirectData = {
      path: currentPath,
      state: currentState
    };

    // Save booking state to sessionStorage
    sessionStorage.setItem('auth_redirect_data', JSON.stringify(redirectData));

    // Save Adobe Data Layer state if available
    if (window.adobeDataLayer && window.adobeDataLayer.getState) {
      try {
        const dataLayerState = window.adobeDataLayer.getState();
        sessionStorage.setItem('auth_data_layer_state', JSON.stringify(dataLayerState));
        console.log('✅ Adobe Data Layer state saved before auth redirect');
      } catch (error) {
        console.error('Error saving data layer state:', error);
      }
    }

    login(currentPath);
    return null; // Don't render anything while redirecting
  }

  // If authentication is not required but user is authenticated (e.g., login page)
  if (!requireAuth && isAuthenticated) {
    const from = location.state?.from?.pathname || '/';
    return <Navigate to={from} replace />;
  }

  return children;
};

export default ProtectedRoute;
