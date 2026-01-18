import React from "react";
import { Key, Edit, Trash2 } from "lucide-react";

const CredentialItem = ({ credential, onEdit, onDelete, disableDelete }) => {
  return (
    <div className="p-4 flex items-center justify-between bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
      <div className="flex items-center gap-3">
        <Key className="w-5 h-5 text-gray-400" />
        <div>
          <h3 className="font-medium text-gray-900">{credential.username}</h3>
          <p className="text-xs text-gray-500">
            Created: {new Date(credential.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => onEdit(credential)}
          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
        >
          <Edit className="w-5 h-5" />
        </button>
        <button
          onClick={() => onDelete(credential)}
          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          disabled={disableDelete}
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default CredentialItem;
