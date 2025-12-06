/**
 * Consent Management Configuration
 * Shared constants and types for consent system
 */

export const CONSENT_STORAGE_KEY = 'tlairways_consent_preferences';
export const CONSENT_VERSION = '2025-12-mpa';

export interface ConsentPreferences {
    necessary: boolean;
    functional: boolean;
    analytics: boolean;
    marketing: boolean;
}

export interface ConsentState {
    version: string;
    updatedAt: string | null;
    preferences: ConsentPreferences;
    source: 'cmp' | 'default';
    method: 'oneClick' | 'granular' | 'pending';
    action: 'acceptAll' | 'rejectAll' | 'granularSave' | 'pending' | 'in' | 'out';
    value?: 'in' | 'out' | 'pending';
}

export interface ConsentCategory {
    id: keyof ConsentPreferences;
    label: string;
    description: string;
    required: boolean;
}

export const CONSENT_CATEGORIES: ConsentCategory[] = [
    {
        id: 'necessary',
        label: 'Strictly Necessary',
        description: 'Required for core booking experience such as authentication, seat selection, and secure checkout.',
        required: true
    },
    {
        id: 'functional',
        label: 'Functional',
        description: 'Helps remember your preferences like preferred airports, recent searches, and traveler data.',
        required: false
    },
    {
        id: 'analytics',
        label: 'Analytics',
        description: 'Allows us to measure page performance, detect issues, and understand which routes are most popular.',
        required: false
    },
    {
        id: 'marketing',
        label: 'Personalization & Targeting',
        description: 'Enables Adobe Target experiences, personalized offers, and ancillary upsell recommendations.',
        required: false
    }
];

export const DEFAULT_PREFERENCES: ConsentPreferences = {
    necessary: true,
    functional: false,
    analytics: false,
    marketing: false
};

/**
 * Calculate consent value from state
 */
export function calculateConsentValue(state: ConsentState): 'in' | 'out' | 'pending' {
    // Check stored value first
    if (state.value === 'in' || state.value === 'out') {
        return state.value;
    }

    // Calculate from action
    if (state.action === 'in' || state.action === 'acceptAll') {
        return 'in';
    } else if (state.action === 'out' || state.action === 'rejectAll') {
        return 'out';
    }

    // Calculate from preferences
    if (state.preferences) {
        const hasAnalyticsOrMarketing = state.preferences.analytics || state.preferences.marketing;
        return hasAnalyticsOrMarketing ? 'in' : 'out';
    }

    return 'pending';
}

/**
 * Load consent from localStorage (client-side only)
 */
export function loadStoredConsent(): ConsentState | null {
    if (typeof window === 'undefined') {
        return null;
    }

    try {
        const stored = localStorage.getItem(CONSENT_STORAGE_KEY);
        if (!stored) return null;

        const parsed = JSON.parse(stored) as ConsentState;
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
}

/**
 * Persist consent to localStorage (client-side only)
 */
export function persistConsentState(state: ConsentState): void {
    if (typeof window === 'undefined') {
        return;
    }

    try {
        localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
        console.warn('⚠️ Failed to persist consent preferences:', error);
    }
}

/**
 * Reset stored consent (for testing)
 */
export function resetStoredConsent(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(CONSENT_STORAGE_KEY);
}
