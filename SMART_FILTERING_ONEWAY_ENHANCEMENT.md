# Smart Destination Filtering - Enhanced for One-Way Flights

## Update Summary
Extended the smart destination filtering feature to work for **both one-way and roundtrip** flights, preventing users from selecting unavailable routes.

## Previous Behavior
- **Roundtrip**: Filtered destinations to show only those with return flights ✅
- **One-Way**: Showed all destinations, even if no flights available ❌

## New Behavior
- **Roundtrip**: Filters destinations to show only those with BOTH onward and return flights ✅
- **One-Way**: Filters destinations to show only those with onward flights available ✅

## Problem Solved

### Example: HYD → ATQ
Previously, users could select:
- **From**: HYD (Hyderabad)
- **To**: ATQ (Amritsar)
- **Trip Type**: One Way

But there are no direct flights from HYD to ATQ, leading to:
- Empty results page
- Frustrated users
- Wasted time

### Now:
- ATQ won't appear in the destination dropdown when HYD is selected
- Users can only select destinations with available flights
- Clear feedback: "Only showing destinations with available flights"

## Implementation Details

### 1. Enhanced Filtering Logic

```typescript
const getAvailableDestinations = (): Airport[] => {
    if (!origin) return getUniqueLocations();

    const allAirports = getUniqueLocations();
    let filtered = allAirports.filter(location => location.iata_code !== origin.iata_code);

    // Filter based on available routes
    if (tripType === 'roundtrip') {
        // For roundtrip, only show destinations that have BOTH onward and return flights
        filtered = filtered.filter(location => {
            const hasOnwardFlight = availableRoutes.has(`${origin.iata_code}-${location.iata_code}`);
            const hasReturnFlight = availableRoutes.has(`${location.iata_code}-${origin.iata_code}`);
            return hasOnwardFlight && hasReturnFlight;
        });
    } else {
        // For one-way, only show destinations that have onward flights
        filtered = filtered.filter(location => {
            const hasOnwardFlight = availableRoutes.has(`${origin.iata_code}-${location.iata_code}`);
            return hasOnwardFlight;
        });
    }

    return filtered;
};
```

### 2. Dynamic Helper Text

```typescript
helperText={
    origin 
        ? tripType === 'roundtrip' 
            ? 'Only showing destinations with return flights' 
            : 'Only showing destinations with available flights'
        : ''
}
```

**Display:**
- **Roundtrip**: "Only showing destinations with return flights"
- **One-Way**: "Only showing destinations with available flights"
- **No origin selected**: (no helper text)

### 3. Smart No-Options Message

```typescript
noOptionsText={
    tripType === 'roundtrip' 
        ? 'No destinations with return flights available' 
        : 'No flights available from this origin'
}
```

**Display:**
- **Roundtrip**: "No destinations with return flights available"
- **One-Way**: "No flights available from this origin"

### 4. Enhanced Validation

```typescript
useEffect(() => {
    if (origin && destination && availableRoutes.size > 0) {
        const hasOnwardFlight = availableRoutes.has(`${origin.iata_code}-${destination.iata_code}`);
        
        if (tripType === 'roundtrip') {
            const hasReturnFlight = availableRoutes.has(`${destination.iata_code}-${origin.iata_code}`);
            
            if (!hasOnwardFlight || !hasReturnFlight) {
                setDestination(null);
                if (!hasOnwardFlight && !hasReturnFlight) {
                    alert(`⚠️ No flights available between ${origin.city} and ${destination.city}.

Please select a different destination.`);
                } else if (!hasReturnFlight) {
                    alert(`⚠️ Return flights not available from ${destination.city} to ${origin.city}.

Please select a different destination that has return flights available.`);
                }
            }
        } else {
            // One-way trip
            if (!hasOnwardFlight) {
                setDestination(null);
                alert(`⚠️ No flights available from ${origin.city} to ${destination.city}.

Please select a different destination with available flights.`);
            }
        }
    }
}, [tripType, origin, destination, availableRoutes]);
```

## User Experience Flows

### Scenario 1: One-Way Flight (No Route Available)

**User Actions:**
1. Selects "One Way"
2. Selects **HYD** (Hyderabad) as origin
3. Tries to find **ATQ** (Amritsar) in destination dropdown

**System Response:**
- ATQ is NOT in the dropdown list
- Helper text shows: "Only showing destinations with available flights"
- User can only select destinations with flights from HYD

**Result:** ✅ User prevented from selecting unavailable route

### Scenario 2: Switching from One-Way to Roundtrip

**User Actions:**
1. Selects "One Way"
2. Selects **DEL** → **SFO** (one-way flight exists)
3. Switches to "Round Trip"

**System Response:**
- Checks if return flight SFO → DEL exists
- If not, shows alert: "⚠️ Return flights not available from San Francisco to Delhi"
- Destination field is cleared
- User must select a new destination with return flights

**Result:** ✅ User guided to select valid roundtrip route

### Scenario 3: Valid One-Way Selection

