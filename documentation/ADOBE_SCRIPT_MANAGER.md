# Adobe Launch Script Manager

## 📋 Overview

The Adobe Launch Script Manager is a powerful feature that allows users to dynamically switch between different Adobe Experience Platform Data Collection (Launch) environments without code changes or redeployment.

## ✨ Features

### 1. **Dynamic Script Loading**
- Scripts are loaded from localStorage preference
- Fallback to default if custom script fails
- No code changes needed to switch environments

### 2. **Environment Presets**
Quick-switch buttons for common environments:
- **Development** - For testing and debugging
- **Staging** - For pre-production testing
- **Production** - For live environment

### 3. **Custom Script Support**
- Enter any valid Adobe DTM script URL
- Real-time URL validation
- Monospace font for easy reading/editing

### 4. **User-Friendly Interface**
- Beautiful gradient design with purple theme
- Environment badges (color-coded)
- Copy-to-clipboard functionality
- Real-time validation feedback

### 5. **Safety Features**
- URL validation (HTTPS, .js file, Adobe domain)
- Fallback mechanism if script fails to load
- Clear instructions about page reload requirement

## 🎯 Use Cases

### For Developers
```
Development → Staging → Production
Test in dev environment, then switch to staging for QA,
finally switch to production when ready.
```

### For QA Teams
```
Quickly switch between environments to test:
- Different rule configurations
- A/B testing scenarios
- Data element variations
```

### For Marketing Teams
```
Test different tracking implementations:
- Campaign tracking rules
- Custom conversion events
- Analytics variable configurations
```

## 📖 How to Use

### Step 1: Navigate to Settings
1. Log in to your account
2. Go to **Settings** page from the navigation menu
3. You'll see the **Adobe Launch Script Manager** at the top

### Step 2: Choose Your Method

#### Method A: Quick Presets (Easiest)
```
1. Click one of the preset buttons:
   - Development
   - Staging  
   - Production
2. Click "Save Script"
3. Reload the page
```

#### Method B: Custom Script URL
```
1. Paste your custom Adobe Launch URL in the text field
2. URL will be validated in real-time
3. Click "Save Script" (disabled if URL is invalid)
4. Reload the page
```

### Step 3: Verify
```
1. After reload, check browser console:
   ✅ Adobe Launch script loaded: [your-url]
   
2. Verify environment badge shows correct environment
```

## 🔧 Technical Implementation

### Architecture

```
┌─────────────────────────────────────────┐
│          User Interface                 │
│  (Settings Page - Script Manager)       │
└────────────┬────────────────────────────┘
             │
             │ saves to
             ▼
┌─────────────────────────────────────────┐
│          localStorage                   │
│  Key: tlairways_adobe_script_url        │
└────────────┬────────────────────────────┘
             │
             │ read by
             ▼
┌─────────────────────────────────────────┐
│      index.html (on page load)          │
│  - Checks localStorage                  │
│  - Loads custom or default script       │
│  - Has fallback mechanism               │
└─────────────────────────────────────────┘
```

### Files Modified

#### 1. `frontend/src/utils/adobeScriptManager.js`
**New utility file** with functions:

```javascript
// Get current script URL
getCurrentAdobeScriptUrl()

// Save new script URL  
saveAdobeScriptUrl(url)

// Reset to default
resetToDefaultAdobeScript()

// Validate URL format
validateAdobeScriptUrl(url)

// Detect environment
detectAdobeEnvironment(url)

// Preset URLs
ADOBE_SCRIPT_PRESETS = {
  development: '...',
  staging: '...',
  production: '...'
}
```

#### 2. `frontend/src/pages/SettingsPage.js`
**Enhanced with**:
- New state management for Adobe script preferences
- Adobe Script Manager UI section (at top)
- Event handlers for script management
- Real-time validation
- Environment detection

#### 3. `frontend/public/index.html`
**Updated script loading**:
```javascript
// Before (hardcoded):
<script src="https://assets.adobedtm.com/.../launch-development.min.js"></script>

// After (dynamic):
<script>
  var scriptUrl = localStorage.getItem('tlairways_adobe_script_url') || defaultUrl;
  // Load script dynamically with fallback
</script>
```

### Data Storage

**localStorage Key**: `tlairways_adobe_script_url`

**Value**: Full Adobe Launch script URL
```
Example:
https://assets.adobedtm.com/01296dd00565/26201e3c8f15/launch-staging.min.js
```

## 🎨 UI Components

### Current Environment Badge
```jsx
<Chip 
  label={environment.toUpperCase()}
  color={
    production: 'success',
    staging: 'warning',
    development: 'info',
    custom: 'default'
  }
/>
```

### Script URL Input
- Monospace font for readability
- Real-time validation
- Copy button with visual feedback
- Error messages below input

### Quick Preset Buttons
- Highlighted when active
- One-click environment switching
- Updates URL field automatically

### Action Buttons
- **Save Script** - Saves to localStorage
- **Reset to Default** - Clears custom preference

