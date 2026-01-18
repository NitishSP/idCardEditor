/**
 * Utility functions for mapping between field labels and database columns
 */

// Map of standard field labels to database column names
const FIELD_TO_DB_MAP = {
  'name': 'name',
  'employee id': 'empId',
  'age': 'age',
  'profile photo': 'photo',
};

/**
 * Get the database column name for a field label
 * @param {string} fieldLabel - The field label (e.g., "Employee ID")
 * @returns {string|null} - The database column name or null if not found
 */
export const getDbColumn = (fieldLabel) => {
  if (!fieldLabel) return null;
  const normalized = fieldLabel.toLowerCase().trim();
  return FIELD_TO_DB_MAP[normalized] || null;
};

/**
 * Get field value from user object dynamically
 * @param {object} user - The user object
 * @param {object} field - The field definition
 * @returns {any} - The field value
 */
export const getFieldValue = (user, field) => {
  if (!field || !user) return '';
  
  const dbColumn = getDbColumn(field.label);
  
  // If this field maps to a database column, get it from there
  if (dbColumn && user[dbColumn] !== undefined) {
    return user[dbColumn];
  }
  
  // Otherwise, get from additionalData
  return user.additionalData?.[field.label] || '';
};

/**
 * Set field value in user data object
 * @param {object} userData - The user data object to update
 * @param {object} field - The field definition
 * @param {any} value - The value to set
 */
export const setFieldValue = (userData, field, value) => {
  if (!field) return;
  
  const dbColumn = getDbColumn(field.label);
  
  // If this field maps to a database column, set it there
  if (dbColumn) {
    if (dbColumn === 'age') {
      userData[dbColumn] = parseInt(value) || 0;
    } else {
      userData[dbColumn] = value || '';
    }
  }
  
  // Always store in additionalData as well for consistency
  userData.additionalData[field.label] = value;
};

/**
 * Check if a field is a core database field
 * @param {object} field - The field definition
 * @returns {boolean}
 */
export const isCoreField = (field) => {
  if (!field) return false;
  return getDbColumn(field.label) !== null;
};

/**
 * Get all core field labels that map to database columns
 * @returns {string[]}
 */
export const getCoreFieldLabels = () => {
  return Object.keys(FIELD_TO_DB_MAP).map(key => {
    // Capitalize first letter of each word
    return key.split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  });
};
