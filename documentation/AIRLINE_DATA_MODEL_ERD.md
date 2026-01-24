# 🗄️ Airlines Data Model - Entity Relationship Diagram

> **Cross-Channel Schema Design for Adobe Experience Platform**
> 
> Modeling data relationships between Web, Call Center, Flight Operations, CRM, and PNR systems

---

## � Visual Diagrams

All diagrams are available in `/frontend-next/public/diagrams/`:

| Diagram | File | Use Case |
|---------|------|----------|
| **ERD Schema Diagram** | `airline_erd_diagram.png` | Entity relationships overview |
| **AEP Data Flow** | `aep_data_flow_diagram.png` | End-to-end data architecture |
| **Identity Graph** | `identity_graph_diagram.png` | Cross-channel identity stitching |
| **Booking Funnel** | `booking_funnel_diagram.png` | Conversion analytics visualization |

**Access via URL (when running locally):**
- http://localhost:3000/diagrams/airline_erd_diagram.png
- http://localhost:3000/diagrams/aep_data_flow_diagram.png
- http://localhost:3000/diagrams/identity_graph_diagram.png
- http://localhost:3000/diagrams/booking_funnel_diagram.png

---

## �📊 Visual ERD Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                   AIRLINES DATA MODEL - AEP XDM                                  │
│                             Entity Relationship Diagram (ERD)                                    │
└─────────────────────────────────────────────────────────────────────────────────────────────────┘

                                    ┌──────────────────────┐
                                    │   CUSTOMER PROFILE   │
                                    │   (XDM Individual    │
                                    │      Profile)        │
                                    ├──────────────────────┤
                                    │ PK: profileId        │
                                    │ ─────────────────    │
                                    │ • loyaltyId          │
                                    │ • hashedEmail        │
                                    │ • hashedPhone        │
                                    │ • firstName          │
                                    │ • lastName           │
                                    │ • dateOfBirth        │
                                    │ • nationality        │
                                    │ • loyaltyTier        │
                                    │ • lifetimeValue      │
                                    │ • totalBookings      │
                                    │ • preferredCabin     │
                                    │ • homeAirport        │
                                    │ • frequentRoutes[]   │
                                    │ • consentStatus      │
                                    │ • createdDate        │
                                    │ • lastUpdated        │
                                    └──────────┬───────────┘
                                               │
                                               │ 1:N
                                               │
        ┌──────────────────────────────────────┼──────────────────────────────────────┐
        │                                      │                                      │
        ▼                                      ▼                                      ▼
┌───────────────────┐              ┌───────────────────────┐              ┌───────────────────────┐
│   WEB BEHAVIOR    │              │    CALL CENTER        │              │      CRM DATA         │
│  (ExperienceEvent)│              │   INTERACTION         │              │   (Profile Data)      │
├───────────────────┤              │  (ExperienceEvent)    │              ├───────────────────────┤
│ PK: eventId       │              ├───────────────────────┤              │ PK: crmId             │
│ FK: profileId     │              │ PK: interactionId     │              │ FK: profileId         │
│ FK: searchId      │              │ FK: profileId         │              │ ─────────────────     │
│ FK: pnr           │              │ FK: pnr               │              │ • leadSource          │
│ ─────────────────│              │ FK: agentId           │              │ • acquisitionChannel  │
│ • eventType       │              │ ─────────────────     │              │ • marketingOptIn      │
│ • timestamp       │              │ • callType            │              │ • preferredLanguage   │
│ • pageURL         │              │ • callReason          │              │ • preferredContact    │
│ • deviceType      │              │ • callDuration        │              │ • segmentMembership[] │
│ • browserType     │              │ • resolution          │              │ • campaignHistory[]   │
│ • searchQuery     │              │ • sentimentScore      │              │ • emailEngagement     │
│ • flightSelected  │              │ • transferCount       │              │ • appInstalled        │
│ • ancillaries[]   │              │ • holdTime            │              │ • notificationPrefs   │
│ • cartValue       │              │ • outcome             │              │ • specialAssistance   │
│ • sessionId       │              │ • notes               │              │ • dietaryPreference   │
│ • referrer        │              │ • timestamp           │              │ • lastEmailOpen       │
│ • consentGiven    │              │ • callbackScheduled   │              │ • lastAppSession      │
└─────────┬─────────┘              └───────────┬───────────┘              └───────────────────────┘
          │                                    │
          │ N:1                                │ N:1
          ▼                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                              PNR (BOOKING)                               │
