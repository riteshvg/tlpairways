/**
 * useHomepageDataLayer - Custom hook for homepage data layer functionality
 * Handles all data layer interactions for the homepage
 */

import { useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import airlinesDataLayer from '../services/AirlinesDataLayer';

// Global flag to prevent duplicate initialization across component re-renders
let homepageInitialized = false;

const useHomepageDataLayer = () => {
  const { user, isAuthenticated } = useAuth();
  const scrollDepthTracked = useRef(new Set());
  const lastScrollTime = useRef(0);
  const scrollThrottle = 500; // Throttle scroll events to every 500ms
  const initializedRef = useRef(false);

  /**
   * Initialize homepage data layer on component mount
   */
  useEffect(() => {
    // Prevent duplicate initialization across component re-renders and React StrictMode
    if (homepageInitialized) {
      return;
    }
    
    // Set page data and track view in a single merged event
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

    homepageInitialized = true;
    console.log('🏠 Homepage data layer initialized');
    
    // Reset flag when page is unloaded (for browser navigation)
    const handleBeforeUnload = () => {
      homepageInitialized = false;
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    // Cleanup function
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
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
    airlinesDataLayer.trackEvent('navigation-interaction', {
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
    airlinesDataLayer.trackEvent('auth-action', {
      action,
      ...additionalData,
      pageType: 'home'
    });
  }, []);

  /**
   * Track newsletter signup
   */
  const trackNewsletterSignup = useCallback((email) => {
    airlinesDataLayer.trackEvent('newsletter-signup', {
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