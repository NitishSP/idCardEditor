const { ipcMain } = require('electron');
const { rateLimitMiddleware, errorHandlerMiddleware } = require('../middleware');
const response = require('../utils/response');
const logger = require('../utils/logger');

/**
 * System IPC handler
 */
class SystemHandler {
  /**
   * Register system-related IPC handler
   */
  register() {
    ipcMain.handle('system:clearAllData',
      rateLimitMiddleware.apply('system:clearAllData',
        errorHandlerMiddleware.wrap(this.handleClearAllData.bind(this), 'System clear all data')
      )
    );
  }

  /**
   * Handle clear all data
   */
  async handleClearAllData() {
    const db = require('../../Database');
    await db.clearAllData();
    logger.info('All system data cleared and reseeded');
    return response.success(null, 'All data cleared successfully');
  }
}

module.exports = new SystemHandler();
