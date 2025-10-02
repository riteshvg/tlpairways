/**
 * PageDataLayerManager
 * Simplified data layer manager for Home and Search pages
 * Implements minimal, structured Adobe Data Layer integration
 */

class PageDataLayerManager {
  constructor() {
    this.debug = process.env.NODE_ENV === 'development';
    this.sessionId = this.getOrCreateSessionId();
    this.initializeDataLayer();
  }

  /**
   * Initialize the global Adobe Data Layer
   */
  initializeDataLayer() {
    if (typeof window !== 'undefined') {
      if (!window.adobeDataLayer) {
        window.adobeDataLayer = [];
      }
      
      if (this.debug) {
        console.log('📊 PageDataLayerManager initialized', {
          sessionId: this.sessionId,
          timestamp: new Date().toISOString()
        });
      }
    }
  }

  /**
   * Get or create session ID
   * @returns {string} Session ID
   */
  getOrCreateSessionId() {
    if (typeof window === 'undefined') return null;
    
    let sessionId = sessionStorage.getItem('tlp_session_id');
    if (!sessionId) {
      sessionId = `tlp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('tlp_session_id', sessionId);
    }
    return sessionId;
  }

  /**
   * Get previous page from sessionStorage
   * @returns {string} Previous page name
   */
  getPreviousPage() {
    if (typeof window === 'undefined') return '';
    return sessionStorage.getItem('tlp_previous_page') || '';
  }

  /**
   * Set previous page for next navigation
   * @param {string} pageName - Current page name
   */
  setPreviousPage(pageName) {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('tlp_previous_page', pageName);
    }
  }

  /**
   * Get user preferences from Auth0 or user profile
   * @param {Object} user - User object from auth context
   * @returns {Object|null} User preferences or null
   */
  getUserPreferences(user) {
    if (!user) return null;

    return {
      preferred_airlines: user.preferred_airlines || ["TLP Airways"],
      preferred_cabin_class: user.preferred_cabin_class || "economy",
      price_sensitivity: user.price_sensitivity || "medium",
      loyalty_status: user.loyaltyTier || "none",
      frequent_routes: user.frequent_routes || [],
      total_bookings: user.total_bookings || 0,
      last_booking_date: user.last_booking_date || null,
      preferred_language: user.language || "en-US",
      currency_preference: user.currency || "INR",
      marketing_opt_in: user.marketing_opt_in || false,
      recent_searches: user.recent_searches || [],
      saved_routes: user.saved_routes || [],
      session_search_count: parseInt(sessionStorage.getItem('tlp_session_search_count') || '0'),
      total_searches: user.total_searches || 0
    };
  }

  /**
   * Generate Home Page Data Layer
   * @param {Object} user - User object from auth context
   * @param {boolean} isLoggedIn - Authentication status
   * @returns {Object} Home page data layer object
   */
  generateHomePageDataLayer(user = null, isLoggedIn = false) {
    const dataLayer = {
      event: "pageView",
      pageData: {
        pageType: "home",
        pageName: "Home - TLP Airways",
        pageURL: window.location.href,
        referrer: document.referrer,
        previousPage: this.getPreviousPage(),
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        screenResolution: `${window.screen.width}x${window.screen.height}`,
        viewportSize: `${window.innerWidth}x${window.innerHeight}`,
        pageCategory: "landing",
        sections: ["hero-banner", "search-form", "popular-destinations", "promotional-offers", "footer"]
      },
      userContext: {
        isLoggedIn,
        userId: isLoggedIn ? user?.id || user?.sub : null,
        userLoyaltyTier: isLoggedIn ? user?.loyaltyTier || null : null,
        sessionId: this.sessionId,
        userPreferences: isLoggedIn ? this.getUserPreferences(user) : null
      },
      timestamp: new Date().toISOString()
    };

    this.setPreviousPage("Home");
    return dataLayer;
  }

  /**
   * Generate Search Page Data Layer
   * @param {Object} user - User object from auth context
   * @param {boolean} isLoggedIn - Authentication status
   * @returns {Object} Search page data layer object
   */
  generateSearchPageDataLayer(user = null, isLoggedIn = false) {
    const dataLayer = {
      event: "pageView",
      pageData: {
        pageType: "search",
        pageName: "Flight Search - TLP Airways",
        pageURL: window.location.href,
        referrer: document.referrer,
        previousPage: this.getPreviousPage(),
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        screenResolution: `${window.screen.width}x${window.screen.height}`,
        viewportSize: `${window.innerWidth}x${window.innerHeight}`,
        pageCategory: "booking",
        searchType: "flight-search",
        sections: isLoggedIn 
          ? ["search-form", "popular-routes", "recent-searches", "fare-calendar", "saved-routes"]
          : ["search-form", "popular-routes", "fare-calendar"]
      },
      userContext: {
        isLoggedIn,
        userId: isLoggedIn ? user?.id || user?.sub : null,
        userLoyaltyTier: isLoggedIn ? user?.loyaltyTier || null : null,
        sessionId: this.sessionId,
        userPreferences: isLoggedIn ? this.getUserPreferences(user) : null
      },
      timestamp: new Date().toISOString()
    };

    this.setPreviousPage("Flight Search");
    return dataLayer;
  }

  /**
   * Initialize page data layer for specific page type
   * @param {string} pageType - 'home' or 'search'
   * @param {Object} user - User object from auth context
   * @param {boolean} isLoggedIn - Authentication status
   */
  initializePageDataLayer(pageType, user = null, isLoggedIn = false) {
    let dataLayer;

    switch (pageType) {
      case 'home':
        dataLayer = this.generateHomePageDataLayer(user, isLoggedIn);
        break;
      case 'search':
        dataLayer = this.generateSearchPageDataLayer(user, isLoggedIn);
        break;
      default:
        console.warn(`Unknown page type: ${pageType}`);
        return;
    }

    // Push to Adobe Data Layer
    if (typeof window !== 'undefined' && window.adobeDataLayer) {
      window.adobeDataLayer.push(dataLayer);
      
      if (this.debug) {
        console.group(`📊 ${pageType.toUpperCase()} Page Data Layer`);
        console.log('Page Type:', pageType);
        console.log('User Status:', isLoggedIn ? 'Logged In' : 'Guest');
        console.log('Data Layer:', dataLayer);
        console.groupEnd();
      }
    }

    return dataLayer;
  }

  /**
   * Track search field interaction
   * @param {string} fieldType - Field type (origin, destination, date, etc.)
   * @param {*} fieldValue - Field value
   * @param {string} interactionType - Interaction type
   */
  trackSearchFieldInteraction(fieldType, fieldValue, interactionType) {
    const event = {
      event: "search-field-interaction",
      eventData: {
        fieldType,
        fieldValue,
        interactionType,
        sessionId: this.sessionId
      },
      timestamp: new Date().toISOString()
    };

    if (typeof window !== 'undefined' && window.adobeDataLayer) {
      window.adobeDataLayer.push(event);
      
      if (this.debug) {
        console.log('🔍 Search Field Interaction:', event);
      }
    }
  }

  /**
   * Track flight search initiation
   * @param {Object} searchParams - Search parameters
   */
  trackFlightSearchInitiated(searchParams) {
    // Increment session search count
    const currentCount = parseInt(sessionStorage.getItem('tlp_session_search_count') || '0');
    sessionStorage.setItem('tlp_session_search_count', (currentCount + 1).toString());

    const event = {
      event: "flight-search-initiated",
      eventData: {
        origin: searchParams.origin,
        destination: searchParams.destination,
        departureDate: searchParams.departureDate,
        returnDate: searchParams.returnDate || null,
        passengers: searchParams.passengers,
        cabinClass: searchParams.cabinClass,
        tripType: searchParams.tripType,
        sessionId: this.sessionId
      },
      timestamp: new Date().toISOString()
    };

    if (typeof window !== 'undefined' && window.adobeDataLayer) {
      window.adobeDataLayer.push(event);
      
      if (this.debug) {
        console.log('✈️ Flight Search Initiated:', event);
      }
    }
  }

  /**
   * Get current data layer
   * @returns {Array} Data layer array
   */
  getDataLayer() {
    return typeof window !== 'undefined' ? window.adobeDataLayer || [] : [];
  }

  /**
   * Clear data layer
   */
  clearDataLayer() {
    if (typeof window !== 'undefined' && window.adobeDataLayer) {
      window.adobeDataLayer.length = 0;
      if (this.debug) {
        console.log('📊 Data layer cleared');
      }
    }
  }

  /**
   * Debug helper - log current data layer state
   */
  debugDataLayer() {
    if (typeof window !== 'undefined') {
      console.group('📊 Adobe Data Layer Debug');
      console.log('Total Events:', window.adobeDataLayer?.length || 0);
      console.log('Session ID:', this.sessionId);
      console.log('All Events:', window.adobeDataLayer || []);
      
      if (window.adobeDataLayer && window.adobeDataLayer.length > 0) {
        const eventTypes = {};
        window.adobeDataLayer.forEach(event => {
          if (!eventTypes[event.event]) {
            eventTypes[event.event] = [];
          }
          eventTypes[event.event].push(event);
        });
        console.log('Events by Type:', eventTypes);
      }
      
      console.groupEnd();
    }
  }
}

// Create singleton instance
const pageDataLayerManager = new PageDataLayerManager();

// Make debug function globally available
if (typeof window !== 'undefined') {
  window.debugPageDataLayer = pageDataLayerManager.debugDataLayer.bind(pageDataLayerManager);
}

export default pageDataLayerManager;
export { PageDataLayerManager };