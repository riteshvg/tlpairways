# Real-Time Data Pipeline: AEP to Flight Operations Dataset

## Current State

### Data Flow (As-Is)
```
Confirmation Page (Frontend)
    ↓
Adobe Web SDK (Batch)
    ↓
Adobe Experience Platform (AEP)
    ↓
??? (Need Pipeline)
    ↓
Flight Operations Dataset (Backend)
```

### Data Captured
- Flight Number
- Booking Reference (PNR)
- Passenger Details
- Flight Route (Origin/Destination)
- Booking Timestamp
- Payment Information
- Ancillary Services

## Architecture Options

### Option 1: AEP → AWS S3 → Backend (Recommended for Batch)

**Architecture:**
```
AEP Dataset
    ↓
AEP Data Export (Scheduled)
    ↓
AWS S3 Bucket
    ↓
S3 Event Notification
    ↓
AWS Lambda / Backend API
    ↓
Flight Operations Database
```

**Pros:**
✅ Cost-effective for batch processing
✅ Scalable storage with S3
✅ Easy to implement with AEP's native export
✅ Can process large volumes
✅ Built-in retry and error handling
✅ Historical data available in S3

**Cons:**
❌ Not real-time (15-60 min delay)
❌ Requires AWS infrastructure
❌ Additional S3 storage costs

**Implementation:**

1. **AEP Configuration:**
```javascript
// AEP Destination Configuration
{
  "destination": "AWS S3",
  "schedule": "*/15 * * * *", // Every 15 minutes
  "format": "parquet", // or JSON
  "compression": "gzip",
  "path": "s3://tlpairways-aep-exports/bookings/"
}
```

2. **S3 Event Trigger:**
```javascript
// Lambda function triggered on S3 upload
exports.handler = async (event) => {
  const bucket = event.Records[0].s3.bucket.name;
  const key = event.Records[0].s3.object.key;
  
  // Download file from S3
  const data = await s3.getObject({ Bucket: bucket, Key: key }).promise();
  
  // Parse and transform
  const bookings = parseParquet(data.Body);
  
  // Send to Flight Operations API
  await axios.post('https://api.tlpairways.com/flight-ops/ingest', {
    bookings: bookings.map(transformBooking)
  });
};
```

3. **Backend Ingestion Endpoint:**
```javascript
// /backend/src/routes/flight-ops.js
router.post('/ingest', async (req, res) => {
  const { bookings } = req.body;
  
  for (const booking of bookings) {
    await FlightOps.upsert({
      flightNumber: booking.flightNumber,
      pnr: booking.pnr,
      passengerCount: booking.passengers.length,
      bookingDate: booking.timestamp,
      revenue: booking.totalAmount,
      // ... other fields
    });
  }
  
  res.json({ success: true, processed: bookings.length });
});
```

---

### Option 2: AEP → HTTP Streaming → Backend (Real-Time)

**Architecture:**
```
AEP Real-Time Customer Profile
    ↓
AEP Streaming Destination
    ↓
Backend Webhook Endpoint
    ↓
Flight Operations Database
```

**Pros:**
✅ True real-time (< 1 second)
✅ No intermediate storage needed
✅ Lower latency
✅ Immediate operational insights

**Cons:**
❌ Higher cost (streaming API calls)
❌ Requires robust webhook handling
❌ Need to handle backpressure
❌ No built-in replay capability

**Implementation:**

1. **AEP Streaming Destination:**
```javascript
// AEP HTTP API Destination Configuration
{
  "type": "HTTP_API",
  "endpoint": "https://api.tlpairways.com/webhooks/aep-booking",
  "method": "POST",
  "headers": {
    "Authorization": "Bearer ${API_KEY}",
    "Content-Type": "application/json"
  },
  "batchSize": 100,
  "flushInterval": "5s"
}
```

2. **Backend Webhook Handler:**
```javascript
// /backend/src/routes/webhooks.js
router.post('/aep-booking', 
  validateAEPSignature, // Verify request is from AEP
  async (req, res) => {
    const events = req.body.events;
    
    // Acknowledge immediately
    res.status(200).json({ received: events.length });
    
    // Process asynchronously
    processBookingEvents(events).catch(err => {
      logger.error('Failed to process AEP events', err);
      // Send to dead letter queue
      dlq.push(events);
    });
  }
);

async function processBookingEvents(events) {
  for (const event of events) {
    if (event.eventType === 'commerce.purchases') {
      await updateFlightOperations(event.data);
    }
  }
}
```

---

### Option 3: AEP → Azure Event Hub → Backend (Enterprise)

