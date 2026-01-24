# 🎬 TLP Airways - Adobe Analytics Masterclass Video Scripts

> **Series Title: "Mastering Airline Analytics with Adobe Experience Platform"**
> 
> For Marketers, Developers & MarTech Leaders who want to understand 
> complex tracking implementations in the travel industry

---

## 🎯 Series Repositioning

| Attribute | Details |
|-----------|---------|
| **Focus** | Adobe Analytics, AEP Web SDK, CJA, CDP Integration |
| **Context** | Airlines/Travel Industry (using TLP Airways as sandbox) |
| **Target Audience** | Marketers, MarTech Leads, Implementation Specialists, Solution Architects |
| **Takeaway** | Master complex analytics tracking in high-value e-commerce scenarios |

---

# 📹 EPISODE 1: "Why Airlines Are the Ultimate Analytics Challenge"

**Duration:** 20-25 minutes  
**Style:** Industry deep-dive with live demo  
**Goal:** Set the stage - why airline analytics is complex and what we'll master

---

## 🎬 COLD OPEN (0:00 - 1:00)

```
[SCREEN: Montage of airline websites - Emirates, Delta, IndiGo booking flows]

SCRIPT:
"A single flight booking can generate over 50 distinct tracking events.

Search. Filter. Select. Abandon. Return. Compare. 
Add baggage. Remove baggage. Select seat. Change seat.
Enter passenger details. Validate. Fail validation. Retry.
Enter payment. Fail payment. Succeed. Confirmation.

[Show quick flash of data layer events in console]

Each of these moments is a data point.
Each data point tells a story.
And if you're a marketer, developer, or MarTech lead 
working in travel, hospitality, or complex e-commerce...
understanding how to capture, structure, and analyze these moments 
is your competitive advantage.

I'm [Your Name], and in this series, I'll show you how to build 
production-grade analytics tracking for an airline booking system 
using AEP Web SDK, Customer Journey Analytics, and Real-Time CDP.

But we're going beyond tracking. 
I'll walk you through the data model, the data flow, 
and how to activate that data — with Adobe Target personalization, 
Brevo email confirmations, Twilio SMS and WhatsApp alerts, 
and even an Event Forwarding pipeline to S3 
for creative use cases like weather-based destination recommendations.

This isn't fragmented advice. 
This is the full stack — from Web SDK to Event Forwarding — built for production, 
and we're starting from the basics.

And while we're using an airline as our sandbox, 
these principles apply everywhere — 
e-commerce, hospitality, banking, insurance, healthcare. 
Any industry with a complex customer journey will benefit from this approach.

Let's begin."
```

**[VISUAL: Animated intro - 5 seconds]**

---

## 📍 CHAPTER 1: The Airlines Analytics Challenge (1:00 - 6:00)

```
[SCREEN: Whiteboard/diagram or slide deck]

SCRIPT:
"Let me explain why airline booking is considered 
the most complex analytics challenge in e-commerce.

**Challenge #1: Multi-Step, Non-Linear Journeys**

[Draw or show journey diagram]

Unlike simple e-commerce where you browse → add to cart → checkout,
airline booking is a maze.

A user might:
- Search for BLR to DEL on Monday
- Abandon, come back Thursday
- Search BLR to BOM instead
- Compare 5 different flights
- Almost book, then change the date
- Finally book... with a completely different route

How do you stitch this journey together?
How do you attribute the conversion correctly?
That's where AEP's identity stitching becomes critical.

**Challenge #2: Complex Product Structure**

In retail, a product is a SKU - a shirt, a phone.
In airlines, what's the product?

[Show product breakdown]

Is it:
- The flight itself? (TL-234 BLR→DEL)
- The seat? (12A extra legroom)
- The fare class? (economy, business)
- The ancillary bundle? (meal + baggage + priority)
- Or the entire itinerary? (roundtrip with connections)

The answer? ALL OF THEM.
And each needs separate tracking for proper revenue attribution.

**Challenge #3: Dynamic Pricing**

The same seat on the same flight can cost 
₹5,000 in the morning and ₹8,000 by evening.

Your analytics needs to capture:
- Price at time of search
- Price at time of selection  
- Price at time of booking
- And the delta between them

This is crucial for pricing optimization and marketing attribution.

**Challenge #4: Multiple Passengers, Multiple Legs**

A single booking might include:
- 3 passengers (adult + child + infant)
- 2 flight legs (outbound + return)
- 6 ancillary selections (2 per passenger per leg)

That's ONE transaction, but your data layer needs to 
decompose it into its constituent parts 
for meaningful analysis in CJA.

**Challenge #5: Consent & Privacy**

Airlines collect PII: names, emails, passport numbers, phone numbers.
GDPR, CCPA, India's DPDP Act - you need consent management 
that integrates with your analytics stack.

This is the world we're diving into.
And TLP Airways is our sandbox to master it."
```

