#!/bin/bash

echo "🔍 Checking Auth0 Configuration..."
echo ""
echo "📋 Current .env.local status:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ -f ".env.local" ]; then
    echo "✅ .env.local exists"
    echo ""
    
    # Check each required variable
    if grep -q "AUTH0_ISSUER_BASE_URL=https://your-domain.auth0.com" .env.local; then
        echo "❌ AUTH0_ISSUER_BASE_URL: NOT SET (still placeholder)"
    else
        echo "✅ AUTH0_ISSUER_BASE_URL: $(grep AUTH0_ISSUER_BASE_URL .env.local | cut -d'=' -f2)"
    fi
    
    if grep -q "AUTH0_CLIENT_ID=your-client-id" .env.local; then
        echo "❌ AUTH0_CLIENT_ID: NOT SET (still placeholder)"
    else
        echo "✅ AUTH0_CLIENT_ID: $(grep AUTH0_CLIENT_ID .env.local | cut -d'=' -f2 | cut -c1-20)..."
    fi
    
    if grep -q "AUTH0_CLIENT_SECRET=your_client_secret_here" .env.local; then
        echo "❌ AUTH0_CLIENT_SECRET: NOT SET (still placeholder)"
    else
        echo "✅ AUTH0_CLIENT_SECRET: $(grep AUTH0_CLIENT_SECRET .env.local | cut -d'=' -f2 | cut -c1-20)..."
    fi
    
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    
    # Check if all are set
    if grep -q "your-domain.auth0.com\|your-client-id\|your_client_secret_here" .env.local; then
        echo "⚠️  ACTION REQUIRED:"
        echo ""
        echo "You need to update .env.local with real Auth0 credentials."
        echo ""
        echo "📍 Where to find them:"
        echo "1. Go to: https://manage.auth0.com/"
        echo "2. Click: Applications → Applications"
        echo "3. Select your app (TLAirways or similar)"
        echo "4. Copy these from the Settings tab:"
        echo "   - Domain (e.g., dev-abc123.us.auth0.com)"
        echo "   - Client ID (long alphanumeric string)"
        echo "   - Client Secret (click 'Show' to reveal)"
        echo ""
        echo "📝 Then edit .env.local:"
        echo "   nano .env.local"
        echo "   # or"
        echo "   code .env.local"
        echo ""
    else
        echo "✅ All Auth0 credentials are set!"
        echo ""
        echo "🚀 You can now run:"
        echo "   npm run dev"
        echo ""
    fi
else
    echo "❌ .env.local NOT FOUND"
    echo ""
    echo "Run this to create it:"
    echo "   ./convert-env.sh"
    echo ""
fi