## ⚠️ Important Notes

### Page Reload Required
```
Adobe Launch scripts load during initial page load.
After saving a new script, you MUST reload the page
for changes to take effect.
```

### URL Validation Rules
```
✅ Must start with https://
✅ Must contain 'adobedtm.com'  
✅ Must end with .js
❌ HTTP not allowed
❌ Non-Adobe domains not allowed
```

### Fallback Mechanism
```
If custom script fails to load:
1. Error is logged to console
2. Default development script is attempted
3. User is notified of the issue
```

## 🧪 Testing Checklist

- [ ] Switch to development environment
- [ ] Switch to staging environment
- [ ] Switch to production environment
- [ ] Enter custom valid URL
- [ ] Enter invalid URL (see validation error)
- [ ] Copy URL to clipboard
- [ ] Reset to default
- [ ] Verify script loads after reload
- [ ] Check console for success message
- [ ] Verify environment badge updates

## 🔐 Security Considerations

### 1. **URL Validation**
Only Adobe DTM URLs are allowed:
```javascript
if (!url.includes('adobedtm.com')) {
  return { isValid: false, error: 'Must be from Adobe DTM domain' };
}
```

### 2. **HTTPS Only**
```javascript
if (!url.startsWith('https://')) {
  return { isValid: false, error: 'Must use HTTPS' };
}
```

### 3. **CSP Compliance**
Content Security Policy already includes:
```html
script-src 'self' ... https://assets.adobedtm.com https://*.adobedtm.com;
```

### 4. **XSS Protection**
- No direct HTML injection
- Script URLs are validated before use
- Script tags created via DOM API (not innerHTML)

## 📊 Benefits

### For Development Teams
✅ **No Deployments** - Switch environments without code changes  
✅ **Faster Testing** - Quick environment switching  
✅ **Flexible** - Support for custom scripts

### For Business Users
✅ **Self-Service** - No developer needed to switch environments  
✅ **Safe** - Validation prevents invalid configurations  
✅ **Visual** - Clear feedback on current environment

### For QA Teams
✅ **Easy Testing** - Test multiple environments quickly  
✅ **Traceable** - Environment badge shows current state  
✅ **Reliable** - Fallback if custom script fails

## 🚀 Future Enhancements

### Planned Features
1. **Script History** - Track previously used scripts
2. **Team Presets** - Share common script URLs across team
3. **Auto-Reload** - Optional automatic page reload after save
4. **Script Testing** - Test script validity before saving
5. **Environment Profiles** - Save multiple named configurations

### Potential Integrations
- **Adobe Experience Platform** - Direct integration with AEP environments
- **Version Control** - Track which script versions were used
- **Analytics Dashboard** - Show which environments are most used

## 📝 Troubleshooting

### Issue: Script Not Changing After Save

**Solution:**
```
1. Verify save was successful (green notification)
2. Hard reload the page (Cmd+Shift+R on Mac, Ctrl+Shift+R on Windows)
3. Check browser console for script load message
4. Verify localStorage value: localStorage.getItem('tlairways_adobe_script_url')
```

### Issue: Invalid URL Error

**Solution:**
```
1. Ensure URL starts with https://
2. Ensure URL is from assets.adobedtm.com domain
3. Ensure URL ends with .js
4. Copy URL directly from Adobe Launch interface
```

### Issue: Script Fails to Load

**Solution:**
```
1. Check network tab in DevTools
2. Verify URL is accessible
3. Check CSP errors in console
4. Try using a preset (Development/Staging/Production)
5. Reset to default and try again
```

## 🎥 Video Demo Script (for YouTube)

```
Scene 1: Introduction
"Today I'm showing you a powerful feature that lets you switch 
between Adobe Launch environments without touching code..."

Scene 2: Navigate to Settings
"First, log in and go to Settings. You'll see the Adobe Launch 
Script Manager right at the top..."

Scene 3: Show Current State
"Here you can see we're currently on the Development environment.
The script URL is shown here in monospace font..."

Scene 4: Quick Switch Demo
"Let's switch to Production with one click... Save... 
and reload the page. Notice the environment badge now shows 
PRODUCTION and our Adobe Launch script has changed..."

Scene 5: Custom URL Demo
"You can also paste any custom Adobe Launch URL. As you type,
it validates in real-time. Invalid URLs will disable the Save button..."

Scene 6: Reset Demo
"If you want to go back to default, just click Reset to Default.
Simple and safe..."

Scene 7: Conclusion
"This feature is perfect for testing, QA, and seamless environment 
transitions. No deployments needed!"
```

## 📚 References

- [Adobe Launch Documentation](https://experienceleague.adobe.com/docs/launch.html)
- [Adobe Experience Platform Data Collection](https://experienceleague.adobe.com/docs/experience-platform/tags/home.html)
- [Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)

---

**Created:** October 16, 2025  
**Last Updated:** October 16, 2025  
**Version:** 1.0.0

