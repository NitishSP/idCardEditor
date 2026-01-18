const authRepository = require('../repositories/auth.repository');
const config = require('../../config');
const logger = require('../utils/logger');
const { RESOURCES } = require('../utils/constants');

/**
 * Authentication service
 * Contains business logic for authentication
 */
class AuthService {
  /**
   * Authenticate user with username and password
   */
  async login(username, password) {
    // Check DEV USERS first (plain text, NOT in database)
    if (config.devCredentials.enabled && config.devCredentials.devUsers) {
      const devUser = config.devCredentials.devUsers.find(
        u => u.username === username && u.password === password
      );
      if (devUser) {
        logger.logAuthAttempt(username, true);
        return { id: 'dev', username };
      }
    }

    // Check database credentials (CLIENT USERS with bcrypt)
    const user = await authRepository.findByUsername(username);
    if (!user) {
      logger.logAuthAttempt(username, false);
      return null;
    }

    const isValid = await authRepository.verifyPassword(username, password);
    if (!isValid) {
      logger.logAuthAttempt(username, false);
      return null;
    }

    logger.logAuthAttempt(username, true);
    return { id: user.id, username: user.username };
  }

  /**
   * Change user password
   */
  async changePassword(username, oldPassword, newPassword) {
    const user = await authRepository.findByUsername(username);
    if (!user) {
      throw new Error('User not found');
    }

    const isValid = await authRepository.verifyPassword(username, oldPassword);
    if (!isValid) {
      throw new Error('Current password is incorrect');
    }

    await authRepository.updatePassword(username, newPassword);
    logger.logResourceUpdated(RESOURCES.AUTH, username);
    return true;
  }

  /**
   * Get all credentials
   */
  getAllCredentials() {
    return authRepository.findAll();
  }

  /**
   * Create new credential
   */
  async createCredential(username, password) {
    const result = await authRepository.create(username, password);
    logger.logResourceCreated(RESOURCES.AUTH, username);
    return result;
  }

  /**
   * Update credential
   */
  async updateCredential(id, username, password) {
    await authRepository.update(id, username, password);
    logger.logResourceUpdated(RESOURCES.AUTH, `ID: ${id}`);
    return true;
  }

  /**
   * Delete credential
   */
  deleteCredential(id) {
    authRepository.delete(id);
    logger.logResourceDeleted(RESOURCES.AUTH, `ID: ${id}`);
    return true;
  }
}

module.exports = new AuthService();
