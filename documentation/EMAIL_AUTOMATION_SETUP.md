# Email Automation Setup Guide

## Overview
This guide explains how to set up automated email notifications for the TLP Airways booking system.

---

## 📧 Email Service Options

### **Recommended Services:**

1. **SendGrid** (Recommended for Production)
   - ✅ Free tier: 100 emails/day
   - ✅ Easy integration
   - ✅ Email templates
   - ✅ Analytics & tracking
   - 💰 Paid: $19.95/mo for 40k emails

2. **AWS SES (Simple Email Service)**
   - ✅ Very cheap: $0.10 per 1,000 emails
   - ✅ Highly scalable
   - ✅ Requires AWS account
   - ⚠️ Email verification needed initially

3. **Mailgun**
   - ✅ Free tier: 5,000 emails/month
   - ✅ Good API documentation
   - ✅ Pay-as-you-go pricing

4. **Nodemailer + Gmail** (For Development/Testing)
   - ✅ Free for testing
   - ✅ Simple setup
   - ⚠️ Not recommended for production
   - ⚠️ Limited to 500 emails/day

---

## 🚀 Quick Start (Development Setup)

### Step 1: Install Dependencies

```bash
cd backend
npm install nodemailer dotenv
```

### Step 2: Configure Environment Variables

Create/update `.env` file:

```env
# Email Configuration
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-specific-password
EMAIL_FROM=TLP Airways <noreply@tlpairways.com>

# For SendGrid (Production)
# SENDGRID_API_KEY=your-sendgrid-api-key

# For AWS SES (Production)
# AWS_REGION=us-east-1
# AWS_ACCESS_KEY_ID=your-access-key
# AWS_SECRET_ACCESS_KEY=your-secret-key
```

### Step 3: Gmail App Password Setup (For Development)

1. Go to Google Account Settings
2. Enable 2-Factor Authentication
3. Generate App Password:
   - Go to Security → App passwords
   - Select "Mail" and "Other (Custom name)"
   - Copy the 16-character password
   - Use this in `EMAIL_PASSWORD`

---

## 📝 Email Templates

### **Booking Confirmation Email**

**Triggers:** When payment is successful

**Content Includes:**
- ✅ Booking Reference (PNR)
- ✅ Flight details (departure/arrival)
- ✅ Passenger information
- ✅ Payment summary
- ✅ Add-on services (if any)
- ✅ QR code for check-in
- ✅ Important travel information

### **Payment Receipt Email**

**Triggers:** After payment completion

**Content Includes:**
- ✅ Transaction ID
- ✅ Amount paid
- ✅ Payment method
- ✅ Invoice details
- ✅ Tax breakdown

### **Reminder Emails** (Future Enhancement)

- 72 hours before departure
- 24 hours before departure
- Check-in reminder

---

## 🔧 Backend Implementation

### Email Service Structure

```
backend/
├── services/
│   └── emailService.js          # Email sending logic
├── templates/
│   ├── bookingConfirmation.html # HTML email template
│   └── paymentReceipt.html      # Payment receipt template
├── routes/
│   └── email.js                 # Email API endpoints
└── .env                         # Configuration
```

---

## 🎯 Integration Points

### 1. **Booking Confirmation Page**
```javascript
// After successful payment
await sendBookingConfirmationEmail({
  email: traveller.email,
  pnr: bookingRef,
  flights: selectedFlights,
  passengers: travellerDetails,
  totalAmount: totalPrice
});
```

### 2. **Payment Processing**
```javascript
// After payment success
await sendPaymentReceiptEmail({
  email: traveller.email,
  transactionId: paymentId,
  amount: totalAmount,
  paymentMethod: paymentDetails.method
});
```

---

## 🔐 Security Best Practices

1. **Never expose API keys in frontend code**
   - All email sending should happen on the backend

2. **Validate email addresses**
   - Use regex validation
   - Verify email exists before sending

3. **Rate limiting**
   - Prevent spam by limiting emails per user
   - Implement exponential backoff for retries

4. **Error handling**
   - Log all email failures
   - Don't expose email service errors to users
   - Have fallback mechanisms

---

## 📊 Testing

### Development Testing

```javascript
// Test email endpoint
POST http://localhost:5000/api/email/test
{
  "email": "test@example.com",
  "bookingRef": "TEST123"
}
```

### Email Template Testing

Use tools like:
- **Mailtrap.io** - Email testing service
- **Ethereal Email** - Fake SMTP service
- **SendGrid Template Editor** - Visual template builder

---

## 📈 Monitoring & Analytics

### Track Email Metrics:
- ✅ Delivery rate
- ✅ Open rate (with tracking pixels)
- ✅ Click-through rate
- ✅ Bounce rate
- ✅ Unsubscribe rate

### Recommended Tools:
- SendGrid Analytics Dashboard
- Google Analytics (with UTM parameters)
- Custom logging in backend

---

## 🚨 Common Issues & Solutions

### Issue: Emails going to spam
**Solution:**
- Set up SPF, DKIM, DMARC records
- Use authenticated domain
- Avoid spam trigger words
- Include unsubscribe link

### Issue: Gmail blocking emails
**Solution:**
- Use App-Specific Password
- Enable "Less secure app access" (not recommended)
- Switch to SendGrid/AWS SES for production

### Issue: Email not delivered
**Solution:**
- Check recipient email validity
- Verify email service credentials
- Check spam folder
- Review bounce/error logs

---

## 🎨 Email Design Tips

1. **Mobile-First Design**
   - 60%+ users check emails on mobile
   - Use responsive templates
   - Large touch-friendly buttons

2. **Clear Call-to-Action**
   - Download ticket button
   - Add to calendar
   - Check-in online

3. **Branding Consistency**
   - Use TLP Airways colors
   - Include logo
   - Professional footer

4. **Accessibility**
   - Alt text for images
   - Sufficient color contrast
   - Clear hierarchy

---

## 📅 Future Enhancements

1. **SMS Notifications**
   - Integrate Twilio for SMS
   - Send booking confirmations via SMS

2. **Push Notifications**
   - Flight status updates
   - Gate changes
   - Delay notifications

3. **Personalization**
   - Travel recommendations
   - Loyalty program updates
   - Special offers based on booking history

4. **Multi-language Support**
   - Detect user language preference
   - Send emails in preferred language

---

## 💡 Cost Estimation

### SendGrid (Recommended)
- **Free:** 100 emails/day (3,000/month)
- **Essentials:** $19.95/mo (40,000 emails)
- **Pro:** $89.95/mo (1.5M emails)

### AWS SES
- **Cost:** $0.10 per 1,000 emails
- **Example:** 10,000 emails/month = $1.00/month

### Mailgun
- **Free:** 5,000 emails/month
- **Foundation:** $35/mo (50,000 emails)

---

## 🛠️ Implementation Checklist

- [ ] Choose email service provider
- [ ] Set up account and get API credentials
- [ ] Install required npm packages
- [ ] Configure environment variables
- [ ] Create email service utility
- [ ] Design email templates
- [ ] Create backend API endpoint
- [ ] Test email sending (development)
- [ ] Integrate with booking flow
- [ ] Add error handling and logging
- [ ] Test with real bookings
- [ ] Set up monitoring/analytics
- [ ] Configure production email service
- [ ] Deploy to production

---

## 📞 Support

For issues or questions:
- Check service provider documentation
- Review error logs
- Test with email testing tools
- Consult backend API documentation

