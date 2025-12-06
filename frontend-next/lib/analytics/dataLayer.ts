/**
 * Adobe Data Layer Utilities for MPA
 * 
 * Provides functions to push structured events to the Adobe Data Layer
 * following the same patterns as the SPA implementation.
 */

// Initialize data layer if it doesn't exist
if (typeof window !== 'undefined' && !window.adobeDataLayer) {
    window.adobeDataLayer = [];
}

/**
 * Push data to Adobe Data Layer
 */
export function pushToDataLayer(data: any): void {
    if (typeof window === 'undefined') return;

    if (!window.adobeDataLayer) {
        window.adobeDataLayer = [];
    }

    window.adobeDataLayer.push(data);
    console.log('📊 Adobe Data Layer Push:', data);
}

/**
 * Get session ID (create if doesn't exist)
 */
export function getSessionId(): string {
    if (typeof window === 'undefined') return '';

    const SESSION_KEY = 'tlp_session_id';
    let sessionId = sessionStorage.getItem(SESSION_KEY);

    if (!sessionId) {
        sessionId = `tlp_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
        sessionStorage.setItem(SESSION_KEY, sessionId);
    }

    return sessionId;
}

/**
 * Get previous page from session storage
 */
export function getPreviousPage(): string {
    if (typeof window === 'undefined') return 'direct';

    const PREVIOUS_PAGE_KEY = 'tlp_previous_page';
    return sessionStorage.getItem(PREVIOUS_PAGE_KEY) || 'direct';
}

/**
 * Set current page as previous page for next navigation
 */
export function setCurrentPageAsPrevious(pageName: string): void {
    if (typeof window === 'undefined') return;

    const PREVIOUS_PAGE_KEY = 'tlp_previous_page';
    sessionStorage.setItem(PREVIOUS_PAGE_KEY, pageName);
}

/**
 * Get user agent details
 */
export function getUserAgentDetails() {
    if (typeof window === 'undefined') {
        return {
            userAgent: '',
            screenResolution: '',
            viewportSize: ''
        };
    }

    return {
        userAgent: navigator.userAgent,
        screenResolution: `${screen.width}x${screen.height}`,
        viewportSize: `${window.innerWidth}x${window.innerHeight}`
    };
}

/**
 * Push pageView event
 */
export function pushPageView(
    pageData: {
        pageType: string;
        pageName: string;
        pageTitle?: string;
        pageDescription?: string;
        pageCategory?: string;
        bookingStep?: string;
        bookingStepNumber?: number;
        totalBookingSteps?: number;
        sections?: string[];
        searchType?: string;
        user?: any; // Auth0 user object
        [key: string]: any;
    },
    additionalData?: any
): void {
    const previousPage = getPreviousPage();
    const sessionId = getSessionId();
    const { userAgent, screenResolution, viewportSize } = getUserAgentDetails();

    // Extract user info if provided
    const isAuthenticated = !!pageData.user;
    const userId = pageData.user?.sub || null;
    const userEmail = pageData.user?.email || null;

    const userData = {
        isAuthenticated: isAuthenticated,
        userId: userId,
        userEmail: userEmail,
        userSegment: isAuthenticated ? 'registered' : 'anonymous',
        hashedUserId: null, // TODO: Add hashing if needed
        hashedEmail: null // TODO: Add hashing if needed
    };

    const event = {
        event: 'pageView',
        pageData: {
            pageType: pageData.pageType,
            pageName: pageData.pageName,
            pageURL: typeof window !== 'undefined' ? window.location.href : '',
            referrer: typeof document !== 'undefined' ? document.referrer : '',
            previousPage: previousPage,
            timestamp: new Date().toISOString(),
            userAgent,
            screenResolution,
            viewportSize,
            ...(pageData.pageTitle && { pageTitle: pageData.pageTitle }),
            ...(pageData.pageDescription && { pageDescription: pageData.pageDescription }),
            ...(pageData.pageCategory && { pageCategory: pageData.pageCategory }),
            ...(pageData.bookingStep && { bookingStep: pageData.bookingStep }),
            ...(pageData.bookingStepNumber && { bookingStepNumber: pageData.bookingStepNumber }),
            ...(pageData.totalBookingSteps && { totalBookingSteps: pageData.totalBookingSteps }),
            ...(pageData.sections && { sections: pageData.sections }),
            ...(pageData.searchType && { searchType: pageData.searchType }),
            userData: userData,
            ...additionalData // This spreads bookingContext, searchContext, etc. into pageData
        },
        viewData: {
            landingPage: previousPage === 'direct',
            userAuthenticated: isAuthenticated,
            userId: userId,
            sessionId: sessionId,
            userEmail: userEmail,
            userLoyaltyTier: null
        }
    };

    pushToDataLayer(event);
    setCurrentPageAsPrevious(pageData.pageName);
}

/**
 * Push user context updated event
 */
export function pushUserContext(userData: {
    isAuthenticated: boolean;
    userId: string | null;
    hashedUserId?: string | null;
    userSegment?: string;
    [key: string]: any;
}): void {
    pushToDataLayer({
        event: 'userContextUpdated',
        userData: {
            isAuthenticated: userData.isAuthenticated,
            userId: userData.userId,
            hashedUserId: userData.hashedUserId || null,
            userSegment: userData.userSegment || (userData.isAuthenticated ? 'registered' : 'anonymous'),
            ...userData
        }
    });
}

/**
 * Push search context event
 */
export function pushSearchContext(searchData: {
    searchId: string;
    origin: string;
    destination: string;
    departureDate: string;
    returnDate?: string;
    passengers: number;
    tripType: string;
    cabinClass: string;
    [key: string]: any;
}): void {
    pushToDataLayer({
        event: 'searchInitiated',
        searchContext: {
            searchId: searchData.searchId,
            origin: searchData.origin,
            destination: searchData.destination,
            originDestination: `${searchData.origin}-${searchData.destination}`,
            departureDate: searchData.departureDate,
            returnDate: searchData.returnDate,
            passengers: searchData.passengers,
            tripType: searchData.tripType,
            cabinClass: searchData.cabinClass,
            immediate: true,
            ...searchData
        },
        timing: {
            immediate: true,
            performanceTime: performance.now()
        }
    });
}

/**
 * Push booking context event
 */
export function pushBookingContext(bookingData: {
    bookingId: string;
    pnr: string;
    bookingStatus: string;
    bookingStep: string;
    bookingStepNumber: number;
    totalSteps: number;
    [key: string]: any;
}): void {
    pushToDataLayer({
        event: 'bookingContextUpdated',
        bookingContext: {
            bookingId: bookingData.bookingId,
            pnr: bookingData.pnr,
            bookingStatus: bookingData.bookingStatus,
            bookingStep: bookingData.bookingStep,
            bookingStepNumber: bookingData.bookingStepNumber,
            totalSteps: bookingData.totalSteps,
            bookingStartTime: new Date().toISOString(),
            ...bookingData
        }
    });
}

/**
 * Push purchase event
 */
export function pushPurchase(purchaseData: {
    transactionId: string;
    totalRevenue: number;
    currency: string;
    products: any[];
    paymentMethod: string;
    bookingReference: string;
    [key: string]: any;
}): void {
    pushToDataLayer({
        event: 'purchase',
        eventData: {
            revenue: {
                transactionId: purchaseData.transactionId,
                totalRevenue: purchaseData.totalRevenue,
                currency: purchaseData.currency,
                products: purchaseData.products,
                bookingReference: purchaseData.bookingReference,
                paymentMethod: purchaseData.paymentMethod,
                paymentStatus: 'completed',
                timestamp: new Date().toISOString(),
                ...purchaseData
            }
        },
        timestamp: new Date().toISOString()
    });
}

/**
 * Push custom event
 */
export function pushCustomEvent(eventName: string, eventData: any): void {
    pushToDataLayer({
        event: eventName,
        ...eventData,
        timestamp: new Date().toISOString()
    });
}

/**
 * Hash sensitive data (email, phone) using SHA-256
 */
export async function hashSensitiveData(data: string): Promise<string> {
    if (typeof window === 'undefined' || !window.crypto || !window.crypto.subtle) {
        return data; // Fallback if crypto API not available
    }

    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
}

/**
 * Get current data layer state
 */
export function getDataLayerState(): any[] {
    if (typeof window === 'undefined') return [];
    return window.adobeDataLayer || [];
}

/**
 * Clear data layer (for testing)
 */
export function clearDataLayer(): void {
    if (typeof window === 'undefined') return;
    window.adobeDataLayer = [];
}

// Type definitions for window
declare global {
    interface Window {
        adobeDataLayer: any[];
    }
}
