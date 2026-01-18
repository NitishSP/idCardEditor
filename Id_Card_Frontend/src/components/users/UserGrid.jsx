import React from "react";
import { Users } from "lucide-react";
import UserCard from "./UserCard";

const UserGrid = ({
  users,
  isLoading,
  onView,
  onEdit,
  onDelete,
  hasSearchResults,
  totalUsers,
  fields,
}) => {
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

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {users.map((user) => (
        <UserCard
          key={user.id}
          user={user}
          onView={onView}
          onEdit={onEdit}
          onDelete={onDelete}
          fields={fields}
        />
      ))}
    </div>
  );
};

export default UserGrid;
