import React from "react";
import { Plus, FileText } from "lucide-react";
import FieldItem from "./FieldItem";
import EmptyState from "./EmptyState";

const FieldManagementTab = ({
  fields,
  onAdd,
  onEdit,
  onDelete,
  onToggleActive,
  onDragStart,
  onDragOver,
  onDrop,
}) => {
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-900">
          All Fields ({fields.length})
        </h2>
        <button
          onClick={onAdd}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Field
        </button>
      </div>

      {fields.length === 0 ? (
        <EmptyState
          icon={FileText}
          message="No fields yet. Add your first field to get started."
        />
      ) : (
        <div className="space-y-2">
          {fields.map((field) => (
            <FieldItem
              key={field.id}
              field={field}
              onDragStart={onDragStart}
              onDragOver={onDragOver}
              onDrop={onDrop}
              onToggleActive={onToggleActive}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default FieldManagementTab;
