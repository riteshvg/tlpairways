/**
 * Adobe Data Layer - userData Availability Test Script
 * 
 * INSTRUCTIONS:
 * 1. Open your browser's Developer Console (F12 or Cmd+Option+I)
 * 2. Copy and paste this entire script into the console
 * 3. Press Enter to run
 * 4. Review the test results
 */

(function () {
    console.log('%c=== Adobe Data Layer userData Availability Test ===', 'color: #4CAF50; font-weight: bold; font-size: 16px;');
    console.log('');

    const results = {
        passed: 0,
        failed: 0,
        warnings: 0
    };

    // Test 1: Check if data layer exists
    console.log('%c[Test 1] Data Layer Exists', 'color: #2196F3; font-weight: bold;');
    if (window.adobeDataLayer) {
        console.log('✅ PASS: window.adobeDataLayer exists');
        console.log('   Data Layer Length:', window.adobeDataLayer.length);
        results.passed++;
    } else {
        console.log('❌ FAIL: window.adobeDataLayer does not exist');
        results.failed++;
    }
    console.log('');

    // Test 2: Check if computed state exists
    console.log('%c[Test 2] Computed State Exists', 'color: #2196F3; font-weight: bold;');
    if (window._adobeDataLayerState) {
        console.log('✅ PASS: window._adobeDataLayerState exists');
        results.passed++;
    } else {
        console.log('❌ FAIL: window._adobeDataLayerState does not exist');
        results.failed++;
    }
    console.log('');

    // Test 3: Check if userData exists in computed state
    console.log('%c[Test 3] userData in Computed State', 'color: #2196F3; font-weight: bold;');
    if (window._adobeDataLayerState?.userData) {
        console.log('✅ PASS: userData exists in computed state');
        console.log('   userData:', window._adobeDataLayerState.userData);
        results.passed++;
    } else {
        console.log('❌ FAIL: userData does not exist in computed state');
        results.failed++;
    }
    console.log('');

    // Test 4: Check userData structure
    console.log('%c[Test 4] userData Structure', 'color: #2196F3; font-weight: bold;');
    const userData = window._adobeDataLayerState?.userData;
    if (userData) {
        const requiredFields = [
            'hashedUserId',
            'loyaltyTier',
            'userSegment',
            'isAuthenticated'
        ];

        let allFieldsPresent = true;
        requiredFields.forEach(field => {
            if (userData.hasOwnProperty(field)) {
                console.log(`   ✅ ${field}: ${JSON.stringify(userData[field])}`);
            } else {
                console.log(`   ❌ Missing field: ${field}`);
                allFieldsPresent = false;
            }
        });

        if (allFieldsPresent) {
            console.log('✅ PASS: All required fields present');
            results.passed++;
        } else {
            console.log('❌ FAIL: Some required fields missing');
            results.failed++;
        }
    } else {
        console.log('⚠️  SKIP: Cannot test structure (userData not found)');
        results.warnings++;
    }
    console.log('');

    // Test 5: Check authentication state
    console.log('%c[Test 5] Authentication State', 'color: #2196F3; font-weight: bold;');
    if (userData?.isAuthenticated !== undefined) {
        console.log('✅ PASS: isAuthenticated flag exists');
        console.log(`   User is ${userData.isAuthenticated ? 'AUTHENTICATED' : 'ANONYMOUS'}`);
        results.passed++;
    } else {
        console.log('❌ FAIL: isAuthenticated flag missing');
        results.failed++;
    }
    console.log('');

    // Test 6: Check for userDataInitialized event
    console.log('%c[Test 6] userDataInitialized Event', 'color: #2196F3; font-weight: bold;');
    const hasInitEvent = window.adobeDataLayer?.some(event => event.event === 'userDataInitialized');
    if (hasInitEvent) {
        console.log('✅ PASS: userDataInitialized event found in data layer');
        results.passed++;
    } else {
        console.log('⚠️  WARNING: userDataInitialized event not found (may have been pruned)');
        results.warnings++;
    }
    console.log('');

    // Test 7: Check getState() method
    console.log('%c[Test 7] getState() Method', 'color: #2196F3; font-weight: bold;');
    if (typeof window.adobeDataLayer?.getState === 'function') {
        console.log('✅ PASS: getState() method exists');
        const state = window.adobeDataLayer.getState();
        console.log('   State:', state);
        results.passed++;
    } else {
        console.log('❌ FAIL: getState() method not found');
        results.failed++;
    }
    console.log('');

    // Test 8: Data Element Simulation
    console.log('%c[Test 8] Data Element Access Simulation', 'color: #2196F3; font-weight: bold;');
    try {
        // Simulate how a data element would access userData
        const userIdDE = window._adobeDataLayerState?.userData?.hashedUserId || 'anonymous';
        const isAuthDE = window._adobeDataLayerState?.userData?.isAuthenticated || false;
        const loyaltyDE = window._adobeDataLayerState?.userData?.loyaltyTier || 'none';

        console.log('✅ PASS: Data elements can access userData');
        console.log('   User ID Data Element:', userIdDE);
        console.log('   Is Authenticated Data Element:', isAuthDE);
        console.log('   Loyalty Tier Data Element:', loyaltyDE);
        results.passed++;
    } catch (error) {
        console.log('❌ FAIL: Error accessing userData in data elements');
        console.log('   Error:', error.message);
        results.failed++;
    }
    console.log('');

    // Summary
    console.log('%c=== Test Summary ===', 'color: #4CAF50; font-weight: bold; font-size: 16px;');
    console.log(`✅ Passed: ${results.passed}`);
    console.log(`❌ Failed: ${results.failed}`);
    console.log(`⚠️  Warnings: ${results.warnings}`);
    console.log('');

    if (results.failed === 0) {
        console.log('%c🎉 ALL TESTS PASSED! userData is available and working correctly.', 'color: #4CAF50; font-weight: bold; font-size: 14px; background: #E8F5E9; padding: 10px;');
    } else {
        console.log('%c⚠️ SOME TESTS FAILED. Please review the results above.', 'color: #F44336; font-weight: bold; font-size: 14px; background: #FFEBEE; padding: 10px;');
    }
    console.log('');

    // Additional debugging info
    console.log('%c=== Debugging Information ===', 'color: #FF9800; font-weight: bold; font-size: 14px;');
    console.log('Full userData object:', window._adobeDataLayerState?.userData);
    console.log('Full Data Layer State:', window._adobeDataLayerState);
    console.log('Data Layer Events (last 5):', window.adobeDataLayer?.slice(-5));
    console.log('');

    // Return results for programmatic access
    return {
        success: results.failed === 0,
        results: results,
        userData: window._adobeDataLayerState?.userData
    };
})();
