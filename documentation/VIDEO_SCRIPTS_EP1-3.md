# 🎬 TLP Airways - Video Scripts (Episodes 1-3)

> **Learning to Build a Complete Airlines Booking Platform**

---

# 📹 EPISODE 1: "Why I Built This Airline Booking Demo"

**Duration:** 18-22 minutes  
**Style:** Honest introduction with live demo  
**Tone:** Conversational, like sharing a project with a friend

---

## 🎬 COLD OPEN (0:00 - 0:45)

```
[SCREEN: Show the live TLP Airways website - homepage hero section]

SCRIPT:
"So I built this thing.

[click through to search, show results, select a flight]

It's a fake airline booking website.
You can search for flights, pick seats, add meals, 
go through payment, and get a confirmation.

[show the confirmation page with PNR]

Why? Honestly, I wanted to learn how complex booking systems work.
And I needed something for Adobe Experience Platform demos.

[show Railway dashboard briefly]

It's deployed. It works. And along the way, 
I learned way more than I expected about 
full-stack development, analytics tracking, and UI design.

I'm [Your Name], and I thought I'd share how I built it.
Not because I did everything perfectly — I definitely didn't.
But maybe seeing my approach will help you with your own projects.

Let's take a look."
```

**[VISUAL: Animated intro/logo - 5 seconds]**

---

## 📍 CHAPTER 1: What We're Looking At (0:45 - 4:30)

```
[SCREEN: Split view - website on left, feature list on right]

SCRIPT:
"Let me show you what's actually here.
This isn't just a UI mockup — there's real functionality.

[Navigate to homepage]
Here's the homepage. Pretty standard stuff — 
hero section, popular destinations, search widget.

[Click 'Book Now' and go to search page]
This is the search page. One thing I'm happy with 
is the smart filtering — if I select Bangalore as origin,
the destination dropdown only shows places we have flights to.

That was surprisingly tricky to get right.

[Fill in search: BLR to DEL, select dates, 2 adults]
Let me search for something. Bangalore to Delhi, 
two passengers, economy.

[Show results page]
Here are the results. Onward and return flights,
pricing, and you can select any combination.

[Select flights and proceed]
Now the booking flow...

[Show ancillary services]
There's an interactive seat map here. 
Meal selection. Baggage upgrades.
This page was fun to build, actually.

[Show payment page]
Payment page with card validation...

[Show confirmation]
And a confirmation with a generated booking reference.

The whole flow works. It's not connected to real flights, 
obviously — it's mock data. But the UX mirrors 
what real airline sites do.

Now let me show you what's happening under the hood."
```

---

## 📍 CHAPTER 2: The Tech Stack (4:30 - 9:00)

```
[SCREEN: VS Code with project open, or architecture diagram]

SCRIPT:
"Here's what I'm using. Some of these choices 
I'd probably reconsider if I started over, 
but they work well enough.

[Show architecture diagram or explain verbally]

**Frontend:**
Next.js with TypeScript. I chose Next.js because 
I wanted server-side rendering and the file-based routing 
is really convenient. 

Material-UI for the design system. 
It saved me a ton of time — I didn't want to 
style every button and input from scratch.

**Backend:**
Node.js with Express. Simple and I know it well.
Handles the API endpoints for flights and email sending.

**Authentication:**
Auth0. I didn't want to build my own auth — 
that felt like a rabbit hole. Auth0 took maybe 
30 minutes to integrate, and it just works.

**Analytics:**
This is the part I'm most interested in — 
the Adobe Data Layer.

Every interaction in the demo is tracked.
Flight searches, selections, purchases — 
all captured in a format for Adobe Analytics and AEP.

We'll dig into this in later episodes.

**Deployment:**
Railway. It's like Heroku but I find the 
interface cleaner. Automatic deployments from GitHub.

[Show GitHub repo briefly]
The code is on GitHub. It's not perfectly organized, 
but it's fairly readable. You can clone it and explore."
```

---

## 📍 CHAPTER 3: The Data Layer - Quick Demo (9:00 - 15:00)

