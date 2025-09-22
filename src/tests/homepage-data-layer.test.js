/**
 * Unit tests for Homepage Data Layer Implementation
 * Tests AirlinesDataLayer class and useHomepageDataLayer hook
 */

import { renderHook, act } from '@testing-library/react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import AirlinesDataLayer from '../services/AirlinesDataLayer';
import useHomepageDataLayer from '../hooks/useHomepageDataLayer';
import HomePage from '../pages/HomePage';
import HomeBanner from '../components/HomeBanner';
import FeaturedDestinations from '../components/FeaturedDestinations';
import WhyChooseUs from '../components/WhyChooseUs';
import PromotionalBanners from '../components/PromotionalBanners';

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
      const existingDataLayer = [{ event: 'existing-event' }];
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
        event: 'page-data',
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

      airlinesDataLayer.trackEvent('test-event', eventData);

      expect(mockAdobeDataLayer).toHaveLength(1);
      expect(mockAdobeDataLayer[0]).toMatchObject({
        event: 'test-event',
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
        event: 'search-submission',
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
        event: 'hero-banner-interaction',
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

  describe('trackPromotionalBannerClick', () => {
    test('should track promotional banner clicks', () => {
      const bannerData = {
        bannerId: 'summer-sale',
        bannerTitle: 'Summer Sale',
        bannerOffer: '50% Off'
      };

      airlinesDataLayer.trackPromotionalBannerClick(bannerData);

      expect(mockAdobeDataLayer).toHaveLength(1);
      expect(mockAdobeDataLayer[0]).toMatchObject({
        event: 'promotional-banner-click',
        eventData: {
          bannerId: 'summer-sale',
          bannerTitle: 'Summer Sale',
          bannerOffer: '50% Off',
          timestamp: expect.any(String)
        }
      });
    });
  });

  describe('trackScrollDepth', () => {
    test('should track scroll depth milestones', () => {
      airlinesDataLayer.trackScrollDepth(50, 'home');

      expect(mockAdobeDataLayer).toHaveLength(1);
      expect(mockAdobeDataLayer[0]).toMatchObject({
        event: 'scroll-depth',
        eventData: {
          scrollDepth: 50,
          pageType: 'home',
          scrollPercentage: 50,
          timestamp: expect.any(String)
        }
      });
    });
  });

  describe('trackHomepageInteraction', () => {
    test('should track homepage interactions', () => {
      const interactionData = {
        section: 'hero',
        action: 'cta-click'
      };

      airlinesDataLayer.trackHomepageInteraction('interaction', interactionData);

      expect(mockAdobeDataLayer).toHaveLength(1);
      expect(mockAdobeDataLayer[0]).toMatchObject({
        event: 'homepage-interaction',
        eventData: {
          interactionType: 'interaction',
          section: 'hero',
          action: 'cta-click',
          timestamp: expect.any(String)
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
        <AuthProvider>
          {children}
        </AuthProvider>
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

  test('should initialize page data on mount', () => {
    const wrapper = ({ children }) => (
      <BrowserRouter>
        <AuthProvider>
          {children}
        </AuthProvider>
      </BrowserRouter>
    );

    renderHook(() => useHomepageDataLayer(), { wrapper });

    // Wait for useEffect to run
    waitFor(() => {
      expect(mockAdobeDataLayer).toHaveLength(2); // page-data + homepage-view
      expect(mockAdobeDataLayer[0].event).toBe('page-data');
      expect(mockAdobeDataLayer[1].event).toBe('homepage-view');
    });
  });
});

describe('HomePage Component Integration', () => {
  const renderHomePage = () => {
    return render(
      <BrowserRouter>
        <AuthProvider>
          <HomePage />
        </AuthProvider>
      </BrowserRouter>
    );
  };

  beforeEach(() => {
    mockAdobeDataLayer.length = 0;
  });

  test('should render homepage with all sections', () => {
    renderHomePage();
    
    expect(screen.getByText('Featured Destinations')).toBeInTheDocument();
    expect(screen.getByText('Why Choose TLP Airways?')).toBeInTheDocument();
    expect(screen.getByText('Stay Updated with TLP Airways')).toBeInTheDocument();
  });

  test('should track newsletter signup click', () => {
    renderHomePage();
    
    const newsletterButton = screen.getByText('Subscribe to Newsletter');
    fireEvent.click(newsletterButton);

    waitFor(() => {
      const newsletterEvent = mockAdobeDataLayer.find(event => 
        event.event === 'homepage-interaction' && 
        event.eventData.interactionType === 'newsletter-signup-click'
      );
      expect(newsletterEvent).toBeDefined();
      expect(newsletterEvent.eventData.section).toBe('newsletter');
    });
  });
});

describe('HomeBanner Component Integration', () => {
  const renderHomeBanner = () => {
    return render(
      <BrowserRouter>
        <AuthProvider>
          <HomeBanner />
        </AuthProvider>
      </BrowserRouter>
    );
  };

  beforeEach(() => {
    mockAdobeDataLayer.length = 0;
  });

  test('should track hero banner CTA click', () => {
    renderHomeBanner();
    
    const exploreButton = screen.getByText('Explore Flights');
    fireEvent.click(exploreButton);

    waitFor(() => {
      const bannerEvent = mockAdobeDataLayer.find(event => 
        event.event === 'hero-banner-interaction' && 
        event.eventData.interactionType === 'cta-click'
      );
      expect(bannerEvent).toBeDefined();
      expect(bannerEvent.eventData.ctaText).toBe('Explore Flights');
      expect(bannerEvent.eventData.ctaDestination).toBe('search-page');
    });
  });

  test('should track slide navigation', () => {
    renderHomeBanner();
    
    const nextButton = screen.getByLabelText('Next slide');
    fireEvent.click(nextButton);

    waitFor(() => {
      const slideEvent = mockAdobeDataLayer.find(event => 
        event.event === 'hero-banner-interaction' && 
        event.eventData.interactionType === 'slide-next'
      );
      expect(slideEvent).toBeDefined();
    });
  });
});

describe('FeaturedDestinations Component Integration', () => {
  const mockOnDestinationClick = jest.fn();

  beforeEach(() => {
    mockAdobeDataLayer.length = 0;
    mockOnDestinationClick.mockClear();
  });

  test('should track destination clicks', () => {
    render(
      <FeaturedDestinations onDestinationClick={mockOnDestinationClick} />
    );
    
    const firstDestination = screen.getByText('Dubai');
    fireEvent.click(firstDestination.closest('.MuiCard-root'));

    expect(mockOnDestinationClick).toHaveBeenCalledWith({
      destination: 'Dubai',
      destinationCode: 'DXB',
      price: 'From ₹25,000',
      duration: '3h 45m',
      featuredPosition: 1
    });
  });
});

describe('WhyChooseUs Component Integration', () => {
  const mockOnFeatureClick = jest.fn();

  beforeEach(() => {
    mockAdobeDataLayer.length = 0;
    mockOnFeatureClick.mockClear();
  });

  test('should track feature clicks', () => {
    render(
      <WhyChooseUs onFeatureClick={mockOnFeatureClick} />
    );
    
    const premiumServiceCard = screen.getByText('Premium Service');
    fireEvent.click(premiumServiceCard.closest('.MuiCard-root'));

    expect(mockOnFeatureClick).toHaveBeenCalledWith('premium-service', {
      featureTitle: 'Premium Service',
      featureStats: '99.8% Customer Satisfaction'
    });
  });
});

describe('PromotionalBanners Component Integration', () => {
  const mockOnBannerClick = jest.fn();

  beforeEach(() => {
    mockAdobeDataLayer.length = 0;
    mockOnBannerClick.mockClear();
  });

  test('should track promotional banner clicks', () => {
    render(
      <PromotionalBanners onBannerClick={mockOnBannerClick} />
    );
    
    const summerSaleBanner = screen.getByText('Summer Sale');
    fireEvent.click(summerSaleBanner.closest('.MuiCard-root'));

    expect(mockOnBannerClick).toHaveBeenCalledWith({
      bannerId: 'summer-sale',
      bannerTitle: 'Summer Sale',
      bannerOffer: 'Up to 50% Off',
      bannerDestination: 'All International Routes',
      bannerPosition: 1,
      bannerCategory: 'seasonal-offer',
      ctaText: 'Book Now',
      ctaDestination: 'search-page'
    });
  });
});

describe('Data Layer Event Structure Validation', () => {
  beforeEach(() => {
    mockAdobeDataLayer.length = 0;
  });

  test('all events should have required fields', () => {
    const airlinesDataLayer = new AirlinesDataLayer();
    
    // Test different event types
    airlinesDataLayer.setPageData({ pageType: 'home' });
    airlinesDataLayer.trackEvent('test-event', { test: 'data' });
    airlinesDataLayer.trackSearchSubmission({ origin: 'DEL', destination: 'BOM' });
    
    mockAdobeDataLayer.forEach(event => {
      expect(event).toHaveProperty('event');
      expect(event).toHaveProperty('timestamp');
      expect(typeof event.event).toBe('string');
      expect(typeof event.timestamp).toBe('string');
      
      // Validate timestamp format (ISO string)
      expect(new Date(event.timestamp)).toBeInstanceOf(Date);
    });
  });

  test('event data should include user context when available', () => {
    // Mock authenticated user
    jest.doMock('@auth0/auth0-react', () => ({
      useAuth0: () => ({
        isAuthenticated: true,
        user: { id: 'user123', email: 'test@example.com' },
        isLoading: false
      })
    }));

    const wrapper = ({ children }) => (
      <BrowserRouter>
        <AuthProvider>
          {children}
        </AuthProvider>
      </BrowserRouter>
    );

    renderHook(() => useHomepageDataLayer(), { wrapper });

    waitFor(() => {
      const eventsWithUserContext = mockAdobeDataLayer.filter(event => 
        event.eventData && event.eventData.userAuthenticated === true
      );
      expect(eventsWithUserContext.length).toBeGreaterThan(0);
    });
  });
});
