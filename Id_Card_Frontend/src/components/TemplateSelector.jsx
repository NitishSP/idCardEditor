import React, { useRef, useCallback } from 'react';
import { RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import useCardStore from '../store/useCardStore';
import { useTemplates } from '../hooks/useTemplates';

const TemplateSelector = () => {
  const { templates: localTemplates, setTemplate, setCanvasProperty, importData } = useCardStore();
  const fileInputRef = useRef(null);

  // Fetch templates from backend
  const { data: backendTemplatesData, isLoading } = useTemplates();
  const backendTemplates = backendTemplatesData || [];

  const handleBackgroundUpload = useCallback((event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    
    reader.onload = (e) => {
      setCanvasProperty('backgroundImage', e.target.result);
      toast.success('Background image uploaded!');
    };

    reader.onerror = () => {
      console.error('Failed to read image file');
      toast.error('Failed to load image');
    };

    reader.readAsDataURL(file);
    
    // Reset input value to allow selecting the same file again
    event.target.value = '';
  }, [setCanvasProperty]);

  const triggerFileUpload = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const removeBackground = useCallback(() => {
    setCanvasProperty('backgroundImage', null);
    toast.success('Background removed');
  }, [setCanvasProperty]);

  const loadBackendTemplate = useCallback(async (template) => {
    try {
      // Backend templates have templateData property
      if (template.templateData) {
        // Import the template data into the store
        const templateToLoad = {
          canvas: template.templateData.canvas,
          elements: template.templateData.elements,
        };
        importData(templateToLoad);
        toast.success(`Template "${template.name}" loaded!`);
      }
    } catch (error) {
      toast.error('Failed to load template');
    }
  }, [importData]);

  const handleTemplateClick = useCallback((template) => {
    // Check if it's a backend template (has _id) or local template (has id)
    if (template._id) {
      // Load backend template with full data
      loadBackendTemplate(template);
    } else {
      // Load local template directly
      setTemplate(template);
    }
  }, [setTemplate, loadBackendTemplate]);

  return (
    <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 px-4 py-2.5 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-800 text-sm">Templates</h3>
        
        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleBackgroundUpload}
            className="hidden"
            aria-label="Background image upload"
          />
          
          <button
            onClick={triggerFileUpload}
            className="px-3 py-1.5 bg-purple-600 text-white rounded-lg cursor-pointer hover:bg-purple-700 active:bg-purple-800 font-medium shadow-sm transition-all text-xs"
            aria-label="Upload Background"
          >
            Upload Background
          </button>
          
          <button
            onClick={removeBackground}
            className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 active:bg-gray-400 rounded-lg font-medium shadow-sm transition-all text-xs"
            aria-label="Remove Background"
          >
            Remove Background
          </button>
        </div>
      </div>

      <div className="mt-2 grid grid-cols-4 gap-2">
        {/* Local Templates */}
        {localTemplates.map((template) => (
          <button
            key={template.id}
            onClick={() => handleTemplateClick(template)}
            className="cursor-pointer border-2 border-gray-300 rounded-xl overflow-hidden hover:border-blue-500 hover:shadow-md active:scale-95 transition-all"
            aria-label={`Select ${template.name} template`}
          >
            <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center p-3">
              <span className="text-xs text-gray-600 font-medium text-center">{template.name}</span>
            </div>
          </button>
        ))}

        {/* Backend Templates */}
        {backendTemplates.map((template) => (
          <button
            key={template._id}
            onClick={() => handleTemplateClick(template)}
            className="cursor-pointer border-2 border-purple-300 rounded-xl overflow-hidden hover:border-purple-500 hover:shadow-md active:scale-95 transition-all"
            aria-label={`Select ${template.name} template`}
            title={`Backend Template: ${template.name}`}
          >
            {template.thumbnail ? (
              <img 
                src={template.thumbnail} 
                alt={template.name}
                className="w-full aspect-video object-cover"
              />
            ) : (
              <div className="aspect-video bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center p-3">
                <span className="text-xs text-purple-600 font-medium text-center">{template.name}</span>
              </div>
            )}
          </button>
        ))}

        {/* Loading State */}
        {isLoading && (
          <div className="col-span-4 flex items-center justify-center py-4">
            <RefreshCw className="animate-spin text-gray-400" size={24} />
            <span className="ml-2 text-sm text-gray-500">Loading templates...</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default TemplateSelector;
