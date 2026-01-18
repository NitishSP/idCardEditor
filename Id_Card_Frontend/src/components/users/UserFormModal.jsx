import React from "react";
import { X, Upload } from "lucide-react";

const UserFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  fields,
  formData,
  onFieldChange,
  onImageUpload,
  photoPreview,
  isEditing,
  isSubmitting,
  fieldsLoading,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/30">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 sticky top-0 bg-white">
          <h2 className="text-xl font-bold text-gray-800">
            {isEditing ? "Edit User" : "Add New User"}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-6 space-y-4">
          {fieldsLoading ? (
            <div className="text-center py-8 text-gray-500">
              Loading fields...
            </div>
          ) : (
            fields
              .filter((f) => f.isActive === 1)
              .sort((a, b) => a.displayOrder - b.displayOrder)
              .map((field) => {
                const isPhotoField = field.fieldType === 'photo' || 
                                   field.label === "Profile Photo" ||
                                   field.label.toLowerCase().includes("photo");
                const inputValue = formData[field.label] || "";

                return (
                  <div key={field.id}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {field.label}
                      {(field.isRequired === 1 || isPhotoField) && (
                        <span className="text-red-500 ml-1">*</span>
                      )}
                    </label>

                    {isPhotoField ? (
                      <>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => onImageUpload(e, field.label)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required={!photoPreview && !inputValue}
                        />
                        {(photoPreview || inputValue) && (
                          <img
                            src={photoPreview || inputValue}
                            alt="Preview"
                            className="mt-2 w-32 h-32 object-cover rounded-lg border-2 border-gray-300"
                          />
                        )}
                      </>
                    ) : (
                      <input
                        type={field.fieldType}
                        value={inputValue}
                        onChange={(e) =>
                          onFieldChange(field.label, e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder={field.defaultValue}
                        required={field.isRequired === 1}
                      />
                    )}
                  </div>
                );
              })
          )}

          {/* Submit */}
          <div className="flex gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isEditing ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserFormModal;
