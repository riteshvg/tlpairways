# 🎬 TLP Airways - Learning Airline Analytics Together

> **Series Title: "Figuring Out Airline Analytics with Adobe Experience Platform"**
> 
> A learning journey for Marketers, Developers & MarTech folks 
> who want to understand tracking in the travel industry

---

## 🎯 Series Approach

| Attribute | Details |
|-----------|---------|
| **Focus** | Adobe Analytics, AEP Web SDK, CJA, CDP Integration |
| **Context** | Airlines/Travel Industry (using TLP Airways as our sandbox) |
| **Target Audience** | Marketers, MarTech Leads, Implementation Specialists, Solution Architects |
| **Vibe** | Learning together - not a lecture, but an exploration |
| **Development Approach** | AI-Assisted with Cursor IDE + LLMs (Claude/Gemini) |

---

## 🤖 AI-Assisted Development: A Key Part of This Story

This series isn't just about Adobe Analytics and AEP — it's also about **how we built this application**. And that story involves AI.

### The Tools We Used

| Tool | Purpose | How We Used It |
|------|---------|---------------|
| **Cursor IDE** | AI-powered code editor | Primary development environment with built-in AI assistance |
| **Claude (Anthropic)** | LLM for code generation | Complex logic, schema design, architecture decisions |
| **Gemini (Google)** | LLM for code review & docs | Documentation, testing strategies, code optimization |
| **GitHub Copilot** | Inline code completion | Faster coding for repetitive patterns |

### What AI Helped Us Build

- **Data Layer Architecture** — Complex event structures and XDM schema mappings
- **React/Next.js Components** — UI components with proper TypeScript typing
- **Analytics Integration** — Adobe Data Layer implementation with proper event sequencing
- **Email Templates** — Responsive HTML email templates for booking confirmations
- **Testing Scripts** — Cypress E2E tests and validation utilities
- **Documentation** — ERDs, API documentation, implementation guides

### Why This Matters for the Series

1. **It's Authentic** — This is how modern developers actually work
2. **It's Faster** — We built a full airline demo in weeks, not months
3. **It's Educational** — You'll see real AI-developer collaboration workflows
4. **It's Replicable** — You can use the same approach for your projects

> 💡 **Pro Tip:** Throughout this series, we'll occasionally highlight where AI helped us solve a tricky problem — like designing the XDM schema or debugging consent flows.

---

# 📹 EPISODE 1: "Why I Built an Airline Booking Demo to Learn Analytics"

**Duration:** 20-25 minutes  
**Style:** Honest conversation with live demo  
**Goal:** Share why airline analytics is genuinely challenging and what we're attempting to learn

---

## 🎬 COLD OPEN (0:00 - 1:00)

```
[SCREEN: Montage of airline websites - Emirates, Delta, IndiGo booking flows]

SCRIPT:
"I've been working with Adobe Analytics and AEP for a while now, 
and honestly? There's still a lot I'm figuring out.

But here's what I've noticed:
The most complex tracking problems I've encountered 
come from the travel industry — especially airlines.

Search. Filter. Select. Abandon. Return. Compare. 
Add baggage. Remove baggage. Select seat. Change seat.
Enter passenger details. Fail validation. Retry.
Payment fails. Try again. Finally, confirmation.

[Show quick flash of data layer events in console]

That's a LOT of data points. 
And I realized — if I could figure out how to track all of this properly, 
I'd understand analytics at a much deeper level.

So I built something. 
A fake airline booking website called TLP Airways.
Not because I'm an expert, but because I wanted to BECOME one.

And here's the honest part:
I didn't build it alone. 
I used Cursor — an AI-powered code editor — with Claude and Gemini as my pair programmers.
They helped me write components, debug tracking issues, design XDM schemas.
Modern development involves AI. Pretending otherwise would be disingenuous.

I'm [Your Name], and in this series, 
I'm going to share what I've learned — and what I'm still learning — 
about analytics for complex booking flows.

We'll use AEP Web SDK, Customer Journey Analytics, Real-Time CDP.
We'll also connect some other tools — 
Brevo for emails, Twilio for SMS, Adobe Target for personalization.

I don't have all the answers. 
But I've done the work, made the mistakes, 
and I think sharing that journey might help others.

And honestly? These patterns apply beyond airlines — 
e-commerce, hospitality, banking, insurance, healthcare. 
Any complex customer journey.

Let's learn together."
```

**[VISUAL: Animated intro - 5 seconds]**

---

## 📍 CHAPTER 1: Why Airlines? Why This Is Hard (1:00 - 6:00)

