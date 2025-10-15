# 🚨 Email Not Working - Troubleshooting Guide

## ❌ **Issues Found:**

I've analyzed your setup and found **5 critical issues** preventing emails from being sent:

---

## 🔍 **Issue #1: Backend Server NOT Running**
**Problem:** The backend server is not running, so the frontend cannot send API requests.

**Evidence:** 
```bash
ps aux | grep node  # No backend server process found
```

**Solution:**
```bash
cd backend
npm start
# OR for development with auto-reload:
npm run dev
```

**Expected Output:**
```
🚀 Server running on port 5002
🌍 Environment: development
💚 Health check: http://localhost:5002/api/health
```

---

## 🔍 **Issue #2: Incorrect Email in .env**
**Problem:** Your `.env` file has `EMAIL_USER=your-riteshvgupta@gmail.com` (note the "your-" prefix)

**Current Configuration:**
```env
EMAIL_USER=your-riteshvgupta@gmail.com  ❌ WRONG
EMAIL_PASSWORD=ppoi vudq dspq iqqb
```

**Fix:** Edit `/backend/.env` and remove "your-" prefix:
```env
EMAIL_USER=riteshvgupta@gmail.com  ✅ CORRECT
EMAIL_PASSWORD=ppoi vudq dspq iqqb
```

---

## 🔍 **Issue #3: Port Mismatch**
**Problem:** Backend runs on port **5002** but frontend calls port **5000**

**Backend .env:**
```env
PORT=5002
```

**Frontend emailHelper.js:**
```javascript
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
```

**Solution Option A:** Change backend port to 5000
```env
PORT=5000  # In backend/.env
```

**Solution Option B:** Configure frontend to use 5002
Create `frontend/.env`:
```env
REACT_APP_API_URL=http://localhost:5002/api
```

---

## 🔍 **Issue #4: Missing Frontend .env**
**Problem:** Frontend doesn't have `.env` file to configure API URL

**Create:** `/frontend/.env`
```env
REACT_APP_API_URL=http://localhost:5002/api
```

**Then restart frontend:**
```bash
cd frontend
npm start
```

---

## 🔍 **Issue #5: Gmail App Password Format**
**Problem:** Your app password has spaces which might cause issues

**Current:**
```env
EMAIL_PASSWORD=ppoi vudq dspq iqqb
```

**Fix:** Remove spaces:
```env
EMAIL_PASSWORD=ppoivudqdspqiqqb
```

---

## ✅ **Complete Fix Checklist**

Follow these steps **in order**:

### **Step 1: Fix Backend .env**
Edit `/backend/.env`:
```env
PORT=5000
MONGODB_URI=mongodb+srv://riteshvgupta:ritsy123@tlpairways.unaiwhb.mongodb.net/?retryWrites=true&w=majority&appName=tlpairways
NODE_ENV=development

# Email Configuration
EMAIL_SERVICE=gmail
EMAIL_USER=riteshvgupta@gmail.com
EMAIL_PASSWORD=ppoivudqdspqiqqb
EMAIL_FROM=TLP Airways <noreply@tlpairways.com>
FRONTEND_URL=http://localhost:3000
```

### **Step 2: Create Frontend .env**
Create `/frontend/.env`:
```env
REACT_APP_API_URL=http://localhost:5000/api
```

### **Step 3: Start Backend Server**
```bash
cd backend
npm start
```

**Verify it's running:**
```bash
curl http://localhost:5000/api/health
```

**Expected Response:**
```json
{
  "status": "OK",
  "timestamp": "2025-10-15T...",
  "environment": "development"
}
```

### **Step 4: Test Email Configuration**
```bash
curl -X POST http://localhost:5000/api/email/test \
  -H "Content-Type: application/json" \
  -d '{"email":"riteshvgupta@gmail.com"}'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Test email sent successfully",
  "messageId": "..."
}
```

### **Step 5: Restart Frontend**
```bash
cd frontend
npm start
```

### **Step 6: Test Complete Booking Flow**
1. Go to your app: http://localhost:3000
2. Search for flights
3. Fill traveller details with valid email
4. Complete payment
5. Check confirmation page for email status

### **Step 7: Verify Email Received**
- Check inbox for email from "TLP Airways"
- Check spam folder if not in inbox
- Look for subject: "Booking Confirmed - [PNR] | TLP Airways"

---

## 🔍 **How to Debug**

### **Check Backend Logs**
When backend is running, watch the console for:

✅ **Success:**
```
📧 Sending booking confirmation email to: user@example.com
✅ Booking confirmation email sent successfully
✅ Booking confirmation email sent: {
  messageId: '...',
  to: 'user@example.com',
  pnr: 'ABC123'
}
```

❌ **Errors:**
```
❌ Error sending booking confirmation email: Invalid login
❌ Error: Missing credentials for "PLAIN"
❌ Error: getaddrinfo ENOTFOUND smtp.gmail.com
```

### **Check Frontend Console**
Open browser DevTools (F12) → Console:

✅ **Success:**
```
📧 Sending booking confirmation email to: user@example.com
✅ Booking confirmation email sent successfully
```

❌ **Errors:**
```
❌ Failed to send email: Network error
❌ Email sending exception: TypeError: Failed to fetch
```

### **Check Network Tab**
Open DevTools → Network tab → Look for:

