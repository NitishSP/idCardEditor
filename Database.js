const Database = require('better-sqlite3');
const path = require('path');
const { app } = require('electron');
const log = require('electron-log');
const passwordService = require('./PasswordService');
const config = require('./config');

class DatabaseManager {
  constructor() {
    // Store database in userData directory
    const dbPath = path.join(app.getPath('userData'), 'idcard.db');
    log.info('Database path:', dbPath);
    this.db = new Database(dbPath);
    this.db.pragma('journal_mode = WAL'); // Better performance
    this.initializeTables();
    this.seedDefaultData();
  }

  initializeTables() {
    // Auth table - single admin user
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS auth (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Predefined Fields table - single source of truth for user fields AND template fields
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS predefined_fields (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        label TEXT UNIQUE NOT NULL,
        defaultValue TEXT,
        fieldType TEXT DEFAULT 'text',
        isRequired INTEGER DEFAULT 0,
        isActive INTEGER DEFAULT 1,
        displayOrder INTEGER DEFAULT 0,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Add isRequired column if it doesn't exist (migration for existing databases)
    try {
      const columns = this.db.prepare("PRAGMA table_info(predefined_fields)").all();
      const hasIsRequired = columns.some(col => col.name === 'isRequired');
      
      if (!hasIsRequired) {
        log.info('Adding isRequired column to predefined_fields table...');
        this.db.exec('ALTER TABLE predefined_fields ADD COLUMN isRequired INTEGER DEFAULT 0');
        log.info('isRequired column added successfully');
      }
    } catch (error) {
      log.error('Error checking/adding isRequired column:', error);
    }

    // Templates table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS templates (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        thumbnail TEXT,
        templateData TEXT NOT NULL,
        cardWidthMm REAL DEFAULT 85.6,
        cardHeightMm REAL DEFAULT 54,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Add card dimension columns if they don't exist (migration for existing databases)
    try {
      const columns = this.db.prepare("PRAGMA table_info(templates)").all();
      const hasCardWidthMm = columns.some(col => col.name === 'cardWidthMm');
      const hasCardHeightMm = columns.some(col => col.name === 'cardHeightMm');
      
      if (!hasCardWidthMm) {
        log.info('Adding cardWidthMm column to templates table...');
        this.db.exec('ALTER TABLE templates ADD COLUMN cardWidthMm REAL DEFAULT 85.6');
        log.info('cardWidthMm column added successfully');
      }
      
      if (!hasCardHeightMm) {
        log.info('Adding cardHeightMm column to templates table...');
        this.db.exec('ALTER TABLE templates ADD COLUMN cardHeightMm REAL DEFAULT 54');
        log.info('cardHeightMm column added successfully');
      }
    } catch (error) {
      log.error('Error checking/adding card dimension columns:', error);
    }

    // Users table with compulsory fields
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        photo TEXT NOT NULL,
        additionalData TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Migration: Remove old email column if it exists
    try {
      const userColumns = this.db.prepare("PRAGMA table_info(users)").all();
      const hasEmailColumn = userColumns.some(col => col.name === 'email');
      
      if (hasEmailColumn) {
        log.info('Removing deprecated email column from users table...');
        
        // SQLite doesn't support DROP COLUMN directly, need to recreate table
        this.db.exec('BEGIN TRANSACTION');
        
        // Create new table without email
        this.db.exec(`
          CREATE TABLE users_new (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            photo TEXT NOT NULL,
            additionalData TEXT,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `);
        
        // Copy data (excluding email column)
        this.db.exec(`
          INSERT INTO users_new (id, photo, additionalData, createdAt, updatedAt)
          SELECT id, photo, additionalData, createdAt, updatedAt
          FROM users
        `);
        
        // Drop old table and rename new one
        this.db.exec('DROP TABLE users');
        this.db.exec('ALTER TABLE users_new RENAME TO users');
        
        this.db.exec('COMMIT');
        log.info('Email column removed successfully');
      }
    } catch (error) {
      log.error('Error during user table migration:', error);
      try {
        this.db.exec('ROLLBACK');
      } catch (rollbackError) {
        log.error('Rollback failed:', rollbackError);
      }
    }

    log.info('Database tables initialized');
  }

  async seedDefaultData() {
    try {
      // Create default users if they don't exist
      const existingUsers = this.db.prepare('SELECT username FROM auth').all();
      const existingUsernames = existingUsers.map(u => u.username);

      // Seed CLIENT USERS into database (production users)
      const clientUsers = config.devCredentials.clientUsers || [];
      
      if (clientUsers.length === 0 && existingUsernames.length === 0) {
        log.warn('⚠️  Or create admin user manually via Developer Panel');
      }

      // Insert client users that don't exist
      for (const user of clientUsers) {
        if (!existingUsernames.includes(user.username)) {
          const hashedPassword = await passwordService.hash(user.password);
          this.db.prepare('INSERT INTO auth (username, password) VALUES (?, ?)').run(user.username, hashedPassword);
          log.info(`Default client user created in DB: ${user.username}`);
        }
      }

      // Create default predefined fields if not exists
      this.seedDefaultFields();
    } catch (error) {
      log.error('Error seeding default data:', error);
      throw error;
    }
  }

  seedDefaultFields() {
    const fieldsExist = this.db.prepare('SELECT COUNT(*) as count FROM predefined_fields').get();
    if (fieldsExist.count === 0) {
      const fields = [
        { label: 'Profile Photo', defaultValue: '', fieldType: 'photo', isRequired: 1, displayOrder: 4 },
      ];

      const stmt = this.db.prepare(`
        INSERT INTO predefined_fields (label, defaultValue, fieldType, isRequired, displayOrder) 
        VALUES (?, ?, ?, ?, ?)
      `);

      for (const field of fields) {
        stmt.run(field.label, field.defaultValue, field.fieldType, field.isRequired, field.displayOrder);
      }
      log.info('Default predefined fields created');
    }
  }

  // Clear all data from all tables and reseed defaults
  async clearAllData() {
    let transactionActive = false;
    try {
      // Begin transaction
      this.db.exec('BEGIN TRANSACTION');
      transactionActive = true;

      // Delete all data from all tables
      this.db.exec('DELETE FROM users');
      this.db.exec('DELETE FROM templates');
      this.db.exec('DELETE FROM predefined_fields');
      this.db.exec('DELETE FROM auth');

      // Commit transaction
      this.db.exec('COMMIT');
      transactionActive = false;

      log.info('All data deleted from database tables');

      // Reseed default data (outside transaction)
      await this.seedDefaultData();

      log.info('Database reset complete - reseeded with default data');
      return true;
    } catch (error) {
      // Only rollback if transaction is still active
      if (transactionActive) {
        try {
          this.db.exec('ROLLBACK');
        } catch (rollbackError) {
          log.error('Rollback failed:', rollbackError);
        }
      }
      log.error('Error clearing all data:', error);
      throw error;
    }
  }

  // Close database connection
  close() {
    this.db.close();
  }
}

module.exports = new DatabaseManager();