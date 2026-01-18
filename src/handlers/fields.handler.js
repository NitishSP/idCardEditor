const { ipcMain } = require('electron');
const fieldsService = require('../services/fields.service');
const { rateLimitMiddleware, validationMiddleware, errorHandlerMiddleware } = require('../middleware');
const response = require('../utils/response');

/**
 * Fields IPC handlers
 */
class FieldsHandlers {
  /**
   * Register all fields-related IPC handlers
   */
  register() {
    ipcMain.handle('fields:getAll',
      rateLimitMiddleware.apply('fields:getAll',
        errorHandlerMiddleware.wrap(this.handleGetAll.bind(this), 'Fields get all')
      )
    );

    ipcMain.handle('fields:create',
      rateLimitMiddleware.apply('fields:create',
        errorHandlerMiddleware.wrap(this.handleCreate.bind(this), 'Fields create')
      )
    );

    ipcMain.handle('fields:update',
      rateLimitMiddleware.apply('fields:update',
        errorHandlerMiddleware.wrap(this.handleUpdate.bind(this), 'Fields update')
      )
    );

    ipcMain.handle('fields:delete',
      rateLimitMiddleware.apply('fields:delete',
        errorHandlerMiddleware.wrap(this.handleDelete.bind(this), 'Fields delete')
      )
    );

    ipcMain.handle('fields:checkUsage',
      rateLimitMiddleware.apply('fields:checkUsage',
        errorHandlerMiddleware.wrap(this.handleCheckUsage.bind(this), 'Fields check usage')
      )
    );

    ipcMain.handle('fields:toggleActive',
      rateLimitMiddleware.apply('fields:toggleActive',
        errorHandlerMiddleware.wrap(this.handleToggleActive.bind(this), 'Fields toggle active')
      )
    );

    ipcMain.handle('fields:updateOrder',
      rateLimitMiddleware.apply('fields:updateOrder',
        errorHandlerMiddleware.wrap(this.handleUpdateOrder.bind(this), 'Fields update order')
      )
    );
  }

  /**
   * Handle get all fields
   */
  async handleGetAll() {
    const fields = fieldsService.getAllFields();
    return response.success(fields);
  }

  /**
   * Handle create field
   */
  async handleCreate(event, { label, defaultValue, fieldType, isRequired, displayOrder }) {
    const fieldValidation = validationMiddleware.validateField({
      label, defaultValue, fieldType, isRequired, displayOrder
    });

    if (!fieldValidation.valid) {
      return response.error(fieldValidation.error);
    }

    const fieldData = fieldValidation.data;
    const result = fieldsService.createField(
      fieldData.label,
      fieldData.defaultValue,
      fieldData.fieldType,
      fieldData.isRequired,
      fieldData.displayOrder
    );

    return response.success({ id: result.id });
  }

  /**
   * Handle update field
   */
  async handleUpdate(event, { id, label, defaultValue, fieldType, isRequired, displayOrder }) {
    const idValidation = validationMiddleware.validateId(id);
    if (!idValidation.valid) {
      return response.error(idValidation.error);
    }

    const fieldValidation = validationMiddleware.validateField({
      label, defaultValue, fieldType, isRequired, displayOrder
    });

    if (!fieldValidation.valid) {
      return response.error(fieldValidation.error);
    }

    const fieldData = fieldValidation.data;
    fieldsService.updateField(
      id,
      fieldData.label,
      fieldData.defaultValue,
      fieldData.fieldType,
      fieldData.isRequired,
      fieldData.displayOrder
    );

    return response.success();
  }

  /**
   * Handle delete field
   */
  async handleDelete(event, id) {
    const idValidation = validationMiddleware.validateId(id);
    if (!idValidation.valid) {
      return response.error(idValidation.error);
    }

    fieldsService.deleteFieldWithCleanup(id);
    return response.success();
  }

  /**
   * Handle check field usage
   */
  async handleCheckUsage(event, id) {
    const idValidation = validationMiddleware.validateId(id);
    if (!idValidation.valid) {
      return response.error(idValidation.error);
    }

    const usage = fieldsService.checkFieldUsage(id);
    return response.success(usage);
  }

  /**
   * Handle toggle field active
   */
  async handleToggleActive(event, id) {
    const idValidation = validationMiddleware.validateId(id);
    if (!idValidation.valid) {
      return response.error(idValidation.error);
    }

    fieldsService.toggleFieldActive(id);
    return response.success();
  }

  /**
   * Handle update fields order
   */
  async handleUpdateOrder(event, fieldsOrder) {
    fieldsService.updateFieldsOrder(fieldsOrder);
    return response.success();
  }
}

module.exports = new FieldsHandlers();
