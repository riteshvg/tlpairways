# AEP Web SDK Testing Strategy

## 🎯 Goal
Create a comprehensive testing suite that fires genuine AEP Web SDK `interact` calls with all required attributes, ensuring data quality and compliance.

## 📋 Testing Requirements

### Must-Have Attributes for All Events
1. **Event Metadata**
   - `eventType` (web.webpagedetails.pageViews, commerce.productViews, etc.)
   - `timestamp` (ISO 8601 format)
   - `_id` (unique event ID)

2. **Web Context**
   - `web.webPageDetails.URL`
   - `web.webPageDetails.name`
   - `web.webReferrer.URL`

3. **Device Context**
   - `device.screenHeight`
   - `device.screenWidth`
   - `device.type`

4. **Environment**
   - `environment.browserDetails.userAgent`
   - `environment.browserDetails.viewportWidth`
   - `environment.browserDetails.viewportHeight`

5. **Commerce Events (if applicable)**
   - `commerce.purchases.value`
   - `commerce.order.purchaseID`
   - `productListItems[]` array with required fields

## 🏗️ Testing Architecture

### 1. Test Framework: Cypress (Recommended)
**Why Cypress?**
- Real browser environment
- Network request interception
- XHR/Fetch monitoring
- Screenshot/video recording
- Time-travel debugging
- Easy CI/CD integration

**Alternative**: Playwright for cross-browser testing

### 2. Test Layers

#### Layer 1: Unit Tests (Jest + React Testing Library)
- Component-level data layer pushes
- Helper function validation
- Data transformation logic

#### Layer 2: Integration Tests (Cypress Component Testing)
- Multi-component interactions
- Data layer state management
- Event sequencing

#### Layer 3: E2E Tests (Cypress E2E)
- Full user journeys
- Real AEP SDK calls
- Network validation
- XDM schema compliance

## 📝 Test Plan Structure

### Phase 1: Foundation Setup
1. Install testing dependencies
2. Configure test environment
3. Create AEP SDK mock/spy utilities
4. Set up network interception
5. Create XDM validation helpers

### Phase 2: Core Event Tests
1. **Page View Events**
   - Homepage
   - Search Results
   - Flight Details
   - Booking Flow pages

2. **User Interaction Events**
   - Clicks
   - Form submissions
   - Navigation

3. **Authentication Events**
   - Login
   - Logout
   - Profile updates

### Phase 3: E-Commerce Journey Tests
1. **Search Flow**
   - Search initiated
   - Results displayed
   - Filters applied

2. **Booking Flow**
   - Flight selection
   - Traveller details
   - Ancillary services
   - Payment
   - Confirmation

3. **Purchase Event**
   - All product list items
   - Revenue data
   - Transaction details

### Phase 4: Data Validation
1. XDM schema compliance
2. Required fields presence
3. Data type validation
4. Value range checks
5. PII handling compliance

## 🛠️ Implementation Plan

### Step 1: Install Dependencies
```bash
npm install --save-dev cypress @cypress/react cypress-real-events
npm install --save-dev @testing-library/cypress
npm install --save-dev cypress-network-idle
```

### Step 2: Directory Structure
```
/cypress
  /e2e
    /booking-flow
      - search.cy.js
      - flight-selection.cy.js
      - traveller-details.cy.js
      - ancillary-services.cy.js
      - payment.cy.js
      - confirmation.cy.js
    /data-layer
      - page-views.cy.js
      - user-interactions.cy.js
      - commerce-events.cy.js
  /fixtures
    - flight-data.json
    - user-profiles.json
    - expected-schemas.json
  /support
    - commands.js
    - aep-helpers.js
    - xdm-validators.js
  /plugins
    - index.js
```

### Step 3: Custom Cypress Commands
Create helpers for AEP Web SDK testing:
- `cy.waitForAdobeEvent()`
- `cy.validateXDMSchema()`
- `cy.checkRequiredFields()`
- `cy.captureAdobeNetworkCalls()`

### Step 4: Network Interception Strategy
- Intercept Adobe Edge Network calls
- Validate request payload
- Check response status
- Store events for analysis

### Step 5: Validation Utilities
- XDM schema validator
- Required fields checker
- Data type validator
- PII scrubber checker

## 📊 Test Scenarios by Priority

### High Priority (P0)
1. ✅ Homepage page view
2. ✅ Search initiated with all parameters
3. ✅ Flight selection
4. ✅ Purchase completion with all product list items
5. ✅ User authentication events

### Medium Priority (P1)
1. Navigation between pages
2. Filter applications
3. Ancillary service selections
4. Form field interactions
5. Error scenarios

### Low Priority (P2)
1. Scroll depth tracking
2. Video interactions
3. Social sharing
4. Print/download actions

## 🎯 Success Criteria

### For Each Test
- [ ] Real AEP Web SDK interact call fired
- [ ] All required XDM fields present
- [ ] Correct eventType
- [ ] Valid data types
- [ ] No PII in prohibited fields
- [ ] Proper sequencing
- [ ] Network call succeeds (200 OK)

### Overall Suite
- [ ] 90%+ event coverage
- [ ] All critical user journeys tested
- [ ] All commerce events validated
- [ ] CI/CD integration
- [ ] Automated on PR
- [ ] Clear failure reporting

## 🔍 Monitoring & Reporting

### Test Execution Reports
- Events captured count
- Required fields compliance %
- Schema validation pass/fail
- Network call success rate
- Performance metrics

### Debugging Tools
- Event payload inspector
- XDM schema diff viewer
- Timeline visualization
- Failed assertion details

## 📈 Metrics to Track

1. **Event Quality Score**
   - Required fields present: X/Y (target: 100%)
   - Optional fields present: X/Y
   - Schema valid: Yes/No

2. **Coverage Metrics**
   - Events tested: X/Total
   - User journeys: X/Total
   - Edge cases: X/Total

3. **Performance**
   - Test execution time
   - Event firing latency
   - Network call duration

## 🚀 Next Steps

1. **Week 1**: Setup infrastructure
   - Install Cypress
   - Create helpers
   - Write first test

2. **Week 2**: Core events
   - Page views
   - User interactions
   - Authentication

3. **Week 3**: E-commerce
   - Search flow
   - Booking flow
   - Purchase event

4. **Week 4**: Validation & CI/CD
   - XDM validators
   - CI/CD pipeline
   - Documentation

## 🔐 Compliance Considerations

### PII Handling
- No email addresses in clear text
- No phone numbers
- Hash user IDs
- Mask payment details

### GDPR/Privacy
- Respect consent flags
- Test opt-out scenarios
- Validate data minimization

### Data Governance
- Tag PII fields correctly
- Apply data usage labels
- Test data retention policies

## 💡 Best Practices

1. **Test Isolation**
   - Each test independent
   - Clean slate for data layer
   - No shared state

2. **Real vs Mock**
   - Use real SDK in E2E
   - Mock external APIs
   - Stub time-dependent data

3. **Assertions**
   - Specific, not generic
   - Check exact values where possible
   - Validate data structure

4. **Maintenance**
   - Keep schemas updated
   - Version test fixtures
   - Document breaking changes

## 📚 References

- [Adobe Experience Platform Web SDK](https://experienceleague.adobe.com/docs/experience-platform/edge/home.html)
- [XDM Schema Registry](https://experienceleague.adobe.com/docs/experience-platform/xdm/home.html)
- [Cypress Best Practices](https://docs.cypress.io/guides/references/best-practices)
- [AEP Assurance for Debugging](https://experienceleague.adobe.com/docs/experience-platform/assurance/home.html)