---

## 📍 CHAPTER 2: The TLP Airways Sandbox (6:00 - 10:00)

```
[SCREEN: Browser showing TLP Airways website]

SCRIPT:
"TLP Airways is a fully functional airline booking demo 
I built specifically for Adobe Experience Platform training.

Let me give you a quick tour - not of the UI, 
but of the ANALYTICS TOUCHPOINTS.

[Navigate to homepage]

**Homepage**
- pageView with page metadata
- Promotional banner impressions
- User authentication state

[Go to search page]

**Search**
Here's where it gets interesting.

Every field interaction is a potential event:
- Origin selection
- Destination selection
- Date picker interaction
- Passenger count changes
- Cabin class selection
- Trip type toggle (one-way vs roundtrip)

When they click 'Search', we fire 'flightSearchInitiated' 
with the complete search context.

[Submit search, show results]

**Results Page**
- searchResultsDisplayed with result count and timing
- Impression tracking for each flight shown
- Filter interactions
- Sort changes
- flightSelected when they choose

[Select flight, proceed to traveller details]

**Traveller Details**
- Form field engagement
- Validation errors (gold for UX optimization)
- Time spent per field

[Show ancillary services]

**Ancillary Services**
This is where airlines make 30% of their revenue.

- Seat map interactions (which seats are they looking at?)
- Meal selection
- Baggage upgrades
- Priority services

Each selection is revenue. Each is tracked.

[Proceed to payment]

**Payment**
- Payment method selection
- Card type detection
- Payment attempts (success/failure)
- Error tracking

[Show confirmation]

**Confirmation**
The crown jewel:
- commerce.purchases event
- Complete revenue attribution
- Product breakdown
- Customer identity

This entire flow - every click, every decision - 
feeds into Adobe Analytics and AEP.

That's what we're going to implement and analyze."
```

---

## 📍 CHAPTER 3: The Adobe Stack We'll Use (10:00 - 15:00)

```
[SCREEN: Adobe Experience Cloud architecture diagram]

SCRIPT:
"Let me introduce the Adobe tools we'll be working with.

**AEP Web SDK (Alloy.js)**

[Show Web SDK documentation or diagram]

This is the modern way to send data to Adobe.
One SDK replaces:
- AppMeasurement (legacy Analytics)
- AT.js (Target)
- DIL (Audience Manager)
- ECID Service

Instead of multiple tags firing separately,
Web SDK sends a single payload to Adobe Edge Network,
which routes it to Analytics, Target, AEP - wherever it needs to go.

For airlines, this means:
- Faster page loads (critical for conversion)
- Consistent identity across touchpoints
- Real-time data availability

**Adobe Experience Platform (AEP)**

[Show AEP interface or diagram]

AEP is Adobe's Customer Data Platform.
It's where all your data comes together:
- Web interactions (via Web SDK)
- Mobile app events
- Call center data
- CRM data
- Offline purchases

For our airline, we'll create XDM schemas that model:
- Flight search behavior
- Booking transactions
- Customer profiles
- Loyalty programs

**Customer Journey Analytics (CJA)**

[Show CJA interface briefly]

CJA is the next generation of Adobe Analytics.
It sits on top of AEP and lets you:
- Analyze cross-channel journeys
- Apply segments retroactively
- Compare cohorts over time
- Build custom attribution models

We'll use CJA to answer questions like:
- What's the path from search to booking?
- How does ancillary attachment rate vary by route?
- What's the impact of price sensitivity on conversion?

**Real-Time CDP**

[Show CDP concept]

This is where we activate our audience segments.
Once we've identified high-value behaviors,
we can push audiences to:
- Adobe Target for personalization
- Email platforms for retargeting
- Ad platforms for suppression or lookalikes

The entire stack works together.
Web SDK captures → AEP stores → CJA analyzes → CDP activates.

By the end of this series, you'll understand 
how to implement and leverage each of these components."
```

---

## 📍 CHAPTER 4: What You'll Master (15:00 - 18:00)

