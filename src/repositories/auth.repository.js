const db = require('./database');
const passwordService = require('../../PasswordService');
const logger = require('../utils/logger');

/**
 * Authentication repository
 * Handles all auth-related database operations
 */
class AuthRepository {
  /**
   * Initialize auth table
   */
  initializeTable() {
    db.exec(`
      CREATE TABLE IF NOT EXISTS auth (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    logger.info('Auth table initialized');
  }

  /**
   * Find user by username
   */
  findByUsername(username) {
    return db.get(
      'SELECT id, username, password FROM auth WHERE username = ?',
      [username]
    );
  }

  /**
   * Find user by ID
   */
  findById(id) {
    return db.get(
      'SELECT id, username, createdAt, updatedAt FROM auth WHERE id = ?',
      [id]
    );
  }

  /**
   * Get all credentials (without passwords)
   */
  findAll() {
    return db.all(
      'SELECT id, username, createdAt, updatedAt FROM auth ORDER BY id ASC',
      []
    );
  }

  /**
   * Create new credential
   */
  async create(username, password) {
    const hashedPassword = await passwordService.hash(password);
    const result = db.execute(
      'INSERT INTO auth (username, password) VALUES (?, ?)',
      [username, hashedPassword]
    );
    return { id: result.lastInsertRowid };
  }

  /**
   * Update credential
   */
  async update(id, username, password) {
    const hashedPassword = await passwordService.hash(password);
    return db.execute(
      'UPDATE auth SET username = ?, password = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
      [username, hashedPassword, id]
    );
  }

  /**
   * Update password only
   */
  async updatePassword(username, newPassword) {
    const hashedPassword = await passwordService.hash(newPassword);
    return db.execute(
      'UPDATE auth SET password = ?, updatedAt = CURRENT_TIMESTAMP WHERE username = ?',
      [hashedPassword, username]
    );
  }

  /**
   * Delete credential
   */
  delete(id) {
    return db.execute('DELETE FROM auth WHERE id = ?', [id]);
  }

  /**
   * Verify password
   */
  async verifyPassword(username, password) {
    const user = this.findByUsername(username);
    if (!user) return false;
    
    return await passwordService.verify(password, user.password);
  }

  /**
   * Delete all credentials
   */
  deleteAll() {
    return db.exec('DELETE FROM auth');
  }
}

module.exports = new AuthRepository();
