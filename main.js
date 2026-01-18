const { app, BrowserWindow } = require('electron');
const logger = require('./src/utils/logger');
const config = require('./config');
const mainWindowManager = require('./src/window/mainWindow');
const { registerAllHandlers } = require('./src/handlers');
const db = require('./Database');

/**
 * Main entry point for the Electron application
 * Production-grade architecture with clean separation of concerns
 */

// Initialize database tables when app is ready
app.whenReady().then(() => {
  logger.info(`Application starting - Version ${config.appVersion} - Environment: ${config.nodeEnv}`);

  // Initialize database tables
  initializeDatabase();

  // Register all IPC handlers
  registerAllHandlers();

  // Create main window
  mainWindowManager.createMainWindow();

  // Handle macOS activation
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      mainWindowManager.createMainWindow();
    }
  });
});


function initializeDatabase() {
  try {
    // Database is already initialized in Database.js constructor
    logger.info('Database initialized successfully');
  } catch (error) {
    logger.error('Database initialization error:', error);
    app.quit();
  }
}

/**
 * Quit when all windows are closed (except on macOS)
 */
app.on('window-all-closed', () => {
  logger.info('All windows closed');
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

/**
 * Handle uncaught exceptions
 */
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
});

/**
 * Handle unhandled promise rejections
 */
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
