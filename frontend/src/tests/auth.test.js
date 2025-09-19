import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { Auth0Provider } from '@auth0/auth0-react';
import theme from '../theme/theme';
import { AuthProvider } from '../context/AuthContext';
import LoginButton from '../components/auth/LoginButton';
import LogoutButton from '../components/auth/LogoutButton';
import UserProfile from '../components/auth/UserProfile';
import ProtectedRoute from '../components/protected/ProtectedRoute';

// Mock Auth0
const mockAuth0 = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  loginWithRedirect: jest.fn(),
  logout: jest.fn(),
  getAccessTokenSilently: jest.fn(),
};

// Mock Auth0Provider
jest.mock('@auth0/auth0-react', () => ({
  Auth0Provider: ({ children }) => children,
  useAuth0: () => mockAuth0,
}));

// Test wrapper component
const TestWrapper = ({ children }) => (
  <BrowserRouter>
    <ThemeProvider theme={theme}>
      <AuthProvider>
        {children}
      </AuthProvider>
    </ThemeProvider>
  </BrowserRouter>
);

describe('Auth0 Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('LoginButton', () => {
    test('renders login button when not authenticated', () => {
      mockAuth0.isAuthenticated = false;
      mockAuth0.isLoading = false;

      render(
        <TestWrapper>
          <LoginButton />
        </TestWrapper>
      );

      expect(screen.getByText('Sign In')).toBeInTheDocument();
    });

    test('shows loading state when authenticating', () => {
      mockAuth0.isAuthenticated = false;
      mockAuth0.isLoading = true;

      render(
        <TestWrapper>
          <LoginButton />
        </TestWrapper>
      );

      expect(screen.getByText('Signing In...')).toBeInTheDocument();
    });

    test('calls login function when clicked', () => {
      mockAuth0.isAuthenticated = false;
      mockAuth0.isLoading = false;

      render(
        <TestWrapper>
          <LoginButton />
        </TestWrapper>
      );

      const loginButton = screen.getByText('Sign In');
      fireEvent.click(loginButton);

      expect(mockAuth0.loginWithRedirect).toHaveBeenCalled();
    });
  });

  describe('LogoutButton', () => {
    test('renders logout button when authenticated', () => {
      mockAuth0.isAuthenticated = true;
      mockAuth0.isLoading = false;

      render(
        <TestWrapper>
          <LogoutButton />
        </TestWrapper>
      );

      expect(screen.getByText('Sign Out')).toBeInTheDocument();
    });

    test('calls logout function when clicked', () => {
      mockAuth0.isAuthenticated = true;
      mockAuth0.isLoading = false;

      render(
        <TestWrapper>
          <LogoutButton />
        </TestWrapper>
      );

      const logoutButton = screen.getByText('Sign Out');
      fireEvent.click(logoutButton);

      expect(mockAuth0.logout).toHaveBeenCalled();
    });
  });

  describe('UserProfile', () => {
    test('renders user profile when authenticated', () => {
      mockAuth0.isAuthenticated = true;
      mockAuth0.user = {
        name: 'John Doe',
        email: 'john@example.com',
        picture: 'https://example.com/avatar.jpg',
        email_verified: true,
      };
      mockAuth0.isLoading = false;

      render(
        <TestWrapper>
          <UserProfile />
        </TestWrapper>
      );

      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('john@example.com')).toBeInTheDocument();
      expect(screen.getByText('Verified')).toBeInTheDocument();
    });

    test('does not render when not authenticated', () => {
      mockAuth0.isAuthenticated = false;
      mockAuth0.user = null;

      const { container } = render(
        <TestWrapper>
          <UserProfile />
        </TestWrapper>
      );

      expect(container.firstChild).toBeNull();
    });
  });

  describe('ProtectedRoute', () => {
    test('renders children when authenticated', () => {
      mockAuth0.isAuthenticated = true;
      mockAuth0.isLoading = false;

      render(
        <TestWrapper>
          <ProtectedRoute>
            <div>Protected Content</div>
          </ProtectedRoute>
        </TestWrapper>
      );

      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });

    test('redirects to login when not authenticated', () => {
      mockAuth0.isAuthenticated = false;
      mockAuth0.isLoading = false;

      render(
        <TestWrapper>
          <ProtectedRoute>
            <div>Protected Content</div>
          </ProtectedRoute>
        </TestWrapper>
      );

      // Should redirect to login page
      expect(window.location.pathname).toBe('/login');
    });

    test('shows loading when checking authentication', () => {
      mockAuth0.isAuthenticated = false;
      mockAuth0.isLoading = true;

      render(
        <TestWrapper>
          <ProtectedRoute>
            <div>Protected Content</div>
          </ProtectedRoute>
        </TestWrapper>
      );

      expect(screen.getByText('Checking authentication...')).toBeInTheDocument();
    });
  });

  describe('AuthContext', () => {
    test('provides authentication state', () => {
      mockAuth0.isAuthenticated = true;
      mockAuth0.user = { name: 'John Doe' };

      const TestComponent = () => {
        const { user, isAuthenticated } = useAuth();
        return (
          <div>
            <span>{isAuthenticated ? 'Authenticated' : 'Not Authenticated'}</span>
            <span>{user?.name}</span>
          </div>
        );
      };

      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      expect(screen.getByText('Authenticated')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
  });
});
