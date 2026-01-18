import React from "react";
import { FileText, Key, Settings, Lock } from "lucide-react";

const TabNavigation = ({ activeTab, onTabChange, isRootUser }) => {
  const tabs = [
    {
      id: "fields",
      label: "Field Management",
      icon: FileText,
      requiresRoot: false,
    },
    {
      id: "credentials",
      label: "Login Credentials",
      icon: Key,
      requiresRoot: true,
    },
    {
      id: "system",
      label: "System",
      icon: Settings,
      requiresRoot: true,
    },
  ];

  return (
    <div className="flex border-b border-gray-200">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isLocked = tab.requiresRoot && !isRootUser;
        
        return (
          <button
            key={tab.id}
            onClick={() => !isLocked && onTabChange(tab.id)}
            disabled={isLocked}
            className={`flex-1 px-6 py-4 font-medium flex items-center justify-center gap-2 transition-colors relative ${
              activeTab === tab.id
                ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                : isLocked
                ? "text-gray-400 bg-gray-50 cursor-not-allowed"
                : "text-gray-600 hover:bg-gray-50"
            }`}
            title={isLocked ? "Requires root user access" : ""}
          >
            <Icon className="w-5 h-5" />
            {tab.label}
            {isLocked && <Lock className="w-4 h-4 ml-1" />}
          </button>
        );
      })}
    </div>
  );
};

export default TabNavigation;
