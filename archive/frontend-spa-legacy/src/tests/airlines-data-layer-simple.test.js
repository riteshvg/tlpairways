/**
 * Simple unit tests for AirlinesDataLayer
 */

import airlinesDataLayer from '../services/AirlinesDataLayer';

// Mock window.adobeDataLayer
const mockAdobeDataLayer = [];
global.window.adobeDataLayer = mockAdobeDataLayer;

describe('AirlinesDataLayer Class', () => {
  beforeEach(() => {
    // Clear the mock data layer
    mockAdobeDataLayer.length = 0;
  });

  test('should initialize adobeDataLayer if it does not exist', () => {
    delete window.adobeDataLayer;
    // The singleton instance should initialize the data layer
    expect(window.adobeDataLayer).toBeDefined();
    expect(Array.isArray(window.adobeDataLayer)).toBe(true);
  });

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

  test('should track search submissions', () => {
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

  test('should track promotional banner clicks', () => {
    const bannerData = {
      bannerId: 'summer-sale',
      bannerTitle: 'Summer Sale',
      bannerOffer: '50% Off'
    };

    airlinesDataLayer.trackPromotionalBannerClick(bannerData);

    expect(mockAdobeDataLayer).toHaveLength(1);
    expect(mockAdobeDataLayer[0]).toMatchObject({
      event: 'promotionalBannerClick',
      eventData: {
        bannerId: 'summer-sale',
        bannerTitle: 'Summer Sale',
        bannerOffer: '50% Off',
        timestamp: expect.any(String)
      }
    });
  });

  test('should track scroll depth', () => {
    airlinesDataLayer.trackScrollDepth(50, 'home');

    expect(mockAdobeDataLayer).toHaveLength(1);
    expect(mockAdobeDataLayer[0]).toMatchObject({
      event: 'scrollDepth',
      eventData: {
        scrollDepth: 50,
        pageType: 'home',
        scrollPercentage: 50,
        timestamp: expect.any(String)
      }
    });
  });

  test('should track homepage interactions', () => {
    const interactionData = {
      section: 'hero',
      action: 'cta-click'
    };

    airlinesDataLayer.trackHomepageInteraction('interaction', interactionData);

    expect(mockAdobeDataLayer).toHaveLength(1);
    expect(mockAdobeDataLayer[0]).toMatchObject({
      event: 'homepageInteraction',
      eventData: {
        interactionType: 'interaction',
        section: 'hero',
        action: 'cta-click',
        timestamp: expect.any(String)
      }
    });
  });

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
