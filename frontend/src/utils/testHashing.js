// Test the hashing functionality
import { hashUserId, hashPhone, createHashedCustomerObject } from './hashingUtils';

// Test data
const testCustomerData = {
  userId: "deepak.patel0@rediffmail.com",
  email: "deepak.patel0@rediffmail.com", 
  phone: "650666803",
  loyaltyTier: "standard"
};

console.log('🔐 Testing SHA256 Hashing:');
console.log('Original Data:', testCustomerData);

// Test individual hashing
const hashedUserId = hashUserId(testCustomerData.userId);
const hashedPhone = hashPhone(testCustomerData.phone);

console.log('Hashed User ID:', hashedUserId);
console.log('Hashed Phone:', hashedPhone);

// Test complete customer object
const hashedCustomerObject = createHashedCustomerObject(testCustomerData);
console.log('Complete Hashed Customer Object:', hashedCustomerObject);

export { testCustomerData, hashedCustomerObject };
