import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Save, Loader2 } from 'lucide-react';
import html2canvas from 'html2canvas';
import { useCreateTemplate } from '../hooks/useTemplates';
import useCardStore from '../store/useCardStore';
import toast from 'react-hot-toast';

const SaveTemplateModal = ({ isOpen, onClose, initialTemplateName }) => {
  const [templateName, setTemplateName] = useState('');
  const { canvas, elements } = useCardStore();
  const navigate = useNavigate();
  
  const createTemplateMutation = useCreateTemplate({
    onSuccess: (data) => {
      setTemplateName('');
      onClose();
      // Navigate to the newly created template editor using template name
      if (data?.data?.name) {
        const encodedName = encodeURIComponent(data.data.name);
        navigate(`/template-editor/${encodedName}`);
        toast.success('Template created! Auto-save is now enabled.');
      }
    },
  });

  // Set initial template name when modal opens
  useEffect(() => {
    if (isOpen) {
      setTemplateName(initialTemplateName || '');
    }
  }, [isOpen, initialTemplateName]);

  const handleSave = useCallback(async () => {
    const finalName = templateName.trim() || `Template ${Date.now()}`;

    // Generate thumbnail
    const canvasElement = document.getElementById('id-card-canvas');
    let thumbnail = null;

    if (canvasElement) {
      try {
        const capturedCanvas = await html2canvas(canvasElement, {
          backgroundColor: canvas.backgroundColor,
          scale: 0.5, // Smaller scale for thumbnail
        });
        thumbnail = capturedCanvas.toDataURL('image/jpeg', 0.7);
      } catch (error) {
        console.error('Failed to generate thumbnail:', error);
      }
    }

    // Prepare template data
    const templateData = {
      name: finalName,
      thumbnail,
      templateData: {
        canvas: {
          width: canvas.width,
          height: canvas.height,
          backgroundColor: canvas.backgroundColor,
          backgroundOpacity: canvas.backgroundOpacity,
          backgroundImage: canvas.backgroundImage,
          borderStyle: canvas.borderStyle,
          borderWidth: canvas.borderWidth,
          borderColor: canvas.borderColor,
          borderSides: canvas.borderSides,
        },
        elements: elements.map(el => ({
          ...el,
          // Remove any React-specific properties
          ref: undefined,
        })),
      },
    };

    // Only create new templates with this modal
    createTemplateMutation.mutate(templateData);
  }, [templateName, canvas, elements, createTemplateMutation]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      onClose();
    }
  }, [handleSave, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-white/10 transition-all">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">
            Save Template
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Template Name
          </label>
          <input
            type="text"
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter template name..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            autoFocus
          />
          <p className="mt-2 text-xs text-gray-500">
            Leave empty to auto-generate a default name
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-all"
            disabled={createTemplateMutation.isPending}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={createTemplateMutation.isPending}
            className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-all ${
              createTemplateMutation.isPending
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {createTemplateMutation.isPending ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save size={16} />
                Save Template
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SaveTemplateModal;
