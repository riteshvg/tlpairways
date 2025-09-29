# 🚀 Adobe Experience Platform API Helper

A convenient terminal script to interact with Adobe Experience Platform APIs without needing Postman.

## 📋 Quick Start

### 1. Make Script Executable (if not already done)
```bash
chmod +x adobe-api-helper.sh
```

### 2. Basic Usage
```bash
./adobe-api-helper.sh [COMMAND] [ARGUMENTS]
```

## 🔧 Available Commands

### **List Available Sandboxes**
```bash
./adobe-api-helper.sh sandboxes
```
- **Purpose:** Get all sandboxes you have access to
- **Headers Used:** Authorization, x-api-key, x-gw-ims-org-id
- **Note:** Does NOT include x-sandbox-name header

### **Get Batch Information**
```bash
./adobe-api-helper.sh batch <BATCH_ID> [SANDBOX_NAME]
```
- **Example:** `./adobe-api-helper.sh batch 01K5JSCT5RNRATHCMR9C0FJ9MG`
- **Example with override:** `./adobe-api-helper.sh batch 01K5JSCT5RNRATHCMR9C0FJ9MG production`
- **Purpose:** Get details about a specific batch
- **Requires:** Batch ID (sandbox name optional if DEFAULT_SANDBOX is configured)

### **Get Failed Batch Files**
```bash
./adobe-api-helper.sh failed <BATCH_ID> [SANDBOX_NAME]
```
- **Example:** `./adobe-api-helper.sh failed 01K5JSCT5RNRATHCMR9C0FJ9MG`
- **Example with override:** `./adobe-api-helper.sh failed 01K5JSCT5RNRATHCMR9C0FJ9MG production`
- **Purpose:** Get list of failed files in a batch
- **Requires:** Batch ID (sandbox name optional if DEFAULT_SANDBOX is configured)

### **List Available Datasets**
```bash
./adobe-api-helper.sh datasets [SANDBOX_NAME]
```
- **Example:** `./adobe-api-helper.sh datasets`
- **Example with override:** `./adobe-api-helper.sh datasets production`
- **Purpose:** Get all datasets in a sandbox
- **Requires:** None (uses DEFAULT_SANDBOX) or exact sandbox name

### **Show Current Configuration**
```bash
./adobe-api-helper.sh config
```
- **Purpose:** Display current API credentials and default sandbox
- **Shows:** API Key (masked), Org ID, Default Sandbox, Access Token info

### **Test API Connection**
```bash
./adobe-api-helper.sh test
```
- **Purpose:** Test the API connection with default sandbox
- **Uses:** DEFAULT_SANDBOX configuration

### **Show Help**
```bash
./adobe-api-helper.sh help
```

## 🎯 Typical Workflow

### Step 1: Find Your Sandboxes
```bash
./adobe-api-helper.sh sandboxes
```
**Expected Response:**
```json
{
  "sandboxes": [
    {
      "name": "production",
      "title": "Production",
      "state": "active",
      "type": "production"
    },
    {
      "name": "dev",
      "title": "Development", 
      "state": "active",
      "type": "development"
    }
  ]
}
```

### Step 2: Get Batch Information
```bash
./adobe-api-helper.sh batch 01K5JSCT5RNRATHCMR9C0FJ9MG production
```

### Step 3: Check Failed Files (if needed)
```bash
./adobe-api-helper.sh failed 01K5JSCT5RNRATHCMR9C0FJ9MG production
```

## 🔧 Configuration

The script is pre-configured with your credentials:
- **ACCESS_TOKEN:** Your Adobe access token
- **API_KEY:** Your Adobe API key  
- **ORG_ID:** Your Adobe organization ID
- **DEFAULT_SANDBOX:** Your preferred sandbox name (makes sandbox parameter optional)

To update credentials, edit the variables at the top of `adobe-api-helper.sh`:
```bash
ACCESS_TOKEN="your_new_token_here"
API_KEY="your_new_api_key_here"
ORG_ID="your_new_org_id_here"
DEFAULT_SANDBOX="your_preferred_sandbox_name"
```

### **Sandbox Configuration Benefits:**
- ✅ **Optional Parameters:** Commands work without specifying sandbox name
- ✅ **Consistent Usage:** Always use the same sandbox unless overridden
- ✅ **Quick Commands:** Shorter command syntax for common operations
- ✅ **Easy Switching:** Override default by providing sandbox name when needed

## 📊 Expected Responses

### **Successful Sandbox List:**
```json
{
  "sandboxes": [
    {
      "name": "production",
      "title": "Production",
      "state": "active",
      "type": "production"
    }
  ]
}
```

### **Successful Batch Files:**
```json
{
  "data": [
    {
      "name": "_SUCCESS",
      "length": "0",
      "_links": {
        "self": {
          "href": "https://platform.adobe.io:443/data/foundation/export/batches/01K5JSCT5RNRATHCMR9C0FJ9MG/failed?path=_SUCCESS"
        }
      }
    },
    {
      "name": "part-00000-44c7b669-5e38-43fb-b56c-a0686dabb982-c000.json",
      "length": "1800",
      "_links": {
        "self": {
          "href": "https://platform.adobe.io:443/data/foundation/export/batches/01K5JSCT5RNRATHCMR9C0FJ9MG/failed?path=part-00000-44c7b669-5e38-43fb-b56c-a0686dabb982-c000.json"
        }
      }
    }
  ],
  "_page": {
    "limit": 100,
    "count": 2
  }
}
```

## 🚨 Troubleshooting

### **Empty Sandboxes Response:**
- Check if you have any sandboxes created in Adobe Experience Platform UI
- Verify your API credentials have proper permissions
- Ensure your organization has sandbox access enabled

### **Batch Not Found:**
- Verify the batch ID exists in the specified sandbox
- Try different sandbox names from your sandboxes list
- Check if the batch is in a different sandbox

### **Permission Errors:**
- Ensure your access token has the required scopes
- Verify you have access to the specific sandbox
- Check if your API key has the necessary permissions

## 🎨 Features

- ✅ **Color-coded output** for better readability
- ✅ **Automatic JSON formatting** (if jq is installed)
- ✅ **Proper error handling** with helpful messages
- ✅ **Pre-configured headers** for Adobe Platform API
- ✅ **Sandbox-aware requests** with proper header management
- ✅ **Multiple API endpoints** in one script

## 🔄 Extending the Script

To add new API endpoints, add new functions and cases:

```bash
# Add new function
new_api_call() {
    local param="$1"
    local sandbox_name="$2"
    make_request "$BASE_URL/your/endpoint" "GET" "$sandbox_name"
}

# Add new case in main logic
"newcommand")
    new_api_call "$2" "$3"
    ;;
```

This script replaces the need for Postman configuration and provides a streamlined way to interact with Adobe Experience Platform APIs directly from your terminal! 🚀
