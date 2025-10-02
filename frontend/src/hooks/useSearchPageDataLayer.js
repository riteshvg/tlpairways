/**
 * useSearchPageDataLayer - Custom hook for search page data layer
 * Handles search form page (not search results)
 */

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import pageDataLayerManager from '../services/PageDataLayerManager';

let searchPageInitialized = false;

const useSearchPageDataLayer = () => {
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (searchPageInitialized) return;

    // Initialize search page data layer
    pageDataLayerManager.initializePageDataLayer('search', user, isAuthenticated);
    
    searchPageInitialized = true;
    
    const handleBeforeUnload = () => {
      searchPageInitialized = false;
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isAuthenticated, user]);

  /**
   * Track form field interactions
   */
  const trackFieldInteraction = useCallback((fieldType, fieldValue, interactionType = 'input') => {
    pageDataLayerManager.trackSearchFieldInteraction(fieldType, fieldValue, interactionType);
  }, []);

  /**
   * Track search initiation
   */
  const trackSearchInitiated = useCallback((searchParams) => {
    pageDataLayerManager.trackFlightSearchInitiated(searchParams);
  }, []);

  return {
    trackFieldInteraction,
    trackSearchInitiated,
    debugDataLayer: pageDataLayerManager.debugDataLayer.bind(pageDataLayerManager)
  };
};

export default useSearchPageDataLayer;