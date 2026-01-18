import React from "react";
import { LayoutGrid, Table } from "lucide-react";

const ViewModeToggle = ({ viewMode, onViewModeChange }) => {
  return (
    <div className="flex items-center gap-2 bg-white border border-gray-300 rounded-lg p-1">
      <button
        onClick={() => onViewModeChange("grid")}
        className={`flex items-center gap-2 px-3 py-1.5 rounded transition-colors ${
          viewMode === "grid"
            ? "bg-blue-600 text-white"
            : "text-gray-600 hover:bg-gray-100"
        }`}
        title="Grid View"
      >
        <LayoutGrid size={18} />
        <span className="text-sm font-medium">Grid</span>
      </button>
      <button
        onClick={() => onViewModeChange("table")}
        className={`flex items-center gap-2 px-3 py-1.5 rounded transition-colors ${
          viewMode === "table"
            ? "bg-blue-600 text-white"
            : "text-gray-600 hover:bg-gray-100"
        }`}
        title="Table View"
      >
        <Table size={18} />
        <span className="text-sm font-medium">Table</span>
      </button>
    </div>
  );
};

export default ViewModeToggle;
