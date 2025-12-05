#!/bin/bash

# Script to convert SPA .env to Next.js .env.local
# This reads from frontend/.env and creates frontend-next/.env.local

echo "🔄 Converting SPA .env to Next.js .env.local..."

# Check if source .env exists
if [ ! -f "../frontend/.env" ]; then
  echo "❌ Error: frontend/.env not found"
  echo "Please make sure you're running this from frontend-next directory"
  exit 1
fi

# Read values from SPA .env
source ../frontend/.env

# Generate AUTH0_SECRET if not exists
if [ -z "$AUTH0_SECRET" ]; then
  AUTH0_SECRET=$(openssl rand -hex 32)
  echo "✅ Generated new AUTH0_SECRET"
fi

# Create .env.local for Next.js
cat > .env.local << EOF
# Auth0 Configuration (converted from SPA .env)
# Generated: $(date)

# Auth0 Domain
AUTH0_ISSUER_BASE_URL=https://${REACT_APP_AUTH0_DOMAIN}

# Auth0 Client ID
AUTH0_CLIENT_ID=${REACT_APP_AUTH0_CLIENT_ID}

# Auth0 Client Secret (get from Auth0 Dashboard)
# TODO: Add your Auth0 Client Secret here
AUTH0_CLIENT_SECRET=your_client_secret_here

# Base URL (where your Next.js app runs)
AUTH0_BASE_URL=http://localhost:3000

# Secret for encrypting session cookie
AUTH0_SECRET=${AUTH0_SECRET}

# Auth0 Audience
AUTH0_AUDIENCE=${REACT_APP_AUTH0_AUDIENCE}

# Auth0 Scope
AUTH0_SCOPE=openid profile email
EOF

echo "✅ Created .env.local"
echo ""
echo "⚠️  IMPORTANT: You still need to:"
echo "1. Get your Auth0 Client Secret from Auth0 Dashboard"
echo "2. Replace 'your_client_secret_here' in .env.local"
echo "3. Update Auth0 Dashboard with callback URL: http://localhost:3000/api/auth/callback"
echo ""
echo "📝 .env.local created with:"
echo "   - AUTH0_ISSUER_BASE_URL: https://${REACT_APP_AUTH0_DOMAIN}"
echo "   - AUTH0_CLIENT_ID: ${REACT_APP_AUTH0_CLIENT_ID}"
echo "   - AUTH0_AUDIENCE: ${REACT_APP_AUTH0_AUDIENCE}"
echo "   - AUTH0_SECRET: Generated (${AUTH0_SECRET:0:10}...)"
echo ""
echo "✅ Done! Now you can run: npm run dev"
