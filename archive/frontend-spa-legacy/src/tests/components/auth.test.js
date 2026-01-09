import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import theme from '../../theme/theme';
import LoginPage from '../../pages/LoginPage';

// Mock Auth0 context
const mockAuthContext = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  login: jest.fn(),
  logout: jest.fn(),
  getAccessToken: jest.fn(),
};

// Mock AuthContext
jest.mock('../../context/AuthContext', () => ({
  useAuth: () => mockAuthContext,
}));

// Test wrapper
const TestWrapper = ({ children }) => (
  <BrowserRouter>
    <ThemeProvider theme={theme}>
      {children}
    </ThemeProvider>
  </BrowserRouter>
);

describe('LoginPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders login page correctly', () => {
    render(
      <TestWrapper>
        <LoginPage />
      </TestWrapper>
    );

    expect(screen.getByText('Welcome to TLAirways')).toBeInTheDocument();
    expect(screen.getByText('Sign in to book flights, manage your bookings, and enjoy exclusive benefits')).toBeInTheDocument();
    expect(screen.getByText('Sign In')).toBeInTheDocument();
  });

  test('shows error message when authentication fails', () => {
    mockAuthContext.error = { message: 'Authentication failed' };

    render(
      <TestWrapper>
        <LoginPage />
      </TestWrapper>
    );

    expect(screen.getByText('Authentication Error: Authentication failed')).toBeInTheDocument();
  });

  test('calls login function when sign in button is clicked', () => {
    render(
      <TestWrapper>
        <LoginPage />
      </TestWrapper>
    );

    const signInButton = screen.getByText('Sign In');
    fireEvent.click(signInButton);

    expect(mockAuthContext.login).toHaveBeenCalled();
  });

  test('shows loading state when authenticating', () => {
    mockAuthContext.isLoading = true;

    render(
      <TestWrapper>
        <LoginPage />
      </TestWrapper>
    );

    expect(screen.getByText('Signing In...')).toBeInTheDocument();
  });
});
