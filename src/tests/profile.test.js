import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import theme from '../theme/theme';
import UserProfilePage from '../pages/UserProfilePage';
import MyBookingsPage from '../pages/MyBookingsPage';
import SettingsPage from '../pages/SettingsPage';

// Mock Auth0 context
const mockAuthContext = {
  user: {
    name: 'John Doe',
    email: 'john@example.com',
    picture: 'https://example.com/avatar.jpg',
    email_verified: true,
  },
  isAuthenticated: true,
  isLoading: false,
  error: null,
  login: jest.fn(),
  logout: jest.fn(),
  getAccessToken: jest.fn(),
};

// Mock AuthContext
jest.mock('../context/AuthContext', () => ({
  useAuth: () => mockAuthContext,
}));

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Test wrapper
const TestWrapper = ({ children }) => (
  <BrowserRouter>
    <ThemeProvider theme={theme}>
      {children}
    </ThemeProvider>
  </BrowserRouter>
);

describe('Profile Components', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('UserProfilePage', () => {
    test('renders user profile page correctly', () => {
      render(
        <TestWrapper>
          <UserProfilePage />
        </TestWrapper>
      );

      expect(screen.getByText('My Profile')).toBeInTheDocument();
      expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument();
      expect(screen.getByDisplayValue('john@example.com')).toBeInTheDocument();
    });

    test('shows edit button when not editing', () => {
      render(
        <TestWrapper>
          <UserProfilePage />
        </TestWrapper>
      );

      expect(screen.getByText('Edit Profile')).toBeInTheDocument();
    });

    test('enters edit mode when edit button is clicked', () => {
      render(
        <TestWrapper>
          <UserProfilePage />
        </TestWrapper>
      );

      const editButton = screen.getByText('Edit Profile');
      fireEvent.click(editButton);

      expect(screen.getByText('Save Changes')).toBeInTheDocument();
      expect(screen.getByText('Cancel')).toBeInTheDocument();
    });
  });

  describe('MyBookingsPage', () => {
    test('renders bookings page correctly after loading', async () => {
      render(
        <TestWrapper>
          <MyBookingsPage />
        </TestWrapper>
      );

      // Wait for loading to complete and content to appear
      await screen.findByText('My Bookings', {}, { timeout: 2000 });
      expect(screen.getByText('My Bookings')).toBeInTheDocument();
    });

    test('shows loading state initially', () => {
      render(
        <TestWrapper>
          <MyBookingsPage />
        </TestWrapper>
      );

      // The component shows loading initially
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });
  });

  describe('SettingsPage', () => {
    test('renders settings page correctly', () => {
      render(
        <TestWrapper>
          <SettingsPage />
        </TestWrapper>
      );

      expect(screen.getByText('Settings')).toBeInTheDocument();
      expect(screen.getByText('Notifications')).toBeInTheDocument();
      expect(screen.getByText('Appearance')).toBeInTheDocument();
    });

    test('has notification toggles', () => {
      render(
        <TestWrapper>
          <SettingsPage />
        </TestWrapper>
      );

      expect(screen.getByText('Email Notifications')).toBeInTheDocument();
      expect(screen.getByText('SMS Notifications')).toBeInTheDocument();
    });

    test('has save settings button', () => {
      render(
        <TestWrapper>
          <SettingsPage />
        </TestWrapper>
      );

      expect(screen.getByText('Save Settings')).toBeInTheDocument();
    });
  });
});
