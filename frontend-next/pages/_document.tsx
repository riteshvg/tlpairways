import React from 'react';
import { Html, Head, Main, NextScript, DocumentContext, DocumentInitialProps } from 'next/document';
import createEmotionServer from '@emotion/server/create-instance';
import createEmotionCache from '../utils/createEmotionCache';

/**
 * Custom Document Component
 * 
 * This is where we initialize Adobe Data Layer BEFORE the page loads.
 * In MPA, this ensures data is ready when Adobe Launch fires - no race conditions!
 * 
 * Also extracts MUI emotion styles for SSR to prevent hydration mismatches.
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
                  pageType = 'search-results';
                  pageName = 'Search Results';
                  // Add specific section data for results page
                  var pageSection = 'booking';
                  var pageSubSection = 'search';
                } else if (pathname.startsWith('/profile')) {
                  pageType = 'profile';
                  pageName = 'User Profile';
                }
                
                // Construct page data object
                var pageDataObj = {
                  pageType: pageType,
                  pageName: pageName,
                  pageURL: window.location.href,
                  referrer: document.referrer || 'direct'
                };
                
                // Add optional fields if they exist
                if (typeof pageSection !== 'undefined') {
                  pageDataObj.pageSection = pageSection;
                }
                if (typeof pageSubSection !== 'undefined') {
                  pageDataObj.pageSubSection = pageSubSection;
                }
                
                // Push initial state (standard ACDL pattern)
                adobeDataLayer.push({
                  consent: {
                    value: consentValue
                  },
                  pageData: pageDataObj
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

// Extract emotion styles on server to prevent hydration mismatches
Document.getInitialProps = async (ctx: DocumentContext): Promise<DocumentInitialProps> => {
  const originalRenderPage = ctx.renderPage;
  const cache = createEmotionCache();
  const { extractCriticalToChunks } = createEmotionServer(cache);

  ctx.renderPage = () =>
    originalRenderPage({
      enhanceApp: (App: any) =>
        function EnhanceApp(props) {
          return <App emotionCache={cache} {...props} />;
        },
    });

  const initialProps = await ctx.defaultGetInitialProps(ctx);
  const emotionStyles = extractCriticalToChunks(initialProps.html);
  const emotionStyleTags = emotionStyles.styles.map((style) => (
    <style
      data-emotion={`${style.key} ${style.ids.join(' ')}`}
      key={style.key}
      dangerouslySetInnerHTML={{ __html: style.css }}
    />
  ));

  return {
    ...initialProps,
    styles: [
      ...React.Children.toArray(initialProps.styles),
      ...emotionStyleTags,
    ],
  };
};
