const templatesRepository = require('../repositories/templates.repository');
const logger = require('../utils/logger');
const { RESOURCES } = require('../utils/constants');

/**
 * Templates service
 * Contains business logic for template management
 */
class TemplatesService {
  /**
   * Get all templates
   */
  getAllTemplates() {
    return templatesRepository.findAll();
  }

  /**
   * Get template by ID
   */
  getTemplateById(id) {
    const template = templatesRepository.findById(id);
    if (!template) {
      throw new Error('Template not found');
    }
    return template;
  }

  /**
   * Get template by name
   */
  getTemplateByName(name) {
    const template = templatesRepository.findByName(name);
    if (!template) {
      throw new Error('Template not found');
    }
    return template;
  }

  /**
   * Create new template
   */
  createTemplate(name, thumbnail, templateData, cardWidthMm, cardHeightMm) {
    const result = templatesRepository.create(name, thumbnail, templateData, cardWidthMm, cardHeightMm);
    logger.logResourceCreated(RESOURCES.TEMPLATE, `${name} (${cardWidthMm}mm × ${cardHeightMm}mm)`);
    return result;
  }

  /**
   * Update template (upsert pattern)
   */
  updateTemplate(name, thumbnail, templateData, cardWidthMm, cardHeightMm) {
    const existing = templatesRepository.findByName(name);

    if (existing) {
      templatesRepository.update(name, thumbnail, templateData, cardWidthMm, cardHeightMm);
      logger.logResourceUpdated(RESOURCES.TEMPLATE, `${name} (${cardWidthMm}mm × ${cardHeightMm}mm)`);
      return { id: existing.id, name, updated: true };
    } else {
      const result = templatesRepository.create(name, thumbnail, templateData, cardWidthMm, cardHeightMm);
      logger.logResourceCreated(RESOURCES.TEMPLATE, `${name} (${cardWidthMm}mm × ${cardHeightMm}mm)`);
      return result;
    }
  }

  /**
   * Delete template
   */
  deleteTemplate(id) {
    templatesRepository.delete(id);
    logger.logResourceDeleted(RESOURCES.TEMPLATE, `ID: ${id}`);
    return true;
  }
}

module.exports = new TemplatesService();
