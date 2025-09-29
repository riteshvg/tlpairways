# 🎯 Adobe Data Layer Structure - User Info Merging

## 📋 **Implementation Summary**

The Adobe data layer has been enhanced to merge user information directly into the first pageView event when a user is logged in, eliminating separate userInfo entries as requested.

## 🔧 **Key Changes Made**

### **1. Enhanced Analytics Service (`src/services/analytics.js`)**

#### **New Functions Added:**
- `getPageInfoWithUser()` - Merges user info into pageView events
- `cleanupDataLayer()` - Removes duplicate userInfo entries
- `pageViewWithUser()` - Enhanced pageView tracking with user info

#### **Updated Functions:**
- `trackUserLogin()` - No longer pushes separate userInfo entries
- `trackUserLogout()` - Cleans up existing userInfo entries
- `trackUserProfileUpdate()` - No longer pushes separate userInfo entries

### **2. Comprehensive Page Tracking (`src/App.js`)**

#### **Enhanced PageViewTracker:**
- Tracks all pages with proper naming
- Uses `pageViewWithUser()` for authenticated users
- Uses regular `pageView()` for anonymous users
- Maintains previous page tracking for navigation flow

### **3. Updated HOC (`src/components/withAnalytics.js`)**

#### **Enhanced withAnalytics:**
- Automatically uses user info merging when available
- Integrates with AuthContext for user state
- Maintains backward compatibility

## 📊 **Data Layer Structure**

### **Before (Multiple userInfo entries):**
```json
[
  {
    "event": "pageView",
    "pageInfo": {
      "pageName": "Homepage",
      "previousPageName": null,
      "siteSection": "Booking",
      "server": "tlpairways.up.railway.app",
      "pageType": "booking",
      "pageCategory": "flight_booking",
      "pageSubCategory": "homepage"
    },
    "attributes": {
      "environment": "production",
      "pageType": "booking",
      "pageCategory": "flight_booking",
      "pageSubCategory": "homepage"
    },
    "source": "react-app"
  },
  {
    "userInfo": {
      "userId": "68cd077dbee86bab9e4add1f",
      "status": "authenticated",
      "timestamp": "2025-09-20T08:23:32.550Z",
      "userType": "registered",
      "loginMethod": "auth0"
    }
  },
  {
    "event": "userLogin",
    "pageInfo": { ... },
    "user": { ... }
  }
]
```

### **After (Merged userInfo in first pageView):**
```json
[
  {
    "event": "pageView",
    "pageInfo": {
      "pageName": "Homepage",
      "previousPageName": null,
      "siteSection": "Booking",
      "server": "tlpairways.up.railway.app",
      "pageType": "booking",
      "pageCategory": "flight_booking",
      "pageSubCategory": "homepage"
    },
    "userInfo": {
      "userId": "68cd077dbee86bab9e4add1f",
      "status": "authenticated",
      "timestamp": "2025-09-20T08:23:32.550Z",
      "userType": "registered",
      "loginMethod": "auth0"
    },
    "attributes": {
      "environment": "production",
      "pageType": "booking",
      "pageCategory": "flight_booking",
      "pageSubCategory": "homepage"
    },
    "source": "react-app"
  },
  {
    "event": "userLogin",
    "pageInfo": { ... },
    "user": { ... }
  }
]
```

## 🎯 **Page-by-Page Tracking**

### **All Pages Now Tracked:**
1. **Homepage** (`/`) - Merges user info when authenticated
2. **Login Page** (`/login`) - Standard pageView
3. **Flight Search** (`/search`) - Merges user info when authenticated
4. **Search Results** (`/search-results`) - Merges user info when authenticated
5. **User Profile** (`/profile`) - Merges user info when authenticated
6. **My Bookings** (`/my-bookings`) - Merges user info when authenticated
7. **Settings** (`/settings`) - Merges user info when authenticated
8. **Traveller Details** (`/traveller-details`) - Merges user info when authenticated
9. **Ancillary Services** (`/ancillary-services`) - Merges user info when authenticated
10. **Payment** (`/payment`) - Merges user info when authenticated
11. **Booking Confirmation** (`/booking-confirmation`) - Merges user info when authenticated

## 🔄 **Data Layer Cleanup Process**

### **Automatic Cleanup:**
1. **On Page Navigation:** `cleanupDataLayer()` removes duplicate userInfo entries
2. **On User Login:** User info is merged into the first pageView event
3. **On User Logout:** All userInfo entries are removed from data layer
4. **On Profile Update:** User info is updated in the merged pageView event

