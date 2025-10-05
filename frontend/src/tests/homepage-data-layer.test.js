/**
 * Unit tests for Homepage Data Layer Implementation
 * Tests AirlinesDataLayer class and useHomepageDataLayer hook
 */

import { renderHook, act } from '@testing-library/react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import airlinesDataLayer from '../services/AirlinesDataLayer';
import useHomepageDataLayer from '../hooks/useHomepageDataLayer';

// Mock window.adobeDataLayer
const mockAdobeDataLayer = [];
global.window.adobeDataLayer = mockAdobeDataLayer;

// Mock Auth0
jest.mock('@auth0/auth0-react', () => ({
  useAuth0: () => ({
    isAuthenticated: false,
    user: null,
    isLoading: false,
    loginWithRedirect: jest.fn(),
    logout: jest.fn(),
    getAccessTokenSilently: jest.fn()
  })
}));

// Mock console.log to avoid test output clutter
const originalConsoleLog = console.log;
beforeAll(() => {
  console.log = jest.fn();
});

afterAll(() => {
  console.log = originalConsoleLog;
});

describe('AirlinesDataLayer Class', () => {
  let airlinesDataLayer;

  beforeEach(() => {
    // Clear the mock data layer
    mockAdobeDataLayer.length = 0;
    airlinesDataLayer = new AirlinesDataLayer();
  });

  describe('Initialization', () => {
    test('should initialize adobeDataLayer if it does not exist', () => {
      delete window.adobeDataLayer;
      new AirlinesDataLayer();
      expect(window.adobeDataLayer).toBeDefined();
      expect(Array.isArray(window.adobeDataLayer)).toBe(true);
    });

    test('should not override existing adobeDataLayer', () => {
      const existingDataLayer = [{ event: 'existingEvent' }];
      window.adobeDataLayer = existingDataLayer;
      new AirlinesDataLayer();
      expect(window.adobeDataLayer).toBe(existingDataLayer);
    });
  });

  describe('setPageData', () => {
    test('should set page data with correct structure', () => {
      const pageData = {
        pageType: 'home',
        pageName: 'Homepage',
        pageURL: 'http://localhost:3000'
      };

      airlinesDataLayer.setPageData(pageData);

      expect(mockAdobeDataLayer).toHaveLength(1);
      expect(mockAdobeDataLayer[0]).toMatchObject({
        event: 'pageData',
        pageData: {
          pageType: 'home',
          pageName: 'Homepage',
          pageURL: 'http://localhost:3000',
          timestamp: expect.any(String)
        }
      });
    });
  });

  describe('trackEvent', () => {
    test('should track events with correct structure', () => {
      const eventData = {
        interactionType: 'click',
        element: 'button'
      };

      airlinesDataLayer.trackEvent('testEvent', eventData);

      expect(mockAdobeDataLayer).toHaveLength(1);
      expect(mockAdobeDataLayer[0]).toMatchObject({
        event: 'testEvent',
        eventData: {
          interactionType: 'click',
          element: 'button',
          timestamp: expect.any(String),
          userAgent: expect.any(String),
          screenResolution: expect.any(String),
          viewportSize: expect.any(String)
        }
      });
    });
  });

  describe('trackSearchSubmission', () => {
    test('should track search submissions with flight data', () => {
      const searchData = {
        origin: 'DEL',
        destination: 'BOM',
        departureDate: '2024-02-15',
        passengers: 2
      };

      airlinesDataLayer.trackSearchSubmission(searchData);

      expect(mockAdobeDataLayer).toHaveLength(1);
      expect(mockAdobeDataLayer[0]).toMatchObject({
        event: 'searchSubmission',
        eventData: {
          searchType: 'flight-search',
          origin: 'DEL',
          destination: 'BOM',
          departureDate: '2024-02-15',
          passengers: 2,
          tripType: 'round-trip',
          cabinClass: 'economy',
          timestamp: expect.any(String)
        }
      });
    });
  });

  describe('trackHeroBannerInteraction', () => {
    test('should track hero banner interactions', () => {
      const bannerData = {
        bannerId: 'hero-banner-1',
        bannerTitle: 'Paris',
        bannerDestination: 'CDG'
      };

      airlinesDataLayer.trackHeroBannerInteraction('click', bannerData);

      expect(mockAdobeDataLayer).toHaveLength(1);
      expect(mockAdobeDataLayer[0]).toMatchObject({
        event: 'heroBannerInteraction',
        eventData: {
          interactionType: 'click',
          bannerId: 'hero-banner-1',
          bannerTitle: 'Paris',
          bannerDestination: 'CDG',
          timestamp: expect.any(String)
        }
      });
    });
  });

  describe('setPageDataWithView', () => {
    test('should merge page data and view data into single event', () => {
      const pageData = {
        pageType: 'home',
        pageName: 'Homepage',
        pageURL: 'https://example.com'
      };
      
      const viewData = {
        userAuthenticated: true,
        userId: 'user123',
        landingPage: true
      };

      airlinesDataLayer.setPageDataWithView(pageData, viewData);

      expect(mockAdobeDataLayer).toHaveLength(1);
      expect(mockAdobeDataLayer[0]).toMatchObject({
        event: 'pageView',
        pageData: {
          pageType: 'home',
          pageName: 'Homepage',
          pageURL: 'https://example.com',
          timestamp: expect.any(String),
          userAgent: expect.any(String),
          screenResolution: expect.any(String),
          viewportSize: expect.any(String)
        },
        viewData: {
          userAuthenticated: true,
          userId: 'user123',
          landingPage: true
        }
      });
    });
  });

  describe('Utility Methods', () => {
    test('getDataLayer should return current data layer', () => {
      mockAdobeDataLayer.push({ event: 'test' });
      const dataLayer = airlinesDataLayer.getDataLayer();
      expect(dataLayer).toBe(mockAdobeDataLayer);
    });

    test('clearDataLayer should clear the data layer', () => {
      mockAdobeDataLayer.push({ event: 'test1' });
      mockAdobeDataLayer.push({ event: 'test2' });
      expect(mockAdobeDataLayer).toHaveLength(2);
      
      airlinesDataLayer.clearDataLayer();
      expect(mockAdobeDataLayer).toHaveLength(0);
    });
  });
});

describe('useHomepageDataLayer Hook', () => {
  beforeEach(() => {
    mockAdobeDataLayer.length = 0;
  });

  test('should provide all tracking functions', () => {
    const wrapper = ({ children }) => (
      <BrowserRouter>
        {children}
      </BrowserRouter>
    );

    const { result } = renderHook(() => useHomepageDataLayer(), { wrapper });

    expect(result.current.trackHeroBannerInteraction).toBeDefined();
    expect(result.current.trackPromotionalBannerClick).toBeDefined();
    expect(result.current.trackSearchSubmission).toBeDefined();
    expect(result.current.trackHomepageInteraction).toBeDefined();
    expect(result.current.trackFeaturedDestinationClick).toBeDefined();
    expect(result.current.trackNavigationInteraction).toBeDefined();
    expect(result.current.trackAuthAction).toBeDefined();
    expect(result.current.trackNewsletterSignup).toBeDefined();
    expect(result.current.getDataLayer).toBeDefined();
    expect(result.current.clearDataLayer).toBeDefined();
  });
});
