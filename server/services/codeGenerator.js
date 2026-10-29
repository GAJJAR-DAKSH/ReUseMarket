const crypto = require('crypto');

/**
 * Generates a random 6-digit one-time verification code for in-person handover
 */
const generateHandoverCode = () => {
  return crypto.randomInt(100000, 999999).toString();
};

/**
 * Generates a secure random 32-byte hex token for email verification and password resets
 */
const generateRandomToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

module.exports = {
  generateHandoverCode,
  generateRandomToken
};

