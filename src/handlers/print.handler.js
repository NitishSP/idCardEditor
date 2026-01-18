const { ipcMain, BrowserWindow } = require('electron');
const { rateLimitMiddleware, errorHandlerMiddleware } = require('../middleware');
const response = require('../utils/response');
const logger = require('../utils/logger');
const fs = require('fs');
const path = require('path');
const os = require('os');

/**
 * Print IPC handler
 */
class PrintHandler {
  /**
   * Register print-related IPC handler
   */
  register() {
    ipcMain.handle('print:content',
      rateLimitMiddleware.apply('print:content',
        errorHandlerMiddleware.wrap(this.handlePrint.bind(this), 'Print content')
      )
    );
  }

  /**
   * Handle print content
   */
  async handlePrint(event, html) {
    let printWindow = null;

    try {
      // Create temporary HTML file
      const tempDir = os.tmpdir();
      const tempFilePath = path.join(tempDir, `print-${Date.now()}.html`);
      fs.writeFileSync(tempFilePath, html, 'utf8');

      // Create hidden print window
      printWindow = new BrowserWindow({
        show: false,
        webPreferences: {
          nodeIntegration: false,
          contextIsolation: true,
          sandbox: true
        }
      });

      // Load the HTML file
      await printWindow.loadFile(tempFilePath);

      // Wait for content to load
      await new Promise(resolve => setTimeout(resolve, 500));

      // Print with callback
      return new Promise((resolve) => {
        printWindow.webContents.print({
          silent: false,
          printBackground: true,
          margins: { marginType: 'none' }
        }, (success, failureReason) => {
          // Cleanup
          printWindow.close();
          printWindow = null;
          fs.unlinkSync(tempFilePath);

          if (success) {
            logger.info('Print completed successfully');
            resolve(response.success(null, 'Print completed successfully'));
          } else {
            logger.warn(`Print cancelled: ${failureReason}`);
            resolve(response.error(`Print cancelled: ${failureReason}`));
          }
        });
      });
    } catch (error) {
      if (printWindow) {
        printWindow.close();
      }
      throw error;
    }
  }
}

module.exports = new PrintHandler();
