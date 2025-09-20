#!/bin/bash

# Adobe Experience Platform API Helper Script
# This script helps you interact with Adobe Experience Platform APIs

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration - Update these with your credentials
ACCESS_TOKEN="YOUR_ADOBE_ACCESS_TOKEN_HERE"
API_KEY="0fd46c1903b647808c86182d39d7a159"
ORG_ID="0103FFA9573F6FF77F000101@AdobeOrg"

# Default Sandbox Configuration
# Set this to your preferred sandbox name, or leave empty to require it in commands
DEFAULT_SANDBOX="prod"

# Base URL for Adobe Platform API
BASE_URL="https://platform.adobe.io"

# Function to get sandbox name with fallback to default
get_sandbox_name() {
    local provided_sandbox="$1"
    
    if [ ! -z "$provided_sandbox" ]; then
        echo "$provided_sandbox"
    elif [ ! -z "$DEFAULT_SANDBOX" ]; then
        echo "$DEFAULT_SANDBOX"
    else
        echo ""
    fi
}

echo -e "${BLUE}🚀 Adobe Experience Platform API Helper${NC}"
echo -e "${BLUE}=====================================${NC}"
echo ""

# Function to make API requests with proper headers
make_request() {
    local url="$1"
    local method="${2:-GET}"
    local sandbox_name="$3"
    local additional_headers="$4"
    
    echo -e "${YELLOW}📡 Making $method request to: $url${NC}"
    
    # Build headers
    local headers=(
        -H "Authorization: Bearer $ACCESS_TOKEN"
        -H "x-api-key: $API_KEY"
        -H "x-gw-ims-org-id: $ORG_ID"
        -H "Content-Type: application/json"
        -H "Cache-Control: no-cache"
    )
    
    # Add sandbox name if provided
    if [ ! -z "$sandbox_name" ]; then
        headers+=(-H "x-sandbox-name: $sandbox_name")
        echo -e "${BLUE}🏖️  Using sandbox: $sandbox_name${NC}"
    fi
    
    # Add additional headers if provided
    if [ ! -z "$additional_headers" ]; then
        headers+=($additional_headers)
    fi
    
    echo ""
    echo -e "${GREEN}📋 Request Details:${NC}"
    echo "Method: $method"
    echo "URL: $url"
    echo "Sandbox: ${sandbox_name:-'None'}"
    echo ""
    
    # Make the request
    curl -X "$method" "$url" "${headers[@]}" | jq '.' 2>/dev/null || curl -X "$method" "$url" "${headers[@]}"
}

# Function to list available sandboxes
list_sandboxes() {
    echo -e "${GREEN}🔍 Step 1: Getting Available Sandboxes${NC}"
    echo -e "${GREEN}=======================================${NC}"
    
    make_request "$BASE_URL/data/foundation/sandbox-management/"
    
    echo ""
    echo -e "${YELLOW}💡 Note: Copy the exact sandbox name from above for the next steps${NC}"
}

# Function to get batch information
get_batch_info() {
    local batch_id="$1"
    local sandbox_name="$2"
    
    if [ -z "$batch_id" ]; then
        echo -e "${RED}❌ Error: Batch ID is required${NC}"
        echo "Usage: $0 batch <BATCH_ID> [SANDBOX_NAME]"
        echo "       Sandbox name is optional if DEFAULT_SANDBOX is configured"
        return 1
    fi
    
    # Get sandbox name with fallback to default
    local resolved_sandbox=$(get_sandbox_name "$sandbox_name")
    
    if [ -z "$resolved_sandbox" ]; then
        echo -e "${RED}❌ Error: Sandbox name is required${NC}"
        echo "Usage: $0 batch <BATCH_ID> <SANDBOX_NAME>"
        echo "       Or configure DEFAULT_SANDBOX in the script"
        return 1
    fi
    
    echo -e "${GREEN}📦 Step 2: Getting Batch Information${NC}"
    echo -e "${GREEN}=====================================${NC}"
    
    make_request "$BASE_URL/data/foundation/export/batches/$batch_id" "GET" "$resolved_sandbox"
}

# Function to get failed batch files
get_failed_batch_files() {
    local batch_id="$1"
    local sandbox_name="$2"
    
    if [ -z "$batch_id" ]; then
        echo -e "${RED}❌ Error: Batch ID is required${NC}"
        echo "Usage: $0 failed <BATCH_ID> [SANDBOX_NAME]"
        echo "       Sandbox name is optional if DEFAULT_SANDBOX is configured"
        return 1
    fi
    
    # Get sandbox name with fallback to default
    local resolved_sandbox=$(get_sandbox_name "$sandbox_name")
    
    if [ -z "$resolved_sandbox" ]; then
        echo -e "${RED}❌ Error: Sandbox name is required${NC}"
        echo "Usage: $0 failed <BATCH_ID> <SANDBOX_NAME>"
        echo "       Or configure DEFAULT_SANDBOX in the script"
        return 1
    fi
    
    echo -e "${GREEN}❌ Step 3: Getting Failed Batch Files${NC}"
    echo -e "${GREEN}======================================${NC}"
    
    make_request "$BASE_URL/data/foundation/export/batches/$batch_id/failed" "GET" "$resolved_sandbox"
}

