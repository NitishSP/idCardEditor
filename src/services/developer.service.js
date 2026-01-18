const authRepository = require('../repositories/auth.repository');
const fieldsRepository = require('../repositories/fields.repository');
const templatesRepository = require('../repositories/templates.repository');
const usersRepository = require('../repositories/users.repository');
const config = require('../../config');
const logger = require('../utils/logger');
const { dialog } = require('electron');
const path = require('path');
const fs = require('fs');

/**
 * Developer service
 * Contains business logic for developer panel operations
 */
class DeveloperService {
  /**
   * Get database information
   */
  getDatabaseInfo() {
    return {
      credentials: authRepository.findAll().length,
      users: usersRepository.findAll().length,
      templates: templatesRepository.findAll().length,
      fields: fieldsRepository.findAll().length,
      devMode: config.isDevelopment(),
      devCredentialsEnabled: config.devCredentials.enabled
    };
  }

  /**
   * Backup database
   */
  async backupDatabase() {
    const { app } = require('electron');
    const Database = require('better-sqlite3');
    
    const dbPath = path.join(app.getPath('userData'), 'idcard.db');
    const backupPath = path.join(app.getPath('userData'), `idcard.backup.${Date.now()}.db`);
    
    const db = new Database(dbPath);
    await db.backup(backupPath);
    db.close();
    
    logger.info(`Database backed up to: ${backupPath}`);
    return { success: true, path: backupPath };
  }

  /**
   * Clean database (keep structure, remove data)
   */
  async cleanDatabase() {
    usersRepository.deleteAll();
    templatesRepository.deleteAll();
    fieldsRepository.deleteAll();
    
    logger.info('Database cleaned - all data removed');
    return { success: true, message: 'Database cleaned successfully' };
  }

  /**
   * Reinitialize database
   */
  async reinitializeDatabase() {
    // Import the original Database module to access seedDefaultData
    const db = require('../../Database');
    
    // Clear all data
    await db.clearAllData();
    
    logger.info('Database reinitialized with default data');
    return { success: true, message: 'Database reinitialized successfully' };
  }

  /**
   * Export logs
   */
  async exportLogs() {
    const { app } = require('electron');
    const logsPath = path.join(app.getPath('userData'), 'logs', 'app.log');
    
    const result = await dialog.showSaveDialog({
      title: 'Export Logs',
      defaultPath: `logs-${Date.now()}.txt`,
      filters: [{ name: 'Text Files', extensions: ['txt'] }]
    });

    if (!result.canceled && result.filePath) {
      if (fs.existsSync(logsPath)) {
        fs.copyFileSync(logsPath, result.filePath);
        logger.info(`Logs exported to: ${result.filePath}`);
        return { success: true, path: result.filePath };
      }
    }

    return { success: false, message: 'Export cancelled or log file not found' };
  }

  /**
   * Get all credentials (for developer panel)
   */
  getAllCredentials() {
    return authRepository.findAll();
  }

  /**
   * Create credential (for developer panel)
   */
  async createCredential(username, password) {
    const result = await authRepository.create(username, password);
    logger.logResourceCreated('Credential (Dev)', username);
    return result;
  }

  /**
   * Delete credential (for developer panel)
   */
  deleteCredential(id) {
    authRepository.delete(id);
    logger.logResourceDeleted('Credential (Dev)', `ID: ${id}`);
    return { success: true };
  }
}

module.exports = new DeveloperService();
