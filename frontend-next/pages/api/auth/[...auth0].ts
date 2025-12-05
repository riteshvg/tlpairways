import { handleAuth } from '@auth0/nextjs-auth0';

/**
 * Auth0 Authentication Handler
 * 
 * This creates the following routes automatically:
 * - /api/auth/login - Redirects to Auth0 login
 * - /api/auth/logout - Logs out and redirects
 * - /api/auth/callback - Handles Auth0 callback
 * - /api/auth/me - Returns current user info
 */
export default handleAuth();
