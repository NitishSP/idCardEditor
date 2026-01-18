import React from 'react';
import Navbar from '../components/Navbar';
import TemplateManagement from '../components/TemplateManagement';

const TemplateManagementPage = () => {
  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gray-50">
      <Navbar />
      
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Template Management</h1>
            <p className="mt-2 text-gray-600">Create, edit, and manage your ID card templates</p>
          </div>
          
          <TemplateManagement />
        </div>
      </div>
    </div>
  );
};

export default TemplateManagementPage;