```
[SCREEN: Series overview / roadmap]

SCRIPT:
"Here's what's coming in this series.

**Episode 2: Mapping the Airline Data Layer**
We'll document every trackable moment in the booking flow.
You'll learn how to think about data layer design 
for complex, multi-step journeys.

**Episodes 3-4: AEP Web SDK Implementation**
Hands-on implementation of the Web SDK.
We'll configure datastreams, set up XDM schemas,
and fire events from search through purchase.

**Episode 5: XDM Schema Design for Airlines**
Deep dive into Experience Data Model.
How do you structure flight data, passenger data, 
transaction data in XDM?

**Episode 6: E-Commerce Tracking & Revenue Attribution**
The purchase event is everything.
We'll break down product arrays, revenue calculation,
and proper attribution for multi-product bookings.

**Episode 7: Identity & Consent Management**
How to hash PII correctly,
implement consent with Adobe's consent framework,
and handle authenticated vs anonymous users.

**Episode 8: Connecting to CJA**
Building connections and data views in CJA.
Creating calculated metrics for airline-specific KPIs.

**Episode 9: Building Airline Dashboards in CJA**
Practical dashboards: conversion funnels,
route performance, ancillary attachment,
abandonment analysis.

**Episode 10: Real-Time CDP Activation**
Creating segments and pushing them to downstream systems.
Practical use cases for personalization and retargeting.

**Episode 11: Adobe Target Integration**
A/B testing and personalization using the same data.
Offer decisioning based on search behavior.

**Episode 12: Series Finale - End-to-End Demo**
Complete walkthrough from raw event to personalized experience.

This is a comprehensive masterclass.
By the end, you'll be able to architect and implement
analytics tracking for any complex e-commerce scenario."
```

---

## 📍 CHAPTER 5: Prerequisites & Access (18:00 - 21:00)

```
[SCREEN: Setup requirements]

SCRIPT:
"To follow along, here's what you'll need.

**Option A: You Have Adobe Access**

If your organization has AEP and CJA licenses,
you can implement everything we discuss in your own sandbox.
I'll show you the exact configurations.

**Option B: You're Learning**

If you're studying for certification or exploring,
you can still follow along conceptually.
I'll explain everything in detail so you understand 
the 'why' behind each implementation choice.

Adobe offers free trial sandboxes for AEP - 
link is in the description.

**The TLP Airways Demo**

The website is live at [your-url].
You can interact with it and watch events fire in your console.

The code is on GitHub - not because you need to build it,
but so you can see exactly how each tracking event is implemented.
This is a reference implementation you can adapt.

**Who This Series is For**

If you're:
- A marketer who wants to understand what's possible
- A developer implementing analytics for an agency client
- A MarTech lead architecting your company's data strategy
- A consultant helping travel brands with their Adobe stack

...this series is for you.

You don't need to be a full-stack developer.
You DO need curiosity and willingness to dig into data."
```

---

## 📍 CLOSING & CTA (21:00 - 22:30)

```
[SCREEN: Subscribe prompt, links]

SCRIPT:
"Airline analytics is complex. 
But complexity is where value lives.

If you can master tracking for a multi-step, multi-passenger,
dynamic-pricing, ancillary-heavy booking flow...
you can track anything.

That's what we're going to do together.

In the next episode, we're going to map out 
the complete airline data layer - 
every event, every property, every business question it answers.

Hit subscribe and the notification bell 
so you don't miss it.

If you're already working on Adobe Analytics or AEP 
and have questions about airline or travel tracking,
drop them in the comments. 
I'll address them in the series.

I'm [Your Name]. 
See you in Episode 2."

[END CARD: 10 seconds with subscribe, links]
```

---

## 🎬 B-ROLL & VISUALS FOR EPISODE 1

- [ ] Airline website montage (Emirates, Delta, IndiGo, United)
- [ ] Data layer console output scrolling (looks impressive)
- [ ] AEP interface screenshots
- [ ] CJA dashboard screenshots
- [ ] Architecture diagram animation
- [ ] Journey flow animation

---
---

# 📹 EPISODE 2: "Mapping the Airline Data Layer - Every Event That Matters"

**Duration:** 25-30 minutes  
**Style:** Workshop/documentation session  
**Goal:** Complete data layer blueprint for airline tracking

---

## 🎬 COLD OPEN (0:00 - 0:45)

```
[SCREEN: Spreadsheet or documentation template]

SCRIPT:
"Before you write a single line of tracking code,
you need a data layer specification.

This document becomes your contract between 
marketing, analytics, and engineering.
It answers: What are we tracking? Why? What does it look like?

Today, I'm going to give you the complete data layer 
for an airline booking system.
Event by event. Property by property.
With business justification for every decision.

By the end of this episode, you'll have a template 
you can use for any travel or complex e-commerce implementation.

Let's document."
```

**[VISUAL: Animated intro - 5 seconds]**

---

## 📍 CHAPTER 1: Data Layer Design Principles (0:45 - 4:00)