```
[SCREEN: Browser with DevTools open, Console tab visible]

SCRIPT:
"Let me show you something I think is cool.
Open the browser console and let's do a booking.

[Open browser console, type: window.adobeDataLayer]

This is the Adobe Data Layer — 
basically an array that captures events as they happen.

[Start fresh booking - go to homepage]
I'm on the homepage. Let me expand this array...
See this 'pageView' event? It fired when the page loaded.
Page name, URL, timestamp, user info — it's all there.

[Navigate to search, fill form]
Now I'm searching...

[Submit search]
There — 'searchInitiated' event. 
Origin, destination, dates, passenger count.
This is the kind of data marketing teams care about.

[Select a flight from results]
I'll pick this flight...
'flightSelected' event. It captures which flight I chose,
the price, even the position in the list.

That position thing is interesting for merchandising —
if users always pick the second result, 
maybe the sorting algorithm needs work.

[Proceed through ancillary services]
Selecting a seat... adding a meal...
Each interaction is tracked.

[Complete payment]
And finally, payment...

[Show confirmation page]
'purchase' event.

This is what I was building toward.
A proper e-commerce purchase event with 
revenue, products, customer info (hashed).

[Expand the event in console]
Look at the structure — 
flights and ancillary items are broken down separately.
That allows for proper revenue attribution in analytics.

Getting this right took me several attempts, honestly.
The products array format wasn't obvious at first."
```

---

## 📍 CHAPTER 4: What's Coming in This Series (15:00 - 17:30)

```
[SCREEN: Outline of upcoming episodes or bullet points]

SCRIPT:
"Here's what I'm planning to cover.
This might evolve as I go — I'm figuring out what's 
most useful to share.

**Next episode**: Project setup and folder structure.
How I organize components, pages, and utilities.

**Episode 3**: The design system.
Material-UI theming, colors, typography — 
how to make things look consistent.

**Episodes 4-7**: Adobe Data Layer deep dive.
This is the core of what makes this demo useful.
Page views, custom events, e-commerce purchases.

**Episodes 8-11**: Full-stack features.
Auth0 integration, the search engine,
seat maps, email confirmations.

**Episodes 12-15**: Production stuff.
Deployment, personalization with Target,
and wrapping it all up.

By the end, hopefully you'll have a sense of 
how to build something like this yourself.
Or at least, what's involved."
```

---

## 📍 CLOSING & CTA (17:30 - 18:30)

```
[SCREEN: Subscribe animation, GitHub link, social links]

SCRIPT:
"If you want to follow along, the GitHub link is in the description.
Clone it, poke around, break things — that's how you learn.

If you have questions or suggestions, drop a comment.
I read them, and if I don't know the answer, 
I'll try to figure it out.

I'm [Your Name], and I'll see you in the next episode 
where we look at project structure and setup.

Thanks for watching."

[END CARD: 10 seconds with subscribe button, playlist link]
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
**Tone:** Practical, step-by-step, friendly

---

## 🎬 COLD OPEN (0:00 - 0:30)

```
[SCREEN: Terminal with project clone in progress]

SCRIPT:
"A good folder structure saves you so much headache later.

I didn't get this right immediately — 
the first version of this project was a mess.
I eventually reorganized it, and now it makes sense to me.

Today I'll show you how it's set up 
and we'll get the project running locally.

Let's go."
```

**[VISUAL: Animated intro - 5 seconds]**

---

## 📍 CHAPTER 1: What You Need to Install (0:30 - 4:00)

```
[SCREEN: Terminal or split with browser for downloads]

SCRIPT:
"Before we clone anything, let's make sure you have the basics.

**Node.js**
You need Node 18 or higher. 
[Type: node --version]
I'm on 20. If you don't have it, grab it from nodejs.org 
or use nvm if you prefer.

**Code Editor**
I use VS Code, but really anything works. 
If you're in VS Code, I recommend:
- ESLint for catching mistakes
- Prettier for formatting  
- Error Lens for inline error messages — really helpful

**Git**
For cloning and version control.
[Type: git --version]
Good.

**Package Manager**
We're using npm. Yarn or pnpm work too — 
just adjust the commands.

Okay, let's get the code."
```

---

## 📍 CHAPTER 2: Cloning & Initial Setup (4:00 - 7:30)

```
[SCREEN: Terminal, full screen or large]

SCRIPT:
"The repo is on GitHub — link's in the description.

[Type commands as you speak]

git clone https://github.com/riteshvg/tlpairways.git
cd tlpairways

Let's see what we've got...
ls -la

Okay, there's our directories. Let me open this in VS Code.

code .

[VS Code opens]

Now, this is a monorepo — frontend and backend 
are in the same repository.

Let's install dependencies.

npm install

That installs some root-level stuff.

Now the frontend:

cd frontend-next
npm install

And the backend:

cd ../backend  
npm install

[While installing, start explaining]

