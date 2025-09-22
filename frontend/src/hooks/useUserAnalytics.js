/**
 * useUserAnalytics - Custom hook for user analytics tracking
 * Provides methods to track user profile and loyalty interactions
 */

import { useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import userAnalytics from '../services/UserAnalytics';

const useUserAnalytics = () => {
  const { user, isAuthenticated } = useAuth();

  /**
   * Track profile update
   * @param {Object} updateData - Profile update data
   */
  const trackProfileUpdate = useCallback((updateData) => {
    if (!isAuthenticated || !user) return;
    
    userAnalytics.trackProfileUpdate({
      userId: user.sub,
      ...updateData
    });
  }, [isAuthenticated, user]);

  /**
   * Track loyalty program interaction
   * @param {Object} loyaltyData - Loyalty interaction data
   */
  const trackLoyaltyInteraction = useCallback((loyaltyData) => {
    if (!isAuthenticated || !user) return;
    
    userAnalytics.trackLoyaltyInteraction({
      userId: user.sub,
      ...loyaltyData
    });
  }, [isAuthenticated, user]);

  /**
   * Track booking history view
   * @param {Object} historyData - Booking history data
   */
  const trackBookingHistoryView = useCallback((historyData) => {
    if (!isAuthenticated || !user) return;
    
    userAnalytics.trackBookingHistoryView({
      userId: user.sub,
      ...historyData
    });
  }, [isAuthenticated, user]);

  /**
   * Track preferences change
   * @param {Object} preferencesData - Preferences data
   */
  const trackPreferencesChange = useCallback((preferencesData) => {
    if (!isAuthenticated || !user) return;
    
    userAnalytics.trackPreferencesChange({
      userId: user.sub,
      ...preferencesData
    });
  }, [isAuthenticated, user]);

  /**
   * Track login attempt
   * @param {Object} loginData - Login attempt data
   */
  const trackLoginAttempt = useCallback((loginData) => {
    userAnalytics.trackLoginAttempt(loginData);
  }, []);

  /**
   * Track social login
   * @param {Object} socialData - Social login data
   */
  const trackSocialLogin = useCallback((socialData) => {
    userAnalytics.trackSocialLogin(socialData);
  }, []);

  /**
   * Track password reset request
   * @param {Object} resetData - Password reset data
   */
  const trackPasswordResetRequest = useCallback((resetData) => {
    userAnalytics.trackPasswordResetRequest(resetData);
  }, []);

  /**
   * Track registration completion
   * @param {Object} registrationData - Registration data
   */
  const trackRegistrationCompletion = useCallback((registrationData) => {
    userAnalytics.trackRegistrationCompletion(registrationData);
  }, []);

  return {
    trackProfileUpdate,
    trackLoyaltyInteraction,
    trackBookingHistoryView,
    trackPreferencesChange,
    trackLoginAttempt,
    trackSocialLogin,
    trackPasswordResetRequest,
    trackRegistrationCompletion
  };
};

export default useUserAnalytics;
