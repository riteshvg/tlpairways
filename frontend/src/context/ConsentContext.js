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

const syncWindowState = (state) => {
  if (typeof window === 'undefined') return;
  window.__tlConsentState = state;
  
  // Also sync to _adobeDataLayerState so Launch Data Elements can read it
  if (window._adobeDataLayerState) {
    window._adobeDataLayerState.consent = {
      ...state,
      categories: state.preferences
    };
  }
};

export const ConsentProvider = ({ children }) => {
  const initialState = loadStoredConsent();
  const [consentState, setConsentState] = useState(
    initialState || {
      version: CONSENT_VERSION,
      updatedAt: null,
      preferences: { ...DEFAULT_PREFERENCES },
      source: 'cmp',
      method: 'pending'
    }
  );
  const [isBannerVisible, setIsBannerVisible] = useState(!initialState);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleScriptLoading = useCallback((updatedPreferences) => {
    if (typeof window === 'undefined') {
      return;
    }

    const loader = window.__tlConsentScriptLoader;
    if (!loader) {
      console.warn('⚠️ ConsentContext: __tlConsentScriptLoader not found');
      return;
    }

    const allowed = !!(updatedPreferences.analytics || updatedPreferences.marketing);
    console.log('🔍 ConsentContext: handleScriptLoading', { allowed, preferences: updatedPreferences });

    if (allowed && typeof loader.loadAdobeLaunch === 'function') {
      console.log('✅ ConsentContext: Calling loadAdobeLaunch()');
      const result = loader.loadAdobeLaunch();
      console.log('✅ ConsentContext: loadAdobeLaunch result:', result);
    } else if (!allowed && typeof loader.disableAdobeLaunch === 'function') {
      console.log('🛑 ConsentContext: Calling disableAdobeLaunch()');
      loader.disableAdobeLaunch();
    }
  }, []);

  const sendConsentEvent = useCallback(async (state, metadata) => {
    const payload = {
      event: 'consentPreferencesUpdated',
      consent: {
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
    (preferences, metadata = {}) => {
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

      setConsentState(nextState);
      persistConsentState(nextState);
      syncWindowState(nextState);
      handleScriptLoading(normalized);
      setIsBannerVisible(false);
      setIsModalOpen(false);
      sendConsentEvent(nextState, metadata);
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
      { action: 'in', method: 'oneClick' }
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
      { action: 'out', method: 'oneClick' }
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

  useEffect(() => {
    syncWindowState(consentState);
    handleScriptLoading(consentState.preferences);
  }, [consentState, handleScriptLoading]);

  const replayConsentEvent = useCallback(() => {
    if (!initialState) {
      console.log('ℹ️ No stored consent to replay');
      return;
    }

    // Check if consent was already pushed to the array by AirlinesDataLayer
    const consentEventExists = window.adobeDataLayer?.some(
      item => item.event === 'consentPreferencesUpdated' && 
              item.consent?.updatedAt === initialState.updatedAt
    );
    
    if (consentEventExists) {
      console.log('✅ Consent event already in data layer array - skipping duplicate push');
      return;
    }

    console.log('🔄 Replaying consent to data layer (not pre-loaded)');
    // Push event to array with original action ('in' or 'out')
    sendConsentEvent(initialState, {});
  }, [initialState, sendConsentEvent]);

  useEffect(() => {
    if (initialState) {
      replayConsentEvent();
    }
  }, [initialState, replayConsentEvent]);

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

