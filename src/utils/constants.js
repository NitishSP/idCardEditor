/**
 * Application-wide constants
 */

// Resource types for logging and error messages
const RESOURCES = {
  AUTH: 'Credential',
  USER: 'User',
  TEMPLATE: 'Template',
  FIELD: 'Predefined Field',
  BACKUP: 'Backup'
};

// Field types
const FIELD_TYPES = {
  PHOTO: 'photo',
};

// Special field labels that require protection
const PROTECTED_FIELDS = {
  PHOTO: 'Photo',
  PROFILE_PHOTO: 'Profile Photo'
};

// Default card dimensions (in mm)
const CARD_DIMENSIONS = {
  DEFAULT_WIDTH: 85.6,
  DEFAULT_HEIGHT: 54
};

// Rate limiting defaults
const RATE_LIMIT = {
  WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  MAX_REQUESTS: 100
};

// Validation constants
const VALIDATION = {
  USERNAME_MIN_LENGTH: 3,
  USERNAME_MAX_LENGTH: 50,
  PASSWORD_MIN_LENGTH: 6,
  PASSWORD_MAX_LENGTH: 100,
  FIELD_LABEL_MAX_LENGTH: 100
};

module.exports = {
  RESOURCES,
  FIELD_TYPES,
  PROTECTED_FIELDS,
  CARD_DIMENSIONS,
  RATE_LIMIT,
  VALIDATION
};
