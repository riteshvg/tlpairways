# TLAirways - Premium Air Travel Experience

A modern flight booking application built with React, Node.js, and Express, featuring comprehensive Adobe Analytics integration and optimized data layer tracking.

## 🚀 Features

- **Flight Search & Booking**: Search for flights with flexible date and route options
- **Multi-Cabin Support**: Economy, Premium Economy, Business, and First Class
- **Currency Conversion**: Automatic USD/INR conversion for international flights
- **Ancillary Services**: Seat selection, baggage, meals, priority boarding, lounge access
- **Authentication**: Auth0 integration with state persistence across redirects
- **Responsive Design**: Modern Material-UI based interface that works on all devices
- **Advanced Analytics**: Comprehensive Adobe Data Layer integration with optimized event tracking
  - Single pageView event per page load
  - Optimized purchase event tracking
  - Complete booking flow analytics
  - Revenue and product tracking

## 🛠️ Tech Stack

- **Frontend**: React 18, Material-UI v5, React Router v6
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (optional)
- **Authentication**: Auth0
- **Analytics**: Adobe Data Layer (ACDL)
- **Deployment**: Railway (Production), Nixpacks build system

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- npm (v8 or higher)
- Auth0 account (for authentication features)
- Adobe Analytics account (for analytics features)

### Local Development

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd tlpairways
   ```

2. **Install dependencies**
   ```bash
   # Install all dependencies (frontend + backend)
   npm run install-all
   ```

3. **Set up environment variables**
   
   Create `.env` file in the backend directory:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/tlairways
   ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001,http://localhost:3002
   ```

   Create `.env` file in the frontend directory:
   ```env
   REACT_APP_AUTH0_DOMAIN=your-auth0-domain.auth0.com
   REACT_APP_AUTH0_CLIENT_ID=your-auth0-client-id
   REACT_APP_AUTH0_REDIRECT_URI=http://localhost:3002/callback
   REACT_APP_API_URL=http://localhost:5000
   ```

4. **Start development servers**
   ```bash
   # Option 1: Start both frontend and backend
   npm run dev
   
   # Option 2: Start separately
   # Backend (in terminal 1)
   cd backend && npm start
   
   # Frontend (in terminal 2)
   cd frontend && npm start
   ```

5. **Access the application**
   - Frontend: http://localhost:3002
   - Backend API: http://localhost:5000

## 🚂 Deployment to Railway

### Railway Configuration

The application is configured to deploy on Railway using Nixpacks build system.

#### Configuration Files

1. **nixpacks.toml** - Build and deployment configuration
   ```toml
   [phases.setup]
   nixPkgs = ["nodejs-18_x"]
   
   [phases.build]
   cmds = ["npm install", "cd frontend && npm install", "cd backend && npm install"]
   
   [start]
   cmd = "npm start"
   ```

2. **railway.json** - Railway-specific settings
   ```json
   {
     "$schema": "https://railway.app/railway.schema.json",
     "build": {
       "builder": "NIXPACKS",
       "buildCommand": "npm install && cd frontend && npm install && npm run build && cd ../backend && npm install"
     },
     "deploy": {
       "startCommand": "npm start",
       "restartPolicyType": "ON_FAILURE",
       "restartPolicyMaxRetries": 10
     }
   }
   ```

3. **railway-build.sh** - Build script
   ```bash
   #!/bin/bash
   echo "🚂 Starting Railway Build Process..."
   
   # Install root dependencies
   npm install
   
   # Build frontend
   cd frontend
   npm install
   npm run build
   
   # Install backend dependencies
   cd ../backend
   npm install
   
   echo "✅ Build Complete!"
   ```

### Deployment Steps

