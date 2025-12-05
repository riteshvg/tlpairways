import { Html, Head, Main, NextScript } from 'next/document';

/**
 * Custom Document Component
 * 
 * This is where we initialize Adobe Data Layer BEFORE the page loads.
 * In MPA, this ensures data is ready when Adobe Launch fires - no race conditions!
 */
export default function Document() {
    return (
        <Html lang="en">
            <Head>
                {/* Adobe Target Pre-hiding Snippet */}
                <script
                    dangerouslySetInnerHTML={{
                        __html: `
              (function(e,a,n,t){
                var i=e.head;
                if(i){
                  if(a)return;
                  var o=e.createElement("style");
                  o.id="alloy-prehiding",o.innerText=n,i.appendChild(o),setTimeout(function(){o.parentNode&&o.parentNode.removeChild(o)},t)
                }
              })(document,document.location.href.indexOf("adobe_authoring_enabled")!==-1,".personalization-container { opacity: 0 !important }",3000);
            `,
                    }}
                />

                {/* CRITICAL: Initialize Adobe Data Layer & Consent BEFORE Adobe Launch */}
                <script
                    dangerouslySetInnerHTML={{
                        __html: `
              (function() {
                // Initialize data layer state object
                if (!window._adobeDataLayerState) {
                  window._adobeDataLayerState = {};
                }
                
                if (!window.adobeDataLayer) {
                  window.adobeDataLayer = [];
                  
                  // CRITICAL: Intercept push() to prevent null/invalid values
                  var originalPush = window.adobeDataLayer.push;
                  window.adobeDataLayer.push = function() {
                    for (var i = 0; i < arguments.length; i++) {
                      var item = arguments[i];
                      // Allow objects AND functions (Adobe Launch uses functions)
                      if (item === null || item === undefined) {
                        console.error('❌ BLOCKED: Attempted to push null/undefined to adobeDataLayer');
                        console.trace('Stack trace:');
                        continue;
                      }
                      if (typeof item !== 'object' && typeof item !== 'function') {
                        console.error('❌ BLOCKED: Attempted to push primitive to adobeDataLayer:', item);
                        console.trace('Stack trace:');
                        continue;
                      }
                      originalPush.call(window.adobeDataLayer, item);
                    }
                  };
                }
                
                // Load consent from localStorage SYNCHRONOUSLY
                var CONSENT_STORAGE_KEY = 'tlairways_consent_preferences';
                var consentState = null;
                var consentValue = 'pending';
                var defaultConsent = 'pending';
                
                try {
                  var stored = localStorage.getItem(CONSENT_STORAGE_KEY);
                  if (stored) {
                    consentState = JSON.parse(stored);
                    
                    if (consentState.action === 'in' || consentState.action === 'acceptAll') {
                      consentValue = 'in';
                      defaultConsent = 'in';
                    } else if (consentState.action === 'out' || consentState.action === 'rejectAll') {
                      consentValue = 'out';
                      defaultConsent = 'out';
                    } else if (consentState.preferences) {
                      var hasAnalyticsOrMarketing = consentState.preferences.analytics || consentState.preferences.marketing;
                      if (hasAnalyticsOrMarketing) {
                        consentValue = 'in';
                        defaultConsent = 'in';
                      } else {
                        consentValue = 'out';
                        defaultConsent = 'out';
                      }
                    }
                  }
                } catch (error) {
                  console.warn('⚠️ Failed to load consent from localStorage:', error);
                }
                
                // CRITICAL: Set consent IMMEDIATELY (before Adobe Launch)
                window._adobeDataLayerState.consent = {
                  value: consentValue,
                  defaultConsent: defaultConsent,
                  categories: consentState?.preferences || { necessary: true }
                };
                
                console.log('✅ MPA: Consent initialized (server-side):', {
                  value: consentValue,
                  defaultConsent: defaultConsent,
                  timestamp: new Date().toISOString()
                });
                
                // MPA ADVANTAGE: Push pageView SYNCHRONOUSLY before Adobe Launch
                // This eliminates race conditions!
                var pageType = 'unknown';
                var pageName = document.title || 'Unknown Page';
                var pathname = window.location.pathname;
                
                // Determine page type from URL
                if (pathname === '/') {
                  pageType = 'home';
                  pageName = 'Homepage';
                } else if (pathname.startsWith('/search')) {
                  pageType = 'search';
                  pageName = 'Flight Search';
                } else if (pathname.startsWith('/profile')) {
                  pageType = 'profile';
                  pageName = 'User Profile';
                }
                
                // Push pageView BEFORE Adobe Launch loads
                window.adobeDataLayer.push({
                  event: 'pageView',
                  pageData: {
                    pageType: pageType,
                    pageName: pageName,
                    pageURL: window.location.href,
                    referrer: document.referrer || 'direct',
                    timestamp: new Date().toISOString()
                  }
                });
                
                console.log('✅ MPA: pageView pushed SYNCHRONOUSLY (before Adobe Launch)');
              })();
            `,
                    }}
                />

                {/* Adobe Launch Script - Loads AFTER data layer is ready */}
                <script
                    dangerouslySetInnerHTML={{
                        __html: `
              (function() {
                var DEFAULT_SCRIPT_URL = 'https://assets.adobedtm.com/22bf1a13013f/ba7976888d86/launch-07179a193336-development.min.js';
                var SCRIPT_ID = 'tlairways-adobe-launch';
                
                function loadAdobeLaunch() {
                  // Check consent
                  var consent = window._adobeDataLayerState?.consent?.defaultConsent;
                  
                  if (consent === 'out') {
                    console.log('🚫 Adobe Launch not loaded - consent denied');
                    return;
                  }
                  
                  // Load Adobe Launch
                  var script = document.createElement('script');
                  script.id = SCRIPT_ID;
                  script.src = DEFAULT_SCRIPT_URL;
                  script.async = true;
                  script.crossOrigin = 'anonymous';
                  
                  script.onload = function() {
                    window.__tlAdobeLaunchLoaded = true;
                    console.log('✅ MPA: Adobe Launch loaded - data layer was ready!');
                  };
                  
                  script.onerror = function() {
                    console.error('❌ Failed to load Adobe Launch script');
                  };
                  
                  document.head.appendChild(script);
                }
                
                // Load immediately - data layer is already ready!
                loadAdobeLaunch();
              })();
            `,
                    }}
                />
            </Head>
            <body>
                <Main />
                <NextScript />
            </body>
        </Html>
    );
}
