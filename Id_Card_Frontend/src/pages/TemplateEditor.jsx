import React, { useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import html2canvas from "html2canvas";
import Navbar from "../components/Navbar";
import Toolbar from "../components/Toolbar";
import Sidebar from "../components/Sidebar";
import Canvas from "../components/Canvas";
import PropertyPanel from "../components/PropertyPanel";
import { useTemplateByName, useUpdateTemplate } from "../hooks/useTemplates";
import useCardStore from "../store/useCardStore";
import { mmToPx, DEFAULT_CARD_SIZE } from "../utils/cardSizeUtils";
import toast from "react-hot-toast";

const TemplateEditor = () => {
  const { name } = useParams();
  const { importData, canvas, elements } = useCardStore();

  // Fetch template if name is provided (not 'new')
  const { data: templateData, isLoading } = useTemplateByName(name, {
    onSuccess: (data) => {
      console.log("Successfully fetched template data:", data);
    },
    enabled: name !== "new" && !!name,
  });
  // useEffect(() => {
  //   if (templateData) {
  //     importData({
  //       canvas: templateData.templateData.canvas,
  //       elements: templateData.templateData.elements,
  //     });
  //   }
  // }, [templateData, importData]);
  // Update template mutation
  const updateTemplateMutation = useUpdateTemplate({
    onSuccess: () => {
      toast.success("Template saved successfully!");
      setTimeout(() => {
        window.location.reload();
      }, 500);
    },
    onError: () => {
      toast.error("Failed to save template");
    },
  });

  // Simple save function
  const saveTemplate = useCallback(async () => {
    // For new templates, user must provide a name first via SaveTemplateModal
    if (name === "new") {
      toast.error("Please save the template with a name first");
      return;
    }

    // Filter out elements that are outside the card area
    const visibleElements = elements.filter((el) => {
      // Check if element is at least partially inside the canvas
      const elementRight = el.x + (el.width || 0);
      const elementBottom = el.y + (el.height || 0);
      
      // Element is outside if:
      // - starts after canvas width OR
      // - starts after canvas height OR
      // - ends before canvas starts (negative position beyond element size)
      const isOutside = 
        el.x >= canvas.width ||
        el.y >= canvas.height ||
        elementRight <= 0 ||
        elementBottom <= 0;
      
      return !isOutside;
    });

    // Validate canvas has visible elements
    if (visibleElements.length === 0) {
      toast.error("Cannot save template. All elements are outside the card area.");
      return;
    }

    // Notify if some elements were excluded
    if (visibleElements.length < elements.length) {
      toast.info(`${elements.length - visibleElements.length} element(s) outside card area were excluded.`);
    }

    // Generate thumbnail
    const canvasElement = document.getElementById("id-card-canvas");
    let thumbnail = null;

    if (canvasElement) {
      try {
        const capturedCanvas = await html2canvas(canvasElement, {
          backgroundColor: canvas.backgroundColor,
          scale: 0.5,
        });
        thumbnail = capturedCanvas.toDataURL("image/jpeg", 0.7);
      } catch (error) {
        console.error("Failed to generate thumbnail:", error);
      }
    }

    // Prepare template data
    const payload = {
      name: decodeURIComponent(name), // Use name from URL
      thumbnail,
      cardWidthMm: canvas.cardWidthMm,
      cardHeightMm: canvas.cardHeightMm,
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
        elements: visibleElements.map((el) => {
          const { ref: _ref, ...elementData } = el;
          return elementData;
        }),
      },
    };

    console.log("=== SAVING TEMPLATE ===");
    console.log("Card dimensions from canvas:", {
      cardWidthMm: canvas.cardWidthMm,
      cardHeightMm: canvas.cardHeightMm,
      width: canvas.width,
      height: canvas.height,
    });
    console.log("Payload being sent:", payload);

    // Save using findOneAndUpdate (backend will create if not exists)
    updateTemplateMutation.mutate({
      name: decodeURIComponent(name),
      data: payload,
    });
  }, [name, canvas, elements, updateTemplateMutation]);

  // Load template data when fetched
  useEffect(() => {
    if (name === "new") {
      console.log("Loading NEW template");
      // Clear canvas for new template with default values (CR80 standard)
      importData({
        canvas: {
          width: mmToPx(DEFAULT_CARD_SIZE.widthMm),
          height: mmToPx(DEFAULT_CARD_SIZE.heightMm),
          backgroundColor: "#ffffff",
          backgroundOpacity: 1,
          backgroundImage: null,
          borderStyle: "none",
          borderWidth: 1,
          borderColor: "#000000",
          borderSides: "",
          cardWidthMm: DEFAULT_CARD_SIZE.widthMm,
          cardHeightMm: DEFAULT_CARD_SIZE.heightMm,
        },
        elements: [],
      });
    } else if (templateData) {
      // Load existing template
      const template = templateData;

      if (templateData.templateData) {
        // Load all canvas properties including border settings and card dimensions
        const cardWidthMm = templateData.cardWidthMm;
        const cardHeightMm = templateData.cardHeightMm;
        
        const canvasData = {
          width: mmToPx(cardWidthMm),
          height: mmToPx(cardHeightMm),
          backgroundColor:
            templateData.templateData.canvas.backgroundColor || "#ffffff",
          backgroundOpacity:
            templateData.templateData.canvas.backgroundOpacity !== undefined
              ? templateData.templateData.canvas.backgroundOpacity
              : 1,
          backgroundImage:
            templateData.templateData.canvas.backgroundImage || null,
          borderStyle: templateData.templateData.canvas.borderStyle || "none",
          borderWidth: templateData.templateData.canvas.borderWidth || 1,
          borderColor:
            templateData.templateData.canvas.borderColor || "#000000",
          borderSides: templateData.templateData.canvas.borderSides || "",
          cardWidthMm: cardWidthMm,
          cardHeightMm: cardHeightMm,
        };

        const dataToImport = {
          canvas: canvasData,
          elements: templateData.templateData.elements || [],
        };

        console.log("=== LOADING TEMPLATE ===");
        console.log(
          "Raw template elements:",
          templateData.templateData.elements
        );
        console.log("Elements to import:", dataToImport.elements);
        console.log("Sample element properties:", dataToImport.elements[0]);

        importData(dataToImport);

        toast.success(`Template "${template.name}" loaded for editing`);
      }
    }
  }, [name, templateData, importData]);

  if (isLoading && name !== "new") {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading template...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Navbar />
      <Toolbar
        templateName={
          name !== "new" ? decodeURIComponent(name) : "New Template"
        }
        onSave={saveTemplate}
        isNewTemplate={name === "new"}
      />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <Canvas />
        <PropertyPanel />
      </div>
    </div>
  );
};

export default TemplateEditor;
