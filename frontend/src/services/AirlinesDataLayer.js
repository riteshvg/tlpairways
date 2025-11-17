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
      const initStartTime = performance.now();
      const initTimestamp = new Date().toISOString();
      const initTimeMs = Date.now();
      
      // Initialize adobeDataLayer if it doesn't exist
      if (!window.adobeDataLayer) {
        window.adobeDataLayer = [];
      }

      if (!window.adobeDataLayer.getState) {
        window.adobeDataLayer.getState = () => window._adobeDataLayerState || {};
      }
      
      // Initialize computed state object for current page data (separate from array)
      if (!window._adobeDataLayerState) {
        window._adobeDataLayerState = {};
      }
      
      // CRITICAL: Initialize consent state IMMEDIATELY
      // This ensures defaultConsent is available when Adobe Launch loads
      this.initializeConsentState();
      
      const initEndTime = performance.now();
      const initDuration = initEndTime - initStartTime;
      
      // Mark DataLayer as completely initialized
      window.__tlDataLayerInitTime = {
        timestamp: initTimestamp,
        timeMs: initTimeMs,
        performanceTime: initEndTime,
        duration: initDuration,
        complete: true
      };
      
      // Log with precise timestamp
      console.log('%c📊 DATALAYER INITIALIZED (COMPLETE)', 'color: #4CAF50; font-weight: bold; font-size: 14px;', {
        timestamp: initTimestamp,
        timeMs: initTimeMs,
        performanceTime: `${initEndTime.toFixed(2)}ms`,
        duration: `${initDuration.toFixed(2)}ms`,
        dataLayerLength: window.adobeDataLayer.length,
        dataLayerReady: true
      });
      
      // Check for overlap with Adobe Launch if it's already loaded
      this.checkLaunchOverlap(initEndTime);
      
      this.log('AirlinesDataLayer initialized', {
        dataLayerLength: window.adobeDataLayer.length,
        timestamp: initTimestamp
      });
    }
  }
  
  /**
   * Check for overlap between DataLayer and Adobe Launch script loading
   */
  checkLaunchOverlap(dataLayerTime) {
    if (typeof window === 'undefined') return;
    
    const launchInitTime = window.__tlLaunchInitTime;
    
    if (launchInitTime) {
      const timeDiff = Math.abs(dataLayerTime - launchInitTime.performanceTime);
      const overlap = timeDiff < 100; // Consider overlap if within 100ms
      
      console.log('%c⚠️ DATALAYER vs LAUNCH TIMING ANALYSIS', 'color: #FF9800; font-weight: bold; font-size: 14px;', {
        dataLayerTime: `${dataLayerTime.toFixed(2)}ms`,
        launchTime: `${launchInitTime.performanceTime.toFixed(2)}ms`,
        timeDifference: `${timeDiff.toFixed(2)}ms`,
        hasOverlap: overlap,
        dataLayerFirst: dataLayerTime < launchInitTime.performanceTime,
        launchFirst: launchInitTime.performanceTime < dataLayerTime,
        recommendation: overlap 
          ? 'Potential race condition - consider adding explicit wait logic'
          : 'No overlap detected - safe execution order'
      });
      
      // Show final summary
      this.showTimingSummary();
    } else {
      console.log('%c⏳ Adobe Launch not yet loaded - will check when Launch loads', 'color: #2196F3; font-weight: bold;');
    }
  }
  
  /**
   * Helper: Check if this is the user's first visit
   */
  isFirstVisit() {
    if (typeof window === 'undefined') return false;
    try {
      const firstVisit = localStorage.getItem('tlairways_firstVisit');
      if (firstVisit === null) {
        localStorage.setItem('tlairways_firstVisit', 'false');
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  }

  /**
   * Helper: Get cookie value by name
   */
  getCookieValue(name) {
    if (typeof document === 'undefined') return null;
    
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
      const cookies = document.cookie.split(';');
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        if (cookie.startsWith(name + '=')) {
          cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
          break;
        }
      }
    }
    return cookieValue;
  }

  /**
   * Determine defaultConsent intelligently based on stored state, cookies, and geolocation
   */
  determineDefaultConsent(consentState) {
    // If we have stored consent preferences, use them
    if (consentState?.preferences) {
      if (consentState.preferences.analytics || consentState.preferences.marketing) {
        return 'in';
      }
      if (consentState.action === 'out') {
        return 'out';
      }
    }
    
    // Check for OneTrust cookie (if migrating from OneTrust)
    try {
      const optanonConsent = this.getCookieValue('OptanonConsent');
      if (optanonConsent) {
        const c0002Pattern = /C0002:([01])/;
        const c0002Match = optanonConsent.match(c0002Pattern);
        if (c0002Match && c0002Match[1] === '1') {
          console.log('📊 Detected OneTrust consent cookie: "in"');
          return 'in';
        }
      }
    } catch (error) {
      console.warn('⚠️ Error reading OneTrust cookie:', error);
    }
    
    // For first-time visitors in privacy-sensitive regions, default to 'in' (opt-in required)
    // For other regions, 'pending' allows data collection until explicit opt-out
    if (this.isFirstVisit()) {
      // You can add geolocation logic here if needed
      // For now, default to 'pending' for all first-time visitors
      console.log('👋 First visit detected - defaultConsent: "pending"');
      return 'pending';
    }
    
    // Default for returning visitors with no stored consent
    return 'pending';
  }

  /**
   * Initialize consent state from localStorage into data layer
   * This runs BEFORE any pageView events to ensure Web SDK can configure first
   */
  initializeConsentState() {
    if (typeof window === 'undefined') return;
    
    const CONSENT_STORAGE_KEY = 'tlairways_consent_preferences';
    let consentState = null;
    
    try {
      const stored = localStorage.getItem(CONSENT_STORAGE_KEY);
      if (stored) {
        consentState = JSON.parse(stored);
      }
    } catch (error) {
      console.warn('⚠️ Failed to load consent from localStorage:', error);
    }
    
    // Determine defaultConsent intelligently
    const defaultConsent = this.determineDefaultConsent(consentState);
    
    // ALWAYS set defaultConsent in state (even if 'pending')
    window._adobeDataLayerState.consent = window._adobeDataLayerState.consent || {};
    window._adobeDataLayerState.consent.defaultConsent = defaultConsent;
    
    if (consentState && consentState.preferences) {
      // Merge full consent state
      window._adobeDataLayerState.consent = {
        defaultConsent,
        ...consentState,
        categories: consentState.preferences
      };
      
      // Push consent event to array BEFORE any pageView events
      window.adobeDataLayer.push({
        event: 'consentPreferencesUpdated',
        consent: {
          defaultConsent,
          ...consentState,
          categories: consentState.preferences
        }
      });
      
      console.log('✅ Consent pushed to data layer (position 0):', {
        defaultConsent,
        action: consentState.action,
        preferences: consentState.preferences,
        updatedAt: consentState.updatedAt,
        arrayPosition: 0
      });
    } else {
      console.log(`ℹ️ No stored consent - defaultConsent set to "${defaultConsent}"`);
    }
  }
  
  /**
   * Show complete timing summary for both DataLayer and Launch
   */
  showTimingSummary() {
    if (typeof window === 'undefined') return;
    
    const dataLayerTime = window.__tlDataLayerInitTime;
    const launchTime = window.__tlLaunchInitTime;
    
    if (!dataLayerTime || !launchTime) {
      return; // Wait for both to be ready
    }
    
    const timeDiff = Math.abs(dataLayerTime.performanceTime - launchTime.performanceTime);
    const overlap = timeDiff < 100;
    const dataLayerFirst = dataLayerTime.performanceTime < launchTime.performanceTime;
    
    console.log('%c📊 COMPLETE TIMING SUMMARY', 'color: #2196F3; font-weight: bold; font-size: 16px; background: #E3F2FD; padding: 10px; border-radius: 5px;');
    console.table({
      'DataLayer': {
        'Status': '✅ Complete',
        'Timestamp': dataLayerTime.timestamp,
        'Performance Time': `${dataLayerTime.performanceTime.toFixed(2)}ms`,
        'Duration': `${dataLayerTime.duration.toFixed(2)}ms`
      },
      'Adobe Launch': {
        'Status': '✅ Complete',
        'Timestamp': launchTime.timestamp,
        'Performance Time': `${launchTime.performanceTime.toFixed(2)}ms`,
        'Script URL': launchTime.scriptUrl
      },
      'Timing Analysis': {
        'Time Difference': `${timeDiff.toFixed(2)}ms`,
        'Has Overlap': overlap ? '⚠️ YES' : '✅ NO',
        'Load Order': dataLayerFirst ? 'DataLayer → Launch' : 'Launch → DataLayer',
        'Recommendation': overlap 
          ? '⚠️ Potential race condition'
          : '✅ Safe execution order'
      }
    });
  }

  /**
   * Initialize consent state from localStorage
   * Sets defaultConsent BEFORE Adobe Launch loads
   */
  initializeConsentState() {
    if (typeof window === 'undefined') return;
    
    const CONSENT_STORAGE_KEY = 'tlairways_consent_preferences';
    let consentState = null;
    let defaultConsent = 'pending'; // Safe default
    let consentValue = 'pending'; // Explicit consent value attribute
    
    try {
      const stored = localStorage.getItem(CONSENT_STORAGE_KEY);
      if (stored) {
        consentState = JSON.parse(stored);
        
        // Map action to consent value
        if (consentState.action === 'in' || consentState.action === 'acceptAll') {
          defaultConsent = 'in';
          consentValue = 'in';
        } else if (consentState.action === 'out' || consentState.action === 'rejectAll') {
          defaultConsent = 'out';
          consentValue = 'out';
        } else if (consentState.preferences) {
          // For granular saves: check if user has enabled analytics OR marketing
          const hasAnalyticsOrMarketing = consentState.preferences.analytics || consentState.preferences.marketing;
          
          if (hasAnalyticsOrMarketing) {
            defaultConsent = 'in';
            consentValue = 'in';
          } else {
            // User has denied both analytics and marketing
            defaultConsent = 'out';
            consentValue = 'out';
          }
        }
      }
    } catch (error) {
      console.warn('⚠️ Failed to load consent from localStorage:', error);
    }
    
    // ALWAYS set defaultConsent - even if 'pending'
    window._adobeDataLayerState.consent = {
      value: consentValue,           // NEW: Direct consent value ('in'|'out'|'pending')
      defaultConsent: defaultConsent, // For Adobe Web SDK
      ...(consentState || {}),
      categories: consentState?.preferences || { necessary: true }
    };
    
    console.log('✅ Consent initialized in data layer:', {
      value: consentValue,
      defaultConsent: defaultConsent,
      action: consentState?.action,
      hasStoredConsent: !!consentState
    });
    
    // If we have stored consent, push the event too
    if (consentState && consentState.preferences) {
      window.adobeDataLayer.push({
        event: 'consentPreferencesUpdated',
        consent: {
          value: consentValue,
          defaultConsent: defaultConsent,
          ...consentState,
          categories: consentState.preferences
        }
      });
      console.log('✅ Consent event pushed to data layer');
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
   * Ensure consent is available before any pageView events
   * Called before EVERY pageView to prevent race conditions
   */
  ensureConsentReady() {
    if (typeof window === 'undefined') return;
    
    // If consent not yet initialized, do it NOW (synchronously)
    if (!window._adobeDataLayerState?.consent?.value) {
      console.warn('⚠️ Consent not ready - initializing now (emergency fallback)');
      this.initializeConsentState();
    }
  }

  /**
   * Set page data and track page view in a single event
   * @param {Object} pageData - Page information object
   * @param {Object} viewData - Additional view tracking data
   */
  setPageDataWithView(pageData, viewData = {}) {
    // CRITICAL: Ensure consent is ready BEFORE pushing pageView
    this.ensureConsentReady();
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
      // Validate data before pushing
      if (!data || typeof data !== 'object') {
        console.warn('⚠️ Attempted to push invalid data to adobeDataLayer:', data);
        return;
      }
      
      // Push event to array for history
      window.adobeDataLayer.push(data);
      
      // Update computed state with latest page-specific data
      const stateUpdate = {};
      if (data.pageData) stateUpdate.pageData = data.pageData;
      if (data.searchContext) stateUpdate.searchContext = data.searchContext;
      if (data.bookingContext) stateUpdate.bookingContext = data.bookingContext;
      if (data.userContext) stateUpdate.userContext = data.userContext;
      if (data.eventData) stateUpdate.eventData = data.eventData;
      if (data.paymentDetails) stateUpdate.paymentDetails = data.paymentDetails;
      if (data.pricing) stateUpdate.pricing = data.pricing;
      if (data.ancillaryServices) stateUpdate.ancillaryServices = data.ancillaryServices;
      
      if (Object.keys(stateUpdate).length > 0) {
        this.setComputedState(stateUpdate);
      }
      
      // Limit array size to prevent memory issues
      if (window.adobeDataLayer.length > 50) {
        // Keep only the last 30 events
        window.adobeDataLayer.splice(0, window.adobeDataLayer.length - 30);
        this.log('Data layer pruned to prevent memory issues');
      }
      
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
   * Update computed state for current page
   * This replaces old page data instead of appending
   * @param {Object} stateData - State data to set
   */
  setComputedState(stateData) {
    if (typeof window !== 'undefined') {
      // Initialize if doesn't exist
      if (!window._adobeDataLayerState) {
        window._adobeDataLayerState = {};
      }
      
      // Merge new state, replacing old values
      window._adobeDataLayerState = {
        ...window._adobeDataLayerState,
        ...stateData,
        _lastUpdated: new Date().toISOString()
      };
      
      this.log('Computed state updated', window._adobeDataLayerState);
    }
  }

  /**
   * Clear page-specific data from computed state
   * Call this on page navigation to prevent stale data
   * @param {Array} keysToKeep - Keys to preserve (e.g., user data)
   */
  clearPageState(keysToKeep = ['userContext', 'sessionId']) {
    if (typeof window !== 'undefined' && window._adobeDataLayerState) {
      const preservedData = {};
      keysToKeep.forEach(key => {
        if (window._adobeDataLayerState[key]) {
          preservedData[key] = window._adobeDataLayerState[key];
        }
      });
      
      window._adobeDataLayerState = preservedData;
      this.log('Page state cleared, preserved:', keysToKeep);
    }
  }

  /**
   * Get current computed state
   * Use this in Adobe Launch data elements instead of array indexing
   * @returns {Object} Current page state
   */
  getComputedState() {
    if (typeof window !== 'undefined' && window._adobeDataLayerState) {
      return window._adobeDataLayerState;
    }
    return {};
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
  window.showTimingSummary = airlinesDataLayer.showTimingSummary.bind(airlinesDataLayer);
}

export default airlinesDataLayer;