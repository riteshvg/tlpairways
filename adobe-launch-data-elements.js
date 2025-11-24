/**
 * Adobe Launch Data Element Code Snippets
 * Ready-to-use code for creating data elements that access userData
 */

// ============================================
// DATA ELEMENT: User ID (Hashed)
// ============================================
// Returns the hashed user ID or 'anonymous' for non-authenticated users
return window._adobeDataLayerState?.userData?.hashedUserId || 'anonymous';


// ============================================
// DATA ELEMENT: Is User Authenticated
// ============================================
// Returns true if user is authenticated, false otherwise
return window._adobeDataLayerState?.userData?.isAuthenticated || false;


// ============================================
// DATA ELEMENT: User Segment
// ============================================
// Returns user segment (anonymous, authenticated, new-user, etc.)
return window._adobeDataLayerState?.userData?.userSegment || 'anonymous';


// ============================================
// DATA ELEMENT: Loyalty Tier
// ============================================
// Returns user's loyalty tier
return window._adobeDataLayerState?.userData?.loyaltyTier || 'none';


// ============================================
// DATA ELEMENT: Email Domain
// ============================================
// Returns email domain (for segmentation, not PII)
return window._adobeDataLayerState?.userData?.emailDomain || 'unknown';


// ============================================
// DATA ELEMENT: Is Email Verified
// ============================================
// Returns whether user's email is verified
return window._adobeDataLayerState?.userData?.isEmailVerified || false;


// ============================================
// DATA ELEMENT: Login Count
// ============================================
// Returns number of times user has logged in
return window._adobeDataLayerState?.userData?.loginCount || 0;


// ============================================
// DATA ELEMENT: Registration Date
// ============================================
// Returns user's registration date (ISO format)
return window._adobeDataLayerState?.userData?.registrationDate || null;


// ============================================
// DATA ELEMENT: Last Login
// ============================================
// Returns user's last login timestamp
return window._adobeDataLayerState?.userData?.lastLogin || null;


// ============================================
// DATA ELEMENT: Complete User Data Object
// ============================================
// Returns the entire userData object with fallback
var userData = window._adobeDataLayerState?.userData;

// Fallback: search data layer array if not in computed state
if (!userData && window.adobeDataLayer && window.adobeDataLayer.length > 0) {
    for (var i = window.adobeDataLayer.length - 1; i >= 0; i--) {
        if (window.adobeDataLayer[i].userData) {
            userData = window.adobeDataLayer[i].userData;
            break;
        }
    }
}

// Return userData or safe default
return userData || {
    hashedUserId: 'anonymous',
    isAuthenticated: false,
    userSegment: 'anonymous',
    loyaltyTier: 'none',
    emailDomain: 'unknown',
    isEmailVerified: false,
    loginCount: 0,
    registrationDate: null,
    lastLogin: null
};


// ============================================
// DATA ELEMENT: User Type (Simple)
// ============================================
// Returns 'authenticated' or 'anonymous'
return window._adobeDataLayerState?.userData?.isAuthenticated ? 'authenticated' : 'anonymous';


// ============================================
// DATA ELEMENT: User ID for Analytics (Safe)
// ============================================
// Returns hashed user ID for authenticated users, 'anonymous' otherwise
// This is safe to send to analytics tools
var userData = window._adobeDataLayerState?.userData;
if (userData && userData.isAuthenticated && userData.hashedUserId) {
    return userData.hashedUserId;
}
return 'anonymous';


// ============================================
// DATA ELEMENT: User Loyalty Status (Boolean)
// ============================================
// Returns true if user has any loyalty tier (not 'none')
var loyaltyTier = window._adobeDataLayerState?.userData?.loyaltyTier;
return loyaltyTier && loyaltyTier !== 'none';


// ============================================
// DATA ELEMENT: Days Since Registration
// ============================================
// Calculates days since user registered
var regDate = window._adobeDataLayerState?.userData?.registrationDate;
if (!regDate) return null;

try {
    var registered = new Date(regDate);
    var now = new Date();
    var diffTime = Math.abs(now - registered);
    var diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
} catch (error) {
    return null;
}


// ============================================
// DATA ELEMENT: User Value Segment
// ============================================
// Returns user value segment based on loyalty tier and login count
var userData = window._adobeDataLayerState?.userData;
if (!userData || !userData.isAuthenticated) {
    return 'anonymous';
}

var tier = userData.loyaltyTier || 'none';
var loginCount = userData.loginCount || 0;

if (tier === 'platinum' || tier === 'gold') {
    return 'high-value';
} else if (tier === 'silver' || loginCount > 10) {
    return 'medium-value';
} else if (loginCount > 0) {
    return 'low-value';
} else {
    return 'new-user';
}


// ============================================
// DATA ELEMENT: User Engagement Level
// ============================================
// Returns engagement level based on login count
var loginCount = window._adobeDataLayerState?.userData?.loginCount || 0;

if (loginCount === 0) return 'new';
if (loginCount <= 3) return 'low';
if (loginCount <= 10) return 'medium';
if (loginCount <= 25) return 'high';
return 'very-high';


// ============================================
// CONDITION: Is Authenticated User
// ============================================
// Use in rules to check if user is authenticated
// Returns true/false
return window._adobeDataLayerState?.userData?.isAuthenticated === true;


// ============================================
// CONDITION: Is Anonymous User
// ============================================
// Use in rules to check if user is anonymous
// Returns true/false
return window._adobeDataLayerState?.userData?.isAuthenticated !== true;


// ============================================
// CONDITION: Has Loyalty Tier
// ============================================
// Use in rules to check if user has a loyalty tier
// Returns true/false
var tier = window._adobeDataLayerState?.userData?.loyaltyTier;
return tier && tier !== 'none';


// ============================================
// CONDITION: Is New User (< 7 days)
// ============================================
// Use in rules to check if user registered within last 7 days
var regDate = window._adobeDataLayerState?.userData?.registrationDate;
if (!regDate) return false;

try {
    var registered = new Date(regDate);
    var now = new Date();
    var diffDays = Math.floor((now - registered) / (1000 * 60 * 60 * 24));
    return diffDays <= 7;
} catch (error) {
    return false;
}


// ============================================
// ADVANCED: Custom User Property
// ============================================
// Template for accessing any custom user property
// Replace 'propertyName' with your actual property name
var propertyName = 'yourPropertyName'; // Change this
var defaultValue = null; // Change this

return window._adobeDataLayerState?.userData?.[propertyName] || defaultValue;
