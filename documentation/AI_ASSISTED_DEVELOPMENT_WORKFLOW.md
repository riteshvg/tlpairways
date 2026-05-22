# 🤖 AI-Assisted Development Workflow for TLP Airways

> **How We Used Cursor, Claude, and Gemini to Build an Airline Booking Demo**
> 
> A transparent look at AI-human collaboration in modern web development

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [The AI Tool Stack](#the-ai-tool-stack)
3. [What AI Built vs What Humans Built](#what-ai-built-vs-what-humans-built)
4. [Workflow Patterns](#workflow-patterns)
5. [Prompt Examples That Worked](#prompt-examples-that-worked)
6. [When AI Struggled](#when-ai-struggled)
7. [Lessons Learned](#lessons-learned)
8. [Recommendations for Your Projects](#recommendations-for-your-projects)

---

## 🎯 Overview

TLP Airways is an airline booking demo application built to learn and teach Adobe Experience Platform, Web SDK, Customer Journey Analytics, and Real-Time CDP implementation.

**Key Stats:**
| Metric | Value |
|--------|-------|
| **Development Time** | ~4 weeks (part-time) |
| **Lines of Code** | ~25,000+ |
| **AI Contribution Estimate** | 60-70% of initial code generation |
| **Human Refinement** | 100% of final decisions |

**The Philosophy:**
> AI accelerates development but doesn't replace understanding. 
> We use AI for brainstorming, scaffolding, and debugging — 
> but human judgment drives all architecture and final decisions.

---

## 🛠️ The AI Tool Stack

### Primary Tools

| Tool | Model | Primary Use Cases |
|------|-------|-------------------|
| **Cursor IDE** | Claude 3.5 Sonnet | Primary development environment, inline code generation, chat-based development |
| **Claude (Web)** | Claude 3 Opus/Sonnet | Complex architectural discussions, documentation writing, debugging deep issues |
| **Gemini (Google)** | Gemini Pro/Advanced | Code review, alternative perspectives, documentation |
| **GitHub Copilot** | GPT-4 | Inline autocomplete, boilerplate generation |

### How They Complemented Each Other

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     AI TOOL COLLABORATION FLOW                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   ┌──────────────┐        ┌──────────────┐        ┌──────────────┐     │
│   │   IDEATION   │  ───►  │    BUILD     │  ───►  │   REFINE     │     │
│   │              │        │              │        │              │     │
│   │ Claude/Gemini│        │  Cursor IDE  │        │ Claude/Copilot│    │
│   │  (Web Chat)  │        │ (Inline AI)  │        │  (Debug/Fix) │     │
│   └──────────────┘        └──────────────┘        └──────────────┘     │
│         │                       │                       │              │
│         ▼                       ▼                       ▼              │
│   ┌──────────────────────────────────────────────────────────────┐    │
│   │                    HUMAN JUDGMENT LAYER                       │    │
│   │                                                               │    │
│   │  • Architecture decisions    • Code review                    │    │
│   │  • Business logic approval   • Testing validation             │    │
│   │  • UX/Design choices         • Final deployment               │    │
│   └──────────────────────────────────────────────────────────────┘    │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## ⚖️ What AI Built vs What Humans Built

### AI-Generated (with Human Review)

| Component | AI Contribution | Human Refinement |
|-----------|-----------------|------------------|
| **React Components** | Initial JSX structure, styling | Business logic, state management edge cases |
| **Data Layer Events** | Event schema structure, property lists | Specific business rules, XDM mapping |
| **Email Templates** | HTML structure, responsive CSS | Branding, content copy, testing |
| **API Routes** | Express route scaffolding | Error handling, security considerations |
| **Documentation** | ERD structures, README files | Accuracy verification, context-specific details |
| **Cypress Tests** | Test case generation | Assertion refinement, coverage gaps |
| **TypeScript Interfaces** | Type definitions | Generics, complex union types |

### Human-Driven (AI Assisted)

| Component | Human Leadership | AI Assistance |
|-----------|------------------|---------------|
| **Architecture Decisions** | Chose Next.js, AEP, backend structure | Pros/cons analysis, alternatives research |
| **XDM Schema Design** | Data model decisions | Syntax help, Adobe documentation lookup |
| **Identity Stitching** | Strategy and approach | Implementation details |
| **Consent Management** | GDPR/privacy strategy | Implementation patterns |
| **Business Logic** | Pricing, routing, booking rules | Code implementation |
| **Debugging** | Root cause identification | Suggested fixes, pattern matching |

---

## 🔄 Workflow Patterns

### Pattern 1: Scaffold → Refine → Perfect

```
Step 1: AI generates initial scaffold
        "Create a flight search React component with origin, 
         destination, date pickers, and passenger selection"

Step 2: Human reviews and identifies gaps
        - Missing validation logic
        - Need custom date restrictions
        - Passenger count edge cases

Step 3: AI refines based on feedback
        "Add validation to ensure departure date is at least 
         24 hours from now and prevent selecting more than 
         9 passengers total"

Step 4: Human perfects edge cases
        - Manual testing reveals issues
        - Final polish applied
```

### Pattern 2: Describe Problem → Get Solutions → Choose Best

```
Human: "My AEP events are not appearing in the dataset even 
        though the network call returns 200 OK"

AI: Suggests multiple possibilities:
    1. defaultConsent might be 'pending'
    2. Schema mismatch
    3. Dataset not properly linked to datastream
    4. Event TTL/expiration

Human: Checks consent setting — that was it!
```

### Pattern 3: Component-by-Component Building

```
Session 1: "Create the homepage with search form"
Session 2: "Create the search results page with flight cards"
Session 3: "Create the traveller details form with validation"
Session 4: "Create ancillary services (seats, meals, baggage)"
Session 5: "Create payment and confirmation pages"

Each session: ~2-4 hours with AI assistance
```

### Pattern 4: Documentation-Driven Development

```
1. Ask AI to create documentation FIRST
   "Write a data layer specification for airline booking events"

2. Review and refine the documentation
   - Add business-specific requirements
   - Remove unnecessary complexity

3. Use documentation as AI context for implementation
   "Based on this specification, implement the trackFlightSearch function"
```

---

## 💬 Prompt Examples That Worked

### For Component Generation

```
✅ EFFECTIVE PROMPT:
"Create a React TypeScript component for a seat map visualization. 
Requirements:
- 3 rows of seats (A-B-C aisle D-E-F)
- Props for occupied seats array, selected seat, onSelect callback
- Visual indicators for available, occupied, selected states
- Extra legroom rows marked differently
- Use inline styles with MUI sx prop pattern"

❌ LESS EFFECTIVE:
"Make a seat map component"
```

### For Data Layer Design

```
✅ EFFECTIVE PROMPT:
"I am implementing Adobe Experience Platform Web SDK for an airline booking site.
Design a data layer event for flight search that includes:
- Search parameters (origin, destination, dates, passengers)
- Calculated fields useful for analytics
- XDM-compatible structure
- Properties that answer: route popularity, booking window, party size patterns

Show the JSON structure with example values."
```

### For Debugging

```
✅ EFFECTIVE PROMPT:
"My Adobe Web SDK sendEvent returns successfully but events do not appear in AEP.
Setup:
- defaultConsent: pending
- Using next.js with client-side rendering
- Network tab shows 200 response
- No errors in console

What could cause events to send but not appear in AEP datasets?"
```

### For Code Review

```
✅ EFFECTIVE PROMPT:
"Review this data layer implementation for potential issues:
[paste code]

Check for:
- Race conditions
- Missing error handling
- Privacy concerns
- Performance issues
- XDM compliance"
```

---

## ⚠️ When AI Struggled

### 1. Business-Specific Logic

**Problem:** AI suggested standard e-commerce patterns that did not fit airline booking.

```javascript
// AI GENERATED (incorrect for airlines)
const productId = flight.flightNumber;

// HUMAN CORRECTED (airlines need date + flight combo)
const productId = `${flight.flightNumber}_${flight.departureDate}`;
```

### 2. Adobe-Specific Implementation Details

**Problem:** AI had outdated knowledge of Web SDK configuration.

```javascript
// AI GENERATED (older SDK version)
alloy("configure", { edgeConfigId: "..." });

// HUMAN CORRECTED (current SDK syntax)
alloy("configure", { datastreamId: "..." });
```

### 3. Complex State Management

**Problem:** AI did not understand the full application state flow.

```javascript
// AI missed that booking context needs to persist across pages
// Human had to design the context provider strategy
```

### 4. Privacy & Compliance Nuances

**Problem:** AI gave generic GDPR advice that did not account for Indian DPDP Act specifics.

```
Human had to research and implement:
- India-specific consent requirements
- Cross-border data transfer considerations
- Airline-specific PII handling
```

### 5. Edge Cases in Multi-Passenger Bookings

**Problem:** AI assumed single-passenger scenarios by default.

```javascript
// AI generated loops that broke with infants
passengers.forEach(p => { /* assumed all passengers have seats */ })

// Reality: infants do not have separate seats
passengers.filter(p => p.type !== 'infant').forEach(...)
```

---

## 📚 Lessons Learned

### What Worked Well

| Practice | Benefit |
|----------|---------|
| **Detailed prompts with context** | AI produced usable code on first try |
| **Using AI for brainstorming** | Comprehensive lists of considerations |
| **Documentation-first approach** | Clearer implementation, fewer rewrites |
| **Iterative refinement** | Faster than starting from scratch |
| **AI for boilerplate, human for logic** | Best of both worlds |

### What We Would Do Differently

| Original Approach | Improved Approach |
|-------------------|-------------------|
| Accepting first AI output | Always critically review before using |
| Using AI for complex algorithms | Starting with pseudo-code, then AI implementation |
| Single long prompts | Breaking into smaller, focused requests |
| Assuming AI knows latest versions | Always specifying SDK/library versions |

### Key Insights

1. **AI is a collaborator, not a replacement**
   - Think of AI as a very fast junior developer
   - It needs guidance, review, and correction

2. **Context is everything**
   - The more context you provide, the better the output
   - Include constraints, requirements, and examples

3. **Verify external integrations**
   - AI often hallucinates API details
   - Always verify against official documentation

4. **Speed vs. Quality tradeoff**
   - AI-generated code is fast but needs review
   - Budget time for validation and testing

5. **Learning still matters**
   - AI accelerates implementation of concepts you understand
   - It does not replace the need to learn fundamentals

---

## 🎯 Recommendations for Your Projects

### Getting Started with AI-Assisted Development

```
1. SET UP YOUR ENVIRONMENT
   ├── Install Cursor IDE (cursor.com)
   ├── Enable Claude in Cursor settings
   └── Set up GitHub Copilot (optional)

2. START SMALL
   ├── Use AI for documentation first
   ├── Generate boilerplate and scaffolding
   └── Build confidence with low-risk tasks

3. DEVELOP YOUR PROMPT STYLE
   ├── Be specific about requirements
   ├── Include constraints and context
   └── Ask for explanations, not just code

4. ESTABLISH REVIEW HABITS
   ├── Never commit AI code without review
   ├── Test all edge cases manually
   └── Verify against documentation
```

### Recommended Workflow for Analytics Projects

```
Phase 1: DISCOVERY (AI: 70%, Human: 30%)
├── Use AI to research tracking requirements
├── Generate comprehensive event lists
└── Create initial documentation

Phase 2: DESIGN (AI: 40%, Human: 60%)
├── Human designs architecture
├── AI helps with schema structure
└── Human validates against business needs

Phase 3: IMPLEMENTATION (AI: 60%, Human: 40%)
├── AI generates component code
├── Human implements business logic
└── AI helps with debugging

Phase 4: TESTING (AI: 50%, Human: 50%)
├── AI generates test cases
├── Human identifies edge cases
└── Both collaborate on debugging

Phase 5: DOCUMENTATION (AI: 70%, Human: 30%)
├── AI drafts documentation
├── Human reviews for accuracy
└── Human adds context-specific details
```

### Prompt Templates for Adobe/Analytics Work

#### For XDM Schema Design
```
"I need to design an XDM schema for [use case].
My data entities are: [list entities]
Key relationships: [describe]
Business questions I need to answer: [list]

Suggest a schema structure compatible with Adobe Experience Platform."
```

#### For Data Layer Events
```
"Create a data layer event for [event type] in an [industry] context.
Include:
- Standard Adobe commerce/analytics fields
- Custom fields for [specific needs]
- Calculated properties useful for [metrics]

Format as JSON with example values."
```

#### For SDK Implementation
```
"Implement [function name] using Adobe Web SDK [version].
Requirements:
- [requirement 1]
- [requirement 2]
Context:
- Framework: [Next.js/React/etc]
- Consent status: [approach]
- Error handling: [requirements]"
```

---

## 📊 Metrics & Observations

### Time Savings Estimate

| Task | Without AI | With AI | Savings |
|------|------------|---------|---------|
| Component scaffolding | 2-4 hours | 30-60 min | 70-80% |
| Documentation writing | 4-8 hours | 1-2 hours | 75% |
| Debugging common issues | 1-2 hours | 5-15 min | 85% |
| Test case generation | 2-3 hours | 30-45 min | 75% |
| Boilerplate code | 1-2 hours | 10-20 min | 80% |

### Quality Observations

| Aspect | AI Output Quality | Notes |
|--------|-------------------|-------|
| **Syntax correctness** | 95%+ | Rarely has syntax errors |
| **Logic correctness** | 70-80% | Needs human review |
| **Edge case handling** | 40-50% | Major gap, needs human input |
| **Best practices** | 80-90% | Generally follows patterns |
| **Documentation accuracy** | 60-70% | Often needs fact-checking |

---

## 🔗 Resources

### Tools Used
- [Cursor IDE](https://cursor.com) - AI-powered code editor
- [Claude](https://claude.ai) - Anthropic AI assistant
- [Gemini](https://gemini.google.com) - Google AI assistant
- [GitHub Copilot](https://github.com/features/copilot) - Inline AI completion

### Adobe Documentation
- [Web SDK Documentation](https://experienceleague.adobe.com/docs/experience-platform/web-sdk/home.html)
- [XDM Schema Best Practices](https://experienceleague.adobe.com/en/docs/experience-platform/xdm/schema/best-practices)
- [Travel and Hospitality ERD](https://experienceleague.adobe.com/en/docs/experience-platform/xdm/schema/industries/travel-hospitality)

### Learning Resources
- Official Adobe tutorials on Experience Platform
- Community forums for real-world implementation questions
- GitHub repositories with XDM examples

---

## 📝 Conclusion

AI-assisted development is not about replacing human developers - it is about augmenting human capabilities. For the TLP Airways project:

- **AI accelerated** routine coding by 70%+
- **Humans ensured** correctness, security, and business alignment
- **Together**, we built in weeks what would have taken months

The key is understanding AI strengths (speed, breadth, pattern matching) and weaknesses (context, nuance, edge cases) - and designing your workflow accordingly.

---

**Document Version:** 1.0  
**Created:** January 2026  
**Project:** TLP Airways - Adobe Analytics and AEP Learning Demo  
**AI Partners:** Claude (Anthropic), Gemini (Google), GitHub Copilot
