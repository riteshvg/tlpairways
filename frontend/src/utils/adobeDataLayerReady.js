/**
 * Adobe Data Layer Readiness Utility
 * 
 * Ensures adobeDataLayer is fully initialized before pushing events.
 * This prevents race conditions where React components mount before Adobe Launch script finishes loading.
 */

/**
 * Wait for adobeDataLayer to be ready
 * @param {number} timeout - Maximum wait time in milliseconds (default: 5000ms)
 * @param {number} checkInterval - Check interval in milliseconds (default: 50ms)
 * @returns {Promise<boolean>} - Resolves to true when ready, false on timeout
 */
export const waitForAdobeDataLayer = (timeout = 5000, checkInterval = 50) => {
  return new Promise((resolve) => {
    const startTime = Date.now();
    
    const checkDataLayer = () => {
      // Check if adobeDataLayer exists and is properly initialized
      if (typeof window !== 'undefined' && 
          window.adobeDataLayer && 
          Array.isArray(window.adobeDataLayer)) {
        console.log('✅ adobeDataLayer is ready');
        resolve(true);
        return;
      }
      
      // Check timeout
      if (Date.now() - startTime >= timeout) {
        console.warn('⚠️ adobeDataLayer initialization timeout - proceeding anyway');
        // Initialize array if it doesn't exist
        if (typeof window !== 'undefined' && !window.adobeDataLayer) {
          window.adobeDataLayer = [];
        }
        resolve(false);
        return;
      }
      
      // Check again after interval
      setTimeout(checkDataLayer, checkInterval);
    };
    
    checkDataLayer();
  });
};

/**
 * Push data to adobeDataLayer with readiness check
 * @param {Object} data - Data to push to data layer
 * @param {number} timeout - Maximum wait time for data layer (default: 5000ms)
 * @returns {Promise<boolean>} - Resolves to true if push succeeded, false otherwise
 */
export const pushToAdobeDataLayer = async (data, timeout = 5000) => {
  try {
    // Wait for data layer to be ready
    await waitForAdobeDataLayer(timeout);
    
    // Push data
    if (typeof window !== 'undefined' && window.adobeDataLayer) {
      window.adobeDataLayer.push(data);
      console.log('✅ Data pushed to adobeDataLayer:', data.event || 'event');
      return true;
    }
    
    console.warn('⚠️ window.adobeDataLayer not available after waiting');
    return false;
  } catch (error) {
    console.error('❌ Error pushing to adobeDataLayer:', error);
    return false;
  }
};

/**
 * Check if adobeDataLayer is currently ready (synchronous check)
 * @returns {boolean} - True if ready, false otherwise
 */
export const isAdobeDataLayerReady = () => {
  return typeof window !== 'undefined' && 
         window.adobeDataLayer && 
         Array.isArray(window.adobeDataLayer);
};

export default {
  waitForAdobeDataLayer,
  pushToAdobeDataLayer,
  isAdobeDataLayerReady
};

