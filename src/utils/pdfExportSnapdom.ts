import { snapdom } from '@zumer/snapdom';
import jsPDF from 'jspdf';

export interface ExportOptions {
  filename?: string;
  quality?: number;
  scale?: number;
  format?: 'a4' | 'letter';
}

/**
 * Prepare element for export - minimal changes
 */
function prepareForExport(element: HTMLElement): void {
  // Remove UI elements
  const toRemove = [
    '[data-drag-handle]',
    '[data-page-header]',
    '[data-drop-indicator]',
  ];
  
  toRemove.forEach(selector => {
    const elements = element.querySelectorAll(selector);
    elements.forEach(el => el.remove());
  });
  
  // Clean selection borders
  const allElements = element.querySelectorAll('*');
  allElements.forEach(el => {
    const htmlEl = el as HTMLElement;
    if (htmlEl.style.border?.includes('rgb(37, 99, 235)')) {
      htmlEl.style.border = 'none';
    }
    if (htmlEl.style.outline?.includes('rgb(37, 99, 235)')) {
      htmlEl.style.outline = 'none';
    }
    htmlEl.style.transition = 'none';
    htmlEl.style.cursor = 'default';
  });
}

/**
 * Export worksheet pages to PDF using snapdom
 * snapdom has better layout preservation than html2canvas
 */
export async function exportToPDF(
  pageElements: HTMLElement[],
  options: ExportOptions = {}
): Promise<void> {
  const {
    filename = 'worksheet',
    format = 'a4',
  } = options;

  try {
    console.log(`Starting PDF export with snapdom: ${pageElements.length} pages`);
    
    // PDF dimensions
    const pdfWidth = format === 'a4' ? 210 : 215.9;
    const pdfHeight = format === 'a4' ? 297 : 279.4;

    // Create PDF
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: format,
      compress: true,
    });

    // Process each page
    for (let i = 0; i < pageElements.length; i++) {
      console.log(`Processing page ${i + 1}/${pageElements.length}`);
      
      const pageElement = pageElements[i];
      
      // Add new page (except for first page)
      if (i > 0) {
        pdf.addPage();
      }

      // Clone and prepare
      const clone = pageElement.cloneNode(true) as HTMLElement;
      prepareForExport(clone);
      
      // Position off-screen
      clone.style.position = 'fixed';
      clone.style.left = '-9999px';
      clone.style.top = '0';
      clone.style.width = '794px';
      clone.style.minHeight = '1123px';
      
      document.body.appendChild(clone);

      // Wait for layout
      await new Promise(resolve => setTimeout(resolve, 200));

      // Convert to image using snapdom
      console.log('Converting with snapdom...');
      const imageResult = await snapdom.toWebp(clone, {
        width: 794,
        height: 1123,
        backgroundColor: '#ffffff',
        quality: 1.0,
        compress: false,
        embedFonts: true,
        fast: false,
      });

      console.log(`Snapdom image created`);

      // Remove clone
      document.body.removeChild(clone);

      // Add to PDF
      const imgWidth = pdfWidth;
      const imgHeight = pdfHeight;
      pdf.addImage(imageResult.src, 'WEBP', 0, 0, imgWidth, imgHeight, undefined, 'FAST');
      
      console.log(`Page ${i + 1} added to PDF`);
    }

    // Save PDF
    const timestamp = new Date().toISOString().slice(0, 10);
    pdf.save(`${filename}_${timestamp}.pdf`);
    
    console.log('PDF saved successfully');

    return Promise.resolve();
  } catch (error) {
    console.error('PDF Export Error:', error);
    throw new Error('Failed to export PDF. Please try again.');
  }
}

/**
 * Export single page to PNG using snapdom
 */
export async function exportToPNG(
  pageElement: HTMLElement,
  filename: string = 'worksheet'
): Promise<void> {
  let clone: HTMLElement | null = null;

  try {
    console.log('Starting PNG export with snapdom');
    
    clone = pageElement.cloneNode(true) as HTMLElement;
    prepareForExport(clone);
    
    clone.style.position = 'fixed';
    clone.style.left = '-9999px';
    clone.style.top = '0';
    clone.style.width = '794px';
    clone.style.minHeight = '1123px';
    
    document.body.appendChild(clone);
    await new Promise(resolve => setTimeout(resolve, 200));

    const imageResult = await snapdom.toPng(clone, {
      width: 794,
      height: 1123,
      backgroundColor: '#ffffff',
      quality: 1.0,
      compress: false,
      embedFonts: true,
      fast: false,
    });

    document.body.removeChild(clone);
    clone = null;

    // Download
    const link = document.createElement('a');
    link.href = imageResult.src;
    const timestamp = new Date().toISOString().slice(0, 10);
    link.download = `${filename}_${timestamp}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    console.log('PNG downloaded successfully');

    return Promise.resolve();
  } catch (error) {
    console.error('PNG Export Error:', error);
    if (clone && clone.parentNode) {
      document.body.removeChild(clone);
    }
    throw new Error('Failed to export PNG. Please try again.');
  }
}

/**
 * Print worksheet pages
 */
export function printWorksheet(pageElements: HTMLElement[]): void {
  const printWindow = window.open('', '_blank');
  
  if (!printWindow) {
    throw new Error('Failed to open print window. Please allow popups.');
  }

  const pageContents = pageElements.map((pageElement, index) => {
    const clone = pageElement.cloneNode(true) as HTMLElement;
    
    const toRemove = ['[data-drag-handle]', '[data-page-header]', '[data-drop-indicator]'];
    toRemove.forEach(selector => {
      clone.querySelectorAll(selector).forEach(el => el.remove());
    });
    
    const printContent = clone.querySelector('[data-print-content]');
    const content = printContent ? printContent.innerHTML : clone.innerHTML;
    const pageBreak = index < pageElements.length - 1 ? 'page-break-after: always;' : '';
    
    return `
      <div style="width: 210mm; min-height: 297mm; padding: 15mm 12mm; box-sizing: border-box; background: white; ${pageBreak}">
        ${content}
      </div>
    `;
  }).join('');

  const printHTML = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Print Worksheet</title>
        <style>
          @page { size: A4; margin: 0; }
          body { margin: 0; padding: 0; font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
          * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        </style>
      </head>
      <body>
        ${pageContents}
        <script>
          window.onload = function() {
            window.print();
            setTimeout(() => window.close(), 100);
          };
        </script>
      </body>
    </html>
  `;

  printWindow.document.write(printHTML);
  printWindow.document.close();
}
