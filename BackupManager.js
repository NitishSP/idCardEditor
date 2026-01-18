const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { app } = require('electron');
const log = require('electron-log');
const db = require('./Database');

// Encryption settings
const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32; // 256 bits
const IV_LENGTH = 16; // 128 bits
const SALT_LENGTH = 64;
const TAG_LENGTH = 16;

class BackupManager {
    constructor() {
        // Backup directory in AppData (more professional location)
        this.backupDir = null; // Will be initialized when needed
    }

    getBackupDir() {
        if (!this.backupDir) {
            this.backupDir = path.join(app.getPath('userData'), 'Backups');
            this.ensureBackupDirectory();
        }
        return this.backupDir;
    }

    ensureBackupDirectory() {
        const dir = this.backupDir || path.join(app.getPath('userData'), 'Backups');
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
    }

    /**
     * Derive encryption key from password using PBKDF2
     */
    deriveKey(password, salt) {
        return crypto.pbkdf2Sync(password, salt, 100000, KEY_LENGTH, 'sha512');
    }

    /**
     * Encrypt data with password
     */
    encrypt(data, password) {
        try {
            const salt = crypto.randomBytes(SALT_LENGTH);
            const key = this.deriveKey(password, salt);
            const iv = crypto.randomBytes(IV_LENGTH);
            
            const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
            const encrypted = Buffer.concat([
                cipher.update(JSON.stringify(data), 'utf8'),
                cipher.final()
            ]);
            
            const tag = cipher.getAuthTag();
            
            // Combine: salt + iv + tag + encrypted data
            const result = Buffer.concat([salt, iv, tag, encrypted]);
            return result.toString('base64');
        } catch (error) {
            log.error('Encryption error:', error);
            throw new Error('Failed to encrypt backup');
        }
    }

