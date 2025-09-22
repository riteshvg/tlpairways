/**
 * Unit tests for Page View Tracker
 * Tests PageViewTracker service and usePageView hook
 */

import { renderHook, act } from '@testing-library/react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import pageViewTracker from '../services/PageViewTracker';
import usePageView from '../hooks/usePageView';

// Mock window.adobeDataLayer
const mockAdobeDataLayer = [];
global.window.adobeDataLayer = mockAdobeDataLayer;

// Mock AuthContext
jest.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    isAuthenticated: true,
    user: { 
      id: 'test-user-123', 
      email: 'test@example.com',
      loyaltyTier: 'gold'
    },
  }),
}));

// Mock useLocation
const mockLocation = {
  pathname: '/',
  search: '',
  state: {}
};

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: () => mockLocation,
}));

describe('PageViewTracker Service', () => {
  beforeEach(() => {
    mockAdobeDataLayer.length = 0;
    jest.clearAllMocks();
  });

  describe('getPageConfig', () => {
    test('should return correct config for homepage', () => {
      const config = pageViewTracker.getPageConfig('/');
      
      expect(config).toMatchObject({
        pageType: 'home',
        pageName: 'Homepage',
        pageTitle: 'TLP Airways - Premium Air Travel',
        pageCategory: 'landing',
        isLandingPage: true,
        sections: ['hero', 'featured-destinations', 'promotional-banners', 'why-choose-us', 'newsletter']
      });
    });

    test('should return correct config for login page', () => {
      const config = pageViewTracker.getPageConfig('/login');
      
      expect(config).toMatchObject({
        pageType: 'authentication',
        pageName: 'Login',
        pageTitle: 'Login - TLP Airways',
        pageCategory: 'auth',
        authAction: 'login'
      });
    });

    test('should return correct config for search page', () => {
      const config = pageViewTracker.getPageConfig('/search');
      
      expect(config).toMatchObject({
        pageType: 'search',
        pageName: 'Flight Search',
        pageTitle: 'Search Flights - TLP Airways',
        pageCategory: 'booking',
        searchType: 'flight'
      });
    });

    test('should return correct config for search results page', () => {
      const config = pageViewTracker.getPageConfig('/search-results', { origin: 'DEL', destination: 'BOM' });
      
      expect(config).toMatchObject({
        pageType: 'search-results',
        pageName: 'Search Results',
        pageTitle: 'Flight Search Results - TLP Airways',
        pageCategory: 'booking',
        searchType: 'flight-results',
        searchParams: { origin: 'DEL', destination: 'BOM' }
      });
    });

    test('should return correct config for profile page', () => {
      const config = pageViewTracker.getPageConfig('/profile');
      
      expect(config).toMatchObject({
        pageType: 'profile',
        pageName: 'User Profile',
        pageTitle: 'My Profile - TLP Airways',
        pageCategory: 'account'
      });
    });

    test('should return correct config for bookings page', () => {
      const config = pageViewTracker.getPageConfig('/my-bookings', {}, { bookingsCount: 5 });
      
      expect(config).toMatchObject({
        pageType: 'bookings',
        pageName: 'My Bookings',
        pageTitle: 'My Bookings - TLP Airways',
        pageCategory: 'account',
        bookingsCount: 5
      });
    });

    test('should return correct config for settings page', () => {
      const config = pageViewTracker.getPageConfig('/settings');
      
      expect(config).toMatchObject({
        pageType: 'settings',
        pageName: 'Settings',
        pageTitle: 'Account Settings - TLP Airways',
        pageCategory: 'account'
      });
    });

    test('should return correct config for traveller details page', () => {
      const config = pageViewTracker.getPageConfig('/traveller-details');
      
      expect(config).toMatchObject({
        pageType: 'booking',
        pageName: 'Traveller Details',
        pageTitle: 'Traveller Details - TLP Airways',
        pageCategory: 'booking',
        bookingStep: 'traveller-details'
      });
    });

    test('should return correct config for ancillary services page', () => {
      const config = pageViewTracker.getPageConfig('/ancillary-services');
      
      expect(config).toMatchObject({
        pageType: 'booking',
        pageName: 'Ancillary Services',
        pageTitle: 'Add Services - TLP Airways',
        pageCategory: 'booking',
        bookingStep: 'ancillary-services'
      });
    });

    test('should return correct config for payment page', () => {
      const config = pageViewTracker.getPageConfig('/payment');
      
      expect(config).toMatchObject({
        pageType: 'booking',
        pageName: 'Payment',
        pageTitle: 'Payment - TLP Airways',
        pageCategory: 'booking',
        bookingStep: 'payment'
      });
    });

    test('should return correct config for confirmation page', () => {
      const config = pageViewTracker.getPageConfig('/confirmation', {}, { bookingId: 'BK123456' });
      
      expect(config).toMatchObject({
        pageType: 'booking',
        pageName: 'Booking Confirmation',
        pageTitle: 'Booking Confirmed - TLP Airways',
        pageCategory: 'booking',
        bookingStep: 'confirmation',
        bookingId: 'BK123456'
      });
    });

    test('should return default config for unknown page', () => {
      const config = pageViewTracker.getPageConfig('/unknown-page');
      
      expect(config).toMatchObject({
        pageType: 'unknown',
        pageName: 'Unknown Page',
        pageCategory: 'unknown'
      });
    });
  });

  describe('trackPageView', () => {
    test('should track page view with user context', () => {
      const user = { id: 'user-123', email: 'test@example.com' };
      
      pageViewTracker.trackPageView('/', user, true);
      
      expect(mockAdobeDataLayer).toHaveLength(1);
      expect(mockAdobeDataLayer[0]).toMatchObject({
        event: 'pageView',
        pageData: {
          pageType: 'home',
          pageName: 'Homepage',
          pageURL: expect.any(String),
          timestamp: expect.any(String)
        },
        viewData: {
          userAuthenticated: true,
          userId: 'user-123',
          userEmail: 'test@example.com'
        }
      });
    });

    test('should prevent duplicate page tracking', () => {
      const user = { id: 'user-123' };
      
      pageViewTracker.trackPageView('/', user, true);
      pageViewTracker.trackPageView('/', user, true); // Same page
      
      expect(mockAdobeDataLayer).toHaveLength(1);
    });

    test('should track different pages separately', () => {
      const user = { id: 'user-123' };
      
      pageViewTracker.trackPageView('/', user, true);
      pageViewTracker.trackPageView('/login', user, true);
      
      expect(mockAdobeDataLayer).toHaveLength(2);
    });
  });

  describe('trackPageExit', () => {
    test('should not track page exit when disabled', () => {
      pageViewTracker.trackPageExit('/test-page', 5000);
      
      // Should not add any events to data layer when disabled
      expect(mockAdobeDataLayer).toHaveLength(0);
    });
  });

  describe('trackPageError', () => {
    test('should track page error with error details', () => {
      const error = new Error('Test error');
      pageViewTracker.trackPageError('/test-page', error, 'test-error');
      
      expect(mockAdobeDataLayer).toHaveLength(1);
      expect(mockAdobeDataLayer[0]).toMatchObject({
        event: 'pageError',
        eventData: {
          pathname: '/test-page',
          errorType: 'test-error',
          errorMessage: 'Test error',
          timestamp: expect.any(String)
        }
      });
    });
  });
});

