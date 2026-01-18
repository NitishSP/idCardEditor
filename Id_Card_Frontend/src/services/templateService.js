/**
 * Template Service
 * All API calls related to templates using Electron IPC
 */

export const templateService = {
  // Get all templates (summary view)
  getAllTemplates: async () => {
    const response = await window.electron.templates.getAll();
    if (!response.success) throw new Error(response.error);
    return response.data;
  },

  // Get single template by ID (with full data)
  getTemplateById: async (id) => {
    const response = await window.electron.templates.getById(id);
    if (!response.success) throw new Error(response.error);
    return response.data;
  },

  // Get template by name
  getTemplateByName: async (name) => {
    const response = await window.electron.templates.getByName(name);
    if (!response.success) throw new Error(response.error);
    return response.data;
  },

  // Create new template
  createTemplate: async (templateData) => {
    const response = await window.electron.templates.create(templateData);
    if (!response.success) throw new Error(response.error);
    return response;
  },

  // Update existing template
  updateTemplate: async ({ name, data }) => {
    const response = await window.electron.templates.update({ name, ...data });
    if (!response.success) throw new Error(response.error);
    return response;
  },

  // Delete template
  deleteTemplate: async (id) => {
    const response = await window.electron.templates.delete(id);
    if (!response.success) throw new Error(response.error);
    return response;
  },
};

export default templateService;