│                       (Transactional Record)                             │
├─────────────────────────────────────────────────────────────────────────┤
│ PK: pnr                                                                  │
│ FK: profileId                                                            │
│ ───────────────────────────────────────────────────────────             │
│ • bookingReference                                                       │
│ • bookingDate                                                            │
│ • bookingChannel (web | call | kiosk | app | agent)                     │
│ • bookingStatus (confirmed | cancelled | modified | on-hold)            │
│ • totalAmount                                                            │
│ • currency                                                               │
│ • paymentMethod                                                          │
│ • paymentStatus                                                          │
│ • tripType (oneway | roundtrip | multi-city)                            │
│ • passengers[] ──────────────────┐                                       │
│ • flightLegs[] ──────────────────┼──► See detailed schemas below        │
│ • ancillaryServices[] ───────────┘                                       │
│ • ticketNumbers[]                                                        │
│ • fareBasis                                                              │
│ • promoCodeUsed                                                          │
│ • loyaltyPointsEarned                                                    │
│ • loyaltyPointsRedeemed                                                  │
│ • agentId (if agent booking)                                             │
│ • createdTimestamp                                                       │
│ • lastModified                                                           │
└─────────────────────────────────────────────────────────────────────────┘
          │
          │ 1:N
          ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         FLIGHT OPERATIONS                                │
│                     (Flight Leg Records)                                 │
├─────────────────────────────────────────────────────────────────────────┤
│ PK: flightLegId                                                          │
│ FK: pnr                                                                  │
│ FK: flightNumber                                                         │
│ ───────────────────────────────────────────────────────────             │
│ • legSequence (1, 2, 3...)                                               │
│ • flightNumber                                                           │
│ • operatingCarrier                                                       │
│ • marketingCarrier                                                       │
│ • origin (IATA code)                                                     │
│ • destination (IATA code)                                                │
│ • scheduledDeparture                                                     │
│ • scheduledArrival                                                       │
│ • actualDeparture                                                        │
│ • actualArrival                                                          │
│ • departureTerminal                                                      │
│ • arrivalTerminal                                                        │
│ • departureGate                                                          │
│ • arrivalGate                                                            │
│ • aircraftType                                                           │
│ • cabinClass (economy | premium | business | first)                     │
│ • fareClass (Y, B, M, etc.)                                              │
│ • bookingClass                                                           │
│ • status (scheduled | boarding | departed | arrived | cancelled)        │
│ • delay (minutes)                                                        │
│ • delayReason                                                            │
│ • distance (km)                                                          │
│ • flightDuration (minutes)                                               │
│ • isCancelled                                                            │
│ • cancellationReason                                                     │
│ • isIrregular (IRROPS flag)                                              │
│ • baggageAllowance                                                       │
└─────────────────────────────────────────────────────────────────────────┘


                    ┌───────────────────────────────────────────┐
                    │         RELATIONSHIP SUMMARY              │
                    ├───────────────────────────────────────────┤
                    │                                           │
                    │  CUSTOMER PROFILE                         │
                    │      │                                    │
                    │      ├── 1:N ── Web Behavior Events       │
                    │      ├── 1:N ── Call Center Interactions  │
                    │      ├── 1:1 ── CRM Data                  │
                    │      └── 1:N ── PNR Bookings              │
                    │                    │                      │
                    │                    └── 1:N ── Flight Legs │
                    │                                           │
                    └───────────────────────────────────────────┘
