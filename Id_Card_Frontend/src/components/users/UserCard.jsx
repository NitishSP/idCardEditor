import React from "react";
import { Eye, Edit, Trash2 } from "lucide-react";
import { getFieldValue as getFieldValueUtil } from "../../utils/fieldMapping";

const UserCard = ({ user, onView, onEdit, onDelete, fields }) => {
  // Get active fields to display
  const activeFields = fields?.filter(f => f.isActive === 1) || [];
  
  // Get photo field
  const photoField = activeFields.find(f => f.fieldType === 'photo');
  const photoValue = photoField ? getFieldValueUtil(user, photoField) : null;
  
  // Get fields to display (limit to 3 for card view)
  const displayFields = activeFields
    .filter(f => f.fieldType !== 'photo')
    .slice(0, 3);
  
  // Get name field for display
  const nameField = displayFields.find(f => f.label.toLowerCase() === 'name');
  const nameValue = nameField ? getFieldValueUtil(user, nameField) : '';
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-4">
        {photoValue && (
          <img
            src={photoValue}
            alt={nameValue || 'User'}
            className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
          />
        )}
        <div className="flex-1 min-w-0">
          {displayFields.map((field) => {
            const value = getFieldValueUtil(user, field);
            const isNameField = field.label.toLowerCase() === 'name';
            
            return (
              <p key={field.id} className={isNameField ? "font-semibold text-gray-900 truncate" : "text-sm text-gray-600"}>
                {isNameField ? value : `${field.label}: ${value}`}
              </p>
            );
          })}
        </div>
      </div>
      <div className="mt-4 flex gap-2">
        <button
          onClick={() => onView(user)}
          className="flex-1 px-3 py-1.5 text-sm bg-blue-50 text-blue-600 rounded hover:bg-blue-100 flex items-center justify-center gap-1"
        >
          <Eye size={14} />
          View
        </button>
        <button
          onClick={() => onEdit(user)}
          className="flex-1 px-3 py-1.5 text-sm bg-green-50 text-green-600 rounded hover:bg-green-100 flex items-center justify-center gap-1"
        >
          <Edit size={14} />
          Edit
        </button>
        <button
          onClick={() => onDelete(user)}
          className="flex-1 px-3 py-1.5 text-sm bg-red-50 text-red-600 rounded hover:bg-red-100 flex items-center justify-center gap-1"
        >
          <Trash2 size={14} />
          Delete
        </button>
      </div>
    </div>
  );
};

export default UserCard;
