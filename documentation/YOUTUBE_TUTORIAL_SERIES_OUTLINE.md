# 🎬 Learning Airline Analytics with Adobe Experience Platform

> **A Video Series for Marketers, MarTech Leads & Analytics Folks**
> 
> Exploring how to track, analyze, and activate data from complex airline booking journeys 
> using Adobe Analytics, AEP Web SDK, Customer Journey Analytics, and Real-Time CDP

---

## 📺 Series Overview

| Attribute | Details |
|-----------|---------|
| **Series Title** | Learning Airline Analytics with Adobe Experience Platform |
| **Total Episodes** | 12 Videos |
| **Total Duration** | ~6-7 hours |
| **Target Audience** | Marketers, MarTech Leads, Analytics Implementers, Solution Architects |
| **Skill Level** | Beginner to Intermediate (learning together!) |
| **Adobe Stack** | AEP Web SDK, Adobe Analytics, Customer Journey Analytics, Real-Time CDP, Adobe Target |
| **Industry Context** | Airlines / Travel / Complex E-Commerce |

---

## 🎯 What We're Aiming For

By the end of this series, we'll have explored:

1. **Why** airline/travel tracking is considered complex (I'm still learning the nuances)
2. **How** to design data layer specifications for multi-step booking flows
3. **Implementing** AEP Web SDK for event tracking (with all the mistakes along the way)
4. **Building** XDM schemas that model flights, passengers, and transactions
5. **Configuring** e-commerce purchase tracking with product arrays
6. **Handling** identity stitching and consent management
7. **Analyzing** booking funnels and customer journeys in CJA
8. **Activating** audiences in Real-Time CDP for personalization

Some of this I'm confident about. Other parts I'm still figuring out.
That's the honest truth.

---

## 👥 Who This Might Help

### 1. The Marketer
> "I want to understand what data we can collect and how to use it"

**You'll learn:** Business questions data can answer, CJA dashboards, audience activation

### 2. The MarTech Lead
> "I need to architect our analytics strategy across channels"

**You'll learn:** Data flow, schema design, CDP integration, identity stitching

### 3. The Implementation Specialist
> "I need to implement tracking on websites"

**You'll learn:** Web SDK configuration, event firing, debugging, validation

### 4. The Solution Architect
> "I'm designing the Adobe stack for a travel client"

**You'll learn:** XDM design patterns, datastream configuration, system integration

---

# 📚 Episode Guide

---

## **Module 1: Understanding the Challenge (Episodes 1-2)**

### 📹 Episode 1: "Why I Built an Airline Demo to Learn Analytics"
**Duration:** 20-25 minutes

#### What We'll Explore
- The 5 unique challenges of airline analytics (that I've learned about)
- TLP Airways as an analytics sandbox
- The Adobe stack and how the pieces connect

#### Content Outline
| Timestamp | Topic | Key Points |
|-----------|-------|------------|
| 0:00-1:00 | Cold Open | "I built this to learn" |
| 1:00-6:00 | The Challenges | Multi-step journeys, complex products, dynamic pricing, multi-passenger, consent |
| 6:00-10:00 | TLP Airways Tour | Analytics touchpoints, not UI features |
| 10:00-15:00 | The Adobe Stack | Web SDK → AEP → CJA → CDP explained |
| 15:00-18:00 | Series Roadmap | What's coming |
| 18:00-21:00 | Prerequisites | What you need, who this is for |
| 21:00-22:30 | Closing | Subscribe, resources |

#### Honest Notes
- Airlines generate complex data (routes, ancillaries, passengers)
- I'm still learning the best ways to analyze this
- AEP + CJA provides flexibility, but has a learning curve

---

### 📹 Episode 2: "Mapping the Data Layer - What Should We Track?"
**Duration:** 25-30 minutes

#### What We'll Explore
- Data layer design principles (the approach I've landed on)
- All the trackable events in an airline booking
- Business justification for each data point

#### Content Outline
| Timestamp | Topic | Key Points |
|-----------|-------|------------|
| 0:00-0:45 | Cold Open | "Before code, you need a plan" |
| 0:45-4:00 | Design Principles | Event-driven, business-question-driven |
| 4:00-18:00 | Event Inventory | 10+ events with my reasoning |
| 18:00-22:00 | Calculated Properties | daysUntilDeparture, route concatenation |
| 22:00-26:00 | Spec Document Template | How I document for handoff |
| 26:00-27:30 | Closing | Template download, feedback welcome |

#### Events I'm Tracking
| Event | Trigger | Questions It Helps Answer |
|-------|---------|--------------------------|
| pageView | Page load | Traffic patterns, user segmentation |
| searchInitiated | Search submit | Popular routes, booking windows |
| searchResultsDisplayed | Results load | Zero-result rate, price distribution |
| flightSelected | Flight click | Price sensitivity, position impact |
| ancillaryViewed | Section view | Interest without conversion |
| ancillarySelected | Add to booking | Attach rates, revenue |
| paymentSubmitted | Payment attempt | Conversion, payment methods |
| paymentFailed | Payment error | Drop-off diagnosis |
| purchase | Booking complete | Revenue, attribution |

---

## **Module 2: Implementation (Episodes 3-6)**

### 📹 Episode 3: "AEP Web SDK Setup - Getting Our First Event to Fire"
**Duration:** 28-32 minutes

#### What We'll Explore
- Configuring datastreams in AEP Data Collection
- Installing and initializing Web SDK
- Firing and validating our first events (and debugging when things break)

#### Content Outline
| Timestamp | Topic |
|-----------|-------|
| 0:00-0:45 | Cold Open |
| 0:45-8:00 | Datastream Configuration |
| 8:00-14:00 | Web SDK Installation |
| 14:00-22:00 | Firing First Events |
| 22:00-28:00 | Implementing Search Tracking |
| 28:00-30:00 | Mistakes I Made (so you don't have to) |
| 30:00-31:30 | Closing |

#### What We'll Build
- Configured datastream with Analytics + AEP + Target
- Working Web SDK initialization
- pageView event firing
- searchInitiated event with context

---

### 📹 Episode 4: "XDM Schema Design - Figuring Out the Data Model"
**Duration:** 30-35 minutes

#### What We'll Explore
- XDM architecture and field groups (this confused me at first)
- Designing schemas for flights, passengers, bookings
- Modeling relationships between entities

#### Content Outline
| Timestamp | Topic |
|-----------|-------|
| 0:00-1:00 | Cold Open: "XDM took me a while" |
| 1:00-8:00 | XDM Fundamentals | Classes, field groups, data types |
| 8:00-15:00 | Airline Schema Design | Flights, passengers, transactions |
| 15:00-22:00 | Custom Field Groups | Our namespace |
| 22:00-28:00 | Schema Relationships | Linking events to profiles |
| 28:00-32:00 | Validation & Testing |
| 32:00-34:00 | Closing |

#### Schema Components I'm Using
- **XDM ExperienceEvent** - For behavioral events
- **XDM Individual Profile** - For customer data
- **Custom Field Groups:**
  - Flight Search Details
  - Flight Selection Details
  - Passenger Information
  - Ancillary Services
  - Booking Transaction

---

### 📹 Episode 5: "E-Commerce Tracking - Getting the Purchase Event Right"
**Duration:** 28-32 minutes

#### What We'll Explore
- Purchase tracking with product arrays
- Structuring revenue for flights + ancillaries
- Handling multi-passenger, multi-leg bookings

#### Content Outline
| Timestamp | Topic |
|-----------|-------|
| 0:00-1:00 | Cold Open: "This took me several attempts" |
| 1:00-6:00 | E-Commerce Architecture | productListViews → purchase flow |
| 6:00-14:00 | Product Array Design | Flights and ancillaries as products |
| 14:00-20:00 | Revenue Breakdown | Base fare, taxes, fees |
| 20:00-26:00 | Implementation | Full purchase event walkthrough |
| 26:00-30:00 | Validation | Checking data in AEP |
| 30:00-32:00 | Closing |

#### Product Array Structure
```javascript
products: [
  { sku: "TL-234", name: "BLR→DEL", category: "flight", price: 5000, quantity: 2 },
  { sku: "TL-789", name: "DEL→BLR", category: "flight", price: 4500, quantity: 2 },
  { sku: "seat_12A", name: "Extra Legroom", category: "ancillary", price: 500, quantity: 1 },
  { sku: "bag_20kg", name: "Checked Bag", category: "ancillary", price: 1000, quantity: 1 }
]
```

---

### 📹 Episode 6: "Identity & Consent - The Important (Confusing) Stuff"
**Duration:** 25-30 minutes

#### What We'll Explore
- Hashing PII for privacy-safe tracking
- Implementing Adobe consent framework
- Stitching anonymous to known identities

#### Content Outline
| Timestamp | Topic |
|-----------|-------|
| 0:00-1:00 | Cold Open: "Privacy is complicated" |
| 1:00-7:00 | Identity Fundamentals | ECID, CRM ID, hashed email |
| 7:00-14:00 | Implementing Identity | Setting identities in Web SDK |
| 14:00-20:00 | Consent Framework | Adobe 2.0 standard, pending vs in |
| 20:00-25:00 | Anonymous to Known | Pre-login stitching |
| 25:00-28:00 | GDPR/DPDP Considerations | What I understand so far |
| 28:00-30:00 | Closing |

---

## **Module 3: Analysis (Episodes 7-9)**

### 📹 Episode 7: "Connecting to Customer Journey Analytics"
**Duration:** 25-28 minutes

#### What We'll Explore
- Creating connections and data views in CJA
- Building calculated metrics for airline KPIs
- Session vs event-based analysis

#### Content Outline
| Timestamp | Topic |
|-----------|-------|
| 0:00-1:00 | Cold Open |
| 1:00-8:00 | CJA Architecture | Connections → Data Views → Workspace |
| 8:00-15:00 | Creating Connections | AEP datasets to CJA |
| 15:00-22:00 | Data Views | Dimensions, metrics, calculated fields |
| 22:00-26:00 | Airline-Specific Metrics | The KPIs I'm trying to track |
| 26:00-28:00 | Closing |

#### Metrics I'm Building
- Conversion Rate (Search → Book)
- Ancillary Attach Rate
- Revenue per Passenger
- Average Booking Window
- Price Sensitivity Index (still working on this one)

---

### 📹 Episode 8: "Building Dashboards in CJA"
**Duration:** 30-35 minutes

#### What We'll Explore
- Building a conversion funnel analysis
- Analyzing route performance
- Creating abandonment and recovery reports

#### Content Outline
| Timestamp | Topic |
|-----------|-------|
| 0:00-1:00 | Cold Open |
| 1:00-10:00 | Booking Funnel | Search → Results → Select → Pay → Confirm |
| 10:00-18:00 | Route Analysis | Top routes, patterns |
| 18:00-25:00 | Ancillary Analysis | Attach rates |
| 25:00-32:00 | Abandonment Analysis | Where they drop off |
| 32:00-35:00 | Closing |

#### Dashboard Panels
1. **Summary** - Key KPIs, trends
2. **Booking Funnel** - Conversion at each step
3. **Route Performance** - Revenue, volume by route
4. **Ancillary Performance** - Attach rate, revenue contribution
5. **Abandonment Analysis** - Drop-off points

---

### 📹 Episode 9: "Cross-Channel Journey Analysis"
**Duration:** 25-30 minutes

#### What We'll Explore
- Stitching web, call center, and offline data (conceptually)
- Analyzing multi-channel journeys
- Attribution patterns

#### Content Outline
| Timestamp | Topic |
|-----------|-------|
| 0:00-1:00 | Cold Open |
| 1:00-8:00 | Multi-Channel Concept | Web + Call Center + App |
| 8:00-16:00 | Bringing Data Together | Multiple datasets |
| 16:00-22:00 | Journey Stitching | Identity across channels |
| 22:00-26:00 | Attribution Models | First touch, last touch |
| 26:00-28:00 | Closing |

---

## **Module 4: Activation (Episodes 10-12)**

### 📹 Episode 10: "Real-Time CDP - Building Audiences"
**Duration:** 28-32 minutes

#### What We'll Explore
- Creating audiences based on booking behavior
- Audience composition
- Pushing audiences to destinations

#### Content Outline
| Timestamp | Topic |
|-----------|-------|
| 0:00-1:00 | Cold Open |
| 1:00-8:00 | CDP Overview | Profiles, segments, destinations |
| 8:00-16:00 | Audience Building | Rules-based segmentation |
| 16:00-24:00 | Airline Use Cases | Abandoners, high-value |
| 24:00-30:00 | Activation | Pushing to Target, email |
| 30:00-32:00 | Closing |

#### Audience Ideas
| Audience | Definition | Activation |
|----------|------------|------------|
| Cart Abandoners | Searched but didn't book | Retargeting |
| High-Value Travelers | Multiple bookings, business class | Loyalty offers |
| Price Sensitive | Multiple searches, price-sorted | Price drop alerts |
| Last-Minute Bookers | Departure <7 days | Express checkout |

---

### 📹 Episode 11: "Adobe Target - Personalization"
**Duration:** 25-30 minutes

#### What We'll Explore
- Setting up tests using AEP data
- Experience personalization
- Offer Decisioning (still learning this one)

#### Content Outline
| Timestamp | Topic |
|-----------|-------|
| 0:00-1:00 | Cold Open |
| 1:00-8:00 | Target + AEP Integration | Shared audiences |
| 8:00-15:00 | A/B Testing | Banner tests, CTA variations |
| 15:00-22:00 | Personalization | Showing relevant content |
| 22:00-26:00 | Offer Decisioning | AI-driven recommendations |
| 26:00-28:00 | Closing |

#### Test Ideas
- Price display: ₹5,000 vs "From ₹4,999"
- Urgency messaging: "Only 3 seats left" vs no messaging
- Destination-based banners

---

### 📹 Episode 12: "Series Wrap-Up - What We Learned"
**Duration:** 25-30 minutes

#### What We'll Explore
- End-to-end demo of the full flow
- Recap key learnings
- What's next for continued learning

#### Content Outline
| Timestamp | Topic |
|-----------|-------|
| 0:00-1:00 | Cold Open |
| 1:00-12:00 | End-to-End Demo | Full booking with data flowing |
| 12:00-18:00 | Key Learnings | What we covered |
| 18:00-23:00 | What I Still Don't Know | Honest gaps |
| 23:00-27:00 | Resources | Documentation, where to learn more |
| 27:00-30:00 | Final Closing |

---

## 📊 Episode Summary

| Ep | Title | Duration | Key Products | Style |
|----|-------|----------|--------------|-------|
| 1 | Why I Built This | 22 min | Overview | Conceptual |
| 2 | Mapping the Data Layer | 27 min | Data Layer | Working session |
| 3 | Web SDK Setup | 30 min | Web SDK | Hands-on |
| 4 | XDM Schema Design | 33 min | AEP Schemas | Hands-on |
| 5 | E-Commerce Tracking | 30 min | Web SDK, Analytics | Hands-on |
| 6 | Identity & Consent | 28 min | Web SDK, Privacy | Hands-on |
| 7 | Connecting to CJA | 27 min | CJA | Hands-on |
| 8 | Building Dashboards | 33 min | CJA | Hands-on |
| 9 | Cross-Channel Analysis | 28 min | CJA | Conceptual |
| 10 | Real-Time CDP | 30 min | CDP | Hands-on |
| 11 | Adobe Target | 28 min | Target | Hands-on |
| 12 | Series Wrap-Up | 28 min | All | Demo |

---

## 🎨 Production Resources

### Graphics Needed
- [ ] Adobe Experience Platform architecture diagram
- [ ] Data flow animation (Web → Edge → AEP → CJA → CDP)
- [ ] XDM schema visualization
- [ ] Airline booking funnel diagram
- [ ] ERD diagram for data model

### B-Roll Footage
- [ ] AEP interface navigation
- [ ] CJA Workspace building
- [ ] TLP Airways booking flow
- [ ] Console showing events
- [ ] Datastream configuration

---

## 📅 Suggested Upload Schedule

| Week | Episodes | Theme |
|------|----------|-------|
| Week 1 | Ep 1-2 | Foundation: Why & What |
| Week 2 | Ep 3-4 | Implementation: SDK & Schema |
| Week 3 | Ep 5-6 | Implementation: Tracking & Identity |
| Week 4 | Ep 7-8 | Analysis: CJA Setup & Dashboards |
| Week 5 | Ep 9-10 | Analysis & Activation |
| Week 6 | Ep 11-12 | Personalization & Wrap-Up |

---

## 📝 SEO Keywords

| Episode | Primary Keywords |
|---------|------------------|
| Ep 1 | airline analytics, travel tracking, adobe experience platform |
| Ep 2 | data layer design, analytics specification |
| Ep 3 | aep web sdk tutorial, datastream configuration |
| Ep 4 | xdm schema design, experience data model |
| Ep 5 | e-commerce tracking, purchase event |
| Ep 6 | identity stitching, consent management |
| Ep 7 | customer journey analytics tutorial |
| Ep 8 | cja dashboard, booking funnel |
| Ep 9 | cross-channel analytics |
| Ep 10 | adobe real-time cdp, audience segmentation |
| Ep 11 | adobe target personalization |
| Ep 12 | adobe experience platform demo |

---

**Series Version:** 2.1 (Humble Learning Tone)  
**Last Updated:** January 2026  
**Author:** TLP Airways Team
