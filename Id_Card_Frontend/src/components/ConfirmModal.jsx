import React, { useCallback, useEffect } from 'react';
import { X, AlertCircle, CheckCircle } from 'lucide-react';
import useModalStore from '../store/useModalStore';

const ConfirmModal = () => {
  const { isOpen, title, message, onConfirm, onCancel, confirmText, cancelText, type, closeModal } = useModalStore();

  const handleConfirm = useCallback(() => {
    onConfirm?.();
    closeModal();
  }, [onConfirm, closeModal]);

  const handleCancel = useCallback(() => {
    onCancel?.();
    closeModal();
  }, [onCancel, closeModal]);

  const handleBackdropClick = useCallback((e) => {
    if (e.target === e.currentTarget) {
      handleCancel();
    }
  }, [handleCancel]);

  // Handle Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        handleCancel();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, handleCancel]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-white/10 transition-all"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 transform transition-all animate-fadeIn">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            {type === 'alert' ? (
              <AlertCircle className="text-blue-600" size={20} />
            ) : (
              <CheckCircle className="text-orange-600" size={20} />
            )}
            <h3 id="modal-title" className="text-lg font-semibold text-gray-800">
              {title}
            </h3>
          </div>
          <button
            onClick={handleCancel}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close modal"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <p className="text-gray-700 leading-relaxed">{message}</p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
          {type === 'confirm' && (
            <button
              onClick={handleCancel}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 active:bg-gray-400 text-gray-700 rounded-lg font-medium transition-all shadow-sm"
              aria-label="Cancel"
            >
              {cancelText}
            </button>
          )}
          <button
            onClick={handleConfirm}
            className={`px-4 py-2 text-white rounded-lg font-medium transition-all shadow-md ${
              type === 'alert'
                ? 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
                : 'bg-orange-600 hover:bg-orange-700 active:bg-orange-800'
            }`}
            aria-label={confirmText}
            autoFocus
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
