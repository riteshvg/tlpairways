# 🎬 TLP Airways - Video Scripts (Episodes 1-3)

> **Production-Ready Scripts for YouTube Tutorial Series**

---

# 📹 EPISODE 1: "Building a Complete Airlines Booking Platform"

**Duration:** 18-22 minutes  
**Style:** Engaging introduction with live demo  
**Tone:** Professional yet conversational, like explaining to a smart colleague

---

## 🎬 COLD OPEN (0:00 - 0:45)

```
[SCREEN: Show the live TLP Airways website - homepage hero section]

SCRIPT:
"What if I told you that you could build THIS... 
[click through to search, show results, select a flight]
...a complete airlines booking platform...
[show the confirmation page with PNR]
...with real-time analytics tracking, authentication, email confirmations, 
and deploy it to the cloud...
[show Railway dashboard briefly]
...all by yourself?

I'm [Your Name], and over the next few videos, I'm going to show you 
exactly how I built TLP Airways - a fully functional flight booking 
demo that I use for Adobe Experience Platform demonstrations.

Whether you're a developer wanting to level up your portfolio, 
a solutions consultant needing a demo environment, 
or just curious about how airline websites actually work behind the scenes...
this series is for you.

Let's dive in."
```

**[VISUAL: Animated intro/logo - 5 seconds]**

---

## 📍 CHAPTER 1: What We're Building (0:45 - 4:30)

```
[SCREEN: Split view - website on left, feature list on right]

SCRIPT:
"Before we write a single line of code, let me show you what 
we're actually building. TLP Airways isn't just a pretty UI - 
it's a complete booking system.

[Navigate to homepage]
Here's our homepage. Clean, modern design with a hero section, 
popular destinations, and a quick search widget.

[Click 'Book Now' and go to search page]
This is the flight search page. We've got origin and destination 
selectors with smart filtering - meaning if I select Bangalore as my origin,
the destination dropdown only shows cities that actually have flights 
FROM Bangalore.

[Fill in search: BLR to DEL, select dates, 2 adults]
Let me search for a flight. Bangalore to Delhi, let's say next month,
two adult passengers, economy class.

[Show results page]
And here are our results. We've got onward flights, return flights,
pricing in Indian Rupees, and I can select any combination.

[Select flights and proceed]
Now here's where it gets interesting. We've got a complete 
traveller details form...

[Show ancillary services]
...an ancillary services page with an interactive seat map, 
meal selection, baggage upgrades...

[Show payment page]
...a payment page with card validation...

[Show confirmation]
...and finally, a confirmation page with a generated PNR, 
passenger details, and the option to receive an email confirmation.

That's the user journey. But what's happening underneath? 
That's what we're going to explore."
```

---

## 📍 CHAPTER 2: The Tech Stack (4:30 - 9:00)

```
[SCREEN: VS Code with project open, or architecture diagram]

SCRIPT:
"Let's talk about what powers this application.

[Show architecture diagram or draw on screen]

**Frontend:**
We're using Next.js with TypeScript. Why Next.js? 
It gives us the best of both worlds - server-side rendering for 
SEO and performance, plus React's component model for interactivity.
We're also using Material-UI for our design system, which saves us 
tons of time on building UI components from scratch.

**Backend:**
Node.js with Express. Simple, fast, and JavaScript all the way down.
This handles our API endpoints - flight searches, bookings, 
and email sending.

**Authentication:**
Auth0. Look, you could build your own auth system, but why? 
Auth0 gives us OAuth 2.0, social logins, and enterprise-grade 
security out of the box. It took me about 30 minutes to integrate.

**Analytics:**
And here's the secret sauce - the Adobe Data Layer. 
Every single interaction you saw in that demo? 
It's being tracked. Flight searches, selections, purchases - 
all of it is captured in a format that Adobe Analytics 
and Adobe Experience Platform can consume.

**Deployment:**
Railway for hosting. It's like Heroku but better - 
automatic deployments from GitHub, environment variable management,
and a generous free tier.

[Show GitHub repo briefly]
The entire codebase is on GitHub, and by the end of this series,
you'll understand every single file in here."
```