```
[SCREEN: Whiteboard/diagram or slide deck]

SCRIPT:
"Let me tell you why I chose airlines as my learning project.

I kept hearing that airline booking is one of the 
hardest analytics challenges in e-commerce.
At first, I didn't fully get why.

Now I do. Let me share what I've figured out — 
and honestly, some of this still trips me up.

**Challenge #1: The Journey is a Mess (in a good way)**

[Draw or show journey diagram]

Unlike simple e-commerce where you browse → add to cart → checkout,
airline booking is non-linear.

A person might:
- Search for flights on Monday
- Abandon, come back Thursday
- Search a completely different route
- Compare 5 flights
- Almost book, then change the date
- Finally book something totally different

How do you stitch this together into a coherent story?
That's where identity stitching comes in — 
something I'm still wrapping my head around, honestly.

**Challenge #2: What Even IS the Product?**

This one confused me at first.
In retail, a product is simple — a shirt, a phone.
But in airlines... what's the product?

[Show product breakdown]

Is it:
- The flight? (TL-234 BLR→DEL)
- The seat? (12A extra legroom)
- The fare class? (economy, business)
- The ancillary bundle? (meal + baggage + priority)
- The entire itinerary? (roundtrip with connections)

I think the answer is... all of them?
Each needs separate tracking for proper revenue attribution.
That took me a while to figure out.

**Challenge #3: Prices That Won't Sit Still**

The same seat on the same flight can cost 
₹5,000 in the morning and ₹8,000 by evening.

So your analytics needs to capture:
- Price when they searched
- Price when they selected  
- Price when they actually booked
- And ideally, the difference between them

This matters for understanding price sensitivity.
I'm still not 100% sure I'm capturing this perfectly.

**Challenge #4: Multiple Everything**

A single booking might include:
- 3 passengers (adult + child + infant)
- 2 flight legs (outbound + return)
- 6 ancillary selections (2 per passenger per leg)

That's ONE transaction, but it needs to break down 
into all its parts for meaningful analysis.

This is where the products array in your purchase event 
becomes really important — something we'll work through.

**Challenge #5: Privacy is Complicated Here**

Airlines collect a lot of PII: names, emails, passport numbers, phone numbers.
GDPR, CCPA, India's DPDP Act — consent management is crucial.

I won't pretend I've mastered privacy compliance.
But I've learned enough to implement basic consent flows,
and I'll share what I know.

This is the world we're exploring together.
TLP Airways is my sandbox for learning all of this."
```

---

## 📍 CHAPTER 2: Let Me Show You TLP Airways (6:00 - 10:00)

```
[SCREEN: Browser showing TLP Airways website]

SCRIPT:
"So TLP Airways is a fake airline booking site I built.

It's not perfect — there are definitely edge cases I haven't handled.
But it's functional enough to demonstrate real analytics.

Let me walk you through it — 
not focusing on the UI, but on where tracking happens.

[Navigate to homepage]

**Homepage**
- We fire a pageView when the page loads
- There are promotional banners — eventually I want to track impressions
- We track whether the user is logged in or not

By the way, this UI was built with AI assistance.
I described what I wanted in natural language,
and Cursor helped generate the React components.
Still needed human judgment to polish it, but the scaffolding came fast.

[Go to search page]

**Search**
This is where it gets interesting for me.

Every field is a potential tracking opportunity:
- Origin selection
- Destination selection
- Date picker
- Passenger count
- Cabin class
- One-way vs roundtrip

When they click 'Search', we fire a search event.
Getting all this data structured correctly took me a few attempts.

[Submit search, show results]

**Results Page**
- We fire an event when results appear
- Ideally we'd track filter and sort interactions
- When they select a flight, that's another event

I'll be honest — I'm not tracking every single interaction here yet.
There's still work to do.

[Select flight, proceed to traveller details]

**Traveller Details**
- Form field engagement
- Validation errors (this is gold for UX insights)
- I want to track time spent, but haven't implemented that

[Show ancillary services]

**Ancillary Services**
This is where airlines make serious money — 
I've read it can be 30% of revenue.

- Seat map interactions
- Meal selection
- Baggage upgrades
- Priority services

Each selection is revenue. I'm tracking most of this.

[Proceed to payment]

**Payment**
- Payment method selection
- Card type detection
- Success and failure tracking

Payment failure tracking is really important, 
but also tricky to get right. Still refining this.

[Show confirmation]

**Confirmation**
The main event:
- The purchase event (commerce.purchases)
- Complete revenue breakdown
- Customer identity

Getting the purchase event right is critical.
It took me several iterations.

That's the flow. Every click feeds into the data layer,
which eventually goes to Adobe Analytics and AEP."
```

---

## 📍 CHAPTER 3: The Adobe Tools We'll Use (10:00 - 15:00)