```
[SCREEN: Slides or whiteboard]

SCRIPT:
"Before we dive into events, let's establish 
some design principles for data layers.

**Principle 1: Event-Driven, Not Page-Driven**

The old way: fire a pageView, stuff everything in it.
The modern way: discrete events for discrete actions.

In a single-page booking flow, you might have 
10 meaningful events without a single traditional 'page load'.
Your data layer needs to capture those.

**Principle 2: Business Questions Drive Data Points**

Never track something just because you can.
For every property, ask: 
'What business question does this answer?'

If you can't answer that, don't track it.
It's noise that clouds your analysis.

**Principle 3: Hierarchy & Context**

Events don't exist in isolation.
A flightSelected event is meaningless without:
- Which search triggered it?
- Which results were shown?
- What was the user's profile?

Context links events together into journeys.

**Principle 4: Consistent Naming**

originCity not origin_city not OriginCity.
Pick a convention and stick to it.
I use camelCase for properties, hyphenated-lowercase for event names.

**Principle 5: Plan for XDM**

If you're using AEP, your data layer will map to XDM schemas.
Design with that in mind - 
understand field groups, data types, relationships.

Let's apply these principles to our airline tracking."
```

---

## 📍 CHAPTER 2: The Complete Event Inventory (4:00 - 18:00)

