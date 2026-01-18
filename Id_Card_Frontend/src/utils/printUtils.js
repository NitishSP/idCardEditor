/**
 * Print utility functions for ID card printing
 */

import { DEFAULT_CARD_SIZE } from './cardSizeUtils';

/**
 * Generate HTML content for printing
 * @param {string} dataUrl - Base64 image data URL
 * @param {Object} dimensions - Canvas dimensions {width, height}
 * @param {string} orientation - 'landscape' or 'portrait'
 * @param {number} copies - Number of copies to print
 * @returns {string} HTML content for printing
 */
export const generatePrintHTML = (dataUrl, dimensions, orientation, copies = 1) => {
  // Use default card size, swap for portrait
  const widthMm = orientation === 'landscape' ? DEFAULT_CARD_SIZE.widthMm : DEFAULT_CARD_SIZE.heightMm;
  const heightMm = orientation === 'landscape' ? DEFAULT_CARD_SIZE.heightMm : DEFAULT_CARD_SIZE.widthMm;

  // Generate multiple copies
  const cardsHTML = Array(copies)
    .fill(null)
    .map(() => `
      <div style="
        width: ${widthMm}mm;
        height: ${heightMm}mm;
        page-break-after: always;
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <img 
          src="${dataUrl}" 
          alt="ID Card"
          style="
            width: 100%;
            height: 100%;
            object-fit: contain;
          "
        />
      </div>
    `)
    .join('');

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Print ID Card</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          @page {
            size: ${widthMm}mm ${heightMm}mm;
            margin: 0;
          }
          body {
            margin: 0;
            padding: 0;
          }
          @media print {
            body {
              print-color-adjust: exact;
              -webkit-print-color-adjust: exact;
            }
          }
        </style>
      </head>
      <body>
        ${cardsHTML}
      </body>
    </html>
  `;
};
