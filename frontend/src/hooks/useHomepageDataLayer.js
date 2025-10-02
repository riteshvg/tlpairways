/**
 * useHomepageDataLayer - Custom hook for homepage data layer
 * Simplified implementation using PageDataLayerManager
 */

import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import pageDataLayerManager from '../services/PageDataLayerManager';

let homepageInitialized = false;

const useHomepageDataLayer = () => {
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (homepageInitialized) return;

    // Initialize home page data layer
    pageDataLayerManager.initializePageDataLayer('home', user, isAuthenticated);
    
    homepageInitialized = true;
    
    const handleBeforeUnload = () => {
      homepageInitialized = false;
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isAuthenticated, user]);

  return {
    // Expose data layer manager methods
    debugDataLayer: pageDataLayerManager.debugDataLayer.bind(pageDataLayerManager)
  };
};

export default useHomepageDataLayer;