# Duplicate Purchase Event Troubleshooting Guide

## Issue
Two identical `commerce.purchases` interact calls are firing on the confirmation page, 48ms apart.

## Evidence
```
First call:  08:37:25.206Z
Second call: 08:37:25.254Z
Difference:  48ms
```

Both calls have identical data including:
- `eVar32: "Booking Confirmed Rule"`
- Same product list items
- Same transaction details
- Same timestamps (within 48ms)

## Root Causes (Possible)

### 1. Code-Level Duplicate (FIXED ✅)
**Problem**: Purchase event being pushed to data layer multiple times from code.

**Solution Applied**:
- Added `hasPushedPurchase.current` ref to prevent duplicate pushes
- Guard condition: `!hasPushedPurchase.current` before pushing
- This ensures only ONE push from our code

### 2. Adobe Launch Rule Duplication (LIKELY CAUSE ⚠️)
**Problem**: Adobe Launch has a rule that's firing twice for the same event.

**Evidence**:
- Both calls have `eVar32: "Booking Confirmed Rule"` 
- This indicates an Adobe Launch rule named "Booking Confirmed Rule"
- The rule might be configured to fire on multiple triggers

**How to Check**:
1. Go to Adobe Launch (tags.adobe.com)
2. Find the rule named "Booking Confirmed Rule"
3. Check its triggers/conditions
4. Look for:
   - Multiple event listeners for the same event
   - Rule firing on both "Data Layer Push" AND "Page Load"
   - Duplicate conditions that both evaluate to true

**Common Causes**:
- Rule listens to both `purchase` event AND `commerce.purchases` event type
- Rule has multiple triggers that both fire on confirmation page
- Rule is set to fire on "All Pages" AND has a specific confirmation page trigger

### 3. Data Layer Event Bubbling
**Problem**: Adobe Data Layer might be processing the same event twice.

**How to Check**:
1. Open browser console on confirmation page
2. Run: `adobeDataLayer.getState()`
3. Check if purchase event appears multiple times
4. Run: `adobeDataLayer.addEventListener('adobeDataLayer:event', console.log)`
5. See if same event fires twice

## Recommended Actions

### Immediate (Code - Already Done ✅)
- [x] Added `hasPushedPurchase` ref
- [x] Guard condition before push
- [x] Deployed to production

### Adobe Launch Configuration (TODO)
1. **Review "Booking Confirmed Rule"**:
   - Go to Rules in Adobe Launch
   - Find "Booking Confirmed Rule"
   - Check "Events" section
   - Ensure only ONE event trigger exists
   - Common fix: Remove duplicate event listeners

2. **Check Rule Conditions**:
   - Ensure conditions don't overlap
   - Use "OR" logic carefully
   - Verify page-specific conditions

3. **Review Data Element Usage**:
   - Check if data elements are causing re-evaluation
   - Ensure data elements aren't triggering rule twice

4. **Test in Adobe Launch Debugger**:
   - Install Adobe Experience Platform Debugger extension
   - Load confirmation page
   - Check "Rules Fired" section
   - See if "Booking Confirmed Rule" fires twice

### Verification Steps
After making changes:

1. **Clear Data Layer**:
   ```javascript
   // In console before testing
   delete window.adobeDataLayer;
   location.reload();
   ```

2. **Monitor Events**:
   ```javascript
   // Add listener before page load
   window.adobeDataLayer = window.adobeDataLayer || [];
   window.adobeDataLayer.addEventListener('adobeDataLayer:event', (e) => {
     if (e.event === 'purchase') {
       console.log('Purchase event fired:', new Date().toISOString(), e);
     }
   });
   ```

3. **Check Network Tab**:
   - Filter for `interact` calls
   - Should see only ONE call with `commerce.purchases`
   - Verify timestamp is unique

## Expected Behavior
✅ **Single Interact Call**:
- One `commerce.purchases` event
- Fired once per page load
- Contains complete transaction data
- Timestamp unique

## Current Status
- ✅ Code-level protection added
- ⚠️ Adobe Launch rule needs review
- 🔍 Awaiting verification after deployment

## Next Steps
1. Deploy code fix (Done)
2. Test on production
3. If still seeing duplicates:
   - Review Adobe Launch "Booking Confirmed Rule"
   - Check for duplicate event triggers
   - Verify rule conditions
   - Test with Adobe Debugger

## Contact Points
- **Code Issues**: Check `frontend-next/pages/confirmation.tsx`
- **Adobe Launch**: Check "Booking Confirmed Rule" in Launch UI
- **Data Layer**: Check `window.adobeDataLayer` in console