```
[SCREEN: Documentation/Spreadsheet + Browser side by side]

SCRIPT:
"I'm going to walk through every event in the booking flow.
I'll show you the event structure and explain 
the business value of each property.

---

**EVENT 1: pageView**

[Show schema]

{
  "event": "pageView",
  "page": {
    "pageInfo": {
      "pageName": "TLP Airways | Search Flights",
      "pageURL": "https://tlpairways.com/search",
      "pageType": "search",
      "channel": "web",
      "siteSection": "booking"
    }
  },
  "user": {
    "authState": "authenticated" | "anonymous",
    "hashedUserId": "sha256...",
    "loyaltyTier": "gold" | "silver" | "standard"
  }
}

Business Questions Answered:
- Which pages get the most traffic?
- How does authenticated vs anonymous behavior differ?
- Where do loyalty members spend their time?

---

**EVENT 2: flightSearchInitiated**

This fires when the user submits a search.

[Show schema + fire event on site]

{
  "event": "flightSearchInitiated",
  "search": {
    "searchId": "srch_1705612345_abc",  // Unique ID for stitching
    "origin": "BLR",
    "originCity": "Bangalore",
    "destination": "DEL",
    "destinationCity": "New Delhi",
    "route": "BLR-DEL",                 // Pre-concatenated for easy segmenting
    "departureDate": "2026-02-15",
    "returnDate": "2026-02-20",
    "tripType": "roundtrip",
    "daysUntilDeparture": 27,           // Calculated - travel intent signal
    "tripDuration": 5,                  // Number of days
    "passengers": {
      "total": 2,
      "adults": 2,
      "children": 0,
      "infants": 0
    },
    "cabinClass": "economy",
    "flexibleDates": false
  },
  "timestamp": "2026-01-19T14:30:00Z"
}

Business Questions Answered:
- Most popular routes?
- How far in advance do customers book?
- What's the average party size?
- How does cabin class preference vary by route?
- What percentage are one-way vs roundtrip?

The searchId is CRITICAL. 
It links this search to the results and any eventual booking.

---

**EVENT 3: searchResultsDisplayed**

[Show search results on site, point to event]

{
  "event": "searchResultsDisplayed",
  "search": {
    "searchId": "srch_1705612345_abc",  // Links to the search
    "totalResults": 8,
    "onwardFlights": 4,
    "returnFlights": 4,
    "loadTime": 1.2,                     // Seconds - performance metric
    "lowestPrice": 4500,
    "highestPrice": 12000,
    "currency": "INR",
    "averagePrice": 7250
  },
  "appliedFilters": [],
  "sortOrder": "price-low-high"
}

Business Questions Answered:
- Search to zero-results rate?
- Price distribution per route?
- Performance impact on conversion?
- Which filters are used most?

---

**EVENT 4: flightSelected**

User clicks on a specific flight.

[Click a flight on results page]

{
  "event": "flightSelected",
  "flight": {
    "flightNumber": "TL-234",
    "airline": "TLP Airways",
    "origin": "BLR",
    "destination": "DEL",
    "departureTime": "08:00",
    "arrivalTime": "10:30",
    "duration": "2h 30m",
    "durationMinutes": 150,
    "stops": 0,
    "stopType": "non-stop",
    "aircraft": "A320",
    "cabinClass": "economy",
    "fareClass": "discount",             // Pricing bucket
    "price": 5000,
    "pricePerPax": 5000,
    "currency": "INR",
    "seatsRemaining": 12                 // Scarcity signal
  },
  "selection": {
    "journeyType": "onward",             // or "return"
    "resultPosition": 2,                 // Was it the first result? Third?
    "selectionMethod": "click"           // vs keyboard, etc.
  },
  "searchContext": {
    "searchId": "srch_1705612345_abc"
  }
}

Business Questions Answered:
- Which flights convert best?
- Does position in results matter?
- How does price sensitivity vary by route?
- Does scarcity messaging work?

resultPosition is huge for merchandising optimization.
If users always pick the second result, your ranking algorithm might be wrong.

---

**EVENT 5: ancillaryViewed**

[Navigate to ancillary services page]

{
  "event": "ancillaryViewed",
  "ancillary": {
    "type": "seatmap" | "meals" | "baggage" | "priority",
    "viewDuration": null,                // Filled on exit
    "interactionCount": 0
  },
  "bookingContext": {
    "bookingId": "bkg_1705612345_xyz"
  }
}

Fires when users VIEW each ancillary section.
Even without selection, views tell you about intent.

---

**EVENT 6: ancillarySelected**

[Select a seat on the seat map]

{
  "event": "ancillarySelected",
  "ancillary": {
    "type": "seat",
    "seatNumber": "12A",
    "seatType": "window",
    "seatCategory": "extra-legroom",
    "price": 500,
    "currency": "INR",
    "passenger": 1,
    "journey": "onward"
  },
  "bookingContext": {
    "bookingId": "bkg_1705612345_xyz"
  }
}

Pro move: Track what they UNSELECT too (ancillaryRemoved).
Reveals price sensitivity and decision patterns.

---

**EVENT 7: paymentMethodSelected**

[Navigate to payment page]

{
  "event": "paymentMethodSelected",
  "payment": {
    "method": "credit-card",
    "provider": "visa",
    "isDefault": false
  }
}

---

**EVENT 8: paymentSubmitted**

{
  "event": "paymentSubmitted",
  "payment": {
    "transactionId": "txn_1705612345",
    "amount": 12500,
    "currency": "INR",
    "method": "credit-card"
  }
}

---

**EVENT 9: paymentFailed**

CRITICAL for debugging conversion drops.

{
  "event": "paymentFailed",
  "payment": {
    "transactionId": "txn_1705612345",
    "errorCode": "CVV_INVALID",
    "errorMessage": "Card security code is incorrect",
    "attemptNumber": 1
  }
}

Track every failure. The error codes tell you 
whether it's user error or system error.

---

**EVENT 10: purchase (commerce.purchases)**

The big one. The conversion event.

[Show confirmation page]

{
  "event": "purchase",
  "commerce": {
    "purchases": {
      "value": 1
    }
  },
  "transaction": {
    "transactionId": "TXN20260119ABC123",
    "revenue": 12500,
    "currency": "INR",
    "tax": 750,
    "convenienceFee": 200
  },
  "products": [
    {
      "sku": "TL-234",
      "name": "Flight BLR-DEL",
      "category": "flight",
      "subcategory": "onward",
      "price": 5000,
      "quantity": 2,
      "route": "BLR-DEL",
      "cabinClass": "economy"
    },
    {
      "sku": "TL-789",
      "name": "Flight DEL-BLR",
      "category": "flight",
      "subcategory": "return",
      "price": 4500,
      "quantity": 2,
      "route": "DEL-BLR",
      "cabinClass": "economy"
    },
    {
      "sku": "seat_extraleg",
      "name": "Extra Legroom Seat",
      "category": "ancillary",
      "subcategory": "seat",
      "price": 500,
      "quantity": 2
    },
    {
      "sku": "baggage_20kg",
      "name": "20kg Checked Baggage",
      "category": "ancillary",
      "subcategory": "baggage",
      "price": 1000,
      "quantity": 1
    }
  ],
  "booking": {
    "bookingReference": "PNR-ABC123",
    "passengers": 2,
    "tripType": "roundtrip"
  },
  "customer": {
    "hashedEmail": "sha256...",
    "loyaltyTier": "standard"
  }
}

This structure allows you to:
- Measure total revenue
- Break down by flight vs ancillary
- Calculate ancillary attach rate
- Segment by route, cabin, etc.

The products array is the key.
Each line item gets its own entry for proper analysis."
```

---

## 📍 CHAPTER 3: Calculated Properties & Enrichment (18:00 - 22:00)

