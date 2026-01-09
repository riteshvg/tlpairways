// Auth0 Configuration
export const auth0Config = {
  domain: process.env.REACT_APP_AUTH0_DOMAIN,
  clientId: process.env.REACT_APP_AUTH0_CLIENT_ID,
  audience: process.env.REACT_APP_AUTH0_AUDIENCE,
  redirectUri: process.env.REACT_APP_AUTH0_REDIRECT_URI || window.location.origin,
  scope: process.env.REACT_APP_AUTH0_SCOPE || 'openid profile email',
  useRefreshTokens: true,
  cacheLocation: 'localstorage',
  // Additional configuration for production
  authorizationParams: {
    redirect_uri: process.env.REACT_APP_AUTH0_REDIRECT_URI || window.location.origin,
  },
};

// Validate required Auth0 configuration
export const validateAuth0Config = () => {
  const required = ['domain', 'clientId', 'audience', 'redirectUri'];
  const missing = required.filter(key => !auth0Config[key]);
  
  if (missing.length > 0) {
    console.warn(`Missing Auth0 configuration: ${missing.join(', ')}. This is normal during build process.`);
    return false;
  }
  
  return true;
};
