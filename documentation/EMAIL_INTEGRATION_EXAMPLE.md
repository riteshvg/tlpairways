# Email Integration Example

## How to Add Email Notifications to Booking Confirmation

### Step 1: Import Email Helper

In `BookingConfirmation.js`, add the import:

```javascript
import { sendBookingConfirmationEmail, sendPaymentReceiptEmail } from '../utils/emailHelper';
```

### Step 2: Add Email Sending Logic

Add this code in the `useEffect` where you push the purchase event to Adobe Data Layer:

```javascript
useEffect(() => {
  if (bookingDetails && selectedFlights) {
    // ... existing Adobe Data Layer code ...

    // Push purchase event to Adobe Data Layer
    if (window.adobeDataLayer) {
      window.adobeDataLayer.push(purchaseEvent);
    }

    // ✨ NEW: Send booking confirmation email
    sendBookingConfirmationEmail({
      email: travellerDetails && travellerDetails.length > 0 
        ? travellerDetails[0].email 
        : 'customer@example.com',
      pnr: pnr,
      passengerName: travellerDetails && travellerDetails.length > 0
        ? `${travellerDetails[0].firstName} ${travellerDetails[0].lastName}`
        : 'Valued Customer',
      selectedFlights: selectedFlights,
      travellerDetails: travellerDetails,
      totalPrice: bookingDetails.totalAmount,
      currency: CURRENCY_CONFIG.default.code,
      selectedServices: selectedServices
    }).then(result => {
      if (result.success) {
        console.log('✅ Booking confirmation email sent successfully');
        // Optionally show a success message to user
        setEmailSent(true);
      } else {
        console.error('❌ Failed to send email:', result.error);
        // Optionally show an error message, but don't block the booking
      }
    }).catch(error => {
      console.error('❌ Email error:', error);
      // Silent fail - booking is still successful even if email fails
    });

  }
}, [bookingDetails, selectedFlights, travellerDetails]);
```

### Step 3: Add State for Email Status (Optional)

```javascript
const [emailSent, setEmailSent] = useState(false);
```

### Step 4: Show Email Confirmation in UI (Optional)

Add this in your JSX after the booking confirmation banner:

```javascript
{emailSent && (
  <Alert severity="success" sx={{ mt: 2 }}>
    📧 Booking confirmation has been sent to your email
  </Alert>
)}
```

---

## Complete Example Integration

Here's a complete example of integrating email in `BookingConfirmation.js`:

```javascript
import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Alert } from '@mui/material';
import { sendBookingConfirmationEmail } from '../utils/emailHelper';
import CURRENCY_CONFIG from '../config/currencyConfig';

const BookingConfirmation = () => {
  const location = useLocation();
  const [emailSent, setEmailSent] = useState(false);
  const [emailError, setEmailError] = useState(null);

  // Extract booking data from location.state
  const {
    selectedFlights,
    travellerDetails,
    selectedServices,
    totalPrice,
    pnr
  } = location.state || {};

  useEffect(() => {
    // Send booking confirmation email
    const sendEmail = async () => {
      try {
        // Get primary passenger email
        const primaryPassenger = travellerDetails && travellerDetails.length > 0 
          ? travellerDetails[0] 
          : null;

        if (!primaryPassenger || !primaryPassenger.email) {
          console.warn('⚠️ No email address found for passenger');
          return;
        }

        const result = await sendBookingConfirmationEmail({
          email: primaryPassenger.email,
          pnr: pnr,
          passengerName: `${primaryPassenger.firstName} ${primaryPassenger.lastName}`,
          selectedFlights: selectedFlights,
          travellerDetails: travellerDetails,
          totalPrice: totalPrice,
          currency: CURRENCY_CONFIG.default.code,
          selectedServices: selectedServices
        });

        if (result.success) {
          console.log('✅ Email sent successfully');
          setEmailSent(true);
        } else {
          console.error('❌ Email failed:', result.error);
          setEmailError(result.error);
        }

      } catch (error) {
        console.error('❌ Email exception:', error);
        setEmailError(error.message);
      }
    };

    // Call send email function
    if (selectedFlights && travellerDetails && pnr) {
      sendEmail();
    }

  }, [selectedFlights, travellerDetails, selectedServices, totalPrice, pnr]);

  return (
    <Container>
      {/* Booking Confirmation UI */}
      <Typography variant="h4">Booking Confirmed!</Typography>
      <Typography variant="h6">PNR: {pnr}</Typography>

      {/* Email Status Alerts */}
      {emailSent && (
        <Alert severity="success" sx={{ mt: 2 }}>
          📧 Booking confirmation has been sent to {travellerDetails[0].email}
        </Alert>
      )}

      {emailError && (
        <Alert severity="warning" sx={{ mt: 2 }}>
          ⚠️ Booking confirmed, but email notification could not be sent. 
          Please check your email or contact support.
        </Alert>
      )}

      {/* Rest of your booking confirmation UI */}
    </Container>
  );
};

export default BookingConfirmation;
```

