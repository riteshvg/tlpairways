# Smart Destination Filtering for Roundtrip Flights

## Overview
Implemented intelligent destination filtering that prevents users from selecting destinations without return flights when booking roundtrip tickets.

## Problem Statement
Previously, users could select any destination for roundtrip flights, even if no return flights were available (e.g., BLR → SFO). This led to:
- Poor user experience when reaching the results page with no return flights
- Confusion about why return flights weren't showing
- Wasted time in the booking flow

## Solution

### 1. Route Availability Map
On component mount, we build a Set of all available routes from the flights data:

```typescript
const [availableRoutes, setAvailableRoutes] = useState<Set<string>>(new Set());

useEffect(() => {
    const routes = new Set<string>();
    const flights = (flightsData as any).flights || [];
    
    flights.forEach((flight: any) => {
        routes.add(`${flight.origin}-${flight.destination}`);
    });
    
    setAvailableRoutes(routes);
}, []);
```

### 2. Smart Destination Filtering
The `getAvailableDestinations()` function now filters based on trip type:

**For One-Way Trips:**
- Shows all destinations except the origin

**For Roundtrip Trips:**
- Shows only destinations that have BOTH:
  - Onward flight: `origin → destination`
  - Return flight: `destination → origin`

```typescript
const getAvailableDestinations = (): Airport[] => {
    if (!origin) return getUniqueLocations();

    const allAirports = getUniqueLocations();
    let filtered = allAirports.filter(location => location.iata_code !== origin.iata_code);

    // For roundtrip, only show destinations that have return flights
    if (tripType === 'roundtrip') {
        filtered = filtered.filter(location => {
            const hasOnwardFlight = availableRoutes.has(`${origin.iata_code}-${location.iata_code}`);
            const hasReturnFlight = availableRoutes.has(`${location.iata_code}-${origin.iata_code}`);
            return hasOnwardFlight && hasReturnFlight;
        });
    }

    return filtered;
};
```

### 3. Automatic Destination Clearing
When users switch from one-way to roundtrip, we validate the selected destination:

```typescript
useEffect(() => {
    if (tripType === 'roundtrip' && origin && destination) {
        const hasReturnFlight = availableRoutes.has(`${destination.iata_code}-${origin.iata_code}`);
        
        if (!hasReturnFlight) {
            setDestination(null);
            alert(`⚠️ Return flights not available from ${destination.city} to ${origin.city}.

Please select a different destination that has return flights available.`);
        }
    }
}, [tripType, origin, destination, availableRoutes]);
```

### 4. User Feedback
Added helpful UI indicators:

**Helper Text:**
- Shows "Only showing destinations with return flights" when in roundtrip mode
- Appears below the destination field

**No Options Text:**
- Custom message: "No destinations with return flights available"
- Appears when no valid destinations exist for the selected origin

**Alert Dialog:**
- Pops up when switching to roundtrip with an invalid destination
- Clearly explains why the destination was cleared
- Guides user to select a valid destination

## User Experience Flow

### Scenario 1: Selecting Roundtrip First
1. User selects "Round Trip"
2. User selects origin (e.g., BLR - Bangalore)
3. Destination dropdown shows only cities with return flights
4. SFO is NOT in the list (no return flights)
5. User can only select valid roundtrip destinations

### Scenario 2: Switching from One-Way to Roundtrip
1. User has "One Way" selected
2. User selects BLR → SFO
3. User switches to "Round Trip"
4. Alert appears: "⚠️ Return flights not available from San Francisco to Bangalore"
5. Destination field is cleared
6. User must select a new destination with return flights

### Scenario 3: Valid Roundtrip Selection
1. User selects "Round Trip"
2. User selects DEL (Delhi) as origin
3. Destination shows cities like BOM, BLR, MAA (all have return flights)
4. User selects BOM (Mumbai)
5. Search proceeds normally with both onward and return flights available

## Technical Details

### Performance
- Route map is built once on component mount
- Uses Set for O(1) lookup performance
- No impact on search performance

### Data Structure
```typescript
availableRoutes: Set<string>
// Example contents:
// "DEL-BOM"
// "BOM-DEL"
// "BLR-SIN"
// "SIN-BLR"
// "DEL-SFO"  (exists)
// "SFO-DEL"  (does NOT exist - one-way only)
```

### Edge Cases Handled
1. **No origin selected**: Shows all destinations
2. **Switching trip types**: Validates and clears invalid destinations
3. **No valid destinations**: Shows helpful "no options" message
4. **Quick bookings**: Always sets to one-way to avoid conflicts

## Benefits

### For Users
✅ **Prevents frustration**: Can't select destinations without return flights  
✅ **Clear feedback**: Knows exactly why certain destinations aren't available  
✅ **Saves time**: Doesn't waste time searching for unavailable flights  
✅ **Better UX**: Guided to make valid selections

### For Business
✅ **Reduced support tickets**: Fewer questions about missing return flights  
✅ **Higher conversion**: Users complete bookings successfully  
✅ **Better data quality**: Only valid searches are performed  
✅ **Improved trust**: System appears more intelligent and reliable

## Testing

### Test Cases

**Test 1: BLR → SFO (No Return)**
- Select "Round Trip"
- Select BLR as origin
- Verify SFO is NOT in destination list
- ✅ Expected: SFO not available

**Test 2: DEL → BOM (Has Return)**
- Select "Round Trip"
- Select DEL as origin
- Verify BOM is in destination list
- Select BOM
- ✅ Expected: Search proceeds normally

**Test 3: Switch from One-Way to Roundtrip**
- Select "One Way"
- Select BLR → SFO
- Switch to "Round Trip"
- ✅ Expected: Alert shown, destination cleared

**Test 4: Helper Text Display**
- Select "Round Trip"
- Select any origin
- ✅ Expected: "Only showing destinations with return flights" appears

## Future Enhancements

### Possible Improvements
1. **Visual indicators**: Show badge/icon for destinations with limited return flights
2. **Alternative suggestions**: "No return flights to SFO, try LAX instead"
3. **Date-based filtering**: Filter by return flight availability on specific dates
4. **Price indicators**: Show estimated roundtrip price in dropdown
5. **Tooltip explanations**: Hover over disabled destinations to see why

### Analytics Tracking
Consider tracking:
- How often users encounter "no return flights" scenario
- Which routes users attempt that don't have returns
- Conversion rate improvement after this feature

## Files Modified
- `/frontend-next/pages/search.tsx` - Main search page with filtering logic

## Related Documentation
- `RETURN_FLIGHTS_INVESTIGATION.md` - Investigation of return flights data
- `FLIGHT_SEARCH_COMPATIBILITY.md` - Flight search implementation details
