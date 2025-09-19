import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import theme from '../theme/theme';
import LoginPage from '../pages/LoginPage';

// Simple test wrapper without Auth0
const TestWrapper = ({ children }) => (
  <BrowserRouter>
    <ThemeProvider theme={theme}>
      {children}
    </ThemeProvider>
  </BrowserRouter>
);

// Mock the AuthContext to avoid Auth0 dependency
jest.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
    login: jest.fn(),
    logout: jest.fn(),
    getAccessToken: jest.fn(),
  }),
}));

describe('Auth Components - Simple Tests', () => {
  test('LoginPage renders correctly', () => {
    render(
      <TestWrapper>
        <LoginPage />
      </TestWrapper>
    );

    expect(screen.getByText('Welcome to TLAirways')).toBeInTheDocument();
    expect(screen.getByText('Sign in to book flights, manage your bookings, and enjoy exclusive benefits')).toBeInTheDocument();
  });

  test('LoginPage has sign in button', () => {
    render(
      <TestWrapper>
        <LoginPage />
      </TestWrapper>
    );

    expect(screen.getByText('Sign In')).toBeInTheDocument();
  });
});
