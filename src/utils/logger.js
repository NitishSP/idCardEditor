const log = require('electron-log');
const path = require('path');
const { app } = require('electron');
const config = require('../../config');

/**
 * Centralized logging utility
 * Provides structured logging with proper configuration
 */
class Logger {
  constructor() {
    this.configure();
  }

  configure() {
    log.transports.file.level = config.logging.level;
    log.transports.console.level = config.logging.level;
    
    if (config.logging.fileEnabled) {
      log.transports.file.resolvePathFn = () => 
        path.join(app.getPath('userData'), 'logs', 'app.log');
    }
  }

  info(message, ...args) {
    log.info(message, ...args);
  }

  warn(message, ...args) {
    log.warn(message, ...args);
  }

  error(message, ...args) {
    log.error(message, ...args);
  }

  debug(message, ...args) {
    log.debug(message, ...args);
  }

  // Structured logging for specific events
  logAuthAttempt(username, success) {
    if (success) {
      this.info(`Successful login: ${username}`);
    } else {
      this.warn(`Failed login attempt: ${username}`);
    }
  }

  logResourceCreated(resource, identifier) {
    this.info(`${resource} created: ${identifier}`);
  }

  logResourceUpdated(resource, identifier) {
    this.info(`${resource} updated: ${identifier}`);
  }

  logResourceDeleted(resource, identifier) {
    this.info(`${resource} deleted: ${identifier}`);
  }

  logError(context, error) {
    this.error(`Error in ${context}:`, error);
  }
}

module.exports = new Logger();
