import CryptoJS from 'crypto-js';

/**
 * Hash a string using SHA256 algorithm
 * @param {string} input - The string to hash
 * @returns {string} - SHA256 hash in hexadecimal format
 */
export const hashSHA256 = (input) => {
  if (!input || typeof input !== 'string') {
    console.warn('Invalid input for hashing:', input);
    return null;
  }
  
  try {
    const hash = CryptoJS.SHA256(input).toString(CryptoJS.enc.Hex);
    console.log('🔐 Hash generated:', { input: input.substring(0, 10) + '...', hash: hash.substring(0, 16) + '...' });
    return hash;
  } catch (error) {
    console.error('Error generating hash:', error);
    return null;
  }
};

/**
 * Hash user ID (email) using SHA256
 * @param {string} userId - The user ID/email to hash
 * @returns {string} - Hashed user ID
 */
export const hashUserId = (userId) => {
  return hashSHA256(userId);
};

/**
 * Hash phone number using SHA256
 * @param {string} phone - The phone number to hash
 * @returns {string} - Hashed phone number
 */
export const hashPhone = (phone) => {
  return hashSHA256(phone);
};

/**
 * Create hashed customer object with original and hashed values
 * @param {Object} customerData - Original customer data
 * @returns {Object} - Customer object with hashed values
 */
export const createHashedCustomerObject = (customerData) => {
  if (!customerData) {
    return null;
  }

  const hashedUserId = customerData.userId ? hashUserId(customerData.userId) : null;
  const hashedPhone = customerData.phone ? hashPhone(customerData.phone) : null;

  return {
    // Original values (for backward compatibility)
    userId: customerData.userId,
    email: customerData.email,
    phone: customerData.phone,
    loyaltyTier: customerData.loyaltyTier,
    
    // Hashed values for privacy
    userIdHash: hashedUserId,
    phoneHash: hashedPhone,
    
    // Additional metadata
    hashingTimestamp: new Date().toISOString(),
    hashingAlgorithm: 'SHA256'
  };
};
