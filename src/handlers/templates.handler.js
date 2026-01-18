const { ipcMain } = require('electron');
const templatesService = require('../services/templates.service');
const { rateLimitMiddleware, validationMiddleware, errorHandlerMiddleware } = require('../middleware');
const response = require('../utils/response');
const { CARD_DIMENSIONS } = require('../utils/constants');

/**
 * Templates IPC handlers
 */
class TemplatesHandlers {
  /**
   * Register all templates-related IPC handlers
   */
  register() {
    ipcMain.handle('templates:getAll',
      rateLimitMiddleware.apply('templates:getAll',
        errorHandlerMiddleware.wrap(this.handleGetAll.bind(this), 'Templates get all')
      )
    );

    ipcMain.handle('templates:getByName',
      rateLimitMiddleware.apply('templates:getByName',
        errorHandlerMiddleware.wrap(this.handleGetByName.bind(this), 'Templates get by name')
      )
    );

    ipcMain.handle('templates:getById',
      rateLimitMiddleware.apply('templates:getById',
        errorHandlerMiddleware.wrap(this.handleGetById.bind(this), 'Templates get by ID')
      )
    );

    ipcMain.handle('templates:create',
      rateLimitMiddleware.apply('templates:create',
        errorHandlerMiddleware.wrap(this.handleCreate.bind(this), 'Templates create')
      )
    );

    ipcMain.handle('templates:update',
      rateLimitMiddleware.apply('templates:update',
        errorHandlerMiddleware.wrap(this.handleUpdate.bind(this), 'Templates update')
      )
    );

    ipcMain.handle('templates:delete',
      rateLimitMiddleware.apply('templates:delete',
        errorHandlerMiddleware.wrap(this.handleDelete.bind(this), 'Templates delete')
      )
    );
  }

  /**
   * Handle get all templates
   */
  async handleGetAll() {
    const templates = templatesService.getAllTemplates();
    return response.success(templates);
  }

  /**
   * Handle get template by name
   */
  async handleGetByName(event, name) {
    const template = templatesService.getTemplateByName(name);
    return response.success(template);
  }

  /**
   * Handle get template by ID
   */
  async handleGetById(event, id) {
    const idValidation = validationMiddleware.validateId(id);
    if (!idValidation.valid) {
      return response.error(idValidation.error);
    }

    const template = templatesService.getTemplateById(id);
    return response.success(template);
  }

  /**
   * Handle create template
   */
  async handleCreate(event, { name, thumbnail, templateData, cardWidthMm, cardHeightMm }) {
    const templateValidation = validationMiddleware.validateTemplate({
      name, thumbnail, templateData
    });

    if (!templateValidation.valid) {
      return response.error(templateValidation.error);
    }

    const validatedData = templateValidation.data;
    const result = templatesService.createTemplate(
      validatedData.name,
      validatedData.thumbnail,
      validatedData.templateData,
      cardWidthMm || CARD_DIMENSIONS.DEFAULT_WIDTH,
      cardHeightMm || CARD_DIMENSIONS.DEFAULT_HEIGHT
    );

    return response.success(result, 'Template created successfully');
  }

  /**
   * Handle update template
   */
  async handleUpdate(event, { name, thumbnail, templateData, cardWidthMm, cardHeightMm }) {
    const templateValidation = validationMiddleware.validateTemplate({
      name, thumbnail, templateData
    });

    if (!templateValidation.valid) {
      return response.error(templateValidation.error);
    }

    const validatedData = templateValidation.data;
    const result = templatesService.updateTemplate(
      validatedData.name,
      validatedData.thumbnail,
      validatedData.templateData,
      cardWidthMm || CARD_DIMENSIONS.DEFAULT_WIDTH,
      cardHeightMm || CARD_DIMENSIONS.DEFAULT_HEIGHT
    );

    return response.success(result, 'Template updated successfully');
  }

  /**
   * Handle delete template
   */
  async handleDelete(event, id) {
    const idValidation = validationMiddleware.validateId(id);
    if (!idValidation.valid) {
      return response.error(idValidation.error);
    }

    templatesService.deleteTemplate(id);
    return response.success(null, 'Template deleted successfully');
  }
}

module.exports = new TemplatesHandlers();
