const authHandlers = require('./auth.handler');
const fieldsHandlers = require('./fields.handler');
const templatesHandlers = require('./templates.handler');
const usersHandlers = require('./users.handler');
const backupHandlers = require('./backup.handler');
const printHandler = require('./print.handler');
const systemHandler = require('./system.handler');
const developerHandlers = require('./developer.handler');

/**
 * Register all IPC handlers
 */
function registerAllHandlers() {
  authHandlers.register();
  fieldsHandlers.register();
  templatesHandlers.register();
  usersHandlers.register();
  backupHandlers.register();
  printHandler.register();
  systemHandler.register();
  developerHandlers.register();
}

module.exports = {
  registerAllHandlers
};