---

## 📍 CHAPTER 3: Project Demo - The Complete Flow (9:00 - 15:00)

```
[SCREEN: Browser with DevTools open, Console tab visible]

SCRIPT:
"Now let me show you something most users never see. 
Let's do a complete booking while watching what happens 
in the data layer.

[Open browser console, type: window.adobeDataLayer]

This is the Adobe Data Layer - an array that captures 
every significant event on our website.

[Start fresh booking - go to homepage]
I'm on the homepage. Let me expand this array...
See this 'pageView' event? It fired the moment the page loaded.
It contains the page name, URL, timestamp, and user information.

[Navigate to search, fill form]
Now I'm searching for a flight...
[Submit search]
BOOM - 'flightSearchInitiated' event. Look at this data:
origin BLR, destination DEL, departure date, number of passengers,
cabin class. Everything a marketing team would want to know 
about search patterns.

[Select a flight from results]
I'll select this morning flight...
'flightSelected' event. It captured which flight I picked,
the price, the position in the list - was it the first result? 
The third? That's valuable for understanding user behavior.

[Proceed through ancillary services]
Selecting my seat... adding a meal... extra baggage...
Each of these is tracked.

[Complete payment]
And finally... payment submitted...
[Show confirmation page]
'purchase' event with 'commerce.purchases'. 

This right here - this is what makes this demo valuable.
This is production-grade analytics tracking that you'd find 
on Emirates, United, or IndiGo.

Let me show you the purchase event structure...
[Expand the event in console]
We've got revenue data, product details broken down by 
flights and ancillary services, customer information 
(hashed for privacy), booking reference... everything."
```

---

## 📍 CHAPTER 4: What You'll Learn (15:00 - 17:30)

```
[SCREEN: Outline of upcoming episodes or bullet points]

SCRIPT:
"So what's coming in this series? Let me give you the roadmap.

**In the next video**, we're going to set up our development 
environment and walk through the project structure. 
I'll show you how I organize components, pages, utilities, 
and data files.

**Episode 3** is all about the design system - our color palette,
typography, component library, and how Material-UI theming works.

**Episodes 4 through 7** - this is the Adobe Data Layer deep dive.
We'll implement tracking from scratch, covering page views, 
custom events, e-commerce purchases, and user identity.

**Episodes 8 through 11** cover the full-stack features:
Auth0 integration, the flight search engine, 
seat maps and ancillary services, and email confirmations.

**And episodes 12 through 15** take us to production:
deployment, Adobe Target personalization, performance optimization,
and a complete series wrap-up.

By the end, you won't just have a cool demo - you'll have 
a portfolio project that demonstrates real-world skills 
that employers and clients are looking for."
```

---

## 📍 CLOSING & CTA (17:30 - 18:30)

```
[SCREEN: Subscribe animation, GitHub link, social links]

SCRIPT:
"If you want to follow along, there are two things to do right now.

First, hit that subscribe button and the notification bell. 
I'm releasing new episodes weekly, and you don't want to miss 
the next one where we actually start building.

Second, the GitHub link is in the description. 
Star the repo, clone it, explore the code. 
I've made sure everything is well-documented.

And if you have questions or suggestions for what you'd like 
to see in this series, drop a comment. I read every single one.

I'm [Your Name], and I'll see you in the next episode 
where we're setting up our development environment and 
exploring the project structure.

Happy coding."

[END CARD: 10 seconds with subscribe button, playlist link, social handles]
```

---

## 🎬 B-ROLL SHOTS NEEDED FOR EPISODE 1

- [ ] Smooth scroll through homepage (5 seconds)
- [ ] Date picker interaction close-up
- [ ] Seat map selection animation
- [ ] Console showing events appearing in real-time
- [ ] GitHub stars/fork count
- [ ] Railway deployment dashboard

---
---

# 📹 EPISODE 2: "Project Setup & Structure"

**Duration:** 16-20 minutes  
**Style:** Tutorial with live coding  
**Tone:** Practical, step-by-step, encouraging

---

