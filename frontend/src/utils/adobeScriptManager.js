/**
 * Adobe Launch Script Manager
 * 
 * Handles dynamic loading and management of Adobe Launch/DTM scripts
 * Allows users to switch between different environments (dev, staging, prod)
 */

const STORAGE_KEY = 'tlairways_adobe_script_url';

// Default Adobe script URLs for different environments
export const ADOBE_SCRIPT_PRESETS = {
  development: 'https://assets.adobedtm.com/01296dd00565/26201e3c8f15/launch-2f8b80d50cb3-development.min.js',
  staging: 'https://assets.adobedtm.com/01296dd00565/26201e3c8f15/launch-staging.min.js',
  production: 'https://assets.adobedtm.com/01296dd00565/26201e3c8f15/launch-production.min.js',
};

/**
 * Get the currently configured Adobe script URL
 * @returns {string} The current script URL
 */
export const getCurrentAdobeScriptUrl = () => {
  try {
    const storedUrl = localStorage.getItem(STORAGE_KEY);
    return storedUrl || ADOBE_SCRIPT_PRESETS.development;
  } catch (error) {
    console.error('Error reading Adobe script URL from localStorage:', error);
    return ADOBE_SCRIPT_PRESETS.development;
  }
};

/**
 * Save a new Adobe script URL to localStorage
 * @param {string} url - The new script URL to save
 * @returns {boolean} Success status
 */
export const saveAdobeScriptUrl = (url) => {
  try {
    if (!url || !url.trim()) {
      throw new Error('Script URL cannot be empty');
    }

    // Validate URL format
    if (!url.startsWith('https://assets.adobedtm.com/') && !url.startsWith('https://')) {
      throw new Error('Invalid Adobe DTM script URL format');
    }

    localStorage.setItem(STORAGE_KEY, url.trim());
    console.log('✅ Adobe script URL saved:', url);
    return true;
  } catch (error) {
    console.error('❌ Error saving Adobe script URL:', error);
    return false;
  }
};

/**
 * Reset to default Adobe script
 */
export const resetToDefaultAdobeScript = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    console.log('🔄 Reset to default Adobe script');
    return true;
  } catch (error) {
    console.error('Error resetting Adobe script:', error);
    return false;
  }
};

/**
 * Check if a custom script is currently set
 * @returns {boolean} True if custom script is set
 */
export const hasCustomAdobeScript = () => {
  return localStorage.getItem(STORAGE_KEY) !== null;
};

/**
 * Load Adobe Launch script dynamically
 * @param {string} scriptUrl - The script URL to load
 * @returns {Promise} Promise that resolves when script is loaded
 */
export const loadAdobeScript = (scriptUrl) => {
  return new Promise((resolve, reject) => {
    // Check if script already exists
    const existingScript = document.querySelector(`script[src*="adobedtm.com"]`);
    if (existingScript) {
      console.warn('Adobe script already loaded. Please reload the page for changes to take effect.');
      resolve({ alreadyLoaded: true });
      return;
    }

    const script = document.createElement('script');
    script.src = scriptUrl;
    script.async = true;
    script.crossOrigin = 'anonymous';
    
    script.onload = () => {
      console.log('✅ Adobe Launch script loaded successfully:', scriptUrl);
      resolve({ success: true, url: scriptUrl });
    };
    
    script.onerror = () => {
      console.error('❌ Failed to load Adobe Launch script:', scriptUrl);
      reject(new Error(`Failed to load script: ${scriptUrl}`));
    };

    document.head.appendChild(script);
  });
};

/**
 * Remove Adobe Launch script from page
 * Note: This requires a page reload to take full effect
 */
export const removeAdobeScript = () => {
  const scripts = document.querySelectorAll('script[src*="adobedtm.com"]');
  scripts.forEach(script => script.remove());
  console.log('🗑️ Adobe scripts removed. Reload page for clean state.');
};

/**
 * Get current Adobe Launch environment based on script URL
 * @param {string} url - Script URL
 * @returns {string} Environment name
 */
export const detectAdobeEnvironment = (url) => {
  if (url.includes('development')) return 'development';
  if (url.includes('staging')) return 'staging';
  if (url.includes('production')) return 'production';
  return 'custom';
};

/**
 * Validate Adobe script URL format
 * @param {string} url - URL to validate
 * @returns {object} Validation result with isValid and error message
 */
export const validateAdobeScriptUrl = (url) => {
  if (!url || !url.trim()) {
    return { isValid: false, error: 'URL cannot be empty' };
  }

  const trimmedUrl = url.trim();

  // Check if it's HTTPS
  if (!trimmedUrl.startsWith('https://')) {
    return { isValid: false, error: 'URL must use HTTPS protocol' };
  }

  // Check if it's from Adobe DTM domain
  if (!trimmedUrl.includes('adobedtm.com')) {
    return { isValid: false, error: 'URL must be from assets.adobedtm.com domain' };
  }

  // Check if it's a .js file
  if (!trimmedUrl.endsWith('.js')) {
    return { isValid: false, error: 'URL must point to a .js file' };
  }

  return { isValid: true, error: null };
};

export default {
  getCurrentAdobeScriptUrl,
  saveAdobeScriptUrl,
  resetToDefaultAdobeScript,
  hasCustomAdobeScript,
  loadAdobeScript,
  removeAdobeScript,
  detectAdobeEnvironment,
  validateAdobeScriptUrl,
  ADOBE_SCRIPT_PRESETS,
};