While that's running, let me explain what each folder does..."
```

---

## 📍 CHAPTER 3: Project Structure (7:30 - 14:00)

```
[SCREEN: VS Code with file explorer open]

SCRIPT:
"Let me walk you through this.

[Click through folders as you explain]

**Root Level**

tlpairways/
├── frontend-next/    ← Next.js app
├── backend/          ← Node.js API server
├── documentation/    ← Project docs
├── cypress/          ← Tests (not fully built out)
└── archive/          ← Old stuff I'm keeping around

The main ones are frontend-next and backend.

---

**Frontend Structure**

Let me expand frontend-next...

frontend-next/
├── pages/            ← Routes (Next.js thing)
├── components/       ← Reusable UI pieces
├── lib/              ← Utilities and services
├── data/             ← Static data like flights and airports
├── public/           ← Images, fonts
└── theme/            ← Material-UI theming

**Pages Directory**
[Open pages folder]

In Next.js, each file here becomes a route.
index.tsx = homepage at '/'
search.tsx = '/search'
results.tsx = '/results'

It's pretty intuitive once you get used to it.
No need for a separate router configuration.

Let me open index.tsx...
[Open the file]

This is the homepage. You can see the imports,
Material-UI components, the hero section.

**Components Directory**
[Open components folder]

Reusable stuff lives here.
- Navbar.tsx - navigation
- BookingSteps.tsx - progress indicator
- PassengerSelector.tsx - the passenger count picker
- SeatMap.tsx - the seat selection grid

[Open Navbar.tsx briefly]
Each component is self-contained.
It handles its own state and styling.

**Lib Directory**
[Open lib folder]

Business logic and services.
- analytics/ - the data layer implementation
- auth/ - Auth0 utilities

[Open analytics folder]
This is where the tracking code lives.
We'll spend a lot of time here later.

**Data Directory**
[Open data folder]

Mock data.
- flights.json - routes, schedules, prices
- airports.ts - airport codes and cities

[Open flights.json briefly]
Each flight has an ID, origin, destination, times, prices...
This is what a real API would return, basically.

---

**Backend Structure**

Now the backend.

backend/
├── src/
│   ├── routes/       ← API endpoints
│   ├── services/     ← Business logic
│   ├── models/       ← Data structures
│   └── index.js      ← Entry point

[Open routes folder]
Routes for flights, airports, email, bookings.

[Open services folder]
Services have the actual logic — 
email sending, flight filtering, etc.

I try to keep routes thin — 
they just handle HTTP request/response.
Services do the real work."
```

---

## 📍 CHAPTER 4: Environment Variables (14:00 - 16:30)

```
[SCREEN: VS Code showing .env files]

SCRIPT:
"Environment variables. The thing I always forget to set up.

[Open .env.example]

There's an example file. Never commit your actual secrets!

Let me create the local env file.

[In terminal]
cp frontend-next/env.example frontend-next/.env.local

[Open .env.local]

Here's what we need:

# Auth0 - we'll set this up later
AUTH0_SECRET='a-long-random-string'
AUTH0_BASE_URL='http://localhost:3000'
AUTH0_ISSUER_BASE_URL='https://your-tenant.auth0.com'
AUTH0_CLIENT_ID='your-client-id'
AUTH0_CLIENT_SECRET='your-client-secret'

For now, you can leave Auth0 values as placeholders.
The app runs without authentication — 
you just can't log in.

# Backend URL
NEXT_PUBLIC_BACKEND_URL='http://localhost:5000'

# Adobe Analytics - optional
NEXT_PUBLIC_ADOBE_LAUNCH_URL='your-launch-script-url'

NEXT_PUBLIC_ prefix means it's exposed to the browser.
Variables without that prefix are server-side only.

Now the backend...

cp backend/.env.example backend/.env

[Open backend/.env]

PORT=5000
NODE_ENV=development
EMAIL_ENABLED=false

Email is disabled in dev. 
You don't want to accidentally send test emails 
to real addresses. I learned that the hard way."
```

---

## 📍 CHAPTER 5: Running the App (16:30 - 18:30)

```
[SCREEN: Terminal with split or tabs]

SCRIPT:
"Let's see if this actually works.

We need two terminals — frontend and backend.

**Terminal 1 - Backend**
cd backend
npm run dev

[Server starts]
Backend running on 5000.

**Terminal 2 - Frontend**  
cd frontend-next
npm run dev

[Server starts]
Frontend on 3000.

[Open browser to localhost:3000]

