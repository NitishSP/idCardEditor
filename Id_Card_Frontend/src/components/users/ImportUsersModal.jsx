import React, { useState } from "react";
import {
  X,
  Upload,
  Download,
  CheckCircle,
  AlertCircle,
  FileSpreadsheet,
} from "lucide-react";
import toast from "react-hot-toast";

const ImportUsersModal = ({
  isOpen,
  onClose,
  onValidate,
  onImport,
  onDownloadSample,
  fields,
  isImporting,
}) => {
  const [file, setFile] = useState(null);
  const [validData, setValidData] = useState([]);
  const [invalidData, setInvalidData] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [isValidating, setIsValidating] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Validate file type
    const validTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
    ];

    if (!validTypes.includes(selectedFile.type)) {
      toast.error("Please upload a valid Excel file (.xlsx or .xls)");
      return;
    }

    setFile(selectedFile);
    setShowResults(false);
    setValidData([]);
    setInvalidData([]);
  };

  const handleValidateAndParse = async () => {
    if (!file) {
      toast.error("Please select a file first");
      return;
    }

    try {
      setIsValidating(true);

      // Call parent's validation function
      const { validRecords, invalidRecords } = await onValidate(file);

      console.log("Validation results:", { validRecords, invalidRecords });

      setValidData(validRecords);
      setInvalidData(invalidRecords);
      setShowResults(true);
      setIsValidating(false);
    } catch (error) {
      setIsValidating(false);
      toast.error(error.message || "Failed to validate file");
    }
  };

  const handleConfirmImport = async () => {
    if (!validData || validData.length === 0) {
      toast.error("No valid records to import");
      return;
    }

    console.log("Importing valid data:", validData);

    // Call parent's import function with valid data array
    await onImport(validData);
  };

  const handleClose = () => {
    setFile(null);
    setValidData([]);
    setInvalidData([]);
    setShowResults(false);
    onClose();
  };

  // Get active fields (excluding photo)
  const activeFields = fields.filter(
    (f) => f.isActive === 1 && f.fieldType !== "photo"
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Upload size={24} className="text-purple-600" />
            Import Users from Excel
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {!showResults ? (
            // Upload Section
            <div className="space-y-6">
              {/* Instructions */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">
                  Instructions:
                </h3>
                <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                  <li>
                    Download the sample Excel template to see the required
                    format
                  </li>
                  <li>
                    Fill in user data according to your field configuration
                  </li>
                  <li>
                    Do not include photo data in Excel (photos must be added
                    individually)
                  </li>
                  <li>Required fields must not be empty</li>
                  <li>Upload the completed Excel file for validation</li>
                </ul>
              </div>

              {/* Download Sample */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <FileSpreadsheet
                  size={48}
                  className="mx-auto text-gray-400 mb-3"
                />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Download Sample Excel
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Get the template with current field configuration
                </p>
                <button
                  onClick={onDownloadSample}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 mx-auto"
                >
                  <Download size={18} />
                  Download Sample Template
                </button>
              </div>

              {/* File Upload */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload size={48} className="mx-auto text-gray-400 mb-3" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Upload Your Excel File
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Select an Excel file (.xlsx or .xls) to import users
                </p>
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileChange}
                  className="hidden"
                  id="excel-upload"
                />
                <label
                  htmlFor="excel-upload"
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 cursor-pointer inline-flex items-center gap-2"
                >
                  <Upload size={18} />
                  Choose File
                </label>
                {file && (
                  <p className="mt-3 text-sm text-gray-700">
                    Selected: <strong>{file.name}</strong>
                  </p>
                )}
              </div>

              {/* Validate Button */}
              {file && (
                <div className="flex justify-center">
                  <button
                    onClick={handleValidateAndParse}
                    disabled={isValidating}
                    className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-semibold"
                  >
                    {isValidating ? "Validating..." : "Validate & Preview Data"}
                  </button>
                </div>
              )}
            </div>
          ) : (
            // Results Section
            <div className="space-y-6">
              {/* Summary */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle size={20} className="text-green-600" />
                    <h3 className="font-semibold text-green-900">
                      Valid Records
                    </h3>
                  </div>
                  <p className="text-3xl font-bold text-green-700">
                    {validData.length}
                  </p>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle size={20} className="text-red-600" />
                    <h3 className="font-semibold text-red-900">
                      Invalid Records
                    </h3>
                  </div>
                  <p className="text-3xl font-bold text-red-700">
                    {invalidData.length}
                  </p>
                </div>
              </div>

              {/* Valid Data Table */}
              {validData.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <CheckCircle size={18} className="text-green-600" />
                    Valid Data Preview (First 10 records)
                  </h3>
                  <div className="border border-gray-200 rounded-lg overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-3 py-2 text-left font-semibold text-gray-700">
                            #
                          </th>
                          {activeFields.map((field) => (
                            <th
                              key={field.id}
                              className="px-3 py-2 text-left font-semibold text-gray-700"
                            >
                              {field.label}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {validData.slice(0, 10).map((record, idx) => (
                          <tr key={idx} className="hover:bg-gray-50">
                            <td className="px-3 py-2 text-gray-600">
                              {idx + 1}
                            </td>
                            {activeFields.map((field) => (
                              <td
                                key={field.id}
                                className="px-3 py-2 text-gray-900"
                              >
                                {record[field.label] || "-"}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {validData.length > 10 && (
                    <p className="text-sm text-gray-600 mt-2">
                      ... and {validData.length - 10} more records
                    </p>
                  )}
                </div>
              )}

              {/* Invalid Data Table */}
              {invalidData.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <AlertCircle size={18} className="text-red-600" />
                    Invalid Data (Errors)
                  </h3>
                  <div className="border border-red-200 rounded-lg overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-red-50">
                        <tr>
                          <th className="px-3 py-2 text-left font-semibold text-gray-700">
                            Row
                          </th>
                          {activeFields.map((field) => (
                            <th
                              key={field.id}
                              className="px-3 py-2 text-left font-semibold text-gray-700"
                            >
                              {field.label}
                            </th>
                          ))}
                          <th className="px-3 py-2 text-left font-semibold text-red-700">
                            Errors
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {invalidData.map((record, idx) => (
                          <tr key={idx} className="bg-red-50">
                            <td className="px-3 py-2 text-gray-600">
                              {record.rowNumber}
                            </td>
                            {activeFields.map((field) => (
                              <td
                                key={field.id}
                                className="px-3 py-2 text-gray-900"
                              >
                                {record.data[field.label] || "-"}
                              </td>
                            ))}
                            <td className="px-3 py-2">
                              <ul className="text-xs text-red-700 space-y-1">
                                {record.errors.map((error, errIdx) => (
                                  <li key={errIdx}>• {error}</li>
                                ))}
                              </ul>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancel
          </button>

          {showResults && validData.length > 0 && (
            <button
              onClick={handleConfirmImport}
              disabled={isImporting}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 font-semibold"
            >
              {isImporting
                ? "Importing..."
                : `Import ${validData.length} Valid Records`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImportUsersModal;
