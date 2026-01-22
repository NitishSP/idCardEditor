const { BrowserWindow, session } = require('electron');
const path = require('path');
const url = require('url');
const config = require('../../config');
const logger = require('../utils/logger');

/**
 * Main window manager
 */
class MainWindowManager {
  constructor() {
    this.mainWindow = null;
  }

  /**
   * Create the main application window
   */
  createMainWindow() {
    this.mainWindow = new BrowserWindow({
      title: 'ID Card Printing System',
      width: 1280,
      height: 800,
      webPreferences: {
        nodeIntegration: false, // Security: disabled
        contextIsolation: true,
        preload: path.join(__dirname, '../../preload.js'),
        sandbox: true, // Security: enabled
        webSecurity: true // Security: enabled
      }
    });

    // Set Content Security Policy
    this._setupContentSecurityPolicy();

    // Load the application
    this._loadApplication();

    // Open DevTools in development mode
    if (config.isDevelopment()) {
      this.mainWindow.webContents.openDevTools();
    }

    logger.info('Main window created');
    return this.mainWindow;
  }

  /**
   * Setup Content Security Policy headers
   */
  _setupContentSecurityPolicy() {
    session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
      callback({
        responseHeaders: {
          ...details.responseHeaders,
          'Content-Security-Policy': [
            "default-src 'self'; " +
            "script-src 'self' 'unsafe-inline'; " +
            "style-src 'self' 'unsafe-inline'; " +
            "img-src 'self' data: blob:; " +
            "font-src 'self' data:; " +
            "connect-src 'self'"
          ]
        }
      });
    });
  }

  /**
   * Load the application into the window
   */
  _loadApplication() {
    const startUrl = url.format({
      pathname: path.join(__dirname, '../../Id_Card_Frontend/dist/index.html'),
      protocol: 'file:'
    });

    // this.mainWindow.loadURL(startUrl);
    // this.mainWindow.loadURL("http://localhost:5173");
  }

  /**
   * Get the main window instance
   */
  getMainWindow() {
    return this.mainWindow;
  }
}

module.exports = new MainWindowManager();
