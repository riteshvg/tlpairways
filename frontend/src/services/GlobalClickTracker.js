/**
 * GlobalClickTracker - Global click tracking service for buttons and links
 * Tracks all button clicks and link interactions across the application
 */

import airlinesDataLayer from './AirlinesDataLayer';

class GlobalClickTracker {
  constructor() {
    this.isInitialized = false;
    this.debug = process.env.NODE_ENV === 'development';
  }

  /**
   * Initialize global click tracking
   */
  init() {
    if (this.isInitialized) {
      this.log('Global click tracking already initialized');
      return;
    }

    // Add event listener for all clicks
    document.addEventListener('click', this.handleClick.bind(this), true);
    
    this.isInitialized = true;
    this.log('Global click tracking initialized');
  }

  /**
   * Handle click events
   * @param {Event} event - Click event
   */
  handleClick(event) {
    const target = event.target;
    
    // Skip if event is from our tracking system
    if (target.hasAttribute('data-tracking-disabled')) {
      return;
    }

    // Track button clicks - DISABLED
    // if (this.isButton(target)) {
    //   this.trackButtonClick(target, event);
    // }
    
    // Track link clicks
    if (this.isLink(target)) {
      this.trackLinkClick(target, event);
    }
  }

  /**
   * Check if element is a button
   * @param {Element} element - DOM element
   * @returns {boolean}
   */
  isButton(element) {
    return (
      element.tagName === 'BUTTON' ||
      element.type === 'button' ||
      element.type === 'submit' ||
      element.getAttribute('role') === 'button' ||
      element.classList.contains('MuiButton-root') ||
      element.closest('button') ||
      element.closest('[role="button"]')
    );
  }

  /**
   * Check if element is a link
   * @param {Element} element - DOM element
   * @returns {boolean}
   */
  isLink(element) {
    return (
      element.tagName === 'A' ||
      element.getAttribute('role') === 'link' ||
      element.closest('a')
    );
  }

  /**
   * Track button click
   * @param {Element} element - Button element
   * @param {Event} event - Click event
   */
  trackButtonClick(element, event) {
    const buttonData = this.extractButtonData(element);
    
    airlinesDataLayer.trackEvent('buttonClick', {
      ...buttonData,
      eventType: 'click',
      clickCoordinates: {
        x: event.clientX,
        y: event.clientY
      },
      timestamp: new Date().toISOString()
    });

    this.log('Button click tracked', buttonData);
  }

  /**
   * Track link click
   * @param {Element} element - Link element
   * @param {Event} event - Click event
   */
  trackLinkClick(element, event) {
    const linkData = this.extractLinkData(element);
    
    airlinesDataLayer.trackEvent('linkClick', {
      ...linkData,
      eventType: 'click',
      clickCoordinates: {
        x: event.clientX,
        y: event.clientY
      },
      timestamp: new Date().toISOString()
    });

    this.log('Link click tracked', linkData);
  }

  /**
   * Extract button data from element
   * @param {Element} element - Button element
   * @returns {Object} Button data
   */
  extractButtonData(element) {
    const button = element.closest('button') || element;
    const pageName = this.getCurrentPageName();
    
    return {
      buttonName: this.getButtonName(button),
      buttonId: button.id || null,
      buttonClass: button.className || null,
      buttonText: this.getButtonText(button),
      buttonType: button.type || 'button',
      targetLink: this.getButtonTarget(button),
      pageName: pageName,
      pageURL: window.location.href,
      section: this.getElementSection(button),
      userAuthenticated: this.isUserAuthenticated()
    };
  }

  /**
   * Extract link data from element
   * @param {Element} element - Link element
   * @returns {Object} Link data
   */
  extractLinkData(element) {
    const link = element.closest('a') || element;
    const pageName = this.getCurrentPageName();
    
    return {
      linkName: this.getLinkName(link),
      linkId: link.id || null,
      linkClass: link.className || null,
      linkText: this.getLinkText(link),
      targetLink: link.href || null,
      targetPage: this.getTargetPage(link.href),
      pageName: pageName,
      pageURL: window.location.href,
      section: this.getElementSection(link),
      userAuthenticated: this.isUserAuthenticated()
    };
  }

  /**
   * Get button name from element
   * @param {Element} element - Button element
   * @returns {string} Button name
   */
  getButtonName(element) {
    // Check for data attributes first
    if (element.dataset.buttonName) return element.dataset.buttonName;
    if (element.dataset.name) return element.dataset.name;
    
    // Check for aria-label
    if (element.getAttribute('aria-label')) return element.getAttribute('aria-label');
    
    // Check for title
    if (element.title) return element.title;
    
    // Get text content
    const text = this.getButtonText(element);
    if (text) return text;
    
    // Fallback to element tag and class
    return `button-${element.className || 'unnamed'}`;
  }

  /**
   * Get button text content
   * @param {Element} element - Button element
   * @returns {string} Button text
   */
  getButtonText(element) {
    // Get direct text content
    const directText = element.textContent?.trim();
    if (directText) return directText;
    
    // Check for nested text in spans, divs, etc.
    const textElements = element.querySelectorAll('span, div, p');
    for (let el of textElements) {
      const text = el.textContent?.trim();
      if (text && !text.includes(' ')) return text;
    }
    
    return null;
  }

