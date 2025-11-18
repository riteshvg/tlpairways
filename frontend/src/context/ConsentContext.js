import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react';
import { pushToAdobeDataLayer } from '../utils/adobeDataLayerReady';

const CONSENT_STORAGE_KEY = 'tlairways_consent_preferences';
const CONSENT_VERSION = '2025-11-cmp';

export const CONSENT_CATEGORIES = [
  {
    id: 'necessary',
    label: 'Strictly Necessary',
    description:
      'Required for core booking experience such as authentication, seat selection, and secure checkout.',
    required: true
  },
  {
    id: 'functional',
    label: 'Functional',
    description:
      'Helps remember your preferences like preferred airports, recent searches, and traveler data.',
    required: false
  },
  {
    id: 'analytics',
    label: 'Analytics',
    description:
      'Allows us to measure page performance, detect issues, and understand which routes are most popular.',
    required: false
  },
  {
    id: 'marketing',
    label: 'Personalization & Targeting',
    description:
      'Enables Adobe Target experiences, personalized offers, and ancillary upsell recommendations.',
    required: false
  }
];

const DEFAULT_PREFERENCES = {
  necessary: true,
  functional: false,
  analytics: false,
  marketing: false
};

const ConsentContext = createContext(null);

const loadStoredConsent = () => {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const stored = localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!stored) return null;

    const parsed = JSON.parse(stored);
    if (!parsed || parsed.version !== CONSENT_VERSION) {
      return null;
    }

    return {
      ...parsed,
      preferences: {
        ...DEFAULT_PREFERENCES,
        ...(parsed.preferences || {})
      }
    };
  } catch (error) {
    console.warn('⚠️ Failed to read consent preferences:', error);
    return null;
  }
};

const persistConsentState = (state) => {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.warn('⚠️ Failed to persist consent preferences:', error);
  }
};

/**
 * Calculate consent value from state
 * @param {Object} state - Consent state object
 * @returns {Object} { consentValue, defaultConsent }
 */
const calculateConsentValue = (state) => {
  let consentValue = 'pending';
  let defaultConsent = 'pending';
  
  if (state.action === 'in' || state.action === 'acceptAll') {
    consentValue = 'in';
    defaultConsent = 'in';
  } else if (state.action === 'out' || state.action === 'rejectAll') {
    consentValue = 'out';
    defaultConsent = 'out';
  } else if (state.preferences) {
    // For granular saves: check if user has enabled analytics OR marketing
    const hasAnalyticsOrMarketing = state.preferences.analytics || state.preferences.marketing;
    
    if (hasAnalyticsOrMarketing) {
      consentValue = 'in';
      defaultConsent = 'in';
    } else {
      // User has denied both analytics and marketing
      consentValue = 'out';
      defaultConsent = 'out';
    }
  }
  
  return { consentValue, defaultConsent };
};

/**
 * Sync consent state to window objects synchronously
 * This must be called synchronously, not in useEffect
 * @param {Object} state - Consent state object
 * @param {boolean} pushToDataLayer - Whether to push to adobeDataLayer array
 */
const syncWindowState = (state, pushToDataLayer = false) => {
  if (typeof window === 'undefined') return;
  
  window.__tlConsentState = state;
  
  const { consentValue, defaultConsent } = calculateConsentValue(state);
  
  // CRITICAL: Initialize _adobeDataLayerState if it doesn't exist
  if (!window._adobeDataLayerState) {
    window._adobeDataLayerState = {};
  }
  
  // Sync to _adobeDataLayerState with both value and defaultConsent
  window._adobeDataLayerState.consent = {
    value: consentValue,           // Direct consent value
    defaultConsent: defaultConsent, // For Adobe Web SDK
    ...state,
    categories: state.preferences
  };
  
  // CRITICAL: Push to adobeDataLayer array synchronously if requested
  // This is used during initial load to ensure consent is available before any hooks fire
  if (pushToDataLayer && window.adobeDataLayer && state.action !== 'pending') {
    window.adobeDataLayer.push({
      event: 'consentPreferencesUpdated',
      consent: {
        value: consentValue,
        defaultConsent: defaultConsent,
        ...state,
        categories: state.preferences
      }
    });
  }
};