And there it is. TLP Airways, running locally.

[Quick click through]
Search works... results load... 

If you see errors, check:
1. Both servers are running
2. .env files exist
3. Dependencies installed

If you're stuck, drop a comment — 
I'll try to help."
```

---

## 📍 CLOSING & CTA (18:30 - 19:30)

```
[SCREEN: VS Code with project open, then end card]

SCRIPT:
"We've got the project running.
You've seen how it's organized.

Next episode, we're looking at the design system —
colors, typography, Material-UI theming.
How things go from basic to looking decent.

Make sure you have the project running locally.
We'll start making changes.

See you in Episode 3."

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
**Tone:** Exploratory, showing how decisions were made

---

## 🎬 COLD OPEN (0:00 - 0:40)

```
[SCREEN: Side-by-side of ugly wireframe vs polished TLP Airways]

SCRIPT:
"There's a difference between 'functional' and 'nice to look at'.

[Transition from wireframe to polished UI]

When I first built this, it was functional.
But it looked pretty rough.

It took me a while to figure out how to make it look...
not embarrassing.

Today I want to share what I learned about design systems
and how Material-UI theming works.

I'm not a designer, by the way.
But I've figured out some patterns that help."
```

**[VISUAL: Animated intro - 5 seconds]**

---

## 📍 CHAPTER 1: What's a Design System? (0:40 - 3:30)

```
[SCREEN: Examples of design systems - airline websites]

SCRIPT:
"A design system is basically a set of rules 
for how your UI should look.

It defines:
- Colors — not just 'blue', but which specific blue
- Typography — fonts, sizes, weights
- Spacing — consistent margins and padding
- Components — buttons and cards that look the same everywhere

[Show Emirates, IndiGo, Lufthansa websites briefly]

Look at any major airline website.
Every button looks the same. Every card has the same style.
That consistency doesn't happen by accident.

[Show TLP Airways]

For TLP Airways, I wanted something modern-ish.
Purples, subtle shadows, clean spacing.

I looked at a bunch of airline sites and 
tried to figure out what made them look professional.

Let me show you how I implemented it."
```

---

## 📍 CHAPTER 2: Material-UI Theming (3:30 - 9:00)

```
[SCREEN: VS Code - theme configuration file]

SCRIPT:
"Material-UI has a theming system that's really useful.
You define your styles once, and they apply everywhere.

[Open frontend-next/theme/index.ts or theme file]

**Color Palette**

[Highlight the palette section]

palette: {
  primary: {
    main: '#6366F1',      // Indigo - main brand color
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
    default: '#F8FAFC',   // Light gray
    paper: '#FFFFFF'       // White for cards
  }
}

The key is — I'm not hard-coding colors everywhere.
I define them once and use 'primary.main' instead of '#6366F1'.

If I ever want to change the brand color,
I change one line and everything updates.

[Show a button component using the theme]

<Button color='primary' variant='contained'>
  Book Now
</Button>

That button automatically gets the right colors,
hover states — everything.

**Typography**

[Scroll to typography section]

typography: {
  fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  h1: {
    fontSize: '2.5rem',
    fontWeight: 700,
    lineHeight: 1.2
  },
  body1: {
    fontSize: '1rem',
    lineHeight: 1.6
  },
  button: {
    textTransform: 'none',  // No UPPERCASE
    fontWeight: 600
  }
}

I'm using Inter as the main font.
It's clean and readable.

See 'textTransform: none'? 
By default Material-UI makes button text UPPERCASE.
That looks dated to me, so I turn it off.

**Spacing & Corners**

[Show shape configuration]

shape: {
  borderRadius: 12
}

Rounded corners everywhere.
Cards, buttons, inputs — all consistent.

**Component Overrides**

[Show components section]

This is where it gets powerful.

components: {
  MuiButton: {
    styleOverrides: {
      root: {
        borderRadius: 8,
        padding: '10px 24px',
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

Now every Button has that subtle hover shadow.
Every Card has that soft shadow.
I defined it once."
```

---

## 📍 CHAPTER 3: Key Components (9:00 - 15:00)

