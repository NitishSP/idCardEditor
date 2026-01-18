/**
 * Password Service
 * Handles password hashing and verification using bcrypt
 */

const bcrypt = require('bcryptjs');
const log = require('electron-log');
const config = require('./config');

class PasswordService {
  constructor() {
    this.saltRounds = config.security.bcryptRounds || 10;
  }

  /**
   * Hash a password using bcrypt
   * @param {string} password - Plain text password
   * @returns {Promise<string>} - Hashed password
   */
  async hash(password) {
    try {
      if (!password || typeof password !== 'string') {
        throw new Error('Invalid password provided');
      }
      
      const hashedPassword = await bcrypt.hash(password, this.saltRounds);
      return hashedPassword;
    } catch (error) {
      log.error('Password hashing error:', error);
      throw new Error('Failed to hash password');
    }
  }

  /**
   * Verify a password against a hash
   * @param {string} password - Plain text password
   * @param {string} hash - Hashed password to compare against
   * @returns {Promise<boolean>} - True if password matches
   */
  async verify(password, hash) {
    try {
      if (!password || typeof password !== 'string') {
        throw new Error('Invalid password provided');
      }
      
      if (!hash || typeof hash !== 'string') {
        throw new Error('Invalid hash provided');
      }
      
      const isMatch = await bcrypt.compare(password, hash);
      return isMatch;
    } catch (error) {
      log.error('Password verification error:', error);
      return false;
    }
  }

  /**
   * Check password strength
   * @param {string} password - Password to check
   * @returns {Object} - Strength analysis
   */
  checkStrength(password) {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    const checks = {
      length: password.length >= minLength,
      upperCase: hasUpperCase,
      lowerCase: hasLowerCase,
      numbers: hasNumbers,
      specialChar: hasSpecialChar,
    };
    
    const passedChecks = Object.values(checks).filter(Boolean).length;
    
    let strength = 'weak';
    if (passedChecks >= 4) strength = 'strong';
    else if (passedChecks >= 3) strength = 'medium';
    
    return {
      strength,
      checks,
      score: passedChecks,
      maxScore: 5,
    };
  }

  /**
   * Validate password meets minimum requirements
   * @param {string} password - Password to validate
   * @throws {Error} - If password doesn't meet requirements
   */
  validatePassword(password) {
    if (!password || typeof password !== 'string') {
      throw new Error('Password is required');
    }
    
    if (password.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }
    
    const strength = this.checkStrength(password);
    if (strength.score < 3) {
      throw new Error('Password is too weak. Include uppercase, lowercase, numbers, and special characters.');
    }
    
    return true;
  }
}

module.exports = new PasswordService();