```
[SCREEN: Documentation]

SCRIPT:
"Some properties shouldn't be tracked raw - 
they should be calculated at tracking time.

**Days Until Departure**
Don't track just the date.
Calculate and track daysUntilDeparture.
This is how you segment 'last-minute bookers' vs 'planners'.

**Trip Duration**
Calculate the number of days between outbound and return.
Weekend trips vs week-long vacations behave differently.

**Route Concatenation**
Instead of making analysts concatenate origin + destination,
do it in the data layer: 'BLR-DEL'.
Makes segmenting in CJA much easier.

**Sector Type**
International vs domestic.
Calculated based on origin/destination country codes.

**Haul Type**
Short haul (<3 hours), medium haul (3-6), long haul (>6).
Based on flight duration.

**Price Per Passenger**
Total price divided by passenger count.
Enables fair comparison across party sizes.

These enrichments save hours of analysis time downstream."
```

---

## 📍 CHAPTER 4: The Data Layer Specification Document (22:00 - 26:00)

```
[SCREEN: Template/Spreadsheet]

SCRIPT:
"Every implementation should have a formal specification document.
Here's what it should include:

**For Each Event:**

| Field | Description |
|-------|-------------|
| Event Name | flightSearchInitiated |
| Trigger | User submits search form |
| Page/Component | /search - SearchForm component |
| XDM Mapping | commerce.productListViews (or custom) |

**For Each Property:**

| Property | Type | Required | Example | Business Question |
|----------|------|----------|---------|-------------------|
| search.origin | String (IATA) | Yes | "BLR" | Route popularity |
| search.daysUntilDeparture | Number | Yes | 27 | Booking window |
| search.tripType | Enum | Yes | "roundtrip" | Trip type split |

The 'Business Question' column is crucial.
If you can't fill it in, reconsider whether you need the property.

I've created a template document for TLP Airways 
that you can adapt for your implementations.
Link is in the description."
```

---

## 📍 CLOSING & CTA (26:00 - 27:30)

```
[SCREEN: Documentation + next episode preview]

SCRIPT:
"You now have a complete event inventory for airline tracking.
10+ events, dozens of properties, all with business justification.

This is your blueprint.
Whether you're implementing from scratch or auditing an existing setup,
this document is your reference.

Download the specification template from the description.
Adapt it for your use case.

In the next episode, we're implementing this 
using AEP Web SDK.
We'll configure datastreams, set up the SDK,
and start firing these events for real.

Subscribe and I'll see you there."

[END CARD: 10 seconds]
```

---
---

# 📹 EPISODE 3: "AEP Web SDK Setup - From Zero to First Event"

**Duration:** 28-32 minutes  
**Style:** Technical implementation walkthrough  
**Goal:** Complete Web SDK configuration and fire first events

---

## 🎬 COLD OPEN (0:00 - 0:45)

```
[SCREEN: AEP Interface + Code editor]

SCRIPT:
"Data layer design is theory.
Web SDK implementation is reality.

Today we're going to:
- Configure a datastream in AEP
- Install and initialize the Web SDK
- Fire our first pageView and search events
- Verify the data lands in AEP

By the end of this episode, you'll have 
real events flowing from your website to Adobe Experience Platform.

Let's implement."
```

**[VISUAL: Animated intro - 5 seconds]**

---

## 📍 CHAPTER 1: AEP Datastream Configuration (0:45 - 8:00)

```
[SCREEN: AEP Data Collection interface]

SCRIPT:
"First, we need to tell AEP where to send our data.
That's what a datastream does.

[Navigate to Data Collection > Datastreams]

I'll create a new datastream for TLP Airways.

**Step 1: Basic Configuration**

Click 'New Datastream'.

Name: 'TLP Airways - Production'
Description: 'Web tracking for airline booking demo'
Mapping Schema: This is important - select your XDM schema.

[Select Commerce schema or custom schema]

The schema defines what data AEP expects.
If your events don't match the schema, they'll fail validation.
We'll dive into schema design in Episode 5.

**Step 2: Add Services**

Now we tell the datastream what to DO with the data.

[Click 'Add Service']

Adobe Analytics:
- Report Suite: [Your report suite ID]
- This sends data to your existing Analytics implementation

Adobe Experience Platform:
- Event Dataset: [Select your dataset]
- This stores raw event data in AEP

Adobe Target: 
- Enable if you want personalization

Adobe Audience Manager:
- Enable for legacy audience needs

For TLP Airways, I'm enabling:
- Analytics (for traditional reporting)
- AEP (for CJA and CDP)
- Target (for personalization later)

[Save configuration]

Note the Datastream ID - we'll need this for SDK configuration.
Also copy the Edge endpoint URL.

**Step 3: Environment Configuration**

Datastreams have environments: Development, Staging, Production.
Each has its own ID.

For implementation, start with Development.
You can override settings per environment 
(like disabling certain services in dev).

That's our datastream configured.
Now let's install the SDK."
```

