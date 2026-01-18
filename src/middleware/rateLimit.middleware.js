const RateLimiter = require('../../RateLimiter');
const logger = require('../utils/logger');
const response = require('../utils/response');
const { RATE_LIMIT } = require('../utils/constants');

/**
 * Rate limiting middleware for IPC handlers
 * Prevents abuse by limiting requests per time window
 */
class RateLimitMiddleware {
  constructor() {
    this.rateLimiter = new RateLimiter(
      RATE_LIMIT.WINDOW_MS,
      RATE_LIMIT.MAX_REQUESTS
    );

    // Cleanup rate limiter every 5 minutes
    setInterval(() => this.rateLimiter.cleanup(), 5 * 60 * 1000);
  }

  /**
   * Wrap an IPC handler with rate limiting
   * @param {string} channel - IPC channel name
   * @param {Function} handler - Handler function to wrap
   * @returns {Function} Wrapped handler
   */
  apply(channel, handler) {
    return async (event, ...args) => {
      if (!this.rateLimiter.checkLimit(channel)) {
        logger.warn(`Rate limit exceeded for channel: ${channel}`);
        return response.error('Rate limit exceeded. Please try again later.');
      }
      return handler(event, ...args);
    };
  }

  /**
   * Get rate limiter instance
   */
  getInstance() {
    return this.rateLimiter;
  }
}

module.exports = new RateLimitMiddleware();