```
[SCREEN: Adobe Experience Cloud architecture diagram]

SCRIPT:
"Let me briefly introduce the Adobe tools.

I want to be upfront: I don't claim to be an expert on all of these.
I've spent the most time with Web SDK and Analytics.
CJA and CDP — I'm still learning.

**AEP Web SDK (Alloy.js)**

[Show Web SDK documentation or diagram]

This is Adobe's modern way to send data.
One SDK that replaces the older, separate libraries:
- AppMeasurement (legacy Analytics)
- AT.js (Target)
- ECID Service

The idea is: send one payload to Adobe Edge Network,
and it routes the data wherever it needs to go.

I like this approach. It's cleaner.
But there's a learning curve if you're used to the old way.

**Adobe Experience Platform (AEP)**

[Show AEP interface or diagram]

AEP is Adobe's Customer Data Platform.
It's where all your data can come together:
- Web interactions
- Mobile app events
- Call center data
- CRM data

For our airline demo, we're creating XDM schemas 
to model flight searches, bookings, and customer profiles.

Honestly, XDM schema design is one of the things 
I found most confusing at first.
We'll work through it together.

**Customer Journey Analytics (CJA)**

[Show CJA interface briefly]

CJA is the next-generation Analytics tool.
It sits on top of AEP and lets you:
- Analyze cross-channel journeys
- Apply segments retroactively
- Compare cohorts

I'm still exploring what's possible here.
The dashboarding is powerful, but has a learning curve.

**Real-Time CDP**

[Show CDP concept]

This is where you activate audience segments.
Push audiences to Target, email platforms, ad platforms.

I haven't gone super deep on CDP yet.
But I'll share what I learn as we go.

The basic flow is:
Web SDK captures → AEP stores → CJA analyzes → CDP activates.

By the end of this series, I hope we'll both understand 
how these pieces fit together."
```

---

## 📍 CHAPTER 4: What We'll Cover in This Series (15:00 - 18:00)

```
[SCREEN: Series overview / roadmap]

SCRIPT:
"Here's what I'm planning to cover.
Fair warning: this might evolve as I learn more.

**Episode 2: Mapping the Data Layer**
We'll document the trackable moments in a booking flow.
I'll share my thinking on data layer design,
and I'm curious to hear if you'd do it differently.

**Episodes 3-4: AEP Web SDK Implementation**
Hands-on implementation.
Configuring datastreams, setting up XDM schemas,
firing events from search through purchase.

This is where I've spent the most time, so I'm fairly confident here.

**Episode 5: XDM Schema Design**
How do you structure flight data, passenger data, 
transaction data in XDM?

This was confusing for me initially.
I'll share the approach I landed on.

**Episode 6: E-Commerce Tracking & Revenue**
The purchase event. Product arrays. Revenue attribution.
Getting this right is crucial.

**Episode 7: Identity & Consent**
Hashing PII, implementing consent, handling auth states.
Important stuff, especially for compliance.

**Episode 8-9: CJA Exploration**
Building connections, data views, dashboards.
I'm still learning CJA, so this will be exploratory.

**Episode 10: Real-Time CDP**
Creating segments, pushing to downstream systems.
Also still learning here.

**Episode 11: Adobe Target Integration**
A/B testing and personalization.
We have a banner placeholder ready for this.

**Episode 12: Putting It All Together**
End-to-end walkthrough.

I won't pretend I have everything figured out.
But I'll share what I've learned and what questions remain."
```

---

## 📍 CHAPTER 5: What You'll Need to Follow Along (18:00 - 21:00)

```
[SCREEN: Setup requirements]

SCRIPT:
"To follow along, here's the situation.

**If You Have Adobe Access**

If your organization has AEP and CJA licenses,
you can implement alongside me in your own sandbox.
I'll show my configurations, and you can adapt.

**If You're Learning (No Adobe Access)**

That's totally fine.
You can follow along conceptually.
Understanding the 'why' is often more valuable 
than copying the exact implementation.

Adobe does offer free trial sandboxes — 
I'll put a link in the description if I can find the current one.

**The TLP Airways Demo**

The website is live at [your-url].
You can click around and watch events in your console.

The code is on GitHub.
Not because you need to build the same thing,
but so you can see how I implemented things.
Maybe you'll find a better way to do it.

**Who This Might Help**

If you're:
- A marketer curious about what's possible with tracking
- A developer implementing analytics for a client
- A MarTech person architecting a data strategy
- Someone studying for Adobe certifications

...maybe this series will be useful.

I'm not going to claim you'll be an expert after watching.
But hopefully you'll have more clarity than before.

**For The AI-Assisted Development Parts**

If you're curious about how we used Cursor and LLMs:
- Cursor is available at cursor.com (free tier available)
- Claude and Gemini both have free tiers
- You don't need these to follow along with the analytics content,
  but if you want to build your own demo, AI tools speed things up dramatically."
```

---

## 📍 CLOSING & CTA (21:00 - 22:30)

```
[SCREEN: Subscribe prompt, links]

SCRIPT:
"Look, airline analytics is complex. 
I'm not going to pretend I've solved it completely.

But I've built something that works well enough to learn from.
And I've made enough mistakes to have useful insights.

If you can figure out tracking for a multi-step, multi-passenger,
dynamic-pricing, ancillary-heavy booking flow...
you can probably track most things.

That's the bet I'm making with this series.

In the next episode, we'll map out the data layer — 
every event, every property, and why I included it.

If that sounds useful, subscribe.
And if you're already working on Adobe Analytics or AEP 
and have advice or questions, drop them in the comments. 
I genuinely want to hear from people who know more than me.

I'm [Your Name]. 
Learning out loud.
See you in Episode 2."

[END CARD: 10 seconds with subscribe, links]
```

