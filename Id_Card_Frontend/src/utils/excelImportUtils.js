import ExcelJS from "exceljs";
import { getFieldValue, setFieldValue, getDbColumn } from "./fieldMapping";

/**
 * Parse Excel file and extract user data
 * @param {File} file - Excel file to parse
 * @param {Array} fields - Active field definitions
 * @returns {Promise<Array>} Array of parsed user records
 */
export const parseExcelFile = async (file, fields) => {
  const workbook = new ExcelJS.Workbook();
  const arrayBuffer = await file.arrayBuffer();
  await workbook.xlsx.load(arrayBuffer);

  const worksheet = workbook.getWorksheet(1);
  if (!worksheet) {
    throw new Error("Excel file is empty or invalid");
  }

  // Get header row (first row)
  const headerRow = worksheet.getRow(1);
  const headers = [];
  headerRow.eachCell((cell, colNumber) => {
    headers[colNumber] = cell.value?.toString().trim();
  });

  // Parse data rows
  const records = [];
  worksheet.eachRow((row, rowNumber) => {
    // Skip header row
    if (rowNumber === 1) return;

    const record = { rowNumber };
    let isEmpty = true;

    row.eachCell((cell, colNumber) => {
      const header = headers[colNumber];
      if (header) {
        const value = cell.value?.toString().trim();
        if (value) {
          isEmpty = false;
          record[header] = value;
        }
      }
    });

    // Only add non-empty rows
    if (!isEmpty) {
      records.push(record);
    }
  });

  return records;
};

/**
 * Validate user record against field definitions
 * @param {Object} record - User record to validate
 * @param {Array} fields - Active field definitions
 * @param {number} rowNumber - Row number in Excel (for error reporting)
 * @returns {Object} { valid: boolean, errors: Array, data: Object }
 */
export const validateUserRecord = (record, fields, rowNumber) => {
  const errors = [];
  const userData = {};

  // Get active fields (excluding photo)
  const activeFields = fields.filter(f => f.isActive === 1 && f.fieldType !== 'photo');

  // Validate each field
  activeFields.forEach(field => {
    const value = record[field.label];

    // Check required fields
    if (field.isRequired === 1) {
      if (!value || value.toString().trim() === '') {
        errors.push(`${field.label} is required`);
        userData[field.label] = ''; // Still add to userData for display
        return;
      }
    }

    // If no value and not required, use default or empty
    if (!value || value.toString().trim() === '') {
      userData[field.label] = field.defaultValue || '';
      return;
    }

    // Validate field type
    const trimmedValue = value.toString().trim();
    
    switch (field.fieldType) {
      case 'number':
        const numValue = Number(trimmedValue);
        if (isNaN(numValue)) {
          errors.push(`${field.label} must be a valid number`);
          userData[field.label] = trimmedValue; // Keep original for display
        } else {
          userData[field.label] = numValue;
        }
        break;

      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(trimmedValue)) {
          errors.push(`${field.label} must be a valid email address`);
          userData[field.label] = trimmedValue;
        } else {
          userData[field.label] = trimmedValue;
        }
        break;

      case 'phone':
        // Allow various phone formats
        const phoneRegex = /^[\d\s\-\+\(\)]+$/;
        if (!phoneRegex.test(trimmedValue)) {
          errors.push(`${field.label} must contain only numbers and phone formatting characters`);
          userData[field.label] = trimmedValue;
        } else {
          userData[field.label] = trimmedValue;
        }
        break;

      case 'date':
        const date = new Date(trimmedValue);
        if (isNaN(date.getTime())) {
          errors.push(`${field.label} must be a valid date (YYYY-MM-DD format recommended)`);
          userData[field.label] = trimmedValue;
        } else {
          userData[field.label] = trimmedValue;
        }
        break;

      case 'text':
      default:
        userData[field.label] = trimmedValue;
        break;
    }
  });

  return {
    valid: errors.length === 0,
    errors,
    data: userData,
    rowNumber
  };
};

/**
 * Validate and split imported data into valid and invalid records
 * @param {Array} records - Parsed records from Excel
 * @param {Array} fields - Active field definitions
 * @returns {Object} { validRecords: Array, invalidRecords: Array }
 */
