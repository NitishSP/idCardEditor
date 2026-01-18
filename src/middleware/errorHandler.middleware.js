const logger = require('../utils/logger');
const response = require('../utils/response');

/**
 * Error handling middleware for IPC handlers
 * Provides consistent error handling and logging
 */
class ErrorHandlerMiddleware {
  /**
   * Wrap an IPC handler with error handling
   * @param {Function} handler - Handler function to wrap
   * @param {string} context - Context for error logging
   * @returns {Function} Wrapped handler
   */
  wrap(handler, context) {
    return async (event, ...args) => {
      try {
        return await handler(event, ...args);
      } catch (error) {
        logger.logError(context, error);
        return response.error(error.message || `${context} failed`);
      }
    };
  }

  /**
   * Handle errors in service layer
   * @param {Error} error - Error to handle
   * @param {string} context - Context for error logging
   * @throws {Error} Re-throws the error after logging
   */
  handleServiceError(error, context) {
    logger.logError(context, error);
    throw error;
  }
}

module.exports = new ErrorHandlerMiddleware();
