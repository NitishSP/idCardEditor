import React, { useRef, useEffect, useCallback, useMemo } from "react";
import { QRCodeSVG } from "qrcode.react";
import useCardStore from "../store/useCardStore";
import DraggableElement from "./DraggableElement";
import ResizableElement from "./ResizableElement";
import { useFields } from "../hooks/useFields";

const Canvas = () => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const {
    canvas,
    elements,
    selectedElementId,
    selectElement,
    moveElement,
    updateElement,
    deselectElement,
    setCanvasProperty,
  } = useCardStore();

  // Fetch predefined fields for validation
  const { data: fieldsData } = useFields();

  // Get valid field labels for validation
  const validFieldLabels = useMemo(() => {
    if (!fieldsData) return new Set();
    return new Set(
      fieldsData
        .filter((field) => field.isActive === 1)
        .map((f) => f.label)
    );
  }, [fieldsData]);

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

  // Zoom with Ctrl + Mouse Wheel
  useEffect(() => {
    const handleWheel = (e) => {
      if (e.ctrlKey) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -5 : 5;
        const newZoom = Math.min(Math.max(canvas.zoom + delta, 50), 200);
        setCanvasProperty("zoom", newZoom);
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener("wheel", handleWheel, { passive: false });
    }

    return () => {
      if (container) {
        container.removeEventListener("wheel", handleWheel);
      }
    };
  }, [canvas.zoom, setCanvasProperty]);

  const handleDrag = useCallback(
    (elementId, e, data) => {
      moveElement(elementId, data.x, data.y);
    },
    [moveElement]
  );

  const handleResize = useCallback(
    (elementId, data) => {
      updateElement(elementId, {
        x: data.x,
        y: data.y,
        width: data.width,
        height: data.height,
      });
    },
    [updateElement]
  );

  const handleElementSelect = useCallback(
    (elementId) => {
      selectElement(elementId);
    },
    [selectElement]
  );

  // Helper function to generate border styles based on element border properties
  const getBorderStyle = useCallback((element) => {
    if (!element.borderStyle || element.borderStyle === "none") {
      return {};
    }

    const borderWidth = element.borderWidth || 1;
    const borderColor = element.borderColor || "#000000";
    const borderValue = `${borderWidth}px solid ${borderColor}`;

    switch (element.borderStyle) {
      case "all":
        return { border: borderValue };

      case "one": {
        const side = element.borderSides || "left";
        return {
          [`border${side.charAt(0).toUpperCase()}${side.slice(1)}`]:
            borderValue,
        };
      }

      case "two": {
        const sides = element.borderSides || "vertical";
        if (sides === "vertical") {
          return {
            borderLeft: borderValue,
            borderRight: borderValue,
          };
        } else {
          // horizontal
          return {
            borderTop: borderValue,
            borderBottom: borderValue,
          };
        }
      }

      default:
        return {};
    }
  }, []);

  // Helper function to generate canvas border styles
  const getCanvasBorderStyle = useCallback(() => {
    if (!canvas.borderStyle || canvas.borderStyle === "none") {
      return { border: "1px solid rgba(0, 0, 0, 0.05)" }; // Default subtle border
    }

    const borderWidth = canvas.borderWidth || 1;
    const borderColor = canvas.borderColor || "#000000";
    const borderValue = `${borderWidth}px solid ${borderColor}`;

    switch (canvas.borderStyle) {
      case "all":
        return { border: borderValue };

      case "one": {
        const side = canvas.borderSides || "left";
        return {
          [`border${side.charAt(0).toUpperCase()}${side.slice(1)}`]:
            borderValue,
        };
      }

      case "two": {
        const sides = canvas.borderSides || "vertical";
        if (sides === "vertical") {
          return {
            borderLeft: borderValue,
            borderRight: borderValue,
          };
        } else {
          // horizontal
          return {
            borderTop: borderValue,
            borderBottom: borderValue,
          };
        }
      }

      default:
        return { border: "1px solid rgba(0, 0, 0, 0.05)" };
    }
  }, [
    canvas.borderStyle,
    canvas.borderWidth,
    canvas.borderColor,
    canvas.borderSides,
  ]);

  const renderTextElement = useCallback(
    (element, isSelected) => {
      // Determine display text based on showLabel property
      const displayText =
        element.showLabel && element.label
          ? `${element.label}: ${element.value}`
          : element.value;

      return (
        <ResizableElement
          key={element.id}
          position={{ x: element.x, y: element.y }}
          size={element.width && element.height ? { width: element.width, height: element.height } : null}
          onDrag={(e, data) => handleDrag(element.id, e, data)}
          onResize={(data) => handleResize(element.id, data)}
          onSelect={() => handleElementSelect(element.id)}
          isSelected={isSelected}
          zIndex={element.zIndex || 0}
          opacity={element.opacity !== undefined ? element.opacity : 1}
          minWidth={20}
          minHeight={10}
        >
          <div
            style={{
              border: isSelected
                ? "2px dashed #3b82f6"
                : "2px dashed transparent",
              padding: "4px",
              width: "100%",
              height: "100%",
              boxSizing: "border-box",
            }}
          >
            <div
              style={{
                fontSize: `${element.fontSize}px`,
                fontFamily: element.fontFamily,
                fontWeight: element.fontWeight,
                color: element.color,
                textAlign: element.align,
                whiteSpace: element.width ? "normal" : "nowrap",
                wordWrap: element.width ? "break-word" : "normal",
                userSelect: "none",
                pointerEvents: "none",
                width: "100%",
                height: "100%",
                overflow: "hidden",
                ...getBorderStyle(element),
              }}
            >
              {displayText}
            </div>
          </div>
        </ResizableElement>
      );
    },
    [handleDrag, handleResize, handleElementSelect, getBorderStyle]
  );

  const renderImageElement = useCallback(
    (element, isSelected) => {
      // Check if this is a Profile Photo field
      const isProfilePhoto = element.label === "Profile Photo" || 
                            (element.label?.toLowerCase().includes("photo") && 
                             element.label !== "");
      
      return (
        <DraggableElement
          key={element.id}
          position={{ x: element.x, y: element.y }}
          onDrag={(e, data) => handleDrag(element.id, e, data)}
          onSelect={() => handleElementSelect(element.id)}
          zIndex={element.zIndex || 0}
          opacity={element.opacity !== undefined ? element.opacity : 1}
        >
          <div
            style={{
              border: isSelected
                ? "2px dashed #3b82f6"
                : "2px dashed transparent",
            }}
          >
            {element.src && !isProfilePhoto ? (
              // Regular image with uploaded source
              <img
                src={element.src}
                alt="ID Card"
                style={{
                  width: `${element.width}px`,
                  height: `${element.height}px`,
                  borderRadius: `${element.borderRadius}px`,
                  objectFit: "cover",
                  display: "block",
                  pointerEvents: "none",
                  ...getBorderStyle(element),
                }}
              />
            ) : isProfilePhoto ? (
              // Profile Photo - Show placeholder with icon
              <div
                style={{
                  width: `${element.width}px`,
                  height: `${element.height}px`,
                  borderRadius: `${element.borderRadius}px`,
                  backgroundColor: "#e0f2fe",
                  border: "2px dashed #0284c7",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "12px",
                  color: "#0369a1",
                  pointerEvents: "none",
                  ...getBorderStyle(element),
                }}
              >
                <div style={{ fontSize: "32px", marginBottom: "8px" }}>👤</div>
                <div style={{ fontWeight: "600", textAlign: "center", padding: "0 8px" }}>
                  Profile Photo
                </div>
                <div style={{ fontSize: "10px", marginTop: "4px", textAlign: "center", padding: "0 8px" }}>
                  Loads from user data
                </div>
              </div>
            ) : (
              // Regular image without source - show upload placeholder
              <div
                style={{
                  width: `${element.width}px`,
                  height: `${element.height}px`,
                  borderRadius: `${element.borderRadius}px`,
                  backgroundColor: "#f0f0f0",
                  border: "2px dashed #999",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "12px",
                  color: "#666",
                  pointerEvents: "none",
                  ...getBorderStyle(element),
                }}
              >
                <div style={{ fontSize: "24px", marginBottom: "4px" }}>📷</div>
                <div>Upload Image</div>
              </div>
            )}
          </div>
        </DraggableElement>
      );
    },
    [handleDrag, handleElementSelect, getBorderStyle]
  );

  const renderQRElement = useCallback(
    (element, isSelected) => {
      // Build preview value from selected fields
      const selectedFields = element.qrFields || [];
      const previewValue = selectedFields.length > 0 
        ? selectedFields.join("\n") 
        : "No fields selected";
      
      return (
        <DraggableElement
          key={element.id}
          position={{ x: element.x, y: element.y }}
          onDrag={(e, data) => handleDrag(element.id, e, data)}
          onSelect={() => handleElementSelect(element.id)}
          zIndex={element.zIndex || 0}
          opacity={element.opacity !== undefined ? element.opacity : 1}
        >
          <div
            style={{
              border: isSelected
                ? "2px dashed #3b82f6"
                : "2px dashed transparent",
              padding: "4px",
            }}
          >
            <div style={getBorderStyle(element)}>
              <QRCodeSVG
                value={previewValue}
                size={element.size}
                style={{ pointerEvents: "none", display: "block" }}
              />
            </div>
          </div>
        </DraggableElement>
      );
    },
    [handleDrag, handleElementSelect, getBorderStyle]
  );

  const renderShapeElement = useCallback(
    (element, isSelected) => {
      const baseStyle = {
        width: "100%",
        height: "100%",
        backgroundColor: element.fillColor || "#ffffff",
        pointerEvents: "none",
        ...getBorderStyle(element),
      };

      let shapeContent;
      
      switch (element.shape) {
        case "rectangle":
          shapeContent = (
            <div
              style={{
                ...baseStyle,
                borderRadius: `${element.borderRadius || 0}px`,
              }}
            />
          );
          break;
        
        case "circle":
          shapeContent = (
            <div
              style={{
                ...baseStyle,
                borderRadius: "50%",
              }}
            />
          );
          break;
        
        case "line":
          shapeContent = (
            <div
              style={{
                width: "100%",
                height: `${element.lineWidth || 2}px`,
                backgroundColor: element.fillColor || "#000000",
                transform: `rotate(${element.rotation || 0}deg)`,
                transformOrigin: "left center",
                pointerEvents: "none",
              }}
            />
          );
          break;
        
        default:
          shapeContent = <div style={baseStyle} />;
      }

      return (
        <ResizableElement
          key={element.id}
          position={{ x: element.x, y: element.y }}
          size={{ width: element.width || 85, height: element.height || 55 }}
          onDrag={(e, data) => handleDrag(element.id, e, data)}
          onResize={(data) => handleResize(element.id, data)}
          onSelect={() => handleElementSelect(element.id)}
          isSelected={isSelected}
          zIndex={element.zIndex || 0}
          opacity={element.opacity !== undefined ? element.opacity : 1}
          minWidth={10}
          minHeight={10}
        >
          <div
            style={{
              border: isSelected
                ? "2px dashed #3b82f6"
                : "2px dashed transparent",
              width: "100%",
              height: "100%",
              boxSizing: "border-box",
            }}
          >
            {shapeContent}
          </div>
        </ResizableElement>
      );
    },
    [handleDrag, handleResize, handleElementSelect, getBorderStyle]
  );

  const renderElement = useCallback(
    (element) => {
      const isSelected = selectedElementId === element.id;
      
      switch (element.type) {
        case "text":
          return renderTextElement(element, isSelected);
        case "image":
          return renderImageElement(element, isSelected);
        case "qr":
          return renderQRElement(element, isSelected);
        case "shape":
          return renderShapeElement(element, isSelected);
        default:
          return null;
      }
    },
    [selectedElementId, renderTextElement, renderImageElement, renderQRElement, renderShapeElement]
  );

  const zoomScale = useMemo(() => canvas.zoom / 100, [canvas.zoom]);

  const handleCanvasClick = useCallback(
    (e) => {
      // Only deselect if clicking directly on the canvas, not on elements
      if (e.target.id === "id-card-canvas") {
        deselectElement();
      }
    },
    [deselectElement]
  );

  const canvasStyle = useMemo(() => {
    // Convert hex color to rgba with opacity
    const hexToRgba = (hex, opacity) => {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    };

    const backgroundColor = hexToRgba(
      canvas.backgroundColor || "#ffffff",
      canvas.backgroundOpacity !== undefined ? canvas.backgroundOpacity : 1
    );

    const baseStyle = {
      width: `${canvas.width}px`,
      height: `${canvas.height}px`,
      backgroundColor,
      position: "relative",
      boxShadow:
        "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
      transform: `scale(${zoomScale})`,
      transformOrigin: "center center",
      transition: "transform 0.1s ease-out",
    };

    // Apply canvas border styles
    const canvasBorderStyle = getCanvasBorderStyle();
    Object.assign(baseStyle, canvasBorderStyle);

    // Build background image string
    let backgroundImage = "none";
    let backgroundSize = "auto";

    if (canvas.showGrid && canvas.backgroundImage) {
      backgroundImage = `linear-gradient(to right, #e0e0e0 1px, transparent 1px),
                        linear-gradient(to bottom, #e0e0e0 1px, transparent 1px),
                        url(${canvas.backgroundImage})`;
      backgroundSize = `${canvas.gridSize}px ${canvas.gridSize}px, ${canvas.gridSize}px ${canvas.gridSize}px, cover`;
    } else if (canvas.showGrid) {
      backgroundImage = `linear-gradient(to right, #e0e0e0 1px, transparent 1px),
                        linear-gradient(to bottom, #e0e0e0 1px, transparent 1px)`;
      backgroundSize = `${canvas.gridSize}px ${canvas.gridSize}px, ${canvas.gridSize}px ${canvas.gridSize}px`;
    } else if (canvas.backgroundImage) {
      backgroundImage = `url(${canvas.backgroundImage})`;
      backgroundSize = "cover";
    }

    return {
      ...baseStyle,
      backgroundImage,
      backgroundSize,
      backgroundPosition: "center",
    };
  }, [canvas, zoomScale, getCanvasBorderStyle]);

  const sortedElements = useMemo(
    () => [...validElements].sort((a, b) => a.zIndex - b.zIndex),
    [validElements]
  );

  return (
    <div
      ref={containerRef}
      className="flex-1 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-6 overflow-auto"
    >
      <div
        ref={canvasRef}
        id="id-card-canvas"
        onClick={handleCanvasClick}
        style={canvasStyle}
      >
        {sortedElements.map((element) => renderElement(element))}
      </div>
    </div>
  );
};

export default Canvas;