describe('usePageView Hook', () => {
  beforeEach(() => {
    mockAdobeDataLayer.length = 0;
    jest.clearAllMocks();
  });

  test('should track page view on mount', () => {
    renderHook(() => usePageView(), {
      wrapper: ({ children }) => (
        <BrowserRouter>
          {children}
        </BrowserRouter>
      ),
    });

    expect(mockAdobeDataLayer).toHaveLength(1);
    expect(mockAdobeDataLayer[0].event).toBe('pageView');
  });

  test('should track page view with custom config', () => {
    const customConfig = {
      isLandingPage: true,
      customProperty: 'test-value'
    };

    renderHook(() => usePageView(customConfig), {
      wrapper: ({ children }) => (
        <BrowserRouter>
          {children}
        </BrowserRouter>
      ),
    });

    expect(mockAdobeDataLayer).toHaveLength(1);
    expect(mockAdobeDataLayer[0].pageData).toMatchObject({
      pageType: 'home',
      isLandingPage: true,
      customProperty: 'test-value'
    });
  });

  test('should provide tracking utilities', () => {
    const { result } = renderHook(() => usePageView(), {
      wrapper: ({ children }) => (
        <BrowserRouter>
          {children}
        </BrowserRouter>
      ),
    });

    expect(typeof result.current.trackPageView).toBe('function');
    expect(typeof result.current.trackPageExit).toBe('function');
    expect(typeof result.current.trackPageError).toBe('function');
  });
});
