const validationService = require('../../ValidationService');
const response = require('../utils/response');
const logger = require('../utils/logger');

/**
 * Validation middleware for IPC handlers
 * Provides reusable validation wrappers
 */
class ValidationMiddleware {
  /**
   * Validate ID parameter
   */
  validateId(id) {
    try {
      validationService.validateId(id);
      return { valid: true };
    } catch (error) {
      logger.error(`ID validation failed: ${error.message}`);
      return { valid: false, error: error.message };
    }
  }

  /**
   * Validate username
   */
  validateUsername(username) {
    try {
      validationService.validateUsername(username);
      return { valid: true };
    } catch (error) {
      logger.error(`Username validation failed: ${error.message}`);
      return { valid: false, error: error.message };
    }
  }

  /**
   * Validate password
   */
  validatePassword(password) {
    try {
      validationService.validatePassword(password);
      return { valid: true };
    } catch (error) {
      logger.error(`Password validation failed: ${error.message}`);
      return { valid: false, error: error.message };
    }
  }

  /**
   * Validate field data
   */
  validateField(fieldData) {
    try {
      const validated = validationService.validateField(fieldData);
      return { valid: true, data: validated };
    } catch (error) {
      logger.error(`Field validation failed: ${error.message}`);
      return { valid: false, error: error.message };
    }
  }

  /**
   * Validate template data
   */
  validateTemplate(templateData) {
    try {
      const validated = validationService.validateTemplate(templateData);
      return { valid: true, data: validated };
    } catch (error) {
      logger.error(`Template validation failed: ${error.message}`);
      return { valid: false, error: error.message };
    }
  }

  /**
   * Validate user data dynamically based on fields
   */
  validateUserDynamic(userData, fields) {
    try {
      const validated = validationService.validateUserDynamic(userData, fields);
      return { valid: true, data: validated };
    } catch (error) {
      logger.error(`User validation failed: ${error.message}`);
      return { valid: false, error: error.message };
    }
  }
}

module.exports = new ValidationMiddleware();
