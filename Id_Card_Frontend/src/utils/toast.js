import toast from 'react-hot-toast';

/**
 * Custom toast notifications with consistent styling
 */
export const showToast = {
  success: (message) => {
    toast.success(message, {
      duration: 3000,
      icon: '✅',
    });
  },

  error: (message) => {
    toast.error(message, {
      duration: 4000,
      icon: '❌',
    });
  },

  loading: (message) => {
    return toast.loading(message);
  },

  dismiss: (toastId) => {
    toast.dismiss(toastId);
  },

  promise: (promise, messages) => {
    return toast.promise(promise, {
      loading: messages.loading || 'Loading...',
      success: messages.success || 'Success!',
      error: messages.error || 'Error occurred',
    });
  },
};

export default showToast;
