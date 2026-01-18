/**
 * Rate Limiter
 * Prevents abuse by limiting the number of requests per time window
 */

const log = require('electron-log');

class RateLimiter {
  constructor(windowMs = 15 * 60 * 1000, maxRequests = 100) {
    this.windowMs = windowMs; // Time window in milliseconds
    this.maxRequests = maxRequests; // Max requests per window
    this.requests = new Map(); // Store requests: channel -> timestamps[]
  }

  /**
   * Check if a request should be allowed
   * @param {string} channel - The IPC channel name
   * @returns {boolean} - True if request is allowed, false if rate limited
   */
  checkLimit(channel) {
    const now = Date.now();
    const channelKey = channel || 'default';

    // Get existing timestamps for this channel
    let timestamps = this.requests.get(channelKey) || [];

    // Remove timestamps outside the current window
    timestamps = timestamps.filter(timestamp => now - timestamp < this.windowMs);

    // Check if limit exceeded
    if (timestamps.length >= this.maxRequests) {
      log.warn(`Rate limit exceeded for channel: ${channelKey} (${timestamps.length}/${this.maxRequests} requests)`);
      return false;
    }

    // Add current timestamp
    timestamps.push(now);
    this.requests.set(channelKey, timestamps);

    return true;
  }

  /**
   * Get current request count for a channel
   * @param {string} channel - The IPC channel name
   * @returns {number} - Number of requests in current window
   */
  getRequestCount(channel) {
    const now = Date.now();
    const channelKey = channel || 'default';
    const timestamps = this.requests.get(channelKey) || [];
    
    // Count only timestamps within the current window
    return timestamps.filter(timestamp => now - timestamp < this.windowMs).length;
  }

  /**
   * Reset rate limit for a channel
   * @param {string} channel - The IPC channel name
   */
  reset(channel) {
    const channelKey = channel || 'default';
    this.requests.delete(channelKey);
    log.info(`Rate limit reset for channel: ${channelKey}`);
  }

  /**
   * Reset all rate limits
   */
  resetAll() {
    this.requests.clear();
    log.info('All rate limits reset');
  }

  /**
   * Clean up old timestamps
   * Should be called periodically to prevent memory leaks
   */
  cleanup() {
    const now = Date.now();
    let cleanedCount = 0;

    for (const [channel, timestamps] of this.requests.entries()) {
      const validTimestamps = timestamps.filter(
        timestamp => now - timestamp < this.windowMs
      );

      if (validTimestamps.length === 0) {
        this.requests.delete(channel);
        cleanedCount++;
      } else if (validTimestamps.length < timestamps.length) {
        this.requests.set(channel, validTimestamps);
      }
    }

    if (cleanedCount > 0) {
      log.info(`Rate limiter cleanup: removed ${cleanedCount} inactive channels`);
    }
  }

  /**
   * Get statistics about rate limiting
   * @returns {Object} - Statistics object
   */
  getStats() {
    const now = Date.now();
    const stats = {
      totalChannels: this.requests.size,
      channels: {},
    };

    for (const [channel, timestamps] of this.requests.entries()) {
      const activeRequests = timestamps.filter(
        timestamp => now - timestamp < this.windowMs
      ).length;

      stats.channels[channel] = {
        requests: activeRequests,
        maxRequests: this.maxRequests,
        utilizationPercent: Math.round((activeRequests / this.maxRequests) * 100),
      };
    }

    return stats;
  }
}

module.exports = RateLimiter;
