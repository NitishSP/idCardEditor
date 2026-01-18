const Database = require('better-sqlite3');
const path = require('path');
const { app } = require('electron');
const logger = require('../utils/logger');

/**
 * Base database connection manager
 * Provides a single instance of the database connection
 */
class DatabaseConnection {
  constructor() {
    if (DatabaseConnection.instance) {
      return DatabaseConnection.instance;
    }

    const dbPath = path.join(app.getPath('userData'), 'idcard.db');
    logger.info(`Initializing database at: ${dbPath}`);
    
    this.db = new Database(dbPath);
    this.db.pragma('journal_mode = WAL'); // Better performance
    
    DatabaseConnection.instance = this;
  }

  /**
   * Get database instance
   */
  getDatabase() {
    return this.db;
  }

  /**
   * Execute a query with automatic error handling
   */
  execute(query, params = []) {
    try {
      const stmt = this.db.prepare(query);
      return stmt.run(...params);
    } catch (error) {
      logger.error('Database execute error:', error);
      throw error;
    }
  }

  /**
   * Get a single row
   */
  get(query, params = []) {
    try {
      const stmt = this.db.prepare(query);
      return stmt.get(...params);
    } catch (error) {
      logger.error('Database get error:', error);
      throw error;
    }
  }

  /**
   * Get all rows
   */
  all(query, params = []) {
    try {
      const stmt = this.db.prepare(query);
      return stmt.all(...params);
    } catch (error) {
      logger.error('Database all error:', error);
      throw error;
    }
  }

  /**
   * Execute raw SQL (for schema changes)
   */
  exec(sql) {
    try {
      return this.db.exec(sql);
    } catch (error) {
      logger.error('Database exec error:', error);
      throw error;
    }
  }

  /**
   * Begin a transaction
   */
  beginTransaction() {
    return this.db.exec('BEGIN TRANSACTION');
  }

  /**
   * Commit a transaction
   */
  commit() {
    return this.db.exec('COMMIT');
  }

  /**
   * Rollback a transaction
   */
  rollback() {
    return this.db.exec('ROLLBACK');
  }

  /**
   * Close database connection
   */
  close() {
    this.db.close();
    DatabaseConnection.instance = null;
  }
}

module.exports = new DatabaseConnection();
