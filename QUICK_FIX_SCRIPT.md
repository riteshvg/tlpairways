# 🚀 Quick Fix Script

## **Run These Commands to Fix Email Issues**

Copy and paste these commands **one by one** in your terminal:

---

## **Step 1: Fix Backend .env File**

```bash
# Navigate to backend
cd /Users/riteshg/Documents/Learnings/tlpairways/backend

# Create backup of current .env
cp .env .env.backup

# Fix the .env file (removes "your-" prefix and fixes port)
cat > .env << 'EOF'
PORT=5000
MONGODB_URI=mongodb+srv://riteshvgupta:ritsy123@tlpairways.unaiwhb.mongodb.net/?retryWrites=true&w=majority&appName=tlpairways
NODE_ENV=development

# Auth0 Configuration for Local Development
AUTH0_DOMAIN=your-domain.auth0.com
AUTH0_AUDIENCE=https://api.tlairways.com
AUTH0_ISSUER=https://your-domain.auth0.com/
AUTH0_CLIENT_ID=your-client-id
AUTH0_CLIENT_SECRET=your-client-secret

# Email Configuration
EMAIL_SERVICE=gmail
EMAIL_USER=riteshvgupta@gmail.com
EMAIL_PASSWORD=ppoivudqdspqiqqb
EMAIL_FROM=TLP Airways <noreply@tlpairways.com>
FRONTEND_URL=http://localhost:3000
EOF

echo "✅ Backend .env fixed!"
```

---

## **Step 2: Create Frontend .env File**

```bash
# Navigate to frontend
cd /Users/riteshg/Documents/Learnings/tlpairways/frontend

# Create .env file
cat > .env << 'EOF'
REACT_APP_API_URL=http://localhost:5000/api
EOF

echo "✅ Frontend .env created!"
```

---

## **Step 3: Start Backend Server**

```bash
# Navigate to backend
cd /Users/riteshg/Documents/Learnings/tlpairways/backend

# Start the server
npm start
```

**Expected Output:**
```
🚀 Server running on port 5000
🌍 Environment: development
💚 Health check: http://localhost:5000/api/health
```

**Keep this terminal open!**

---

## **Step 4: Test Email in New Terminal**

**Open a NEW terminal window** and run:

```bash
# Test backend health
curl http://localhost:5000/api/health

# Test email service status
curl http://localhost:5000/api/email/status

# Send test email
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

**Check your email inbox!** (Check spam if not in inbox)

---

## **Step 5: Restart Frontend**

**In another NEW terminal:**

```bash
# Navigate to frontend
cd /Users/riteshg/Documents/Learnings/tlpairways/frontend

# Start frontend
npm start
```

---

## **Step 6: Test Complete Flow**

1. Go to: http://localhost:3000
2. Search for flights
3. Select a flight
4. Fill traveller details with **your email address**
5. Select add-ons (optional)
6. Complete payment
7. On confirmation page, you should see:
   - "📧 Confirmation email sent to [your-email]"
   - Check your inbox!

---

## **🔍 If Test Email Fails:**

### **Error: "Invalid login"**

Your Gmail app password might be wrong. Generate a new one:

1. Go to: https://myaccount.google.com/apppasswords
2. Sign in
3. Click "Generate" 
4. Select "Mail" and "Other (Custom name)" → Type "TLP Airways"
5. Click "Generate"
6. Copy the **16-character** password (no spaces)
7. Update `.env`:
   ```bash
   # Edit backend/.env and replace:
   EMAIL_PASSWORD=your-new-app-password-here
   ```
8. Restart backend

### **Error: "ECONNREFUSED" or "Failed to fetch"**

Backend is not running:
```bash
# Check if backend is running
curl http://localhost:5000/api/health

# If no response, start backend:
cd /Users/riteshg/Documents/Learnings/tlpairways/backend
npm start
```

### **Error: Port already in use**

Kill existing process:
```bash
# Find process on port 5000
lsof -i :5000

# Kill it (replace PID with actual number)
kill -9 [PID]

# Start backend again
npm start
```

---

## **✅ Success Checklist**

- [ ] Backend .env fixed (no "your-" prefix, PORT=5000)
- [ ] Frontend .env created (REACT_APP_API_URL=http://localhost:5000/api)
- [ ] Backend running (http://localhost:5000/api/health returns OK)
- [ ] Test email sent successfully
- [ ] Test email received in inbox
- [ ] Frontend restarted
- [ ] Complete booking flow tested
- [ ] Booking confirmation email received

---

## **🆘 Still Having Issues?**

### **Complete Diagnostic:**

```bash
# Run this complete diagnostic
echo "=== Backend Status ==="
curl -s http://localhost:5000/api/health | jq 2>/dev/null || echo "Backend not responding"

echo -e "\n=== Email Service Status ==="
curl -s http://localhost:5000/api/email/status | jq 2>/dev/null || echo "Email service not available"

echo -e "\n=== Backend Process ==="
ps aux | grep -i "node.*index.js" | grep -v grep || echo "Backend process not found"

echo -e "\n=== Port 5000 Usage ==="
lsof -i :5000 || echo "Port 5000 is free"

echo -e "\n=== Backend .env Check ==="
cd /Users/riteshg/Documents/Learnings/tlpairways/backend
grep -E "EMAIL_USER|PORT|EMAIL_PASSWORD" .env | sed 's/EMAIL_PASSWORD=.*/EMAIL_PASSWORD=***/' 

echo -e "\n=== Frontend .env Check ==="
cd /Users/riteshg/Documents/Learnings/tlpairways/frontend
cat .env 2>/dev/null || echo "Frontend .env not found"

echo -e "\n=== Nodemailer Installed ==="
cd /Users/riteshg/Documents/Learnings/tlpairways/backend
npm list nodemailer 2>/dev/null || echo "Nodemailer not installed"
```

---

**After fixing, emails should work! 📧✈️**

