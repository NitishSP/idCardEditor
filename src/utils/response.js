/**
 * Standardized response formatter for IPC handlers
 * Ensures consistent response structure across all handlers
 */
class ResponseHandler {
  /**
   * Success response
   * @param {*} data - Response data
   * @param {string} message - Optional success message
   */
  success(data = null, message = null) {
    const response = { success: true };
    if (data !== null) response.data = data;
    if (message) response.message = message;
    return response;
  }

  /**
   * Error response
   * @param {string|Error} error - Error message or Error object
   */
  error(error) {
    const errorMessage = error instanceof Error ? error.message : error;
    return {
      success: false,
      error: errorMessage
    };
  }

  /**
   * Validation error response
   * @param {string} field - Field that failed validation
   * @param {string} message - Validation error message
   */
  validationError(field, message) {
    return {
      success: false,
      error: message,
      field
    };
  }

  /**
   * Not found response
   * @param {string} resource - Resource type that was not found
   */
  notFound(resource) {
    return {
      success: false,
      error: `${resource} not found`
    };
  }

  /**
   * Unauthorized response
   */
  unauthorized(message = 'Unauthorized access') {
    return {
      success: false,
      error: message
    };
  }
}

module.exports = new ResponseHandler();
