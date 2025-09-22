/**
 * UserAnalytics - User authentication and profile management analytics
 * Tracks user login, registration, profile updates, and loyalty interactions
 */

import airlinesDataLayer from './AirlinesDataLayer';

class UserAnalytics {
  constructor() {
    this.debug = process.env.NODE_ENV === 'development';
    this.userSegments = {
      'new-user': { minDays: 0, maxDays: 7 },
      'returning-user': { minDays: 8, maxDays: 30 },
      'loyal-customer': { minDays: 31, maxDays: 90 },
      'vip-customer': { minDays: 91, maxDays: 365 },
      'champion-customer': { minDays: 366, maxDays: Infinity }
    };
  }

  /**
   * Hash user ID for PII protection
   * @param {string} userId - User ID to hash
   * @returns {string} Hashed user ID
   */
  hashUserId(userId) {
    if (!userId) return null;
    
    // Simple hash function for demo purposes
    // In production, use a proper cryptographic hash
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      const char = userId.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Determine user segment based on registration date
   * @param {string} registrationDate - ISO date string
   * @returns {string} User segment
   */
  getUserSegment(registrationDate) {
    if (!registrationDate) return 'unknown';
    
    const regDate = new Date(registrationDate);
    const now = new Date();
    const daysSinceRegistration = Math.floor((now - regDate) / (1000 * 60 * 60 * 24));
    
    for (const [segment, range] of Object.entries(this.userSegments)) {
      if (daysSinceRegistration >= range.minDays && daysSinceRegistration <= range.maxDays) {
        return segment;
      }
    }
    
    return 'champion-customer';
  }

  /**
   * Track login attempt
   * @param {Object} loginData - Login attempt data
   */
  trackLoginAttempt(loginData) {
    const eventData = {
      loginMethod: loginData.method || 'email',
      emailDomain: this.extractEmailDomain(loginData.email),
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      attemptNumber: loginData.attemptNumber || 1,
      isSocialLogin: loginData.isSocialLogin || false,
      socialProvider: loginData.socialProvider || null,
      hasRememberMe: loginData.rememberMe || false,
      referrer: document.referrer,
      pageURL: window.location.href
    };

    airlinesDataLayer.pushEvent('login-attempt', eventData);
    this.log('Login attempt tracked', eventData);
  }

  /**
   * Track successful login
   * @param {Object} userData - User data from Auth0
   */
  trackLoginSuccess(userData) {
    const hashedUserId = this.hashUserId(userData.sub);
    const userSegment = this.getUserSegment(userData.created_at);
    
    const eventData = {
      user: {
        hashedUserId,
        loyaltyTier: this.determineLoyaltyTier(userData),
        registrationDate: userData.created_at,
        userSegment,
        emailDomain: this.extractEmailDomain(userData.email),
        isEmailVerified: userData.email_verified,
        lastLogin: new Date().toISOString(),
        loginCount: this.getLoginCount(userData.sub)
      },
      loginMethod: this.determineLoginMethod(userData),
      sessionId: this.generateSessionId(),
      timestamp: new Date().toISOString(),
      referrer: document.referrer,
      pageURL: window.location.href
    };

    // Set user data in data layer
    airlinesDataLayer.setUserData(eventData.user);

    // Push login success event
    airlinesDataLayer.pushEvent('user-login-success', eventData);
    this.log('Login success tracked', eventData);
  }

  /**
   * Track login failure
   * @param {Object} failureData - Login failure data
   */
  trackLoginFailure(failureData) {
    const eventData = {
      errorType: failureData.errorType || 'authentication_failed',
      errorMessage: failureData.errorMessage || 'Login failed',
      loginMethod: failureData.method || 'email',
      emailDomain: this.extractEmailDomain(failureData.email),
      attemptNumber: failureData.attemptNumber || 1,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      pageURL: window.location.href
    };

    airlinesDataLayer.pushEvent('user-login-failure', eventData);
    this.log('Login failure tracked', eventData);
  }

  /**
   * Track registration form completion
   * @param {Object} registrationData - Registration data
   */
  trackRegistrationCompletion(registrationData) {
    const hashedUserId = this.hashUserId(registrationData.sub);
    
    const eventData = {
      user: {
        hashedUserId,
        registrationDate: new Date().toISOString(),
        userSegment: 'new-user',
        emailDomain: this.extractEmailDomain(registrationData.email),
        isEmailVerified: registrationData.email_verified,
        registrationMethod: registrationData.method || 'email',
        socialProvider: registrationData.socialProvider || null
      },
      formData: {
        hasFirstName: !!registrationData.given_name,
        hasLastName: !!registrationData.family_name,
        hasPhone: !!registrationData.phone_number,
        hasProfilePicture: !!registrationData.picture,
        timeToComplete: registrationData.timeToComplete || null
      },
      timestamp: new Date().toISOString(),
      referrer: document.referrer,
      pageURL: window.location.href
    };

    airlinesDataLayer.pushEvent('user-registration-complete', eventData);
    this.log('Registration completion tracked', eventData);
  }

  /**
   * Track social login usage
   * @param {Object} socialData - Social login data
   */
  trackSocialLogin(socialData) {
    const eventData = {
      socialProvider: socialData.provider || 'unknown',
      socialUserId: this.hashUserId(socialData.socialUserId),
      isNewUser: socialData.isNewUser || false,
      hasProfilePicture: !!socialData.picture,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      pageURL: window.location.href
    };

    airlinesDataLayer.pushEvent('social-login-usage', eventData);
    this.log('Social login tracked', eventData);
  }

  /**
   * Track password reset request
   * @param {Object} resetData - Password reset data
   */
  trackPasswordResetRequest(resetData) {
    const eventData = {
      emailDomain: this.extractEmailDomain(resetData.email),
      resetMethod: resetData.method || 'email',
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      pageURL: window.location.href
    };

    airlinesDataLayer.pushEvent('password-reset-request', eventData);
    this.log('Password reset request tracked', eventData);
  }

  /**
   * Track profile updates
   * @param {Object} updateData - Profile update data
   */
  trackProfileUpdate(updateData) {
    const hashedUserId = this.hashUserId(updateData.userId);
    
    const eventData = {
      user: {
        hashedUserId,
        updatedFields: updateData.updatedFields || [],
        updateType: updateData.updateType || 'profile',
        previousValues: updateData.previousValues || {},
        newValues: updateData.newValues || {}
      },
      timestamp: new Date().toISOString(),
      pageURL: window.location.href
    };

    airlinesDataLayer.pushEvent('user-profile-update', eventData);
    this.log('Profile update tracked', eventData);
  }

  /**
   * Track loyalty program interactions
   * @param {Object} loyaltyData - Loyalty interaction data
   */
  trackLoyaltyInteraction(loyaltyData) {
    const hashedUserId = this.hashUserId(loyaltyData.userId);
    
    const eventData = {
      user: {
        hashedUserId,
        loyaltyTier: loyaltyData.loyaltyTier || 'bronze',
        pointsBalance: loyaltyData.pointsBalance || 0,
        tierProgress: loyaltyData.tierProgress || 0
      },
      interaction: {
        type: loyaltyData.type || 'view',
        action: loyaltyData.action || 'loyalty-dashboard',
        pointsEarned: loyaltyData.pointsEarned || 0,
        pointsRedeemed: loyaltyData.pointsRedeemed || 0
      },
      timestamp: new Date().toISOString(),
      pageURL: window.location.href
    };

    airlinesDataLayer.pushEvent('loyalty-program-interaction', eventData);
    this.log('Loyalty interaction tracked', eventData);
  }

  /**
   * Track booking history view
   * @param {Object} historyData - Booking history data
   */
  trackBookingHistoryView(historyData) {
    const hashedUserId = this.hashUserId(historyData.userId);
    
    const eventData = {
      user: {
        hashedUserId,
        totalBookings: historyData.totalBookings || 0,
        activeBookings: historyData.activeBookings || 0,
        cancelledBookings: historyData.cancelledBookings || 0
      },
      view: {
        filterApplied: historyData.filterApplied || 'none',
        sortBy: historyData.sortBy || 'date',
        dateRange: historyData.dateRange || 'all',
        pageNumber: historyData.pageNumber || 1
      },
      timestamp: new Date().toISOString(),
      pageURL: window.location.href
    };

    airlinesDataLayer.pushEvent('booking-history-view', eventData);
    this.log('Booking history view tracked', eventData);
  }

  /**
   * Track preferences changes
   * @param {Object} preferencesData - Preferences data
   */
  trackPreferencesChange(preferencesData) {
    const hashedUserId = this.hashUserId(preferencesData.userId);
    
    const eventData = {
      user: {
        hashedUserId
      },
      preferences: {
        category: preferencesData.category || 'general',
        setting: preferencesData.setting || 'unknown',
        previousValue: preferencesData.previousValue,
        newValue: preferencesData.newValue,
        changeType: preferencesData.changeType || 'update'
      },
      timestamp: new Date().toISOString(),
      pageURL: window.location.href
    };

    airlinesDataLayer.pushEvent('user-preferences-change', eventData);
    this.log('Preferences change tracked', eventData);
  }

  /**
   * Track user logout
   * @param {Object} logoutData - Logout data
   */
  trackUserLogout(logoutData) {
    const hashedUserId = this.hashUserId(logoutData.userId);
    
    const eventData = {
      user: {
        hashedUserId,
        sessionDuration: logoutData.sessionDuration || 0,
        logoutReason: logoutData.reason || 'manual'
      },
      timestamp: new Date().toISOString(),
      pageURL: window.location.href
    };

    airlinesDataLayer.pushEvent('user-logout', eventData);
    this.log('User logout tracked', eventData);
  }

  /**
   * Extract email domain from email address
   * @param {string} email - Email address
   * @returns {string} Email domain
   */
  extractEmailDomain(email) {
    if (!email || !email.includes('@')) return 'unknown';
    return email.split('@')[1] || 'unknown';
  }

  /**
   * Determine loyalty tier based on user data
   * @param {Object} userData - User data
   * @returns {string} Loyalty tier
   */
  determineLoyaltyTier(userData) {
    // Simple loyalty tier logic based on registration date
    const regDate = new Date(userData.created_at);
    const now = new Date();
    const daysSinceRegistration = Math.floor((now - regDate) / (1000 * 60 * 60 * 24));
    
    if (daysSinceRegistration < 30) return 'bronze';
    if (daysSinceRegistration < 90) return 'silver';
    if (daysSinceRegistration < 365) return 'gold';
    return 'platinum';
  }

  /**
   * Determine login method from user data
   * @param {Object} userData - User data
   * @returns {string} Login method
   */
  determineLoginMethod(userData) {
    if (userData.identities && userData.identities.length > 0) {
      const identity = userData.identities[0];
      if (identity.provider === 'google-oauth2') return 'social';
      if (identity.provider === 'facebook') return 'social';
      if (identity.provider === 'auth0') return 'email';
    }
    return 'email';
  }

  /**
   * Get login count for user (stored in localStorage)
   * @param {string} userId - User ID
   * @returns {number} Login count
   */
  getLoginCount(userId) {
    const key = `login_count_${this.hashUserId(userId)}`;
    const count = parseInt(localStorage.getItem(key) || '0');
    localStorage.setItem(key, (count + 1).toString());
    return count + 1;
  }

  /**
   * Generate session ID
   * @returns {string} Session ID
   */
  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Debug logging
   * @param {string} message - Log message
   * @param {Object} data - Data to log
   */
  log(message, data = null) {
    if (this.debug) {
      console.log(`👤 UserAnalytics: ${message}`, data);
    }
  }
}

// Create singleton instance
const userAnalytics = new UserAnalytics();

export default userAnalytics;
