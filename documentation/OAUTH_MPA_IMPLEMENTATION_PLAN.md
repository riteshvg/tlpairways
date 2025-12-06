# OAuth Implementation Plan for MPA

## Current Status Analysis

### SPA Implementation (React + Auth0)
The SPA uses `@auth0/auth0-react` with the following features:
1. **AuthContext** - Centralized authentication state management
2. **Session Restoration** - Preserves booking state across auth redirects
3. **Data Layer Integration** - Tracks login/logout events
4. **Profile Management** - User profile dropdown with navigation
5. **Protected Routes** - Conditional rendering based on auth status

### MPA Current State (Next.js + Auth0)
- **Package**: `@auth0/nextjs-auth0` (already installed)
- **API Route**: `/pages/api/auth/[...auth0].ts` (currently disabled)
- **Hook Usage**: `useUser` hook already imported in several pages
- **Environment**: Configuration template exists in `env.example`

## Implementation Steps

### Phase 1: Enable Auth0 API Routes

**File**: `/pages/api/auth/[...auth0].ts`

```typescript
import { handleAuth } from '@auth0/nextjs-auth0';

export default handleAuth();
```

This single line enables all Auth0 routes:
- `/api/auth/login` - Initiates login
- `/api/auth/logout` - Logs out user
- `/api/auth/callback` - Handles OAuth callback
- `/api/auth/me` - Returns user profile

### Phase 2: Create Auth Components

#### 2.1 Login Button Component
**File**: `/components/auth/LoginButton.tsx`

```typescript
import { Button } from '@mui/material';
import { Login as LoginIcon } from '@mui/icons-material';

export default function LoginButton({ returnTo }: { returnTo?: string }) {
  const handleLogin = () => {
    const path = returnTo || window.location.pathname + window.location.search;
    window.location.href = `/api/auth/login?returnTo=${encodeURIComponent(path)}`;
  };

  return (
    <Button
      variant="contained"
      startIcon={<LoginIcon />}
      onClick={handleLogin}
    >
      Sign In
    </Button>
  );
}
```

#### 2.2 Logout Button Component
**File**: `/components/auth/LogoutButton.tsx`

```typescript
import { Button } from '@mui/material';
import { Logout as LogoutIcon } from '@mui/icons-material';

export default function LogoutButton() {
  const handleLogout = () => {
    window.location.href = '/api/auth/logout';
  };

  return (
    <Button
      variant="outlined"
      startIcon={<LogoutIcon />}
      onClick={handleLogout}
    >
      Sign Out
    </Button>
  );
}
```

#### 2.3 Profile Dropdown Component
**File**: `/components/auth/ProfileDropdown.tsx`

```typescript
import { useState } from 'react';
import { useUser } from '@auth0/nextjs-auth0/client';
import {
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Typography,
  Box,
  Divider,
  ListItemIcon
} from '@mui/material';
import {
  Person,
  Settings,
  History,
  Logout
} from '@mui/icons-material';
import { useRouter } from 'next/router';
import LogoutButton from './LogoutButton';

export default function ProfileDropdown() {
  const { user } = useUser();
  const router = useRouter();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  if (!user) return null;

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const navigate = (path: string) => {
    router.push(path);
    handleClose();
  };

  return (
    <>
      <IconButton onClick={handleClick} size="small">
        <Avatar src={user.picture} alt={user.name} sx={{ width: 32, height: 32 }} />
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography variant="subtitle2">{user.name}</Typography>
          <Typography variant="caption" color="text.secondary">{user.email}</Typography>
        </Box>

        <MenuItem onClick={() => navigate('/profile')}>
          <ListItemIcon><Person fontSize="small" /></ListItemIcon>
          My Profile
        </MenuItem>

        <MenuItem onClick={() => navigate('/my-bookings')}>
          <ListItemIcon><History fontSize="small" /></ListItemIcon>
          My Bookings
        </MenuItem>

        <MenuItem onClick={() => navigate('/settings')}>
          <ListItemIcon><Settings fontSize="small" /></ListItemIcon>
          Settings
        </MenuItem>

        <Divider />

        <MenuItem>
          <ListItemIcon><Logout fontSize="small" /></ListItemIcon>
          <LogoutButton />
        </MenuItem>
      </Menu>
    </>
  );
}
```

### Phase 3: Update Header Component

**File**: `/components/Header.tsx` (or wherever the header is)

Add authentication UI to the header:

