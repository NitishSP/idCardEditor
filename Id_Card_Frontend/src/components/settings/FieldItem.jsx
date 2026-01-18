import React from "react";
import { GripVertical, Eye, EyeOff, Edit, Trash2 } from "lucide-react";

const FieldItem = ({
  field,
  onDragStart,
  onDragOver,
  onDrop,
  onToggleActive,
  onEdit,
  onDelete,
}) => {
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, field)}
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, field)}
      className={`p-4 flex items-center gap-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-move ${
        field.isActive === 0 ? "opacity-50" : ""
      }`}
    >
      <GripVertical className="w-5 h-5 text-gray-400" />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-medium text-gray-900">{field.label}</h3>
          {field.isRequired === 1 && (
            <span className="px-2 py-0.5 text-xs font-medium bg-red-100 text-red-700 rounded">
              Required
            </span>
          )}
          {field.isActive === 0 && (
            <span className="px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-600 rounded">
              Inactive
            </span>
          )}
        </div>
        <div className="text-sm text-gray-600">
          <span className="font-medium">Type:</span> {field.fieldType} •
          <span className="font-medium ml-2">Default:</span>{" "}
          {field.defaultValue}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => onToggleActive(field)}
          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          title={field.isActive === 1 ? "Deactivate" : "Activate"}
        >
          {field.isActive === 1 ? (
            <Eye className="w-5 h-5" />
          ) : (
            <EyeOff className="w-5 h-5" />
          )}
        </button>
        <button
          onClick={() => onEdit(field)}
          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
        >
          <Edit className="w-5 h-5" />
        </button>
        <button
          onClick={() => onDelete(field)}
          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          title="Delete field"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default FieldItem;
