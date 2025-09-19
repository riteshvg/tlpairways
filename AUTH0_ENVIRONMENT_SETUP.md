# 🔄 Auth0 Environment Setup Guide

## 📋 **AUTH0 DASHBOARD CONFIGURATION**

### **Step 1: Configure Application Settings**

In your Auth0 Dashboard → Applications → TLAirways Local Development → Settings:

**Allowed Callback URLs:**
```
http://localhost:3000,https://your-app.railway.app
```

**Allowed Logout URLs:**
```
http://localhost:3000,https://your-app.railway.app
```

**Allowed Web Origins:**
```
http://localhost:3000,https://your-app.railway.app
```

**Allowed Origins (CORS):**
```
http://localhost:3000,https://your-app.railway.app
```

---

## 🔧 **ENVIRONMENT FILES**

### **Development (.env.development)**
```env
REACT_APP_AUTH0_DOMAIN=your-domain.auth0.com
REACT_APP_AUTH0_CLIENT_ID=your-client-id
REACT_APP_AUTH0_AUDIENCE=https://api.tlairways.com
REACT_APP_AUTH0_REDIRECT_URI=http://localhost:3000
REACT_APP_AUTH0_SCOPE=openid profile email
```

### **Production (.env.production)**
```env
REACT_APP_AUTH0_DOMAIN=your-domain.auth0.com
REACT_APP_AUTH0_CLIENT_ID=your-client-id
REACT_APP_AUTH0_AUDIENCE=https://api.tlairways.com
REACT_APP_AUTH0_REDIRECT_URI=https://your-app.railway.app
REACT_APP_AUTH0_SCOPE=openid profile email
```

---

## 🚀 **DEPLOYMENT STRATEGY**

### **Option 1: Single Auth0 Application (Recommended)**
- Use the same Auth0 application for both dev and production
- Configure multiple callback URLs in Auth0 dashboard
- Use environment variables to switch redirect URIs

### **Option 2: Separate Auth0 Applications**
- Create separate Auth0 applications for dev and production
- Different client IDs for each environment
- More complex but better isolation

---

## 📝 **RAILWAY DEPLOYMENT**

### **Environment Variables in Railway:**
1. Go to Railway Dashboard → Your App → Variables
2. Add these environment variables:
   ```
   REACT_APP_AUTH0_DOMAIN=your-domain.auth0.com
   REACT_APP_AUTH0_CLIENT_ID=your-client-id
   REACT_APP_AUTH0_AUDIENCE=https://api.tlairways.com
   REACT_APP_AUTH0_REDIRECT_URI=https://your-app.railway.app
   REACT_APP_AUTH0_SCOPE=openid profile email
   ```

---

## ✅ **BENEFITS OF THIS APPROACH**

1. **Seamless Development**: Works locally with localhost
2. **Production Ready**: Works in production with Railway URL
3. **Single Configuration**: One Auth0 app handles both environments
4. **Automatic Detection**: Uses window.location.origin as fallback
5. **Easy Deployment**: Just update environment variables

---

## 🔍 **TESTING CHECKLIST**

### **Development Testing:**
- [ ] Login works on localhost:3000
- [ ] Redirect after login works
- [ ] Logout works
- [ ] User profile displays correctly

### **Production Testing:**
- [ ] Login works on Railway URL
- [ ] Redirect after login works
- [ ] Logout works
- [ ] User profile displays correctly
- [ ] No CORS errors in browser console

---

## 🚨 **COMMON ISSUES & SOLUTIONS**

### **Issue: "Invalid redirect URI" in production**
**Solution**: Make sure your Railway URL is added to Auth0 callback URLs

### **Issue: "Invalid redirect URI" in development**
**Solution**: Make sure localhost:3000 is in Auth0 callback URLs

### **Issue: CORS errors**
**Solution**: Add both URLs to "Allowed Web Origins" in Auth0

### **Issue: Environment variables not loading**
**Solution**: Restart your development server after changing .env files

---

## 🎯 **NEXT STEPS**

1. **Configure Auth0** with both URLs
2. **Test locally** with development environment
3. **Deploy to Railway** with production environment variables
4. **Test production** authentication flow
5. **Monitor** for any authentication issues

This setup ensures your Auth0 integration works seamlessly in both development and production environments!
