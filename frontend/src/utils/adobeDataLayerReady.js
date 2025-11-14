/**
 * Utility helpers to safely interact with window.adobeDataLayer.
 * Guards against race conditions during SPA navigations by waiting
 * for the data layer array to exist before pushing events.
 */

export const waitForAdobeDataLayer = (timeout = 5000, checkInterval = 50) => {
  return new Promise((resolve) => {
    const startTime = Date.now();

    const checkDataLayer = () => {
      if (typeof window !== 'undefined' && Array.isArray(window.adobeDataLayer)) {
        resolve(true);
        return;
      }

      if (Date.now() - startTime >= timeout) {
        if (typeof window !== 'undefined' && !window.adobeDataLayer) {
          window.adobeDataLayer = [];
        }
        resolve(false);
        return;
      }

      setTimeout(checkDataLayer, checkInterval);
    };

    checkDataLayer();
  });
};

export const pushToAdobeDataLayer = async (event, timeout = 5000) => {
  try {
    // Validate event before waiting
    if (!event || typeof event !== 'object') {
      console.warn('⚠️ Attempted to push invalid event to adobeDataLayer:', event);
      return false;
    }

    await waitForAdobeDataLayer(timeout);

    if (typeof window !== 'undefined' && Array.isArray(window.adobeDataLayer)) {
      window.adobeDataLayer.push(event);
      console.log(`✅ Data pushed to adobeDataLayer: ${event.event || 'event'}`);
      return true;
    }

    console.warn('⚠️ adobeDataLayer not available after waiting.');
    return false;
  } catch (error) {
    console.error('❌ Failed to push to adobeDataLayer:', error);
    return false;
  }
};

export default {
  waitForAdobeDataLayer,
  pushToAdobeDataLayer
};

