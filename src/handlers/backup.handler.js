const { ipcMain, dialog } = require('electron');
const backupService = require('../services/backup.service');
const { rateLimitMiddleware, errorHandlerMiddleware } = require('../middleware');
const response = require('../utils/response');

/**
 * Backup IPC handlers
 */
class BackupHandlers {
  /**
   * Register all backup-related IPC handlers
   */
  register() {
    ipcMain.handle('backup:create',
      rateLimitMiddleware.apply('backup:create',
        errorHandlerMiddleware.wrap(this.handleCreate.bind(this), 'Backup create')
      )
    );

    ipcMain.handle('backup:restore',
      rateLimitMiddleware.apply('backup:restore',
        errorHandlerMiddleware.wrap(this.handleRestore.bind(this), 'Backup restore')
      )
    );

    ipcMain.handle('backup:list',
      rateLimitMiddleware.apply('backup:list',
        errorHandlerMiddleware.wrap(this.handleList.bind(this), 'Backup list')
      )
    );

    ipcMain.handle('backup:verify',
      rateLimitMiddleware.apply('backup:verify',
        errorHandlerMiddleware.wrap(this.handleVerify.bind(this), 'Backup verify')
      )
    );

    ipcMain.handle('backup:cleanup',
      rateLimitMiddleware.apply('backup:cleanup',
        errorHandlerMiddleware.wrap(this.handleCleanup.bind(this), 'Backup cleanup')
      )
    );

    ipcMain.handle('backup:getDirectory',
      rateLimitMiddleware.apply('backup:getDirectory',
        errorHandlerMiddleware.wrap(this.handleGetDirectory.bind(this), 'Backup get directory')
      )
    );

    ipcMain.handle('backup:selectFile',
      rateLimitMiddleware.apply('backup:selectFile',
        errorHandlerMiddleware.wrap(this.handleSelectFile.bind(this), 'Backup select file')
      )
    );

    ipcMain.handle('backup:exportTo',
      rateLimitMiddleware.apply('backup:exportTo',
        errorHandlerMiddleware.wrap(this.handleExportTo.bind(this), 'Backup export')
      )
    );

    ipcMain.handle('backup:autoBackup',
      rateLimitMiddleware.apply('backup:autoBackup',
        errorHandlerMiddleware.wrap(this.handleAutoBackup.bind(this), 'Backup auto')
      )
    );
  }

  /**
   * Handle create backup
   */
  async handleCreate(event, { password }) {
    const result = await backupService.createBackup(password);
    return response.success(result);
  }

  /**
   * Handle restore backup
   */
  async handleRestore(event, { filepath, password }) {
    const result = await backupService.restoreBackup(filepath, password);
    return response.success(result);
  }

  /**
   * Handle list backups
   */
  async handleList() {
    const backups = await backupService.listBackups();
    return response.success(backups);
  }

  /**
   * Handle verify backup
   */
  async handleVerify(event, { filepath, password }) {
    const result = await backupService.verifyBackup(filepath, password);
    return response.success(result);
  }

  /**
   * Handle cleanup backups
   */
  async handleCleanup(event, keepCount) {
    const result = await backupService.cleanupBackups(keepCount);
    return response.success(result);
  }

  /**
   * Handle get backup directory
   */
  async handleGetDirectory() {
    const directory = backupService.getBackupDirectory();
    return response.success({ directory });
  }

  /**
   * Handle select backup file
   */
  async handleSelectFile() {
    const result = await dialog.showOpenDialog({
      title: 'Select Backup File',
      filters: [
        { name: 'Backup Files', extensions: ['backup'] },
        { name: 'All Files', extensions: ['*'] }
      ],
      properties: ['openFile']
    });

    if (result.canceled || result.filePaths.length === 0) {
      return { success: true, canceled: true, data: null };
    }

    return response.success({ filepath: result.filePaths[0] });
  }

  /**
   * Handle export backup
   */
  async handleExportTo(event, { sourcePath }) {
    const result = await dialog.showSaveDialog({
      title: 'Export Backup',
      defaultPath: 'backup.backup',
      filters: [
        { name: 'Backup Files', extensions: ['backup'] },
        { name: 'All Files', extensions: ['*'] }
      ]
    });

    if (result.canceled || !result.filePath) {
      return response.error('Export cancelled');
    }

    const exportResult = await backupService.exportBackup(sourcePath, result.filePath);
    return response.success(exportResult);
  }

  /**
   * Handle auto backup
   */
  async handleAutoBackup(event, { password }) {
    const result = await backupService.createAutoBackup(password);
    return response.success(result);
  }
}

module.exports = new BackupHandlers();