```

---

## 📋 Detailed Schema Definitions

### 1. Customer Profile Schema

**XDM Class:** XDM Individual Profile

```javascript
{
  "_id": "profile_550e8400-e29b-41d4-a716-446655440000",
  "loyaltyId": "TLP-GOLD-7891234",
  
  // Identity Map - for cross-channel stitching
  "identityMap": {
    "ECID": [{ "id": "12345678901234567890" }],
    "Email_SHA256": [{ "id": "a1b2c3d4e5f6..." }],
    "Phone_SHA256": [{ "id": "f6e5d4c3b2a1..." }],
    "LoyaltyId": [{ "id": "TLP-GOLD-7891234" }],
    "CRMId": [{ "id": "CRM-001-7891234" }]
  },
  
  // Personal Information (PII - hashed where applicable)
  "person": {
    "name": {
      "firstName": "Ritesh",
      "lastName": "Gupta"
    },
    "birthDate": "1985-05-15",
    "nationality": "IN"
  },
  
  // Loyalty Program
  "_tlpairways": {
    "loyalty": {
      "tier": "gold",             // standard | silver | gold | platinum
      "tierQualifyingPoints": 75000,
      "redeemablePoints": 42500,
      "tierExpiryDate": "2027-03-31",
      "memberSince": "2020-01-15",
      "lifetimeMiles": 250000
    },
    
    // Behavioral Aggregates (calculated)
    "behaviorSummary": {
      "lifetimeValue": 485000,
      "totalBookings": 23,
      "averageBookingValue": 21087,
      "mostBookedRoute": "BLR-DEL",
      "preferredCabinClass": "business",
      "ancillaryAttachRate": 0.78,
      "averageAdvanceBookingDays": 21,
      "cancellationRate": 0.04,
      "lastBookingDate": "2025-12-15",
      "daysSinceLastBooking": 35
    },
    
    // Preferences
    "preferences": {
      "homeAirport": "BLR",
      "seatPreference": "window",
      "mealPreference": "vegetarian",
      "specialAssistance": null,
      "preferredPaymentMethod": "credit-card"
    }
  },
  
  // Consent
  "consents": {
    "marketing": {
      "email": { "val": "y", "time": "2025-01-15T10:00:00Z" },
      "push": { "val": "y", "time": "2025-01-15T10:00:00Z" },
      "sms": { "val": "n", "time": "2025-01-15T10:00:00Z" }
    },
    "personalization": { "val": "y", "time": "2025-01-15T10:00:00Z" }
  }
}
```

---

### 2. Web Behavior Schema (ExperienceEvent)

**XDM Class:** XDM ExperienceEvent

```javascript
{
  "_id": "event_12345678-1234-1234-1234-123456789012",
  "timestamp": "2026-01-19T14:30:00Z",
  "eventType": "commerce.productListViews",  // or custom
  
  // Identity Reference
  "identityMap": {
    "ECID": [{ "id": "12345678901234567890", "primary": true }],
    "Email_SHA256": [{ "id": "a1b2c3d4e5f6..." }]  // If logged in
  },
  
  // Web Details
  "web": {
    "webPageDetails": {
      "name": "TLP Airways | Search Results",
      "URL": "https://tlpairways.com/results?from=BLR&to=DEL",
      "siteSection": "booking",
      "referringURL": "https://tlpairways.com/search"
    },
    "webReferrer": {
      "URL": "https://google.com/search?q=bangalore+delhi+flights"
    }
  },
  
  // Device
  "device": {
    "type": "desktop",
    "screenWidth": 1920,
    "screenHeight": 1080
  },
  
  // Environment
  "environment": {
    "browserDetails": {
      "name": "Chrome",
      "version": "120.0.0"
    },
    "operatingSystem": "macOS",
    "ipV4": "122.xxx.xxx.xxx"  // Anonymized in AEP
  },
  
  // Commerce (for e-commerce events)
  "commerce": {
    "productListViews": { "value": 1 }
  },
  
  // Product List (for search results, selections)
  "productListItems": [
    {
      "SKU": "TL-234",
      "name": "BLR→DEL Morning Flight",
      "productCategories": {
        "primary": "flight/domestic/onward"
      },
      "priceTotal": 5000,
      "currencyCode": "INR",
      "quantity": 2
    }
  ],
  
  // Custom Airline Data
  "_tlpairways": {
    "search": {
      "searchId": "srch_1705612345_abc",
      "origin": "BLR",
      "destination": "DEL",
      "departureDate": "2026-02-15",
      "returnDate": "2026-02-20",
      "tripType": "roundtrip",
      "passengers": {
        "adults": 2,
        "children": 0,
        "infants": 0
      },
      "cabinClass": "economy",
      "daysUntilDeparture": 27
    },
    "searchResults": {
      "totalResults": 12,
      "lowestPrice": 4500,
      "highestPrice": 12000,
      "loadTimeMs": 1200
    },
    "session": {
      "sessionId": "sess_abc123",
      "sessionNumber": 3,
      "isNewVisitor": false
    }
  }
}
```

---

### 3. Call Center Interaction Schema (ExperienceEvent)

**XDM Class:** XDM ExperienceEvent

```javascript
{
  "_id": "call_98765432-1234-1234-1234-123456789012",
  "timestamp": "2026-01-19T15:45:00Z",
  "eventType": "callCenter.interaction",
  
  // Identity Reference
  "identityMap": {
    "Phone_SHA256": [{ "id": "hashedPhone123...", "primary": true }],
    "LoyaltyId": [{ "id": "TLP-GOLD-7891234" }]
  },
  
  // Custom Call Center Data
  "_tlpairways": {
    "callCenter": {
      "interactionId": "CALL-2026-01-19-00456",
      "callType": "inbound",
      "channel": "phone",                    // phone | chat | email
      
      // Call Details
      "callDetails": {
        "ani": "+91-98xxx-xxxxx",            // Anonymized
        "dnis": "1800-TLP-AIRWAYS",
        "queueName": "booking-support",
        "queueWaitTime": 45,                 // seconds
        "callDuration": 420,                 // seconds
        "holdTime": 60,
        "transferCount": 0,
        "isCallBack": false
      },
      
      // Agent Details
      "agent": {
        "agentId": "AGT-1234",
        "agentName": "Priya Sharma",
        "team": "domestic-bookings",
        "location": "Bangalore"
      },
      
      // Reason & Resolution
      "interaction": {
        "primaryReason": "booking-modification",
        "secondaryReason": "date-change",
        "resolution": "completed",           // completed | escalated | callback | unresolved
        "resolutionNotes": "Changed departure from 15th to 20th Feb",
        "sentimentScore": 0.85,              // 0-1 from voice AI
        "customerSatisfaction": 4            // 1-5 post-call survey
      },
      
      // Booking Reference (if applicable)
      "bookingContext": {
        "pnr": "PNR-ABC123",
        "modificationMade": true,
        "refundIssued": false,
        "compensationOffered": false
      },
      
      // Upsell/Cross-sell
      "commercialOutcome": {
        "ancillaryOffered": ["extra-baggage", "seat-selection"],
        "ancillaryAccepted": ["extra-baggage"],
        "upsellRevenue": 1500
      }
    }
  }
}
```

---

### 4. CRM Data Schema (Profile Extension)

**XDM Class:** XDM Individual Profile (or custom field group)

```javascript
{
  "_id": "crm_CRM-001-7891234",
  
  // Link to main profile
  "identityMap": {
    "CRMId": [{ "id": "CRM-001-7891234", "primary": true }],
    "Email_SHA256": [{ "id": "a1b2c3d4e5f6..." }]
  },
  
  "_tlpairways": {
    "crm": {
      "crmId": "CRM-001-7891234",
      "accountType": "individual",            // individual | corporate
      
      // Acquisition
      "acquisition": {
        "leadSource": "google-ads",
        "firstTouchChannel": "paid-search",
        "firstBookingDate": "2020-03-15",
        "firstBookingValue": 12500,
        "acquisitionCampaign": "summer-sale-2020"
      },
      
      // Marketing
      "marketing": {
        "subscriptionStatus": "active",
        "emailOptIn": true,
        "smsOptIn": false,
        "pushOptIn": true,
        "preferredLanguage": "en",
        "preferredContactTime": "evening"
      },
      
      // Engagement Scores
      "engagement": {
        "emailEngagementScore": 0.72,        // Based on opens/clicks
        "appEngagementScore": 0.45,
        "webEngagementScore": 0.88,
        "overallEngagementScore": 0.68
      },
      
      // Campaign History
      "campaignHistory": [
        {
          "campaignId": "CAMP-2025-DIWALI",
          "campaignName": "Diwali Flash Sale",
          "sentDate": "2025-10-20",
          "opened": true,
          "clicked": true,
          "converted": true,
          "conversionValue": 18500
        }
      ],
      
      // Segments
      "segmentMembership": {
        "highValueTraveler": true,
        "businessTraveler": true,
        "priceComparer": false,
        "ancillaryBuyer": true,
        "loyaltyAtRisk": false
      },
      
      // Travel Preferences (stated)
      "statedPreferences": {
        "travelPurpose": "mixed",            // business | leisure | mixed
        "frequentDestinations": ["DEL", "BOM", "DXB"],
        "companionProfile": "solo",          // solo | couple | family
        "budgetSensitivity": "moderate"
      }
    }
  }
}
```

---

### 5. PNR (Booking) Schema (ExperienceEvent or Custom)

**XDM Class:** XDM ExperienceEvent (for purchase event) + Custom Lookup

```javascript
{
  "_id": "pnr_PNR-ABC123-20260119",
  "timestamp": "2026-01-19T16:00:00Z",
  "eventType": "commerce.purchases",
  
  // Identity Reference
  "identityMap": {
    "ECID": [{ "id": "12345678901234567890" }],
    "LoyaltyId": [{ "id": "TLP-GOLD-7891234" }]
  },
  
  // Commerce - Purchase Event
  "commerce": {
    "purchases": { "value": 1 },
    "order": {
      "purchaseID": "PNR-ABC123",
      "priceTotal": 28500,
      "currencyCode": "INR",
      "payments": [
        {
          "paymentType": "credit_card",
          "paymentAmount": 28500,
          "currencyCode": "INR"
        }
      ]
    }
  },
  
  // Products Purchased
  "productListItems": [
    {
      "SKU": "TL-234-20260215",
      "name": "Flight TL-234 BLR→DEL",
      "productCategories": { "primary": "flight/domestic/onward" },
      "priceTotal": 10000,
      "currencyCode": "INR",
      "quantity": 2
    },
    {
      "SKU": "TL-789-20260220",
      "name": "Flight TL-789 DEL→BLR",
      "productCategories": { "primary": "flight/domestic/return" },
      "priceTotal": 9000,
      "currencyCode": "INR",
      "quantity": 2
    },
    {
      "SKU": "SEAT-TL234-12A",
      "name": "Extra Legroom Seat 12A",
      "productCategories": { "primary": "ancillary/seat/extra-legroom" },
      "priceTotal": 500,
      "currencyCode": "INR",
      "quantity": 2
    },
    {
      "SKU": "BAG-20KG",
      "name": "20kg Checked Baggage",
      "productCategories": { "primary": "ancillary/baggage/checked" },
      "priceTotal": 1500,
      "currencyCode": "INR",
      "quantity": 2
    }
  ],
  
  // Custom Booking Data
  "_tlpairways": {
    "booking": {
      "pnr": "PNR-ABC123",
      "bookingStatus": "confirmed",
      "bookingChannel": "web",
      "createdTimestamp": "2026-01-19T16:00:00Z",
      
      // Trip Summary
      "tripSummary": {
        "tripType": "roundtrip",
        "sectorType": "domestic",
        "totalLegs": 2,
        "totalDuration": 300,               // minutes
        "totalDistance": 3000               // km
      },
      
      // Passengers
      "passengers": [
        {
          "passengerNumber": 1,
          "passengerType": "adult",
          "ticketNumber": "TLP-1234567890",
          "seatNumbers": { "leg1": "12A", "leg2": "15C" },
          "frequentFlyerId": "TLP-GOLD-7891234",
          "specialServices": []
        },
        {
          "passengerNumber": 2,
          "passengerType": "adult",
          "ticketNumber": "TLP-1234567891",
          "seatNumbers": { "leg1": "12B", "leg2": "15D" },
          "frequentFlyerId": null,
          "specialServices": []
        }
      ],
      
      // Revenue Breakdown
      "revenue": {
        "baseFare": 16000,
        "taxes": 2000,
        "surcharges": 500,
        "ancillaryRevenue": 4000,
        "totalRevenue": 22500,
        "promoDiscount": 0,
        "loyaltyPointsUsed": 0
      },
      
      // Attribution
      "attribution": {
        "searchId": "srch_1705612345_abc",
        "searchToBookMinutes": 45,
        "sessions": 2,
        "touchpoints": 8
      }
    },
    
    // Flight Legs (embedded)
    "flightLegs": [
      {
        "legSequence": 1,
        "flightNumber": "TL-234",
        "origin": "BLR",
        "destination": "DEL",
        "departureDate": "2026-02-15",
        "departureTime": "08:00",
        "arrivalTime": "10:30",
        "cabinClass": "economy",
        "fareClass": "M",
        "status": "confirmed"
      },
      {
        "legSequence": 2,
        "flightNumber": "TL-789",
        "origin": "DEL",
        "destination": "BLR",
        "departureDate": "2026-02-20",
        "departureTime": "14:00",
        "arrivalTime": "16:30",
        "cabinClass": "economy",
        "fareClass": "M",
        "status": "confirmed"
      }
    ]
  }
}
```

---

### 6. Flight Operations Schema

**Data Source:** Airline Operations Database (imported to AEP)

```javascript
{
  "_id": "flightop_TL234_20260215",
  
  // Flight Identity
  "flightIdentity": {
    "flightNumber": "TL-234",
    "operatingDate": "2026-02-15",
    "operatingCarrier": "TLP",
    "marketingCarrier": "TLP",
    "codeSharePartners": []
  },
  
  // Route Information
  "route": {
    "origin": {
      "iataCode": "BLR",
      "icaoCode": "VOBL",
      "city": "Bangalore",
      "country": "IN",
      "terminal": "1",
      "timezone": "Asia/Kolkata"
    },
    "destination": {
      "iataCode": "DEL",
      "icaoCode": "VIDP",
      "city": "New Delhi",
      "country": "IN",
      "terminal": "3",
      "timezone": "Asia/Kolkata"
    },
    "distance": 1740,               // km
    "blockTime": 150,               // minutes
    "sectorType": "domestic"
  },
  
  // Schedule
  "schedule": {
    "scheduledDeparture": "08:00",
    "scheduledArrival": "10:30",
    "actualDeparture": "08:15",     // Updated in real-time
    "actualArrival": "10:40",
    "blockTimeActual": 145
  },
  
  // Status
  "status": {
    "flightStatus": "arrived",      // scheduled | boarding | departed | in-air | arrived | cancelled
    "delayMinutes": 15,
    "delayReason": "late-inbound",
    "isCancelled": false,
    "isIrregular": false,
    "gate": "A12",
    "baggageCarousel": "5"
  },
  
  // Aircraft
  "aircraft": {
    "registration": "VT-TLP",
    "type": "A320",
    "configuration": "180Y",
    "wifiAvailable": true,
    "ageYears": 5
  },
  
  // Load Factor
  "loadFactor": {
    "totalCapacity": 180,
    "bookedSeats": 162,
    "checkedInPassengers": 158,
    "boardedPassengers": 156,
    "noShows": 6,
    "standbyCleared": 2,
    "loadPercentage": 90
  },
  
  // Revenue
  "revenueMetrics": {
    "totalRevenue": 850000,
    "baseRevenue": 720000,
    "ancillaryRevenue": 130000,
    "averageFare": 5247,
    "yieldPerKm": 3.01
  }
}
```

---

## 🔗 Relationship Matrix

| From Schema | To Schema | Relationship | Join Key |
|-------------|-----------|--------------|----------|
| Customer Profile | Web Behavior | 1:N | profileId / ECID |
| Customer Profile | Call Center | 1:N | profileId / Phone Hash |
| Customer Profile | CRM Data | 1:1 | profileId / CRM ID |
| Customer Profile | PNR Booking | 1:N | profileId / Loyalty ID |
| Web Behavior | PNR Booking | N:1 | searchId, pnr |
| Call Center | PNR Booking | N:1 | pnr |
| PNR Booking | Flight Operations | N:1 | flightNumber + date |
| Flight Operations | PNR Booking | 1:N | flightNumber + date |

---

## 🆔 Identity Stitching Keys

```
┌─────────────────────────────────────────────────────────────────┐
│                    IDENTITY GRAPH                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│              ┌───────────────┐                                  │
│              │  ECID (Web)   │                                  │
│              │ 1234567890... │                                  │
│              └───────┬───────┘                                  │
│                      │                                          │
│    ┌─────────────────┼─────────────────┐                       │
│    │                 │                 │                       │
│    ▼                 ▼                 ▼                       │
│ ┌──────────┐  ┌──────────────┐  ┌──────────────┐              │
│ │Email Hash│  │ Loyalty ID   │  │  Phone Hash  │              │
│ │ a1b2c3.. │  │TLP-GOLD-7891 │  │  f6e5d4...   │              │
│ └────┬─────┘  └──────┬───────┘  └──────┬───────┘              │
│      │               │                 │                       │
│      └───────────────┼─────────────────┘                       │
│                      │                                          │
│              ┌───────▼───────┐                                  │
│              │   CRM ID      │                                  │
│              │ CRM-001-7891  │                                  │
│              └───────────────┘                                  │
│                                                                 │
│  Priority Order (for merge):                                   │
│  1. Loyalty ID (authenticated, unique)                         │
│  2. Email Hash (authenticated)                                 │
│  3. CRM ID (system-generated)                                  │
│  4. Phone Hash (may be shared)                                 │
│  5. ECID (device-level, anonymous)                            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📊 XDM Implementation in AEP

