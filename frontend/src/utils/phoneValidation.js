/**
 * Indian Phone Number Validation Utility
 * Validates 10-digit Indian mobile numbers
 * Pattern: Exactly 10 digits, no spaces, no country code
 */

/**
 * Validates if a phone number is a valid 10-digit Indian mobile number
 * @param {string} phone - Phone number to validate
 * @returns {boolean} - True if valid, false otherwise
 */
export const isValidIndianPhone = (phone) => {
  if (!phone) return false;
  const phoneRegex = /^[0-9]{10}$/;
  return phoneRegex.test(phone.trim());
};

/**
 * Validates phone number and returns validation result with error message
 * @param {string} phone - Phone number to validate
 * @returns {object} - { isValid: boolean, error: string | null }
 */
export const validateIndianPhone = (phone) => {
  if (!phone || phone.trim() === "") {
    return {
      isValid: false,
      error: "Phone number is required"
    };
  }

  const trimmedPhone = phone.trim();
  
  // Check if it contains only digits
  if (!/^[0-9]*$/.test(trimmedPhone)) {
    return {
      isValid: false,
      error: "Phone number must contain only digits"
    };
  }

  // Check if it's exactly 10 digits
  if (trimmedPhone.length !== 10) {
    return {
      isValid: false,
      error: "Enter a valid 10-digit Indian mobile number"
    };
  }

  return {
    isValid: true,
    error: null
  };
};

/**
 * Sanitizes phone input by removing non-digit characters
 * @param {string} phone - Phone number to sanitize
 * @returns {string} - Sanitized phone number (digits only)
 */
export const sanitizePhoneInput = (phone) => {
  return phone.replace(/[^0-9]/g, "").slice(0, 10);
};
