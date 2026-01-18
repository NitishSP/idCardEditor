const db = require('./database');
const logger = require('../utils/logger');
const { CARD_DIMENSIONS } = require('../utils/constants');

/**
 * Templates repository
 * Handles all template-related database operations
 */
class TemplatesRepository {
  /**
   * Initialize templates table
   */
  initializeTable() {
    db.exec(`
      CREATE TABLE IF NOT EXISTS templates (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        thumbnail TEXT,
        templateData TEXT NOT NULL,
        cardWidthMm REAL DEFAULT 85.6,
        cardHeightMm REAL DEFAULT 54,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Add card dimension columns if they don't exist (migration)
    try {
      const columns = db.all("PRAGMA table_info(templates)", []);
      const hasCardWidthMm = columns.some(col => col.name === 'cardWidthMm');
      const hasCardHeightMm = columns.some(col => col.name === 'cardHeightMm');
      
      if (!hasCardWidthMm) {
        logger.info('Adding cardWidthMm column to templates table...');
        db.exec('ALTER TABLE templates ADD COLUMN cardWidthMm REAL DEFAULT 85.6');
      }
      
      if (!hasCardHeightMm) {
        logger.info('Adding cardHeightMm column to templates table...');
        db.exec('ALTER TABLE templates ADD COLUMN cardHeightMm REAL DEFAULT 54');
      }
    } catch (error) {
      logger.error('Error checking/adding card dimension columns:', error);
    }

    logger.info('Templates table initialized');
  }

  /**
   * Get all templates (without full templateData)
   */
  findAll() {
    return db.all(
      'SELECT id, name, thumbnail, createdAt, updatedAt FROM templates ORDER BY updatedAt DESC',
      []
    );
  }

  /**
   * Get template by ID
   */
  findById(id) {
    console.log("Fetching template by ID:", id);
    const template = db.get('SELECT * FROM templates WHERE id = ?', [id]);
    if (template && template.templateData) {
      template.templateData = JSON.parse(template.templateData);
    }
    return template;
  }

  /**
   * Get template by name
   */
  findByName(name) {
    const template = db.get('SELECT * FROM templates WHERE name = ?', [name]);
    if (template && template.templateData) {
      template.templateData = JSON.parse(template.templateData);
    }
    return template;
  }

  /**
   * Create new template
   */
  create(name, thumbnail, templateData, cardWidthMm = CARD_DIMENSIONS.DEFAULT_WIDTH, cardHeightMm = CARD_DIMENSIONS.DEFAULT_HEIGHT) {
    // Auto-generate template name if not provided (for imports)
    if (!name || name.trim() === '') {
      name = `Template_${Date.now()}`;
      logger.info(`Auto-generated template name: ${name}`);
    }

    const result = db.execute(
      'INSERT INTO templates (name, thumbnail, templateData, cardWidthMm, cardHeightMm) VALUES (?, ?, ?, ?, ?)',
      [name, thumbnail, JSON.stringify(templateData), cardWidthMm, cardHeightMm]
    );
    return { id: result.lastInsertRowid, name };
  }

  /**
   * Update existing template
   */
  update(name, thumbnail, templateData, cardWidthMm = CARD_DIMENSIONS.DEFAULT_WIDTH, cardHeightMm = CARD_DIMENSIONS.DEFAULT_HEIGHT) {
    return db.execute(
      'UPDATE templates SET thumbnail = ?, templateData = ?, cardWidthMm = ?, cardHeightMm = ?, updatedAt = CURRENT_TIMESTAMP WHERE name = ?',
      [thumbnail, JSON.stringify(templateData), cardWidthMm, cardHeightMm, name]
    );
  }

  /**
   * Update by ID
   */
  updateById(id, thumbnail, templateData, cardWidthMm, cardHeightMm) {
    return db.execute(
      'UPDATE templates SET thumbnail = ?, templateData = ?, cardWidthMm = ?, cardHeightMm = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
      [thumbnail, JSON.stringify(templateData), cardWidthMm, cardHeightMm, id]
    );
  }

  /**
   * Delete template
   */
  delete(id) {
    console.log("Deleting template by ID:", id);
    return db.execute('DELETE FROM templates WHERE id = ?', [id]);
  }

  /**
   * Delete all templates
   */
  deleteAll() {
    return db.exec('DELETE FROM templates');
  }
}

module.exports = new TemplatesRepository();