**Request:**
```
POST http://localhost:5000/api/email/booking-confirmation
Status: 200 OK
```

**If you see:**
- `Status: 404` → Backend route not found
- `Status: 500` → Server error (check backend logs)
- `Failed` → Backend not running or wrong URL
- `CORS error` → CORS configuration issue

---

## 🛠️ **Quick Fixes for Common Errors**

### **Error: "Invalid login"**
```
Error: Invalid login: 535-5.7.8 Username and Password not accepted
```

**Fix:**
1. Verify Gmail credentials are correct
2. Enable "Less secure app access" (not recommended) OR
3. Use App-Specific Password (recommended):
   - Go to: https://myaccount.google.com/apppasswords
   - Generate new password
   - Use that in `.env`

### **Error: "getaddrinfo ENOTFOUND"**
```
Error: getaddrinfo ENOTFOUND smtp.gmail.com
```

**Fix:** 
- Check internet connection
- Verify EMAIL_SERVICE is set to "gmail"

### **Error: "Missing credentials"**
```
Error: Missing credentials for "PLAIN"
```

**Fix:**
- Ensure EMAIL_USER and EMAIL_PASSWORD are set in `.env`
- Remove any extra spaces or quotes

### **Error: "Failed to fetch" (Frontend)**
```
TypeError: Failed to fetch
```

**Fix:**
- Backend is not running → Start it
- Wrong API URL → Check REACT_APP_API_URL
- CORS issue → Backend should already have CORS configured

---

## 📊 **Verification Commands**

### **1. Check Backend Running:**
```bash
curl http://localhost:5000/api/health
```

### **2. Check Email Service Status:**
```bash
curl http://localhost:5000/api/email/status
```

Expected:
```json
{
  "success": true,
  "message": "Email service is running",
  "configuration": {
    "service": "gmail",
    "from": "TLP Airways <noreply@tlpairways.com>",
    "user": "***gmail.com",
    "sendgrid": "Not configured",
    "aws": "Not configured"
  }
}
```

### **3. Send Test Email:**
```bash
curl -X POST http://localhost:5000/api/email/test \
  -H "Content-Type: application/json" \
  -d '{"email":"your-email@gmail.com"}'
```

### **4. Check Backend Port:**
```bash
lsof -i :5000
```

Should show:
```
COMMAND  PID    USER   FD   TYPE   DEVICE SIZE/OFF NODE NAME
node    12345  user   23u  IPv6  0x...      0t0  TCP *:5000 (LISTEN)
```

---

## 🎯 **Expected Flow When Working**

1. **User completes booking** → Confirmation page loads
2. **Frontend calls:** `POST http://localhost:5000/api/email/booking-confirmation`
3. **Backend receives request** → Validates data
4. **Backend sends email** → Via Gmail SMTP
5. **Backend responds:** `{ success: true, messageId: "..." }`
6. **Frontend shows:** "📧 Confirmation email sent to user@example.com"
7. **User receives email** → Beautiful HTML email with booking details

---

## 🚀 **Production Deployment Note**

For **Railway** or production:

### **Backend .env (Production):**
```env
PORT=5000
NODE_ENV=production
EMAIL_SERVICE=gmail
EMAIL_USER=riteshvgupta@gmail.com
EMAIL_PASSWORD=ppoivudqdspqiqqb
EMAIL_FROM=TLP Airways <noreply@tlpairways.com>
FRONTEND_URL=https://tlpairways.up.railway.app
```

### **Frontend .env (Production):**
```env
REACT_APP_API_URL=https://your-backend-url.railway.app/api
```

---

## 📞 **Still Not Working?**

### **Run Full Diagnostic:**

```bash
# 1. Check if backend dependencies installed
cd backend && npm list nodemailer

# 2. Check if backend is running
ps aux | grep node

# 3. Test backend health
curl http://localhost:5000/api/health

# 4. Test email status
curl http://localhost:5000/api/email/status

# 5. Check backend logs
cd backend && npm start  # Watch console output

# 6. Check frontend API URL
grep REACT_APP_API_URL frontend/.env

# 7. Test direct email send
curl -X POST http://localhost:5000/api/email/test \
  -H "Content-Type: application/json" \
  -d '{"email":"riteshvgupta@gmail.com"}'
```

### **Send Me Debug Info:**
If still failing, share:
1. Backend console logs
2. Frontend console logs (DevTools)
3. Network tab screenshot
4. Email error message

---

## ✅ **Success Indicators**

You'll know it's working when you see:

**Backend Console:**
```
🚀 Server running on port 5000
✅ Booking confirmation email sent: {
  messageId: '<...@gmail.com>',
  to: 'customer@example.com',
  pnr: 'ABC123'
}
```

**Frontend Console:**
```
📧 Sending booking confirmation email to: customer@example.com
✅ Booking confirmation email sent successfully
```

**Confirmation Page:**
```
┌─────────────────────────────────────┐
│     ✓  Booking Confirmed!          │
│        PNR: ABC123                  │
│  📧 Confirmation email sent to      │
│     customer@example.com            │
└─────────────────────────────────────┘
```

**Email Inbox:**
```
From: TLP Airways <noreply@tlpairways.com>
Subject: Booking Confirmed - ABC123 | TLP Airways
[Beautiful HTML email with all booking details]
```

---

**Good luck! 🚀 Follow the steps in order and emails will work!**

