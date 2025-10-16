/**
 * Adobe Launch Script Manager
 * 
 * Handles dynamic loading and management of Adobe Launch/DTM scripts
 * Allows users to switch between different environments (dev, staging, prod)
 */

const STORAGE_KEY = 'tlairways_adobe_script_url';
const STORAGE_KEY_ATTRIBUTES = 'tlairways_adobe_script_attributes';

// Default Adobe script URLs for different environments
export const ADOBE_SCRIPT_PRESETS = {
  development: 'https://assets.adobedtm.com/01296dd00565/26201e3c8f15/launch-2f8b80d50cb3-development.min.js',
  staging: 'https://assets.adobedtm.com/01296dd00565/26201e3c8f15/launch-staging.min.js',
  production: 'https://assets.adobedtm.com/01296dd00565/26201e3c8f15/launch-production.min.js',
};

// Default attributes (async and crossorigin)
const DEFAULT_ATTRIBUTES = {
  async: true,
  crossOrigin: 'anonymous'
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
 * Get the currently configured Adobe script attributes
 * @returns {object} The current script attributes
 */
export const getCurrentAdobeScriptAttributes = () => {
  try {
    const storedAttrs = localStorage.getItem(STORAGE_KEY_ATTRIBUTES);
    return storedAttrs ? JSON.parse(storedAttrs) : DEFAULT_ATTRIBUTES;
  } catch (error) {
    console.error('Error reading Adobe script attributes from localStorage:', error);
    return DEFAULT_ATTRIBUTES;
  }
};

/**
 * Save a new Adobe script (URL or full script tag) to localStorage
 * @param {string} input - The script tag or URL to save
 * @returns {boolean} Success status
 */
export const saveAdobeScriptUrl = (input) => {
  try {
    if (!input || !input.trim()) {
      throw new Error('Script input cannot be empty');
    }

    // Parse the input to get URL and attributes
    const { src, attributes } = parseScriptInput(input);

    if (!src) {
      throw new Error('Could not extract URL from input');
    }

    // Validate URL format
    if (!src.startsWith('https://')) {
      throw new Error('Invalid Adobe DTM script URL format');
    }

    // Save URL and attributes separately
    localStorage.setItem(STORAGE_KEY, src);
    localStorage.setItem(STORAGE_KEY_ATTRIBUTES, JSON.stringify(attributes));
    
    console.log('✅ Adobe script saved:', src);
    console.log('✅ Script attributes:', attributes);
    return true;
  } catch (error) {
    console.error('❌ Error saving Adobe script:', error);
    return false;
  }
};

/**
 * Reset to default Adobe script
 */
export const resetToDefaultAdobeScript = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(STORAGE_KEY_ATTRIBUTES);
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
 * Parse script tag or URL to extract src and attributes
 * @param {string} input - Script tag or URL
 * @returns {object} Parsed result with src and attributes
 */
export const parseScriptInput = (input) => {
  if (!input || !input.trim()) {
    return { src: '', attributes: {} };
  }

  const trimmed = input.trim();
  
  // Check if input is a full script tag
  if (trimmed.startsWith('<script') && trimmed.includes('src=')) {
    try {
      // Extract src attribute
      const srcMatch = trimmed.match(/src=["']([^"']+)["']/);
      const src = srcMatch ? srcMatch[1] : '';
      
      // Extract other attributes
      const attributes = {};
      
      // Check for async
      if (trimmed.includes('async')) {
        attributes.async = true;
      }
      
      // Check for defer
      if (trimmed.includes('defer')) {
        attributes.defer = true;
      }
      
      // Check for crossorigin
      const crossoriginMatch = trimmed.match(/crossorigin=["']([^"']+)["']/);
      if (crossoriginMatch) {
        attributes.crossOrigin = crossoriginMatch[1];
      } else if (trimmed.includes('crossorigin')) {
        attributes.crossOrigin = 'anonymous';
      }
      
      return { src, attributes };
    } catch (error) {
      console.error('Error parsing script tag:', error);
      return { src: '', attributes: {} };
    }
  }
  
  // If it's just a URL, default to async
  return { 
    src: trimmed, 
    attributes: { async: true, crossOrigin: 'anonymous' } 
  };
};

/**
 * Validate Adobe script URL format
 * @param {string} input - Script tag or URL to validate
 * @returns {object} Validation result with isValid and error message
 */
export const validateAdobeScriptUrl = (input) => {
  if (!input || !input.trim()) {
    return { isValid: false, error: 'URL cannot be empty' };
  }

  // Parse input to get URL
  const { src } = parseScriptInput(input);
  
  if (!src) {
    return { isValid: false, error: 'Could not extract URL from input' };
  }

  // Check if it's HTTPS
  if (!src.startsWith('https://')) {
    return { isValid: false, error: 'URL must use HTTPS protocol' };
  }

  // Check if it's from Adobe DTM domain
  if (!src.includes('adobedtm.com')) {
    return { isValid: false, error: 'URL must be from assets.adobedtm.com domain' };
  }

  // Check if it's a .js file
  if (!src.endsWith('.js')) {
    return { isValid: false, error: 'URL must point to a .js file' };
  }

  return { isValid: true, error: null };
};

export default {
  getCurrentAdobeScriptUrl,
  getCurrentAdobeScriptAttributes,
  saveAdobeScriptUrl,
  resetToDefaultAdobeScript,
  hasCustomAdobeScript,
  loadAdobeScript,
  removeAdobeScript,
  detectAdobeEnvironment,
  validateAdobeScriptUrl,
  parseScriptInput,
  ADOBE_SCRIPT_PRESETS,
};

