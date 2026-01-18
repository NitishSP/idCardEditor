const { ipcMain } = require('electron');
const developerService = require('../services/developer.service');
const { errorHandlerMiddleware } = require('../middleware');
const response = require('../utils/response');

/**
 * Developer panel IPC handlers
 * WARNING: These provide root-level access to database operations
 */
class DeveloperHandlers {
  /**
   * Register all developer-related IPC handlers
   */
  register() {
    ipcMain.handle('developer:getDatabaseInfo',
      errorHandlerMiddleware.wrap(this.handleGetDatabaseInfo.bind(this), 'Developer get database info')
    );

    ipcMain.handle('developer:backupDB',
      errorHandlerMiddleware.wrap(this.handleBackupDB.bind(this), 'Developer backup DB')
    );

    ipcMain.handle('developer:cleanDB',
      errorHandlerMiddleware.wrap(this.handleCleanDB.bind(this), 'Developer clean DB')
    );

    ipcMain.handle('developer:reinitDB',
      errorHandlerMiddleware.wrap(this.handleReinitDB.bind(this), 'Developer reinit DB')
    );

    ipcMain.handle('developer:exportLogs',
      errorHandlerMiddleware.wrap(this.handleExportLogs.bind(this), 'Developer export logs')
    );

    ipcMain.handle('developer:getAllCredentials',
      errorHandlerMiddleware.wrap(this.handleGetAllCredentials.bind(this), 'Developer get all credentials')
    );

    ipcMain.handle('developer:createCredential',
      errorHandlerMiddleware.wrap(this.handleCreateCredential.bind(this), 'Developer create credential')
    );

    ipcMain.handle('developer:deleteCredential',
      errorHandlerMiddleware.wrap(this.handleDeleteCredential.bind(this), 'Developer delete credential')
    );
  }

  /**
   * Handle get database info
   */
  async handleGetDatabaseInfo() {
    const info = developerService.getDatabaseInfo();
    return response.success(info);
  }

  /**
   * Handle backup database
   */
  async handleBackupDB() {
    const result = await developerService.backupDatabase();
    return result;
  }

  /**
   * Handle clean database
   */
  async handleCleanDB() {
    const result = await developerService.cleanDatabase();
    return result;
  }

  /**
   * Handle reinitialize database
   */
  async handleReinitDB() {
    const result = await developerService.reinitializeDatabase();
    return result;
  }

  /**
   * Handle export logs
   */
  async handleExportLogs() {
    const result = await developerService.exportLogs();
    return result;
  }

  /**
   * Handle get all credentials
   */
  async handleGetAllCredentials() {
    const credentials = developerService.getAllCredentials();
    return response.success(credentials);
  }

  /**
   * Handle create credential
   */
  async handleCreateCredential(event, { username, password }) {
    const result = await developerService.createCredential(username, password);
    return response.success(result);
  }

  /**
   * Handle delete credential
   */
  async handleDeleteCredential(event, { id }) {
    const result = developerService.deleteCredential(id);
    return result;
  }
}

module.exports = new DeveloperHandlers();
