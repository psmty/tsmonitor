import { writeFile, utils, read } from 'xlsx';

import {
  BasePlugin,
  dispatch,
  type DataType,
  type PluginProviders,
} from '@revolist/revogrid';

export const EXCEL_EXPORT_EVENT = 'export-excel';
export const EXCEL_BEFORE_IMPORT_EVENT = 'excel-before-import';
export const EXCEL_BEFORE_SET_EVENT = 'excel-before-set';

import type { WritingOptions } from 'xlsx';

export type ExportExcelEvent = {
  sheetName?: string;
  workbookName?: string;
  writingOptions?: WritingOptions;
};

const DRAG_CLASS = 'is-dragging';

export class ExportExcelPlugin extends BasePlugin {
  constructor(revogrid: HTMLRevoGridElement, providers: PluginProviders) {
    super(revogrid, providers);
    this.addEventListener(
      EXCEL_EXPORT_EVENT,
      async (e: CustomEvent) =>
        this.export(e.detail),
    );

    // Prevent default behavior on dragenter and dragover to allow file drop
    revogrid.addEventListener('dragover', (event) => {
      event.preventDefault();
      revogrid.classList.add(DRAG_CLASS);
    });

    revogrid.addEventListener('dragenter', (event) => {
      event.preventDefault();
      revogrid.classList.add(DRAG_CLASS);
    });

    // Handle drop event
    revogrid.addEventListener('drop', async (event: DragEvent) => {
      event.preventDefault();
      revogrid.classList.remove(DRAG_CLASS);

      if (event.dataTransfer && event.dataTransfer.files.length > 0) {
        const file = event.dataTransfer.files[0];
        this.importFile(file);
      }
    });
  }

  // Utility method to read the file as an array buffer
  private async readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as ArrayBuffer);
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  }

  /**
   * Imports an Excel file into the grid.
   *
   * @param file The File object to import
   *
   * This method reads the file using FileReader, parses it using xlsx library,
   * and then dispatches the 'excel-before-import' event to allow plugins to
   * modify the sheet before it is imported.
   *
   * After the sheet is imported, the method dispatches the 'excel-before-set'
   * event to allow plugins to modify the data before it is set as the new
   * source.
   *
   * If either event is prevented, the method will not set the new source.
   *
   * If the file is not an Excel file, the method will log an error.
   */
  async importFile(file: File) {
    // Ensure it's an Excel file
    if (
      file.type ===
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      file.name.endsWith('.xlsx')
    ) {
      try {
        // Read the file using FileReader
        const fileData = await this.readFileAsArrayBuffer(file);

        // Parse the file using xlsx library
        const workbook = read(fileData, { type: 'array' });

        // Get the first sheet in the workbook
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        // Dispatch the 'excel-before-import' event
        // This allows plugins to modify the sheet before it is imported
        const event = dispatch(this.revogrid, EXCEL_BEFORE_IMPORT_EVENT, {
          sheetName,
          sheet,
          workbook,
        });

        if (event.defaultPrevented) {
          return;
        }

        // Convert the sheet to JSON
        const jsonData = utils.sheet_to_json<DataType>(event.detail.sheet);

        // Dispatch the 'excel-before-set' event
        // This allows plugins to modify the data before it is set as the new source
        const eventSet = dispatch(this.revogrid, EXCEL_BEFORE_SET_EVENT, {
          sheetName,
          sheet,
          workbook,
          jsonData,
        });

        if (eventSet.defaultPrevented) {
          return;
        }

        // Set the parsed data as the new source for RevoGrid
        this.revogrid.source = eventSet.detail.jsonData;
      } catch (error) {
        console.error('Failed to load Excel file:', error);
      }
    } else {
      console.error('Only Excel files are supported.');
    }
  }

  export(config?: ExportExcelEvent) {
    const wb = utils.book_new();
    const ws = utils.json_to_sheet(this.revogrid.source);
    utils.book_append_sheet(wb, ws, config?.workbookName || 'Workbook 1');
    writeFile(
      wb,
      config?.sheetName || 'RevoGrid-Sheet.xlsx',
      config?.writingOptions ?? { bookType: 'xlsx' },
    );
  }
}