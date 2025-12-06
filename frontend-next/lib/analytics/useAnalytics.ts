'use client';

import { useEffect, useCallback } from 'react';
import {
    pushPageView,
    pushUserContext,
    pushSearchContext,
    pushBookingContext,
    pushPurchase,
    pushCustomEvent,
    getSessionId
} from './dataLayer';

/**
 * Hook to track page views automatically
 */
export function usePageView(
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
        [key: string]: any;
    },
    additionalData?: any
) {
    useEffect(() => {
        pushPageView(pageData, additionalData);
    }, [pageData.pageType, pageData.pageName]); // Only re-run if page type or name changes
}

/**
 * Hook to get analytics utilities
 */
export function useAnalytics() {
    const trackPageView = useCallback((pageData: Parameters<typeof pushPageView>[0], additionalData?: any) => {
        pushPageView(pageData, additionalData);
    }, []);

    const trackUserContext = useCallback((userData: Parameters<typeof pushUserContext>[0]) => {
        pushUserContext(userData);
    }, []);

    const trackSearch = useCallback((searchData: Parameters<typeof pushSearchContext>[0]) => {
        pushSearchContext(searchData);
    }, []);

    const trackBooking = useCallback((bookingData: Parameters<typeof pushBookingContext>[0]) => {
        pushBookingContext(bookingData);
    }, []);

    const trackPurchase = useCallback((purchaseData: Parameters<typeof pushPurchase>[0]) => {
        pushPurchase(purchaseData);
    }, []);

    const trackCustomEvent = useCallback((eventName: string, eventData: any) => {
        pushCustomEvent(eventName, eventData);
    }, []);

    const sessionId = getSessionId();

    return {
        trackPageView,
        trackUserContext,
        trackSearch,
        trackBooking,
        trackPurchase,
        trackCustomEvent,
        sessionId
    };
}