---

## 🎬 B-ROLL & VISUALS FOR EPISODE 1

- [ ] Airline website montage (Emirates, Delta, IndiGo, United)
- [ ] Data layer console output scrolling
- [ ] AEP interface screenshots
- [ ] CJA dashboard screenshots
- [ ] Architecture diagram animation
- [ ] Journey flow animation
- [ ] **Cursor IDE in action** — showing AI code generation
- [ ] **AI prompt examples** — natural language to code workflow
- [ ] **Split screen**: Human thinking + AI generating

---
---

# 📹 EPISODE 2: "Mapping the Airline Data Layer - What Should We Track?"

**Duration:** 25-30 minutes  
**Style:** Working session / thinking out loud  
**Goal:** Create a data layer blueprint together  
**AI Note:** This episode shows how we used AI to help design the data layer structure

---

## 🎬 COLD OPEN (0:00 - 0:45)

```
[SCREEN: Spreadsheet or documentation template]

SCRIPT:
"Before you write any tracking code,
you need to know what you're tracking. And why.

I've learned this the hard way.
I used to just start implementing and figure it out as I went.
Bad idea. You end up with incomplete, inconsistent data.

So I started documenting everything first.
Call it a data layer specification — 
a contract between marketing, analytics, and engineering.

Today, I'm going to share my data layer for TLP Airways.
Event by event. Property by property.
And I'll explain my thinking — 
though I'm open to being wrong about some of it.

By the end, you'll have a template 
you can use or adapt for your own projects.

Let's work through this."
```

**[VISUAL: Animated intro - 5 seconds]**

---

## 📍 CHAPTER 1: My Approach to Data Layer Design (0:45 - 4:00)

```
[SCREEN: Slides or whiteboard]

SCRIPT:
"Before diving into events, here's how I think about data layers.
These are principles I've picked up — 
some from experience, some from articles and talks.

**Principle 1: Events, Not Just Page Views**

The old approach: fire a pageView, cram everything into it.
Modern apps don't work that way.

In a single-page booking flow, you might have 
10 meaningful user actions without a traditional 'page load'.
Your data layer needs to capture those discrete moments.

**Principle 2: Start with Business Questions**

For every property, I try to ask: 
'What question does this help answer?'

If I can't think of one, I question whether to include it.
Extra data is noise that clouds analysis.

That said, I've definitely over-tracked at times.
Finding the balance is tricky.

**Principle 3: Context Links Events Together**

Events don't exist in isolation.
A flight selection is meaningless without knowing:
- What search triggered it?
- What other options were shown?
- Who was the user?

This is where IDs become important — 
searchId, bookingId, sessionId — 
to stitch the journey together.

**Principle 4: Be Consistent with Naming**

originCity, not origin_city, not OriginCity.
Pick a convention and stick to it.
I use camelCase for properties. Some prefer snake_case.
Just be consistent.

**Principle 5: Think About XDM (If Using AEP)**

If you're sending data to AEP, it maps to XDM schemas.
I didn't fully appreciate this at first.
Now I try to design with XDM in mind from the start.

Okay, let's apply these to our airline."
```

---

## 📍 CHAPTER 2: The Events and Their Properties (4:00 - 18:00)