---

## 📍 CHAPTER 2: Web SDK Installation (8:00 - 14:00)

```
[SCREEN: Code editor + Browser]

SCRIPT:
"There are two ways to install the Web SDK:
1. NPM package (for React/Next.js apps)  
2. Launch tag (for tag manager deployments)

I'll show you the NPM approach since that's what TLP Airways uses.

[Open terminal]

**Installation**

npm install @adobe/alloy

That's it. The SDK is now available.

**Configuration**

[Open or create the analytics configuration file]

Create a file: lib/analytics/adobeConfig.ts

import { configure } from '@adobe/alloy';

// Initialize the Web SDK
configure({
  // Datastream ID from AEP
  edgeConfigId: 'your-datastream-id-here',
  
  // Your AEP organization ID
  orgId: 'your-org-id@AdobeOrg',
  
  // Edge domain (default works for most)
  edgeDomain: 'edge.adobedc.net',
  
  // Collect standard web events
  defaultConsent: 'pending',
  
  // Identity settings
  idMigrationEnabled: true,
  thirdPartyCookiesEnabled: false,
  
  // Debugging (disable in production)
  debugEnabled: true
});

Let me explain the key settings:

**edgeConfigId**: Your datastream ID from step 1.

**orgId**: Find this in AEP Admin > Organization Settings.

**defaultConsent**: 
- 'in' = collect data immediately (risky for GDPR)
- 'pending' = wait for consent (recommended)
- 'out' = don't collect until explicit consent

We start with 'pending' and set it to 'in' 
after the user accepts cookies.

**debugEnabled**: 
Set to true during development.
You'll see every network request in the console.
MUST be false in production.

**Initialization Timing**

The SDK should initialize as early as possible.
In Next.js, we do this in _document.tsx or _app.tsx.

[Show the initialization code in the appropriate file]

This ensures the SDK is ready before any events fire."
```

---

## 📍 CHAPTER 3: Firing Your First Event (14:00 - 22:00)

```
[SCREEN: Code editor + Browser with DevTools]

SCRIPT:
"SDK is configured. Let's fire some events.

**The sendEvent Command**

All events go through the same function: sendEvent.

[Create or open the data layer service]

import { sendEvent } from '@adobe/alloy';

// Fire a page view
async function trackPageView(pageData) {
  const result = await sendEvent({
    // The XDM object contains your data
    xdm: {
      eventType: 'web.webpagedetails.pageViews',
      web: {
        webPageDetails: {
          name: pageData.pageName,
          URL: pageData.pageURL,
          siteSection: pageData.siteSection
        }
      },
      // Custom data goes in _experience or custom fields
      _experience: {
        analytics: {
          customDimensions: {
            eVars: {
              eVar1: pageData.pageType
            }
          }
        }
      }
    }
  });
  
  console.log('Page view sent:', result);
}

The xdm object follows your schema structure.
eventType tells AEP what kind of event this is.

**Standard Event Types**

Adobe has predefined event types:
- web.webpagedetails.pageViews (page loads)
- commerce.productListViews (search results)
- commerce.productViews (product detail)
- commerce.purchases (conversions)

Using standard types enables automatic reporting in Analytics.

**Firing on Page Load**

[Open a page component, e.g., search.tsx]

In our Next.js pages, we fire on component mount:

useEffect(() => {
  trackPageView({
    pageName: 'TLP Airways | Search Flights',
    pageURL: window.location.href,
    siteSection: 'booking',
    pageType: 'search'
  });
}, []);

**Let's Test It**

[Open browser, navigate to the site, open DevTools > Network tab]

Filter by 'edge.adobedc.net' or 'interact'.

[Navigate to a page]

There! See that request?
That's our pageView event going to Adobe Edge.

[Click on the request, show the payload]

Look at the request body.
There's our XDM data, exactly as we structured it.

The response shows:
- Handle from Analytics 
- Handle from AEP
- Any errors or warnings

**Debugging**

If debugEnabled is true, check the console.
You'll see verbose logging of every event.

[Show console output]

'[alloy] Executing sendEvent command'
'[alloy] XDM: { ... }'
'[alloy] Response received from edge'

This is your best friend during implementation."
```

---

## 📍 CHAPTER 4: Implementing Search Tracking (22:00 - 28:00)

