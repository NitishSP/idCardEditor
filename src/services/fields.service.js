const fieldsRepository = require('../repositories/fields.repository');
const usersRepository = require('../repositories/users.repository');
const templatesRepository = require('../repositories/templates.repository');
const logger = require('../utils/logger');
const { RESOURCES, PROTECTED_FIELDS } = require('../utils/constants');

/**
 * Fields service
 * Contains business logic for predefined fields management
 */
class FieldsService {
  /**
   * Get all fields
   */
  getAllFields() {
    return fieldsRepository.findAll();
  }

  /**
   * Get field by ID
   */
  getFieldById(id) {
    const field = fieldsRepository.findById(id);
    if (!field) {
      throw new Error('Field not found');
    }
    return field;
  }

  /**
   * Create new field
   */
  createField(label, defaultValue, fieldType, isRequired, displayOrder) {
    const result = fieldsRepository.create(label, defaultValue, fieldType, isRequired, displayOrder);
    logger.logResourceCreated(RESOURCES.FIELD, label);
    return result;
  }

  /**
   * Update field
   */
  updateField(id, label, defaultValue, fieldType, isRequired, displayOrder) {
    // Ensure Photo field remains mandatory
    if (label === PROTECTED_FIELDS.PHOTO && isRequired !== 1) {
      throw new Error('Photo field must remain required');
    }

    fieldsRepository.update(id, label, defaultValue, fieldType, isRequired, displayOrder);
    logger.logResourceUpdated(RESOURCES.FIELD, label);
    return true;
  }

  /**
   * Delete field with cleanup
   */
  deleteFieldWithCleanup(id) {
    const field = this.getFieldById(id);
    const fieldLabel = field.label;

    // Prevent deletion of protected fields (Photo/Profile Photo)
    if (fieldLabel === PROTECTED_FIELDS.PHOTO || 
        fieldLabel === PROTECTED_FIELDS.PROFILE_PHOTO || 
        field.fieldType === 'photo') {
      throw new Error('Photo field cannot be deleted as it is a required field for the system');
    }

    // Clean up users
    this._cleanupUsersForField(fieldLabel);

    // Clean up templates
    this._cleanupTemplatesForField(fieldLabel);

    // Delete the field
    fieldsRepository.delete(id);
    logger.logResourceDeleted(RESOURCES.FIELD, `ID: ${id}, Label: ${fieldLabel}`);
    return true;
  }

  /**
   * Toggle field active status
   */
  toggleFieldActive(id) {
    const field = fieldsRepository.findById(id);
    
    // Prevent deactivation of Photo field
    if (field && field.label === PROTECTED_FIELDS.PHOTO && field.isActive === 1) {
      throw new Error('Photo field cannot be deactivated');
    }

    fieldsRepository.toggleActive(id);
    logger.info(`Field active status toggled: ID ${id}`);
    return true;
  }

  /**
   * Update fields order
   */
  updateFieldsOrder(fieldsOrder) {
    fieldsRepository.updateOrder(fieldsOrder);
    logger.info('Fields order updated');
    return true;
  }

  /**
   * Check field usage in users and templates
   */
  checkFieldUsage(id) {
    const field = this.getFieldById(id);
    const fieldLabel = field.label;

    // Check users with this field
    const users = usersRepository.findAll();
    const usersWithField = users.filter(user =>
      user.additionalData && user.additionalData.hasOwnProperty(fieldLabel)
    );

    // Check templates with this field
    const templates = templatesRepository.findAll();
    const templatesWithField = [];

    templates.forEach(template => {
      try {
        const fullTemplate = templatesRepository.findById(template.id);
        if (!fullTemplate || !fullTemplate.templateData) return;

        const templateData = fullTemplate.templateData;
        if (templateData && templateData.elements && Array.isArray(templateData.elements)) {
          const hasField = templateData.elements.some(el =>
            el && (
              el.text === fieldLabel ||
              el.field === fieldLabel ||
              (el.content && typeof el.content === 'string' && el.content.includes(fieldLabel))
            )
          );
          if (hasField) {
            templatesWithField.push(template);
          }
        }
      } catch (error) {
        logger.error(`Error parsing template ${template.id}:`, error);
      }
    });

    return {
      usersCount: usersWithField.length,
      templatesCount: templatesWithField.length,
      users: usersWithField,
      templates: templatesWithField
    };
  }

  /**
   * Clean up users - remove field from additionalData
   */
  _cleanupUsersForField(fieldLabel) {
    const users = usersRepository.findAll();

    users.forEach(user => {
      if (user.additionalData && user.additionalData.hasOwnProperty(fieldLabel)) {
        const updatedData = { ...user.additionalData };
        delete updatedData[fieldLabel];
        usersRepository.updateAdditionalData(user.id, updatedData);
      }
    });
  }

  /**
   * Clean up templates - remove elements with this field
   */
  _cleanupTemplatesForField(fieldLabel) {
    const templates = templatesRepository.findAll();

    templates.forEach(template => {
      try {
        const fullTemplate = templatesRepository.findById(template.id);
        if (!fullTemplate || !fullTemplate.templateData) return;

        const templateData = fullTemplate.templateData;
        if (templateData && templateData.elements && Array.isArray(templateData.elements)) {
          let modified = false;

          // Filter out text and image elements with matching label
          templateData.elements = templateData.elements.filter(el => {
            if (!el) return false;

            if (el.type === 'text' && el.label === fieldLabel) {
              modified = true;
              return false;
            }

            if (el.type === 'image' && el.label === fieldLabel) {
              modified = true;
              return false;
            }

            return true;
          });

          // Clean up QR code elements
          templateData.elements = templateData.elements.map(el => {
            if (el.type === 'qr' && el.qrFields && Array.isArray(el.qrFields)) {
              const originalLength = el.qrFields.length;
              el.qrFields = el.qrFields.filter(f => f !== fieldLabel);
              if (el.qrFields.length !== originalLength) {
                modified = true;
              }
            }
            return el;
          });

          if (modified) {
            templatesRepository.updateById(
              template.id,
              fullTemplate.thumbnail,
              templateData,
              fullTemplate.cardWidthMm,
              fullTemplate.cardHeightMm
            );
          }
        }
      } catch (error) {
        logger.error(`Error cleaning up template ${template.id}:`, error);
      }
    });
  }
}

module.exports = new FieldsService();
