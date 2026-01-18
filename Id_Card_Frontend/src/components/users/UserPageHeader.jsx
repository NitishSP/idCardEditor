import React from "react";
import { Users, Plus, RefreshCw, Download, Upload } from "lucide-react";

const UserPageHeader = ({
  totalUsers,
  onRefresh,
  onAddUser,
  onExportExcel,
  onImportExcel,
  isLoading,
}) => {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Users size={32} className="text-blue-600" />
            User Management
          </h1>
          <p className="text-gray-600 mt-1">Manage employee records</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center gap-2 shadow-sm transition-all"
          >
            <RefreshCw size={18} className={isLoading ? "animate-spin" : ""} />
            Refresh
          </button>
          <button
            onClick={onImportExcel}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2 shadow-md transition-all"
          >
            <Upload size={18} />
            Import Excel
          </button>
          <button
            onClick={onExportExcel}
            disabled={totalUsers === 0}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2 shadow-md transition-all"
          >
            <Download size={18} />
            Export Excel
          </button>
          <button
            onClick={onAddUser}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 shadow-md transition-all"
          >
            <Plus size={18} />
            Add User
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserPageHeader;
