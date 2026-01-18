/**
 * Application Configuration
 * Central configuration file for the ID Card System
 */

require('dotenv').config();
const path = require('path');

const config = {
  // Application Information
  appName: 'ID Card System',
  appVersion: '2.0.0',
  
  // Environment
  nodeEnv: process.env.NODE_ENV || 'production',
  
  // Development credentials (loaded from environment variables)
  // DEV USERS: Login only, NOT stored in database
  // CLIENT USERS: Seeded into database on first run
  devCredentials: {
    enabled: process.env.ENABLE_DEV_CREDENTIALS === 'true',
    devUsers: process.env.DEFAULT_DEV_USERS ? JSON.parse(process.env.DEFAULT_DEV_USERS) : [],
    clientUsers: process.env.DEFAULT_CLIENT_USERS ? JSON.parse(process.env.DEFAULT_CLIENT_USERS) : []
  },
  
  // Security Settings
  security: {
    bcryptRounds: 10,
    sessionTimeout: 30 * 60 * 1000, // 30 minutes
    maxLoginAttempts: 5,
    lockoutDuration: 15 * 60 * 1000, // 15 minutes
  },
  
  // Rate Limiting
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100, // Max requests per window
  },
  
  // Database Settings
  database: {
    filename: 'idcard.db',
    backupInterval: 24 * 60 * 60 * 1000, // 24 hours
    maxBackups: 7,
  },
  
  // Logging Configuration
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    fileEnabled: true,
    consoleEnabled: true,
  },
  
  // Backup Configuration
  backup: {
    autoBackupEnabled: true,
    autoBackupInterval: 24 * 60 * 60 * 1000, // 24 hours
    maxBackupsToKeep: 7,
    compressionEnabled: true,
  },
  
  // Window Configuration
  window: {
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 600,
  },
  
  // Development Settings
  devTools: {
    enabled: process.env.NODE_ENV === 'development',
    openOnStart: false,
  },
  
  // Helper Functions
  isDevelopment() {
    return this.nodeEnv === 'development';
  },
  
  isProduction() {
    return this.nodeEnv === 'production';
  },
  
  isTesting() {
    return this.nodeEnv === 'test';
  },
};

module.exports = config;
