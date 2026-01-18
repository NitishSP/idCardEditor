const db = require('./database');
const logger = require('../utils/logger');

/**
 * Users repository
 * Handles all user-related database operations
 */
class UsersRepository {
  /**
   * Initialize users table
   */
  initializeTable() {
    db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        photo TEXT NOT NULL,
        additionalData TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    logger.info('Users table initialized');
  }

  /**
   * Get all users
   */
  findAll() {
    const users = db.all(
      'SELECT * FROM users ORDER BY createdAt DESC',
      []
    );
    
    return users.map(user => ({
      ...user,
      additionalData: user.additionalData ? JSON.parse(user.additionalData) : {}
    }));
  }

  /**
   * Get user by ID
   */
  findById(id) {
    const user = db.get('SELECT * FROM users WHERE id = ?', [id]);
    if (user && user.additionalData) {
      user.additionalData = JSON.parse(user.additionalData);
    }
    return user;
  }

  /**
   * Get user by employee ID
   */
  findByEmpId(empId) {
    const user = db.get('SELECT * FROM users WHERE empId = ?', [empId]);
    if (user && user.additionalData) {
      user.additionalData = JSON.parse(user.additionalData);
    }
    return user;
  }

  /**
   * Create new user
   */
  create(photo, additionalData = {}) {
 

    const result = db.execute(
      'INSERT INTO users (photo, additionalData) VALUES (?, ?)',
      [ photo, JSON.stringify(additionalData)]
    );
    return { id: result.lastInsertRowid };
  }

  /**
   * Update user
   */
  update(id, photo, additionalData = {}) {
    // Get existing user first
    const existingUser = this.findById(id);
    if (!existingUser) {
      throw new Error('User not found');
    }

    // Use existing values if new ones are not provided or are empty
    const updatedPhoto = photo || existingUser.photo;
    const updatedAdditionalData = additionalData || existingUser.additionalData;

    return db.execute(
      'UPDATE users SET photo = ?, additionalData = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
      [updatedPhoto, JSON.stringify(updatedAdditionalData), id]
    );
  }

  /**
   * Update user's additional data
   */
  updateAdditionalData(id, additionalData) {
    return db.execute(
      'UPDATE users SET additionalData = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
      [JSON.stringify(additionalData), id]
    );
  }

  /**
   * Delete user
   */
  delete(id) {
    return db.execute('DELETE FROM users WHERE id = ?', [id]);
  }

  /**
   * Delete all users
   */
  deleteAll() {
    return db.exec('DELETE FROM users');
  }
}

module.exports = new UsersRepository();
