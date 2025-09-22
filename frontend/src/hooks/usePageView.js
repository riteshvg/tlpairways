/**
 * usePageView Hook
 * Custom hook for tracking page views across the application
 */

import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import pageViewTracker from '../services/PageViewTracker';

const usePageView = (customPageConfig = {}) => {
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();
  const pageStartTime = useRef(Date.now());
  const hasTracked = useRef(false);

  useEffect(() => {
    // Reset tracking flag when location changes
    hasTracked.current = false;
    pageStartTime.current = Date.now();
  }, [location.pathname]);

  useEffect(() => {
    // Only track once per page load
    if (hasTracked.current) {
      console.log('🔄 usePageView: Page already tracked, skipping', { pathname: location.pathname });
      return;
    }
    
    console.log('🚀 usePageView: Starting page view tracking', { pathname: location.pathname });
    
    // Small delay to ensure page is fully loaded
    const timer = setTimeout(() => {
      try {
        // Extract search parameters
        const searchParams = new URLSearchParams(location.search);
        const searchParamsObj = Object.fromEntries(searchParams.entries());
        
        // Extract state from location
        const state = location.state || {};
        
        // Merge custom page config if provided
        const finalPageConfig = {
          ...customPageConfig,
          ...state
        };

        // Track page view
        console.log('📊 usePageView: Calling pageViewTracker.trackPageView', {
          pathname: location.pathname,
          userAuthenticated: isAuthenticated,
          customConfig: finalPageConfig
        });
        
        pageViewTracker.trackPageView(
          location.pathname,
          user,
          isAuthenticated,
          searchParamsObj,
          finalPageConfig
        );

        hasTracked.current = true;
        console.log('✅ usePageView: Page view tracking completed', { pathname: location.pathname });
      } catch (error) {
        console.error('Error tracking page view:', error);
        pageViewTracker.trackPageError(location.pathname, error, 'page-view-tracking');
      }
    }, 100);

    // Cleanup function
    return () => {
      clearTimeout(timer);
      
      // Track page exit - DISABLED
      // if (hasTracked.current) {
      //   const timeOnPage = Date.now() - pageStartTime.current;
      //   pageViewTracker.trackPageExit(location.pathname, timeOnPage);
      // }
    };
  }, [location.pathname, location.search, location.state, user, isAuthenticated, customPageConfig]);

  // Return page view tracking utilities
  return {
    trackPageView: () => {
      if (!hasTracked.current) {
        const searchParams = new URLSearchParams(location.search);
        const searchParamsObj = Object.fromEntries(searchParams.entries());
        const state = location.state || {};
        
        pageViewTracker.trackPageView(
          location.pathname,
          user,
          isAuthenticated,
          searchParamsObj,
          { ...customPageConfig, ...state }
        );
        hasTracked.current = true;
      }
    },
    trackPageExit: () => {
      if (hasTracked.current) {
        const timeOnPage = Date.now() - pageStartTime.current;
        pageViewTracker.trackPageExit(location.pathname, timeOnPage);
      }
    },
    trackPageError: (error, errorType = 'unknown') => {
      pageViewTracker.trackPageError(location.pathname, error, errorType);
    }
  };
};

export default usePageView;
