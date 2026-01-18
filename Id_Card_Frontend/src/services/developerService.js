/**
 * Developer Service
 * Handles developer-only operations for database management
 * WARNING: These operations are destructive and should only be used by authorized developers
 */

const developerService = {
  /**
   * Get database information
   */
  getDatabaseInfo: async () => {
    try {
      const result = await window.electron.getDatabaseInfo();
      return result;
    } catch (error) {
      console.error('Failed to get database info:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Create database backup
   */
  backupDatabase: async () => {
    try {
      const result = await window.electron.developerBackupDB();
      return result;
    } catch (error) {
      console.error('Failed to backup database:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Clean entire database (DELETE ALL DATA)
   */
  cleanDatabase: async () => {
    try {
      const result = await window.electron.developerCleanDB();
      return result;
    } catch (error) {
      console.error('Failed to clean database:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Reinitialize database with default data
   */
  reinitializeDatabase: async () => {
    try {
      const result = await window.electron.developerReinitDB();
      return result;
    } catch (error) {
      console.error('Failed to reinitialize database:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Export application logs
   */
  exportLogs: async () => {
    try {
      const result = await window.electron.developerExportLogs();
      return result;
    } catch (error) {
      console.error('Failed to export logs:', error);
      return { success: false, error: error.message };
    }
  },
};

export default developerService;
