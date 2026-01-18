import React from "react";
import { Database, Trash2, AlertCircle } from "lucide-react";
import useModalStore from "../../store/useModalStore";
import toast from "react-hot-toast";

const SystemTab = () => {
  const { showConfirm } = useModalStore();

  const handleClearAllData = () => {
    showConfirm({
      title: "Clear All Data",
      message:
        "⚠️ WARNING: This will delete ALL data including users, templates, fields, and credentials. This action cannot be undone. Are you absolutely sure?",
      confirmText: "Yes, Delete Everything",
      cancelText: "Cancel",
      onConfirm: async () => {
        try {
          const response = await window.electron.system.clearAllData();
          if (response.success) {
            toast.success("All data cleared successfully. Please restart the application.");
          } else {
            toast.error(response.error || "Failed to clear data");
          }
        } catch {
          toast.error("Failed to clear data");
        }
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Database size={24} className="text-gray-700" />
        <div>
          <h2 className="text-2xl font-bold text-gray-800">System Settings</h2>
          <p className="text-sm text-gray-500">
            Manage system-level operations and data
          </p>
        </div>
      </div>

      {/* Warning Section */}
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
        <div className="flex items-start gap-3">
          <AlertCircle className="text-yellow-600 mt-0.5" size={20} />
          <div>
            <h3 className="text-sm font-semibold text-yellow-800">
              Danger Zone
            </h3>
            <p className="text-sm text-yellow-700 mt-1">
              Actions in this section are irreversible. Please proceed with caution.
            </p>
          </div>
        </div>
      </div>

      {/* Clear All Data */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Trash2 size={20} className="text-red-600" />
              Clear All Data
            </h3>
            <p className="text-sm text-gray-600 mt-2">
              Permanently delete all users, templates, custom fields, and login
              credentials from the database. This will reset the application to
              its initial state.
            </p>
            <div className="mt-3 space-y-1">
              <p className="text-xs text-gray-500">
                ⚠️ This will delete:
              </p>
              <ul className="text-xs text-gray-500 ml-4 space-y-1">
                <li>• All user records and photos</li>
                <li>• All ID card templates</li>
                <li>• All custom fields (except defaults)</li>
                <li>• All login credentials (except default admin)</li>
              </ul>
            </div>
          </div>
          <button
            onClick={handleClearAllData}
            className="ml-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 font-medium"
          >
            <Trash2 size={16} />
            Clear All Data
          </button>
        </div>
      </div>

      {/* App Information */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Application Information
        </h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Version:</span>
            <span className="ml-2 font-medium text-gray-800">1.0.0</span>
          </div>
          <div>
            <span className="text-gray-500">Platform:</span>
            <span className="ml-2 font-medium text-gray-800">Electron</span>
          </div>
          <div>
            <span className="text-gray-500">Database:</span>
            <span className="ml-2 font-medium text-gray-800">SQLite</span>
          </div>
          <div>
            <span className="text-gray-500">Author:</span>
            <span className="ml-2 font-medium text-gray-800">PixelVeda</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemTab;
