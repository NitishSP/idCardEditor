const db = require('./database');
const logger = require('../utils/logger');

/**
 * Fields repository
 * Handles all predefined fields database operations
 */
class FieldsRepository {
  /**
   * Initialize fields table
   */
  initializeTable() {
    db.exec(`
      CREATE TABLE IF NOT EXISTS predefined_fields (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        label TEXT UNIQUE NOT NULL,
        defaultValue TEXT,
        fieldType TEXT DEFAULT 'text',
        isRequired INTEGER DEFAULT 0,
        isActive INTEGER DEFAULT 1,
        displayOrder INTEGER DEFAULT 0,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Add isRequired column if it doesn't exist (migration)
    try {
      const columns = db.all("PRAGMA table_info(predefined_fields)", []);
      const hasIsRequired = columns.some(col => col.name === 'isRequired');
      
      if (!hasIsRequired) {
        logger.info('Adding isRequired column to predefined_fields table...');
        db.exec('ALTER TABLE predefined_fields ADD COLUMN isRequired INTEGER DEFAULT 0');
      }
    } catch (error) {
      logger.error('Error checking/adding isRequired column:', error);
    }

    logger.info('Fields table initialized');
  }

  /**
   * Get all fields
   */
  findAll() {
    return db.all(
      'SELECT * FROM predefined_fields ORDER BY displayOrder ASC',
      []
    );
  }

  /**
   * Get field by ID
   */
  findById(id) {
    return db.get('SELECT * FROM predefined_fields WHERE id = ?', [id]);
  }

  /**
   * Get field by label
   */
  findByLabel(label) {
    return db.get('SELECT * FROM predefined_fields WHERE label = ?', [label]);
  }

  /**
   * Create new field
   */
  create(label, defaultValue, fieldType = 'text', isRequired = 0, displayOrder = 0) {
    const result = db.execute(
      'INSERT INTO predefined_fields (label, defaultValue, fieldType, isRequired, displayOrder) VALUES (?, ?, ?, ?, ?)',
      [label, defaultValue, fieldType, isRequired, displayOrder]
    );
    return { id: result.lastInsertRowid };
  }

  /**
   * Update field
   */
  update(id, label, defaultValue, fieldType, isRequired, displayOrder) {
    return db.execute(
      'UPDATE predefined_fields SET label = ?, defaultValue = ?, fieldType = ?, isRequired = ?, displayOrder = ? WHERE id = ?',
      [label, defaultValue, fieldType, isRequired, displayOrder, id]
    );
  }

  /**
   * Delete field
   */
  delete(id) {
    return db.execute('DELETE FROM predefined_fields WHERE id = ?', [id]);
  }

  /**
   * Toggle field active status
   */
  toggleActive(id) {
    const field = this.findById(id);
    const newActive = field.isActive === 1 ? 0 : 1;
    return db.execute(
      'UPDATE predefined_fields SET isActive = ? WHERE id = ?',
      [newActive, id]
    );
  }

  /**
   * Update fields order
   */
  updateOrder(fieldsOrder) {
    const stmt = db.getDatabase().prepare(
      'UPDATE predefined_fields SET displayOrder = ? WHERE id = ?'
    );
    
    const updateMany = db.getDatabase().transaction((fields) => {
      for (const field of fields) {
        stmt.run(field.displayOrder, field.id);
      }
    });
    
    return updateMany(fieldsOrder);
  }

  /**
   * Delete all fields
   */
  deleteAll() {
    return db.exec('DELETE FROM predefined_fields');
  }
}

module.exports = new FieldsRepository();