---

## Payment Page Integration

Similarly, integrate in `Payment.js` after successful payment:

```javascript
// After payment success
const handlePaymentSuccess = async (paymentDetails) => {
  // ... existing payment success logic ...

  // Send payment receipt email
  const emailResult = await sendPaymentReceiptEmail({
    email: travellerDetails[0].email,
    pnr: bookingRef,
    transactionId: paymentDetails.transactionId,
    amount: totalAmount,
    currency: CURRENCY_CONFIG.default.code,
    paymentMethod: paymentDetails.method
  });

  if (emailResult.success) {
    console.log('✅ Payment receipt sent');
  }

  // Navigate to confirmation page
  navigate('/booking-confirmation', { state: bookingState });
};
```

---

## Error Handling Best Practices

### 1. **Silent Fail for Email Errors**
Don't block booking if email fails:

```javascript
try {
  await sendBookingConfirmationEmail(data);
} catch (error) {
  // Log error but don't throw
  console.error('Email failed:', error);
  // Booking is still successful
}
```

### 2. **Show User-Friendly Messages**

```javascript
if (emailError) {
  return (
    <Alert severity="info">
      Your booking is confirmed! We're having trouble sending the email. 
      Please save your booking reference: <strong>{pnr}</strong>
    </Alert>
  );
}
```

### 3. **Retry Logic (Advanced)**

```javascript
const sendEmailWithRetry = async (data, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      const result = await sendBookingConfirmationEmail(data);
      if (result.success) return result;
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
};
```

---

## Testing the Integration

### 1. **Test Email Configuration**

Create a test page or add to existing admin panel:

```javascript
import { testEmailConfig } from '../utils/emailHelper';

const TestEmailButton = () => {
  const handleTest = async () => {
    const result = await testEmailConfig('test@example.com');
    alert(result.success ? 'Email sent!' : 'Email failed: ' + result.error);
  };

  return (
    <Button onClick={handleTest}>
      Test Email Configuration
    </Button>
  );
};
```

### 2. **Check Service Status**

```javascript
import { checkEmailServiceStatus } from '../utils/emailHelper';

useEffect(() => {
  checkEmailServiceStatus().then(status => {
    console.log('Email service status:', status);
  });
}, []);
```

### 3. **Monitor Logs**

Check browser console for:
- ✅ Email sent successfully
- ❌ Email failed: [error message]

Check backend logs for:
- Email delivery status
- SMTP connection errors
- API errors

---

## Environment Variables

Make sure `.env` is configured in both frontend and backend:

### Backend `.env`:
```env
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=TLP Airways <noreply@tlpairways.com>
FRONTEND_URL=http://localhost:3000
```

### Frontend `.env`:
```env
REACT_APP_API_URL=http://localhost:5000/api
```

---

## Production Checklist

Before deploying to production:

- [ ] Switch from Gmail to SendGrid/AWS SES
- [ ] Update `EMAIL_FROM` to verified domain
- [ ] Set `FRONTEND_URL` to production URL
- [ ] Test with real email addresses
- [ ] Monitor email delivery rates
- [ ] Set up email templates in provider dashboard
- [ ] Configure SPF/DKIM/DMARC records
- [ ] Add unsubscribe link (for marketing emails)
- [ ] Implement rate limiting
- [ ] Set up email analytics

---

## Troubleshooting

### Email not sending?
1. Check backend logs for errors
2. Verify `.env` configuration
3. Test with `testEmailConfig()` function
4. Check spam folder
5. Verify email service credentials

### Emails going to spam?
1. Set up SPF/DKIM records
2. Use authenticated domain
3. Avoid spam trigger words
4. Include unsubscribe link

### Need help?
- Check `EMAIL_AUTOMATION_SETUP.md` for detailed setup
- Review email service provider documentation
- Check backend API logs
- Test with email testing tools (Mailtrap, Ethereal)