```
[SCREEN: Code implementation]

SCRIPT:
"Let's implement a real event: flightSearchInitiated.

[Open the search page or search handler]

When the user submits a search, we call:

async function trackFlightSearch(searchParams) {
  await sendEvent({
    xdm: {
      eventType: 'commerce.productListViews',
      commerce: {
        productListViews: {
          value: 1
        }
      },
      // Custom search data
      _tlpairways: {
        search: {
          searchId: generateSearchId(),
          origin: searchParams.from,
          originCity: getAirportCity(searchParams.from),
          destination: searchParams.to,
          destinationCity: getAirportCity(searchParams.to),
          route: `${searchParams.from}-${searchParams.to}`,
          departureDate: searchParams.departureDate,
          returnDate: searchParams.returnDate,
          tripType: searchParams.returnDate ? 'roundtrip' : 'oneway',
          daysUntilDeparture: calculateDaysUntil(searchParams.departureDate),
          passengers: {
            total: searchParams.passengerCount,
            adults: searchParams.adults,
            children: searchParams.children,
            infants: searchParams.infants
          },
          cabinClass: searchParams.cabinClass
        }
      }
    }
  });
}

Note: _tlpairways is a custom field group in our XDM schema.
This is where airline-specific data lives.

**Calling It**

In the search form submit handler:

const handleSearch = async (formData) => {
  // Track the search
  await trackFlightSearch(formData);
  
  // Navigate to results
  router.push(`/results?${buildQueryString(formData)}`);
};

**Validation in AEP**

[Switch to AEP interface, show dataset or debugging]

After firing events, you can validate in AEP:
- Datasets > Preview Data
- Assurance (for real-time debugging)

You should see your events appearing with all the properties we defined.

If something's missing or wrong, check:
1. Schema validation errors in the response
2. Network errors in DevTools
3. SDK console logs"
```

---

## 📍 CHAPTER 5: Common Implementation Gotchas (28:00 - 30:00)

```
[SCREEN: Troubleshooting tips]

SCRIPT:
"Before we wrap, let me save you hours of debugging.

**Gotcha 1: Consent Blocking Events**
If defaultConsent is 'pending', events queue but don't send 
until you call setConsent({ consent: [{ standard: 'Adobe', version: '2.0', value: { general: 'in' } }] }).
Many devs forget this and wonder why no data appears.

**Gotcha 2: Schema Mismatch**
If your XDM doesn't match your schema, events fail silently (or with cryptic errors).
Always validate against your schema.

**Gotcha 3: Missing orgId**
The organization ID format is specific: 'XXXXX@AdobeOrg'.
Get it from Admin Console, not from anywhere else.

**Gotcha 4: CORS Issues**
If you see CORS errors, check your datastream configuration.
Allowed domains must include your development URLs.

**Gotcha 5: Duplicate Events**
React's double-render in StrictMode can cause duplicate events.
Use a flag or check to prevent double-firing.

Keep these in mind and you'll have a smooth implementation."
```

---

## 📍 CLOSING & CTA (30:00 - 31:30)

```
[SCREEN: Summary + next episode]

SCRIPT:
"We've gone from zero to firing real events.

Today you learned:
- How to configure a datastream in AEP
- How to install and initialize the Web SDK
- How to fire pageView and search events
- How to validate data is flowing

Your homework: 
Implement the flight selection event (flightSelected) 
we documented in Episode 2.
Post your XDM structure in the comments - I'll review them.

Next episode, we're going deep on XDM schema design.
How do you model flights, passengers, and transactions 
in Adobe's Experience Data Model?

It's foundational knowledge for any AEP implementation.

Subscribe and I'll see you in Episode 4."

[END CARD: 10 seconds]
```

---

## 🎬 B-ROLL & VISUALS FOR EPISODE 3

- [ ] AEP interface navigation
- [ ] Code typing in VS Code
- [ ] Network tab showing successful requests
- [ ] Console output with SDK debugging
- [ ] Schema validation success/error examples

---

# 📋 EPISODE COMPARISON: OLD vs NEW FOCUS

| Episode | OLD (Web Dev Tutorial) | NEW (Adobe Analytics Masterclass) |
|---------|------------------------|-----------------------------------|
| Ep 1 | "How to build an airlines website" | "Why airlines are the ultimate analytics challenge" |
| Ep 2 | "Project setup and folder structure" | "Mapping the complete airline data layer" |
| Ep 3 | "Design system with Material-UI" | "AEP Web SDK implementation" |
| Target | Web developers | Marketers, MarTech leads, analytics implementers |
| Takeaway | Build a project | Master complex analytics tracking |

---

**Script Version:** 2.0 (Adobe Analytics Focus)  
**Created:** January 2026  
**Author:** TLP Airways Team
