/**
 * Field Service
 * All API calls related to predefined fields using Electron IPC
 */

export const fieldService = {
  // Get all predefined fields
  getAllFields: async () => {
    const response = await window.electron.fields.getAll();
    if (!response.success) throw new Error(response.error);
    return response.data;
  },

  // Create new field
  createField: async (fieldData) => {
    const response = await window.electron.fields.create(fieldData);
    if (!response.success) throw new Error(response.error);
    return response;
  },

  // Update existing field
  updateField: async (fieldData) => {
    const response = await window.electron.fields.update(fieldData);
    if (!response.success) throw new Error(response.error);
    return response;
  },

  // Delete field
  deleteField: async (id) => {
    const response = await window.electron.fields.delete(id);
    if (!response.success) throw new Error(response.error);
    return response;
  },

  // Toggle field active status
  toggleFieldActive: async (id) => {
    const response = await window.electron.fields.toggleActive(id);
    if (!response.success) throw new Error(response.error);
    return response;
  },

  // Update fields order
  updateFieldsOrder: async (fieldsOrder) => {
    const response = await window.electron.fields.updateOrder(fieldsOrder);
    if (!response.success) throw new Error(response.error);
    return response;
  },

  // Check field usage
  checkFieldUsage: async (id) => {
    const response = await window.electron.fields.checkUsage(id);
    if (!response.success) throw new Error(response.error);
    return response.data;
  },
};

export default fieldService;