```
[SCREEN: Documentation/Spreadsheet + Browser side by side]

SCRIPT:
"I'm going to walk through the events I'm tracking.
For each one, I'll show the structure and explain my thinking.

Feel free to disagree — I'd love to hear alternative approaches.

---

**EVENT 1: pageView**

The foundation. Fires when a page loads.

[Show schema]

{
  "event": "pageView",
  "page": {
    "pageName": "TLP Airways | Search Flights",
    "pageURL": "https://tlpairways.com/search",
    "pageType": "search",
    "siteSection": "booking"
  },
  "user": {
    "authState": "authenticated" | "anonymous",
    "hashedUserId": "sha256..."
  }
}

Why these properties?
- pageName/pageURL: Standard for any analytics
- pageType: Helps segment by type of page
- authState: Authenticated users behave differently
- hashedUserId: Links sessions for logged-in users (hashed for privacy)

I debated including loyaltyTier here, but decided 
to keep user data separate. Still not sure if that's right.

---

**EVENT 2: searchInitiated**

Fires when the user submits a flight search.

[Show schema + fire event on site]

{
  "event": "searchInitiated",
  "search": {
    "searchId": "srch_1705612345_abc",
    "origin": "BLR",
    "originCity": "Bangalore",
    "destination": "DEL",
    "destinationCity": "New Delhi",
    "route": "BLR-DEL",
    "departureDate": "2026-02-15",
    "returnDate": "2026-02-20",
    "tripType": "roundtrip",
    "daysUntilDeparture": 27,
    "tripDuration": 5,
    "passengers": {
      "total": 2,
      "adults": 2,
      "children": 0,
      "infants": 0
    },
    "cabinClass": "economy"
  }
}

The searchId is critical — it links this search 
to the results and any eventual booking.

daysUntilDeparture is calculated, not raw.
This helps segment 'last-minute bookers' vs 'planners'.

tripDuration helps identify weekend trips vs longer vacations.

Some of these calculated fields might be overkill.
I'm still figuring out what's actually useful in analysis.

---

**EVENT 3: searchResultsDisplayed**

Fires when results are shown.

[Show search results on site]

{
  "event": "searchResultsDisplayed",
  "search": {
    "searchId": "srch_1705612345_abc",
    "totalResults": 8,
    "onwardFlights": 4,
    "returnFlights": 4
  },
  "priceRange": {
    "lowest": 4500,
    "highest": 12000,
    "currency": "INR"
  }
}

I want to add loadTime here for performance tracking.
Haven't implemented that yet.

Zero results is an important scenario to track.
Right now I track totalResults = 0, 
but maybe a separate event would be clearer?

---

**EVENT 4: flightSelected**

User clicks on a specific flight.

[Click a flight on results page]

{
  "event": "flightSelected",
  "flight": {
    "flightNumber": "TL-234",
    "origin": "BLR",
    "destination": "DEL",
    "departureTime": "08:00",
    "arrivalTime": "10:30",
    "duration": "2h 30m",
    "stops": 0,
    "cabinClass": "economy",
    "price": 5000,
    "currency": "INR"
  },
  "selection": {
    "journeyType": "onward",
    "resultPosition": 2
  },
  "searchContext": {
    "searchId": "srch_1705612345_abc"
  }
}

resultPosition is interesting for merchandising.
If users always pick the second result, 
maybe our ranking isn't optimal?

I'm not currently tracking WHY they selected — 
was it price? timing? That might be worth adding.

---

**EVENT 5: ancillaryViewed / ancillarySelected**

[Navigate to ancillary services page]

When they VIEW an ancillary section (seat map, meals, etc.):

{
  "event": "ancillaryViewed",
  "ancillary": {
    "type": "seatmap"
  },
  "bookingContext": {
    "bookingId": "bkg_1705612345_xyz"
  }
}

When they SELECT something:

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
  }
}

I should also track when they REMOVE a selection.
That reveals price sensitivity.
Haven't implemented ancillaryRemoved yet.

---

**EVENT 6: paymentMethodSelected / paymentSubmitted / paymentFailed**

[Navigate to payment page]

{
  "event": "paymentMethodSelected",
  "payment": {
    "method": "credit-card",
    "provider": "visa"
  }
}

{
  "event": "paymentSubmitted",
  "payment": {
    "transactionId": "txn_1705612345",
    "amount": 12500,
    "currency": "INR",
    "method": "credit-card"
  }
}

{
  "event": "paymentFailed",
  "payment": {
    "transactionId": "txn_1705612345",
    "errorCode": "CVV_INVALID",
    "errorMessage": "Card security code is incorrect",
    "attemptNumber": 1
  }
}

Payment failures are critical for debugging conversion drops.
I want to track every failure with its error code.

---

**EVENT 7: purchase**

The conversion event. This is the big one.

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
    "bookingReference": "PNR-ABC123"
  },
  "products": [
    {
      "sku": "TL-234",
      "name": "Flight BLR-DEL",
      "category": "flight",
      "subcategory": "onward",
      "price": 5000,
      "quantity": 2
    },
    {
      "sku": "TL-789",
      "name": "Flight DEL-BLR",
      "category": "flight",
      "subcategory": "return",
      "price": 4500,
      "quantity": 2
    },
    {
      "sku": "seat_extraleg",
      "name": "Extra Legroom Seat",
      "category": "ancillary",
      "subcategory": "seat",
      "price": 500,
      "quantity": 2
    }
  ],
  "customer": {
    "hashedEmail": "sha256..."
  }
}

The products array is key.
Each line item — flights and ancillaries — gets its own entry.
This allows breakdown by category in analysis.

Getting this structure right took me several iterations.
I think it's solid now, but I'm open to suggestions."
```

---

## 📍 CHAPTER 3: Calculated Properties - Worth the Effort? (18:00 - 22:00)

```
[SCREEN: Documentation]

SCRIPT:
"Some properties I calculate at tracking time 
rather than tracking raw values.

Is this worth it? I think so, but let me explain my reasoning.

**Days Until Departure**
Instead of just the date, I calculate how many days away it is.
This makes segmenting 'last-minute' vs 'planners' easier in CJA.
You could also calculate this later, but I find it cleaner to do upfront.

**Trip Duration**
Number of days between outbound and return.
Helps identify weekend trips vs longer vacations.

**Route Concatenation**
Instead of making analysts concatenate origin + destination,
I do it in the data layer: 'BLR-DEL'.
Small convenience, but saves time.

**Price Per Passenger**
Total divided by passenger count.
Enables fair comparison across different party sizes.

Am I over-engineering? Maybe.
But I've found that small enrichments upfront 
save hours of manipulation later."
```

---

## 📍 CHAPTER 3.5: How AI Helped Design This Data Layer (20:00 - 22:00)

