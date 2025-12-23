#!/bin/bash

# Email Toggle Feature Test Script
# Tests the email toggle functionality via API

BASE_URL="http://localhost:5001"
API_URL="${BASE_URL}/api/email"

echo "=================================="
echo "Email Toggle Feature Test"
echo "=================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Get current settings
echo "Test 1: Get current email settings"
echo "-----------------------------------"
RESPONSE=$(curl -s "${API_URL}/settings")
echo "Response: $RESPONSE"
echo ""

# Test 2: Get email service status
echo "Test 2: Get email service status"
echo "-----------------------------------"
STATUS=$(curl -s "${API_URL}/status")
echo "Response: $STATUS"
echo ""

# Test 3: Disable email sending
echo "Test 3: Disable email sending"
echo "-----------------------------------"
DISABLE_RESPONSE=$(curl -s -X POST "${API_URL}/settings" \
  -H "Content-Type: application/json" \
  -d '{"emailEnabled": false}')
echo "Response: $DISABLE_RESPONSE"
echo ""

# Verify it's disabled
echo "Verify: Check status after disabling"
echo "-----------------------------------"
STATUS_DISABLED=$(curl -s "${API_URL}/status")
echo "Response: $STATUS_DISABLED"
ENABLED=$(echo $STATUS_DISABLED | grep -o '"enabled":[^,}]*' | cut -d':' -f2)
if [ "$ENABLED" = "false" ]; then
    echo -e "${GREEN}✓ Email successfully disabled${NC}"
else
    echo -e "${RED}✗ Email disable failed${NC}"
fi
echo ""

# Test 4: Enable email sending
echo "Test 4: Enable email sending"
echo "-----------------------------------"
ENABLE_RESPONSE=$(curl -s -X POST "${API_URL}/settings" \
  -H "Content-Type: application/json" \
  -d '{"emailEnabled": true}')
echo "Response: $ENABLE_RESPONSE"
echo ""

# Verify it's enabled
echo "Verify: Check status after enabling"
echo "-----------------------------------"
STATUS_ENABLED=$(curl -s "${API_URL}/status")
echo "Response: $STATUS_ENABLED"
ENABLED=$(echo $STATUS_ENABLED | grep -o '"enabled":[^,}]*' | cut -d':' -f2)
if [ "$ENABLED" = "true" ]; then
    echo -e "${GREEN}✓ Email successfully enabled${NC}"
else
    echo -e "${RED}✗ Email enable failed${NC}"
fi
echo ""

# Test 5: Test with invalid data
echo "Test 5: Test with invalid data (should fail)"
echo "-----------------------------------"
INVALID_RESPONSE=$(curl -s -X POST "${API_URL}/settings" \
  -H "Content-Type: application/json" \
  -d '{"emailEnabled": "not-a-boolean"}')
echo "Response: $INVALID_RESPONSE"
if echo "$INVALID_RESPONSE" | grep -q "error"; then
    echo -e "${GREEN}✓ Correctly rejected invalid data${NC}"
else
    echo -e "${RED}✗ Should have rejected invalid data${NC}"
fi
echo ""

echo "=================================="
echo "Test Summary"
echo "=================================="
echo "All basic tests completed."
echo ""
echo "Next steps:"
echo "1. Check the settings file: backend/config/settings.json"
echo "2. Visit http://localhost:3000/settings to test the UI"
echo "3. Make a test booking to verify email behavior"
echo ""
echo -e "${YELLOW}Note: Make sure both backend and frontend servers are running${NC}"
