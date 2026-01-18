import React from "react";
import { Plus, Key } from "lucide-react";
import CredentialItem from "./CredentialItem";
import EmptyState from "./EmptyState";

const CredentialManagementTab = ({ credentials, onAdd, onEdit, onDelete }) => {
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-900">
          Login Credentials ({credentials.length})
        </h2>
        <button
          onClick={onAdd}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Credential
        </button>
      </div>

      {credentials.length === 0 ? (
        <EmptyState icon={Key} message="No credentials found." />
      ) : (
        <div className="space-y-2">
          {credentials.map((credential) => (
            <CredentialItem
              key={credential.id}
              credential={credential}
              onEdit={onEdit}
              onDelete={onDelete}
              disableDelete={credentials.length === 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CredentialManagementTab;