## 🎬 COLD OPEN (0:00 - 0:30)

```
[SCREEN: Terminal with project clone in progress]

SCRIPT:
"A good project structure is like a clean apartment - 
everything has its place, and you can find what you need 
without digging through piles of clothes.

Today, we're setting up TLP Airways and I'm going to show you 
a folder structure that's survived six months of feature additions 
without turning into spaghetti code.

Let's get started."
```

**[VISUAL: Animated intro - 5 seconds]**

---

## 📍 CHAPTER 1: Prerequisites & Environment Setup (0:30 - 4:00)

```
[SCREEN: Terminal or split with browser for downloads]

SCRIPT:
"Before we clone the repo, let's make sure you have everything installed.

**Node.js**
You need Node.js version 18 or higher. 
[Type: node --version]
I'm running 20.10. If you need to install it, go to nodejs.org 
or use nvm if you're on Mac or Linux.

**Code Editor**
I'm using VS Code, but any editor works. 
If you're using VS Code, I recommend these extensions:
- ESLint for code quality
- Prettier for formatting  
- TypeScript support comes built-in
- And I love the 'Error Lens' extension for inline error messages

**Git**
You'll need Git for version control.
[Type: git --version]
Got it.

**Package Manager**
We're using npm, which comes with Node.js.
Some people prefer yarn or pnpm - that's fine, 
just adjust the commands accordingly.

Alright, environment is ready. Let's get the code."
```

---

## 📍 CHAPTER 2: Cloning & Initial Setup (4:00 - 7:30)

```
[SCREEN: Terminal, full screen or large]

SCRIPT:
"Head to GitHub - the link is in the description - 
and you can either fork the repo or clone it directly.

[Type commands as you speak]

git clone https://github.com/riteshvg/tlpairways.git
cd tlpairways

Let's see what we've got...
ls -la

Okay, we've got our main directories here. 
Let me open this in VS Code.

code .

[VS Code opens]

Now, this is a monorepo structure - meaning we have 
both our frontend and backend in the same repository.
Let me show you the lay of the land.

First, let's install dependencies. We have a root package.json
that orchestrates everything.

npm install

This is installing dependencies for the root, which mainly 
contains development tools and scripts.

Now we need to set up the frontend:

cd frontend-next
npm install

And the backend:

cd ../backend  
npm install

[While installing, start explaining structure]

While that's running, let me explain what each folder does..."
```

---

## 📍 CHAPTER 3: Project Structure Deep Dive (7:30 - 14:00)

```
[SCREEN: VS Code with file explorer open]

SCRIPT:
"Let me walk you through the folder structure. 
This is where you'll spend most of your time.

[Click through folders as you explain]

**Root Level**

tlpairways/
├── frontend-next/    ← Our Next.js application
├── backend/          ← Node.js API server
├── documentation/    ← All our project docs
├── cypress/          ← End-to-end tests
└── archive/          ← Legacy code (we won't touch this)

The most important ones are frontend-next and backend.

---

**Frontend Structure**

Let me expand frontend-next...

frontend-next/
├── pages/            ← Route-based pages (Next.js magic)
├── components/       ← Reusable UI components
├── lib/              ← Utilities and services
├── data/             ← Static data (flights, airports)
├── public/           ← Static assets (images, fonts)
└── theme/            ← Material-UI theme configuration

**The Pages Directory**
[Open pages folder]

In Next.js, every file in the pages directory becomes a route.
So index.tsx is our homepage at '/'
search.tsx is '/search'
results.tsx is '/results'
And so on.

See how intuitive that is? No need to configure React Router - 
the file system IS your router.

Let me open index.tsx...
[Open the file]

This is our homepage. You can see we're importing components,
using Material-UI for layout, and there's our hero section.

**The Components Directory**
[Open components folder]

We keep reusable pieces here.
- Navbar.tsx - the navigation bar used on every page
- BookingSteps.tsx - the progress indicator in the booking flow
- PassengerSelector.tsx - the adult/child/infant picker
- SeatMap.tsx - our interactive seat selection

[Open Navbar.tsx briefly]
See how this is self-contained? It handles its own state,
its own styling, and can be dropped into any page.

**The Lib Directory**
[Open lib folder]

This is where the business logic lives.
- analytics/ - Adobe Data Layer service
- auth/ - Auth0 utilities

[Open analytics folder]
AdobeDataLayerService - this is the heart of our tracking implementation.
We'll spend an entire episode on this later.

**The Data Directory**
[Open data folder]

Mock data for our demo.
- flights.json - all available flights with schedules and prices
- airports.ts - airport codes and city names

[Open flights.json briefly]
See? Each flight has an ID, origin, destination, times, prices per class...
This simulates what a real API would return.

---

**Backend Structure**

Now let's look at the backend.

backend/
├── src/
│   ├── routes/       ← API endpoints
│   ├── services/     ← Business logic
│   ├── models/       ← Data structures
│   ├── config/       ← Configuration
│   └── index.js      ← Entry point

[Open routes folder]
We have routes for:
- flights.js - search and get flight data
- airports.js - get airport list
- email.js - send confirmation emails
- bookings.js - save booking data

[Open services folder]
Services contain the actual logic.
- emailService.js - integrates with SendGrid
- flightService.js - filters and returns flights

This separation is important - routes handle HTTP,
services handle business logic. 
Never mix the two."
```

