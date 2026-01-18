import React from "react";
import { Search } from "lucide-react";

const UserSearchBar = ({
  searchTerm,
  onSearchChange,
  totalUsers,
  filteredCount,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
      <div className="relative">
        <Search
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          size={18}
        />
        <input
          type="text"
          placeholder="Search by name or employee ID..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      <div className="mt-2 text-sm text-gray-600">
        Showing {filteredCount} of {totalUsers} users
      </div>
    </div>
  );
};

export default UserSearchBar;