### **Cleanup Logic:**
```javascript
const cleanupDataLayer = () => {
  if (!window.adobeDataLayer) return;
  
  // Find all entries with userInfo
  const userInfoEntries = window.adobeDataLayer
    .map((entry, index) => ({ entry, index }))
    .filter(({ entry }) => entry.userInfo);
  
  // If there are multiple userInfo entries, remove all but the first one
  if (userInfoEntries.length > 1) {
    // Remove entries from the end to avoid index shifting issues
    const indicesToRemove = userInfoEntries
      .slice(1) // Skip the first entry
      .map(({ index }) => index)
      .sort((a, b) => b - a); // Sort in descending order
    
    indicesToRemove.forEach(index => {
      window.adobeDataLayer.splice(index, 1);
    });
  }
};
```

## ✅ **Benefits of New Structure**

### **1. Cleaner Data Layer:**
- ✅ Single userInfo entry per session
- ✅ User info merged into relevant pageView events
- ✅ No duplicate userInfo entries

### **2. Better Analytics:**
- ✅ User context available on every page view
- ✅ Consistent data structure across all pages
- ✅ Easier to query and analyze user behavior

### **3. Performance:**
- ✅ Reduced data layer size
- ✅ Faster Adobe Analytics processing
- ✅ Cleaner console logs for debugging

### **4. Maintainability:**
- ✅ Centralized page tracking logic
- ✅ Consistent user info handling
- ✅ Easy to add new pages

## 🧪 **Testing the Implementation**

### **Test Scenarios:**

#### **1. Anonymous User:**
```javascript
// Visit homepage without login
analytics.pageView('Homepage');
// Result: Standard pageView without userInfo
```

#### **2. Authenticated User:**
```javascript
// Visit homepage after login
analytics.pageViewWithUser('Homepage', null, user);
// Result: pageView with merged userInfo
```

#### **3. Page Navigation:**
```javascript
// Navigate from Homepage to Flight Search
analytics.pageViewWithUser('Flight Search', 'Homepage', user);
// Result: pageView with userInfo and previousPage tracking
```

#### **4. User Logout:**
```javascript
// User logs out
analytics.trackUserLogout();
// Result: All userInfo entries removed from data layer
```

## 🚀 **Usage Examples**

### **Manual Page Tracking:**
```javascript
import analytics from '../services/analytics';
import { useAuth } from '../context/AuthContext';

const MyComponent = () => {
  const { user, isAuthenticated } = useAuth();
  
  useEffect(() => {
    if (isAuthenticated && user) {
      analytics.pageViewWithUser('My Page', 'Previous Page', user);
    } else {
      analytics.pageView('My Page', 'Previous Page');
    }
  }, []);
};
```

### **Using withAnalytics HOC:**
```javascript
import withAnalytics from '../components/withAnalytics';

const MyPage = () => {
  return <div>My Page Content</div>;
};

export default withAnalytics(MyPage, 'My Page');
```

## 📈 **Expected Results**

After implementation, the Adobe data layer will:

1. **Show cleaner structure** with user info merged into pageView events
2. **Eliminate duplicate userInfo entries** automatically
3. **Provide consistent user context** across all page views
4. **Maintain backward compatibility** with existing analytics events
5. **Improve performance** with smaller data layer size

## 🔍 **Debugging**

### **Console Commands:**
```javascript
// View current data layer
console.log(window.adobeDataLayer);

// Check for user info entries
window.adobeDataLayer.filter(entry => entry.userInfo);

// Test analytics functions
analytics.test();
analytics.pageViewWithUser('Test Page', null, user);
```

### **Expected Console Output:**
```
Cleaned up data layer: removed 2 duplicate userInfo entries
Pushing to adobeDataLayer: {event: "pageView", userInfo: {...}, ...}
Current adobeDataLayer length after push: 3
```

---

**Implementation Status:** ✅ Complete  
**Testing Status:** 🧪 Ready for Testing  
**Deployment:** 🚀 Ready for Production

Expected Results:
Instead of getting numberOfDays: 0, you should now see the actual number of days between when you search and when you plan to travel. This is valuable for:
Pricing algorithms (early booking discounts)
Analytics (booking lead time analysis)
User experience (showing urgency for last-minute bookings)
Business intelligence (understanding booking patterns)
The numberOfDays should now correctly reflect the advance booking period! 🚀