export const ConsentProvider = ({ children }) => {
  // CRITICAL: Synchronous initialization - runs before any React hooks
  // This ensures consent is available immediately when components mount
  const initialState = (() => {
    if (typeof window === 'undefined') return null;
    return loadStoredConsent();
  })();
  
  // CRITICAL: Initialize state synchronously and sync to window objects immediately
  const [consentState, setConsentState] = useState(() => {
    const state = initialState || {
      version: CONSENT_VERSION,
      updatedAt: null,
      preferences: { ...DEFAULT_PREFERENCES },
      source: 'cmp',
      method: 'pending',
      action: 'pending'
    };
    
    // CRITICAL: Sync to window objects SYNCHRONOUSLY in initializer
    // This ensures consent is available before any useEffect hooks run
    if (typeof window !== 'undefined') {
      // Initialize adobeDataLayer if it doesn't exist
      if (!window.adobeDataLayer) {
        window.adobeDataLayer = [];
      }
      
      // Sync consent state synchronously
      syncWindowState(state, true); // true = push to adobeDataLayer array
      
      console.log('✅ Consent initialized synchronously:', {
        value: calculateConsentValue(state).consentValue,
        action: state.action,
        hasStoredConsent: !!initialState
      });
    }
    
    return state;
  });
  
  const [isBannerVisible, setIsBannerVisible] = useState(!initialState);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleScriptLoading = useCallback((updatedPreferences) => {
    if (typeof window === 'undefined') {
      return;
    }

    // Note: Adobe Launch loading is now handled by the delayed loader in index.html
    // This function now only manages the disable logic for rejected consent
    
    const loader = window.__tlConsentScriptLoader;
    if (!loader) {
      console.warn('⚠️ ConsentContext: __tlConsentScriptLoader not found');
      return;
    }

    const allowed = !!(updatedPreferences.analytics || updatedPreferences.marketing);
    console.log('🔍 ConsentContext: handleScriptLoading', { allowed, preferences: updatedPreferences });

    // Only disable if user explicitly rejected consent
    if (!allowed && typeof loader.disableAdobeLaunch === 'function') {
      console.log('🛑 ConsentContext: Calling disableAdobeLaunch()');
      loader.disableAdobeLaunch();
    } else if (allowed) {
      console.log('✅ ConsentContext: Consent granted - Adobe Launch will be loaded by delayed loader');
    }
  }, []);

  const sendConsentEvent = useCallback(async (state, metadata) => {
    // Determine consent value based on action and preferences
    let consentValue = 'pending';
    let defaultConsent = 'pending';
    
    if (state.action === 'in' || state.action === 'acceptAll') {
      consentValue = 'in';
      defaultConsent = 'in';
    } else if (state.action === 'out' || state.action === 'rejectAll') {
      consentValue = 'out';
      defaultConsent = 'out';
    } else if (state.preferences) {
      // For granular saves: check if user has enabled analytics OR marketing
      const hasAnalyticsOrMarketing = state.preferences.analytics || state.preferences.marketing;
      
      if (hasAnalyticsOrMarketing) {
        consentValue = 'in';
        defaultConsent = 'in';
      } else {
        // User has denied both analytics and marketing
        consentValue = 'out';
        defaultConsent = 'out';
      }
    }
    
    const payload = {
      event: 'consentPreferencesUpdated',
      consent: {
        value: consentValue,           // Direct consent value
        defaultConsent: defaultConsent, // For Adobe Web SDK
        ...state,
        ...metadata,
        categories: state.preferences
      }
    };

    try {
      await pushToAdobeDataLayer(payload);
    } catch (error) {
      console.warn('⚠️ Failed to push consent event to Adobe Data Layer:', error);
    }
  }, []);

  const updateConsentState = useCallback(
    async (preferences, metadata = {}) => {
      const normalized = {
        ...DEFAULT_PREFERENCES,
        ...preferences,
        necessary: true
      };

      const nextState = {
        version: CONSENT_VERSION,
        updatedAt: new Date().toISOString(),
        preferences: normalized,
        source: metadata.source || 'cmp',
        method: metadata.method || 'granular',
        action: metadata.action || 'save'
      };

      // CRITICAL: Sync synchronously before state update
      // This ensures consent is available immediately when state changes
      syncWindowState(nextState, true); // Push to data layer
      
      setConsentState(nextState);
      persistConsentState(nextState);
      handleScriptLoading(normalized);
      setIsBannerVisible(false);
      setIsModalOpen(false);
      
      // Send consent event (async, but consent is already synced above)
      await sendConsentEvent(nextState, metadata);
      
      // CRITICAL: Add small delay to allow Adobe Launch to process consent
      // This prevents race condition where pageView fires before Launch processes consent
      await new Promise(resolve => setTimeout(resolve, 300));
    },
    [handleScriptLoading, sendConsentEvent]
  );

  const acceptAll = useCallback(() => {
    updateConsentState(
      {
        necessary: true,
        functional: true,
        analytics: true,
        marketing: true
      },
      { action: 'acceptAll', method: 'oneClick' }
    );
  }, [updateConsentState]);

  const rejectAll = useCallback(() => {
    updateConsentState(
      {
        necessary: true,
        functional: false,
        analytics: false,
        marketing: false
      },
      { action: 'rejectAll', method: 'oneClick' }
    );
  }, [updateConsentState]);

  const saveGranularPreferences = useCallback(
    (preferences, metadata = {}) => {
      updateConsentState(preferences, {
        ...metadata,
        action: metadata.action || 'granularSave',
        method: metadata.method || 'granular'
      });
    },
    [updateConsentState]
  );

  const openManager = useCallback(() => setIsModalOpen(true), []);
  const closeManager = useCallback(() => setIsModalOpen(false), []);
  const dismissBanner = useCallback(() => setIsBannerVisible(false), []);

  // CRITICAL: This useEffect only handles updates AFTER initial mount
  // Initial sync happens synchronously in useState initializer above
  useEffect(() => {
    // Only sync if this is an update (not initial mount)
    // Initial sync already happened in useState initializer
    if (consentState.updatedAt) {
      syncWindowState(consentState, true); // Push to data layer on updates
    }
    handleScriptLoading(consentState.preferences);
  }, [consentState, handleScriptLoading]);

  const value = useMemo(
    () => ({
      consentState,
      preferences: consentState.preferences,
      isBannerVisible,
      isModalOpen,
      acceptAll,
      rejectAll,
      saveGranularPreferences,
      openManager,
      closeManager,
      dismissBanner,
      setBannerVisible: setIsBannerVisible
    }),
    [
      consentState,
      isBannerVisible,
      isModalOpen,
      acceptAll,
      rejectAll,
      saveGranularPreferences,
      openManager,
      closeManager,
      dismissBanner
    ]
  );

  return <ConsentContext.Provider value={value}>{children}</ConsentContext.Provider>;
};

export const useConsent = () => {
  const context = useContext(ConsentContext);
  if (!context) {
    throw new Error('useConsent must be used within a ConsentProvider');
  }
  return context;
};

export const resetStoredConsent = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(CONSENT_STORAGE_KEY);
};

export default ConsentContext;

