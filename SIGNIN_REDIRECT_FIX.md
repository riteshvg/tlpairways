# Fix: Sign-In Redirect Issue in MPA Traveller Details Page

## Problem
In the SPA, when a user clicks the "Sign In" button on the traveller details page, they are redirected back to the traveller details page after authentication. However, in the MPA, users were being redirected to the profile page instead, which broke the booking flow.

## Root Cause
1. The "Sign In" button in the traveller details page (`/pages/traveller-details.tsx`) was using a hardcoded link to `/profile` instead of triggering the Auth0 login flow with a proper return URL.
2. The `LoginButton` component was using an incorrect Auth0 endpoint (`/auth/login` instead of `/api/auth/login`).

## Changes Made

### 1. Fixed Traveller Details Sign-In Button
**File**: `/frontend-next/pages/traveller-details.tsx`

- **Before**: The button used `href="/profile"` which directly navigated to the profile page
- **After**: The button now uses an `onClick` handler that:
  - Captures the current page URL with all query parameters
  - Redirects to Auth0's login endpoint with a `returnTo` parameter
  - Ensures users return to the traveller details page after authentication

```tsx
// Before
<Button
    color="inherit"
    size="small"
    href="/profile" // Placeholder for login
    sx={{ fontWeight: 'bold' }}
>
    Sign In
</Button>

// After
<Button
    color="inherit"
    size="small"
    onClick={() => {
        // Construct the current page URL with all query params to return after login
        const currentPath = window.location.pathname + window.location.search;
        window.location.href = `/api/auth/login?returnTo=${encodeURIComponent(currentPath)}`;
    }}
    sx={{ fontWeight: 'bold' }}
>
    Sign In
</Button>
```

- Also added a check to only show the banner when the user is not authenticated (`!user`)

### 2. Fixed LoginButton Component
**File**: `/frontend-next/components/auth/LoginButton.tsx`

- **Before**: Used `/auth/login` endpoint
- **After**: Uses `/api/auth/login` endpoint (Auth0's Next.js SDK convention)

```tsx
// Before
window.location.href = `/auth/login?returnTo=${encodeURIComponent(path)}`;

// After
window.location.href = `/api/auth/login?returnTo=${encodeURIComponent(path)}`;
```

## Verification

### Profile Page Access
The profile page should **only** be accessible through:
1. The **ProfileDropdown** menu in the navbar (when user is logged in)
2. Direct navigation to `/profile` URL

### Booking Flow
When a user clicks "Sign In" on the traveller details page:
1. They are redirected to Auth0 login
2. After successful authentication, they return to the traveller details page
3. All booking context (flight selection, dates, passengers, etc.) is preserved via URL query parameters
4. The user can continue with their booking seamlessly

## Testing Checklist
- [ ] Click "Sign In" on traveller details page → redirects to Auth0 login
- [ ] After login, user returns to traveller details page with all query params intact
- [ ] Profile page is accessible via user menu dropdown
- [ ] LoginButton component works correctly on other pages (e.g., homepage)
- [ ] Booking flow continues smoothly after authentication

## Related Files
- `/frontend-next/pages/traveller-details.tsx` - Main fix for traveller details sign-in
- `/frontend-next/components/auth/LoginButton.tsx` - Fixed Auth0 endpoint
- `/frontend-next/components/Navbar.tsx` - Contains LoginButton usage
- `/frontend-next/components/auth/ProfileDropdown.tsx` - Contains profile page link
