import React, { useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Paper,
  Card,
  CardContent,
  Divider,
} from '@mui/material';
import { FlightTakeoff as FlightIcon } from '@mui/icons-material';
import LoginButton from '../components/auth/LoginButton';
import { useAuth } from '../context/AuthContext';
import useUserAnalytics from '../hooks/useUserAnalytics';
import usePageView from '../hooks/usePageView';

const LoginPage = () => {
  const { error } = useAuth();
  const { trackLoginAttempt } = useUserAnalytics();

  // Track page view with login-specific context
  usePageView({
    pageCategory: 'auth',
    authAction: 'login',
    sections: ['login-form', 'social-login', 'forgot-password'],
    hasError: !!error
  });

  // Track page view for login attempts
  useEffect(() => {
    trackLoginAttempt({
      method: 'email',
      isSocialLogin: false,
      pageURL: window.location.href,
      referrer: document.referrer
    });
  }, [trackLoginAttempt]);

  return (
    <Container maxWidth="sm">
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight="80vh"
      >
        <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
          <Box textAlign="center" mb={4}>
            <FlightIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
            <Typography variant="h4" component="h1" gutterBottom>
              Welcome to TLAirways
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Sign in to book flights, manage your bookings, and enjoy exclusive benefits
            </Typography>
          </Box>

          {error && (
            <Card sx={{ mb: 3, bgcolor: 'error.light' }}>
              <CardContent>
                <Typography color="error" variant="body2">
                  Authentication Error: {error.message}
                </Typography>
              </CardContent>
            </Card>
          )}

          <Box textAlign="center" mb={3}>
            <LoginButton size="large" fullWidth />
          </Box>

          <Divider sx={{ my: 3 }} />

          <Box textAlign="center">
            <Typography variant="body2" color="text.secondary">
              By signing in, you agree to our Terms of Service and Privacy Policy
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default LoginPage;