```
[SCREEN: Cursor IDE with AI chat panel]

SCRIPT:
"I want to take a minute to show you something real.

This data layer didn't come from my head alone.
I used AI tools — specifically Claude in Cursor — to help design it.

[Show actual prompt/response in Cursor]

Here's an example. I asked:
'What properties should an airline flight search event capture 
for meaningful analytics and customer journey analysis?'

Claude gave me a comprehensive list:
- Origin and destination (obviously)
- Trip type (one-way, roundtrip, multi-city)
- Number of passengers broken down by type
- Cabin class preference
- Days until departure — I hadn't thought of this one
- Whether dates are flexible

It also suggested calculated properties:
- Route concatenation (BLR-DEL instead of two fields)
- Trip duration for vacation analysis
- Price sensitivity indicators

**What AI Is Good At**

AI is excellent at:
- Brainstorming comprehensive lists
- Suggesting properties you might forget
- Explaining XDM field mappings
- Generating boilerplate code

**What AI Is Bad At**

AI struggles with:
- Knowing YOUR specific business context
- Understanding your analytics maturity
- Prioritizing what matters most for YOUR team
- Edge cases unique to your implementation

So my workflow was:
1. Ask AI for a comprehensive starting point
2. Review and remove what doesn't apply
3. Add context-specific fields (like our loyalty program)
4. Have AI generate the actual code structure
5. Test and refine

The result: a data layer built in days instead of weeks.
And honestly, more comprehensive than if I'd started from scratch."
```

---

## 📍 CHAPTER 4: Creating a Specification Document (22:00 - 26:00)

```
[SCREEN: Template/Spreadsheet]

SCRIPT:
"I've started creating formal specification documents.
Here's the structure I use:

**For Each Event:**

| Field | Description |
|-------|-------------|
| Event Name | searchInitiated |
| Trigger | User submits search form |
| Page/Component | /search page, SearchForm component |

**For Each Property:**

| Property | Type | Required | Example | Business Question |
|----------|------|----------|---------|-------------------|
| search.origin | String (IATA) | Yes | "BLR" | Route popularity |
| search.daysUntilDeparture | Number | Yes | 27 | Booking window analysis |

The 'Business Question' column forces me to justify each property.
If I can't fill it in, I reconsider including it.

I've put my TLP Airways specification template on GitHub.
Feel free to use it or modify it.
If you have a better approach, I'd love to see it."
```

---

## 📍 CLOSING & CTA (26:00 - 27:30)

```
[SCREEN: Documentation + next episode preview]

SCRIPT:
"That's my data layer for airline booking.
Events, properties, and the thinking behind each.

Is it perfect? Probably not.
But it's comprehensive enough to enable meaningful analysis.

If you see gaps or have different ideas,
please share in the comments.
I genuinely want to learn from others' experience.

You can download my specification template from the description.
Adapt it for your own projects.

Next episode, we're implementing this using AEP Web SDK.
Configuring datastreams, initializing the SDK, firing events.

That's where theory meets reality — and where things can break.

Subscribe if you want to see how it goes.
See you next time."

[END CARD: 10 seconds]
```

---
---

# 📹 EPISODE 3: "AEP Web SDK Setup - Getting Our First Event to Fire"

**Duration:** 28-32 minutes  
**Style:** Technical walkthrough, troubleshooting included  
**Goal:** Get the Web SDK configured and fire real events  
**AI Note:** This episode showcases AI-assisted debugging when things go wrong

---

## 🎬 COLD OPEN (0:00 - 0:45)

```
[SCREEN: AEP Interface + Code editor]

SCRIPT:
"Data layer design is the plan.
Web SDK implementation is the reality.

Today we're getting hands-on:
- Configure a datastream in AEP
- Install and initialize the Web SDK
- Fire our first pageView event
- Verify the data actually arrives

I'll also show you some mistakes I made along the way.
Because that's where the real learning happens.

Let's get into it."
```

**[VISUAL: Animated intro - 5 seconds]**

---

## 📍 CHAPTER 1: Setting Up the Datastream in AEP (0:45 - 8:00)

```
[SCREEN: AEP Data Collection interface]

SCRIPT:
"First, we need to tell AEP where to receive our data.
That's what a datastream does.

[Navigate to Data Collection > Datastreams]

I'll create one for TLP Airways.

**Step 1: Basic Configuration**

Click 'New Datastream'.

Name: 'TLP Airways - Development'
Description: 'Web tracking for airline booking demo'

Mapping Schema: This is important — 
you select the XDM schema that defines your data structure.

[Select schema]

I'm using a custom schema we'll discuss in a later episode.
For now, just know that the schema determines 
what data AEP expects to receive.

**Step 2: Add Services**

Here we tell the datastream what to do with incoming data.

[Click 'Add Service']

Adobe Analytics:
- I enter my Report Suite ID
- This sends data to traditional Analytics

Adobe Experience Platform:
- I select the Event Dataset
- This stores raw events in AEP

Adobe Target:
- I enable this for personalization later

For TLP Airways, I'm enabling Analytics, AEP, and Target.
You might not need all three — depends on your setup.

[Save configuration]

Note the Datastream ID — we need this for the SDK.
Copy it somewhere safe.

**Step 3: Environments**

Datastreams have environments: Development, Staging, Production.
Each gets its own ID.

I start with Development for testing.
You can override settings per environment,
like disabling services in dev.

Okay, datastream is ready. Let's install the SDK."
```