---

## 📍 CHAPTER 4: Environment Configuration (14:00 - 16:30)

```
[SCREEN: VS Code showing .env files]

SCRIPT:
"Now let's talk about environment variables - 
the secret sauce that makes your app work.

[Open .env.example or env.example]

Every project has an example env file. 
Never commit your actual secrets!

Let me create our local environment file.

[In terminal]
cp frontend-next/env.example frontend-next/.env.local

[Open .env.local]

Here's what we need:

# Auth0 - We'll set this up in episode 8
AUTH0_SECRET='a-long-random-string-here'
AUTH0_BASE_URL='http://localhost:3000'
AUTH0_ISSUER_BASE_URL='https://your-tenant.auth0.com'
AUTH0_CLIENT_ID='your-client-id'
AUTH0_CLIENT_SECRET='your-client-secret'

For now, you can leave the Auth0 values as placeholders - 
the app will work without authentication.

# Backend URL
NEXT_PUBLIC_BACKEND_URL='http://localhost:5000'

# Adobe Analytics - Optional for now
NEXT_PUBLIC_ADOBE_LAUNCH_URL='your-launch-script-url'

The prefix NEXT_PUBLIC_ means this variable is exposed to the browser.
Variables without that prefix are server-side only - 
important for security.

Now let's do the same for the backend...

cp backend/.env.example backend/.env

[Open backend/.env]

PORT=5000
NODE_ENV=development
EMAIL_ENABLED=false

We're disabling emails in development. 
You don't want to accidentally send test emails to real addresses."
```

---

## 📍 CHAPTER 5: Running the Application (16:30 - 18:30)

```
[SCREEN: Terminal with split or tabs]

SCRIPT:
"Moment of truth - let's start this thing.

We need two terminal windows - one for the frontend, one for the backend.

**Terminal 1 - Backend**
cd backend
npm run dev

[Server starts]
Backend is running on port 5000.

**Terminal 2 - Frontend**  
cd frontend-next
npm run dev

[Server starts]
Frontend is running on port 3000.

[Open browser to localhost:3000]

And there it is! Our TLP Airways homepage, running locally.

[Quick click through]
Search works... results load... 
We're in business.

If you see any errors, check:
1. Both servers are running
2. Your .env files are in place
3. Dependencies are installed

Drop a comment if you're stuck - I'll help you out."
```

---

## 📍 CLOSING & CTA (18:30 - 19:30)

```
[SCREEN: VS Code with project open, then end card]

SCRIPT:
"We've got our development environment running and you now 
understand how TLP Airways is structured.

In the next episode, we're diving into the design system - 
the colors, typography, and Material-UI theme that makes 
this app look professional.

Make sure you've got the project running locally before then,
because we're going to start making changes.

Hit subscribe if you haven't already, and I'll see you 
in Episode 3.

Happy coding."

[END CARD: 10 seconds]
```

