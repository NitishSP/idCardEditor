/**
 * User Service
 * All API calls related to users using Electron IPC
 */

export const userService = {
  // Get all users
  getAllUsers: async (params = {}) => {
    const response = await window.electron.users.getAll();
    if (!response.success) throw new Error(response.error);
    return response;
  },

  // Get single user by ID
  getUserById: async (id) => {
    const response = await window.electron.users.getById(id);
    if (!response.success) throw new Error(response.error);
    return response.data;
  },

  // Create new user
  createUser: async (userData) => {
    const response = await window.electron.users.create(userData);
    if (!response.success) throw new Error(response.error);
    return response;
  },

  // Update existing user
  updateUser: async ({ id, ...data }) => {
    const response = await window.electron.users.update({ id, ...data });
    if (!response.success) throw new Error(response.error);
    return response;
  },

  // Delete user
  deleteUser: async (id) => {
    const response = await window.electron.users.delete(id);
    if (!response.success) throw new Error(response.error);
    return response;
  },

  // Bulk upload users
  bulkUpload: async (usersArray) => {
    const response = await window.electron.users.bulkUpload(usersArray);
    if (!response.success) throw new Error(response.error);
    return response;
  },
};

export default userService;
