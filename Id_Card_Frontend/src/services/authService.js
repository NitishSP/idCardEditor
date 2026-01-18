/**
 * Auth/Credentials Service
 * All API calls related to login credentials using Electron IPC
 */

export const authService = {
  // Get all credentials
  getAllCredentials: async () => {
    const response = await window.electron.auth.getAll();
    if (!response.success) throw new Error(response.error);
    return response.data;
  },

  // Create new credential
  createCredential: async (credentialData) => {
    const response = await window.electron.auth.create(credentialData);
    if (!response.success) throw new Error(response.error);
    return response;
  },

  // Update existing credential
  updateCredential: async (credentialData) => {
    const response = await window.electron.auth.update(credentialData);
    if (!response.success) throw new Error(response.error);
    return response;
  },

  // Delete credential
  deleteCredential: async (id) => {
    const response = await window.electron.auth.delete(id);
    if (!response.success) throw new Error(response.error);
    return response;
  },

  // Change password
  changePassword: async (username, oldPassword, newPassword) => {
    const response = await window.electron.auth.changePassword(username, oldPassword, newPassword);
    if (!response.success) throw new Error(response.error);
    return response;
  },
};

export default authService;
