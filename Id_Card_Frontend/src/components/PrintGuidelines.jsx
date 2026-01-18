import React, { useState } from 'react';
import { Printer, X, Info, CheckCircle } from 'lucide-react';

/**
 * Print Guidelines Component
 * Shows helpful tips for printing ID cards at exact physical dimensions
 */
const PrintGuidelines = () => {
  const [isVisible, setIsVisible] = useState(false);

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-full shadow-lg flex items-center gap-2 transition-all z-40"
        title="Print Guidelines"
      >
        <Printer size={20} />
        <span className="font-medium">Print Tips</span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 bg-white rounded-xl shadow-2xl border border-gray-200 p-6 max-w-md z-50 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Printer className="text-blue-600" size={24} />
          <h3 className="text-lg font-bold text-gray-800">Print Guidelines</h3>
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Close guidelines"
        >
          <X size={20} className="text-gray-500" />
        </button>
      </div>

      {/* Important Notice */}
      <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded-lg mb-4">
        <div className="flex items-start gap-2">
          <Info size={18} className="text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-blue-900 mb-1">Important!</p>
            <p className="text-sm text-blue-800">
              Cards will print at exact physical size (mm). Ensure browser scale is set to <strong>100%</strong>.
            </p>
          </div>
        </div>
      </div>

      {/* Guidelines List */}
      <div className="space-y-3">
        <GuidelineItem
          icon="📏"
          title="Browser Settings"
          description="Set print scale to 100% (NOT 'Fit to page')"
        />
        <GuidelineItem
          icon="🎨"
          title="Print Backgrounds"
          description="Enable 'Print background graphics' for colored cards"
        />
        <GuidelineItem
          icon="📄"
          title="Paper Quality"
          description="Use 250-300 GSM cardstock for best durability"
        />
        <GuidelineItem
          icon="🖨️"
          title="Printer Quality"
          description="Set printer to highest quality (300+ DPI)"
        />
        <GuidelineItem
          icon="✂️"
          title="Cutting"
          description="Cut along borders carefully for clean edges"
        />
      </div>

      {/* Standard Size Info */}
      <div className="mt-4 p-3 bg-green-50 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <CheckCircle size={16} className="text-green-600" />
          <p className="text-sm font-semibold text-green-900">Standard ID Card Size</p>
        </div>
        <p className="text-sm text-green-800 ml-6">
          85.6mm × 53.98mm (CR80 Standard)
        </p>
      </div>

      {/* Actions */}
      <div className="mt-4 flex gap-2">
        <button
          onClick={() => setIsVisible(false)}
          className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors text-sm"
        >
          Got it!
        </button>
        <button
          onClick={() => window.open('/PRINT_SYSTEM.md', '_blank')}
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors text-sm"
        >
          Learn More
        </button>
      </div>
    </div>
  );
};

const GuidelineItem = ({ icon, title, description }) => (
  <div className="flex items-start gap-3">
    <span className="text-2xl flex-shrink-0">{icon}</span>
    <div>
      <p className="text-sm font-semibold text-gray-800">{title}</p>
      <p className="text-xs text-gray-600">{description}</p>
    </div>
  </div>
);

export default PrintGuidelines;
