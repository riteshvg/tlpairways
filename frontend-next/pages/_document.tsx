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
                // Standard Adobe Client Data Layer initialization
                window.adobeDataLayer = window.adobeDataLayer || [];
                
                // Load consent from localStorage
                var CONSENT_STORAGE_KEY = 'tlairways_consent_preferences';
                var consentValue = 'pending';
                
                try {
                  var stored = localStorage.getItem(CONSENT_STORAGE_KEY);
                  if (stored) {
                    var consentState = JSON.parse(stored);
                    if (consentState.action === 'in' || consentState.action === 'acceptAll') {
                      consentValue = 'in';
                    } else if (consentState.action === 'out' || consentState.action === 'rejectAll') {
                      consentValue = 'out';
                    } else if (consentState.preferences) {
                      if (consentState.preferences.analytics || consentState.preferences.marketing) {
                        consentValue = 'in';
                      } else {
                        consentValue = 'out';
                      }
                    }
                  }
                } catch (error) {
                  console.warn('⚠️ Failed to load consent:', error);
                }
                
                // Determine page type
                var pageType = 'unknown';
                var pageName = document.title || 'Unknown Page';
                var pathname = window.location.pathname;
                
                if (pathname === '/') {
                  pageType = 'home';
                  pageName = 'Homepage';
                } else if (pathname.startsWith('/search')) {
                  pageType = 'search';
                  pageName = 'Flight Search';
                } else if (pathname.startsWith('/results')) {
                  pageType = 'search';
                  pageName = 'Search Results';
                } else if (pathname.startsWith('/profile')) {
                  pageType = 'profile';
                  pageName = 'User Profile';
                }
                
                // Push initial state (standard ACDL pattern)
                adobeDataLayer.push({
                  consent: {
                    value: consentValue
                  },
                  pageData: {
                    pageType: pageType,
                    pageName: pageName,
                    pageURL: window.location.href,
                    referrer: document.referrer || 'direct'
                  }
                });
                
                // Push pageView event
                adobeDataLayer.push({
                  event: 'pageView'
                });
                
                console.log('✅ MPA: Data layer initialized with pageData before Adobe Launch');
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