---

## 🎬 B-ROLL SHOTS NEEDED FOR EPISODE 2

- [ ] npm install progress animation
- [ ] VS Code folder structure expanding
- [ ] Terminal split-screen with both servers
- [ ] Quick typing montage of commands

---
---

# 📹 EPISODE 3: "Design System & UI Components"

**Duration:** 18-22 minutes  
**Style:** Visual tutorial with code editing  
**Tone:** Creative, inspiring, showing the "why" behind design choices

---

## 🎬 COLD OPEN (0:00 - 0:40)

```
[SCREEN: Side-by-side of ugly wireframe vs polished TLP Airways]

SCRIPT:
"You know what separates a demo that makes people say 'nice!' 
from one that makes them say 'WOW'?

[Transition from wireframe to polished UI]

It's not the features. It's not the code complexity.
It's the design system.

Today we're breaking down exactly how TLP Airways goes from 
basic components to this polished, professional look 
that could pass for a real airline website.

Let's build something beautiful."
```

**[VISUAL: Animated intro - 5 seconds]**

---

## 📍 CHAPTER 1: What is a Design System? (0:40 - 3:30)

```
[SCREEN: Examples of design systems - airline websites]

SCRIPT:
"Before we look at code, let's understand what a design system is.

Think of it like a brand guideline for developers.
It defines:
- Colors - not just 'blue', but exactly WHICH blue
- Typography - font families, sizes, weights
- Spacing - consistent margins and padding
- Components - buttons, cards, inputs that look the same everywhere

[Show Emirates, IndiGo, Lufthansa websites briefly]

Look at any major airline website. 
Every button looks the same. Every card has the same border radius.
Every heading uses the same font.

That's not by accident - that's a design system.

[Show TLP Airways]

For TLP Airways, I wanted a modern, premium feel.
Think Emirates meets a Silicon Valley startup.
Deep purples, subtle gradients, lots of white space.

Let me show you how this is implemented."
```

---

## 📍 CHAPTER 2: Material-UI Theme Configuration (3:30 - 9:00)

```
[SCREEN: VS Code - theme configuration file]

SCRIPT:
"Our design system is powered by Material-UI's theming system.
Let me open our theme configuration.

[Open frontend-next/theme/index.ts or theme file]

This is the single source of truth for our entire UI.

**Color Palette**

Let's start with colors.

[Highlight the palette section]

palette: {
  primary: {
    main: '#6366F1',      // Indigo - our brand color
    light: '#818CF8',
    dark: '#4F46E5',
    contrastText: '#FFFFFF'
  },
  secondary: {
    main: '#EC4899',      // Pink accent
    light: '#F472B6',
    dark: '#DB2777'
  },
  background: {
    default: '#F8FAFC',   // Light gray background
    paper: '#FFFFFF'       // White cards
  }
}

See how we're not using random hex codes everywhere?
We define them once, and reference them throughout the app.

When I want a button in the primary color, I don't write '#6366F1'.
I write 'primary.main' - and if we ever rebrand, 
I change ONE line and the whole app updates.

[Show a button component using the theme]

<Button color='primary' variant='contained'>
  Book Now
</Button>

That button automatically gets our indigo color, 
the right text contrast, hover states... everything.

**Typography**

[Scroll to typography section]

typography: {
  fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  h1: {
    fontSize: '2.5rem',
    fontWeight: 700,
    lineHeight: 1.2
  },
  h2: {
    fontSize: '2rem',
    fontWeight: 600
  },
  body1: {
    fontSize: '1rem',
    lineHeight: 1.6
  },
  button: {
    textTransform: 'none',  // No UPPERCASE buttons
    fontWeight: 600
  }
}

I'm using Inter as the primary font - it's clean, modern, 
and extremely readable. You can get it from Google Fonts.

Notice 'textTransform: none' for buttons. 
By default, Material-UI makes button text UPPERCASE.
That looks dated to me, so I disable it.

**Spacing & Border Radius**

[Show shape configuration]

shape: {
  borderRadius: 12  // Rounded corners everywhere
}

This gives us those modern, friendly rounded corners.
Every card, every button, every input - consistent.

**Component Overrides**

[Show components section if it exists]

Now here's where it gets powerful - component overrides.

components: {
  MuiButton: {
    styleOverrides: {
      root: {
        borderRadius: 8,
        padding: '10px 24px',
        boxShadow: 'none',
        '&:hover': {
          boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
        }
      }
    }
  },
  MuiCard: {
    styleOverrides: {
      root: {
        borderRadius: 16,
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
      }
    }
  }
}

Every Button in our app now has that subtle hover shadow.
Every Card has that soft, elevated look.
We defined it once, and it applies everywhere."
```

