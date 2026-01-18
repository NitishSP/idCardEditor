import React from 'react';
import toast from 'react-hot-toast';
import useModalStore from '../store/useModalStore';
import { Bell, CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react';

/**
 * Demo component to showcase toast and modal functionality
 * This can be added to your app for testing or removed in production
 */
const NotificationDemo = () => {
  const { showConfirm, showAlert } = useModalStore();

  const demoToasts = {
    success: () => {
      toast.success('Operation completed successfully!', {
        icon: '✅',
      });
    },
    
    error: () => {
      toast.error('Something went wrong!', {
        icon: '❌',
      });
    },
    
    loading: () => {
      const loadingId = toast.loading('Processing your request...');
      setTimeout(() => {
        toast.dismiss(loadingId);
        toast.success('Done!');
      }, 2000);
    },
    
    custom: () => {
      toast('Custom notification with icon', {
        icon: '👏',
        style: {
          borderRadius: '10px',
          background: '#333',
          color: '#fff',
        },
      });
    },

    promise: () => {
      const myPromise = new Promise((resolve) => {
        setTimeout(() => resolve(), 2000);
      });

      toast.promise(myPromise, {
        loading: 'Saving project...',
        success: 'Project saved successfully!',
        error: 'Failed to save project',
      });
    },
  };

  const demoModals = {
    confirm: () => {
      showConfirm({
        title: 'Confirm Action',
        message: 'Are you sure you want to proceed with this action? This cannot be undone.',
        confirmText: 'Yes, Proceed',
        cancelText: 'Cancel',
        onConfirm: () => {
          toast.success('Action confirmed!');
        },
        onCancel: () => {
          toast('Action cancelled', { icon: 'ℹ️' });
        },
      });
    },

    alert: () => {
      showAlert({
        title: 'Important Notice',
        message: 'This is an important message that requires your attention.',
        confirmText: 'Got it!',
        onConfirm: () => {
          toast.success('Acknowledged!');
        },
      });
    },

    delete: () => {
      showConfirm({
        title: 'Delete Item',
        message: 'Are you sure you want to delete this item? This action cannot be undone.',
        confirmText: 'Delete',
        cancelText: 'Keep It',
        onConfirm: () => {
          toast.success('Item deleted successfully');
        },
      });
    },
  };

  return (
    <div className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl shadow-lg max-w-2xl mx-auto my-8">
      <div className="flex items-center gap-3 mb-6">
        <Bell className="text-blue-600" size={24} />
        <h2 className="text-2xl font-bold text-gray-800">Notification System Demo</h2>
      </div>

      {/* Toast Demos */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <CheckCircle size={20} className="text-green-600" />
          Toast Notifications
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={demoToasts.success}
            className="px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium shadow-md transition-all transform hover:scale-105"
          >
            Success Toast
          </button>
          <button
            onClick={demoToasts.error}
            className="px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium shadow-md transition-all transform hover:scale-105"
          >
            Error Toast
          </button>
          <button
            onClick={demoToasts.loading}
            className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow-md transition-all transform hover:scale-105"
          >
            Loading Toast
          </button>
          <button
            onClick={demoToasts.promise}
            className="px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium shadow-md transition-all transform hover:scale-105"
          >
            Promise Toast
          </button>
          <button
            onClick={demoToasts.custom}
            className="px-4 py-3 bg-gray-800 hover:bg-gray-900 text-white rounded-lg font-medium shadow-md transition-all transform hover:scale-105 col-span-2"
          >
            Custom Styled Toast
          </button>
        </div>
      </div>

      {/* Modal Demos */}
      <div>
        <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <AlertTriangle size={20} className="text-orange-600" />
          Modal Dialogs
        </h3>
        <div className="grid grid-cols-1 gap-3">
          <button
            onClick={demoModals.confirm}
            className="px-4 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium shadow-md transition-all transform hover:scale-105"
          >
            Confirmation Modal
          </button>
          <button
            onClick={demoModals.alert}
            className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow-md transition-all transform hover:scale-105"
          >
            Alert Modal
          </button>
          <button
            onClick={demoModals.delete}
            className="px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium shadow-md transition-all transform hover:scale-105"
          >
            Delete Confirmation
          </button>
        </div>
      </div>

      {/* Info Box */}
      <div className="mt-6 p-4 bg-blue-100 border-l-4 border-blue-600 rounded-lg">
        <div className="flex items-start gap-2">
          <Info size={20} className="text-blue-600 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-blue-800">Demo Component</p>
            <p className="text-xs text-blue-700 mt-1">
              This component demonstrates the toast and modal system. 
              Remove it from production or use for testing purposes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationDemo;
