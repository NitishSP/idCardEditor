const backupManager = require('../../BackupManager');
const logger = require('../utils/logger');

/**
 * Backup service
 * Contains business logic for backup/restore operations
 */
class BackupService {
  /**
   * Create backup
   */
  async createBackup(password) {
    const result = await backupManager.createBackup(password);
    logger.info(`Backup created: ${result.filepath}`);
    return result;
  }

  /**
   * Restore backup
   */
  async restoreBackup(filepath, password) {
    const result = await backupManager.restoreBackup(filepath, password);
    logger.info(`Backup restored from: ${filepath}`);
    return result;
  }

  /**
   * List available backups
   */
  async listBackups() {
    return await backupManager.listBackups();
  }

  /**
   * Verify backup
   */
  async verifyBackup(filepath, password) {
    return await backupManager.verifyBackup(filepath, password);
  }

  /**
   * Cleanup old backups
   */
  async cleanupBackups(keepCount) {
    const result = await backupManager.cleanupOldBackups(keepCount);
    logger.info(`Cleaned up old backups, kept ${keepCount} most recent`);
    return result;
  }

  /**
   * Get backup directory
   */
  getBackupDirectory() {
    return backupManager.getBackupDirectory();
  }

  /**
   * Export backup to custom location
   */
  async exportBackup(sourcePath, destinationPath) {
    const result = await backupManager.exportBackup(sourcePath, destinationPath);
    logger.info(`Backup exported to: ${destinationPath}`);
    return result;
  }

  /**
   * Create auto backup
   */
  async createAutoBackup(password) {
    const result = await backupManager.createAutoBackup(password);
    logger.info('Auto backup created');
    return result;
  }
}

module.exports = new BackupService();