1. **Connect to Railway**
   - Go to [railway.app](https://railway.app)
   - Sign up/Login with GitHub
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your repository

2. **Configure Environment Variables**
   
   In Railway dashboard, add these variables:
   ```env
   NODE_ENV=production
   PORT=3000
   MONGODB_URI=your-mongodb-atlas-uri
   ALLOWED_ORIGINS=https://your-app.up.railway.app
   
   # Auth0 Configuration
   REACT_APP_AUTH0_DOMAIN=your-auth0-domain.auth0.com
   REACT_APP_AUTH0_CLIENT_ID=your-auth0-client-id
   REACT_APP_AUTH0_REDIRECT_URI=https://your-app.up.railway.app/callback
   
   # API Configuration
   REACT_APP_API_URL=https://your-app.up.railway.app
   ```

3. **Deploy**
   - Railway will automatically detect the configuration
   - Build and deployment will start automatically
   - Check logs for build progress

4. **Verify Deployment**
   - Health check: `https://your-app.up.railway.app/api/health`
   - Expected response: `{"status":"OK","timestamp":"...","environment":"production"}`

### Deployment Scripts

- `npm run railway-build` - Build the application for Railway
- `npm start` - Start the production server
- `node deploy-check.js` - Verify deployment configuration

## 📊 Adobe Data Layer Integration

### Overview

The application features a comprehensive Adobe Data Layer implementation with optimized event tracking to prevent duplicates and ensure accurate analytics.

### Key Features

1. **Optimized Event Tracking**
   - Single pageView event per page load
   - Single purchase event on confirmation page
   - Duplicate prevention using React refs and flags

2. **Complete Booking Flow Tracking**
   - Search context (origin, destination, dates, passengers)
   - Flight selection
   - Traveller details
   - Ancillary services selection (passenger-wise)
   - Payment details
   - Booking confirmation with revenue tracking

3. **Data Layer Structure**
   ```javascript
   window.adobeDataLayer = [
     {
       event: 'pageView',
       pageData: { /* page details */ },
       bookingContext: { /* booking state */ },
       userContext: { /* user details */ }
     },
     {
       event: 'purchase',
       eventData: {
         revenue: { /* transaction details */ },
         paymentDetails: { /* payment info */ },
         customer: { /* customer data */ },
         booking: { /* booking details */ }
       }
     }
   ];
   ```

### Key Components

- **AirlinesDataLayer.js** - Core data layer service
- **usePageView.js** - Global page view tracking hook with duplicate prevention
- **useHomepageDataLayer.js** - Homepage-specific tracking
- **useAncillaryServicesDataLayer.js** - Ancillary services tracking
- **useTravellerDetailsDataLayer.js** - Traveller details tracking

### Data Layer Events

| Event | Description | Page |
|-------|-------------|------|
| `pageView` | Page load tracking | All pages |
| `searchSubmit` | Flight search submission | Home, Search |
| `flightSelect` | Flight selection | Search Results |
| `proceedToAncillaryServices` | Navigate to ancillary | Traveller Details |
| `proceedToPayment` | Navigate to payment | Ancillary Services |
| `purchase` | Booking confirmation | Confirmation |

### Analytics Best Practices

1. **Single Event Per Action**
   - Each user action triggers exactly one event
   - Duplicate prevention using useRef flags
   - Global tracking to prevent cross-component duplicates

2. **Passenger-Wise Tracking**
   - Ancillary services tracked per passenger
   - Revenue calculated per passenger
   - Complete passenger breakdown in booking context

3. **Revenue Tracking**
   - Base fare (per passenger)
   - Ancillary services (seats, meals, baggage, etc.)
   - Taxes and fees
   - Total transaction value

## 📁 Project Structure

```
tlpairways/
├── frontend/                    # React frontend application
│   ├── public/                 # Static files
│   ├── src/
│   │   ├── components/         # React components
│   │   │   ├── auth/          # Auth0 components
│   │   │   ├── protected/     # Protected route wrappers
│   │   │   ├── FlightSearch.js
│   │   │   ├── SearchResults.js
│   │   │   ├── TravellerDetails.js
│   │   │   ├── AncillaryServices.js
│   │   │   ├── Payment.js
│   │   │   └── BookingConfirmation.js
│   │   ├── hooks/             # Custom React hooks
│   │   │   ├── usePageView.js
│   │   │   ├── useHomepageDataLayer.js
│   │   │   ├── useAncillaryServicesDataLayer.js
│   │   │   └── useTravellerDetailsDataLayer.js
│   │   ├── services/          # API and analytics services
│   │   │   ├── AirlinesDataLayer.js
│   │   │   ├── PageViewTracker.js
│   │   │   └── api.js
│   │   ├── context/           # React context providers
│   │   │   └── AuthContext.js
│   │   ├── config/            # Configuration files
│   │   └── tests/             # Test files
│   └── package.json
├── backend/                    # Node.js backend API
│   ├── src/
│   │   ├── routes/            # API routes
│   │   │   ├── flights.js
│   │   │   ├── airports.js
│   │   │   └── userLocation.js
│   │   ├── models/            # Database models
│   │   ├── config/            # Configuration
│   │   ├── middleware/        # Express middleware
│   │   └── scripts/           # Utility scripts
│   └── package.json
├── documentation/              # Project documentation
│   ├── ADOBE_API_USAGE.md
│   ├── ADOBE_DATALAYER_STRUCTURE.md
│   ├── AUTH0_ENVIRONMENT_SETUP.md
│   ├── RAILWAY_DEPLOYMENT_GUIDE.md
│   └── REAL_BOOKING_DATA_IMPLEMENTATION.md
├── package.json               # Root package.json
├── nixpacks.toml              # Railway/Nixpacks configuration
├── railway.json               # Railway deployment settings
├── railway-build.sh           # Railway build script
├── deploy-check.js            # Deployment verification script
└── README.md
```

## 🔍 API Endpoints

### Health & Status
- `GET /api/health` - Health check endpoint
- Returns: `{"status":"OK","timestamp":"...","environment":"..."}`

### Airports
- `GET /api/airports` - Get all airports
- `GET /api/airports/:code` - Get airport by IATA code

### Flights
- `GET /api/flights` - Search flights
  - Query params: `origin`, `destination`, `departureDate`, `returnDate`, `passengers`, `cabinClass`

### User Location
- `GET /api/user-location` - Get user's location based on IP
  - Returns: Country, city, coordinates

## 🧪 Testing

```bash
# Run all tests
npm test

# Test frontend
cd frontend
npm test

# Test backend
cd backend
npm test

# Run specific test file
npm test -- SearchResults.test.js
```

### Test Coverage
- Component tests using React Testing Library
- Hook tests for custom hooks
- Data layer integration tests
- Auth flow tests

## 🔒 Security

- **Helmet.js** - Security headers
- **CORS** - Configured for specific origins
- **Auth0** - OAuth 2.0 authentication
- **Input Validation** - Server-side validation
- **Content Security Policy** - CSP headers for Auth0 and Adobe
- **Rate Limiting** - Recommended for production

### CSP Configuration
```javascript
contentSecurityPolicy: {
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "'unsafe-inline'", "*.auth0.com", "*.adobedtm.com"],
    connectSrc: ["'self'", "*.auth0.com", "*.adobe.io"],
    imgSrc: ["'self'", "data:", "*.auth0.com"],
    frameSrc: ["*.auth0.com"]
  }
}
```

## 🚀 Performance Optimizations

- **Gzip Compression** - Reduced bundle size
- **Code Splitting** - React lazy loading
- **Memoization** - useMemo and useCallback for performance
- **Optimized Images** - Compressed and lazy-loaded
- **Production Build** - Minified and optimized
- **Bundle Size**: 312.39 KB (gzipped)

### Data Layer Optimizations
- Single pageView event per page (eliminated duplicates)
- Ref-based duplicate prevention
- Optimized useEffect dependencies
- Memoized page configurations

## 📊 Monitoring & Analytics

### Application Monitoring
- **Health Checks**: Automatic via Railway
- **Logs**: Available in Railway dashboard
- **Error Tracking**: Console logs and error boundaries

### Analytics Tracking
- **Adobe Data Layer**: Complete booking flow
- **Custom Events**: User interactions
- **Revenue Tracking**: Transaction-level data
- **User Journey**: End-to-end tracking

## 🔧 Configuration Management

### Branch Strategy
- `main` - Production branch (auto-deploys to Railway)
- `enhancements` - Development branch for new features

### Deployment Workflow
1. Develop on `enhancements` branch
2. Test locally
3. Merge to `main` via pull request
4. Automatic deployment to Railway
5. Verify production deployment

## 📞 Support & Troubleshooting

### Common Issues

1. **Build Fails on Railway**
   - Check build logs in Railway dashboard
   - Verify all dependencies in package.json
   - Ensure environment variables are set

2. **Auth0 Not Working**
   - Verify Auth0 configuration in dashboard
   - Check callback URLs match deployment URL
   - Ensure CSP headers allow Auth0 domains

3. **Data Layer Events Not Firing**
   - Check browser console for errors
   - Verify Adobe Data Layer is initialized
   - Check duplicate prevention flags

4. **Application Not Loading**
   - Check health endpoint: `/api/health`
   - Verify environment variables
   - Check Railway logs for errors

### Support Resources
- Railway Dashboard: https://railway.app/dashboard
- Documentation: `/documentation` folder
- Health Check: `https://your-app.up.railway.app/api/health`

## 📝 Environment Variables Reference

### Required Variables
```env
# Server
NODE_ENV=production
PORT=3000

# Database
MONGODB_URI=mongodb+srv://...

# CORS
ALLOWED_ORIGINS=https://your-app.up.railway.app

# Auth0
REACT_APP_AUTH0_DOMAIN=your-domain.auth0.com
REACT_APP_AUTH0_CLIENT_ID=your-client-id
REACT_APP_AUTH0_REDIRECT_URI=https://your-app.up.railway.app/callback

# API
REACT_APP_API_URL=https://your-app.up.railway.app
```

## 📄 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- Material-UI for the component library
- Auth0 for authentication services
- Adobe for analytics platform
- Railway for hosting and deployment

---

**Happy Flying with TLAirways! ✈️**

*Last Updated: January 2025*