  /**
   * Get button target (for navigation buttons)
   * @param {Element} element - Button element
   * @returns {string|null} Target URL or route
   */
  getButtonTarget(element) {
    // Check for data attributes
    if (element.dataset.target) return element.dataset.target;
    if (element.dataset.href) return element.dataset.href;
    
    // Check for onClick handlers that might navigate
    const onclick = element.getAttribute('onclick');
    if (onclick) {
      const match = onclick.match(/navigate\(['"]([^'"]+)['"]\)/);
      if (match) return match[1];
    }
    
    // Check parent for navigation context
    const parent = element.closest('[data-target], [data-href]');
    if (parent) {
      return parent.dataset.target || parent.dataset.href;
    }
    
    return null;
  }

  /**
   * Get link name from element
   * @param {Element} element - Link element
   * @returns {string} Link name
   */
  getLinkName(element) {
    // Check for data attributes first
    if (element.dataset.linkName) return element.dataset.linkName;
    if (element.dataset.name) return element.dataset.name;
    
    // Check for aria-label
    if (element.getAttribute('aria-label')) return element.getAttribute('aria-label');
    
    // Check for title
    if (element.title) return element.title;
    
    // Get text content
    const text = this.getLinkText(element);
    if (text) return text;
    
    // Fallback to href or element identifier
    if (element.href) {
      const url = new URL(element.href);
      return url.pathname.split('/').pop() || 'link';
    }
    
    return `link-${element.className || 'unnamed'}`;
  }

  /**
   * Get link text content
   * @param {Element} element - Link element
   * @returns {string} Link text
   */
  getLinkText(element) {
    return element.textContent?.trim() || null;
  }

  /**
   * Get target page from URL
   * @param {string} href - Link href
   * @returns {string|null} Target page name
   */
  getTargetPage(href) {
    if (!href) return null;
    
    try {
      const url = new URL(href);
      const pathname = url.pathname;
      
      // Map common routes to page names
      const routeMap = {
        '/': 'home',
        '/search': 'search',
        '/profile': 'profile',
        '/my-bookings': 'bookings',
        '/settings': 'settings',
        '/login': 'login'
      };
      
      return routeMap[pathname] || pathname.substring(1) || 'external';
    } catch (e) {
      return 'invalid-url';
    }
  }

  /**
   * Get current page name
   * @returns {string} Current page name
   */
  getCurrentPageName() {
    const pathname = window.location.pathname;
    
    const routeMap = {
      '/': 'home',
      '/search': 'search',
      '/profile': 'profile',
      '/my-bookings': 'bookings',
      '/settings': 'settings',
      '/login': 'login',
      '/traveller-details': 'traveller-details',
      '/ancillary-services': 'ancillary-services',
      '/payment': 'payment',
      '/confirmation': 'confirmation'
    };
    
    return routeMap[pathname] || 'unknown';
  }

  /**
   * Get section of element in page
   * @param {Element} element - DOM element
   * @returns {string} Section name
   */
  getElementSection(element) {
    // Check for section data attribute
    if (element.dataset.section) return element.dataset.section;
    
    // Check parent sections
    const section = element.closest('[data-section]');
    if (section) return section.dataset.section;
    
    // Check for common section classes
    const sectionClasses = ['header', 'navbar', 'hero', 'banner', 'footer', 'sidebar'];
    for (let className of sectionClasses) {
      const parent = element.closest(`.${className}, [class*="${className}"]`);
      if (parent) return className;
    }
    
    // Check for Material-UI sections
    const muiSection = element.closest('[class*="Mui"]');
    if (muiSection) {
      const classList = muiSection.className;
      if (classList.includes('AppBar')) return 'navbar';
      if (classList.includes('Button')) return 'content';
      if (classList.includes('Card')) return 'content';
    }
    
    return 'content';
  }

  /**
   * Check if user is authenticated
   * @returns {boolean} Authentication status
   */
  isUserAuthenticated() {
    // Check localStorage for auth status
    return localStorage.getItem('isAuthenticated') === 'true' || 
           !!localStorage.getItem('auth0.is.authenticated');
  }

  /**
   * Disable tracking for specific element
   * @param {Element} element - DOM element
   */
  disableTracking(element) {
    element.setAttribute('data-tracking-disabled', 'true');
  }

  /**
   * Enable tracking for specific element
   * @param {Element} element - DOM element
   */
  enableTracking(element) {
    element.removeAttribute('data-tracking-disabled');
  }

  /**
   * Destroy click tracking
   */
  destroy() {
    if (this.isInitialized) {
      document.removeEventListener('click', this.handleClick.bind(this), true);
      this.isInitialized = false;
      this.log('Global click tracking destroyed');
    }
  }

  /**
   * Debug logging
   * @param {string} message - Log message
   * @param {Object} data - Data to log
   */
  log(message, data = null) {
    if (this.debug) {
      console.log(`🖱️ GlobalClickTracker: ${message}`, data);
    }
  }
}

// Create singleton instance
const globalClickTracker = new GlobalClickTracker();

export default globalClickTracker;
