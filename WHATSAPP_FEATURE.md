# Feature: WhatsApp Notification Checkbox

## Overview
Added a checkbox to the **Traveller Details** page to allow users to opt-in for WhatsApp notifications regarding their booking.

## Changes
- **File:** `frontend/src/components/TravellerDetails.js`
- **UI:** Added a checkbox labeled "Receive booking details on WhatsApp" in the Contact Information section.
- **Behavior:**
    - Checked by default.
    - State is captured in `whatsappNotification`.
    - Value is passed to the next step (Ancillary Services) via `navigationState`.
    - Value is included in analytics tracking events.

## Usage
The `whatsappNotification` boolean is now available in the `contactInfo` object within the booking flow state. This can be used by the backend to trigger the WhatsApp message upon booking confirmation.

## Next Steps (Backend Implementation)
To fully enable this feature, the backend needs to:
1.  Read the `whatsappNotification` flag from the booking payload.
2.  If true, trigger the WhatsApp API call (as outlined in the previous analysis).
