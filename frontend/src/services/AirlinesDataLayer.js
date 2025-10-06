/**
 * AirlinesDataLayer - Adobe Data Layer implementation for airlines
 * Follows Adobe Data Layer standards and best practices
 */

import pageDataLayerManager from './PageDataLayerManager';

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
      event: 'pageData',
      pageData: {
        pageType: pageData.pageType || 'unknown',
        pageName: pageData.pageName || document.title,
        pageURL: pageData.pageURL || window.location.href,
        referrer: pageData.referrer || document.referrer,
        previousPage: pageData.previousPage || pageDataLayerManager.getPreviousPage() || document.referrer || 'direct',
        timestamp: new Date().toISOString(),
        ...pageData
      }
    };

    this.pushToDataLayer(pageDataEvent);
    this.log('Page data set', pageDataEvent);
  }

  /**
   * Set page data and track page view in a single event
   * @param {Object} pageData - Page information object
   * @param {Object} viewData - Additional view tracking data
   */
  setPageDataWithView(pageData, viewData = {}) {
    const combinedEvent = {
      event: 'pageView',
      pageData: {
        pageType: pageData.pageType || 'unknown',
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
      viewData: {
        landingPage: viewData.landingPage || false,
        userAuthenticated: viewData.userAuthenticated || false,
        userId: viewData.userId || null,
        sessionId: viewData.sessionId || null,
        ...viewData
      }
    };

    this.pushToDataLayer(combinedEvent);
    this.log('Page data with view tracked', combinedEvent);
  }

  /**
   * Set user data in the data layer
   * @param {Object} userData - User information object
   */
  setUserData(userData) {
    const userDataEvent = {
      event: 'userData',
      userData: {
        ...userData,
        timestamp: new Date().toISOString()
      }
    };

    this.pushToDataLayer(userDataEvent);
    this.log('User data set', userDataEvent);
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
        screenResolution: `${window.screen.width}x${window.screen.height}`,
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
      event: 'searchSubmission',
      eventData: {
        searchType: 'flightSearch',
        origin: searchData.origin,
        destination: searchData.destination,
        departureDate: searchData.departureDate,
        returnDate: searchData.returnDate,
        passengers: searchData.passengers,
        tripType: searchData.tripType || 'roundTrip',
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
      event: 'heroBannerInteraction',
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
      event: 'promotionalBannerClick',
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
      event: 'scrollDepth',
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
      event: 'homepageInteraction',
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
   * Set revenue data for transaction tracking
   * @param {Object} revenueData - Revenue and transaction data
   */
  setRevenueData(revenueData) {
    const revenueEvent = {
      event: 'purchase',
      eventData: {
        revenue: {
          transactionId: revenueData.transactionId || this.generateTransactionId(),
          totalRevenue: revenueData.totalRevenue || 0,
          currency: revenueData.currency || 'INR',
          products: revenueData.products || [],
          bookingReference: revenueData.bookingReference || this.generateBookingReference(),
          paymentMethod: revenueData.paymentMethod || 'unknown',
          paymentStatus: revenueData.paymentStatus || 'completed',
          timestamp: new Date().toISOString()
        },
        customer: {
          userId: revenueData.userId || null,
          email: revenueData.email || null,
          phone: revenueData.phone || null,
          loyaltyTier: revenueData.loyaltyTier || 'standard'
        },
        booking: {
          tripType: revenueData.tripType || 'oneWay',
          cabinClass: revenueData.cabinClass || 'economy',
          passengers: revenueData.passengers || 1,
          origin: revenueData.origin || null,
          destination: revenueData.destination || null,
          departureDate: revenueData.departureDate || null,
          returnDate: revenueData.returnDate || null
        }
      },
      timestamp: new Date().toISOString()
    };

    this.pushToDataLayer(revenueEvent);
    this.log('Revenue data set', revenueEvent);
  }

  /**
   * Track confirmation email requests
   * @param {Object} emailData - Email request data
   */
  trackConfirmationEmailRequest(emailData) {
    const emailEvent = {
      event: 'confirmationEmailRequest',
      eventData: {
        emailType: emailData.emailType || 'booking_confirmation',
        recipientEmail: emailData.recipientEmail,
        bookingReference: emailData.bookingReference,
        requestStatus: emailData.requestStatus || 'requested',
        timestamp: new Date().toISOString()
      }
    };

    this.pushToDataLayer(emailEvent);
    this.log('Confirmation email request tracked', emailEvent);
  }

  /**
   * Track travel insurance upsells
   * @param {Object} insuranceData - Insurance upsell data
   */
  trackTravelInsuranceUpsell(insuranceData) {
    const insuranceEvent = {
      event: 'travelInsuranceUpsell',
      eventData: {
        upsellType: insuranceData.upsellType || 'travel_insurance',
        insuranceProvider: insuranceData.insuranceProvider || 'unknown',
        coverageAmount: insuranceData.coverageAmount || 0,
        premium: insuranceData.premium || 0,
        currency: insuranceData.currency || 'INR',
        userAction: insuranceData.userAction || 'viewed', // viewed, accepted, declined
        bookingReference: insuranceData.bookingReference,
        timestamp: new Date().toISOString()
      }
    };

    this.pushToDataLayer(insuranceEvent);
    this.log('Travel insurance upsell tracked', insuranceEvent);
  }

  /**
   * Track social sharing interactions
   * @param {Object} sharingData - Social sharing data
   */
  trackSocialSharing(sharingData) {
    const sharingEvent = {
      event: 'socialSharing',
      eventData: {
        platform: sharingData.platform, // facebook, twitter, linkedin, whatsapp, etc.
        shareType: sharingData.shareType || 'booking_confirmation',
        bookingReference: sharingData.bookingReference,
        contentShared: sharingData.contentShared || 'booking_details',
        timestamp: new Date().toISOString()
      }
    };

    this.pushToDataLayer(sharingEvent);
    this.log('Social sharing tracked', sharingEvent);
  }

  /**
   * Track print confirmation actions
   * @param {Object} printData - Print action data
   */
  trackPrintConfirmation(printData) {
    const printEvent = {
      event: 'printConfirmation',
      eventData: {
        printType: printData.printType || 'booking_confirmation',
        bookingReference: printData.bookingReference,
        printFormat: printData.printFormat || 'pdf',
        timestamp: new Date().toISOString()
      }
    };

    this.pushToDataLayer(printEvent);
    this.log('Print confirmation tracked', printEvent);
  }

  /**
   * Track sustainability impact views
   * @param {Object} sustainabilityData - Sustainability data
   */
  trackSustainabilityImpact(sustainabilityData) {
    const sustainabilityEvent = {
      event: 'sustainabilityImpact',
      eventData: {
        impactType: sustainabilityData.impactType || 'carbon_footprint',
        carbonOffset: sustainabilityData.carbonOffset || 0,
        unit: sustainabilityData.unit || 'kg_co2',
        treesPlanted: sustainabilityData.treesPlanted || 0,
        userAction: sustainabilityData.userAction || 'viewed', // viewed, contributed, shared
        bookingReference: sustainabilityData.bookingReference,
        timestamp: new Date().toISOString()
      }
    };

    this.pushToDataLayer(sustainabilityEvent);
    this.log('Sustainability impact tracked', sustainabilityEvent);
  }

  /**
   * Track SMS notification preferences
   * @param {Object} smsData - SMS notification data
   */
  trackSMSNotification(smsData) {
    const smsEvent = {
      event: 'smsNotification',
      eventData: {
        notificationType: smsData.notificationType || 'booking_confirmation',
        phoneNumber: smsData.phoneNumber,
        bookingReference: smsData.bookingReference,
        requestStatus: smsData.requestStatus || 'requested',
        timestamp: new Date().toISOString()
      }
    };

    this.pushToDataLayer(smsEvent);
    this.log('SMS notification tracked', smsEvent);
  }

  /**
   * Generate a unique transaction ID
   * @returns {string} Transaction ID
   */
  generateTransactionId() {
    return 'TXN' + Date.now() + Math.random().toString(36).substr(2, 9).toUpperCase();
  }

  /**
   * Generate a unique booking reference
   * @returns {string} Booking reference
   */
  generateBookingReference() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * Send data to Adobe Experience Platform
   * This method would typically integrate with Adobe Launch or Edge
   */
  sendToAEP(eventData) {
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
   * Send data to Adobe Experience Platform (alias for sendToAEP)
   * This method would typically integrate with Adobe Launch or Edge
   */
  sendToAdobeExperiencePlatform(eventData) {
    this.sendToAEP(eventData);
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

  /**
   * Reset homepage initialization flag (for debugging)
   */
  resetHomepageInitialization() {
    if (typeof window !== 'undefined' && window.homepageInitialized !== undefined) {
      window.homepageInitialized = false;
      console.log('🛩️ Homepage initialization flag reset');
    }
  }
}

// Create singleton instance
const airlinesDataLayer = new AirlinesDataLayer();

// Make debug functions globally available for browser console
if (typeof window !== 'undefined') {
  window.debugDataLayer = airlinesDataLayer.debugDataLayer.bind(airlinesDataLayer);
  window.resetHomepageInit = airlinesDataLayer.resetHomepageInitialization.bind(airlinesDataLayer);
}

export default airlinesDataLayer;