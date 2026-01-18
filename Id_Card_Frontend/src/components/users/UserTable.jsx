import React from "react";
import { Users, Eye, Edit, Trash2 } from "lucide-react";
import { getFieldValue as getFieldValueUtil } from "../../utils/fieldMapping";

const UserTable = ({
  users,
  isLoading,
  onView,
  onEdit,
  onDelete,
  totalUsers,
  fields,
}) => {
  // Get active fields to display as columns
  const activeFields = fields?.filter(f => f.isActive === 1) || [];
  
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading users...</p>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8 text-center">
        <Users size={48} className="mx-auto text-gray-300 mb-4" />
        <p className="text-gray-600 text-lg mb-2">
          {totalUsers === 0 ? "No users found" : "No users match your search"}
        </p>
        <p className="text-gray-500 text-sm">
          {totalUsers === 0 && 'Click "Add User" to create your first user'}
        </p>
      </div>
    );
  }

  const getFieldValue = (user, field) => {
    const value = getFieldValueUtil(user, field);
    return value || '-';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {activeFields.map((field) => (
                <th
                  key={field.id}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {field.label}
                </th>
              ))}
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                {activeFields.map((field) => {
                  const value = getFieldValue(user, field);
                  
                  return (
                    <td key={field.id} className="px-6 py-4 whitespace-nowrap">
                      {field.fieldType === 'photo' && value ? (
                        <img
                          src={value}
                          alt={user.name || 'User'}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="text-sm text-gray-900">{value}</div>
                      )}
                    </td>
                  );
                })}
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => onView(user)}
                      className="text-blue-600 hover:text-blue-900"
                      title="View"
                    >
                      <Eye size={18} />
                    </button>
                    <button
                      onClick={() => onEdit(user)}
                      className="text-green-600 hover:text-green-900"
                      title="Edit"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => onDelete(user)}
                      className="text-red-600 hover:text-red-900"
                      title="Delete"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserTable;
