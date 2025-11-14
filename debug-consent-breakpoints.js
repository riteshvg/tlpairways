/**
 * TLAirways Consent Flow Debugger with Breakpoints
 * 
 * This script sets up automatic breakpoints at key consent evaluation points
 * 
 * Usage:
 * 1. Open https://tlpairways.thelearningproject.in
 * 2. Open DevTools (F12) → Sources tab
 * 3. Paste this script in Console and press Enter
 * 4. Reload the page
 * 5. Execution will pause at key breakpoints
 */

(function() {
  console.log('%c🔍 Setting up Consent Flow Breakpoints', 'color: white; background: #FF6B6B; font-size: 16px; font-weight: bold; padding: 10px;');
  
  // ============================================
  // BREAKPOINT 1: Data Layer Consent Initialization
  // ============================================
  
  console.log('\n📍 BREAKPOINT 1: Monitoring _adobeDataLayerState.consent');
  
  let consentWatcher = null;
  let originalConsent = window._adobeDataLayerState?.consent;
  
  function setupConsentWatcher() {
    if (typeof window._adobeDataLayerState === 'undefined') {
      console.log('⏳ Waiting for _adobeDataLayerState to be created...');
      setTimeout(setupConsentWatcher, 50);
      return;
    }
    
    // Watch for consent property changes
    Object.defineProperty(window._adobeDataLayerState, 'consent', {
      get() {
        return this._consentValue;
      },
      set(value) {
        console.log('%c🛑 BREAKPOINT: consent is being SET in _adobeDataLayerState', 'color: red; font-weight: bold; font-size: 14px;');
        console.log('📊 New consent value:', value);
        console.log('📊 Stack trace:');
        console.trace();
        
        // Pause execution for inspection
        debugger; // BREAKPOINT: Consent being set
        
        this._consentValue = value;
      },
      configurable: true,
      enumerable: true
    });
    
    // Initialize with existing value if any
    if (originalConsent) {
      window._adobeDataLayerState._consentValue = originalConsent;
    }
    
    console.log('✅ Consent watcher installed');
  }
  
  setupConsentWatcher();
  
  // ============================================
  // BREAKPOINT 2: Adobe Launch Script Injection
  // ============================================
  
  console.log('\n📍 BREAKPOINT 2: Monitoring Adobe Launch script injection');
  
  // Override document.createElement to catch script creation
  const originalCreateElement = document.createElement;
  document.createElement = function(tagName) {
    const element = originalCreateElement.call(document, tagName);
    
    if (tagName.toLowerCase() === 'script') {
      // Proxy the src setter to detect Adobe Launch
      let originalSrc = '';
      Object.defineProperty(element, 'src', {
        get() {
          return originalSrc;
        },
        set(value) {
          if (value && value.includes('adobedtm.com')) {
            console.log('%c🛑 BREAKPOINT: Adobe Launch script is being created', 'color: red; font-weight: bold; font-size: 14px;');
            console.log('📜 Script URL:', value);
            console.log('📊 Current consent state:', window._adobeDataLayerState?.consent);
            console.log('📊 Stack trace:');
            console.trace();
            
            // Pause execution for inspection
            debugger; // BREAKPOINT: Adobe Launch script creation
          }
          originalSrc = value;
        },
        configurable: true
      });
    }
    
    return element;
  };
  
  console.log('✅ Script creation monitor installed');
  
  // ============================================
  // BREAKPOINT 3: Adobe Launch Script Append
  // ============================================
  
  console.log('\n📍 BREAKPOINT 3: Monitoring script append to DOM');
  
  const originalAppendChild = document.head.appendChild;
  document.head.appendChild = function(element) {
    if (element.tagName === 'SCRIPT' && element.src && element.src.includes('adobedtm.com')) {
      console.log('%c🛑 BREAKPOINT: Adobe Launch script is being appended to DOM', 'color: red; font-weight: bold; font-size: 14px;');
      console.log('📜 Script element:', element);
      console.log('📊 Script src:', element.src);
      console.log('📊 Current consent state:', window._adobeDataLayerState?.consent);
      console.log('📊 defaultConsent value:', window._adobeDataLayerState?.consent?.defaultConsent);
      console.log('📊 Stack trace:');
      console.trace();
      
      // Pause execution for inspection
      debugger; // BREAKPOINT: Adobe Launch script append
    }
    
    return originalAppendChild.call(this, element);
  };
  
  console.log('✅ Script append monitor installed');
  
  // ============================================
  // BREAKPOINT 4: waitForDefaultConsent Resolution
  // ============================================
  
  console.log('\n📍 BREAKPOINT 4: Monitoring waitForDefaultConsent resolution');
  
  // Intercept Promise resolution by watching for the console log
  const originalLog = console.log;
  console.log = function(...args) {
    const message = args[0];
    
    if (typeof message === 'string') {
      if (message.includes('defaultConsent ready:')) {
        console.log('%c🛑 BREAKPOINT: defaultConsent is ready', 'color: red; font-weight: bold; font-size: 14px;');
        console.log('📊 Full consent state:', window._adobeDataLayerState?.consent);
        console.log('📊 Data layer array:', window.adobeDataLayer);
        console.log('📊 Stack trace:');
        console.trace();
        
        // Pause execution for inspection
        debugger; // BREAKPOINT: defaultConsent ready
      }
      
      if (message.includes('Loading Adobe Launch with defaultConsent:')) {
        console.log('%c🛑 BREAKPOINT: About to load Adobe Launch', 'color: red; font-weight: bold; font-size: 14px;');
        console.log('📊 Consent state at load time:', window._adobeDataLayerState?.consent);
        console.log('📊 Stack trace:');
        console.trace();
        
        // Pause execution for inspection
        debugger; // BREAKPOINT: Loading Adobe Launch
      }
    }
    
    return originalLog.apply(console, args);
  };
  
  console.log('✅ Console monitor installed');
  
  // ============================================
  // BREAKPOINT 5: ConsentPreferencesUpdated Event
  // ============================================
  
  console.log('\n📍 BREAKPOINT 5: Monitoring consentPreferencesUpdated events');
  
  // Override adobeDataLayer.push
  function setupDataLayerPushMonitor() {
    if (typeof window.adobeDataLayer === 'undefined') {
      console.log('⏳ Waiting for adobeDataLayer to be created...');
      setTimeout(setupDataLayerPushMonitor, 50);
      return;
    }
    
    const originalPush = window.adobeDataLayer.push;
    window.adobeDataLayer.push = function(event) {
      if (event && event.event === 'consentPreferencesUpdated') {
        console.log('%c🛑 BREAKPOINT: consentPreferencesUpdated event is being pushed', 'color: red; font-weight: bold; font-size: 14px;');
        console.log('📊 Event data:', event);
        console.log('📊 Current array length:', window.adobeDataLayer.length);
        console.log('📊 Stack trace:');
        console.trace();
        
        // Pause execution for inspection
        debugger; // BREAKPOINT: consentPreferencesUpdated event
      }
      
      return originalPush.call(this, event);
    };
    
    console.log('✅ Data layer push monitor installed');
  }
  
  setupDataLayerPushMonitor();
  
  // ============================================
  // BREAKPOINT 6: _satellite initialization
  // ============================================
  
  console.log('\n📍 BREAKPOINT 6: Monitoring _satellite object creation');
  
  Object.defineProperty(window, '_satellite', {
    get() {
      return this._satelliteValue;
    },
    set(value) {
      if (value && !this._satelliteValue) {
        console.log('%c🛑 BREAKPOINT: _satellite object is being created', 'color: red; font-weight: bold; font-size: 14px;');
        console.log('📊 _satellite object:', value);
        console.log('📊 Consent state at _satellite creation:', window._adobeDataLayerState?.consent);
        console.log('📊 Stack trace:');
        console.trace();
        
        // Pause execution for inspection
        debugger; // BREAKPOINT: _satellite creation
      }
      this._satelliteValue = value;
    },
    configurable: true
  });
  
  console.log('✅ _satellite monitor installed');
  
  // ============================================
  // Summary
  // ============================================
  
  console.log('\n\n✅ All breakpoints installed!');
  console.log('==================================================');
  console.log('Reload the page to start debugging.');
  console.log('\nBreakpoints set at:');
  console.log('  1. ⏸️  When consent is set in _adobeDataLayerState');
  console.log('  2. ⏸️  When Adobe Launch script element is created');
  console.log('  3. ⏸️  When Adobe Launch script is appended to DOM');
  console.log('  4. ⏸️  When defaultConsent becomes ready');
  console.log('  5. ⏸️  When consentPreferencesUpdated event is pushed');
  console.log('  6. ⏸️  When _satellite object is created');
  console.log('\n💡 At each breakpoint:');
  console.log('  - Press F8 or click "Resume" to continue');
  console.log('  - Inspect variables in the Scope panel');
  console.log('  - Check Call Stack to see execution flow');
  console.log('==================================================\n');
  
  // Save reference for cleanup
  window.__consentDebugger = {
    cleanup: function() {
      console.log('🧹 Cleaning up breakpoints...');
      document.createElement = originalCreateElement;
      document.head.appendChild = originalAppendChild;
      console.log = originalLog;
      console.log('✅ Breakpoints removed');
    }
  };
  
  console.log('To remove breakpoints, run: window.__consentDebugger.cleanup()');
  
})();