```typescript
import { useUser } from '@auth0/nextjs-auth0/client';
import LoginButton from './auth/LoginButton';
import ProfileDropdown from './auth/ProfileDropdown';

export default function Header() {
  const { user, isLoading } = useUser();

  return (
    <AppBar>
      <Toolbar>
        {/* ... existing header content ... */}
        
        <Box sx={{ ml: 'auto', display: 'flex', gap: 2 }}>
          {!isLoading && (
            user ? <ProfileDropdown /> : <LoginButton />
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}
```

### Phase 4: Protected Routes

#### 4.1 Server-Side Protection
For pages that require authentication:

```typescript
import { withPageAuthRequired } from '@auth0/nextjs-auth0';

export const getServerSideProps = withPageAuthRequired();

export default function ProfilePage({ user }) {
  return <div>Welcome {user.name}</div>;
}
```

#### 4.2 Client-Side Protection
For conditional rendering:

```typescript
import { useUser } from '@auth0/nextjs-auth0/client';

export default function MyBookingsPage() {
  const { user, isLoading } = useUser();

  if (isLoading) return <CircularProgress />;
  if (!user) return <LoginPrompt />;

  return <BookingsList user={user} />;
}
```

### Phase 5: Analytics Integration

Update analytics tracking to include authentication events:

**File**: `/lib/analytics/dataLayer.ts`

Add new functions:

```typescript
export function pushLoginEvent(user: any) {
  pushToDataLayer({
    event: 'login',
    userData: {
      isAuthenticated: true,
      userId: user.sub,
      userEmail: user.email,
      userSegment: 'registered',
      loginMethod: 'auth0',
      timestamp: new Date().toISOString()
    }
  });
}

export function pushLogoutEvent(userId: string) {
  pushToDataLayer({
    event: 'logout',
    userData: {
      isAuthenticated: false,
      userId: userId,
      logoutReason: 'manual',
      timestamp: new Date().toISOString()
    }
  });
}
```

### Phase 6: Session Preservation for Booking Flow

**Challenge**: In MPA, when a user clicks "Login" during booking, they should return to the same step after authentication.

**Solution**: Use `returnTo` parameter

```typescript
// In booking pages (traveller-details, payment, etc.)
<LoginButton returnTo={window.location.pathname + window.location.search} />
```

The Auth0 SDK will automatically redirect back after login.

### Phase 7: Environment Configuration

Ensure `.env.local` has:

```bash
AUTH0_ISSUER_BASE_URL=https://dev-q6p3jrm5pbykuq23.us.auth0.com
AUTH0_CLIENT_ID=your_client_id
AUTH0_CLIENT_SECRET=your_client_secret
AUTH0_BASE_URL=http://localhost:3000
AUTH0_SECRET=your_random_secret_32_chars
AUTH0_AUDIENCE=your_audience
AUTH0_SCOPE=openid profile email
```

## Testing Checklist

- [ ] Login from homepage
- [ ] Login from booking flow (should return to same page)
- [ ] Logout functionality
- [ ] Profile dropdown displays user info
- [ ] Protected routes redirect to login
- [ ] User data appears in analytics events
- [ ] Session persists across page navigations
- [ ] Login/logout events tracked in data layer

## Key Differences from SPA

| Feature | SPA (React) | MPA (Next.js) |
|---------|-------------|---------------|
| Package | `@auth0/auth0-react` | `@auth0/nextjs-auth0` |
| Provider | `<Auth0Provider>` in App.js | API routes handle auth |
| State Management | React Context | Server-side sessions |
| Protected Routes | React Router guards | `withPageAuthRequired` |
| Redirect Handling | React Router | Next.js router |
| Session Storage | localStorage | HTTP-only cookies (secure) |

## Advantages of MPA Auth

1. **Server-Side Sessions**: More secure (HTTP-only cookies)
2. **No Client-Side Tokens**: Reduced XSS risk
3. **Automatic CSRF Protection**: Built into Next.js
4. **SEO Friendly**: Server-rendered protected content
5. **Simpler State Management**: No need for React Context

## Next Steps

1. Enable Auth0 API route
2. Create auth components
3. Update header with login/profile UI
4. Add analytics tracking for auth events
5. Test complete auth flow
6. Document for team

## Notes

- The MPA approach is actually simpler than SPA for auth
- No need to manage tokens client-side
- Session is handled automatically by Next.js
- returnTo parameter handles booking flow preservation
