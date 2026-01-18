const { contextBridge, ipcRenderer } = require('electron');

/**
 * Preload script - Exposes secure API to the renderer process
 * Uses contextIsolation and contextBridge for security
 */

// Helper function to create IPC invoke wrapper
const createInvoker = (channel) => (...args) => ipcRenderer.invoke(channel, ...args);

// Authentication API
const authAPI = {
  login: (username, password) => ipcRenderer.invoke('auth:login', { username, password }),
  changePassword: (username, oldPassword, newPassword) => 
    ipcRenderer.invoke('auth:changePassword', { username, oldPassword, newPassword }),
  getAll: createInvoker('auth:getAll'),
  create: (data) => ipcRenderer.invoke('auth:create', data),
  update: (data) => ipcRenderer.invoke('auth:update', data),
  delete: (id) => ipcRenderer.invoke('auth:delete', id)
};

// Predefined Fields API
const fieldsAPI = {
  getAll: createInvoker('fields:getAll'),
  create: (data) => ipcRenderer.invoke('fields:create', data),
  update: (data) => ipcRenderer.invoke('fields:update', data),
  delete: (id) => ipcRenderer.invoke('fields:delete', id),
  toggleActive: (id) => ipcRenderer.invoke('fields:toggleActive', id),
  updateOrder: (fieldsOrder) => ipcRenderer.invoke('fields:updateOrder', fieldsOrder),
  checkUsage: (id) => ipcRenderer.invoke('fields:checkUsage', id)
};

// Templates API
const templatesAPI = {
  getAll: createInvoker('templates:getAll'),
  getById: (id) => ipcRenderer.invoke('templates:getById', id),
  getByName: (name) => ipcRenderer.invoke('templates:getByName', name),
  create: (data) => ipcRenderer.invoke('templates:create', data),
  update: (data) => ipcRenderer.invoke('templates:update', data),
  delete: (id) => ipcRenderer.invoke('templates:delete', id)
};

// Users API
const usersAPI = {
  getAll: createInvoker('users:getAll'),
  getById: (id) => ipcRenderer.invoke('users:getById', id),
  create: (data) => ipcRenderer.invoke('users:create', data),
  update: (data) => ipcRenderer.invoke('users:update', data),
  delete: (id) => ipcRenderer.invoke('users:delete', id),
  bulkUpload: (usersArray) => ipcRenderer.invoke('users:bulkUpload', usersArray)
};

// Print API
const printAPI = {
  printContent: (html) => ipcRenderer.invoke('print:content', html)
};

// Backup API
const backupAPI = {
  create: (password) => ipcRenderer.invoke('backup:create', { password }),
  restore: (filepath, password) => ipcRenderer.invoke('backup:restore', { filepath, password }),
  list: createInvoker('backup:list'),
  verify: (filepath, password) => ipcRenderer.invoke('backup:verify', { filepath, password }),
  cleanup: (keepCount) => ipcRenderer.invoke('backup:cleanup', keepCount),
  getDirectory: createInvoker('backup:getDirectory'),
  selectFile: createInvoker('backup:selectFile'),
  exportTo: (sourcePath) => ipcRenderer.invoke('backup:exportTo', { sourcePath }),
  autoBackup: (password) => ipcRenderer.invoke('backup:autoBackup', { password })
};

// System API
const systemAPI = {
  clearAllData: createInvoker('system:clearAllData')
};

// Developer API - Root operations
const developerAPI = {
  getDatabaseInfo: createInvoker('developer:getDatabaseInfo'),
  backupDB: createInvoker('developer:backupDB'),
  cleanDB: createInvoker('developer:cleanDB'),
  reinitDB: createInvoker('developer:reinitDB'),
  exportLogs: createInvoker('developer:exportLogs'),
  getAllCredentials: createInvoker('developer:getAllCredentials'),
  createCredential: (username, password) => 
    ipcRenderer.invoke('developer:createCredential', { username, password }),
  deleteCredential: (id) => ipcRenderer.invoke('developer:deleteCredential', { id })
};

// Expose the electron API to the renderer process
contextBridge.exposeInMainWorld('electron', {
  auth: authAPI,
  fields: fieldsAPI,
  templates: templatesAPI,
  users: usersAPI,
  print: printAPI,
  backup: backupAPI,
  system: systemAPI,
  // Developer APIs (direct access for backward compatibility)
  getDatabaseInfo: developerAPI.getDatabaseInfo,
  developerBackupDB: developerAPI.backupDB,
  developerCleanDB: developerAPI.cleanDB,
  developerReinitDB: developerAPI.reinitDB,
  developerExportLogs: developerAPI.exportLogs,
  developerGetAllCredentials: developerAPI.getAllCredentials,
  developerCreateCredential: developerAPI.createCredential,
  developerDeleteCredential: developerAPI.deleteCredential
});
