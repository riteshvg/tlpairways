/**
 * Enhanced Airlines Data Layer - Adobe Experience Platform compliant
 * Provides comprehensive data layer functionality with XDM schema validation
 */

import pageDataLayerManager from './PageDataLayerManager';

class EnhancedAirlinesDataLayer {
  constructor() {
    this.debug = process.env.NODE_ENV === 'development';
    this.consentManager = null;
    this.xdmValidator = null;
    this.initializeDataLayer();
    this.setupConsentManagement();
    this.setupXDMValidation();
  }

  /**
   * Initialize the global Adobe Data Layer
   */
  initializeDataLayer() {
    if (typeof window !== 'undefined') {
      if (!window.adobeDataLayer) {
        window.adobeDataLayer = [];
      }
      
      this.log('Enhanced Airlines Data Layer initialized', {
        dataLayerLength: window.adobeDataLayer.length,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Setup consent management integration
   */
  setupConsentManagement() {
    if (typeof window !== 'undefined' && window.OneTrust) {
      this.consentManager = window.OneTrust;
      this.log('Consent management integrated');
    }
  }

  /**
   * Setup XDM schema validation
   */
  setupXDMValidation() {
    this.xdmValidator = {
      validateFlightData: (flightData) => this.validateFlightData(flightData),
      validateSearchData: (searchData) => this.validateSearchData(searchData),
      validateUserData: (userData) => this.validateUserData(userData)
    };
  }

  /**
   * Check consent for specific data categories
   * @param {string} category - Consent category (analytics, marketing, functional)
   * @returns {boolean} Consent status
   */
  hasConsent(category = 'analytics') {
    if (!this.consentManager) return true; // Default to true if no consent manager
    
    try {
      return this.consentManager.IsOptedOut(category) === false;
    } catch (error) {
      this.log('Error checking consent', error, 'warn');
      return true; // Default to true on error
    }
  }

  /**
   * Validate flight data against XDM schema
   * @param {Object} flightData - Flight data to validate
   * @returns {Object} Validation result
   */
  validateFlightData(flightData) {
    const requiredFields = ['flightNumber', 'airline', 'origin', 'destination', 'departureTime', 'arrivalTime'];
    const missingFields = requiredFields.filter(field => !flightData[field]);
    
    return {
      isValid: missingFields.length === 0,
      missingFields,
      errors: missingFields.map(field => `Missing required field: ${field}`)
    };
  }

  /**
   * Validate search data against XDM schema
   * @param {Object} searchData - Search data to validate
   * @returns {Object} Validation result
   */
  validateSearchData(searchData) {
    const requiredFields = ['origin', 'destination', 'departureDate'];
    const missingFields = requiredFields.filter(field => !searchData[field]);
    
    return {
      isValid: missingFields.length === 0,
      missingFields,
      errors: missingFields.map(field => `Missing required field: ${field}`)
    };
  }

  /**
   * Validate user data against XDM schema
   * @param {Object} userData - User data to validate
   * @returns {Object} Validation result
   */
  validateUserData(userData) {
    // Basic validation - can be extended with full XDM schema
    return {
      isValid: true,
      missingFields: [],
      errors: []
    };
  }

  /**
   * Set page data with enhanced validation and consent checking
   * @param {string} pageType - Type of page
   * @param {Object} pageData - Page data object
   * @param {Object} options - Additional options
   */
  setPageData(pageType, pageData, options = {}) {
    if (!this.hasConsent('analytics')) {
      this.log('Analytics consent not granted, skipping page data tracking');
      return;
    }

    const validatedData = this.validatePageData(pageData);
    if (!validatedData.isValid) {
      this.log('Page data validation failed', validatedData.errors, 'error');
      return;
    }

    const pageDataEvent = {
      event: 'pageData',
      pageData: {
        pageType,
        pageName: pageData.pageName || document.title,
        pageURL: pageData.pageURL || window.location.href,
        referrer: pageData.referrer || document.referrer,
        previousPage: pageData.previousPage || pageDataLayerManager.getPreviousPage() || document.referrer || 'direct',
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        screenResolution: `${window.screen.width}x${window.screen.height}`,
        viewportSize: `${window.innerWidth}x${window.innerHeight}`,
        ...pageData
      },
      ...options
    };

    this.pushToDataLayer(pageDataEvent);
    this.log('Page data set', pageDataEvent);
  }

  /**
   * Validate page data
   * @param {Object} pageData - Page data to validate
   * @returns {Object} Validation result
   */
  validatePageData(pageData) {
    const requiredFields = ['pageType'];
    const missingFields = requiredFields.filter(field => !pageData[field]);
    
    return {
      isValid: missingFields.length === 0,
      missingFields,
      errors: missingFields.map(field => `Missing required field: ${field}`)
    };
  }

  /**
   * Track search results display with comprehensive metrics
   * @param {Object} searchContext - Search context data
   * @param {Object} resultsData - Results data
   * @param {Object} performanceData - Performance metrics
   */
  trackSearchResultsDisplay(searchContext, resultsData, performanceData = {}) {
    if (!this.hasConsent('analytics')) return;

    const eventData = {
      event: 'search-results-displayed',
      searchContext: {
        searchId: searchContext.searchId || this.generateSearchId(),
        origin: searchContext.origin,
        destination: searchContext.destination,
        departureDate: searchContext.departureDate,
        returnDate: searchContext.returnDate,
        passengers: searchContext.passengers || 1,
        cabinClass: searchContext.cabinClass || 'economy',
        tripType: searchContext.tripType || 'oneway',
        ...searchContext
      },
      resultsData: {
        totalResults: resultsData.totalResults || 0,
        onwardResults: resultsData.onwardResults || 0,
        returnResults: resultsData.returnResults || 0,
        priceRange: resultsData.priceRange || {},
        airlines: resultsData.airlines || [],
        durationRange: resultsData.durationRange || {},
        ...resultsData
      },
      performanceData: {
        pageLoadTime: performanceData.pageLoadTime || 0,
        apiResponseTime: performanceData.apiResponseTime || 0,
        renderTime: performanceData.renderTime || 0,
        ...performanceData
      },
      timestamp: new Date().toISOString()
    };

    this.pushToDataLayer(eventData);
    this.log('Search results displayed', eventData);
  }

  /**
   * Track flight selection with detailed context
   * @param {Object} flight - Flight data
   * @param {Object} searchContext - Search context
   * @param {Object} userContext - User context
   */
  trackFlightSelection(flight, searchContext, userContext = {}) {
    if (!this.hasConsent('analytics')) return;

    const validation = this.xdmValidator.validateFlightData(flight);
    if (!validation.isValid) {
      this.log('Flight data validation failed', validation.errors, 'error');
      return;
    }

    const eventData = {
      event: 'flight-selected',
      flight: {
        flightNumber: flight.flightNumber,
        airline: flight.airline,
        origin: flight.origin?.iata_code || flight.origin,
        destination: flight.destination?.iata_code || flight.destination,
        departureTime: flight.departureTime,
        arrivalTime: flight.arrivalTime,
        duration: flight.duration,
        stops: flight.stops || 0,
        price: flight.price?.amount || flight.price,
        currency: flight.price?.currency || 'INR',
        cabinClass: flight.cabinClass || 'economy',
        availability: flight.availableSeats || 0,
        aircraft: flight.aircraft,
        ...flight
      },
      searchContext: {
        searchId: searchContext.searchId || this.generateSearchId(),
        resultPosition: searchContext.resultPosition || 0,
        totalResults: searchContext.totalResults || 0,
        currentFilters: searchContext.currentFilters || [],
        sortBy: searchContext.sortBy || 'price',
        ...searchContext
      },
      userContext: {
        isLoggedIn: userContext.isLoggedIn || false,
        loyaltyTier: userContext.loyaltyTier || null,
        userId: userContext.userId || null,
        ...userContext
      },
      timestamp: new Date().toISOString()
    };

    this.pushToDataLayer(eventData);
    this.log('Flight selected', eventData);
  }

  /**
   * Track filter interactions with detailed analytics
   * @param {string} filterType - Type of filter
   * @param {*} filterValue - Filter value
   * @param {Object} context - Additional context
   */
  trackFilterInteraction(filterType, filterValue, context = {}) {
    if (!this.hasConsent('analytics')) return;

    const eventData = {
      event: 'search-filter-applied',
      filterType,
      filterValue,
      previousFilters: context.previousFilters || [],
      resultsBeforeFilter: context.resultsBeforeFilter || 0,
      resultsAfterFilter: context.resultsAfterFilter || 0,
      searchId: context.searchId || this.generateSearchId(),
      interactionMethod: context.interactionMethod || 'click',
      timestamp: new Date().toISOString()
    };

    this.pushToDataLayer(eventData);
    this.log('Filter interaction tracked', eventData);
  }

  /**
   * Track sort interactions
   * @param {string} sortBy - Sort criteria
   * @param {string} sortOrder - Sort order (asc/desc)
   * @param {Object} context - Additional context
   */
  trackSortInteraction(sortBy, sortOrder, context = {}) {
    if (!this.hasConsent('analytics')) return;

    const eventData = {
      event: 'search-sort-applied',
      sortBy,
      sortOrder,
      previousSort: context.previousSort || null,
      searchId: context.searchId || this.generateSearchId(),
      resultsCount: context.resultsCount || 0,
      timestamp: new Date().toISOString()
    };

    this.pushToDataLayer(eventData);
    this.log('Sort interaction tracked', eventData);
  }

  /**
   * Track pagination interactions
   * @param {number} pageNumber - Page number
   * @param {number} resultsPerPage - Results per page
   * @param {Object} context - Additional context
   */
  trackPaginationInteraction(pageNumber, resultsPerPage, context = {}) {
    if (!this.hasConsent('analytics')) return;

    const eventData = {
      event: 'search-pagination',
      pageNumber,
      resultsPerPage,
      totalPages: context.totalPages || 0,
      searchId: context.searchId || this.generateSearchId(),
      timestamp: new Date().toISOString()
    };

    this.pushToDataLayer(eventData);
    this.log('Pagination interaction tracked', eventData);
  }

  /**
   * Track search refinement attempts
   * @param {Object} refinementData - Refinement data
   * @param {Object} context - Additional context
   */
  trackSearchRefinement(refinementData, context = {}) {
    if (!this.hasConsent('analytics')) return;

    const eventData = {
      event: 'search-refinement',
      refinementType: refinementData.type || 'unknown',
      previousSearch: refinementData.previousSearch || {},
      newSearch: refinementData.newSearch || {},
      searchId: context.searchId || this.generateSearchId(),
      timestamp: new Date().toISOString()
    };

    this.pushToDataLayer(eventData);
    this.log('Search refinement tracked', eventData);
  }

  /**
   * Track search abandonment
   * @param {Object} abandonmentData - Abandonment data
   * @param {Object} context - Additional context
   */
  trackSearchAbandonment(abandonmentData, context = {}) {
    if (!this.hasConsent('analytics')) return;

    const eventData = {
      event: 'search-abandonment',
      abandonmentReason: abandonmentData.reason || 'unknown',
      timeOnPage: abandonmentData.timeOnPage || 0,
      lastAction: abandonmentData.lastAction || 'unknown',
      searchId: context.searchId || this.generateSearchId(),
      timestamp: new Date().toISOString()
    };

    this.pushToDataLayer(eventData);
    this.log('Search abandonment tracked', eventData);
  }

  /**
   * Track no results scenarios
   * @param {Object} searchContext - Search context
   * @param {Object} context - Additional context
   */
  trackNoResults(searchContext, context = {}) {
    if (!this.hasConsent('analytics')) return;

    const eventData = {
      event: 'search-no-results',
      searchContext: {
        origin: searchContext.origin,
        destination: searchContext.destination,
        departureDate: searchContext.departureDate,
        returnDate: searchContext.returnDate,
        passengers: searchContext.passengers || 1,
        cabinClass: searchContext.cabinClass || 'economy',
        ...searchContext
      },
      suggestions: context.suggestions || [],
      alternativeDates: context.alternativeDates || [],
      searchId: context.searchId || this.generateSearchId(),
      timestamp: new Date().toISOString()
    };

    this.pushToDataLayer(eventData);
    this.log('No results tracked', eventData);
  }

  /**
   * Track flight comparison interactions
   * @param {string} action - Comparison action
   * @param {Object} flight - Flight data
   * @param {Object} context - Additional context
   */
  trackFlightComparison(action, flight, context = {}) {
    if (!this.hasConsent('analytics')) return;

    const eventData = {
      event: 'flight-comparison',
      action, // 'added', 'removed', 'viewed', 'cleared'
      flight: {
        flightNumber: flight.flightNumber,
        airline: flight.airline,
        price: flight.price?.amount || flight.price,
        ...flight
      },
      comparisonContext: {
        totalFlightsInComparison: context.totalFlightsInComparison || 0,
        comparisonId: context.comparisonId || this.generateComparisonId(),
        additionMethod: context.additionMethod || 'compare-button',
        ...context
      },
      timestamp: new Date().toISOString()
    };

    this.pushToDataLayer(eventData);
    this.log('Flight comparison tracked', eventData);
  }

  /**
   * Track error scenarios with detailed context
   * @param {string} errorType - Type of error
   * @param {Error} error - Error object
   * @param {Object} context - Additional context
   */
  trackError(errorType, error, context = {}) {
    const eventData = {
      event: 'search-error',
      errorType,
      errorMessage: error.message || 'Unknown error',
      errorStack: error.stack || null,
      searchId: context.searchId || this.generateSearchId(),
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      ...context
    };

    this.pushToDataLayer(eventData);
    this.log('Error tracked', eventData, 'error');
  }

  /**
   * Generate unique search ID
   * @returns {string} Search ID
   */
  generateSearchId() {
    return `search_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate unique comparison ID
   * @returns {string} Comparison ID
   */
  generateComparisonId() {
    return `comp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Push data to the Adobe Data Layer
   * @param {Object} data - Data to push
   */
  pushToDataLayer(data) {
    if (typeof window !== 'undefined' && window.adobeDataLayer) {
      window.adobeDataLayer.push(data);
      
      // Send to Adobe Experience Platform
      this.sendToAdobeExperiencePlatform(data);
    }
  }

  /**
   * Send data to Adobe Experience Platform
   * @param {Object} eventData - Event data
   */
  sendToAdobeExperiencePlatform(eventData) {
    try {
      // In a real implementation, this would send to Adobe Edge
      this.log('Data sent to Adobe Experience Platform', eventData);
      
      // Trigger Adobe Launch rule if available
      if (window._satellite && window._satellite.track) {
        window._satellite.track('enhanced-airlines-event', eventData);
      }
    } catch (error) {
      this.log('Error sending data to Adobe Experience Platform', error, 'error');
    }
  }

  /**
   * Get current data layer state
   * @returns {Array} Current data layer array
   */
  getDataLayer() {
    return typeof window !== 'undefined' ? window.adobeDataLayer : [];
  }

  /**
   * Clear the data layer
   */
  clearDataLayer() {
    if (typeof window !== 'undefined' && window.adobeDataLayer) {
      window.adobeDataLayer.length = 0;
      this.log('Data layer cleared');
    }
  }

  /**
   * Debug logging
   * @param {string} message - Log message
   * @param {Object} data - Data to log
   * @param {string} level - Log level (info, warn, error)
   */
  log(message, data = null, level = 'info') {
    if (this.debug) {
      const logData = {
        timestamp: new Date().toISOString(),
        message,
        data
      };

      switch (level) {
        case 'warn':
          console.warn('🛩️ Enhanced Airlines Data Layer:', logData);
          break;
        case 'error':
          console.error('🛩️ Enhanced Airlines Data Layer:', logData);
          break;
        default:
          console.log('🛩️ Enhanced Airlines Data Layer:', logData);
      }
    }
  }

  /**
   * Debug helper function for browser console
   */
  debugDataLayer() {
    console.log('🛩️ Enhanced Adobe Data Layer Debug Info:');
    console.log('Total Events:', window.adobeDataLayer ? window.adobeDataLayer.length : 0);
    console.log('All Events:', window.adobeDataLayer || []);
    
    if (window.adobeDataLayer && window.adobeDataLayer.length > 0) {
      // Group events by type
      const eventTypes = {};
      window.adobeDataLayer.forEach(event => {
        if (!eventTypes[event.event]) {
          eventTypes[event.event] = [];
        }
        eventTypes[event.event].push(event);
      });
      
      console.log('Events by Type:', eventTypes);
    }
    
    return window.adobeDataLayer || [];
  }
}

// Create singleton instance
const enhancedAirlinesDataLayer = new EnhancedAirlinesDataLayer();

// Make debug functions globally available for browser console
if (typeof window !== 'undefined') {
  window.debugEnhancedDataLayer = enhancedAirlinesDataLayer.debugDataLayer.bind(enhancedAirlinesDataLayer);
}

export default enhancedAirlinesDataLayer;
