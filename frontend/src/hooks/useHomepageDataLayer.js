/**
 * useHomepageDataLayer - Custom hook for homepage data layer functionality
 * Handles all data layer interactions for the homepage
 */

import { useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import airlinesDataLayer from '../services/AirlinesDataLayer';
import pageDataLayerManager from '../services/PageDataLayerManager';

// Global flag to prevent duplicate initialization across component re-renders
let homepageInitialized = false;

const useHomepageDataLayer = () => {
  const { user, isAuthenticated } = useAuth();
  const scrollDepthTracked = useRef(new Set());
  const lastScrollTime = useRef(0);
  const scrollThrottle = 500; // Throttle scroll events to every 500ms

  /**
   * Initialize homepage data layer on component mount
   * CRITICAL: This must fire IMMEDIATELY without waiting for Auth0
   */
  useEffect(() => {
    // CRITICAL: ALWAYS ensure consent is ready, even on re-visits
    // This must happen BEFORE any check to prevent timeout errors
    airlinesDataLayer.ensureConsentReady();
    
    // Prevent duplicate pageView across component re-renders and React StrictMode
    if (homepageInitialized) {
      console.log('🏠 Homepage already initialized - skipping duplicate pageView');
      // Consent is refreshed above, but skip duplicate pageView
      return;
    }
    
    // Set page data and track view in a single merged event
    // NOTE: Fire immediately without waiting for Auth0 to avoid timeout
    airlinesDataLayer.setPageDataWithView({
      pageType: 'home',
      pageName: 'Homepage',
      pageURL: window.location.href,
      referrer: document.referrer
    }, {
      userAuthenticated: isAuthenticated,
      userId: user?.id || null,
      landingPage: true
    });

    // Set current page as previous page for next navigation
    pageDataLayerManager.setPreviousPage('Homepage');

    homepageInitialized = true;
    console.log('🏠 Homepage data layer initialized');
    
    // Reset flag on SPA navigation away (not just browser unload)
    const resetFlag = () => {
      homepageInitialized = false;
      console.log('🔄 Homepage flag reset');
    };
    
    // Reset on browser unload
    window.addEventListener('beforeunload', resetFlag);
    
    // Cleanup function - reset when component unmounts (SPA navigation)
    return () => {
      window.removeEventListener('beforeunload', resetFlag);
      // Reset flag when navigating away in SPA
      homepageInitialized = false;
    };
  }, []); // CRITICAL: Empty array = fire once on mount, don't wait for Auth0

  /**
   * Update user data separately when Auth0 loads
   * This happens after initial pageView to avoid timeout
   */
  useEffect(() => {
    if (!homepageInitialized) return; // Only update if page is already initialized
    
    // Update data layer with user context when Auth0 finishes loading
    console.log('🔄 Updating homepage data layer with Auth0 user data');
    
    // You could push a separate event here if needed for analytics
    // airlinesDataLayer.pushToDataLayer({
    //   event: 'userContextUpdated',
    //   userAuthenticated: isAuthenticated,
    //   userId: user?.id || null
    // });
  }, [isAuthenticated, user?.id]);

  /**
   * Track scroll depth with throttling
   */
  const trackScrollDepth = useCallback(() => {
    const now = Date.now();
    if (now - lastScrollTime.current < scrollThrottle) {
      return;
    }
    lastScrollTime.current = now;

    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    
    const scrollDepth = Math.round((scrollTop + windowHeight) / documentHeight * 100);
    
    // Track milestone scroll depths (25%, 50%, 75%, 100%)
    const milestones = [25, 50, 75, 100];
    milestones.forEach(milestone => {
      if (scrollDepth >= milestone && !scrollDepthTracked.current.has(milestone)) {
        scrollDepthTracked.current.add(milestone);
        airlinesDataLayer.trackScrollDepth(milestone, 'home');
      }
    });
  }, []);

  /**
   * Set up scroll depth tracking
   */
  useEffect(() => {
    window.addEventListener('scroll', trackScrollDepth, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', trackScrollDepth);
    };
  }, [trackScrollDepth]);

  /**
   * Track hero banner interactions
   */
  const trackHeroBannerInteraction = useCallback((interactionType, bannerData) => {
    airlinesDataLayer.trackHeroBannerInteraction(interactionType, {
      ...bannerData,
      pageType: 'home',
      userAuthenticated: isAuthenticated
    });
  }, [isAuthenticated]);

  /**
   * Track promotional banner clicks
   */
  const trackPromotionalBannerClick = useCallback((bannerData) => {
    airlinesDataLayer.trackPromotionalBannerClick({
      ...bannerData,
      pageType: 'home',
      userAuthenticated: isAuthenticated
    });
  }, [isAuthenticated]);

  /**
   * Track search form submissions
   */
  const trackSearchSubmission = useCallback((searchData) => {
    airlinesDataLayer.trackSearchSubmission({
      ...searchData,
      pageType: 'home',
      userAuthenticated: isAuthenticated,
      userId: user?.id || null
    });
  }, [isAuthenticated, user]);

  /**
   * Track general homepage interactions
   */
  const trackHomepageInteraction = useCallback((interactionType, interactionData = {}) => {
    airlinesDataLayer.trackHomepageInteraction(interactionType, {
      ...interactionData,
      userAuthenticated: isAuthenticated,
      userId: user?.id || null
    });
  }, [isAuthenticated, user]);

  /**
   * Track featured destination clicks
   */
  const trackFeaturedDestinationClick = useCallback((destinationData) => {
    airlinesDataLayer.trackEvent('featured-destination-click', {
      destination: destinationData.destination,
      destinationCode: destinationData.destinationCode,
      price: destinationData.price,
      pageType: 'home',
      userAuthenticated: isAuthenticated,
      userId: user?.id || null
    });
  }, [isAuthenticated, user]);

  /**
   * Track navigation menu interactions
   */
  const trackNavigationInteraction = useCallback((menuItem, action = 'click') => {
    airlinesDataLayer.trackEvent('navigationInteraction', {
      menuItem,
      action,
      pageType: 'home',
      userAuthenticated: isAuthenticated,
      userId: user?.id || null
    });
  }, [isAuthenticated, user]);

  /**
   * Track user authentication actions
   */
  const trackAuthAction = useCallback((action, additionalData = {}) => {
    airlinesDataLayer.trackEvent('authAction', {
      action,
      ...additionalData,
      pageType: 'home'
    });
  }, []);

  /**
   * Track newsletter signup
   */
  const trackNewsletterSignup = useCallback((email) => {
    airlinesDataLayer.trackEvent('newsletterSignup', {
      email,
      pageType: 'home',
      userAuthenticated: isAuthenticated,
      userId: user?.id || null
    });
  }, [isAuthenticated, user]);

  return {
    trackHeroBannerInteraction,
    trackPromotionalBannerClick,
    trackSearchSubmission,
    trackHomepageInteraction,
    trackFeaturedDestinationClick,
    trackNavigationInteraction,
    trackAuthAction,
    trackNewsletterSignup,
    // Utility functions
    getDataLayer: airlinesDataLayer.getDataLayer.bind(airlinesDataLayer),
    clearDataLayer: airlinesDataLayer.clearDataLayer.bind(airlinesDataLayer)
  };
};

export default useHomepageDataLayer;