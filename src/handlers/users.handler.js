const { ipcMain } = require('electron');
const usersService = require('../services/users.service');
const fieldsService = require('../services/fields.service');
const { rateLimitMiddleware, validationMiddleware, errorHandlerMiddleware } = require('../middleware');
const response = require('../utils/response');
const { log } = require('electron-builder');

/**
 * Users IPC handlers
 */
class UsersHandlers {
  /**
   * Register all users-related IPC handlers
   */
  register() {
    ipcMain.handle('users:getAll',
      rateLimitMiddleware.apply('users:getAll',
        errorHandlerMiddleware.wrap(this.handleGetAll.bind(this), 'Users get all')
      )
    );

    ipcMain.handle('users:getById',
      rateLimitMiddleware.apply('users:getById',
        errorHandlerMiddleware.wrap(this.handleGetById.bind(this), 'Users get by ID')
      )
    );

    ipcMain.handle('users:create',
      rateLimitMiddleware.apply('users:create',
        errorHandlerMiddleware.wrap(this.handleCreate.bind(this), 'Users create')
      )
    );

    ipcMain.handle('users:update',
      rateLimitMiddleware.apply('users:update',
        errorHandlerMiddleware.wrap(this.handleUpdate.bind(this), 'Users update')
      )
    );

    ipcMain.handle('users:delete',
      rateLimitMiddleware.apply('users:delete',
        errorHandlerMiddleware.wrap(this.handleDelete.bind(this), 'Users delete')
      )
    );

    ipcMain.handle('users:bulkUpload',
      rateLimitMiddleware.apply('users:bulkUpload',
        errorHandlerMiddleware.wrap(this.handleBulkUpload.bind(this), 'Users bulk upload')
      )
    );
  }

  /**
   * Handle get all users
   */
  async handleGetAll() {
    const users = usersService.getAllUsers();
    return response.success(users);
  }

  /**
   * Handle get user by ID
   */
  async handleGetById(event, id) {
    const idValidation = validationMiddleware.validateId(id);
    if (!idValidation.valid) {
      return response.error(idValidation.error);
    }

    const user = usersService.getUserById(id);
    return response.success(user);
  }

  /**
   * Handle create user
   */
  async handleCreate(event, { photo, additionalData }) {
    console.log('====================================');
    console.log("photo",photo,additionalData);
    console.log('====================================');
    // Get active fields for validation
    const fields = fieldsService.getAllFields().filter(f => f.isActive === 1);

    // Prepare user data for validation
    const userData = {
      ...(additionalData || {}),
      photo
    };

    // Validate using dynamic validation
    const userValidation = validationMiddleware.validateUserDynamic(userData, fields);
    if (!userValidation.valid) {
      return response.error(userValidation.error);
    }

    const validatedUser = userValidation.data;
    const result = usersService.createUser(
      validatedUser.photo || photo,
      additionalData
    );

    return response.success(result, 'User created successfully');
  }

  /**
   * Handle update user
   */
  async handleUpdate(event, { id, photo, additionalData }) {
    const idValidation = validationMiddleware.validateId(id);
    if (!idValidation.valid) {
      return response.error(idValidation.error);
    }

    // Get active fields for validation
    const fields = fieldsService.getAllFields().filter(f => f.isActive === 1);

    // Prepare user data for validation
    const userData = {
      ...(additionalData || {}),
      photo
    };

    // Validate using dynamic validation
    const userValidation = validationMiddleware.validateUserDynamic(userData, fields);
    if (!userValidation.valid) {
      return response.error(userValidation.error);
    }

    const validatedUser = userValidation.data;
    usersService.updateUser(
      id,
      validatedUser.photo || photo,
      additionalData || validatedUser.additionalData
    );

    return response.success(null, 'User updated successfully');
  }

  /**
   * Handle delete user
   */
  async handleDelete(event, id) {
    const idValidation = validationMiddleware.validateId(id);
    if (!idValidation.valid) {
      return response.error(idValidation.error);
    }

    usersService.deleteUser(id);
    return response.success();
  }

  /**
   * Handle bulk upload users
   */
  async handleBulkUpload(event, usersArray) {
    if (!Array.isArray(usersArray) || usersArray.length === 0) {
      return response.error('Invalid user data: expected non-empty array');
    }

    const results = {
      success: [],
      failed: []
    };

    // Process each user - frontend has already validated, just insert
    for (let i = 0; i < usersArray.length; i++) {
      try {
        const userData = usersArray[i];
        const { photo, additionalData } = userData;

        // Create user directly without validation (frontend already validated)
        const result = usersService.createUser(
          photo || '',
          additionalData || {}
        );

        results.success.push({
          index: i + 1,
          id: result.id,
          empId: result.empId
        });
      } catch (error) {
        results.failed.push({
          index: i + 1,
          data: usersArray[i],
          error: error.message
        });
      }
    }

    return response.success(results, `Successfully imported ${results.success.length} of ${usersArray.length} users`);
  }
}

module.exports = new UsersHandlers();
