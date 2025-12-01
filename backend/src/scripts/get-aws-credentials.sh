#!/bin/bash
# Script to extract AWS credentials from AWS CLI configuration
# and update .env file with the existing bucket

echo "🔍 Getting AWS credentials from AWS CLI configuration..."
echo ""

# Get credentials
ACCESS_KEY=$(aws configure get aws_access_key_id)
REGION=$(aws configure get region)
BUCKET="tlpairways-event-data-prod"

echo "✅ Found AWS Configuration:"
echo "   Access Key ID: ${ACCESS_KEY}"
echo "   Region: ${REGION}"
echo "   Bucket: ${BUCKET}"
echo ""

# Check if secret key is in credentials file
if [ -f ~/.aws/credentials ]; then
    SECRET_KEY=$(grep -A 2 "\[default\]" ~/.aws/credentials | grep aws_secret_access_key | cut -d'=' -f2 | tr -d ' ')
    if [ ! -z "$SECRET_KEY" ]; then
        echo "✅ Found Secret Access Key in credentials file"
        echo ""
        echo "📝 Add these to your backend/.env file:"
        echo ""
        echo "# AWS S3 Configuration for Weather Data"
        echo "AWS_ACCESS_KEY_ID=${ACCESS_KEY}"
        echo "AWS_SECRET_ACCESS_KEY=${SECRET_KEY}"
        echo "AWS_REGION=${REGION}"
        echo "AWS_S3_BUCKET=${BUCKET}"
        echo "AWS_S3_PATH=weather-data/"
        echo ""
    else
        echo "⚠️  Secret key not found in credentials file"
        echo "   You'll need to get it from AWS Console or create new access keys"
    fi
else
    echo "⚠️  Credentials file not found at ~/.aws/credentials"
fi

echo ""
echo "🧪 Testing bucket access..."
aws s3 ls s3://${BUCKET}/ > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ Bucket access confirmed: s3://${BUCKET}/"
else
    echo "❌ Cannot access bucket. Check permissions."
fi

echo ""
echo "📋 Next steps:"
echo "1. Copy the AWS configuration above to backend/.env"
echo "2. If secret key is not shown, get it from AWS Console:"
echo "   https://console.aws.amazon.com/iam/ -> Users -> Security Credentials"
echo "3. Test with: node backend/src/tests/test-weather-service.js"

