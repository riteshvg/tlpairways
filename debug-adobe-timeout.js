/**
 * Debug script for Adobe Launch timeout issue
 * Run this in the browser console on Railway deployment
 */

console.log('🔍 ADOBE LAUNCH TIMEOUT DEBUGGER');
console.log('================================\n');

// 1. Check if consent is ready
console.log('1️⃣ CONSENT STATE:');
console.log('consent.value:', window._adobeDataLayerState?.consent?.value);
console.log('consent.defaultConsent:', window._adobeDataLayerState?.consent?.defaultConsent);
console.log('Full consent:', window._adobeDataLayerState?.consent);
console.log('');

// 2. Check data layer
console.log('2️⃣ DATA LAYER:');
console.log('adobeDataLayer length:', window.adobeDataLayer?.length);
console.log('Latest events:', window.adobeDataLayer?.slice(-3));
console.log('');

// 3. Check _satellite
console.log('3️⃣ ADOBE LAUNCH (_satellite):');
console.log('_satellite exists:', typeof window._satellite !== 'undefined');
if (window._satellite) {
  console.log('_satellite.buildInfo:', window._satellite.buildInfo);
  console.log('Data Elements:', Object.keys(window._satellite?._container?.dataElements || {}));
}
console.log('');

// 4. Test data element retrieval timing
console.log('4️⃣ TESTING DATA ELEMENT TIMING:');
if (window._satellite) {
  const testElements = [
    'consentProvided',
    'pageData.pageType',
    'pageData.pageName',
    'userContext.isLoggedIn'
  ];
  
  testElements.forEach(element => {
    const start = performance.now();
    try {
      const value = window._satellite.getVar(element);
      const duration = performance.now() - start;
      console.log(`✓ ${element}: ${value} (${duration.toFixed(2)}ms)`);
    } catch (error) {
      const duration = performance.now() - start;
      console.log(`✗ ${element}: ERROR - ${error.message} (${duration.toFixed(2)}ms)`);
    }
  });
}
console.log('');

// 5. Check for slow async operations
console.log('5️⃣ POTENTIAL SLOW OPERATIONS:');
console.log('alloy exists:', typeof window.alloy !== 'undefined');
console.log('adobe exists:', typeof window.adobe !== 'undefined');
console.log('');

// 6. Check network requests
console.log('6️⃣ CHECKING FOR PENDING NETWORK REQUESTS:');
if (performance.getEntriesByType) {
  const resources = performance.getEntriesByType('resource');
  const pending = resources.filter(r => r.responseEnd === 0);
  console.log('Pending requests:', pending.length);
  if (pending.length > 0) {
    console.log('Pending URLs:', pending.map(r => r.name));
  }
}

console.log('\n================================');
console.log('🔍 DEBUGGING COMPLETE');
