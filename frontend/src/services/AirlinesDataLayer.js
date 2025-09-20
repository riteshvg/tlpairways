/**
 * AirlinesDataLayer - Adobe Data Layer implementation for airlines
 * Follows Adobe Data Layer standards and best practices
 */

class AirlinesDataLayer {
  constructor() {
    this.debug = process.env.NODE_ENV === 'development';
    this.initializeDataLayer();
  }

  /**
   * Initialize the global Adobe Data Layer
   */
  initializeDataLayer() {
    if (typeof window !== 'undefined') {
      // Initialize adobeDataLayer if it doesn't exist
      if (!window.adobeDataLayer) {
        window.adobeDataLayer = [];
      }
      
      this.log('AirlinesDataLayer initialized', {
        dataLayerLength: window.adobeDataLayer.length,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Set page data in the data layer
   * @param {Object} pageData - Page information object
   */
  setPageData(pageData) {
    const pageDataEvent = {
      event: 'page-data',
      pageData: {
        pageType: pageData.pageType || 'unknown',
        pageName: pageData.pageName || document.title,
        pageURL: pageData.pageURL || window.location.href,
        referrer: pageData.referrer || document.referrer,
        timestamp: new Date().toISOString(),
        ...pageData
      }
    };

    this.pushToDataLayer(pageDataEvent);
    this.log('Page data set', pageDataEvent);
  }

  /**
   * Track user interactions and push events to data layer
   * @param {string} eventName - Name of the event
   * @param {Object} eventData - Event data object
   */
  trackEvent(eventName, eventData = {}) {
    const event = {
      event: eventName,
      eventData: {
        ...eventData,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        screenResolution: `${screen.width}x${screen.height}`,
        viewportSize: `${window.innerWidth}x${window.innerHeight}`
      }
    };

    this.pushToDataLayer(event);
    this.log(`Event tracked: ${eventName}`, event);
  }

  /**
   * Track search form submissions
   * @param {Object} searchData - Search form data
   */
  trackSearchSubmission(searchData) {
    const searchEvent = {
      event: 'search-submission',
      eventData: {
        searchType: 'flight-search',
        origin: searchData.origin,
        destination: searchData.destination,
        departureDate: searchData.departureDate,
        returnDate: searchData.returnDate,
        passengers: searchData.passengers,
        tripType: searchData.tripType || 'round-trip',
        cabinClass: searchData.cabinClass || 'economy',
        timestamp: new Date().toISOString()
      }
    };

    this.pushToDataLayer(searchEvent);
    this.log('Search submission tracked', searchEvent);
  }

  /**
   * Track hero banner interactions
   * @param {string} interactionType - Type of interaction (click, hover, etc.)
   * @param {Object} bannerData - Banner information
   */
  trackHeroBannerInteraction(interactionType, bannerData = {}) {
    const bannerEvent = {
      event: 'hero-banner-interaction',
      eventData: {
        interactionType,
        bannerId: bannerData.bannerId,
        bannerTitle: bannerData.bannerTitle,
        bannerDestination: bannerData.bannerDestination,
        bannerPosition: bannerData.bannerPosition,
        timestamp: new Date().toISOString()
      }
    };

    this.pushToDataLayer(bannerEvent);
    this.log(`Hero banner ${interactionType} tracked`, bannerEvent);
  }

  /**
   * Track promotional banner clicks
   * @param {Object} bannerData - Promotional banner information
   */
  trackPromotionalBannerClick(bannerData) {
    const promoEvent = {
      event: 'promotional-banner-click',
      eventData: {
        bannerId: bannerData.bannerId,
        bannerTitle: bannerData.bannerTitle,
        bannerOffer: bannerData.bannerOffer,
        bannerDestination: bannerData.bannerDestination,
        bannerPosition: bannerData.bannerPosition,
        bannerCategory: bannerData.bannerCategory,
        timestamp: new Date().toISOString()
      }
    };

    this.pushToDataLayer(promoEvent);
    this.log('Promotional banner click tracked', promoEvent);
  }

  /**
   * Track scroll depth events
   * @param {number} scrollDepth - Scroll depth percentage (0-100)
   * @param {string} pageType - Type of page being scrolled
   */
  trackScrollDepth(scrollDepth, pageType) {
    const scrollEvent = {
      event: 'scroll-depth',
      eventData: {
        scrollDepth,
        pageType,
        scrollPercentage: Math.round(scrollDepth),
        timestamp: new Date().toISOString()
      }
    };

    this.pushToDataLayer(scrollEvent);
    this.log(`Scroll depth ${scrollDepth}% tracked`, scrollEvent);
  }

  /**
   * Track homepage interactions
   * @param {string} interactionType - Type of interaction
   * @param {Object} interactionData - Interaction data
   */
  trackHomepageInteraction(interactionType, interactionData = {}) {
    const homepageEvent = {
      event: 'homepage-interaction',
      eventData: {
        interactionType,
        ...interactionData,
        timestamp: new Date().toISOString()
      }
    };

    this.pushToDataLayer(homepageEvent);
    this.log(`Homepage interaction ${interactionType} tracked`, homepageEvent);
  }

  /**
   * Send data to Adobe Experience Platform
   * This method would typically integrate with Adobe Launch or Edge
   */
  sendToAdobeExperiencePlatform(eventData) {
    try {
      // In a real implementation, this would send to Adobe Edge
      // For now, we'll log the data that would be sent
      this.log('Data sent to Adobe Experience Platform', eventData);
      
      // Trigger Adobe Launch rule if available
      if (window._satellite && window._satellite.track) {
        window._satellite.track('airlines-event', eventData);
      }
    } catch (error) {
      this.log('Error sending data to Adobe Experience Platform', error, 'error');
    }
  }

  /**
   * Push data to the Adobe Data Layer
   * @param {Object} data - Data to push
   */
  pushToDataLayer(data) {
    if (typeof window !== 'undefined' && window.adobeDataLayer) {
      window.adobeDataLayer.push(data);
      
      // Automatically send to Adobe Experience Platform on key interactions
      this.sendToAdobeExperiencePlatform(data);
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
          console.warn('🛩️ AirlinesDataLayer:', logData);
          break;
        case 'error':
          console.error('🛩️ AirlinesDataLayer:', logData);
          break;
        default:
          console.log('🛩️ AirlinesDataLayer:', logData);
      }
    }
  }

  /**
   * Debug helper function for browser console
   */
  debugDataLayer() {
    console.log('🛩️ Adobe Data Layer Debug Info:');
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
const airlinesDataLayer = new AirlinesDataLayer();

// Make debug function globally available for browser console
if (typeof window !== 'undefined') {
  window.debugDataLayer = airlinesDataLayer.debugDataLayer.bind(airlinesDataLayer);
}

export default airlinesDataLayer;