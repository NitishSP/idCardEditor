import React from "react";

const EmptyState = ({ icon, message }) => {
  const Icon = icon;
  return (
    <div className="p-12 text-center text-gray-500">
      <Icon className="w-16 h-16 mx-auto mb-4 opacity-50" />
      <p>{message}</p>
    </div>
  );
};

export default EmptyState;
