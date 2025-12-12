# Auth0 Authentication Fix - Endpoint Correction

## Issue
Authentication was broken in both localhost and production after recent changes.

## Root Cause
The codebase was migrated to Auth0 SDK v4 which uses a **proxy pattern** with `/auth/*` endpoints instead of the old `/api/auth/*` API routes pattern.

However, recent changes (commits b0906a7 and c45e54e) incorrectly reverted the endpoints back to `/api/auth/*`, breaking authentication.

## Migration History

### Original Implementation (Deprecated)
- Used `pages/api/auth/[...auth0].ts` API route
- Endpoints: `/api/auth/login`, `/api/auth/logout`, `/api/auth/callback`
- Auth0 SDK v3 pattern

### Current Implementation (Auth0 SDK v4)
- **Commit ee286e8** (Dec 6, 2025): Migrated to proxy pattern
- Uses `middleware.ts` with `auth0.middleware()`
- Endpoints: `/auth/login`, `/auth/logout`, `/auth/callback`
- Removed `pages/api/auth/[...auth0].ts`

## Fix Applied (Commit 6fdd10e)

Updated all authentication endpoints from `/api/auth/*` to `/auth/*`:

### Files Changed:
1. **`frontend-next/components/auth/LoginButton.tsx`**
   - Changed: `/api/auth/login` → `/auth/login`

2. **`frontend-next/pages/traveller-details.tsx`**
   - Changed: `/api/auth/login` → `/auth/login`

3. **`frontend-next/pages/index.tsx`**
   - Changed: `/api/auth/login` → `/auth/login`

4. **`frontend-next/pages/profile.tsx`**
   - Changed: `/api/auth/logout` → `/auth/logout`

## Current Architecture

### Authentication Flow:
```
User clicks "Sign In"
    ↓
Redirects to /auth/login
    ↓
middleware.ts intercepts request
    ↓
auth0.middleware() handles OAuth flow
    ↓
Redirects to Auth0
    ↓
User authenticates
    ↓
Callback to /auth/callback
    ↓
middleware.ts creates session
    ↓
User redirected to returnTo URL
```

### Key Files:
- **`middleware.ts`**: Intercepts all requests, handles Auth0 authentication
- **`lib/auth0.ts`**: Creates Auth0Client instance
- **`components/auth/LoginButton.tsx`**: Login button component
- **`components/auth/LogoutButton.tsx`**: Logout button component
- **`components/auth/ProfileDropdown.tsx`**: User profile dropdown

## Correct Endpoints

### Login:
```typescript
window.location.href = `/auth/login?returnTo=${encodeURIComponent(path)}`;
```

### Logout:
```typescript
<Button href="/auth/logout">Logout</Button>
```

### User Profile:
```typescript
<a href="/auth/me">Profile</a>
```

## Environment Variables Required

```bash
AUTH0_DOMAIN=dev-q6p3jrm5pbykuq23.us.auth0.com
AUTH0_CLIENT_ID=your_client_id
AUTH0_CLIENT_SECRET=your_client_secret
APP_BASE_URL=http://localhost:3000  # or production URL
AUTH0_SECRET=your_32_char_random_secret
```

**Note**: Use `AUTH0_DOMAIN` (not `AUTH0_ISSUER_BASE_URL`) and `APP_BASE_URL` (not `AUTH0_BASE_URL`) for Auth0 SDK v4.

## Auth0 Dashboard Configuration

### Callback URLs:
- Development: `http://localhost:3000/auth/callback`
- Production: `https://your-domain.com/auth/callback`

### Logout URLs:
- Development: `http://localhost:3000`
- Production: `https://your-domain.com`

## Testing Checklist

- [x] Login from homepage works
- [x] Login from traveller-details page works
- [x] Logout from profile page works
- [x] User redirected back to original page after login
- [x] Session persists across page navigations
- [x] ProfileDropdown shows user info

## Deployment

The fix has been pushed to `origin/main` (commit 6fdd10e).

Railway will automatically deploy the corrected endpoints.

## Prevention

To avoid this issue in the future:

1. **Always use `/auth/*` endpoints** for authentication (not `/api/auth/*`)
2. **Reference `middleware.ts`** for auth implementation, not API routes
3. **Check git history** before changing auth endpoints
4. **Test authentication** after any auth-related changes

## Related Commits

- **ee286e8**: Original migration to Auth0 SDK v4 proxy pattern
- **b0906a7**: Incorrect reversion to `/api/auth/*` (sign-in redirect fix)
- **c45e54e**: Incorrect reversion to `/api/auth/*` (smart destination filtering)
- **6fdd10e**: ✅ **This fix** - Corrected endpoints back to `/auth/*`

## Documentation Updates Needed

- [ ] Update `SIGNIN_REDIRECT_FIX.md` to use `/auth/*` endpoints
- [ ] Update `OAUTH_MPA_IMPLEMENTATION_SUMMARY.md` if needed
- [ ] Add note about Auth0 SDK v4 migration to prevent future confusion