**Architecture:**
```
AEP Dataset
    ↓
AEP Event Hub Destination
    ↓
Azure Event Hub
    ↓
Event Hub Consumer (Backend)
    ↓
Flight Operations Database
```

**Pros:**
✅ Enterprise-grade reliability
✅ Built-in partitioning and scaling
✅ Message replay capability
✅ Multiple consumers possible
✅ Dead letter queue support

**Cons:**
❌ Azure infrastructure required
❌ Higher complexity
❌ Additional costs

**Implementation:**

1. **AEP Event Hub Configuration:**
```javascript
{
  "destination": "Azure Event Hub",
  "namespace": "tlpairways-events",
  "eventHub": "bookings",
  "sasPolicy": "SendPolicy",
  "sasKey": "${SAS_KEY}"
}
```

2. **Backend Consumer:**
```javascript
// /backend/src/services/event-hub-consumer.js
const { EventHubConsumerClient } = require("@azure/event-hubs");

const consumer = new EventHubConsumerClient(
  "$Default",
  connectionString,
  "bookings"
);

consumer.subscribe({
  processEvents: async (events, context) => {
    for (const event of events) {
      await processBookingEvent(event.body);
    }
    await context.updateCheckpoint(events[events.length - 1]);
  },
  processError: async (err, context) => {
    logger.error('Event Hub error', err);
  }
});
```

---

### Option 4: AEP Query Service → Scheduled ETL (Batch)

**Architecture:**
```
AEP Dataset
    ↓
AEP Query Service (SQL)
    ↓
Scheduled Job (Cron/Airflow)
    ↓
Flight Operations Database
```

**Pros:**
✅ Full SQL query capabilities
✅ Can join multiple datasets
✅ Flexible transformations
✅ No external storage needed

**Cons:**
❌ Not real-time (scheduled)
❌ Query costs
❌ Requires AEP Query Service access

**Implementation:**

1. **AEP Query:**
```sql
-- Query to get bookings from last hour
SELECT 
  flightNumber,
  pnr,
  COUNT(DISTINCT passengerId) as passengerCount,
  SUM(totalAmount) as revenue,
  departureDate,
  origin,
  destination
FROM bookings_dataset
WHERE timestamp >= CURRENT_TIMESTAMP - INTERVAL '1' HOUR
GROUP BY flightNumber, pnr, departureDate, origin, destination
```

2. **ETL Job:**
```javascript
// /backend/src/jobs/aep-sync.js
const { AEPQueryService } = require('@adobe/aep-query-service');

async function syncBookings() {
  const query = `
    SELECT * FROM bookings_dataset 
    WHERE timestamp >= CURRENT_TIMESTAMP - INTERVAL '1' HOUR
  `;
  
  const results = await aepQuery.execute(query);
  
  for (const row of results) {
    await FlightOps.upsert({
      flightNumber: row.flightNumber,
      pnr: row.pnr,
      // ... transform data
    });
  }
}

// Run every hour
cron.schedule('0 * * * *', syncBookings);
```

---

## Recommended Solution

### Hybrid Approach: Real-Time + Batch

**Architecture:**
```
Confirmation Page
    ↓
Adobe Web SDK
    ↓
AEP (Real-Time Profile + Dataset)
    ↓
    ├─→ HTTP Streaming → Backend (Real-Time)
    │       ↓
    │   Flight Operations DB (Live)
    │
    └─→ S3 Export (Hourly) → Lambda
            ↓
        Flight Operations DB (Reconciliation)
```

**Why Hybrid?**

1. **Real-Time Stream** for immediate operational needs:
   - Live flight capacity monitoring
   - Real-time revenue tracking
   - Immediate customer service updates

2. **Batch Reconciliation** for data integrity:
   - Catch any missed streaming events
   - Historical analysis
   - Data quality checks
   - Backup and disaster recovery

### Implementation Plan

#### Phase 1: Real-Time Streaming (Week 1-2)

```javascript
// 1. Configure AEP HTTP Destination
{
  "endpoint": "https://api.tlpairways.com/webhooks/aep-booking",
  "events": ["commerce.purchases"],
  "batchSize": 50,
  "flushInterval": "10s"
}

// 2. Backend Webhook
router.post('/webhooks/aep-booking', async (req, res) => {
  // Immediate acknowledgment
  res.status(200).json({ received: true });
  
  // Async processing
  queue.add('process-booking', req.body);
});

// 3. Queue Worker
queue.process('process-booking', async (job) => {
  const { events } = job.data;
  
  for (const event of events) {
    await updateFlightOps(event);
    await updateAnalytics(event);
  }
});
```

#### Phase 2: Batch Reconciliation (Week 3-4)

