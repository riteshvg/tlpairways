'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import {
    ConsentState,
    ConsentPreferences,
    CONSENT_VERSION,
    CONSENT_STORAGE_KEY,
    DEFAULT_PREFERENCES,
    calculateConsentValue,
    loadStoredConsent,
    persistConsentState
} from './consentConfig';

interface ConsentContextValue {
    consentState: ConsentState;
    preferences: ConsentPreferences;
    isBannerVisible: boolean;
    isModalOpen: boolean;
    acceptAll: () => void;
    rejectAll: () => void;
    saveGranularPreferences: (preferences: ConsentPreferences) => void;
    openManager: () => void;
    closeManager: () => void;
    dismissBanner: () => void;
}

const ConsentContext = createContext<ConsentContextValue | null>(null);

/**
 * Sync consent state to window objects
 * This makes consent available to Adobe Launch and other scripts
 */
function syncWindowState(state: ConsentState): void {
    if (typeof window === 'undefined') return;

    const consentValue = calculateConsentValue(state);

    // Set consent state for scripts to access
    (window as any).__tlConsentState = state;

    // Initialize Adobe Data Layer state if needed
    if (!(window as any)._adobeDataLayerState) {
        (window as any)._adobeDataLayerState = {};
    }

    // Sync to Adobe Data Layer state
    (window as any)._adobeDataLayerState.consent = {
        value: consentValue,
        defaultConsent: consentValue,
        ...state,
        categories: state.preferences
    };

    // Push to adobeDataLayer array if it exists and consent is not pending
    if ((window as any).adobeDataLayer && state.action !== 'pending') {
        (window as any).adobeDataLayer.push({
            event: 'consentPreferencesUpdated',
            consent: {
                value: consentValue,
                defaultConsent: consentValue,
                ...state,
                categories: state.preferences
            }
        });
    }
}

export function ConsentProvider({ children }: { children: React.ReactNode }) {
    // Initialize state synchronously
    const [consentState, setConsentState] = useState<ConsentState>(() => {
        if (typeof window === 'undefined') {
            return {
                version: CONSENT_VERSION,
                updatedAt: null,
                preferences: { ...DEFAULT_PREFERENCES },
                source: 'default',
                method: 'pending',
                action: 'pending'
            };
        }

        const stored = loadStoredConsent();
        const state = stored || {
            version: CONSENT_VERSION,
            updatedAt: null,
            preferences: { ...DEFAULT_PREFERENCES },
            source: 'cmp',
            method: 'pending',
            action: 'pending'
        };

        // Sync to window objects immediately
        syncWindowState(state);

        return state;
    });

    const [isBannerVisible, setIsBannerVisible] = useState(() => {
        if (typeof window === 'undefined') return false;
        return !loadStoredConsent();
    });

    const [isModalOpen, setIsModalOpen] = useState(false);

    // Update consent state
    const updateConsentState = useCallback((
        preferences: ConsentPreferences,
        metadata: {
            action?: string;
            method?: string;
            source?: string;
        } = {}
    ) => {
        const normalized: ConsentPreferences = {
            ...DEFAULT_PREFERENCES,
            ...preferences,
            necessary: true
        };

        const action = metadata.action || 'save';
        let consentValue: 'in' | 'out' | 'pending' = 'pending';

        if (action === 'acceptAll' || action === 'in') {
            consentValue = 'in';
        } else if (action === 'rejectAll' || action === 'out') {
            consentValue = 'out';
        } else if (normalized.analytics || normalized.marketing) {
            consentValue = 'in';
        } else {
            consentValue = 'out';
        }

        const nextState: ConsentState = {
            version: CONSENT_VERSION,
            updatedAt: new Date().toISOString(),
            preferences: normalized,
            source: (metadata.source as any) || 'cmp',
            method: (metadata.method as any) || 'granular',
            action: action as any,
            value: consentValue
        };

        // Sync synchronously before state update
        syncWindowState(nextState);

        setConsentState(nextState);
        persistConsentState(nextState);
        setIsBannerVisible(false);
        setIsModalOpen(false);

        // Reload page to ensure clean consent state
        if (typeof window !== 'undefined') {
            console.log('🔄 Reloading page to apply consent changes...');
            window.location.reload();
        }
    }, []);

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

    const saveGranularPreferences = useCallback((preferences: ConsentPreferences) => {
        updateConsentState(preferences, {
            action: 'granularSave',
            method: 'granular'
        });
    }, [updateConsentState]);

    const openManager = useCallback(() => setIsModalOpen(true), []);
    const closeManager = useCallback(() => setIsModalOpen(false), []);
    const dismissBanner = useCallback(() => setIsBannerVisible(false), []);

    // Sync to window on updates
    useEffect(() => {
        if (consentState.updatedAt) {
            syncWindowState(consentState);
        }
    }, [consentState]);

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
            dismissBanner
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
}

export function useConsent() {
    const context = useContext(ConsentContext);
    if (!context) {
        throw new Error('useConsent must be used within a ConsentProvider');
    }
    return context;
}
