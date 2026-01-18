/**
 * Validation Service
 * Centralized input validation for the application
 */

const Joi = require('joi');
const log = require('electron-log');

class ValidationService {
  /**
   * Validate username
   */
  validateUsername(username) {
    const schema = Joi.string()
      .alphanum()
      .min(3)
      .max(30)
      .required()
      .messages({
        'string.empty': 'Username is required',
        'string.alphanum': 'Username must only contain alphanumeric characters',
        'string.min': 'Username must be at least 3 characters long',
        'string.max': 'Username must not exceed 30 characters',
      });

    const { error } = schema.validate(username);
    if (error) {
      throw new Error(error.details[0].message);
    }
    return true;
  }

  /**
   * Validate password (basic validation, strength check is in PasswordService)
   */
  validatePassword(password) {
    const schema = Joi.string()
      .min(6)
      .required()
      .messages({
        'string.empty': 'Password is required',
        'string.min': 'Password must be at least 6 characters long',
      });

    const { error } = schema.validate(password);
    if (error) {
      throw new Error(error.details[0].message);
    }
    return true;
  }

  /**
   * Validate ID (numeric ID)
   */
  validateId(id) {
    const schema = Joi.number()
      .integer()
      .positive()
      .required()
      .messages({
        'number.base': 'ID must be a number',
        'number.positive': 'ID must be a positive number',
        'any.required': 'ID is required',
      });

    const { error } = schema.validate(id);
    if (error) {
      throw new Error(error.details[0].message);
    }
    return true;
  }

  /**
   * Validate field data
   */
  validateField(fieldData) {
    const schema = Joi.object({
      label: Joi.string().min(1).max(100).required().messages({
        'string.empty': 'Field label is required',
        'string.max': 'Field label must not exceed 100 characters',
      }),
      defaultValue: Joi.string().allow('', null).max(500).messages({
        'string.max': 'Default value must not exceed 500 characters',
      }),
      fieldType: Joi.string().valid('text', 'number', 'email', 'phone', 'date').default('text'),
      isRequired: Joi.number().integer().min(0).max(1).default(0),
      displayOrder: Joi.number().integer().min(0).default(0),
    });

    const { error, value } = schema.validate(fieldData);
    if (error) {
      throw new Error(error.details[0].message);
    }
    return value;
  }

  /**
   * Validate template data
   */
  validateTemplate(templateData) {
    const schema = Joi.object({
      name: Joi.string().min(1).max(100).required().messages({
        'string.empty': 'Template name is required',
        'string.max': 'Template name must not exceed 100 characters',
      }),
      thumbnail: Joi.string().allow('', null),
      templateData: Joi.alternatives().try(
        Joi.string(),
        Joi.object()
      ).required().messages({
        'any.required': 'Template data is required',
      }),
    });

    const { error, value } = schema.validate(templateData);
    if (error) {
      throw new Error(error.details[0].message);
    }
    return value;
  }

  /**
   * Validate user data dynamically based on predefined fields
   */
  validateUserDynamic(userData, fields) {
    // Build schema dynamically from fields
    const schemaFields = {};
    
    fields.forEach(field => {
      if (field.isActive !== 1) return; // Skip inactive fields
      
      let fieldSchema;
      
      switch(field.fieldType) {
        case 'number':
          fieldSchema = Joi.number().integer();
          if (field.isRequired === 1) {
            fieldSchema = fieldSchema.required().messages({
              'number.base': `${field.label} must be a number`,
              'any.required': `${field.label} is required`,
            });
          } else {
            fieldSchema = fieldSchema.allow('', null).optional();
          }
          break;
          
        case 'email':
          fieldSchema = Joi.string().email();
          if (field.isRequired === 1) {
            fieldSchema = fieldSchema.required().messages({
              'string.empty': `${field.label} is required`,
              'string.email': `Invalid ${field.label} format`,
              'any.required': `${field.label} is required`,
            });
          } else {
            fieldSchema = fieldSchema.allow('', null).optional();
          }
          break;
          
        case 'photo':
          fieldSchema = Joi.string();
          if (field.isRequired === 1) {
            fieldSchema = fieldSchema.required().messages({
              'string.empty': `${field.label} is required`,
              'any.required': `${field.label} is required`,
            });
          } else {
            fieldSchema = fieldSchema.allow('', null).optional();
          }
          break;
          
        default: // text, phone, date, etc.
          fieldSchema = Joi.string();
          if (field.isRequired === 1) {
            fieldSchema = fieldSchema.min(1).required().messages({
              'string.empty': `${field.label} is required`,
              'any.required': `${field.label} is required`,
            });
          } else {
            fieldSchema = fieldSchema.allow('', null).optional();
          }
      }
      
      schemaFields[field.label] = fieldSchema;
    });
    
    // Add additionalData field
    schemaFields.additionalData = Joi.alternatives().try(
      Joi.string(),
      Joi.object()
    ).allow('', null).optional();
    
    const schema = Joi.object(schemaFields).unknown(true); // Allow unknown fields
    
    const { error, value } = schema.validate(userData);
    if (error) {
      throw new Error(error.details[0].message);
    }
    return value;
  }

  /**
   * Validate user data (legacy - for backward compatibility)
   */
  validateUser(userData) {
    const schema = Joi.object({
      photo: Joi.string().required().messages({
        'string.empty': 'Photo is required',
      }),
      additionalData: Joi.alternatives().try(
        Joi.string(),
        Joi.object()
      ).allow('', null),
    });

    const { error, value } = schema.validate(userData);
    if (error) {
      throw new Error(error.details[0].message);
    }
    return value;
  }
}

module.exports = new ValidationService();
