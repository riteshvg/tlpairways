'use client';

import { useEffect } from 'react';

/**
 * AdobeScripts - Client component to handle Adobe Launch script loading
 * This component replicates the script loading logic from index.html
 */
export default function AdobeScripts() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Adobe Target Pre-hiding Snippet
    (function (e: any, a: any, n: string, t: number) {
      const i = e.head;
      if (i) {
        if (a) return;
        const o = e.createElement('style');
        o.id = 'alloy-prehiding';
        o.innerText = n;
        i.appendChild(o);
        setTimeout(function () {
          if (o.parentNode) {
            o.parentNode.removeChild(o);
          }
        }, t);
      }
    })(
      document,
      document.location.href.indexOf('adobe_authoring_enabled') !== -1,
      '.personalization-container { opacity: 0 !important }',
      3000
    );

    // Adobe Launch/DTM Script - Consent Managed Loading
    (function () {
      const CONSENT_STORAGE_KEY = 'tlairways_consent_preferences';
      const CUSTOM_SCRIPT_KEY = 'tlairways_adobe_script_url';
      const CUSTOM_ATTR_KEY = 'tlairways_adobe_script_attributes';
      const DEFAULT_SCRIPT_URL = 'https://assets.adobedtm.com/22bf1a13013f/ba7976888d86/launch-07179a193336-development.min.js';
      const DEFAULT_ATTRIBUTES = {
        async: true,
        crossOrigin: 'anonymous'
      };
      const SCRIPT_ID = 'tlairways-adobe-launch';

      let currentScript: HTMLScriptElement | null = null;

      function safeParseJSON(value: string | null): any {
        if (!value) return null;
        try {
          return JSON.parse(value);
        } catch (e) {
          console.warn('⚠️ Failed to parse stored JSON value:', e);
          return null;
        }
      }

      function getConsentState() {
        try {
          return safeParseJSON(localStorage.getItem(CONSENT_STORAGE_KEY));
        } catch (error) {
          console.warn('⚠️ Unable to read consent preferences:', error);
          return null;
        }
      }

      function hasAdobeConsent(state: any) {
        if (!state || !state.preferences) return false;
        const prefs = state.preferences;
        return !!(prefs.analytics || prefs.marketing);
      }

      function getScriptConfig() {
        let customUrl: string | null = null;
        let customAttrs: any = null;

        try {
          customUrl = localStorage.getItem(CUSTOM_SCRIPT_KEY);
          customAttrs = safeParseJSON(localStorage.getItem(CUSTOM_ATTR_KEY));
        } catch (error) {
          console.warn('⚠️ Unable to read Adobe script config:', error);
        }

        return {
          url: customUrl || DEFAULT_SCRIPT_URL,
          attrs: { ...DEFAULT_ATTRIBUTES, ...(customAttrs || {}) }
        };
      }

      function buildScriptElement(url: string, attrs: any): HTMLScriptElement {
        const script = document.createElement('script');
        script.id = SCRIPT_ID;
        script.src = url;
        (script as any).dataset.tlAdobeLaunch = 'true';

        if (attrs.async) script.async = true;
        if (attrs.defer) script.defer = true;
        if (attrs.crossOrigin) script.crossOrigin = attrs.crossOrigin;

        script.onload = function () {
          (window as any).__tlAdobeLaunchLoaded = true;
          console.log('✅ Adobe Launch script loaded:', url);
        };

        script.onerror = function () {
          console.error('❌ Failed to load Adobe Launch script:', url);
          if (url !== DEFAULT_SCRIPT_URL) {
            console.log('🔄 Attempting default Adobe Launch script...');
            if (script.parentNode) {
              script.parentNode.removeChild(script);
            }
            const fallbackScript = buildScriptElement(DEFAULT_SCRIPT_URL, DEFAULT_ATTRIBUTES);
            currentScript = fallbackScript;
            document.head.appendChild(fallbackScript);
          }
        };

        return script;
      }

      function injectScript() {
        if (document.getElementById(SCRIPT_ID)) {
          console.log('ℹ️ Adobe Launch already injected.');
          return { alreadyLoaded: true };
        }

        const config = getScriptConfig();
        const script = buildScriptElement(config.url, config.attrs);
        currentScript = script;
        document.head.appendChild(script);
        return { success: true };
      }

      function removeScript() {
        const existing = document.getElementById(SCRIPT_ID) || document.querySelector('script[src*="adobedtm.com"]');
        if (existing) {
          existing.parentNode?.removeChild(existing);
          currentScript = null;
          (window as any).__tlAdobeLaunchLoaded = false;
          console.log('🛑 Adobe Launch script removed pending consent.');
        }
      }

      /**
       * Get consent value from state (checks both value field and calculates from action/preferences)
       */
      function getConsentValue(consentState: any): string {
        if (!consentState) return 'pending';

        // CRITICAL: Check stored value field first (most reliable)
        if (consentState.value === 'in' || consentState.value === 'out') {
          return consentState.value;
        }

        // Fallback: Calculate from action
        if (consentState.action === 'in' || consentState.action === 'acceptAll') {
          return 'in';
        } else if (consentState.action === 'out' || consentState.action === 'rejectAll') {
          return 'out';
        } else if (consentState.preferences) {
          // For granular saves: check if user has enabled analytics OR marketing
          const hasAnalyticsOrMarketing = consentState.preferences.analytics || consentState.preferences.marketing;
          return hasAnalyticsOrMarketing ? 'in' : 'out';
        }

        return 'pending';
      }

      function init() {
        console.log('🚀 Adobe Launch consent loader initializing...');

        // CRITICAL: Check consent value - do NOT load if consent is 'out'
        const consentState = getConsentState();
        const consentValue = getConsentValue(consentState);
        const hasConsent = hasAdobeConsent(consentState);

        console.log('📊 Consent state:', {
          hasStoredConsent: !!consentState,
          consentValue: consentValue,
          hasAnalyticsConsent: hasConsent,
          willLoadLaunch: consentValue !== 'out'  // Do NOT load if consent is 'out'
        });

        // CRITICAL: Only load Adobe Launch if consent is NOT 'out'
        // If consent is 'out', do NOT load Adobe Launch at all to prevent interact calls
        if (consentValue === 'out') {
          console.log('🛑 Consent is "out" - NOT loading Adobe Launch to prevent interact calls');
          return;
        }

        // Load Adobe Launch only if consent is 'in' or 'pending'
        // For 'pending', Launch will load but defaultConsent will control tracking
        injectScript();
      }

      (window as any).__tlConsentScriptLoader = {
        loadAdobeLaunch: function (force?: boolean) {
          if (!force && document.getElementById(SCRIPT_ID)) {
            return { alreadyLoaded: true };
          }
          return injectScript();
        },
        disableAdobeLaunch: function () {
          removeScript();
        },
        getConsentState: getConsentState,
        canLoadAdobeLaunch: hasAdobeConsent
      };

      init();
    })();

    // Initialize Adobe Data Layer
    (function () {
      if (!(window as any).adobeDataLayer) {
        (window as any).adobeDataLayer = [];

        // CRITICAL: Intercept push() to prevent null/invalid values
        const originalPush = (window as any).adobeDataLayer.push;
        (window as any).adobeDataLayer.push = function (...args: any[]) {
          for (let i = 0; i < args.length; i++) {
            const item = args[i];
            if (item === null || item === undefined || typeof item !== 'object') {
              console.error('❌ BLOCKED: Attempted to push invalid item to adobeDataLayer:', item);
              console.trace('Stack trace:');
              continue;
            }
            originalPush.call((window as any).adobeDataLayer, item);
          }
        };
      }

      if (!(window as any)._adobeDataLayerState) {
        (window as any)._adobeDataLayerState = {};
      }

      // Add getState() function
      (window as any).adobeDataLayer.getState = function () {
        return (window as any)._adobeDataLayerState || {};
      };
    })();
  }, []);

  return null; // This component doesn't render anything
}