export const validateImportedData = (records, fields) => {
  const validRecords = [];
  const invalidRecords = [];

  records.forEach((record) => {
    const validation = validateUserRecord(record, fields, record.rowNumber);
    
    if (validation.valid) {
      validRecords.push(validation.data);
    } else {
      invalidRecords.push({
        rowNumber: validation.rowNumber,
        data: record,
        errors: validation.errors
      });
    }
  });

  return { validRecords, invalidRecords };
};

/**
 * Convert validated records to API format
 * @param {Array} validRecords - Valid user records
 * @param {Array} fields - Active field definitions
 * @returns {Array} Array of user objects ready for API
 */
export const convertToApiFormat = (validRecords, fields) => {
  return validRecords.map(record => {
    const userData = {
      additionalData: {}
    };

    // Map fields to database columns using field mapping utility
    fields.forEach(field => {
      if (field.fieldType === 'photo') return; // Skip photo field
      
      const value = record[field.label];
      if (value !== undefined && value !== null) {
        setFieldValue(userData, field, value);
      }
    });

    return userData;
  });
};

/**
 * Generate sample Excel file with current field schema
 * @param {Array} fields - Active field definitions
 * @returns {Promise<Blob>} Excel file as Blob
 */
export const generateSampleExcel = async (fields) => {
  try {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("User Import Template");

    // Get active fields (excluding photo)
    const activeFields = fields.filter(f => f.isActive === 1 && f.fieldType !== 'photo');

    if (activeFields.length === 0) {
      throw new Error("No active fields available to generate template");
    }

    // Define columns based on actual fields
    const columns = activeFields.map(field => ({
      header: field.label,
      key: field.label,
      width: 25
    }));

    worksheet.columns = columns;

    // Style header row
    const headerRow = worksheet.getRow(1);
    headerRow.height = 25;
    headerRow.font = { bold: true, size: 12, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' }
    };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' };

    // Generate smart sample data based on field configuration
    const sampleData = [];
    for (let i = 0; i < 3; i++) {
      const record = {};
      
      activeFields.forEach((field) => {
        let sampleValue;

        // Generate sample based on field type and label
        switch (field.fieldType) {
          case 'number':
            if (field.label.toLowerCase().includes('age')) {
              sampleValue = 25 + i * 5;
            } else if (field.label.toLowerCase().includes('id') || field.label.toLowerCase().includes('emp')) {
              sampleValue = (1001 + i).toString();
            } else {
              sampleValue = (100 + i * 10).toString();
            }
            break;

          case 'email':
            const names = ['john.doe', 'jane.smith', 'bob.johnson'];
            sampleValue = `${names[i]}@example.com`;
            break;

          case 'phone':
            sampleValue = `+1-555-010${i + 1}`;
            break;

          case 'date':
            const dates = ['2024-01-15', '2024-02-20', '2024-03-10'];
            sampleValue = dates[i];
            break;

          case 'text':
          default:
            const labelLower = field.label.toLowerCase();
            
            if (labelLower.includes('name') && !labelLower.includes('user')) {
              const names = ['John Doe', 'Jane Smith', 'Bob Johnson'];
              sampleValue = names[i];
            } else if (labelLower.includes('emp') && labelLower.includes('id')) {
              sampleValue = `EMP${(1001 + i).toString().padStart(4, '0')}`;
            } else if (labelLower.includes('id')) {
              sampleValue = `ID${(1001 + i).toString().padStart(4, '0')}`;
            } else if (labelLower.includes('department') || labelLower.includes('dept')) {
              const depts = ['IT', 'HR', 'Sales'];
              sampleValue = depts[i];
            } else if (labelLower.includes('position') || labelLower.includes('role') || labelLower.includes('designation')) {
              const positions = ['Manager', 'Developer', 'Analyst'];
              sampleValue = positions[i];
            } else if (labelLower.includes('address')) {
              const addresses = ['123 Main St, City, State', '456 Oak Ave, Town, State', '789 Pine Rd, Village, State'];
              sampleValue = addresses[i];
            } else if (labelLower.includes('city')) {
              const cities = ['New York', 'Los Angeles', 'Chicago'];
              sampleValue = cities[i];
            } else if (labelLower.includes('state')) {
              const states = ['NY', 'CA', 'IL'];
              sampleValue = states[i];
            } else if (labelLower.includes('country')) {
              sampleValue = 'USA';
            } else if (labelLower.includes('zip') || labelLower.includes('postal')) {
              sampleValue = `${10001 + i * 100}`;
            } else {
              // Generic sample value
              sampleValue = `Sample ${field.label} ${i + 1}`;
            }
            break;
        }

        record[field.label] = sampleValue;
      });
      
      sampleData.push(record);
    }

    // Add sample data rows
    sampleData.forEach((data, rowIndex) => {
      const row = worksheet.addRow(data);
      row.height = 20;
      
      row.eachCell((cell, colNumber) => {
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFD3D3D3' } },
          left: { style: 'thin', color: { argb: 'FFD3D3D3' } },
          bottom: { style: 'thin', color: { argb: 'FFD3D3D3' } },
          right: { style: 'thin', color: { argb: 'FFD3D3D3' } }
        };
        cell.alignment = { vertical: 'middle', horizontal: 'left' };
        
        // Alternate row colors
        if (rowIndex % 2 === 1) {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFF5F5F5' }
          };
        }
      });
    });

    // Add instructions sheet
    const instructionsSheet = workbook.addWorksheet("📋 Instructions");
    instructionsSheet.getColumn(1).width = 100;
    
    const instructions = [
      { text: "📊 User Import Template - Instructions", style: { font: { bold: true, size: 16, color: { argb: 'FF2E5090' } } } },
      { text: "" },
      { text: "✅ How to use this template:", style: { font: { bold: true, size: 12 } } },
      { text: "   1. Switch to the 'User Import Template' tab" },
      { text: "   2. Replace the sample data with your actual user information" },
      { text: "   3. DO NOT change the column headers (first row)" },
      { text: "   4. Ensure all REQUIRED fields are filled" },
      { text: "   5. Follow the correct data format for each field type" },
      { text: "   6. Save the file and upload it in the Import Users dialog" },
      { text: "" },
      { text: "⚠️ Important Notes:", style: { font: { bold: true, size: 12 } } },
      { text: "   • Photo fields are NOT included in Excel import" },
      { text: "   • Photos must be added individually through the user management interface" },
      { text: "   • Empty rows will be automatically skipped" },
      { text: "   • Invalid data will be shown in the validation results" },
      { text: "" },
      { text: "📝 Field Configuration:", style: { font: { bold: true, size: 12 } } },
      { text: "" },
    ];

    // Add field information
    activeFields.forEach(field => {
      const requiredTag = field.isRequired === 1 ? ' [REQUIRED ✱]' : ' [Optional]';
      const typeInfo = ` - Type: ${field.fieldType.toUpperCase()}`;
      
      instructions.push({
        text: `   • ${field.label}${requiredTag}${typeInfo}`,
        style: { 
          font: { 
            bold: field.isRequired === 1,
            color: { argb: field.isRequired === 1 ? 'FFDC143C' : 'FF000000' }
          } 
        }
      });

      // Add format hints
      let formatHint = '';
      switch (field.fieldType) {
        case 'number':
          formatHint = '        Format: Numbers only (e.g., 25, 1001)';
          break;
        case 'email':
          formatHint = '        Format: valid@email.com';
          break;
        case 'phone':
          formatHint = '        Format: +1-234-567-8900 or any phone format';
          break;
        case 'date':
          formatHint = '        Format: YYYY-MM-DD (e.g., 2024-01-15)';
          break;
      }
      
      if (formatHint) {
        instructions.push({
          text: formatHint,
          style: { font: { italic: true, size: 10, color: { argb: 'FF666666' } } }
        });
      }
    });

    instructions.push({ text: "" });
    instructions.push({ text: "💡 Need Help?", style: { font: { bold: true, size: 12 } } });
    instructions.push({ text: "   • Check the sample data in 'User Import Template' tab for examples" });
    instructions.push({ text: "   • Contact your system administrator for support" });

    // Write instructions with styling
    instructions.forEach((instruction, index) => {
      const row = instructionsSheet.getRow(index + 1);
      row.height = 20;
      const cell = row.getCell(1);
      cell.value = instruction.text;
      
      if (instruction.style) {
        if (instruction.style.font) {
          cell.font = instruction.style.font;
        }
      }
      
      cell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
    });

    // Generate buffer and return blob
    const buffer = await workbook.xlsx.writeBuffer();
    return new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
  } catch (error) {
    console.error('Error generating sample Excel:', error);
    throw new Error(`Failed to generate sample Excel: ${error.message}`);
  }
};
