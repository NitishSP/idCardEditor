import React, { useCallback, useMemo } from "react";
import { Type, Image, QrCode, Layout, Trash2, Copy, Tag, Square, Circle, Minus } from "lucide-react";
import useCardStore from "../store/useCardStore";
import { useFields } from "../hooks/useFields";

const Sidebar = () => {
  const {
    addElement,
    elements,
    selectElement,
    selectedElementId,
    deleteElement,
    duplicateElement,
  } = useCardStore();

  // Fetch predefined fields from service
  const { data: fieldsData } = useFields();

  const predefinedFields = useMemo(() => {
    if (!fieldsData) {
      return [];
    }

    // Filter only active fields and sort by displayOrder
    return fieldsData
      .filter((field) => field.isActive === 1)
      .sort((a, b) => a.displayOrder - b.displayOrder)
      .map((field) => ({
        label: field.label,
        value: field.defaultValue || "",
        fieldType: field.fieldType,
      }));
  }, [fieldsData]);

  // Get valid field labels for validation
  const validFieldLabels = useMemo(() => {
    return new Set(predefinedFields.map(f => f.label));
  }, [predefinedFields]);

  // Filter elements to only show those with valid field references
  const validElements = useMemo(() => {
    return elements.filter((element) => {
      // Keep shapes and elements without labels
      if (element.type === "shape" || !element.label || element.label === "") {
        return true;
      }
      
      // Keep QR codes (they have their own field validation)
      if (element.type === "qr") {
        return true;
      }
      
      // For text and image elements, check if the label is in predefined fields
      if (element.type === "text" || element.type === "image") {
        // Keep "Static Image" elements (no field reference)
        if (element.label === "Static Image") {
          return true;
        }
        // Check if field label exists in predefined fields
        return validFieldLabels.has(element.label);
      }
      
      return true;
    });
  }, [elements, validFieldLabels]);

  const addImage = useCallback(() => {
    addElement({
      type: "image",
      label: "Static Image", // Differentiate from Profile Photo
      src: null,
      x: 20,
      y: 20,
      width: 100,
      height: 100,
      borderRadius: 0,
      zIndex: 2,
      borderStyle: "none",
      borderWidth: 1,
      borderColor: "#000000",
      borderSides: "",
    });
  }, [addElement]);

  const addQRCode = useCallback(() => {
    addElement({
      type: "qr",
      data: "",
      x: 300,
      y: 150,
      size: 80,
      zIndex: 3,
      borderStyle: "none",
      borderWidth: 1,
      borderColor: "#000000",
      borderSides: "",
      qrFields: [],
    });
  }, [addElement]);

  const addTextElement = useCallback(() => {
    const textElementsCount = elements.filter(
      (el) => el.type === "text"
    ).length;
    addElement({
      type: "text",
      label: "",
      value: "",
      x: 50,
      y: 50 + textElementsCount * 30,
      fontSize: 16,
      fontFamily: "Arial",
      fontWeight: "normal",
      color: "#000000",
      align: "left",
      zIndex: 1,
      showLabel: false,
      width: null,
      height: null,
      borderStyle: "none",
      borderWidth: 1,
      borderColor: "#000000",
      borderSides: "",
    });
  }, [addElement, elements]);

  const addShape = useCallback((shapeType) => {
    const shapeConfig = {
      type: "shape",
      shape: shapeType,
      x: 100,
      y: 100,
      width: 150,
      height: 100,
      fillColor: shapeType === "line" ? "#000000" : "#3b82f6",
      opacity: 1,
      zIndex: 0,
      borderStyle: "none",
      borderWidth: 1,
      borderColor: "#000000",
      borderSides: "",
      borderRadius: 0,
      rotation: 0,
      lineWidth: 2,
    };

    addElement(shapeConfig);
  }, [addElement]);

  const addPredefinedField = useCallback(
    (field) => {
      // Check if this is a photo field
      const isPhotoField = field.fieldType === 'photo' || 
                          field.label === 'Profile Photo' ||
                          field.label.toLowerCase().includes('photo');
      
      if (isPhotoField) {
        // Add as image element instead of text
        addElement({
          type: "image",
          label: field.label,
          src: null,
          x: 20,
          y: 20,
          width: 100,
          height: 100,
          borderRadius: 0,
          zIndex: 2,
          borderStyle: "none",
          borderWidth: 1,
          borderColor: "#000000",
          borderSides: "",
        });
      } else {
        // Add as text element
        const textElementsCount = elements.filter(
          (el) => el.type === "text"
        ).length;
        addElement({
          type: "text",
          label: field.label,
          value: field.value,
          x: 50,
          y: 50 + textElementsCount * 30,
          fontSize: 16,
          fontFamily: "Arial",
          fontWeight: "normal",
          color: "#000000",
          align: "left",
          zIndex: 1,
          showLabel: false,
          width: null,
          height: null,
          borderStyle: "none",
          borderWidth: 1,
          borderColor: "#000000",
          borderSides: "",
        });
      }
    },
    [addElement, elements]
  );

  const handleElementClick = useCallback(
    (elementId) => {
      selectElement(elementId);
    },
    [selectElement]
  );

  const handleDuplicateClick = useCallback(
    (e, elementId) => {
      e.stopPropagation();
      duplicateElement(elementId);
    },
    [duplicateElement]
  );

  const handleDeleteClick = useCallback(
    (e, elementId) => {
      e.stopPropagation();
      deleteElement(elementId);
    },
    [deleteElement]
  );

  const getElementIcon = useCallback((element) => {
    const iconProps = { size: 14 };
    switch (element.type) {
      case "text":
        return <Type {...iconProps} className="text-blue-600" />;
      case "image":
        // Special icon for Profile Photo
        if (element.label === "Profile Photo" || 
            (element.label?.toLowerCase().includes("photo") && element.label !== "")) {
          return <span style={{ fontSize: '14px' }}>👤</span>;
        }
        return <Image {...iconProps} className="text-green-600" />;
      case "qr":
        return <QrCode {...iconProps} className="text-purple-600" />;
      case "shape":
        if (element.shape === "rectangle") return <Square {...iconProps} className="text-orange-600" />;
        if (element.shape === "circle") return <Circle {...iconProps} className="text-orange-600" />;
        if (element.shape === "line") return <Minus {...iconProps} className="text-orange-600" />;
        return <Square {...iconProps} className="text-orange-600" />;
      default:
        return null;
    }
  }, []);

  const getElementLabel = useCallback((element) => {
    if (element.type === "text") return element.label || "Text";
    if (element.type === "image") {
      // Special label for Profile Photo
      if (element.label === "Profile Photo" || 
          (element.label?.toLowerCase().includes("photo") && element.label !== "")) {
        return "Profile Photo";
      }
      return element.label || "Image";
    }
    if (element.type === "shape") return element.shape.charAt(0).toUpperCase() + element.shape.slice(1);
    return element.type.toUpperCase();
  }, []);

  return (
    <div className="w-72 bg-white border-r border-gray-200 overflow-y-auto shadow-sm">
      <div className="p-4">
        <h2 className="text-lg font-bold mb-4 text-gray-800">Elements</h2>

        {/* Predefined Fields */}
        <div className="mb-4">
          <h3 className="font-semibold mb-2 text-gray-800 text-sm">
            Predefined Fields
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {predefinedFields.map((field, index) => (
              <button
                key={index}
                onClick={() => addPredefinedField(field)}
                className="px-2 py-1.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-blue-400 active:bg-blue-50 text-xs font-medium transition-all shadow-sm"
                aria-label={`Add ${field.label} field`}
              >
                {field.label}
              </button>
            ))}
          </div>
        </div>

        {/* Other Elements */}
        <div className="mb-4 space-y-2">
          <button
            onClick={addTextElement}
            className="w-full bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 active:bg-blue-800 flex items-center justify-center gap-2 font-medium shadow-sm transition-all text-sm"
            aria-label="Add Text"
          >
            <Type size={16} />
            Add Text
          </button>
          <button
            onClick={addImage}
            className="w-full bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 active:bg-green-800 flex items-center justify-center gap-2 font-medium shadow-sm transition-all text-sm"
            aria-label="Add Static Image"
          >
            <Image size={16} />
            Add Static Image
          </button>
          <button
            onClick={addQRCode}
            className="w-full bg-purple-600 text-white px-3 py-2 rounded-lg hover:bg-purple-700 active:bg-purple-800 flex items-center justify-center gap-2 font-medium shadow-sm transition-all text-sm"
            aria-label="Add QR Code"
          >
            <QrCode size={16} />
            Add QR Code
          </button>
          
          {/* Shapes */}
          <div className="pt-2">
            <h3 className="font-semibold mb-2 text-gray-800 text-xs">Shapes</h3>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => addShape("rectangle")}
                className="px-2 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-blue-400 active:bg-blue-50 flex items-center justify-center font-medium shadow-sm transition-all"
                aria-label="Add Rectangle"
              >
                <Square size={16} className="text-gray-700" />
              </button>
              <button
                onClick={() => addShape("circle")}
                className="px-2 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-blue-400 active:bg-blue-50 flex items-center justify-center font-medium shadow-sm transition-all"
                aria-label="Add Circle"
              >
                <Circle size={16} className="text-gray-700" />
              </button>
              <button
                onClick={() => addShape("line")}
                className="px-2 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-blue-400 active:bg-blue-50 flex items-center justify-center font-medium shadow-sm transition-all"
                aria-label="Add Line"
              >
                <Minus size={16} className="text-gray-700" />
              </button>
            </div>
          </div>
        </div>

        {/* Elements List */}
        <div>
          <h3 className="font-semibold mb-2 flex items-center gap-2 text-gray-800 text-sm">
            <Layout size={16} className="text-gray-600" />
            Layers
          </h3>
          <div className="space-y-1.5">
            {validElements.map((element) => (
              <div
                key={element.id}
                onClick={() => handleElementClick(element.id)}
                className={`p-2 rounded-lg cursor-pointer flex items-center justify-between transition-all ${
                  selectedElementId === element.id
                    ? "bg-blue-100 border-2 border-blue-400 shadow-sm"
                    : "bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300 shadow-sm"
                }`}
                role="button"
                tabIndex={0}
                aria-label={`Select ${getElementLabel(element)}`}
              >
                <div className="flex items-center gap-2 flex-1">
                  {getElementIcon(element)}
                  <span className="text-xs font-medium truncate">
                    {getElementLabel(element)}
                  </span>
                  {element.type === "text" && element.showLabel && (
                    <Tag
                      size={12}
                      className="text-blue-500 flex-shrink-0"
                      title="Label shown"
                    />
                  )}
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={(e) => handleDuplicateClick(e, element.id)}
                    className="p-1 hover:bg-gray-200 rounded-md transition-colors"
                    title="Duplicate"
                    aria-label={`Duplicate ${getElementLabel(element)}`}
                  >
                    <Copy size={12} className="text-gray-600" />
                  </button>
                  <button
                    onClick={(e) => handleDeleteClick(e, element.id)}
                    className="p-1 hover:bg-red-100 text-red-600 rounded-md transition-colors"
                    title="Delete"
                    aria-label={`Delete ${getElementLabel(element)}`}
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
