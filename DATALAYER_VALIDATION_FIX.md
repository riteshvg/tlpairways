# Adobe Data Layer Validation Fix

## Issue
When loading the homepage, Adobe Launch was attempting to push **functions** to the data layer (for event listeners), but our validation code was blocking them with errors:

```
❌ BLOCKED: Attempted to push invalid item to adobeDataLayer: ƒ (e){e.addEventListener(o,s,c)}
```

## Root Cause
The validation code in `index.html` was checking:
```javascript
if (item === null || item === undefined || typeof item !== 'object')
```

This blocked functions because `typeof function === 'function'`, not `'object'`.

## Adobe Data Layer Standard Behavior
According to Adobe's Data Layer specification, the data layer can accept:
1. **Objects** - Data events (e.g., `{ event: 'pageView', pageData: {...} }`)
2. **Functions** - Event listeners (e.g., `function(dl) { dl.addEventListener(...) }`)

## Solution
Updated the validation to allow both objects AND functions:

```javascript
// Allow objects AND functions (Adobe Launch uses functions for event listeners)
// Only block null, undefined, primitives (strings, numbers, booleans)
if (item === null || item === undefined) {
  console.error('❌ BLOCKED: Attempted to push null/undefined to adobeDataLayer');
  continue;
}
if (typeof item !== 'object' && typeof item !== 'function') {
  console.error('❌ BLOCKED: Attempted to push primitive to adobeDataLayer:', item);
  continue;
}
```

## What's Now Allowed
✅ **Objects** - Data events
✅ **Functions** - Event listeners (Adobe Launch standard)

## What's Still Blocked
❌ **null** - Invalid
❌ **undefined** - Invalid
❌ **Primitives** - Strings, numbers, booleans (invalid)

## File Modified
- `/frontend/public/index.html` (lines 84-102)

## Testing
After this fix:
1. Reload the homepage
2. Check browser console
3. The "BLOCKED" errors should be gone
4. Adobe Launch should load normally
5. Event listeners should work correctly

## Impact
- ✅ Adobe Launch can now register event listeners
- ✅ Data layer validation still prevents invalid data
- ✅ No breaking changes to existing functionality
- ✅ Follows Adobe Data Layer standards

## Related Documentation
- Adobe Data Layer Specification: https://github.com/adobe/adobe-client-data-layer
- Adobe Launch Event Listeners: Uses functions to register callbacks
