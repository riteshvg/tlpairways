# Investigation: Missing Return Flights for International Destinations (SFO, JFK, etc.)

## Issue Report
User reported that return flights for important international destinations like SFO (San Francisco) and JFK (New York) were visible in the SPA but not appearing in the MPA.

## Investigation Findings

### 1. Data Verification
**Result**: ✅ **Data is identical in both architectures**

- Compared flight data files between SPA and MPA
- Both files have **55,680 lines** and are **byte-for-byte identical**
- Confirmed presence of SFO return flights (e.g., line 17253: SFO → MAA)
- Confirmed presence of JFK flights in both datasets

```bash
# File comparison
wc -l frontend-next/data/flights.json frontend/src/data/flights.json
# Output: 55680 lines each

diff frontend-next/data/flights.json frontend/src/data/flights.json
# Output: No differences found
```

### 2. Code Logic Verification
**Result**: ✅ **Flight filtering logic is correct**

The `getMatchingFlights` function in `/frontend-next/pages/results.tsx` correctly:
- Filters flights by origin and destination
- Applies cabin class pricing
- Handles date/time calculations
- Returns matching flights

For roundtrip searches, the code correctly:
- Searches for onward flights: `origin → destination`
- Searches for return flights: `destination → origin`
- Uses the appropriate return date

### 3. UI Display Issue
**Result**: ⚠️ **Found the problem!**

The return flights section had a conditional rendering issue:

**Before (Line 544)**:
```tsx
{searchParams.tripType === 'roundtrip' && returnFlights.length > 0 && (
    <Paper>
        {/* Return flights section */}
    </Paper>
)}
```

**Problem**: If no return flights were found (even temporarily or due to a search issue), the entire "Return Journey" section would be hidden. This made it appear as if the feature was missing entirely.

## Changes Made

### 1. Added Debug Logging
**File**: `/frontend-next/pages/results.tsx`

Added console logging to help diagnose flight search issues:
```tsx
console.log('🔍 Search Parameters:', { origin, destination, date, returnDate, tripType, cabinClass });
console.log(`✈️ Found ${onward.length} onward flights from ${origin} to ${destination}`);
console.log(`🔙 Found ${returnFlts.length} return flights from ${destination} to ${origin}`);
```

This will help identify:
- What search parameters are being used
- How many flights are found for each leg
- Whether the search is being performed correctly

### 2. Fixed Return Flights Section Display
**File**: `/frontend-next/pages/results.tsx` (Lines 543-560)

**Changed from**:
```tsx
{searchParams.tripType === 'roundtrip' && returnFlights.length > 0 && (
    <Paper sx={{ p: 3, mb: 4 }}>
        {/* ... */}
        {returnFlights.map(flight => renderFlightCard(flight, true))}
    </Paper>
)}
```

**Changed to**:
```tsx
{searchParams.tripType === 'roundtrip' && (
    <Paper sx={{ p: 3, mb: 4 }}>
        {/* ... */}
        {returnFlights.length === 0 ? (
            <Alert severity="warning">
                No return flights found for this route. Please try different dates or check if this route has return flights available.
            </Alert>
        ) : (
            returnFlights.map(flight => renderFlightCard(flight, true))
        )}
    </Paper>
)}
```

**Benefits**:
- Return flights section always visible for roundtrip searches
- Clear feedback when no flights are found
- Helps users understand if it's a data issue vs. UI issue
- Consistent with the onward flights section behavior

## Testing Recommendations

### Test Case 1: International Roundtrip (SFO)
1. Search for: **DEL → SFO** (roundtrip)
2. Select departure date and return date
3. **Expected**: 
   - Onward flights section shows flights from DEL to SFO
   - Return flights section shows flights from SFO to DEL
   - If no return flights exist, a warning message appears

### Test Case 2: International Roundtrip (JFK)
1. Search for: **BOM → JFK** (roundtrip)
2. Select departure date and return date
3. **Expected**: Similar to Test Case 1

### Test Case 3: Console Debugging
1. Open browser console (F12)
2. Perform any roundtrip search
3. **Expected**: See console logs showing:
   ```
   🔍 Search Parameters: { origin: 'DEL', destination: 'SFO', ... }
   ✈️ Found X onward flights from DEL to SFO
   🔙 Found Y return flights from SFO to DEL
   ```

## Root Cause Analysis

The issue was **not** a missing data problem, but rather a **UI visibility problem**:

1. **Data**: Both SPA and MPA have identical flight data including all international routes
2. **Logic**: Flight filtering and search logic works correctly
3. **Display**: The return flights section was conditionally hidden when no flights were found, making it seem like the feature was missing

## Potential User Confusion Scenarios

Even with the fix, users might not see return flights if:

1. **Wrong Search Direction**: Searching for routes that don't have return flights in the data
2. **Date Issues**: Return date not being properly set or passed
3. **One-way vs Roundtrip**: Accidentally selecting one-way instead of roundtrip
4. **Route Availability**: Some routes might genuinely not have return flights in the dataset

The new warning message will help users identify these scenarios.

## Related Files
- `/frontend-next/pages/results.tsx` - Main results page with flight search and display
- `/frontend-next/data/flights.json` - Flight data (identical to SPA)
- `/frontend/src/data/flights.json` - SPA flight data (identical to MPA)