```javascript
// 1. AEP → S3 Export (Hourly)
// Configure in AEP UI

// 2. S3 Lambda Trigger
exports.handler = async (event) => {
  const data = await downloadFromS3(event);
  const bookings = parseData(data);
  
  // Reconcile with existing data
  for (const booking of bookings) {
    const existing = await FlightOps.findOne({ pnr: booking.pnr });
    
    if (!existing) {
      // Missed by streaming - insert
      await FlightOps.create(booking);
      logger.warn('Missed booking recovered', { pnr: booking.pnr });
    } else if (hasDiscrepancy(existing, booking)) {
      // Data mismatch - update
      await FlightOps.update(booking);
      logger.warn('Data discrepancy fixed', { pnr: booking.pnr });
    }
  }
};
```

---

## Data Schema Mapping

### AEP Event → Flight Operations

```javascript
// AEP Commerce Purchase Event
{
  "eventType": "commerce.purchases",
  "timestamp": "2025-12-11T20:30:00Z",
  "commerce": {
    "purchases": {
      "value": 1
    },
    "order": {
      "purchaseID": "PNR123456",
      "priceTotal": 45000,
      "currencyCode": "INR"
    }
  },
  "productListItems": [
    {
      "SKU": "FLIGHT-DEL-BOM-TL123",
      "name": "Delhi to Mumbai",
      "quantity": 2,
      "priceTotal": 30000,
      "_tlpairways": {
        "flightNumber": "TL123",
        "origin": "DEL",
        "destination": "BOM",
        "departureDate": "2025-12-15",
        "cabinClass": "economy"
      }
    }
  ],
  "_tlpairways": {
    "booking": {
      "pnr": "PNR123456",
      "passengerCount": 2,
      "contactEmail": "user@example.com"
    }
  }
}

// Transform to Flight Operations Schema
{
  "flightNumber": "TL123",
  "pnr": "PNR123456",
  "route": "DEL-BOM",
  "origin": "DEL",
  "destination": "BOM",
  "departureDate": "2025-12-15",
  "passengerCount": 2,
  "cabinClass": "economy",
  "revenue": 30000,
  "currency": "INR",
  "bookingTimestamp": "2025-12-11T20:30:00Z",
  "contactEmail": "user@example.com",
  "source": "aep-streaming",
  "processed": true
}
```

---

## Monitoring & Alerting

### Key Metrics

```javascript
// Datadog/CloudWatch Metrics
{
  "aep.events.received": counter,
  "aep.events.processed": counter,
  "aep.events.failed": counter,
  "aep.processing.latency": histogram,
  "flightops.records.created": counter,
  "flightops.records.updated": counter,
  "reconciliation.discrepancies": counter
}

// Alerts
{
  "high_failure_rate": "aep.events.failed > 5% of received",
  "high_latency": "aep.processing.latency.p95 > 5s",
  "missing_data": "reconciliation.discrepancies > 10/hour"
}
```

---

## Cost Comparison

### Option 1: S3 Batch
- **AEP Export**: $0 (included)
- **S3 Storage**: ~$23/month (1TB)
- **Lambda**: ~$5/month (1M invocations)
- **Total**: ~$28/month

### Option 2: HTTP Streaming
- **AEP Streaming**: ~$500/month (1M events)
- **API Gateway**: ~$35/month
- **Total**: ~$535/month

### Option 3: Hybrid (Recommended)
- **Streaming**: ~$500/month
- **S3 Backup**: ~$28/month
- **Total**: ~$528/month

---

## Decision Matrix

| Criteria | S3 Batch | HTTP Stream | Event Hub | Hybrid |
|----------|----------|-------------|-----------|--------|
| **Latency** | 15-60 min | < 1 sec | < 5 sec | < 1 sec |
| **Cost** | $ | $$$ | $$$$ | $$$ |
| **Reliability** | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Complexity** | Low | Medium | High | Medium |
| **Scalability** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Data Integrity** | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |

---

## Recommendation

**Go with the Hybrid Approach** for the following reasons:

1. ✅ **Real-time operational insights** for flight management
2. ✅ **Data integrity** through batch reconciliation
3. ✅ **Cost-effective** compared to pure streaming
4. ✅ **Scalable** to handle growth
5. ✅ **Resilient** with multiple data paths

### Next Steps

1. **Week 1**: Set up AEP HTTP streaming destination
2. **Week 2**: Implement backend webhook and queue processing
3. **Week 3**: Configure S3 export and Lambda reconciliation
4. **Week 4**: Testing, monitoring, and optimization

Would you like me to create detailed implementation code for any specific component?
