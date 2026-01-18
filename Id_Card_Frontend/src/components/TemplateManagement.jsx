import React, { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Edit, Trash2, Plus, RefreshCw } from "lucide-react";
import { useTemplates, useDeleteTemplate } from "../hooks/useTemplates";
import useModalStore from "../store/useModalStore";

const TemplateManagement = () => {
  const navigate = useNavigate();
  const { data: templatesData, isLoading, refetch } = useTemplates();
  const templates = templatesData || [];
  const deleteTemplateMutation = useDeleteTemplate();
  const { showConfirm } = useModalStore();

  const handleEdit = useCallback(
    (template) => {
      // Navigate to editor with template name (URL-encoded)
      const encodedName = encodeURIComponent(template.name);
      navigate(`/template-editor/${encodedName}`);
    },
    [navigate]
  );

  const handleDelete = useCallback(
    (template) => {
      showConfirm({
        title: "Delete Template",
        message: `Are you sure you want to delete "${template.name}"? This action cannot be undone.`,
        confirmText: "Delete",
        cancelText: "Cancel",
        onConfirm: () => {
          deleteTemplateMutation.mutate(template.id);
        },
      });
    },
    [showConfirm, deleteTemplateMutation]
  );

  const handleCreateNew = useCallback(() => {
    // Navigate to editor with 'new' to create a new template
    navigate("/template-editor/new");
  }, [navigate]);

  return (
    <div className="bg-white border-b border-gray-200 shadow-sm">
      <div className="px-4 py-3">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-800">Template Management</h3>
            <button
              onClick={() => refetch()}
              disabled={isLoading}
              className="p-1 hover:bg-gray-100 rounded transition-all"
              title="Refresh templates"
            >
              <RefreshCw
                size={16}
                className={
                  isLoading ? "animate-spin text-gray-400" : "text-gray-600"
                }
              />
            </button>
          </div>

          <button
            onClick={handleCreateNew}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 font-medium shadow-sm transition-all text-sm"
          >
            <Plus size={18} />
            Create New Template
          </button>
        </div>

        {/* Templates Table */}
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider w-16">
                  Preview
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Template Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider w-32">
                  Created
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider w-32">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {templates.map((template) => (
                <tr
                  key={template.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-4 py-3">
                    {template.thumbnail ? (
                      <img
                        src={template.thumbnail}
                        alt={template.name}
                        className="w-12 h-12 object-cover rounded border border-gray-200"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-100 rounded border border-gray-200 flex items-center justify-center">
                        <span className="text-xs text-gray-400">
                          No preview
                        </span>
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-gray-900">
                      {template.name}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-xs text-gray-500">
                      {new Date(template.createdAt).toLocaleDateString()}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEdit(template)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit Template"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(template)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Template"
                        disabled={deleteTemplateMutation.isPending}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {templates.length === 0 && !isLoading && (
                <tr>
                  <td
                    colSpan="4"
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    <p className="text-sm">No templates found</p>
                    <p className="text-xs mt-1">
                      Click "Create New Template" to get started
                    </p>
                  </td>
                </tr>
              )}

              {isLoading && (
                <tr>
                  <td
                    colSpan="4"
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    <RefreshCw
                      size={24}
                      className="animate-spin mx-auto mb-2"
                    />
                    <p className="text-sm">Loading templates...</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TemplateManagement;
