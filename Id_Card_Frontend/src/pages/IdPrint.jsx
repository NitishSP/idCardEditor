import React, { useState } from "react";
import { Printer, Filter, CheckSquare, Square } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import QRCode from "qrcode";
import toast from "react-hot-toast";
import Navbar from "../components/Navbar";
import { useUsers } from "../hooks/useUsers";
import { useTemplates } from "../hooks/useTemplates";
import { useFields } from "../hooks/useFields";
import { templateService } from "../services/templateService";
import { getFieldValue } from "../utils/fieldMapping";

const IdPrint = () => {
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch data
  const { data: usersData, isLoading: isLoadingUsers } = useUsers();
  const { data: templatesData, isLoading: isLoadingTemplates } = useTemplates();
  const { data: fieldsData } = useFields();

  const users = usersData?.data || [];
  const templates = templatesData || [];
  const fields = fieldsData || [];
  
  // Get active fields for display
  const activeFields = fields.filter(f => f.isActive === 1);
  const displayFields = activeFields.filter(f => f.fieldType !== 'photo');
  const photoField = activeFields.find(f => f.fieldType === 'photo');

  // Filter users - search across all active text fields
  const filteredUsers = users.filter((user) => {
    if (searchTerm === "") return true;
    
    const searchLower = searchTerm.toLowerCase();
    
    // Search in any text-based field
    return displayFields.some(field => {
      const value = getFieldValue(user, field);
      return value && value.toString().toLowerCase().includes(searchLower);
    });
  });

  // Toggle user selection
  const toggleUserSelection = (userId) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  // Select all filtered users
  const selectAll = () => {
    setSelectedUsers(filteredUsers.map((u) => u.id));
  };

  // Clear selection
  const clearSelection = () => {
    setSelectedUsers([]);
  };

  // Direct print without preview
  const handlePrint = async () => {
    if (selectedUsers.length === 0) {
      toast.error("Please select at least one user");
      return;
    }
    if (!selectedTemplate) {
      toast.error("Please select a template");
      return;
    }

    const loadingToast = toast.loading(`Preparing to print ${selectedUsers.length} ID card(s)...`);

    try {
      // Fetch full template data with templateData
      const template = await templateService.getTemplateById(
        parseInt(selectedTemplate)
      );
      if (!template || !template.templateData) {
        toast.dismiss(loadingToast);
        toast.error("Template data not found");
        return;
      }

      const usersToPrint = users.filter((u) => selectedUsers.includes(u.id));
      
      // Get card dimensions from template (stored in mm)
      const widthMm = template.cardWidthMm;
      const heightMm = template.cardHeightMm;

      // Generate cards HTML with async QR code generation
      const cardsHTMLPromises = usersToPrint.map(async (user) => {
        const cardHTML = await renderCardHTML(user, template);
        return `
          <div style="
            width: ${widthMm}mm;
            height: ${heightMm}mm;
            page-break-after: always;
            margin: 0;
            padding: 0;
          ">
            ${cardHTML}
          </div>
        `;
      });

      const cardsHTMLArray = await Promise.all(cardsHTMLPromises);
      const cardsHTML = cardsHTMLArray.join("");

      const htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Print ID Cards</title>
            <style>
              * {
                margin: 0 !important;
                padding: 0 !important;
                box-sizing: border-box;
              }
              html, body {
                margin: 0 !important;
                padding: 0 !important;
                width: 100%;
                height: 100%;
              }
              @page {
                size: ${widthMm}mm ${heightMm}mm;
                margin: 0;
              }
              @media print {
                html, body {
                  margin: 0 !important;
                  padding: 0 !important;
                  print-color-adjust: exact;
                  -webkit-print-color-adjust: exact;
                }
                .id-card {
                  box-shadow: none !important;
                }
              }
            </style>
          </head>
          <body>
            ${cardsHTML}
          </body>
        </html>
      `;

      const result = await window.electron.print.printContent(htmlContent);
      toast.dismiss(loadingToast);
      
      if (result.success) {
        toast.success(`Print dialog opened for ${usersToPrint.length} ID card(s)`);
      } else {
        toast.error("Failed to open print dialog: " + (result.error || "Unknown error"));
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error("Failed to print", error.message || error);
    }
  };

  // Helper function to render card as HTML string
  const renderCardHTML = async (user, template) => {
    const { canvas, elements } = template.templateData;
    console.log("Canvas",canvas);
    
    // Get card dimensions from template (stored in mm)
    const widthMm = template.cardWidthMm;
    const heightMm = template.cardHeightMm;

    const hexToRgba = (hex, opacity = 1) => {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    };

    const backgroundColor = hexToRgba(
      canvas.backgroundColor || "#ffffff",
      canvas.backgroundOpacity !== undefined ? canvas.backgroundOpacity : 1
    );

    // Generate border style
    let borderStyle = "";
    if (canvas.borderStyle && canvas.borderStyle !== "none") {
      const borderWidth = canvas.borderWidth || 1;
      const borderColor = canvas.borderColor || "#000000";

      if (canvas.borderStyle === "all") {
        borderStyle = `border: ${borderWidth}px solid ${borderColor};`;
      } else if (canvas.borderStyle === "one") {
        const sides = canvas.borderSides || "top";
        if (sides === "top")
          borderStyle = `border-top: ${borderWidth}px solid ${borderColor};`;
        else if (sides === "right")
          borderStyle = `border-right: ${borderWidth}px solid ${borderColor};`;
        else if (sides === "bottom")
          borderStyle = `border-bottom: ${borderWidth}px solid ${borderColor};`;
        else if (sides === "left")
          borderStyle = `border-left: ${borderWidth}px solid ${borderColor};`;
      } else if (canvas.borderStyle === "two") {
        const sides = canvas.borderSides || "top-bottom";
        // Support both "horizontal" / "top-bottom" and "vertical" / "left-right"
        if (sides === "top-bottom" || sides === "horizontal") {
          borderStyle = `border-top: ${borderWidth}px solid ${borderColor}; border-bottom: ${borderWidth}px solid ${borderColor};`;
        } else if (sides === "left-right" || sides === "vertical") {
          borderStyle = `border-left: ${borderWidth}px solid ${borderColor}; border-right: ${borderWidth}px solid ${borderColor};`;
        }
      }
    }

    let elementsHTML = "";
    const sortedElements = [...elements].sort((a, b) => a.zIndex - b.zIndex);

    // Pre-generate QR codes as data URLs
    const qrCodePromises = [];
    sortedElements.forEach((element, index) => {
      if (element.type === "qr") {
        // Build QR value from selected fields
        const selectedFields = element.qrFields || [];
        
        const fieldValues = [];
        selectedFields.forEach(fieldLabel => {
          const field = fields.find(f => f.label === fieldLabel);
          if (!field) return;
          
          const value = getFieldValue(user, field);
          
          // Skip photo/image fields in QR code
          if (field.fieldType === 'photo') {
            return;
          }
          
          if (value) {
            fieldValues.push(`${fieldLabel}: ${value}`);
          }
        });
        
        // Join all field values with line breaks
        const qrValue = fieldValues.length > 0 ? fieldValues.join("\n") : "No data";

        const qrSize = element.size || 100;
        
        // Generate QR code as data URL
        const promise = QRCode.toDataURL(qrValue, {
          width: qrSize,
          margin: 1,
          errorCorrectionLevel: 'M'
        }).then(dataUrl => ({
          index,
          dataUrl
        }));
        
        qrCodePromises.push(promise);
      }
    });

    // Wait for all QR codes to be generated
    const qrCodeResults = await Promise.all(qrCodePromises);
    const qrCodeMap = new Map(qrCodeResults.map(r => [r.index, r.dataUrl]));
    console.log("Generated QR Codes:", qrCodeMap);

    sortedElements.forEach((element, index) => {
      console.log("Element", element);
      
      if (element.type === "text") {
        // Get value dynamically using field mapping utility
        const field = fields.find(f => f.label === element.label);
        let value = field ? getFieldValue(user, field) : element.value;
        
        // Skip if this is a photo field (shouldn't be rendered as text)
        if (field && field.fieldType === 'photo') {
          return;
        }

        // Apply showLabel if enabled
        const displayValue =
          element.showLabel && element.label
            ? `${element.label}: ${value}`
            : value;

        // Get border styles for elements
        const getBorderStyle = () => {
          if (!element.borderStyle || element.borderStyle === "none") return "";

          const borderWidth = element.borderWidth || 1;
          const borderColor = element.borderColor || "#000000";
          const borderValue = `${borderWidth}px solid ${borderColor}`;

          switch (element.borderStyle) {
            case "all":
              return `border: ${borderValue};`;
            case "one": {
              const side = element.borderSides || "top";
              return `border-${side}: ${borderValue};`;
            }
            case "two": {
              const sides = element.borderSides || "top-bottom";
              if (sides === "top-bottom") {
                return `border-top: ${borderValue}; border-bottom: ${borderValue};`;
              } else if (sides === "left-right") {
                return `border-left: ${borderValue}; border-right: ${borderValue};`;
              }
              return "";
            }
            default:
              return "";
          }
        };

        elementsHTML += `
          <div style="
            position: absolute;
            left: ${element.x}px;
            top: ${element.y}px;
            font-size: ${element.fontSize}px;
            font-family: ${element.fontFamily};
            font-weight: ${element.fontWeight};
            color: ${element.color};
            text-align: ${element.align};
            white-space: nowrap;
            opacity: ${element.opacity !== undefined ? element.opacity : 1};
            ${getBorderStyle()}
          ">${displayValue}</div>
        `;
      } else if (element.type === "image") {
        // Check if this is a Profile Photo field or a static image
        const field = fields.find(f => f.label === element.label);
        const isProfilePhoto = field && field.fieldType === 'photo';
        
        // Determine the image source dynamically:
        // - For Profile Photo fields: use user data (dynamic)
        // - For static images: use element.src (static, from template)
        const imageSrc = isProfilePhoto ? getFieldValue(user, field) : element.src;
        
        // Skip if there's no image source
        if (!imageSrc) return;
        
        // Get border styles for image elements
        let imageBorderStyle = "";
        if (element.borderStyle && element.borderStyle !== "none") {
          const borderWidth = element.borderWidth || 1;
          const borderColor = element.borderColor || "#000000";
          const borderValue = `${borderWidth}px solid ${borderColor}`;

          if (element.borderStyle === "all") {
            imageBorderStyle = `border: ${borderValue};`;
          } else if (element.borderStyle === "one") {
            const side = element.borderSides || "top";
            imageBorderStyle = `border-${side}: ${borderValue};`;
          } else if (element.borderStyle === "two") {
            const sides = element.borderSides || "top-bottom";
            if (sides === "top-bottom") {
              imageBorderStyle = `border-top: ${borderValue}; border-bottom: ${borderValue};`;
            } else if (sides === "left-right") {
              imageBorderStyle = `border-left: ${borderValue}; border-right: ${borderValue};`;
            }
          }
        }

        elementsHTML += `
          <div style="
            position: absolute;
            left: ${element.x}px;
            top: ${element.y}px;
          ">
            <img src="${imageSrc}" alt="${isProfilePhoto ? (fields.find(f => f.label.toLowerCase() === 'name') ? getFieldValue(user, fields.find(f => f.label.toLowerCase() === 'name')) : 'User') : 'Static Image'}" style="
              width: ${element.width}px;
              height: ${element.height}px;
              border-radius: ${element.borderRadius || 0}px;
              object-fit: cover;
              opacity: ${element.opacity !== undefined ? element.opacity : 1};
              ${imageBorderStyle}
            " />
          </div>
        `;
      } else if (element.type === "qr") {
        // Get the pre-generated QR code data URL
        const qrDataUrl = qrCodeMap.get(index);
        
        if (!qrDataUrl) return; // Skip if QR code generation failed

        // Get border styles for QR elements
        let qrBorderStyle = "";
        if (element.borderStyle && element.borderStyle !== "none") {
          const borderWidth = element.borderWidth || 1;
          const borderColor = element.borderColor || "#000000";
          const borderValue = `${borderWidth}px solid ${borderColor}`;

          if (element.borderStyle === "all") {
            qrBorderStyle = `border: ${borderValue};`;
          } else if (element.borderStyle === "one") {
            const side = element.borderSides || "top";
            qrBorderStyle = `border-${side}: ${borderValue};`;
          } else if (element.borderStyle === "two") {
            const sides = element.borderSides || "top-bottom";
            if (sides === "top-bottom") {
              qrBorderStyle = `border-top: ${borderValue}; border-bottom: ${borderValue};`;
            } else if (sides === "left-right") {
              qrBorderStyle = `border-left: ${borderValue}; border-right: ${borderValue};`;
            }
          }
        }

        const qrSize = element.size || 100;

        elementsHTML += `
          <div style="
            position: absolute;
            left: ${element.x}px;
            top: ${element.y}px;
            ${qrBorderStyle}
            opacity: ${element.opacity !== undefined ? element.opacity : 1};
            display: inline-block;
          ">
            <img src="${qrDataUrl}" alt="QR Code" width="${qrSize}" height="${qrSize}" style="display: block;" />
          </div>
        `;
      } else if (element.type === "shape") {
        // Get border styles for shape elements
        let shapeBorderStyle = "";
        if (element.borderStyle && element.borderStyle !== "none") {
          const borderWidth = element.borderWidth || 1;
          const borderColor = element.borderColor || "#000000";
          const borderValue = `${borderWidth}px solid ${borderColor}`;

          if (element.borderStyle === "all") {
            shapeBorderStyle = `border: ${borderValue};`;
          } else if (element.borderStyle === "one") {
            const side = element.borderSides || "top";
            shapeBorderStyle = `border-${side}: ${borderValue};`;
          } else if (element.borderStyle === "two") {
            const sides = element.borderSides || "top-bottom";
            if (sides === "top-bottom") {
              shapeBorderStyle = `border-top: ${borderValue}; border-bottom: ${borderValue};`;
            } else if (sides === "left-right") {
              shapeBorderStyle = `border-left: ${borderValue}; border-right: ${borderValue};`;
            }
          }
        }

        // Render based on shape type
        let shapeStyle = "";
        if (element.shape === "rectangle") {
          shapeStyle = `
            width: ${element.width}px;
            height: ${element.height}px;
            background-color: ${element.fillColor || "#ffffff"};
            border-radius: ${element.borderRadius || 0}px;
            ${shapeBorderStyle}
          `;
        } else if (element.shape === "circle") {
          shapeStyle = `
            width: ${element.width}px;
            height: ${element.height}px;
            background-color: ${element.fillColor || "#ffffff"};
            border-radius: 50%;
            ${shapeBorderStyle}
          `;
        } else if (element.shape === "line") {
          shapeStyle = `
            width: ${element.width}px;
            height: ${element.lineWidth || 2}px;
            background-color: ${element.fillColor || "#000000"};
            transform: rotate(${element.rotation || 0}deg);
            transform-origin: left center;
          `;
        }

        elementsHTML += `
          <div style="
            position: absolute;
            left: ${element.x}px;
            top: ${element.y}px;
            opacity: ${element.opacity !== undefined ? element.opacity : 1};
            ${shapeStyle}
          "></div>
        `;
      }
    });

    return `
      <div style="
        width: ${widthMm}mm;
        height: ${heightMm}mm;
        background-color: ${backgroundColor};
        position: relative;
        background-image: ${
          canvas.backgroundImage ? `url(${canvas.backgroundImage})` : "none"
        };
        background-size: cover;
        background-position: center;
        box-sizing: border-box;
        ${borderStyle}
      ">
        ${elementsHTML}
      </div>
    `;
  };

  if (isLoadingUsers || isLoadingTemplates) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <div className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3 mb-4">
              <Printer size={32} className="text-blue-600" />
              Print ID Cards
            </h1>

            {/* Controls */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              {/* Search */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Filter size={16} className="inline mr-1" />
                  Search Users
                </label>
                <input
                  type="text"
                  placeholder="Search by name or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Template Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Template *
                </label>
                <select
                  value={selectedTemplate || ""}
                  onChange={(e) => setSelectedTemplate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Choose template...</option>
                  {templates.map((template) => (
                    <option key={template.id} value={template.id}>
                      {template.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Print Button */}
              <div className="flex items-end">
                <button
                  onClick={handlePrint}
                  disabled={selectedUsers.length === 0 || !selectedTemplate}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md transition-all"
                >
                  <Printer size={18} />
                  Print{" "}
                  {selectedUsers.length > 0 && `(${selectedUsers.length})`}
                </button>
              </div>
            </div>

            {/* Selection Controls */}
            <div className="mt-4 flex items-center justify-between bg-blue-50 p-3 rounded-lg border border-blue-200">
              <div className="text-sm text-blue-800">
                <strong>{selectedUsers.length}</strong> of{" "}
                <strong>{filteredUsers.length}</strong> users selected
              </div>
              <div className="flex gap-2">
                <button
                  onClick={selectAll}
                  className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Select All
                </button>
                <button
                  onClick={clearSelection}
                  className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                >
                  Clear Selection
                </button>
              </div>
            </div>
          </div>

          {/* Users Table */}
          {filteredUsers.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center border border-gray-200">
              <p className="text-gray-600">No users found</p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left w-12">
                        <button
                          onClick={() =>
                            selectedUsers.length === filteredUsers.length
                              ? clearSelection()
                              : selectAll()
                          }
                          className="p-1 hover:bg-gray-200 rounded"
                        >
                          {selectedUsers.length === filteredUsers.length &&
                          filteredUsers.length > 0 ? (
                            <CheckSquare size={20} className="text-blue-600" />
                          ) : (
                            <Square size={20} className="text-gray-400" />
                          )}
                        </button>
                      </th>
                      {photoField && (
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                          {photoField.label}
                        </th>
                      )}
                      {displayFields.map((field) => (
                        <th key={field.id} className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                          {field.label}
                        </th>
                      ))}
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                        Created
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredUsers.map((user) => {
                      const nameField = displayFields.find(f => f.label.toLowerCase() === 'name');
                      const displayName = nameField ? getFieldValue(user, nameField) : 'User';
                      const photoValue = photoField ? getFieldValue(user, photoField) : null;
                      
                      return (
                        <tr
                          key={user.id}
                          onClick={() => toggleUserSelection(user.id)}
                          className={`hover:bg-gray-50 cursor-pointer transition-colors ${
                            selectedUsers.includes(user.id) ? "bg-blue-50" : ""
                          }`}
                        >
                          <td className="px-4 py-3">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleUserSelection(user.id);
                              }}
                              className="p-1 hover:bg-gray-200 rounded"
                            >
                              {selectedUsers.includes(user.id) ? (
                                <CheckSquare
                                  size={20}
                                  className="text-blue-600"
                                />
                              ) : (
                                <Square size={20} className="text-gray-400" />
                              )}
                            </button>
                          </td>
                          {photoField && (
                            <td className="px-4 py-3">
                              {photoValue ? (
                                <img
                                  src={photoValue}
                                  alt={displayName}
                                  className="w-10 h-10 rounded-full object-cover border border-gray-200"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 text-xs">
                                  No Photo
                                </div>
                              )}
                            </td>
                          )}
                          {displayFields.map((field) => (
                            <td key={field.id} className="px-4 py-3">
                              <div className="text-sm text-gray-600">
                                {getFieldValue(user, field) || '-'}
                              </div>
                            </td>
                          ))}
                          <td className="px-4 py-3">
                            <div className="text-sm text-gray-600">
                              {new Date(user.createdAt).toLocaleDateString()}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default IdPrint;