---

## 📍 CHAPTER 3: Key UI Components Walkthrough (9:00 - 15:00)

```
[SCREEN: VS Code + Browser preview side by side]

SCRIPT:
"Let me show you how our main components use this design system.

**The Navbar**

[Open components/Navbar.tsx]

Our navbar is fixed at the top, has our logo, navigation links,
and a login button.

[Highlight key styling]

<AppBar 
  position='fixed'
  sx={{
    background: 'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(10px)',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  }}
>

See that 'backdropFilter: blur(10px)'? 
That's the frosted glass effect you see on modern websites.
The content behind the navbar gets blurred as you scroll.

[Scroll on the live site to demonstrate]

Subtle, but it makes a huge difference in perceived quality.

---

**Flight Cards**

[Navigate to results page, show a flight card]

Let's look at how we display flights.

[Open relevant component or results.tsx]

Each flight card shows:
- Airline logo and flight number
- Departure and arrival times with city codes
- Duration and stops
- Price prominently displayed

The card uses:
- Our theme's border radius (rounded corners)
- The soft shadow from our card override
- Hover effect to indicate it's clickable

[Hover over card to show effect]

<Card
  sx={{
    transition: 'transform 0.2s, box-shadow 0.2s',
    '&:hover': {
      transform: 'translateY(-4px)',
      boxShadow: '0 12px 24px rgba(0, 0, 0, 0.15)'
    }
  }}
>

That micro-animation - lifting up slightly on hover - 
tells the user 'this is interactive' without them having to guess.

---

**Booking Steps Indicator**

[Show booking flow with stepper]

[Open components/BookingSteps.tsx]

This component shows where you are in the booking process.

We're using Material-UI's Stepper component, but customized:

<Stepper 
  activeStep={currentStep}
  sx={{
    '& .MuiStepIcon-root.Mui-active': {
      color: 'primary.main'
    },
    '& .MuiStepIcon-root.Mui-completed': {
      color: 'success.main'
    }
  }}
>
  <Step><StepLabel>Search</StepLabel></Step>
  <Step><StepLabel>Select Flight</StepLabel></Step>
  <Step><StepLabel>Traveller Details</StepLabel></Step>
  <Step><StepLabel>Payment</StepLabel></Step>
  <Step><StepLabel>Confirmation</StepLabel></Step>
</Stepper>

Active steps show our primary indigo.
Completed steps turn green.
Users always know where they are.

---

**The Seat Map**

[Navigate to ancillary services, show seat map]

[Open components/SeatMap.tsx]

This is probably our most complex visual component.

We're rendering an SVG-based seat layout.
Each seat is a clickable element that can be:
- Available (default color)
- Selected (primary color) 
- Occupied (gray, non-clickable)
- Premium (different color, higher price)

[Click a seat to select it]

<Box
  onClick={() => handleSeatClick(seat)}
  sx={{
    width: 36,
    height: 36,
    borderRadius: 1,
    backgroundColor: getSeatColor(seat),
    cursor: seat.available ? 'pointer' : 'not-allowed',
    transition: 'all 0.2s',
    '&:hover': seat.available ? {
      transform: 'scale(1.1)'
    } : {}
  }}
/>

Interactive, responsive, and visually clear."
```

---

## 📍 CHAPTER 4: Responsive Design (15:00 - 17:30)

