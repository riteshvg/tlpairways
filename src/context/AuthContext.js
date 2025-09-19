import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { validateAuth0Config } from '../config/auth0Config';
import analytics from '../services/analytics';

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
          
          // Track user login in Adobe Data Layer
          console.log('User authenticated, tracking login:', profileData);
          analytics.trackUserLogin(profileData);
        } catch (error) {
          console.error('Error loading user profile:', error);
        } finally {
          setIsLoadingProfile(false);
        }
      } else {
        setUserProfile(null);
        // Track user logout in Adobe Data Layer
        if (!isLoading) {
          console.log('User not authenticated, tracking logout');
          analytics.trackUserLogout();
        }
      }
    };

    loadUserProfile();
  }, [isAuthenticated, user, getAccessTokenSilently, isLoading]);

  const login = () => {
    loginWithRedirect({
      authorizationParams: {
        redirect_uri: window.location.origin,
      },
    });
  };

  const logoutUser = () => {
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
