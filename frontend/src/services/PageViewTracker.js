/**
 * Page View Tracker Service
 * Handles page view tracking for all pages in the application
 */

import airlinesDataLayer from './AirlinesDataLayer';
import { useAuth } from '../context/AuthContext';

class PageViewTracker {
  constructor() {
    this.debug = process.env.NODE_ENV === 'development';
    this.trackedPages = new Set(); // Track pages to prevent duplicates
  }

  log(message, data = null, level = 'info') {
    if (this.debug) {
      const logData = {
        timestamp: new Date().toISOString(),
        message,
        data
      };

      switch (level) {
        case 'warn':
          console.warn('📄 PageViewTracker:', logData);
          break;
        case 'error':
          console.error('📄 PageViewTracker:', logData);
          break;
        default:
          console.log('📄 PageViewTracker:', logData);
      }
    }
  }

  /**
   * Get page configuration based on pathname
   * @param {string} pathname - Current pathname
   * @param {Object} searchParams - URL search parameters
   * @param {Object} state - Route state
   * @returns {Object} Page configuration
   */
  getPageConfig(pathname, searchParams = {}, state = {}) {
    const baseConfig = {
      pageURL: window.location.href,
      referrer: document.referrer,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      screenResolution: `${window.screen.width}x${window.screen.height}`,
      viewportSize: `${window.innerWidth}x${window.innerHeight}`,
    };

    switch (pathname) {
      case '/':
        return {
          ...baseConfig,
          pageType: 'home',
          pageName: 'Homepage',
          pageTitle: 'TLP Airways - Premium Air Travel',
          pageDescription: 'Discover premium air travel with TLP Airways. Book flights to amazing destinations worldwide.',
          pageCategory: 'landing',
          isLandingPage: true,
          sections: ['hero', 'featured-destinations', 'promotional-banners', 'why-choose-us', 'newsletter']
        };

      case '/login':
        return {
          ...baseConfig,
          pageType: 'authentication',
          pageName: 'Login',
          pageTitle: 'Login - TLP Airways',
          pageDescription: 'Sign in to your TLP Airways account to manage bookings and access exclusive offers.',
          pageCategory: 'auth',
          authAction: 'login',
          sections: ['login-form', 'social-login', 'forgot-password']
        };

      case '/search':
        return {
          ...baseConfig,
          pageType: 'search',
          pageName: 'Flight Search',
          pageTitle: 'Search Flights - TLP Airways',
          pageDescription: 'Search for flights to your desired destination with TLP Airways.',
          pageCategory: 'booking',
          searchType: 'flight',
          sections: ['search-form', 'filters', 'quick-actions'],
          searchParams: searchParams
        };

      case '/search-results':
        return {
          ...baseConfig,
          pageType: 'search-results',
          pageName: 'Search Results',
          pageTitle: 'Flight Search Results - TLP Airways',
          pageDescription: 'View available flights for your search criteria.',
          pageCategory: 'booking',
          searchType: 'flight-results',
          sections: ['results-list', 'filters', 'sorting', 'pagination'],
          searchParams: searchParams,
          resultsCount: state.resultsCount || 0
        };

      case '/profile':
        return {
          ...baseConfig,
          pageType: 'profile',
          pageName: 'User Profile',
          pageTitle: 'My Profile - TLP Airways',
          pageDescription: 'Manage your personal information and preferences.',
          pageCategory: 'account',
          sections: ['profile-form', 'preferences', 'account-settings']
        };

      case '/my-bookings':
        return {
          ...baseConfig,
          pageType: 'bookings',
          pageName: 'My Bookings',
          pageTitle: 'My Bookings - TLP Airways',
          pageDescription: 'View and manage your flight bookings.',
          pageCategory: 'account',
          sections: ['bookings-list', 'booking-filters', 'booking-actions'],
          bookingsCount: state.bookingsCount || 0
        };

      case '/settings':
        return {
          ...baseConfig,
          pageType: 'settings',
          pageName: 'Settings',
          pageTitle: 'Account Settings - TLP Airways',
          pageDescription: 'Manage your account settings and preferences.',
          pageCategory: 'account',
          sections: ['notification-settings', 'privacy-settings', 'account-preferences']
        };

      case '/traveller-details':
        return {
          ...baseConfig,
          pageType: 'booking',
          pageName: 'Traveller Details',
          pageTitle: 'Traveller Details - TLP Airways',
          pageDescription: 'Enter passenger information for your flight booking.',
          pageCategory: 'booking',
          bookingStep: 'traveller-details',
          sections: ['passenger-form', 'contact-details', 'special-requests']
        };

      case '/ancillary-services':
        return {
          ...baseConfig,
          pageType: 'booking',
          pageName: 'Ancillary Services',
          pageTitle: 'Add Services - TLP Airways',
          pageDescription: 'Add extra services to your flight booking.',
          pageCategory: 'booking',
          bookingStep: 'ancillary-services',
          sections: ['seat-selection', 'meals', 'baggage', 'insurance']
        };

      case '/payment':
        return {
          ...baseConfig,
          pageType: 'booking',
          pageName: 'Payment',
          pageTitle: 'Payment - TLP Airways',
          pageDescription: 'Complete your flight booking payment.',
          pageCategory: 'booking',
          bookingStep: 'payment',
          sections: ['payment-form', 'price-breakdown', 'security-info']
        };

      case '/confirmation':
        return {
          ...baseConfig,
          pageType: 'booking',
          pageName: 'Booking Confirmation',
          pageTitle: 'Booking Confirmed - TLP Airways',
          pageDescription: 'Your flight booking has been confirmed.',
          pageCategory: 'booking',
          bookingStep: 'confirmation',
          sections: ['confirmation-details', 'booking-summary', 'next-steps'],
          bookingId: state.bookingId || null
        };

      default:
        return {
          ...baseConfig,
          pageType: 'unknown',
          pageName: 'Unknown Page',
          pageTitle: document.title || 'TLP Airways',
          pageDescription: 'Page not found or unknown page type.',
          pageCategory: 'unknown',
          sections: []
        };
    }
  }