```
[SCREEN: Browser with DevTools open, device toolbar enabled]

SCRIPT:
"A beautiful desktop design is worthless if it breaks on mobile.
Let's see how TLP Airways handles different screen sizes.

[Toggle device toolbar in DevTools, select iPhone view]

Here's our homepage on mobile.

[Show mobile layout]

The navigation collapses into a hamburger menu.
The hero text resizes to fit.
Cards stack vertically instead of in a grid.

How do we achieve this? Material-UI's breakpoint system.

[Show code example]

<Grid container spacing={3}>
  <Grid item xs={12} md={6} lg={4}>
    <DestinationCard />
  </Grid>
</Grid>

Breakpoints:
- xs (extra-small): phones, full width
- sm (small): large phones
- md (medium): tablets, 2 columns
- lg (large): desktops, 3 columns

For typography, we use responsive values:

<Typography
  sx={{
    fontSize: { xs: '1.5rem', md: '2.5rem', lg: '3rem' }
  }}
>
  Fly the Luxurious Way
</Typography>

Different font size at each breakpoint.
No media query spaghetti - it's all inline and readable.

[Switch between device sizes to demonstrate]

Works on every device. Ship it."
```

---

## 📍 CHAPTER 5: Quick Design Exercise (17:30 - 19:30)

```
[SCREEN: VS Code, live editing]

SCRIPT:
"Let me show you how easy it is to change the entire look 
with our theme system.

What if TLP Airways was acquired by a company with 
a different brand color? Let's say... teal.

[Open theme file, change primary.main]

primary: {
  main: '#14B8A6',  // Teal instead of indigo
}

[Save, show hot reload]

Look at that. Every button, every indicator, every accent - 
all updated to teal. One line change.

Let me put it back...

[Revert change]

That's the power of a design system.
You're not hunting through 50 files to find all the places 
where you hard-coded a color.
You change it once, and you're done.

I encourage you to experiment with the theme.
Try different colors, different border radius values,
different shadows. See how it affects the entire app."
```

---

## 📍 CLOSING & CTA (19:30 - 20:30)

```
[SCREEN: Side by side - code and polished UI, then end card]

SCRIPT:
"That's our design system - the foundation that makes 
TLP Airways look professional and feel cohesive.

Quick recap:
- We use Material-UI's theming for consistency
- Colors, typography, and spacing are defined once
- Component overrides apply styles globally
- Responsive design is built-in with breakpoints

Next episode, we're diving into the Adobe Data Layer.
This is where analytics gets interesting - we'll implement 
page views, custom events, and start capturing real user behavior.

If you've been following along and have your project running,
try making a theme change and share a screenshot in the comments.
I'd love to see your color variations.

Subscribe, hit the bell, and I'll see you in Episode 4.

Happy designing."

[END CARD: 10 seconds]
```

---

## 🎬 B-ROLL SHOTS NEEDED FOR EPISODE 3

- [ ] Slow-mo UI transitions (button hovers, card lifts)
- [ ] Color palette showcase (swatches animating)
- [ ] Mobile responsive transformation
- [ ] Side-by-side before/after design
- [ ] Smooth scroll through polished UI

---

# 📋 PRODUCTION CHECKLIST FOR EPISODES 1-3

## Pre-Recording
- [ ] Scripts reviewed and timed
- [ ] All code samples tested
- [ ] Environment clean and ready
- [ ] Screen recording resolution set (1080p or 4K)
- [ ] Microphone levels checked
- [ ] VS Code theme set (recommend Dark+)
- [ ] Browser clean (no personal bookmarks visible)
- [ ] Notifications disabled

## Recording Setup
- [ ] OBS/Camtasia ready
- [ ] Good lighting on face (if doing facecam)
- [ ] Water nearby (you'll be talking a lot!)
- [ ] Script visible on second monitor

## Post-Production
- [ ] Edit out mistakes and long pauses
- [ ] Add chapter markers for YouTube
- [ ] Create thumbnail
- [ ] Write description with timestamps
- [ ] Add cards and end screen
- [ ] Schedule upload

---

**Script Version:** 1.0  
**Created:** January 2026  
**Author:** TLP Airways Team