**User Actions:**
1. Selects "One Way"
2. Selects **DEL** (Delhi) as origin
3. Destination dropdown shows cities with flights from DEL

**System Response:**
- Shows all destinations with available flights from DEL
- Helper text: "Only showing destinations with available flights"
- User selects **BOM** (Mumbai)
- Search proceeds successfully

**Result:** ✅ Smooth booking experience

### Scenario 4: No Available Destinations

**User Actions:**
1. Selects origin with no outbound flights (hypothetically)
2. Opens destination dropdown

**System Response:**
- Dropdown shows: "No flights available from this origin"
- User understands no flights are available
- Can change origin to find available routes

**Result:** ✅ Clear feedback about unavailability

## Alert Messages

### One-Way - No Onward Flight
```
⚠️ No flights available from [Origin City] to [Destination City].

Please select a different destination with available flights.
```

### Roundtrip - No Return Flight
```
⚠️ Return flights not available from [Destination City] to [Origin City].

Please select a different destination that has return flights available.
```

### Roundtrip - No Flights Either Way
```
⚠️ No flights available between [Origin City] and [Destination City].

Please select a different destination.
```

## Benefits

### For Users
✅ **Prevents frustration**: Can't select unavailable routes
✅ **Saves time**: No empty search results
✅ **Clear guidance**: Knows exactly which destinations are available
✅ **Better UX**: Dropdown only shows valid options
✅ **Helpful messages**: Understands why certain destinations aren't available

### For Business
✅ **Reduced support tickets**: Fewer "no flights found" complaints
✅ **Higher conversion**: Users complete bookings successfully
✅ **Better data quality**: Only valid searches are performed
✅ **Improved trust**: System appears intelligent and reliable
✅ **Lower bounce rate**: Users don't abandon after empty results

## Technical Details

### Performance
- **Route map built once** on component mount
- **O(1) lookup** for route availability check
- **No API calls** needed for filtering
- **Instant feedback** as user types/selects

### Data Structure
```typescript
availableRoutes: Set<string>
// Example:
// "DEL-BOM" ✅ (exists)
// "BOM-DEL" ✅ (exists) → Roundtrip available
// "HYD-ATQ" ❌ (doesn't exist) → Filtered out
// "DEL-SFO" ✅ (exists)
// "SFO-DEL" ❌ (doesn't exist) → One-way only
```

### Edge Cases Handled

1. **No origin selected**: Shows all destinations
2. **Routes map not loaded**: Waits for `availableRoutes.size > 0`
3. **Switching trip types**: Validates and clears invalid destinations
4. **Quick bookings**: Always sets to one-way to avoid conflicts
5. **Empty results**: Shows helpful "no options" message

## Testing

### Test Cases

**Test 1: HYD → ATQ (One-Way, No Flight)**
- Select "One Way"
- Select HYD as origin
- Verify ATQ is NOT in destination list
- ✅ Expected: ATQ filtered out

**Test 2: DEL → BOM (One-Way, Has Flight)**
- Select "One Way"
- Select DEL as origin
- Verify BOM is in destination list
- Select BOM
- ✅ Expected: Search proceeds normally

**Test 3: Switch to Roundtrip with Invalid Destination**
- Select "One Way"
- Select DEL → SFO
- Switch to "Round Trip"
- ✅ Expected: Alert shown if no return flight, destination cleared

**Test 4: Helper Text Display**
- Select "One Way"
- Select any origin
- ✅ Expected: "Only showing destinations with available flights"

**Test 5: No Options Message**
- Select origin with no outbound flights
- Open destination dropdown
- ✅ Expected: "No flights available from this origin"

## Comparison: Before vs After

| Scenario | Before | After |
|----------|--------|-------|
| **HYD → ATQ (One-Way)** | Shows ATQ, empty results | ATQ not shown, prevented |
| **DEL → SFO → Switch to Roundtrip** | Allows selection, no return flights | Alert shown, destination cleared |
| **Helper Text** | Only for roundtrip | For both trip types |
| **No Options Message** | Generic message | Trip-type specific message |
| **User Confusion** | High | Low |
| **Support Tickets** | Many | Few |

## Files Modified

- `/frontend-next/pages/search.tsx`
  - Enhanced `getAvailableDestinations()` function
  - Updated destination field helper text
  - Updated no-options message
  - Enhanced validation useEffect

## Related Documentation

- `SMART_DESTINATION_FILTERING.md` - Original roundtrip filtering
- `RETURN_FLIGHTS_INVESTIGATION.md` - Flight data analysis
- `FLIGHT_SEARCH_COMPATIBILITY.md` - Search implementation

## Future Enhancements

1. **Visual indicators**: Show badge for "one-way only" routes
2. **Alternative suggestions**: "No flights to ATQ, try DEL instead"
3. **Route popularity**: Highlight popular routes
4. **Price preview**: Show estimated price in dropdown
5. **Multi-stop options**: Suggest connecting flights

## Deployment

This enhancement is backward compatible and requires no configuration changes.

**Status**: ✅ Ready for deployment
**Impact**: Improves UX for both one-way and roundtrip searches
