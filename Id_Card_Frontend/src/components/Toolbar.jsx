import React, { useCallback, useState, useMemo } from "react";
import { RotateCw, Trash2, Database } from "lucide-react";
import html2canvas from "html2canvas";
import toast from "react-hot-toast";
import useCardStore from "../store/useCardStore";
import useModalStore from "../store/useModalStore";
import { generatePrintHTML } from "../utils/printUtils";
import SaveTemplateModal from "./SaveTemplateModal";

const Toolbar = ({ templateName, onSave, isNewTemplate }) => {
  const { toggleOrientation, canvas, clearAllElements, validateQRElements } = useCardStore();
  const { showConfirm } = useModalStore();
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showSaveAsNewModal, setShowSaveAsNewModal] = useState(false);

  // Check QR validation
  const qrValidation = useMemo(() => validateQRElements(), [validateQRElements]);



  const captureCanvas = useCallback(async (options = {}) => {
    const canvasElement = document.getElementById("id-card-canvas");
    if (!canvasElement) {
      console.error("Canvas element not found");
      return null;
    }

    try {
      return await html2canvas(canvasElement, {
        backgroundColor: options.backgroundColor ?? "#ffffff",
        scale: options.scale ?? 2,
      });
    } catch (error) {
      console.error("Failed to capture canvas:", error);
      return null;
    }
  }, []); 


  const printCard = useCallback(async () => {
    const capturedCanvas = await captureCanvas();
    if (!capturedCanvas) return;

    try {
      const dataUrl = capturedCanvas.toDataURL();
      const printWindow = window.open("", "_blank");

      if (!printWindow) {
        console.error("Failed to open print window");
        toast.error("Failed to open print window. Please allow pop-ups.");
        return;
      }

      // Use the print utility for consistent formatting
      const htmlContent = generatePrintHTML(
        dataUrl,
        { width: canvas.width, height: canvas.height },
        canvas.orientation,
        1 // number of copies
      );

      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.focus();

      // Auto-print after a short delay
      setTimeout(() => {
        printWindow.print();
      }, 500);

      toast.success("Print preview opened");
    } catch (error) {
      console.error("Failed to print:", error);
      toast.error("Failed to print card");
    }
  }, [captureCanvas, canvas.orientation, canvas.width, canvas.height]);

  const handleClearAll = useCallback(() => {
    showConfirm({
      title: "Clear All Elements",
      message:
        "Are you sure you want to clear all elements? This action cannot be undone.",
      confirmText: "Clear All",
      cancelText: "Cancel",
      onConfirm: () => {
        clearAllElements();
        toast.success("All elements cleared");
      },
    });
  }, [clearAllElements, showConfirm]);

  return (
    <div className="bg-white border-b border-gray-200 px-4 py-2 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {templateName && (
            <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
              {templateName}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleOrientation}
            className="px-3 py-2 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 rounded-lg flex items-center gap-1.5 font-medium transition-all shadow-sm text-sm"
            title="Toggle Orientation"
            aria-label="Toggle Orientation"
          >
            <RotateCw size={16} />
            {canvas.orientation === "landscape" ? "Landscape" : "Portrait"}
          </button>

          <div className="w-px h-6 bg-gray-300" />

          <button
            onClick={() => {
              if (!qrValidation.isValid) {
                toast.error(qrValidation.message);
                return;
              }
              isNewTemplate ? setShowSaveModal(true) : onSave();
            }}
            disabled={!qrValidation.isValid}
            className={`px-3 py-2 rounded-lg flex items-center gap-1.5 font-medium transition-all shadow-sm text-sm ${
              qrValidation.isValid
                ? "bg-purple-100 hover:bg-purple-200 active:bg-purple-300 text-purple-700 cursor-pointer"
                : "bg-gray-200 text-gray-400 cursor-not-allowed opacity-60"
            }`}
            title={
              !qrValidation.isValid
                ? qrValidation.message
                : isNewTemplate
                ? "Save New Template"
                : "Save Template"
            }
            aria-label="Save Template"
          >
            <Database size={16} />
            {isNewTemplate ? "Save As..." : "Save"}
          </button>

          {!isNewTemplate && (
            <button
              onClick={() => {
                if (!qrValidation.isValid) {
                  toast.error(qrValidation.message);
                  return;
                }
                setShowSaveAsNewModal(true);
              }}
              disabled={!qrValidation.isValid}
              className={`px-3 py-2 rounded-lg flex items-center gap-1.5 font-medium transition-all shadow-sm text-sm ${
                qrValidation.isValid
                  ? "bg-blue-100 hover:bg-blue-200 active:bg-blue-300 text-blue-700 cursor-pointer"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed opacity-60"
              }`}
              title={
                !qrValidation.isValid
                  ? qrValidation.message
                  : "Save As New Template"
              }
              aria-label="Save As New Template"
            >
              <Database size={16} />
              Save As New
            </button>
          )}

          <button
            onClick={handleClearAll}
            className="px-3 py-2 bg-red-100 hover:bg-red-200 active:bg-red-300 text-red-700 rounded-lg flex items-center gap-1.5 font-medium transition-all shadow-sm text-sm"
            title="Clear All"
            aria-label="Clear All Elements"
          >
            <Trash2 size={16} />
            Clear
          </button>

          <div className="w-px h-6 bg-gray-300" />

          {/* <div className="relative group">
            <button
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-lg flex items-center gap-1.5 font-medium shadow-md transition-all text-sm"
              aria-label="Export Menu"
            >
              <Download size={16} />
              Export
            </button>
            <div className="opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 absolute right-0 mt-1 w-44 bg-white rounded-lg shadow-xl border border-gray-200 z-50 overflow-hidden">
              <button
                onClick={exportAsPNG}
                className="w-full px-4 py-2.5 text-left hover:bg-blue-50 transition-colors font-medium text-sm text-gray-700"
                aria-label="Export as PNG"
              >
                Export as PNG
              </button>
              <button
                onClick={exportAsJPG}
                className="w-full px-4 py-2.5 text-left hover:bg-blue-50 transition-colors font-medium text-sm text-gray-700"
                aria-label="Export as JPG"
              >
                Export as JPG
              </button>
              <button
                onClick={exportAsPDF}
                className="w-full px-4 py-2.5 text-left hover:bg-blue-50 transition-colors font-medium text-sm text-gray-700"
                aria-label="Export as PDF"
              >
                Export as PDF
              </button>
            </div>
          </div>

          <button
            onClick={printCard}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 active:bg-green-800 text-white rounded-lg flex items-center gap-1.5 font-medium shadow-md transition-all text-sm"
            aria-label="Print Card"
          >
            <Printer size={16} />
            Print
          </button> */}
        </div>
      </div>

      {/* Save Template Modal */}
      <SaveTemplateModal
        isOpen={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        initialTemplateName={templateName}
      />

      {/* Save As New Template Modal */}
      <SaveTemplateModal
        isOpen={showSaveAsNewModal}
        onClose={() => setShowSaveAsNewModal(false)}
        initialTemplateName={`${templateName} (Copy)`}
      />
    </div>
  );
};

export default Toolbar;
