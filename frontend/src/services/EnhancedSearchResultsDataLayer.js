/**
 * Enhanced Search Results Data Layer
 * Handles search-specific analytics and tracking
 */

class EnhancedSearchResultsDataLayer {
  constructor() {
    this.debug = process.env.NODE_ENV === 'development';
    this.searchId = null;
    this.searchStartTime = null;
  }

  /**
   * Initialize search tracking
   * @param {string} searchId - Unique search identifier
   */
  initializeSearch(searchId) {
    this.searchId = searchId;
    this.searchStartTime = new Date();
    
    if (this.debug) {
      console.log('Enhanced Search Results Data Layer initialized:', {
        searchId,
        timestamp: this.searchStartTime.toISOString()
      });
    }
  }

  /**
   * Track search abandonment
   * @param {Object} abandonmentData - Data about the abandonment
   */
  trackSearchAbandonment(abandonmentData = {}) {
    if (!this.searchId) {
      console.warn('Search not initialized, cannot track abandonment');
      return;
    }

    const abandonmentEvent = {
      event: 'search-abandonment',
      searchId: this.searchId,
      searchDuration: this.searchStartTime ? 
        Date.now() - this.searchStartTime.getTime() : 0,
      timestamp: new Date().toISOString(),
      ...abandonmentData
    };

    // Push to Adobe Data Layer if available
    if (typeof window !== 'undefined' && window.adobeDataLayer) {
      window.adobeDataLayer.push(abandonmentEvent);
    }

    if (this.debug) {
      console.log('Search abandonment tracked:', abandonmentEvent);
    }
  }

  /**
   * Track search completion
   * @param {Object} completionData - Data about the search completion
   */
  trackSearchCompletion(completionData = {}) {
    if (!this.searchId) {
      console.warn('Search not initialized, cannot track completion');
      return;
    }

    const completionEvent = {
      event: 'search-completion',
      searchId: this.searchId,
      searchDuration: this.searchStartTime ? 
        Date.now() - this.searchStartTime.getTime() : 0,
      timestamp: new Date().toISOString(),
      ...completionData
    };

    // Push to Adobe Data Layer if available
    if (typeof window !== 'undefined' && window.adobeDataLayer) {
      window.adobeDataLayer.push(completionEvent);
    }

    if (this.debug) {
      console.log('Search completion tracked:', completionEvent);
    }
  }

  /**
   * Track search result interaction
   * @param {Object} interactionData - Data about the interaction
   */
  trackSearchInteraction(interactionData = {}) {
    if (!this.searchId) {
      console.warn('Search not initialized, cannot track interaction');
      return;
    }

    const interactionEvent = {
      event: 'search-interaction',
      searchId: this.searchId,
      timestamp: new Date().toISOString(),
      ...interactionData
    };

    // Push to Adobe Data Layer if available
    if (typeof window !== 'undefined' && window.adobeDataLayer) {
      window.adobeDataLayer.push(interactionEvent);
    }

    if (this.debug) {
      console.log('Search interaction tracked:', interactionEvent);
    }
  }
}

// Create and export singleton instance
const enhancedSearchResultsDataLayer = new EnhancedSearchResultsDataLayer();
export default enhancedSearchResultsDataLayer;