  /**
   * Track page view with user context
   * @param {string} pathname - Current pathname
   * @param {Object} user - User data from AuthContext
   * @param {boolean} isAuthenticated - Authentication status
   * @param {Object} searchParams - URL search parameters
   * @param {Object} state - Route state
   */
  trackPageView(pathname, user, isAuthenticated, searchParams = {}, state = {}) {
    // Create unique page identifier to prevent duplicates
    const pageId = `${pathname}-${Date.now()}`;
    
    if (this.trackedPages.has(pageId)) {
      this.log('Page already tracked, skipping', { pathname, pageId });
      return;
    }

    const pageConfig = this.getPageConfig(pathname, searchParams, state);
    
    // Add user context
    const userContext = {
      userAuthenticated: isAuthenticated,
      userId: user?.id || null,
      userEmail: user?.email || null,
      userLoyaltyTier: user?.loyaltyTier || null,
      sessionId: this.getSessionId()
    };

    // Track page view with merged data
    airlinesDataLayer.setPageDataWithView(pageConfig, userContext);
    
    // Mark as tracked
    this.trackedPages.add(pageId);
    
    this.log('Page view tracked', {
      pathname,
      pageType: pageConfig.pageType,
      pageName: pageConfig.pageName,
      userAuthenticated: isAuthenticated
    });

    // Clean up old tracked pages (keep only last 10)
    if (this.trackedPages.size > 10) {
      const pagesArray = Array.from(this.trackedPages);
      this.trackedPages.clear();
      pagesArray.slice(-5).forEach(page => this.trackedPages.add(page));
    }
  }

  /**
   * Get or create session ID
   * @returns {string} Session ID
   */
  getSessionId() {
    let sessionId = sessionStorage.getItem('tlp_session_id');
    if (!sessionId) {
      sessionId = `tlp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('tlp_session_id', sessionId);
    }
    return sessionId;
  }

  /**
   * Track page exit (when user leaves the page)
   * @param {string} pathname - Current pathname
   * @param {number} timeOnPage - Time spent on page in milliseconds
   */
  trackPageExit(pathname, timeOnPage) {
    const exitEvent = {
      event: 'pageExit',
      eventData: {
        pathname,
        timeOnPage,
        exitMethod: 'navigation', // or 'close', 'refresh'
        timestamp: new Date().toISOString()
      }
    };

    airlinesDataLayer.pushToDataLayer(exitEvent);
    this.log('Page exit tracked', { pathname, timeOnPage });
  }

  /**
   * Track page errors
   * @param {string} pathname - Current pathname
   * @param {Error} error - Error object
   * @param {string} errorType - Type of error
   */
  trackPageError(pathname, error, errorType = 'unknown') {
    const errorEvent = {
      event: 'pageError',
      eventData: {
        pathname,
        errorType,
        errorMessage: error.message,
        errorStack: error.stack,
        timestamp: new Date().toISOString()
      }
    };

    airlinesDataLayer.pushToDataLayer(errorEvent);
    this.log('Page error tracked', { pathname, errorType, errorMessage: error.message }, 'error');
  }
}

const pageViewTracker = new PageViewTracker();
export default pageViewTracker;
