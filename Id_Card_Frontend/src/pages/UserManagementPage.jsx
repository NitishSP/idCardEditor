import React, { useState } from "react";
import toast from "react-hot-toast";
import ExcelJS from "exceljs";
import Navbar from "../components/Navbar";
import {
  getFieldValue,
  setFieldValue,
  getDbColumn,
  isCoreField,
} from "../utils/fieldMapping";
import {
  parseExcelFile,
  validateImportedData,
  convertToApiFormat,
  generateSampleExcel,
} from "../utils/excelImportUtils";
import {
  UserSearchBar,
  UserGrid,
  UserTable,
  UserFormModal,
  UserPageHeader,
  ViewModeToggle,
} from "../components/users";
import ImportUsersModal from "../components/users/ImportUsersModal";
import {
  useUsers,
  useDeleteUser,
  useCreateUser,
  useUpdateUser,
  useBulkUploadUsers,
} from "../hooks/useUsers";
import { useFields } from "../hooks/useFields";
import useModalStore from "../store/useModalStore";

const UserManagementPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({});
  const [photoPreview, setPhotoPreview] = useState("");
  const [viewMode, setViewMode] = useState("grid"); // 'grid' or 'table'

  // Fetch users and fields
  const { data: usersData, isLoading, refetch } = useUsers();
  const { data: fieldsData, isLoading: fieldsLoading } = useFields();
  const users = usersData?.data || [];
  const fields = fieldsData || [];

  const { showConfirm } = useModalStore();

  // Mutations
  const deleteUserMutation = useDeleteUser();
  const bulkUploadMutation = useBulkUploadUsers({
    onSuccess: () => {
      setShowImportModal(false);
    },
  });

  const createUserMutation = useCreateUser({
    onSuccess: () => {
      setShowCreateModal(false);
      resetForm();
      toast.success("User created successfully");
    },
  });

  const updateUserMutation = useUpdateUser({
    onSuccess: () => {
      setShowCreateModal(false);
      setEditingUser(null);
      resetForm();
      toast.success("User updated successfully");
    },
  });

  const resetForm = () => {
    const initialData = {};
    fields.forEach((field) => {
      initialData[field.label] = "";
    });
    setFormData(initialData);
    setPhotoPreview("");
  };

  const handleFieldChange = (fieldLabel, value) => {
    setFormData((prev) => ({
      ...prev,
      [fieldLabel]: value,
    }));
  };

  const handleImageUpload = (e, fieldLabel) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target.result;
      setFormData((prev) => ({ ...prev, [fieldLabel]: base64 }));
      setPhotoPreview(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate required fields
    const requiredFields = fields.filter(
      (f) => f.isRequired === 1 && f.isActive === 1
    );
    for (const field of requiredFields) {
      const value = formData[field.label];
      // Check if value exists and is not empty (handle strings, numbers, and other types)
      // For numbers: check if it's null/undefined, for strings: check if empty after trim
      const isEmpty =
        value === null ||
        value === undefined ||
        (typeof value === "string" && value.trim() === "");

      if (isEmpty) {
        toast.error(`${field.label} is required`);
        return;
      }
    }

    // Prepare user data dynamically from fields - START WITH EMPTY OBJECT
    const userData = {
      additionalData: {},
    };

    // Map fields to database columns dynamically
    fields.forEach((field) => {
      const value = formData[field.label];
      // Only set the value if it exists in formData
      if (value !== undefined && value !== null) {
        setFieldValue(userData, field, value);
      }
    });

    if (editingUser) {
      console.log("====================================");
      console.log("EditingUser", editingUser);
      console.log("userData being sent:", userData);
      console.log("====================================");
      updateUserMutation.mutate({ id: editingUser.id, ...userData });
    } else {
      createUserMutation.mutate(userData);
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    // Dynamically build user data from fields
    const userData = {};

    // Map database columns to field labels dynamically
    fields.forEach((field) => {
      userData[field.label] = getFieldValue(user, field);
    });

    setFormData(userData);
    // Find photo field and set preview
    const photoField = fields.find((f) => f.fieldType === "photo");
    const photoValue = photoField ? getFieldValue(user, photoField) : "";
    setPhotoPreview(photoValue);
    setShowCreateModal(true);
  };

  const handleDelete = (user) => {
    // Get name dynamically from fields
    const nameField = fields.find((f) => f.label.toLowerCase() === "name");
    const userName = nameField ? getFieldValue(user, nameField) : "this user";

    showConfirm({
      title: "Delete User",
      message: `Are you sure you want to delete ${userName}? This action cannot be undone.`,
      confirmText: "Delete",
      cancelText: "Cancel",
      onConfirm: () => {
        deleteUserMutation.mutate(user.id);
      },
    });
  };

  const handleViewUser = (user) => {
    const activeFields = fields.filter((f) => f.isActive === 1);
    const photoField = activeFields.find((f) => f.fieldType === "photo");
    const photoValue = photoField ? getFieldValue(user, photoField) : null;
    const nameField = activeFields.find(
      (f) => f.label.toLowerCase() === "name"
    );
    const nameValue = nameField ? getFieldValue(user, nameField) : "User";

    toast(
      (t) => (
        <div className="max-w-md">
          <div className="font-bold text-lg mb-2">User Details</div>
          <div className="space-y-2 text-sm">
            {activeFields.map((field) => {
              // Skip photo in list, show it separately
              if (field.fieldType === "photo") return null;

              const value = getFieldValue(user, field);

              return (
                <p key={field.id}>
                  <strong>{field.label}:</strong> {value || "N/A"}
                </p>
              );
            })}
            <p>
              <strong>Created:</strong>{" "}
              {new Date(user.createdAt).toLocaleString()}
            </p>
            {photoValue && (
              <img
                src={photoValue}
                alt={nameValue}
                className="w-32 h-32 object-cover rounded-lg border"
              />
            )}
          </div>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="mt-3 w-full bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700"
          >
            Close
          </button>
        </div>
      ),
      {
        duration: Infinity,
        style: { maxWidth: "500px" },
      }
    );
  };

  const handleAddUser = () => {
    resetForm();
    setEditingUser(null);
    setShowCreateModal(true);
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
    setEditingUser(null);
    resetForm();
  };

  // Import Excel handlers
  const handleOpenImportModal = () => {
    setShowImportModal(true);
  };

  const handleCloseImportModal = () => {
    setShowImportModal(false);
  };

  const handleDownloadSample = async () => {
    try {
      const activeFields = fields.filter((f) => f.isActive === 1);

      if (activeFields.length === 0) {
        toast.error("No active fields configured. Please add fields first.");
        return;
      }

      toast.loading("Generating sample template...");
      const blob = await generateSampleExcel(activeFields);

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      const timestamp = new Date()
        .toISOString()
        .slice(0, 19)
        .replace(/:/g, "-");
      link.download = `User_Import_Template_${timestamp}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.dismiss();
      toast.success("Sample template downloaded successfully");
    } catch (error) {
      toast.dismiss();
      console.error("Download sample error:", error);
      toast.error(error.message || "Failed to download sample template");
    }
  };

  const handleValidateFile = async (file) => {
    try {
      const activeFields = fields.filter((f) => f.isActive === 1);

      if (activeFields.length === 0) {
        throw new Error(
          "No active fields configured. Please add fields first."
        );
      }

      toast.loading("Parsing Excel file...");
      const records = await parseExcelFile(file, activeFields);
      toast.dismiss();

      if (records.length === 0) {
        throw new Error("Excel file is empty or contains no valid data");
      }

      toast.loading("Validating data...");
      const { validRecords, invalidRecords } = validateImportedData(
        records,
        activeFields
      );
      toast.dismiss();

      if (validRecords.length === 0 && invalidRecords.length > 0) {
        toast.error(
          `All ${invalidRecords.length} records have validation errors. Please fix and try again.`
        );
      } else if (validRecords.length > 0) {
        toast.success(
          `Found ${validRecords.length} valid records${
            invalidRecords.length > 0
              ? ` and ${invalidRecords.length} invalid records`
              : ""
          }`
        );
      }

      return { validRecords, invalidRecords };
    } catch (error) {
      toast.dismiss();
      console.error("Validation error:", error);
      throw error;
    }
  };

  const handleImportUsers = async (validDataArray) => {
    try {
      if (!Array.isArray(validDataArray) || validDataArray.length === 0) {
        toast.error("No valid data to import");
        return;
      }

      console.log("Importing data array:", validDataArray);

      const activeFields = fields.filter((f) => f.isActive === 1);
      const apiData = convertToApiFormat(validDataArray, activeFields);

      console.log("Converted API data:", apiData);

      toast.loading(`Importing ${apiData.length} users...`);
      await bulkUploadMutation.mutateAsync(apiData);
      toast.dismiss();
    } catch (error) {
      toast.dismiss();
      console.error("Import error:", error);
      toast.error(error.message || "Failed to import users");
    }
  };

  const handleExportExcel = async () => {
    if (users.length === 0) {
      toast.error("No users to export");
      return;
    }

    try {
      // Create a new workbook and worksheet
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Users");

      // Get active fields to determine columns dynamically
      const activeFields = fields.filter((f) => f.isActive === 1);
      const columns = [];

      // Add columns based on active fields
      activeFields.forEach((field) => {
        const dbColumn = getDbColumn(field.label);
        const key = dbColumn || field.label;

        columns.push({
          header: field.label,
          key: key,
          width: field.fieldType === "photo" ? 15 : 20,
        });
      });

      // Add timestamp columns at the end
      columns.push({ header: "Created At", key: "createdAt", width: 25 });
      columns.push({ header: "Updated At", key: "updatedAt", width: 25 });

      worksheet.columns = columns;

      // Style header row
      worksheet.getRow(1).font = { bold: true, size: 12 };
      worksheet.getRow(1).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF4472C4" },
      };
      worksheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
      worksheet.getRow(1).alignment = {
        vertical: "middle",
        horizontal: "center",
      };

      // Add user data rows
      for (let i = 0; i < users.length; i++) {
        const user = users[i];
        const rowData = {
          createdAt: new Date(user.createdAt).toLocaleString(),
          updatedAt: new Date(user.updatedAt).toLocaleString(),
        };

        // Add field data dynamically
        activeFields.forEach((field) => {
          const dbColumn = getDbColumn(field.label);
          const key = dbColumn || field.label;
          const value = getFieldValue(user, field);

          // For photo fields, initialize empty (will be replaced with image)
          rowData[key] = field.fieldType === "photo" ? "" : value;
        });

        const row = worksheet.addRow(rowData);
        row.height = 80; // Set row height to accommodate image

        // Find photo field and add image if available
        const photoField = activeFields.find((f) => f.fieldType === "photo");
        const photoValue = photoField ? getFieldValue(user, photoField) : null;

        if (photoValue && photoValue.startsWith("data:image")) {
          try {
            // Extract image extension and base64 data
            const matches = user.photo.match(/^data:image\/(\w+);base64,(.+)$/);
            if (matches) {
              const extension = matches[1];
              const base64Data = matches[2];

              // Add image to workbook
              const imageId = workbook.addImage({
                base64: base64Data,
                extension:
                  extension === "jpeg"
                    ? "jpeg"
                    : extension === "jpg"
                    ? "jpeg"
                    : "png",
              });

              // Insert image into cell (find photo column index)
              const photoColIndex = activeFields.findIndex(
                (f) => f.fieldType === "photo"
              );
              worksheet.addImage(imageId, {
                tl: { col: photoColIndex, row: i + 1 },
                ext: { width: 80, height: 80 },
                editAs: "oneCell",
              });
            }
          } catch (imgError) {
            const nameField = activeFields.find(
              (f) => f.label.toLowerCase() === "name"
            );
            const nameValue = nameField
              ? getFieldValue(user, nameField)
              : "user";
            console.warn(`Failed to add image for ${nameValue}:`, imgError);
            const photoKey = getDbColumn(photoField.label) || photoField.label;
            row.getCell(photoKey).value = "❌";
          }
        } else if (photoField) {
          const photoKey = getDbColumn(photoField.label) || photoField.label;
          row.getCell(photoKey).value = "No Photo";
          row.getCell(photoKey).alignment = {
            vertical: "middle",
            horizontal: "center",
          };
        }
      }

      // Generate filename with timestamp
      const timestamp = new Date()
        .toISOString()
        .replace(/[:.]/g, "-")
        .slice(0, -5);
      const filename = `Users_Export_${timestamp}.xlsx`;

      // Write to file
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      link.click();
      window.URL.revokeObjectURL(url);

      toast.success(
        `Exported ${users.length} user${
          users.length > 1 ? "s" : ""
        } to Excel with photos`
      );
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export to Excel");
    }
  };

  // Filter users based on search - search across all active fields
  const filteredUsers = users.filter((user) => {
    if (searchTerm === "") return true;

    const searchLower = searchTerm.toLowerCase();
    const activeFields = fields.filter(
      (f) => f.isActive === 1 && f.fieldType !== "photo"
    );

    // Search in any text-based field
    return activeFields.some((field) => {
      const value = getFieldValue(user, field);
      return value && value.toString().toLowerCase().includes(searchLower);
    });
  });

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <div className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          <UserPageHeader
            totalUsers={users.length}
            onRefresh={refetch}
            onAddUser={handleAddUser}
            onExportExcel={handleExportExcel}
            onImportExcel={handleOpenImportModal}
            isLoading={isLoading}
          />

          <UserSearchBar
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            totalUsers={users.length}
            filteredCount={filteredUsers.length}
          />

          {/* View Mode Toggle */}
          <div className="mt-6 flex justify-end">
            <ViewModeToggle
              viewMode={viewMode}
              onViewModeChange={setViewMode}
            />
          </div>

          <div className="mt-6">
            {viewMode === "grid" ? (
              <UserGrid
                users={filteredUsers}
                isLoading={isLoading}
                onView={handleViewUser}
                onEdit={handleEdit}
                onDelete={handleDelete}
                totalUsers={users.length}
                fields={fields}
              />
            ) : (
              <UserTable
                users={filteredUsers}
                isLoading={isLoading}
                onView={handleViewUser}
                onEdit={handleEdit}
                onDelete={handleDelete}
                totalUsers={users.length}
                fields={fields}
              />
            )}
          </div>
        </div>
      </div>

      <UserFormModal
        isOpen={showCreateModal}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        fields={fields}
        formData={formData}
        onFieldChange={handleFieldChange}
        onImageUpload={handleImageUpload}
        photoPreview={photoPreview}
        isEditing={!!editingUser}
        isSubmitting={
          createUserMutation.isPending || updateUserMutation.isPending
        }
        fieldsLoading={fieldsLoading}
      />

      <ImportUsersModal
        isOpen={showImportModal}
        onClose={handleCloseImportModal}
        onValidate={handleValidateFile}
        onImport={handleImportUsers}
        onDownloadSample={handleDownloadSample}
        fields={fields}
        isImporting={bulkUploadMutation.isPending}
      />
    </div>
  );
};

export default UserManagementPage;