---

## 📍 CHAPTER 2: Installing Web SDK (8:00 - 14:00)

```
[SCREEN: Code editor + Browser]

SCRIPT:
"There are two ways to add the Web SDK:
1. NPM package (for React/Next.js apps)  
2. Launch tag (for tag manager deployments)

I'll show the NPM approach since TLP Airways is Next.js.

[Open terminal]

**Installation**

npm install @adobe/alloy

Done. The SDK is now available.

**Configuration**

[Create configuration file]

I create a file: lib/analytics/adobeConfig.ts

import { configure } from '@adobe/alloy';

configure({
  edgeConfigId: 'your-datastream-id-here',
  orgId: 'your-org-id@AdobeOrg',
  edgeDomain: 'edge.adobedc.net',
  defaultConsent: 'pending',
  debugEnabled: true
});

Let me explain these:

**edgeConfigId**: The Datastream ID from earlier.

**orgId**: Your organization ID. 
Find this in AEP Admin. Format is 'XXXXX@AdobeOrg'.
I got this wrong the first time — make sure the format is exact.

**defaultConsent**: 
- 'in' = collect data immediately
- 'pending' = wait for consent first
- 'out' = don't collect until explicit consent

I use 'pending' for GDPR compliance.
Events queue until the user accepts cookies.

**debugEnabled**: 
Set true during development to see detailed console logs.
MUST be false in production.

**When to Initialize**

The SDK should load early, before any events fire.
In Next.js, I do this in _app.tsx.

[Show initialization code]

This ensures everything is ready when pages load."
```

---

## 📍 CHAPTER 3: Firing the First Event (14:00 - 22:00)

```
[SCREEN: Code editor + Browser with DevTools]

SCRIPT:
"SDK is configured. Let's fire an event.

**The sendEvent Function**

Everything goes through sendEvent.

[Create or open the data layer service]

import { sendEvent } from '@adobe/alloy';

async function trackPageView(pageData) {
  const result = await sendEvent({
    xdm: {
      eventType: 'web.webpagedetails.pageViews',
      web: {
        webPageDetails: {
          name: pageData.pageName,
          URL: pageData.pageURL,
          siteSection: pageData.siteSection
        }
      }
    }
  });
  
  console.log('Page view sent:', result);
}

The xdm object follows your schema structure.
eventType tells AEP what kind of event this is.

Adobe has standard event types:
- web.webpagedetails.pageViews (page loads)
- commerce.productListViews (search results)
- commerce.purchases (conversions)

Using standard types enables automatic reporting.

**Calling It on Page Load**

[Open a page component]

In my Next.js pages, I fire on component mount:

useEffect(() => {
  trackPageView({
    pageName: 'TLP Airways | Search Flights',
    pageURL: window.location.href,
    siteSection: 'booking'
  });
}, []);

**Let's Test**

[Open browser, navigate to site, open DevTools > Network tab]

Filter by 'edge.adobedc.net' or 'interact'.

[Navigate to a page]

There! See that network request?
That's our pageView going to Adobe Edge.

[Click request, show payload]

Look at the request body.
There's our XDM data, exactly as we structured it.

The response shows handles from Analytics and AEP.
If there are errors, they'll appear here too.

**Console Debugging**

With debugEnabled true, check the console.

[Show console output]

'[alloy] Executing sendEvent command'
'[alloy] Response received from edge'

This logging saved me many times during implementation."
```

---

## 📍 CHAPTER 4: Implementing Search Tracking (22:00 - 28:00)

```
[SCREEN: Code implementation]

SCRIPT:
"Let's implement a real event: search tracking.

[Open the search page]

When the user submits a search:

async function trackFlightSearch(searchParams) {
  await sendEvent({
    xdm: {
      eventType: 'commerce.productListViews',
      commerce: {
        productListViews: {
          value: 1
        }
      },
      _tlpairways: {
        search: {
          searchId: generateSearchId(),
          origin: searchParams.from,
          destination: searchParams.to,
          route: `${searchParams.from}-${searchParams.to}`,
          departureDate: searchParams.departureDate,
          tripType: searchParams.returnDate ? 'roundtrip' : 'oneway',
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
We'll cover schema design in detail later.

**Calling It**

In the search form submit handler:

const handleSearch = async (formData) => {
  await trackFlightSearch(formData);
  router.push(`/results?${buildQueryString(formData)}`);
};

**Verifying in AEP**

[Switch to AEP interface]

After firing events, you can verify in AEP:
- Datasets > Preview Data
- Look for your events

You should see your data appearing.
If something's wrong, check:
1. Schema validation errors in the response
2. Network errors in DevTools
3. SDK console logs"
```