    /**
     * Decrypt data with password
     */
    decrypt(encryptedData, password) {
        try {
            const buffer = Buffer.from(encryptedData, 'base64');
            
            // Extract components
            const salt = buffer.slice(0, SALT_LENGTH);
            const iv = buffer.slice(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
            const tag = buffer.slice(SALT_LENGTH + IV_LENGTH, SALT_LENGTH + IV_LENGTH + TAG_LENGTH);
            const encrypted = buffer.slice(SALT_LENGTH + IV_LENGTH + TAG_LENGTH);
            
            const key = this.deriveKey(password, salt);
            
            const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
            decipher.setAuthTag(tag);
            
            const decrypted = Buffer.concat([
                decipher.update(encrypted),
                decipher.final()
            ]);
            
            return JSON.parse(decrypted.toString('utf8'));
        } catch (error) {
            log.error('Decryption error:', error);
            throw new Error('Failed to decrypt backup - Invalid password or corrupted file');
        }
    }

    /**
     * Collect all data for backup
     */
    collectBackupData() {
        try {
            // Ensure database is ready
            if (!db || !db.db) {
                throw new Error('Database not initialized');
            }

            // Get all data from database with fallbacks
            let users, templates, credentials, fields;
            
            try {
                users = db.getAllUsers() || [];
            } catch (e) {
                log.error('Error getting users:', e);
                users = [];
            }

            try {
                templates = db.getAllTemplates() || [];
            } catch (e) {
                log.error('Error getting templates:', e);
                templates = [];
            }

            try {
                credentials = db.getAllCredentials() || [];
            } catch (e) {
                log.error('Error getting credentials:', e);
                credentials = [];
            }

            try {
                fields = db.getAllPredefinedFields() || [];
            } catch (e) {
                log.error('Error getting fields:', e);
                fields = [];
            }

            log.info('Backup data collected:', {
                users: users.length,
                templates: templates.length,
                credentials: credentials.length,
                fields: fields.length
            });

            const backupData = {
                version: '1.0.0',
                timestamp: new Date().toISOString(),
                data: {
                    users,
                    templates,
                    credentials,
                    fields
                }
            };

            return backupData;
        } catch (error) {
            log.error('Error collecting backup data:', error);
            log.error('Error stack:', error.stack);
            throw new Error(`Failed to collect backup data: ${error.message}`);
        }
    }

    /**
     * Create encrypted backup
     */
    createBackup(password) {
        try {
            const backupData = this.collectBackupData();
            const encrypted = this.encrypt(backupData, password);
            
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const filename = `IDCardBackup_${timestamp}.bak`;
            const filepath = path.join(this.getBackupDir(), filename);
            
            fs.writeFileSync(filepath, encrypted, 'utf8');
            
            return {
                success: true,
                filepath,
                filename,
                size: fs.statSync(filepath).size,
                timestamp: backupData.timestamp
            };
        } catch (error) {
            log.error('Create backup error:', error);
            throw error;
        }
    }

    /**
     * Auto backup (scheduled or on critical operations)
     */
    autoBackup(password) {
        try {
            const result = this.createBackup(password);
            
            // Keep only last 10 auto backups
            this.cleanupOldBackups(10);
            
            return result;
        } catch (error) {
            log.error('Auto backup error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Restore from encrypted backup
     */
    async restoreBackup(filepath, password) {
        try {
            if (!fs.existsSync(filepath)) {
                throw new Error('Backup file not found');
            }
            
            const encryptedData = fs.readFileSync(filepath, 'utf8');
            const backupData = this.decrypt(encryptedData, password);
            
            // Validate backup structure
            if (!backupData.data) {
                throw new Error('Invalid backup file structure');
            }
            
            // Begin transaction-like restore
            const restoreResult = await this.performRestore(backupData.data);
            
            return {
                success: true,
                restored: restoreResult,
                backupVersion: backupData.version,
                backupTimestamp: backupData.timestamp
            };
        } catch (error) {
            log.error('Restore backup error:', error);
            throw error;
        }
    }

    /**
     * Perform the actual restore operation
     */
    async performRestore(data) {
        const restored = {
            users: 0,
            templates: 0,
            credentials: 0,
            fields: 0
        };

        try {
            // Clear existing data (optional - can be made configurable)
            // For safety, we'll merge instead of replace
            
            // Restore users (use upsertUser for merge behavior)
            if (data.users && Array.isArray(data.users)) {
                data.users.forEach(user => {
                    try {
                        db.upsertUser(user.photo, user.additionalData);
                        restored.users++;
                    } catch (error) {
                        log.error('Error restoring user:', error.message);
                    }
                });
            }

            // Restore templates (use updateTemplate for upsert behavior)
            if (data.templates && Array.isArray(data.templates)) {
                data.templates.forEach(template => {
                    try {
                        db.updateTemplate(
                            template.name, 
                            template.thumbnail, 
                            template.templateData,
                            template.cardWidthMm || 85.6,
                            template.cardHeightMm || 54
                        );
                        restored.templates++;
                    } catch (error) {
                        log.error('Error restoring template:', error.message);
                    }
                });
            }

            // Restore credentials (use upsertCredential for merge behavior)
            if (data.credentials && Array.isArray(data.credentials)) {
                for (const cred of data.credentials) {
                    try {
                        await db.upsertCredential(cred.username, cred.password);
                        restored.credentials++;
                    } catch (error) {
                        log.error('Error restoring credential:', error.message);
                    }
                }
            }

            // Restore predefined fields (use upsertPredefinedField for merge behavior)
            if (data.fields && Array.isArray(data.fields)) {
                data.fields.forEach(field => {
                    try {
                        db.upsertPredefinedField(
                            field.label,
                            field.defaultValue,
                            field.fieldType,
                            field.isRequired,
                            field.displayOrder
                        );
                        restored.fields++;
                    } catch (error) {
                        log.error('Error restoring field:', error.message);
                    }
                });
            }

            return restored;
        } catch (error) {
            log.error('Perform restore error:', error);
            throw new Error('Failed to restore data: ' + error.message);
        }
    }

    /**
     * List all available backups
     */
    listBackups() {
        try {
            const files = fs.readdirSync(this.getBackupDir());
            const backups = files
                .filter(file => file.endsWith('.bak'))
                .map(file => {
                    const filepath = path.join(this.getBackupDir(), file);
                    const stats = fs.statSync(filepath);
                    return {
                        filename: file,
                        filepath,
                        size: stats.size,
                        created: stats.birthtime,
                        modified: stats.mtime
                    };
                })
                .sort((a, b) => b.modified - a.modified);

            return backups;
        } catch (error) {
            log.error('List backups error:', error);
            return [];
        }
    }

    /**
     * Cleanup old backups, keeping only the specified number
     */
    cleanupOldBackups(keepCount = 10) {
        try {
            const backups = this.listBackups();
            const toDelete = backups.slice(keepCount);
            
            toDelete.forEach(backup => {
                try {
                    fs.unlinkSync(backup.filepath);
                } catch (error) {
                    log.error('Error deleting backup:', error);
                }
            });
            
            return { deleted: toDelete.length };
        } catch (error) {
            log.error('Cleanup error:', error);
            return { deleted: 0 };
        }
    }

    /**
     * Verify backup integrity (check if it can be decrypted)
     */
    verifyBackup(filepath, password) {
        try {
            const encryptedData = fs.readFileSync(filepath, 'utf8');
            const backupData = this.decrypt(encryptedData, password);
            
            return {
                valid: true,
                version: backupData.version,
                timestamp: backupData.timestamp,
                dataCount: {
                    users: backupData.data.users?.length || 0,
                    templates: backupData.data.templates?.length || 0,
                    credentials: backupData.data.credentials?.length || 0,
                    fields: backupData.data.fields?.length || 0
                }
            };
        } catch (error) {
            return {
                valid: false,
                error: error.message
            };
        }
    }

    /**
     * Export backup to custom location
     */
    exportBackup(sourcePath, destinationPath) {
        try {
            fs.copyFileSync(sourcePath, destinationPath);
            return { success: true };
        } catch (error) {
            log.error('Export backup error:', error);
            throw new Error('Failed to export backup');
        }
    }

    /**
     * Get backup directory path
     */
    getBackupDirectory() {
        return this.getBackupDir();
    }
}

module.exports = new BackupManager();