```
[SCREEN: VS Code + Browser preview side by side]

SCRIPT:
"Let me show you a few components and how they work.

**The Navbar**

[Open components/Navbar.tsx]

<AppBar 
  position='fixed'
  sx={{
    background: 'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(10px)',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  }}
>

See 'backdropFilter: blur(10px)'?
That's the frosted glass effect.
Content behind the navbar gets blurred as you scroll.

[Scroll on the live site to demonstrate]

It's subtle, but it feels more polished.

---

**Flight Cards**

[Navigate to results page]

Each card shows flight info — times, duration, price.

[Open relevant component]

The hover effect lifts the card slightly:

<Card
  sx={{
    transition: 'transform 0.2s, box-shadow 0.2s',
    '&:hover': {
      transform: 'translateY(-4px)',
      boxShadow: '0 12px 24px rgba(0, 0, 0, 0.15)'
    }
  }}
>

[Hover over card to show effect]

That micro-animation tells users 'this is clickable'.

---

**Booking Steps**

[Show booking flow with stepper]

[Open components/BookingSteps.tsx]

This shows progress through the booking.

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
  ...
</Stepper>

Active steps are indigo. Completed are green.
Users always know where they are.

---

**The Seat Map**

[Navigate to ancillary services]

[Open components/SeatMap.tsx]

This one's more complex.
Each seat is clickable — available, selected, or occupied.

<Box
  onClick={() => handleSeatClick(seat)}
  sx={{
    width: 36,
    height: 36,
    borderRadius: 1,
    backgroundColor: getSeatColor(seat),
    cursor: seat.available ? 'pointer' : 'not-allowed',
    '&:hover': seat.available ? {
      transform: 'scale(1.1)'
    } : {}
  }}
/>

It took me a while to get this working nicely.
The scaling on hover was a nice touch I found."
```

---

## 📍 CHAPTER 4: Responsive Design (15:00 - 17:30)

```
[SCREEN: Browser with DevTools open, device toolbar enabled]

SCRIPT:
"A nice desktop design needs to work on mobile too.
Let me show you how this handles different screen sizes.

[Toggle device toolbar in DevTools, select iPhone view]

Here's the homepage on mobile.

[Show mobile layout]

Navigation becomes a hamburger menu.
Cards stack vertically.
Text resizes.

Material-UI's breakpoint system makes this easier.

[Show code example]

<Grid container spacing={3}>
  <Grid item xs={12} md={6} lg={4}>
    <DestinationCard />
  </Grid>
</Grid>

- xs (extra-small): full width on phones
- md (medium): 2 columns on tablets
- lg (large): 3 columns on desktops

For typography:

<Typography
  sx={{
    fontSize: { xs: '1.5rem', md: '2.5rem', lg: '3rem' }
  }}
>
  Fly the Luxurious Way
</Typography>

Different size at each breakpoint.
No messy media queries.

[Switch between device sizes]

Works on every device. Good enough for me."
```

---

## 📍 CHAPTER 5: Quick Experiment (17:30 - 19:30)

```
[SCREEN: VS Code, live editing]

SCRIPT:
"Let me show you how easy it is to change things.

What if we wanted a different brand color? Let's try teal.

[Open theme file, change primary.main]

primary: {
  main: '#14B8A6',  // Teal
}

[Save, show hot reload]

Look at that. Buttons, indicators, accents — all teal.
One line change.

Let me put it back...

[Revert change]

That's the point of a design system.
You're not hunting through 50 files to change a color.
You change it once.

I'd encourage you to experiment.
Try different colors, different border radius values.
See what happens."
```

---

## 📍 CLOSING & CTA (19:30 - 20:30)

```
[SCREEN: Side by side - code and polished UI, then end card]

SCRIPT:
"That's the design system.
The basics, anyway.

Quick recap:
- Material-UI theming for consistency
- Colors and typography defined once
- Component overrides for global styles
- Breakpoints for responsive design

Next episode, we're getting into the data layer.
That's where the analytics tracking lives, 
and it's the part I find most interesting.

If you've got the project running, 
try changing the theme and see what happens.
Share a screenshot in the comments if you want.

See you in Episode 4."

[END CARD: 10 seconds]
```

---

## 🎬 B-ROLL SHOTS NEEDED FOR EPISODE 3

- [ ] Slow-mo UI transitions (button hovers, card lifts)
- [ ] Color palette showcase
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
- [ ] Water nearby
- [ ] Script visible on second monitor

## Post-Production
- [ ] Edit out mistakes and long pauses
- [ ] Add chapter markers for YouTube
- [ ] Create thumbnail
- [ ] Write description with timestamps
- [ ] Add cards and end screen
- [ ] Schedule upload

---

**Script Version:** 2.0 (Humble, Learner-Teacher Tone)  
**Updated:** January 2026  
**Author:** TLP Airways Team
