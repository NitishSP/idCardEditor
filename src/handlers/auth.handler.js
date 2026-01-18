const { ipcMain } = require('electron');
const authService = require('../services/auth.service');
const { rateLimitMiddleware, validationMiddleware, errorHandlerMiddleware } = require('../middleware');
const response = require('../utils/response');

/**
 * Authentication IPC handlers
 */
class AuthHandlers {
  /**
   * Register all auth-related IPC handlers
   */
  register() {
    // Login
    ipcMain.handle('auth:login', 
      rateLimitMiddleware.apply('auth:login', 
        errorHandlerMiddleware.wrap(this.handleLogin.bind(this), 'Auth login')
      )
    );

    // Change password
    ipcMain.handle('auth:changePassword',
      rateLimitMiddleware.apply('auth:changePassword',
        errorHandlerMiddleware.wrap(this.handleChangePassword.bind(this), 'Auth change password')
      )
    );

    // Get all credentials
    ipcMain.handle('auth:getAll',
      rateLimitMiddleware.apply('auth:getAll',
        errorHandlerMiddleware.wrap(this.handleGetAll.bind(this), 'Auth get all')
      )
    );

    // Create credential
    ipcMain.handle('auth:create',
      rateLimitMiddleware.apply('auth:create',
        errorHandlerMiddleware.wrap(this.handleCreate.bind(this), 'Auth create')
      )
    );

    // Update credential
    ipcMain.handle('auth:update',
      rateLimitMiddleware.apply('auth:update',
        errorHandlerMiddleware.wrap(this.handleUpdate.bind(this), 'Auth update')
      )
    );

    // Delete credential
    ipcMain.handle('auth:delete',
      rateLimitMiddleware.apply('auth:delete',
        errorHandlerMiddleware.wrap(this.handleDelete.bind(this), 'Auth delete')
      )
    );
  }

  /**
   * Handle login
   */
  async handleLogin(event, { username, password }) {
    // Validate input
    const usernameValidation = validationMiddleware.validateUsername(username);
    if (!usernameValidation.valid) {
      return response.error(usernameValidation.error);
    }

    const passwordValidation = validationMiddleware.validatePassword(password);
    if (!passwordValidation.valid) {
      return response.error(passwordValidation.error);
    }

    // Authenticate
    const user = await authService.login(username, password);
    if (!user) {
      return response.error('Invalid credentials');
    }

    return response.success(user);
  }

  /**
   * Handle change password
   */
  async handleChangePassword(event, { username, oldPassword, newPassword }) {
    // Validate input
    const usernameValidation = validationMiddleware.validateUsername(username);
    if (!usernameValidation.valid) {
      return response.error(usernameValidation.error);
    }

    const oldPasswordValidation = validationMiddleware.validatePassword(oldPassword);
    if (!oldPasswordValidation.valid) {
      return response.error(oldPasswordValidation.error);
    }

    const newPasswordValidation = validationMiddleware.validatePassword(newPassword);
    if (!newPasswordValidation.valid) {
      return response.error(newPasswordValidation.error);
    }

    await authService.changePassword(username, oldPassword, newPassword);
    return response.success(null, 'Password changed successfully');
  }

  /**
   * Handle get all credentials
   */
  async handleGetAll() {
    const credentials = authService.getAllCredentials();
    return response.success(credentials);
  }

  /**
   * Handle create credential
   */
  async handleCreate(event, { username, password }) {
    // Validate input
    const usernameValidation = validationMiddleware.validateUsername(username);
    if (!usernameValidation.valid) {
      return response.error(usernameValidation.error);
    }

    const passwordValidation = validationMiddleware.validatePassword(password);
    if (!passwordValidation.valid) {
      return response.error(passwordValidation.error);
    }

    const result = await authService.createCredential(username, password);
    return response.success(result);
  }

  /**
   * Handle update credential
   */
  async handleUpdate(event, { id, username, password }) {
    // Validate input
    const idValidation = validationMiddleware.validateId(id);
    if (!idValidation.valid) {
      return response.error(idValidation.error);
    }

    const usernameValidation = validationMiddleware.validateUsername(username);
    if (!usernameValidation.valid) {
      return response.error(usernameValidation.error);
    }

    const passwordValidation = validationMiddleware.validatePassword(password);
    if (!passwordValidation.valid) {
      return response.error(passwordValidation.error);
    }

    await authService.updateCredential(id, username, password);
    return response.success();
  }

  /**
   * Handle delete credential
   */
  async handleDelete(event, id) {
    const idValidation = validationMiddleware.validateId(id);
    if (!idValidation.valid) {
      return response.error(idValidation.error);
    }

    authService.deleteCredential(id);
    return response.success();
  }
}

module.exports = new AuthHandlers();