# Function to list datasets
list_datasets() {
    local sandbox_name="$1"
    
    # Get sandbox name with fallback to default
    local resolved_sandbox=$(get_sandbox_name "$sandbox_name")
    
    if [ -z "$resolved_sandbox" ]; then
        echo -e "${RED}❌ Error: Sandbox name is required${NC}"
        echo "Usage: $0 datasets [SANDBOX_NAME]"
        echo "       Sandbox name is optional if DEFAULT_SANDBOX is configured"
        return 1
    fi
    
    echo -e "${GREEN}📊 Getting Available Datasets${NC}"
    echo -e "${GREEN}=============================${NC}"
    
    make_request "$BASE_URL/data/foundation/catalog/dataSets" "GET" "$resolved_sandbox"
}

# Function to show help
show_help() {
    echo -e "${BLUE}📚 Adobe Experience Platform API Helper${NC}"
    echo -e "${BLUE}=====================================${NC}"
    echo ""
    echo -e "${GREEN}Available Commands:${NC}"
    echo ""
    echo -e "${YELLOW}  sandboxes${NC}                    - List all available sandboxes"
    echo -e "${YELLOW}  batch <BATCH_ID> [SANDBOX_NAME]${NC} - Get batch information"
    echo -e "${YELLOW}  failed <BATCH_ID> [SANDBOX_NAME]${NC} - Get failed batch files"
    echo -e "${YELLOW}  datasets [SANDBOX_NAME]${NC}       - List available datasets"
    echo -e "${YELLOW}  test${NC}                         - Test API connection"
    echo -e "${YELLOW}  config${NC}                       - Show current configuration"
    echo -e "${YELLOW}  help${NC}                         - Show this help message"
    echo ""
    echo -e "${GREEN}Examples:${NC}"
    echo "  $0 sandboxes"
    echo "  $0 batch 01K5JSCT5RNRATHCMR9C0FJ9MG"
    echo "  $0 batch 01K5JSCT5RNRATHCMR9C0FJ9MG production"
    echo "  $0 failed 01K5JSCT5RNRATHCMR9C0FJ9MG"
    echo "  $0 datasets"
    echo "  $0 datasets production"
    echo ""
    echo -e "${GREEN}Configuration:${NC}"
    echo "  Update ACCESS_TOKEN, API_KEY, ORG_ID, and DEFAULT_SANDBOX at the top of this script"
    echo "  DEFAULT_SANDBOX: Set to your preferred sandbox to make it optional in commands"
    echo ""
}

# Main script logic
case "$1" in
    "sandboxes")
        list_sandboxes
        ;;
    "batch")
        get_batch_info "$2" "$3"
        ;;
    "failed")
        get_failed_batch_files "$2" "$3"
        ;;
    "datasets")
        list_datasets "$2"
        ;;
    "test")
        echo -e "${GREEN}🧪 Testing Adobe Platform API Connection${NC}"
        echo -e "${GREEN}======================================${NC}"
        echo ""
        echo -e "${YELLOW}Testing with a sample batch ID...${NC}"
        echo ""
        # Test with a sample batch ID and sandbox
        make_request "$BASE_URL/data/foundation/export/batches/test-batch-id" "GET" "$DEFAULT_SANDBOX"
        ;;
    "config")
        echo -e "${GREEN}⚙️  Current Configuration${NC}"
        echo -e "${GREEN}=======================${NC}"
        echo ""
        echo -e "${YELLOW}API Key:${NC} ${API_KEY:0:8}..."
        echo -e "${YELLOW}Org ID:${NC} $ORG_ID"
        echo -e "${YELLOW}Default Sandbox:${NC} ${DEFAULT_SANDBOX:-'Not configured'}"
        echo -e "${YELLOW}Access Token:${NC} ${ACCESS_TOKEN:0:20}... (${#ACCESS_TOKEN} chars)"
        echo ""
        echo -e "${BLUE}💡 To update configuration, edit the variables at the top of this script${NC}"
        ;;
    "help"|"-h"|"--help"|"")
        show_help
        ;;
    *)
        echo -e "${RED}❌ Unknown command: $1${NC}"
        echo ""
        show_help
        exit 1
        ;;
esac

echo ""
echo -e "${BLUE}✅ Script completed${NC}"
