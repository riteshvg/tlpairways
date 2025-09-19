# TLAirways - Premium Air Travel Experience

A modern flight booking application built with React, Node.js, and Express.

## 🚀 Features

- **Flight Search & Booking**: Search for flights with flexible date and route options
- **Multi-Cabin Support**: Economy, Premium Economy, Business, and First Class
- **Currency Conversion**: Automatic USD/INR conversion for international flights
- **Ancillary Services**: Seat selection, baggage, meals, priority boarding, lounge access
- **Responsive Design**: Modern UI that works on all devices
- **Analytics Integration**: Adobe Data Layer integration for tracking

## 🛠️ Tech Stack

- **Frontend**: React 18, Material-UI, React Router
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (optional)
- **Deployment**: Render.com

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- npm (v8 or higher)

### Local Development

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd tlpairways
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```

3. **Start development servers**
   ```bash
   npm run dev
   ```

4. **Access the application**
   - Frontend: http://localhost:3001
   - Backend API: http://localhost:5000

## 🚀 Deployment to Render.com

### Method 1: Using Render Dashboard (Recommended)

1. **Prepare Your Repository**
   - Ensure all files are committed to your Git repository
   - Make sure the repository is public or connected to Render

2. **Create a Render Account**
   - Go to [render.com](https://render.com)
   - Sign up with your GitHub account

3. **Create a New Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select the repository containing your TLAirways app

4. **Configure the Service**
   - **Name**: `tlairways-app` (or your preferred name)
   - **Environment**: `Node`
   - **Region**: Choose closest to your users
   - **Branch**: `main` (or your default branch)
   - **Build Command**: `npm run render-build`
   - **Start Command**: `npm start`
   - **Plan**: Free (or choose paid plan)

5. **Set Environment Variables**
   - Click on "Environment" tab
   - Add the following variables:
     ```
     NODE_ENV=production
     PORT=10000
     ALLOWED_ORIGINS=https://your-app-name.onrender.com
     ```

6. **Deploy**
   - Click "Create Web Service"
   - Render will automatically build and deploy your application

### Method 2: Using render.yaml (Blue-Green Deployment)

1. **Use the provided render.yaml file**
   - The file is already configured in your repository
   - Render will automatically detect and use it

2. **Deploy via Render Dashboard**
   - Follow the same steps as Method 1
   - Render will use the configuration from render.yaml

### Troubleshooting Deployment Issues

If you encounter the error "Cannot find module '/opt/render/project/src/backend/src/index.js'":

1. **Verify File Structure**
   ```bash
   # Run the deployment check script
   node deploy-check.js
   ```

2. **Check Build Logs**
   - Go to your Render dashboard
   - Click on your service
   - Check the "Logs" tab for build errors

3. **Common Solutions**
   - Ensure all files are committed to Git
   - Verify the build command is correct: `npm run render-build`
   - Check that the start command is: `npm start`
   - Make sure the root index.js file exists

4. **Manual Verification**
   ```bash
   # Test locally before deploying
   npm run render-build
   npm start
   ```

5. **Health Check**
   - After deployment, test: `https://your-app.onrender.com/api/health`
   - Should return: `{"status":"OK","timestamp":"...","environment":"production"}`

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the backend directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration (if using MongoDB)
MONGODB_URI=mongodb://localhost:27017/tlairways

# CORS Origins
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001

# Adobe Analytics Configuration
ADOBE_ANALYTICS_ENABLED=true
ADOBE_ENVIRONMENT=development
ADOBE_SCRIPT_URL=https://assets.adobedtm.com/01296dd00565/26201e3c8f15/launch-2f8b80d50cb3-development.min.js

# Security
JWT_SECRET=your-super-secret-jwt-key-here
SESSION_SECRET=your-super-secret-session-key-here
```

### Production Configuration

For production deployment on Render:

```env
NODE_ENV=production
PORT=10000
MONGODB_URI=your-mongodb-atlas-uri
ALLOWED_ORIGINS=https://tlpairways.onrender.com
ADOBE_ANALYTICS_ENABLED=true
ADOBE_ENVIRONMENT=production
```

## 📁 Project Structure

```
tlpairways/
├── frontend/                 # React frontend application
│   ├── public/              # Static files
│   │   ├── components/      # React components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   ├── config/         # Configuration files
│   │   └── data/           # Static data files
│   └── package.json
├── backend/                 # Node.js backend API
│   ├── src/
│   │   ├── routes/         # API routes
│   │   ├── models/         # Database models
│   │   ├── config/         # Configuration
│   │   └── scripts/        # Utility scripts
│   └── package.json
├── package.json            # Root package.json
├── render.yaml             # Render deployment config
└── README.md
```

## 🔍 API Endpoints

- `GET /api/health` - Health check
- `GET /api/airports` - Get all airports
- `GET /api/flights` - Get flights (with query parameters)

## 🧪 Testing

```bash
# Test frontend
cd frontend
npm test

# Test backend
cd backend
npm test
```

## 📊 Monitoring

- **Health Check**: `/api/health`
- **Logs**: Available in Render dashboard
- **Analytics**: Adobe Data Layer integration

## 🔒 Security

- Helmet.js for security headers
- CORS configuration
- Input validation
- Rate limiting (recommended for production)

## 🚀 Performance

- Gzip compression enabled
- Static file serving
- React production build
- Optimized bundle size

## 📞 Support

For deployment issues:
1. Check Render logs in the dashboard
2. Verify environment variables
3. Ensure all dependencies are installed
4. Check the health endpoint: `https://your-app.onrender.com/api/health`

## 📝 License

MIT License - see LICENSE file for details

---

**Happy Flying with TLAirways! ✈️**# Railway Deployment Test - Fri Sep 19 21:26:07 IST 2025
