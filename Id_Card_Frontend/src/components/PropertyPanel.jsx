import React, { useCallback, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import { ChevronDown } from "lucide-react";
import useCardStore from "../store/useCardStore";
import { fontOptions } from "../constants/fontOptions";
import { useFields } from "../hooks/useFields";
import { mmToPx } from "../utils/cardSizeUtils";

const PropertyPanel = () => {
  const {
    selectedElementId,
    getSelectedElement,
    updateElement,
    canvas,
    setCanvasProperty,
  } = useCardStore();
  const selectedElement = getSelectedElement();
  const imageInputRef = useRef(null);
  const [isQRAccordionOpen, setIsQRAccordionOpen] = useState(true);

  // Fetch predefined fields from database
  const { data: fieldsData } = useFields();

  const fontFamilies = useMemo(() => fontOptions.families, []);
  const fontWeights = useMemo(
    () => fontOptions.weights.map((w) => w.value),
    []
  );
  const alignments = useMemo(() => ["left", "center", "right"], []);

  // Get active predefined fields for QR code selection
  const activeFields = useMemo(() => {
    if (!fieldsData) return [];
    return fieldsData
      .filter((field) => field.isActive === 1)
      .sort((a, b) => a.displayOrder - b.displayOrder)
      .map((field) => field.label);
  }, [fieldsData]);

  // Handle card size change - updates both mm and pixel dimensions
  const handleCardSizeChange = useCallback(
    (widthMm, heightMm) => {
      const widthPx = mmToPx(widthMm);
      const heightPx = mmToPx(heightMm);
      
      // Update both mm values and pixel dimensions
      setCanvasProperty("cardWidthMm", widthMm);
      setCanvasProperty("cardHeightMm", heightMm);
      setCanvasProperty("width", widthPx);
      setCanvasProperty("height", heightPx);
    },
    [setCanvasProperty]
  );

  const handleInputChange = useCallback(
    (field, value) => {
      updateElement(selectedElementId, { [field]: value });
    },
    [selectedElementId, updateElement]
  );

  const handleNumberInputChange = useCallback(
    (field, value, min = null) => {
      const numValue = parseInt(value) || (min ?? 0);
      updateElement(selectedElementId, { [field]: numValue });
    },
    [selectedElementId, updateElement]
  );

  const handleCanvasPropertyChange = useCallback(
    (property, value) => {
      setCanvasProperty(property, value);
    },
    [setCanvasProperty]
  );

  const handleImageUpload = useCallback(
    (event) => {
      const file = event.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();

      reader.onload = (e) => {
        updateElement(selectedElementId, { src: e.target.result });
        toast.success("Image uploaded successfully!");
      };

      reader.onerror = () => {
        toast.error("Failed to load image");
      };

      reader.readAsDataURL(file);

      // Reset input value
      event.target.value = "";
    },
    [selectedElementId, updateElement]
  );

  const handleAlignmentClick = useCallback(
    (align) => {
      updateElement(selectedElementId, { align });
    },
    [selectedElementId, updateElement]
  );

  const handleQRFieldToggle = useCallback(
    (fieldLabel) => {
      if (!selectedElement || selectedElement.type !== "qr") return;
      
      const currentFields = selectedElement.qrFields || [];
      const isSelected = currentFields.includes(fieldLabel);
      
      let newFields;
      if (isSelected) {
        // Allow removing all fields (no minimum required)
        newFields = currentFields.filter(f => f !== fieldLabel);
      } else {
        // Prevent adding if already 3 fields selected (max = 3)
        if (currentFields.length >= 3) {
          toast.error("Maximum 3 fields can be selected for QR code");
          return;
        }
        newFields = [...currentFields, fieldLabel];
      }
      
      updateElement(selectedElementId, { qrFields: newFields });
    },
    [selectedElement, selectedElementId, updateElement]
  );

  if (!selectedElement) {
    return (
      <div className="w-72 bg-white border-l border-gray-200 p-4 overflow-y-auto shadow-sm">
        {/* <div className="text-center text-gray-400 mt-4 mb-4">
          <p className="text-xs">Select an element to edit properties</p>
        </div> */}

        {/* Canvas Settings */}
        <div className="mt-4">
          <h3 className="font-semibold mb-3 text-gray-800 text-sm">
            Canvas Settings
          </h3>

          <div className="space-y-3">
            {/* Real-time Size Display */}
            {/* <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs font-semibold text-blue-800 mb-1">
                Current Size:
              </p>
              <p className="text-sm font-bold text-blue-900">
                {canvas.width}px × {canvas.height}px
              </p>
              <p className="text-xs text-blue-700">
                ({pxToMm(canvas.width)} mm × {pxToMm(canvas.height)} mm)
              </p>
            </div> */}

            {/* Zoom Control */}
            <div>
              <label className="block text-xs font-medium mb-1.5 text-gray-700">
                Zoom: {canvas.zoom}%
              </label>
              <input
                type="range"
                min="50"
                max="200"
                step="5"
                value={canvas.zoom}
                onChange={(e) =>
                  handleCanvasPropertyChange("zoom", parseInt(e.target.value))
                }
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>50%</span>
                <span>200%</span>
              </div>
            </div>

            {/* Fixed Canvas Size - Read Only */}
            {/* <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
              <label className="block text-xs font-medium mb-1.5 text-gray-700">
                Card Size (Fixed)
              </label>
              <div className="text-sm font-semibold text-gray-900">
                323px × 204px
              </div>
              <div className="text-xs text-gray-500 mt-1">(85.6mm × 54mm)</div>
              <div className="text-xs text-blue-600 mt-1">
                CR80 Standard ID Card
              </div>
            </div> */}

              {/* Canvas Background Color */}
            <div>
              <label className="block text-xs font-medium mb-1.5 text-gray-700">
                Background Color
              </label>
              <input
                type="color"
                value={canvas.backgroundColor}
                onChange={(e) =>
                  handleCanvasPropertyChange("backgroundColor", e.target.value)
                }
                className="w-full h-10 rounded-lg border-2 border-gray-300 cursor-pointer hover:border-blue-400 transition-colors"
              />
            </div>
              {/* Background Opacity    */}
            <div>
              <label className="block text-xs font-medium mb-1.5 text-gray-700">
                Background Opacity:{" "}
                {Math.round((canvas.backgroundOpacity || 1) * 100)}%
              </label>
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={Math.round((canvas.backgroundOpacity || 1) * 100)}
                onChange={(e) =>
                  handleCanvasPropertyChange(
                    "backgroundOpacity",
                    parseInt(e.target.value) / 100
                  )
                }
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0%</span>
                <span>100%</span>
              </div>
            </div>

                {/* Show Grid  */}
            <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
              <input
                type="checkbox"
                checked={canvas.showGrid}
                onChange={(e) =>
                  handleCanvasPropertyChange("showGrid", e.target.checked)
                }
                id="showGrid"
                className="cursor-pointer w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <label
                htmlFor="showGrid"
                className="text-xs cursor-pointer font-medium text-gray-700"
              >
                Show Grid
              </label>
            </div>

                {/* Snap to Grid  */}
            <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
              <input
                type="checkbox"
                checked={canvas.snapToGrid}
                onChange={(e) =>
                  handleCanvasPropertyChange("snapToGrid", e.target.checked)
                }
                id="snapToGrid"
                className="cursor-pointer w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <label
                htmlFor="snapToGrid"
                className="text-xs cursor-pointer font-medium text-gray-700"
              >
                Snap to Grid
              </label>
            </div>

                {/* Grid Size  */}
            {canvas.snapToGrid && (
              <div>
                <label className="block text-xs font-medium mb-1.5 text-gray-700">
                  Grid Size
                </label>
                <input
                  type="number"
                  value={canvas.gridSize}
                  onChange={(e) =>
                    handleCanvasPropertyChange(
                      "gridSize",
                      parseInt(e.target.value)
                    )
                  }
                  min="5"
                  max="50"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                />
              </div>
            )}
          </div>
        </div>

        {/* Canvas Border Settings */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <h3 className="font-semibold mb-3 text-gray-800 text-sm">
            Card Border Settings
          </h3>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium mb-1.5 text-gray-700">
                Border Style
              </label>
              <select
                value={canvas.borderStyle || "none"}
                onChange={(e) =>
                  handleCanvasPropertyChange("borderStyle", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
              >
                <option value="none">None</option>
                <option value="one">One Side</option>
                <option value="two">Two Sides</option>
                <option value="all">All Sides / Full</option>
              </select>
            </div>

            {/* Conditional: One Side */}
            {canvas.borderStyle === "one" && (
              <div>
                <label className="block text-xs font-medium mb-1.5 text-gray-700">
                  Select Side
                </label>
                <select
                  value={canvas.borderSides || "left"}
                  onChange={(e) =>
                    handleCanvasPropertyChange("borderSides", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                >
                  <option value="left">Left</option>
                  <option value="right">Right</option>
                  <option value="top">Top</option>
                  <option value="bottom">Bottom</option>
                </select>
              </div>
            )}

            {/* Conditional: Two Sides */}
            {canvas.borderStyle === "two" && (
              <div>
                <label className="block text-xs font-medium mb-1.5 text-gray-700">
                  Select Sides
                </label>
                <select
                  value={canvas.borderSides || "vertical"}
                  onChange={(e) =>
                    handleCanvasPropertyChange("borderSides", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                >
                  <option value="vertical">Vertical (Left & Right)</option>
                  <option value="horizontal">Horizontal (Top & Bottom)</option>
                </select>
              </div>
            )}

            {/* Show border width and color only if border style is not 'none' */}
            {canvas.borderStyle && canvas.borderStyle !== "none" && (
              <>
                <div>
                  <label className="block text-xs font-medium mb-1.5 text-gray-700">
                    Border Width (px)
                  </label>
                  <input
                    type="number"
                    value={canvas.borderWidth || 1}
                    onChange={(e) =>
                      handleCanvasPropertyChange(
                        "borderWidth",
                        parseInt(e.target.value) || 1
                      )
                    }
                    min="1"
                    max="20"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1.5 text-gray-700">
                    Border Color
                  </label>
                  <input
                    type="color"
                    value={canvas.borderColor || "#000000"}
                    onChange={(e) =>
                      handleCanvasPropertyChange("borderColor", e.target.value)
                    }
                    className="w-full h-10 rounded-lg border-2 border-gray-300 cursor-pointer hover:border-blue-400 transition-colors"
                  />
                </div>
              </>
            )}
          </div>
        </div>
        {/* Card Size Configuration */}
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg space-y-3 mt-4">
              <label className="block text-xs font-semibold text-blue-900">
                Card Print Size (mm)
              </label>
              
              {/* Preset Sizes */}
              <div className="space-y-2">
                <div className="text-xs font-medium text-gray-700 mb-1">
                  Standard Sizes:
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      handleCardSizeChange(85.6, 54);
                      toast.success("CR80 size selected");
                    }}
                    className={`px-2 py-1.5 text-xs rounded ${
                      canvas.cardWidthMm === 85.6 && canvas.cardHeightMm === 54
                        ? "bg-blue-600 text-white"
                        : "bg-white text-gray-700 hover:bg-gray-100"
                    } border border-gray-300 transition-colors`}
                  >
                    CR80
                    <div className="text-xs opacity-80">85.6×54</div>
                  </button>
                  <button
                    onClick={() => {
                      handleCardSizeChange(79.9, 50);
                      toast.success("CR79 size selected");
                    }}
                    className={`px-2 py-1.5 text-xs rounded ${
                      canvas.cardWidthMm === 79.9 && canvas.cardHeightMm === 50
                        ? "bg-blue-600 text-white"
                        : "bg-white text-gray-700 hover:bg-gray-100"
                    } border border-gray-300 transition-colors`}
                  >
                    CR79
                    <div className="text-xs opacity-80">79.9×50</div>
                  </button>
                </div>
              </div>

              {/* Custom Size Inputs */}
              <div className="space-y-2">
                <div className="text-xs font-medium text-gray-700">
                  Custom Size:
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">
                      Width (mm)
                    </label>
                    <input
                      type="number"
                      value={canvas.cardWidthMm || 85.6}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value);
                        if (value > 0 && value <= 300) {
                          handleCardSizeChange(value, canvas.cardHeightMm || 54);
                        }
                      }}
                      min="10"
                      max="300"
                      step="0.1"
                      className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">
                      Height (mm)
                    </label>
                    <input
                      type="number"
                      value={canvas.cardHeightMm || 54}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value);
                        if (value > 0 && value <= 300) {
                          handleCardSizeChange(canvas.cardWidthMm || 85.6, value);
                        }
                      }}
                      min="10"
                      max="300"
                      step="0.1"
                      className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              <div className="text-xs text-blue-700 pt-1 border-t border-blue-200">
                <strong>Note:</strong> CR80 (ISO 7810 ID-1) is the standard credit card size.
              </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-72 bg-white border-l border-gray-200 p-4 overflow-y-auto shadow-sm">
      <h3 className="font-semibold mb-3 text-gray-800 text-sm">Properties</h3>

      <div className="space-y-3">
        {/* Common Properties */}
        <div>
          <label className="block text-xs font-medium mb-1.5 text-gray-700">
            Position X
          </label>
          <input
            type="number"
            value={Math.round(selectedElement.x)}
            onChange={(e) => handleNumberInputChange("x", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-medium mb-1.5 text-gray-700">
            Position Y
          </label>
          <input
            type="number"
            value={Math.round(selectedElement.y)}
            onChange={(e) => handleNumberInputChange("y", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
          />
        </div>

        {/* Text Properties */}
        {selectedElement.type === "text" && (
          <>
            <div>
              <label className="block text-xs font-medium mb-1.5 text-gray-700">
                Label
              </label>
              <input
                type="text"
                value={selectedElement.label}
                onChange={(e) => handleInputChange("label", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-medium mb-1.5 text-gray-700">
                Value
              </label>
              <input
                type="text"
                value={selectedElement.value}
                onChange={(e) => handleInputChange("value", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div>
                <label className="block text-xs font-medium text-gray-700">
                  Show Label
                </label>
                <p className="text-xs text-gray-500 mt-0.5">
                  Display as "Label: Value"
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedElement.showLabel || false}
                  onChange={(e) =>
                    handleInputChange("showLabel", e.target.checked)
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div>
              <label className="block text-xs font-medium mb-1.5 text-gray-700">
                Font Family
              </label>
              <select
                value={selectedElement.fontFamily}
                onChange={(e) =>
                  handleInputChange("fontFamily", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
              >
                {fontFamilies.map((font) => (
                  <option key={font} value={font}>
                    {font}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium mb-1.5 text-gray-700">
                Font Size
              </label>
              <input
                type="number"
                value={selectedElement.fontSize}
                onChange={(e) =>
                  handleNumberInputChange("fontSize", e.target.value, 8)
                }
                min="8"
                max="100"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-medium mb-1.5 text-gray-700">
                Font Weight
              </label>
              <select
                value={selectedElement.fontWeight}
                onChange={(e) =>
                  handleInputChange("fontWeight", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
              >
                {fontWeights.map((weight) => (
                  <option key={weight} value={weight}>
                    {weight}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium mb-1.5 text-gray-700">
                Text Color
              </label>
              <input
                type="color"
                value={selectedElement.color}
                onChange={(e) => handleInputChange("color", e.target.value)}
                className="w-full h-10 rounded border border-gray-300 cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-xs font-medium mb-1.5 text-gray-700">
                Alignment
              </label>
              <div className="flex gap-2">
                {alignments.map((align) => (
                  <button
                    key={align}
                    onClick={() => handleAlignmentClick(align)}
                    className={`flex-1 px-3 py-2 rounded border transition-colors ${
                      selectedElement.align === align
                        ? "bg-blue-500 text-white border-blue-500"
                        : "bg-white border-gray-300 hover:bg-gray-50"
                    }`}
                    aria-label={`Align ${align}`}
                  >
                    {align}
                  </button>
                ))}
              </div>
            </div>

            {/* Width and Height for Text */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium mb-1.5 text-gray-700">
                  Width (px)
                </label>
                <input
                  type="number"
                  value={selectedElement.width || ""}
                  onChange={(e) =>
                    handleNumberInputChange("width", e.target.value, 0)
                  }
                  min="0"
                  placeholder="Auto"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                />
                <p className="text-xs text-gray-500 mt-0.5">Leave empty for auto</p>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5 text-gray-700">
                  Height (px)
                </label>
                <input
                  type="number"
                  value={selectedElement.height || ""}
                  onChange={(e) =>
                    handleNumberInputChange("height", e.target.value, 0)
                  }
                  min="0"
                  placeholder="Auto"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                />
                <p className="text-xs text-gray-500 mt-0.5">Leave empty for auto</p>
              </div>
            </div>
          </>
        )}

        {/* Image Properties */}
        {selectedElement.type === "image" && (
          <>
            {/* Check if this is a Profile Photo field */}
            {(() => {
              const isProfilePhoto = selectedElement.label === "Profile Photo" || 
                                    (selectedElement.label?.toLowerCase().includes("photo") && 
                                     selectedElement.label !== "");
              
              return isProfilePhoto ? (
                // Profile Photo - Auto-loaded from user data
                <>
                  <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-lg">
                    <div className="flex items-start gap-2">
                      <span className="text-2xl">👤</span>
                      <div>
                        <p className="text-sm font-bold text-blue-900 mb-1">
                          Profile Photo Field
                        </p>
                        <p className="text-xs text-blue-800 mb-2">
                          This image automatically displays each user's profile photo from the database when printing ID cards.
                        </p>
                        <div className="bg-white/60 rounded p-2 mt-2">
                          <p className="text-xs text-blue-700 font-medium">
                            ✓ No upload needed - loads from user data<br/>
                            ✓ Adjust size and position below<br/>
                            ✓ Each user's photo shown automatically
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                // Regular Image - Manual upload
                <>
                  <div className="mb-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                    <p className="text-xs font-semibold text-gray-700 mb-1">
                      📷 Static Image Element
                    </p>
                    <p className="text-xs text-gray-600">
                      Upload a logo, background, or decorative image that stays the same for all ID cards.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-medium mb-1.5 text-gray-700">
                      Label (Optional)
                    </label>
                    <input
                      type="text"
                      value={selectedElement.label || ""}
                      onChange={(e) => handleInputChange("label", e.target.value)}
                      placeholder="e.g., Company Logo, Watermark"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Give this image a descriptive name
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-medium mb-1.5 text-gray-700">
                      Image URL
                    </label>
                    <input
                      type="text"
                      value={selectedElement.src || ""}
                      onChange={(e) => {
                        const value = e.target.value;
                        handleInputChange("src", value);
                        // Validate URL format
                        if (
                          value &&
                          !value.startsWith("data:") &&
                          !value.startsWith("http")
                        ) {
                          toast.error(
                            "Image URL should start with http:// or https://"
                          );
                        }
                      }}
                      placeholder="Enter image URL or upload"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Or upload an image below
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-medium mb-1.5 text-gray-700">
                      Upload Image
                    </label>
                    <input
                      ref={imageInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                    />
                  </div>
                </>
              );
            })()}

            <div>
              <label className="block text-xs font-medium mb-1.5 text-gray-700">
                Width
              </label>
              <input
                type="number"
                value={selectedElement.width}
                onChange={(e) =>
                  handleNumberInputChange("width", e.target.value, 10)
                }
                min="10"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-medium mb-1.5 text-gray-700">
                Height
              </label>
              <input
                type="number"
                value={selectedElement.height}
                onChange={(e) =>
                  handleNumberInputChange("height", e.target.value, 10)
                }
                min="10"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-medium mb-1.5 text-gray-700">
                Border Radius
              </label>
              <input
                type="number"
                value={selectedElement.borderRadius}
                onChange={(e) =>
                  handleNumberInputChange("borderRadius", e.target.value)
                }
                min="0"
                max="100"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
              />
            </div>
          </>
        )}

        {/* QR Code Properties */}
        {selectedElement.type === "qr" && (
          <>
            {/* QR Code Data Fields Selection - Accordion Style */}
            <div className="space-y-3">
              <button
                onClick={() => setIsQRAccordionOpen(!isQRAccordionOpen)}
                className="w-full flex items-center justify-between p-3 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors"
              >
                <div className="flex flex-col items-start">
                  <span className="text-sm font-semibold text-gray-800">
                    QR Code Data Fields
                  </span>
                  <span className="text-xs text-gray-600 mt-0.5">
                    {(selectedElement.qrFields || []).length} of 3 selected (min: 1, max: 3)
                  </span>
                </div>
                <ChevronDown
                  size={18}
                  className={`text-gray-600 transition-transform ${
                    isQRAccordionOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
              
              {isQRAccordionOpen && (
                <div className="space-y-2">
                  <p className="text-xs text-gray-600 px-1">
                    Select which fields to include in the QR code:
                  </p>
                  
                  <div className="space-y-2 max-h-48 overflow-y-auto p-3 bg-gray-50 border border-gray-200 rounded-lg">
                    {activeFields.length === 0 ? (
                      <p className="text-xs text-gray-400 text-center py-2">
                        No active fields available. Add fields in Settings.
                      </p>
                    ) : (
                      activeFields.map((fieldLabel) => {
                        const isSelected = (selectedElement.qrFields || []).includes(fieldLabel);
                        const currentCount = (selectedElement.qrFields || []).length;
                        const isDisabled = (!isSelected && currentCount >= 3) || (isSelected && currentCount <= 1);
                        
                        return (
                          <label
                            key={fieldLabel}
                            className={`flex items-center gap-2 p-2 rounded transition-colors ${
                              isDisabled
                                ? "cursor-not-allowed opacity-50"
                                : "cursor-pointer hover:bg-gray-100"
                            }`}
                            title={
                              isDisabled && !isSelected && currentCount >= 3
                                ? "Maximum 3 fields can be selected"
                                : isDisabled && isSelected && currentCount <= 1
                                ? "At least 1 field must be selected"
                                : ""
                            }
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleQRFieldToggle(fieldLabel)}
                              disabled={isDisabled}
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                            <span className="text-sm text-gray-700">{fieldLabel}</span>
                          </label>
                        );
                      })
                    )}
                  </div>
                  
                  <div className="px-1">
                    <p className="text-xs text-blue-600">
                      Selected: {(selectedElement.qrFields || []).length > 0 
                        ? (selectedElement.qrFields || []).join(", ") 
                        : "None"}
                    </p>
                    {((selectedElement.qrFields || []).length < 1 || (selectedElement.qrFields || []).length > 3) && (
                      <p className="text-xs text-red-600 mt-1">
                        ⚠️ Template cannot be saved until 1-3 fields are selected
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium mb-1.5 text-gray-700">
                Size (px)
              </label>
              <input
                type="number"
                value={selectedElement.size}
                onChange={(e) =>
                  handleNumberInputChange("size", e.target.value, 50)
                }
                min="50"
                max="300"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">Range: 50-300px</p>
            </div>
          </>
        )}

        {/* Shape Properties */}
        {selectedElement.type === "shape" && (
          <>
            <div>
              <label className="block text-xs font-medium mb-1.5 text-gray-700">
                Shape Type
              </label>
              <select
                value={selectedElement.shape || "rectangle"}
                onChange={(e) => handleInputChange("shape", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
              >
                <option value="rectangle">Rectangle</option>
                <option value="circle">Circle</option>
                <option value="line">Line</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium mb-1.5 text-gray-700">
                  Width (px)
                </label>
                <input
                  type="number"
                  value={selectedElement.width}
                  onChange={(e) =>
                    handleNumberInputChange("width", e.target.value, 10)
                  }
                  min="10"
                  max="500"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5 text-gray-700">
                  Height (px)
                </label>
                <input
                  type="number"
                  value={selectedElement.height}
                  onChange={(e) =>
                    handleNumberInputChange("height", e.target.value, 10)
                  }
                  min="10"
                  max="500"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium mb-1.5 text-gray-700">
                Fill Color
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={selectedElement.fillColor || "#3b82f6"}
                  onChange={(e) => handleInputChange("fillColor", e.target.value)}
                  className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
                />
                <input
                  type="text"
                  value={selectedElement.fillColor || "#3b82f6"}
                  onChange={(e) => handleInputChange("fillColor", e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                  placeholder="#000000"
                />
              </div>
            </div>

            {selectedElement.shape === "rectangle" && (
              <div>
                <label className="block text-xs font-medium mb-1.5 text-gray-700">
                  Border Radius (px)
                </label>
                <input
                  type="number"
                  value={selectedElement.borderRadius || 0}
                  onChange={(e) =>
                    handleNumberInputChange("borderRadius", e.target.value, 0)
                  }
                  min="0"
                  max="100"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                />
              </div>
            )}

            {selectedElement.shape === "line" && (
              <>
                <div>
                  <label className="block text-xs font-medium mb-1.5 text-gray-700">
                    Line Width (px)
                  </label>
                  <input
                    type="number"
                    value={selectedElement.lineWidth || 2}
                    onChange={(e) =>
                      handleNumberInputChange("lineWidth", e.target.value, 1)
                    }
                    min="1"
                    max="20"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5 text-gray-700">
                    Rotation (degrees)
                  </label>
                  <input
                    type="number"
                    value={selectedElement.rotation || 0}
                    onChange={(e) =>
                      handleNumberInputChange("rotation", e.target.value, 0)
                    }
                    min="0"
                    max="360"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                  />
                </div>
              </>
            )}
          </>
        )}

        {/* Opacity Control - For All Elements */}
        <div>
          <label className="block text-xs font-medium mb-1.5 text-gray-700">
            Opacity
          </label>
          <div className="flex gap-2 items-center">
            <input
              type="range"
              value={(selectedElement.opacity !== undefined ? selectedElement.opacity : 1) * 100}
              onChange={(e) => handleInputChange("opacity", parseFloat(e.target.value) / 100)}
              min="0"
              max="100"
              step="1"
              className="flex-1"
            />
            <span className="text-xs font-medium text-gray-700 w-12 text-right">
              {Math.round((selectedElement.opacity !== undefined ? selectedElement.opacity : 1) * 100)}%
            </span>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium mb-1.5 text-gray-700">
            Z-Index (Layer Order)
          </label>
          <div className="flex gap-2 flex-col">
            <input
              type="number"
              value={selectedElement.zIndex}
              onChange={(e) => handleNumberInputChange("zIndex", e.target.value)}
              min="0"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
            />
            <div className="flex gap-1">
              <button
                onClick={() => useCardStore.getState().moveElementToFront(selectedElementId)}
                className="px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                title="Move to Front"
              >
                ⬆⬆
              </button>
              <button
                onClick={() => useCardStore.getState().moveElementUp(selectedElementId)}
                className="px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors"
                title="Move Up"
              >
                ⬆
              </button>
              <button
                onClick={() => useCardStore.getState().moveElementDown(selectedElementId)}
                className="px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors"
                title="Move Down"
              >
                ⬇
              </button>
              <button
                onClick={() => useCardStore.getState().moveElementToBack(selectedElementId)}
                className="px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                title="Move to Back"
              >
                ⬇⬇
              </button>
            </div>
          </div>
        </div>

        {/* Border Settings - Available for all element types */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <h4 className="font-semibold mb-3 text-gray-800 text-sm">
            Border Settings
          </h4>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium mb-1.5 text-gray-700">
                Border Style
              </label>
              <select
                value={selectedElement.borderStyle || "none"}
                onChange={(e) =>
                  handleInputChange("borderStyle", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
              >
                <option value="none">None</option>
                <option value="one">One Side</option>
                <option value="two">Two Sides</option>
                <option value="all">All Sides / Full</option>
              </select>
            </div>

            {/* Conditional: One Side */}
            {selectedElement.borderStyle === "one" && (
              <div>
                <label className="block text-xs font-medium mb-1.5 text-gray-700">
                  Select Side
                </label>
                <select
                  value={selectedElement.borderSides || "left"}
                  onChange={(e) =>
                    handleInputChange("borderSides", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                >
                  <option value="left">Left</option>
                  <option value="right">Right</option>
                  <option value="top">Top</option>
                  <option value="bottom">Bottom</option>
                </select>
              </div>
            )}

            {/* Conditional: Two Sides */}
            {selectedElement.borderStyle === "two" && (
              <div>
                <label className="block text-xs font-medium mb-1.5 text-gray-700">
                  Select Sides
                </label>
                <select
                  value={selectedElement.borderSides || "vertical"}
                  onChange={(e) =>
                    handleInputChange("borderSides", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                >
                  <option value="vertical">Vertical (Left & Right)</option>
                  <option value="horizontal">Horizontal (Top & Bottom)</option>
                </select>
              </div>
            )}

            {/* Show border width and color only if border style is not 'none' */}
            {selectedElement.borderStyle &&
              selectedElement.borderStyle !== "none" && (
                <>
                  <div>
                    <label className="block text-xs font-medium mb-1.5 text-gray-700">
                      Border Width (px)
                    </label>
                    <input
                      type="number"
                      value={selectedElement.borderWidth || 1}
                      onChange={(e) =>
                        handleNumberInputChange(
                          "borderWidth",
                          e.target.value,
                          1
                        )
                      }
                      min="1"
                      max="20"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium mb-1.5 text-gray-700">
                      Border Color
                    </label>
                    <input
                      type="color"
                      value={selectedElement.borderColor || "#000000"}
                      onChange={(e) =>
                        handleInputChange("borderColor", e.target.value)
                      }
                      className="w-full h-10 rounded border border-gray-300 cursor-pointer"
                    />
                  </div>
                </>
              )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyPanel;