---

## 📍 CHAPTER 5: Mistakes I Made (So You Don't Have To) (28:00 - 30:00)

```
[SCREEN: Troubleshooting tips]

SCRIPT:
"Before we wrap, let me share some mistakes I made.

**Mistake 1: Forgot About Consent**
With defaultConsent as 'pending', events queue but don't send.
I spent an hour wondering why nothing appeared in AEP.
You need to call setConsent() after the user accepts cookies.

**Mistake 2: Schema Mismatch**
My XDM structure didn't match my schema.
Events failed silently. Very confusing.
Always validate against your schema.

**Mistake 3: Wrong orgId Format**
The organization ID must be 'XXXXX@AdobeOrg'.
I had just 'XXXXX' and couldn't figure out why auth failed.

**Mistake 4: CORS Issues**
Got CORS errors because my development URL 
wasn't in the datastream's allowed domains.
Easy fix once you know where to look.

**Mistake 5: React Double-Render**
React's StrictMode renders components twice in dev.
My events were firing twice.
I added a flag to prevent duplicate sends.

These cost me hours. Hopefully they'll save you time."
```

---

## 📍 CHAPTER 5.5: AI as a Debugging Partner (30:00 - 31:00)

```
[SCREEN: Cursor IDE with AI chat panel]

SCRIPT:
"Quick aside on debugging with AI.

For at least three of those mistakes, 
I described the problem to Claude in Cursor
and got the answer in under a minute.

'My AEP events are not appearing even though the network call succeeds.'
Claude immediately asked: 'Is your defaultConsent set to pending?'
Boom. That was it.

'My SDK initialization fails with an auth error.'
Claude asked: 'Is your orgId in the format XXXXX@AdobeOrg?'

AI cannot replace understanding, 
but for debugging common issues,
it is like having a senior developer on call 24/7.

The pattern I use:
1. Describe the symptom clearly
2. Share relevant code snippets
3. Ask for possible causes
4. Test the suggestions one by one

It saved me hours on this project alone."
```

---

## 📍 CLOSING & CTA (31:00 - 32:30)

```
[SCREEN: Summary + next episode]

SCRIPT:
"We went from zero to firing real events.

Today we covered:
- Configuring a datastream in AEP
- Installing and initializing Web SDK
- Firing pageView and search events
- Validating data flow
- Common mistakes to avoid

If you want practice, try implementing flight selection tracking.
Post your approach in the comments — 
I'm curious how others structure it.

Next episode, we're diving into XDM schema design.
How do you model flights, passengers, and transactions?
It's foundational knowledge, and honestly, 
it's where I struggled most when starting out.

Subscribe if you're following along.
See you next time."

[END CARD: 10 seconds]
```

---

## 🎬 B-ROLL & VISUALS FOR EPISODE 3

- [ ] AEP interface navigation
- [ ] Code typing in VS Code / Cursor IDE
- [ ] Network tab showing successful requests
- [ ] Console output with SDK debugging
- [ ] Schema validation success/error examples
- [ ] **Cursor AI chat panel** — showing debugging prompt
- [ ] **AI response** — suggesting solution to common error
- [ ] **Split screen**: Error message + AI suggestion + fix applied

---

# 📋 TONE COMPARISON: OLD vs NEW

| Aspect | OLD (Masterclass) | NEW (Learning Together) |
|--------|-------------------|-------------------------|
| Opening | "I'll show you how to build..." | "I'm going to share what I've learned..." |
| Expertise claim | "Master complex analytics" | "Still figuring out some of this" |
| Mistakes | Rarely mentioned | Openly discussed |
| Certainty | "This is the right way" | "This is my approach, open to other ideas" |
| Call to action | "Follow my masterclass" | "Join me in learning" |
| Audience role | Students being taught | Fellow learners exploring together |
| **AI Usage** | Not mentioned | Openly acknowledged as a development partner |

---

# 🤖 AI DEVELOPMENT HIGHLIGHTS SUMMARY

Throughout this series, we reference how AI tools assisted in building TLP Airways:

| Episode | AI Usage Highlight |
|---------|-------------------|
| **EP1** | Introduction to AI-assisted development with Cursor + Claude/Gemini |
| **EP2** | AI helped design comprehensive data layer schema structure |
| **EP3** | AI-assisted debugging of SDK configuration issues |

**Key AI Tools Used:**
- **Cursor IDE** — Primary development environment with built-in AI
- **Claude (Anthropic)** — Complex logic, architecture, debugging
- **Gemini (Google)** — Documentation, code review, optimization

**Philosophy:** AI accelerates development but doesn't replace understanding. We use AI for brainstorming, debugging, and boilerplate — but human judgment drives all final decisions.

---

**Script Version:** 4.0 (AI-Assisted Development Narrative)  
**Updated:** January 2026  
**Author:** TLP Airways Team  
**AI Partners:** Claude, Gemini, GitHub Copilot
