# About Us Page - TLP Airways

## Overview
Created a comprehensive "About Us" page that highlights the demo nature of the application, showcases the complete booking flow, emphasizes the Adobe Data Layer implementation, and provides contact information for collaboration.

## Page URL
`/about`

## Key Sections

### 1. Hero Section
- **Design**: Purple gradient background with white text
- **Content**: 
  - TLP Airways branding with flight icon
  - Tagline: "A Demo Flight Booking Application"
  - Subtitle explaining the purpose

### 2. Demo Notice Banner
- **Design**: Warning-style banner with orange accent
- **Purpose**: Clearly states this is a demonstration application
- **Message**: Emphasizes no real bookings, payments, or travel services

### 3. About the Application
Two-column grid showcasing:
- **Purpose Card**: 
  - E-commerce UX design
  - Multi-step booking flow
  - Analytics integration
  - Modern web architecture
  
- **Technology Stack Card**:
  - Next.js 16 (React)
  - Material-UI (MUI)
  - Adobe Client Data Layer
  - Adobe Launch
  - Auth0 Authentication
  - TypeScript

### 4. Complete Booking Flow
5-step booking process with detailed cards:

1. **Search Flights**
   - Browse flights with dynamic pricing
   - Data Layer: `searchInitiated, pageView events`

2. **Select Flights**
   - Choose onward/return flights
   - Data Layer: `flightSelection, productView events`

3. **Traveller Details**
   - Enter passenger info and ancillaries
   - Data Layer: `checkoutInitiated, formInteraction events`

4. **Payment**
   - Complete booking with payment options
   - Data Layer: `paymentInfo, checkoutProgress events`

5. **Confirmation**
   - Receive booking confirmation
   - Data Layer: `purchase event with pageData, viewData, revenue, customer data`

### 5. Data Layer Implementation
Comprehensive section highlighting:

**9 Key Features:**
1. Adobe Client Data Layer (ACDL) implementation
2. Comprehensive page view tracking with context
3. E-commerce tracking (product views, add to cart, purchase)
4. User authentication and session tracking
5. Search context and booking flow tracking
6. Revenue and conversion tracking
7. Custom events for user interactions
8. Consent management integration
9. Server-side and client-side data layer support

**Code Example:**
- Shows purchase event structure with:
  - pageData (complete page context)
  - viewData (session & user info)
  - revenue (transaction details)
  - customer (customer information)
  - products (product array)
  - searchContext (search criteria)
  - bookingContext (booking details)

### 6. Use Cases
Three cards explaining ideal use cases:
- **Learning & Training**: Understanding e-commerce flows and analytics
- **Portfolio Showcase**: Demonstrating development capabilities
- **Testing & POC**: Reference implementation for analytics tools

### 7. Contact Section
- **Design**: Purple gradient background matching hero
- **Email Icon**: Large, prominent
- **Heading**: "Let's Collaborate"
- **Description**: Invitation for analytics discussions and collaboration
- **CTA Button**: Large white button with email address
- **Email**: `ritesh@thelearningproject.in`
- **Footer**: "Built with ❤️ for the analytics and development community"

## Design Features

### Color Scheme
- **Primary Gradient**: Purple (#667eea to #764ba2)
- **Success Green**: For data layer section (#e8f5e9 background)
- **Warning Orange**: For demo notice (#fff3e0 background)
- **White Cards**: Clean, modern card design

### Typography
- **Headings**: Bold, clear hierarchy
- **Body Text**: Readable, well-spaced
- **Code Blocks**: Monospace with dark theme

### Icons
- Material-UI icons throughout
- Each section has relevant icons
- Step numbers in booking flow

### Responsive Design
- Grid layouts adapt to mobile/tablet/desktop
- Cards stack on smaller screens
- Consistent spacing and padding

## SEO Optimization
- **Title**: "About TLP Airways - Demo Flight Booking Application"
- **Meta Description**: Comprehensive description of the app and its features
- **Semantic HTML**: Proper heading hierarchy

## Accessibility
- Clear visual hierarchy
- High contrast text
- Descriptive labels
- Keyboard navigable

## Navigation
- Already linked in navbar under "About Us"
- Accessible from all pages
- Part of main navigation menu

## Files Created
- `/frontend-next/pages/about.tsx` - Main About page component

## Deployment
- ✅ Committed to main branch
- ✅ Pushed to origin/main
- 🚂 Railway will auto-deploy

## Testing Checklist
- [ ] Visit `/about` page
- [ ] Check responsive design on mobile
- [ ] Verify all sections render correctly
- [ ] Test email link functionality
- [ ] Confirm navigation from navbar works
- [ ] Validate SEO meta tags

## Future Enhancements
- Add screenshots of the booking flow
- Include analytics dashboard examples
- Add testimonials or case studies
- Link to GitHub repository
- Add FAQ section
