import React, { useState } from "react";
import { Settings as SettingsIcon } from "lucide-react";
import toast from "react-hot-toast";
import Navbar from "../components/Navbar";
import TabNavigation from "../components/settings/TabNavigation";
import FieldManagementTab from "../components/settings/FieldManagementTab";
import CredentialManagementTab from "../components/settings/CredentialManagementTab";
import SystemTab from "../components/settings/SystemTab";
import FieldFormModal from "../components/settings/FieldFormModal";
import CredentialFormModal from "../components/settings/CredentialFormModal";
import {
  useFields,
  useCreateField,
  useUpdateField,
  useDeleteField,
  useToggleFieldActive,
  useUpdateFieldsOrder,
} from "../hooks/useFields";
import {
  useCredentials,
  useCreateCredential,
  useUpdateCredential,
  useDeleteCredential,
} from "../hooks/useCredentials";
import useModalStore from "../store/useModalStore";
import useAuthStore from "../store/useAuthStore";

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState("fields");
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [draggedItem, setDraggedItem] = useState(null);

  const [fieldFormData, setFieldFormData] = useState({
    label: "",
    defaultValue: "",
    fieldType: "text",
    isRequired: 0,
    displayOrder: 0,
  });

  const [credentialFormData, setCredentialFormData] = useState({
    username: "",
    password: "",
  });

  // Check if logged-in user has root access using Zustand
  const isRootUser = useAuthStore((state) => state.isRootUser());

  // Fetch data
  const { data: fieldsData, isLoading: isLoadingFields } = useFields();
  const { data: credentialsData, isLoading: isLoadingCredentials } =
    useCredentials();
  const fields = fieldsData || [];
  const credentials = credentialsData || [];

  const { showConfirm } = useModalStore();

  // Field mutations
  const createFieldMutation = useCreateField({
    onSuccess: () => {
      setShowModal(false);
      resetForm();
      toast.success("Field created successfully");
      setTimeout(() => {
        window.location.reload();
      }, 500);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create field");
    },
  });

  const updateFieldMutation = useUpdateField({
    onSuccess: () => {
      setShowModal(false);
      setEditingItem(null);
      resetForm();
      toast.success("Field updated successfully");
      setTimeout(() => {
        window.location.reload();
      }, 500);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update field");
    },
  });

  const deleteFieldMutation = useDeleteField({
    onSuccess: () => {
      toast.success("Field deleted successfully");
      setTimeout(() => {
        window.location.reload();
      }, 500);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete field");
    },
  });

  const toggleFieldActiveMutation = useToggleFieldActive({
    onSuccess: () => {
      toast.success("Field status updated");
      setTimeout(() => {
        window.location.reload();
      }, 500);
    },
  });

  const updateFieldsOrderMutation = useUpdateFieldsOrder({
    onSuccess: () => {
      toast.success("Field order updated");
    },
  });

  // Credential mutations
  const createCredentialMutation = useCreateCredential({
    onSuccess: () => {
      setShowModal(false);
      resetForm();
      toast.success("Credential created successfully");
      setTimeout(() => {
        window.location.reload();
      }, 500);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create credential");
    },
  });

  const updateCredentialMutation = useUpdateCredential({
    onSuccess: () => {
      setShowModal(false);
      setEditingItem(null);
      resetForm();
      toast.success("Credential updated successfully");
      setTimeout(() => {
        window.location.reload();
      }, 500);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update credential");
    },
  });

  const deleteCredentialMutation = useDeleteCredential({
    onSuccess: () => {
      toast.success("Credential deleted successfully");
      setTimeout(() => {
        window.location.reload();
      }, 500);
    },
  });

  const resetForm = () => {
    setFieldFormData({
      label: "",
      defaultValue: "",
      fieldType: "text",
      isRequired: 0,
      displayOrder: 0,
    });
    setCredentialFormData({
      username: "",
      password: "",
    });
  };

  // Field handlers
  const handleOpenCreateFieldModal = () => {
    resetForm();
    setEditingItem(null);
    setFieldFormData({ ...fieldFormData, displayOrder: fields.length + 1 });
    setShowModal(true);
  };

  const handleOpenEditFieldModal = (field) => {
    setEditingItem(field);
    setFieldFormData({
      label: field.label,
      defaultValue: field.defaultValue,
      fieldType: field.fieldType,
      isRequired: field.isRequired,
      displayOrder: field.displayOrder,
    });
    setShowModal(true);
  };

  const handleFieldSubmit = (e) => {
    e.preventDefault();

    if (!fieldFormData.label || !fieldFormData.defaultValue) {
      toast.error("Label and Default Value are required");
      return;
    }

    if (editingItem) {
      updateFieldMutation.mutate({
        id: editingItem.id,
        ...fieldFormData,
      });
    } else {
      createFieldMutation.mutate(fieldFormData);
    }
  };

  const handleDeleteField = async (field) => {
    try {
      // Check field usage
      const usage = await window.electron.fields.checkUsage(field.id);
      
      if (!usage.success) {
        toast.error(usage.error || 'Failed to check field usage');
        return;
      }

      const { usersCount, templatesCount } = usage.data;
      
      let message = `Are you sure you want to delete "${field.label}"?`;
      let warnings = [];

      if (usersCount > 0) {
        warnings.push(`• This field exists in ${usersCount} user${usersCount > 1 ? 's' : ''} and will be removed from their data`);
      }

      if (templatesCount > 0) {
        warnings.push(`• This field is used in ${templatesCount} template${templatesCount > 1 ? 's' : ''} and will be removed`);
      }

      if (warnings.length > 0) {
        message += '\n\n⚠️ Warning:\n' + warnings.join('\n');
        message += '\n\nThis action cannot be undone.';
      }

      showConfirm({
        message,
        onConfirm: () => deleteFieldMutation.mutate(field.id),
      });
    } catch (error) {
      toast.error('Failed to check field usage');
      console.error(error);
    }
  };

  const handleToggleFieldActive = (field) => {
    toggleFieldActiveMutation.mutate(field.id);
  };

  // Drag and drop handlers
  const handleDragStart = (e, field) => {
    setDraggedItem(field);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e, targetField) => {
    e.preventDefault();

    if (!draggedItem || draggedItem.id === targetField.id) return;

    const reorderedFields = [...fields];
    const draggedIndex = reorderedFields.findIndex(
      (f) => f.id === draggedItem.id
    );
    const targetIndex = reorderedFields.findIndex(
      (f) => f.id === targetField.id
    );

    const [removed] = reorderedFields.splice(draggedIndex, 1);
    reorderedFields.splice(targetIndex, 0, removed);

    const updatedFields = reorderedFields.map((field, index) => ({
      id: field.id,
      displayOrder: index + 1,
    }));

    updateFieldsOrderMutation.mutate(updatedFields);
    setDraggedItem(null);
  };

  // Credential handlers
  const handleOpenCreateCredentialModal = () => {
    resetForm();
    setEditingItem(null);
    setShowModal(true);
  };

  const handleOpenEditCredentialModal = (credential) => {
    setEditingItem(credential);
    setCredentialFormData({
      username: credential.username,
      password: "",
    });
    setShowModal(true);
  };

  const handleCredentialSubmit = (e) => {
    e.preventDefault();

    // Check root access
    if (!isRootUser) {
      toast.error("You don't have permission to manage credentials");
      return;
    }

    if (!credentialFormData.username || !credentialFormData.password) {
      toast.error("Username and Password are required");
      return;
    }

    if (editingItem) {
      updateCredentialMutation.mutate({
        id: editingItem.id,
        ...credentialFormData,
      });
    } else {
      createCredentialMutation.mutate(credentialFormData);
    }
  };

  const handleDeleteCredential = (credential) => {
    if (credentials.length === 1) {
      toast.error("Cannot delete the last credential");
      return;
    }

    showConfirm({
      message: `Are you sure you want to delete "${credential.username}"?`,
      onConfirm: () => deleteCredentialMutation.mutate(credential.id),
    });
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingItem(null);
    resetForm();
  };

  const isLoading = isLoadingFields || isLoadingCredentials;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <div className="text-gray-500">Loading settings...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center gap-3">
            <SettingsIcon className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
              <p className="text-gray-600 text-sm mt-1">
                Manage system configuration and credentials
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <TabNavigation 
            activeTab={activeTab} 
            onTabChange={setActiveTab}
            isRootUser={isRootUser}
          />

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === "fields" ? (
              <FieldManagementTab
                fields={fields}
                onAdd={handleOpenCreateFieldModal}
                onEdit={handleOpenEditFieldModal}
                onDelete={handleDeleteField}
                onToggleActive={handleToggleFieldActive}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              />
            ) : activeTab === "credentials" ? (
              isRootUser ? (
                <CredentialManagementTab
                  credentials={credentials}
                  onAdd={handleOpenCreateCredentialModal}
                  onEdit={handleOpenEditCredentialModal}
                  onDelete={handleDeleteCredential}
                />
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500">Access restricted to root users only</p>
                </div>
              )
            ) : (
              isRootUser ? (
                <SystemTab />
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500">Access restricted to root users only</p>
                </div>
              )
            )
            }
          </div>
        </div>
      </div>

      {/* Modals */}
      {activeTab === "fields" ? (
        <FieldFormModal
          isOpen={showModal}
          onClose={handleCloseModal}
          onSubmit={handleFieldSubmit}
          formData={fieldFormData}
          onChange={setFieldFormData}
          isEditing={!!editingItem}
          isSubmitting={
            createFieldMutation.isPending || updateFieldMutation.isPending
          }
        />
      ) : (
        <CredentialFormModal
          isOpen={showModal}
          onClose={handleCloseModal}
          onSubmit={handleCredentialSubmit}
          formData={credentialFormData}
          onChange={setCredentialFormData}
          isEditing={!!editingItem}
          isSubmitting={
            createCredentialMutation.isPending ||
            updateCredentialMutation.isPending
          }
        />
      )}
    </div>
  );
};

export default SettingsPage;
