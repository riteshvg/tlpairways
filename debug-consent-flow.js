/**
 * TLAirways Consent Flow Debugger
 * Run this in browser console on https://tlpairways.thelearningproject.in
 * 
 * Usage: Copy and paste this entire script into the console and press Enter
 */

(function() {
  console.log('%c🔍 TLAirways Consent Flow Debugger', 'color: white; background: #00695C; font-size: 16px; font-weight: bold; padding: 10px;');
  console.log('==================================================');
  
  const results = {
    timestamp: new Date().toISOString(),
    checks: []
  };
  
  function addCheck(name, status, value, message) {
    const emoji = status === 'pass' ? '✅' : status === 'fail' ? '❌' : '⚠️';
    results.checks.push({ name, status, value, message });
    console.log(`${emoji} ${name}: ${message}`);
    if (value !== undefined) {
      console.log(`   Value:`, value);
    }
  }
  
  // ============================================
  // CHECK 1: Data Layer Initialization
  // ============================================
  console.log('\n📊 CHECK 1: Adobe Data Layer Initialization');
  console.log('--------------------------------------------------');
  
  if (typeof window.adobeDataLayer !== 'undefined' && Array.isArray(window.adobeDataLayer)) {
    addCheck(
      'Data Layer Array',
      'pass',
      `Length: ${window.adobeDataLayer.length}`,
      'adobeDataLayer array exists'
    );
  } else {
    addCheck(
      'Data Layer Array',
      'fail',
      typeof window.adobeDataLayer,
      'adobeDataLayer array NOT found'
    );
  }
  
  if (typeof window._adobeDataLayerState !== 'undefined') {
    addCheck(
      'Data Layer State',
      'pass',
      Object.keys(window._adobeDataLayerState),
      '_adobeDataLayerState object exists'
    );
  } else {
    addCheck(
      'Data Layer State',
      'fail',
      undefined,
      '_adobeDataLayerState NOT found'
    );
  }
  
  // ============================================
  // CHECK 2: Consent in Data Layer State
  // ============================================
  console.log('\n🔐 CHECK 2: Consent in _adobeDataLayerState');
  console.log('--------------------------------------------------');
  
  if (window._adobeDataLayerState?.consent) {
    const consent = window._adobeDataLayerState.consent;
    addCheck(
      'Consent Object',
      'pass',
      consent,
      'consent object exists in state'
    );
    
    if (consent.defaultConsent) {
      const validValues = ['in', 'out', 'pending'];
      const isValid = validValues.includes(consent.defaultConsent);
      addCheck(
        'defaultConsent Value',
        isValid ? 'pass' : 'fail',
        consent.defaultConsent,
        isValid ? 'Valid value' : `Invalid value (expected: ${validValues.join(', ')})`
      );
    } else {
      addCheck(
        'defaultConsent Value',
        'fail',
        undefined,
        'defaultConsent is missing or empty'
      );
    }
    
    if (consent.action) {
      addCheck(
        'consent.action',
        'pass',
        consent.action,
        'Action value present'
      );
    } else {
      addCheck(
        'consent.action',
        'warn',
        undefined,
        'action value missing (may be ok for first load)'
      );
    }
    
    if (consent.categories || consent.preferences) {
      addCheck(
        'Consent Categories',
        'pass',
        consent.categories || consent.preferences,
        'Categories/preferences present'
      );
    }
  } else {
    addCheck(
      'Consent Object',
      'fail',
      undefined,
      'consent object NOT found in _adobeDataLayerState'
    );
  }
  
  // ============================================
  // CHECK 3: Consent Event in Data Layer Array
  // ============================================
  console.log('\n📋 CHECK 3: Consent Event in adobeDataLayer Array');
  console.log('--------------------------------------------------');
  
  if (Array.isArray(window.adobeDataLayer)) {
    const consentEvents = window.adobeDataLayer.filter(
      item => item && item.event === 'consentPreferencesUpdated'
    );
    
    if (consentEvents.length > 0) {
      addCheck(
        'Consent Events',
        'pass',
        `Found ${consentEvents.length} event(s)`,
        'consentPreferencesUpdated events found'
      );
      
      consentEvents.forEach((evt, idx) => {
        console.log(`\n   Event #${idx + 1}:`, evt);
        if (evt.consent?.defaultConsent) {
          addCheck(
            `  Event #${idx + 1} defaultConsent`,
            'pass',
            evt.consent.defaultConsent,
            'defaultConsent present in event'
          );
        } else {
          addCheck(
            `  Event #${idx + 1} defaultConsent`,
            'fail',
            undefined,
            'defaultConsent MISSING in event'
          );
        }
      });
      
      // Check position
      const firstConsentIndex = window.adobeDataLayer.findIndex(
        item => item && item.event === 'consentPreferencesUpdated'
      );
      const pageViewIndex = window.adobeDataLayer.findIndex(
        item => item && item.event === 'pageView'
      );
      
      if (firstConsentIndex !== -1 && pageViewIndex !== -1) {
        if (firstConsentIndex < pageViewIndex) {
          addCheck(
            'Event Order',
            'pass',
            `consent at ${firstConsentIndex}, pageView at ${pageViewIndex}`,
            'Consent event fires BEFORE pageView (correct)'
          );
        } else {
          addCheck(
            'Event Order',
            'fail',
            `consent at ${firstConsentIndex}, pageView at ${pageViewIndex}`,
            'Consent event fires AFTER pageView (WRONG - causes race condition)'
          );
        }
      }
    } else {
      addCheck(
        'Consent Events',
        'fail',
        0,
        'NO consentPreferencesUpdated events found in array'
      );
    }
  }
  
  // ============================================
  // CHECK 4: Adobe Launch (_satellite)
  // ============================================
  console.log('\n🚀 CHECK 4: Adobe Launch (_satellite)');
  console.log('--------------------------------------------------');
  
  if (typeof _satellite !== 'undefined') {
    addCheck(
      'Adobe Launch',
      'pass',
      `Build date: ${_satellite.buildInfo?.buildDate || 'unknown'}`,
      '_satellite object loaded'
    );
    
    // Check if getVar function exists
    if (typeof _satellite.getVar === 'function') {
      addCheck(
        '_satellite.getVar()',
        'pass',
        undefined,
        'getVar function available'
      );
      
      // Try to get consentProvided data element
      try {
        const consentProvided = _satellite.getVar('consentProvided');
        addCheck(
          'Data Element: consentProvided',
          consentProvided ? 'pass' : 'warn',
          consentProvided,
          consentProvided ? 'Value retrieved' : 'Returns empty/undefined'
        );
      } catch (error) {
        addCheck(
          'Data Element: consentProvided',
          'fail',
          error.message,
          'Error retrieving data element'
        );
      }
    } else {
      addCheck(
        '_satellite.getVar()',
        'fail',
        undefined,
        'getVar function NOT available'
      );
    }
  } else {
    addCheck(
      'Adobe Launch',
      'fail',
      undefined,
      '_satellite NOT loaded (Adobe Launch failed to load)'
    );
  }
  
  // ============================================
  // CHECK 5: localStorage Consent
  // ============================================
  console.log('\n💾 CHECK 5: localStorage Consent');
  console.log('--------------------------------------------------');
  
  try {
    const stored = localStorage.getItem('tlairways_consent_preferences');
    if (stored) {
      const parsed = JSON.parse(stored);
      addCheck(
        'Stored Consent',
        'pass',
        parsed,
        'Consent stored in localStorage'
      );
    } else {
      addCheck(
        'Stored Consent',
        'warn',
        undefined,
        'No consent stored (first visit or cleared)'
      );
    }
    
    const firstVisit = localStorage.getItem('tlairways_firstVisit');
    addCheck(
      'First Visit Flag',
      firstVisit ? 'pass' : 'warn',
      firstVisit,
      firstVisit ? 'Set to: ' + firstVisit : 'Not set (may be first visit)'
    );
  } catch (error) {
    addCheck(
      'localStorage',
      'fail',
      error.message,
      'Error reading localStorage'
    );
  }
  
  // ============================================
  // CHECK 6: Adobe Web SDK (alloy)
  // ============================================
  console.log('\n🌐 CHECK 6: Adobe Web SDK (alloy)');
  console.log('--------------------------------------------------');
  
  if (typeof alloy !== 'undefined') {
    addCheck(
      'Adobe Web SDK',
      'pass',
      undefined,
      'alloy object exists'
    );
  } else if (typeof window.alloy !== 'undefined') {
    addCheck(
      'Adobe Web SDK',
      'pass',
      undefined,
      'window.alloy exists'
    );
  } else {
    addCheck(
      'Adobe Web SDK',
      'warn',
      undefined,
      'alloy NOT found (may be using different SDK name)'
    );
  }
  
  // ============================================
  // CHECK 7: Console Logs Search
  // ============================================
  console.log('\n📝 CHECK 7: Recommendations');
  console.log('--------------------------------------------------');
  
  const failures = results.checks.filter(c => c.status === 'fail');
  const warnings = results.checks.filter(c => c.status === 'warn');
  
  if (failures.length === 0 && warnings.length === 0) {
    console.log('✅ All checks passed! Consent flow looks healthy.');
  } else {
    console.log(`❌ Found ${failures.length} failure(s) and ${warnings.length} warning(s)`);
    console.log('\n🔧 Recommended Actions:');
    
    if (failures.some(f => f.name.includes('defaultConsent'))) {
      console.log('   1. Clear browser cache and reload');
      console.log('   2. Check AirlinesDataLayer.initializeConsentState() is running');
      console.log('   3. Verify _adobeDataLayerState.consent.defaultConsent is set');
    }
    
    if (failures.some(f => f.name.includes('Adobe Launch'))) {
      console.log('   1. Check CSP headers aren\'t blocking Adobe Launch script');
      console.log('   2. Verify Adobe Launch script URL is correct');
      console.log('   3. Check browser console for script loading errors');
    }
    
    if (failures.some(f => f.name.includes('Event Order'))) {
      console.log('   1. Consent event MUST fire before pageView');
      console.log('   2. Check AirlinesDataLayer.initializeConsentState() runs at startup');
      console.log('   3. Verify no other code pushes pageView before consent');
    }
  }
  
  // ============================================
  // Summary Table
  // ============================================
  console.log('\n\n📊 SUMMARY TABLE');
  console.log('==================================================');
  console.table(results.checks.map(c => ({
    Check: c.name,
    Status: c.status.toUpperCase(),
    Message: c.message
  })));
  
  // ============================================
  // Manual Test Commands
  // ============================================
  console.log('\n\n🧪 MANUAL TEST COMMANDS');
  console.log('==================================================');
  console.log('Run these commands individually to test:');
  console.log('');
  console.log('1. Check consent state:');
  console.log('   window._adobeDataLayerState.consent');
  console.log('');
  console.log('2. Check defaultConsent value:');
  console.log('   window._adobeDataLayerState.consent.defaultConsent');
  console.log('');
  console.log('3. Check consent events in array:');
  console.log('   window.adobeDataLayer.filter(e => e.event === "consentPreferencesUpdated")');
  console.log('');
  console.log('4. Check Adobe Launch data element:');
  console.log('   _satellite.getVar("consentProvided")');
  console.log('');
  console.log('5. Check all data elements:');
  console.log('   _satellite.availableEventEmitters');
  console.log('');
  console.log('6. Enable Adobe Debugger logging:');
  console.log('   _satellite.setDebug(true)');
  console.log('');
  
  console.log('\n✅ Debugging complete!');
  console.log('==================================================\n');
  
  // Return results for programmatic access
  return results;
})();

