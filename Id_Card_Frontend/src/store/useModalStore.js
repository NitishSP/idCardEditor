import { create } from 'zustand';

const useModalStore = create((set) => ({
  isOpen: false,
  title: '',
  message: '',
  onConfirm: null,
  onCancel: null,
  confirmText: 'Confirm',
  cancelText: 'Cancel',
  type: 'confirm', // 'confirm' | 'alert'

  showConfirm: ({ title, message, onConfirm, onCancel, confirmText = 'Confirm', cancelText = 'Cancel' }) => {
    set({
      isOpen: true,
      title,
      message,
      onConfirm,
      onCancel,
      confirmText,
      cancelText,
      type: 'confirm',
    });
  },

  showAlert: ({ title, message, onConfirm, confirmText = 'OK' }) => {
    set({
      isOpen: true,
      title,
      message,
      onConfirm,
      confirmText,
      type: 'alert',
    });
  },

  closeModal: () => {
    set({
      isOpen: false,
      title: '',
      message: '',
      onConfirm: null,
      onCancel: null,
      confirmText: 'Confirm',
      cancelText: 'Cancel',
    });
  },
}));

export default useModalStore;