### Schema Hierarchy

```
XDM Individual Profile
├── [CORE] Profile Core
├── [CORE] Identity Map
├── [CORE] Consents and Preferences
├── [ADDON] Profile Person Details
└── [CUSTOM] TLP Airways Profile
    ├── Loyalty Details
    ├── Behavior Summary
    └── Preferences

XDM ExperienceEvent
├── [CORE] Experience Event
├── [CORE] Identity Map
├── [ADDON] Commerce Details
├── [ADDON] Web Details
├── [ADDON] Environment Details
└── [CUSTOM] TLP Airways Events
    ├── Flight Search
    ├── Flight Selection
    ├── Booking Details
    └── Call Center Interaction
```

### Dataset Configuration

| Schema | Dataset Name | Type | Retention |
|--------|-------------|------|-----------|
| Profile | TLP_CustomerProfiles | Profile | Unlimited |
| Web Behavior | TLP_WebEvents | Event | 13 months |
| Call Center | TLP_CallCenterEvents | Event | 13 months |
| PNR Bookings | TLP_Bookings | Event/Lookup | 5 years |
| Flight Ops | TLP_FlightOperations | Lookup | 2 years |
| CRM | TLP_CRMData | Profile | Unlimited |

---

## 🔄 Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         DATA SOURCES & INGESTION                        │
└─────────────────────────────────────────────────────────────────────────┘

  ┌─────────┐     ┌─────────────┐     ┌──────────┐     ┌─────────────┐
  │   WEB   │     │ CALL CENTER │     │   CRM    │     │ FLIGHT OPS  │
  │(Web SDK)│     │  (CTI/CSV)  │     │(Salesforce)│   │   (AIDX)   │
  └────┬────┘     └──────┬──────┘     └─────┬────┘     └──────┬──────┘
       │                 │                  │                 │
       │                 │                  │                 │
       ▼                 ▼                  ▼                 ▼
  ┌─────────────────────────────────────────────────────────────────────┐
  │                      ADOBE EDGE NETWORK                              │
  └─────────────────────────────┬───────────────────────────────────────┘
                                │
                                ▼
  ┌─────────────────────────────────────────────────────────────────────┐
  │                    ADOBE EXPERIENCE PLATFORM                         │
  │  ┌─────────────────────────────────────────────────────────────┐   │
  │  │                     DATA LAKE (Datasets)                     │   │
  │  ├──────────────┬─────────────┬──────────────┬─────────────────┤   │
  │  │ Web Events   │Call Center  │   CRM Data   │  Flight Ops     │   │
  │  └──────────────┴─────────────┴──────────────┴─────────────────┘   │
  │                                │                                    │
  │                                ▼                                    │
  │  ┌─────────────────────────────────────────────────────────────┐   │
  │  │               UNIFIED PROFILE (Identity Stitching)           │   │
  │  └─────────────────────────────────────────────────────────────┘   │
  │                                │                                    │
  │         ┌──────────────────────┼──────────────────────┐            │
  │         ▼                      ▼                      ▼            │
  │   ┌───────────┐         ┌───────────┐          ┌───────────┐      │
  │   │    CJA    │         │Real-Time  │          │  Journey  │      │
  │   │(Analysis) │         │   CDP     │          │Orchestrator│     │
  │   └─────┬─────┘         └─────┬─────┘          └─────┬─────┘      │
  │         │                     │                      │             │
  └─────────┼─────────────────────┼──────────────────────┼─────────────┘
            │                     │                      │
            ▼                     ▼                      ▼
      ┌───────────┐         ┌───────────┐         ┌───────────┐
      │ Dashboards │         │  Target   │         │  Campaigns│
      │  Reports  │         │  Email    │         │  Journeys │
      └───────────┘         │  Ads      │         └───────────┘
                            └───────────┘
```

---

## 📁 File Location

This ERD document is used for:
1. **Episode 4** - XDM Schema Design tutorial
2. **Episode 9** - Cross-Channel Journey Analysis
3. **AEP Implementation Reference**

---

**Document Version:** 1.0  
**Created:** January 2026  
**Author:** TLP Airways Analytics Team
