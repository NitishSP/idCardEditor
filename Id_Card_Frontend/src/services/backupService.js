/**
 * Backup Service
 * Handles all backup and restore operations
 */

export const backupService = {
  // Create encrypted backup
  createBackup: async (password) => {
    const response = await window.electron.backup.create(password);
    if (!response.success) throw new Error(response.error);
    return response.data;
  },

  // Restore from backup
  restoreBackup: async (filepath, password) => {
    const response = await window.electron.backup.restore(filepath, password);
    if (!response.success) throw new Error(response.error);
    return response.data;
  },

  // List all backups
  listBackups: async () => {
    const response = await window.electron.backup.list();
    if (!response.success) throw new Error(response.error);
    return response.data;
  },

  // Verify backup integrity
  verifyBackup: async (filepath, password) => {
    const response = await window.electron.backup.verify(filepath, password);
    if (!response.success) throw new Error(response.error);
    return response.data;
  },

  // Cleanup old backups
  cleanupBackups: async (keepCount = 10) => {
    const response = await window.electron.backup.cleanup(keepCount);
    if (!response.success) throw new Error(response.error);
    return response.data;
  },

  // Get backup directory
  getBackupDirectory: async () => {
    const response = await window.electron.backup.getDirectory();
    if (!response.success) throw new Error(response.error);
    return response.data;
  },

  // Select backup file
  selectBackupFile: async () => {
    const response = await window.electron.backup.selectFile();
    if (!response.success) throw new Error(response.error);
    if (response.canceled) return null;
    return response.data?.filepath;
  },

  // Export backup to custom location
  exportBackup: async (sourcePath) => {
    const response = await window.electron.backup.exportTo(sourcePath);
    if (response.canceled) return null;
    if (!response.success) throw new Error(response.error);
    return response.data;
  },

  // Auto backup
  autoBackup: async (password) => {
    const response = await window.electron.backup.autoBackup(password);
    if (!response.success) throw new Error(response.error);
    return response.data;
  },
};

export default backupService;
