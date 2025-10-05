import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { validateAuth0Config } from '../config/auth0Config';
import userAnalytics from '../services/UserAnalytics';

// Validate Auth0 configuration only when environment variables are available
if (process.env.NODE_ENV !== 'production' || process.env.REACT_APP_AUTH0_DOMAIN) {
  try {
    validateAuth0Config();
  } catch (error) {
    console.error('Auth0 configuration error:', error.message);
  }
}

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const {
    user,
    isAuthenticated,
    isLoading,
    error,
    loginWithRedirect,
    logout,
    getAccessTokenSilently,
  } = useAuth0();

  const [userProfile, setUserProfile] = useState(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);

  // Load user profile data and track authentication
  useEffect(() => {
    const loadUserProfile = async () => {
      if (isAuthenticated && user) {
        setIsLoadingProfile(true);
        try {
          // Get access token for API calls
          const token = await getAccessTokenSilently();
          
          // Set user profile with additional data
          const profileData = {
            ...user,
            accessToken: token,
            id: user.sub,
            email: user.email,
            name: user.name,
            picture: user.picture,
            email_verified: user.email_verified,
          };
          
          setUserProfile(profileData);
          
          // Track successful login
          userAnalytics.trackLoginSuccess(user);
        } catch (error) {
          console.error('Error loading user profile:', error);
          
          // Track login failure
          userAnalytics.trackLoginFailure({
            errorType: 'profile_load_failed',
            errorMessage: error.message,
            method: 'email'
          });
        } finally {
          setIsLoadingProfile(false);
        }
      } else {
        setUserProfile(null);
        // Track user logout
        if (!isLoading && userProfile) {
          userAnalytics.trackUserLogout({
            userId: userProfile.id,
            reason: 'session_expired'
          });
        }
      }
    };

    loadUserProfile();
  }, [isAuthenticated, user, getAccessTokenSilently, isLoading]);

  // Handle redirect after successful authentication
  useEffect(() => {
    if (isAuthenticated && !isLoading && !isLoadingProfile) {
      const returnTo = sessionStorage.getItem('auth_return_to');
      const redirectData = sessionStorage.getItem('auth_redirect_data');
      
      if (returnTo) {
        // Clear the stored return path
        sessionStorage.removeItem('auth_return_to');
        
        // Check if we have booking state to restore
        if (redirectData) {
          try {
            const { path, state } = JSON.parse(redirectData);
            sessionStorage.removeItem('auth_redirect_data');
            
            // Store the booking state for the target component to use
            if (state && (path.includes('/traveller-details') || path.includes('/ancillary-services') || path.includes('/payment'))) {
              sessionStorage.setItem('restored_booking_state', JSON.stringify(state));
            }
            
            // Redirect to the intended destination
            window.location.href = path;
            return;
          } catch (error) {
            console.error('Error parsing redirect data:', error);
            sessionStorage.removeItem('auth_redirect_data');
          }
        }
        
        // Fallback to simple redirect
        window.location.href = returnTo;
      }
    }
  }, [isAuthenticated, isLoading, isLoadingProfile]);

  const login = (returnTo = null) => {
    // Store the intended destination in sessionStorage
    if (returnTo) {
      sessionStorage.setItem('auth_return_to', returnTo);
    }
    
    loginWithRedirect({
      authorizationParams: {
        redirect_uri: window.location.origin,
      },
    });
  };

  const logoutUser = () => {
    // Track manual logout
    if (userProfile) {
      userAnalytics.trackUserLogout({
        userId: userProfile.id,
        reason: 'manual'
      });
    }
    
    logout({
      logoutParams: {
        returnTo: window.location.origin,
      },
    });
  };

  const getAccessToken = async () => {
    try {
      return await getAccessTokenSilently();
    } catch (error) {
      console.error('Error getting access token:', error);
      return null;
    }
  };

  const value = {
    user: userProfile,
    isAuthenticated,
    isLoading: isLoading || isLoadingProfile,
    error,
    login,
    logout: logoutUser,
    getAccessToken,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
