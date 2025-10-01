import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export interface ExportOptions {
  filename?: string;
  quality?: number;
  scale?: number;
  format?: 'a4' | 'letter';
}

/**
 * Export worksheet pages to PDF
 * @param pageElements - Array of HTML elements (pages) to export
 * @param options - Export configuration options
 */
export async function exportToPDF(
  pageElements: HTMLElement[],
  options: ExportOptions = {}
): Promise<void> {
  const {
    filename = 'worksheet',
    quality = 0.95,
    scale = 3, // Increased for better quality
    format = 'a4',
  } = options;

  try {
    // PDF dimensions (A4: 210mm x 297mm)
    const pdfWidth = format === 'a4' ? 210 : 215.9; // Letter: 8.5in = 215.9mm
    const pdfHeight = format === 'a4' ? 297 : 279.4; // Letter: 11in = 279.4mm

    // Create PDF
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: format,
      compress: true,
    });

    // Process each page
    for (let i = 0; i < pageElements.length; i++) {
      const pageElement = pageElements[i];
      
      // Add new page (except for first page)
      if (i > 0) {
        pdf.addPage();
      }

      // Get actual element dimensions
      const rect = pageElement.getBoundingClientRect();
      const elementWidth = rect.width;
      const elementHeight = rect.height;

      // Convert HTML to canvas with proper dimensions
      const canvas = await html2canvas(pageElement, {
        scale: scale,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        width: elementWidth,
        height: elementHeight,
        x: 0,
        y: 0,
        scrollX: 0,
        scrollY: 0,
        allowTaint: false,
      });

      // Convert canvas to image
      const imgData = canvas.toDataURL('image/png', 1.0); // Use PNG for better quality

      // Calculate dimensions to fit page while maintaining aspect ratio
      const canvasAspectRatio = canvas.width / canvas.height;
      const pdfAspectRatio = pdfWidth / pdfHeight;

      let imgWidth = pdfWidth;
      let imgHeight = pdfHeight;

      if (canvasAspectRatio > pdfAspectRatio) {
        // Canvas is wider than PDF page
        imgWidth = pdfWidth;
        imgHeight = pdfWidth / canvasAspectRatio;
      } else {
        // Canvas is taller than PDF page
        imgHeight = pdfHeight;
        imgWidth = pdfHeight * canvasAspectRatio;
      }

      // Center the image on the page
      const xOffset = (pdfWidth - imgWidth) / 2;
      const yOffset = (pdfHeight - imgHeight) / 2;

      // Add image to PDF
      pdf.addImage(imgData, 'PNG', xOffset, yOffset, imgWidth, imgHeight, undefined, 'FAST');
    }

    // Save PDF
    const timestamp = new Date().toISOString().slice(0, 10);
    pdf.save(`${filename}_${timestamp}.pdf`);

    return Promise.resolve();
  } catch (error) {
    console.error('PDF Export Error:', error);
    throw new Error('Failed to export PDF. Please try again.');
  }
}

/**
 * Export single page to PNG image
 * @param pageElement - HTML element to export
 * @param filename - Output filename
 */
export async function exportToPNG(
  pageElement: HTMLElement,
  filename: string = 'worksheet'
): Promise<void> {
  try {
    // Get actual element dimensions
    const rect = pageElement.getBoundingClientRect();
    const elementWidth = rect.width;
    const elementHeight = rect.height;

    const canvas = await html2canvas(pageElement, {
      scale: 3, // Higher scale for better quality
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      width: elementWidth,
      height: elementHeight,
      x: 0,
      y: 0,
      scrollX: 0,
      scrollY: 0,
      allowTaint: false,
    });

    // Convert to blob and download
    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        const timestamp = new Date().toISOString().slice(0, 10);
        link.download = `${filename}_${timestamp}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
    }, 'image/png', 1.0); // Maximum quality

    return Promise.resolve();
  } catch (error) {
    console.error('PNG Export Error:', error);
    throw new Error('Failed to export PNG. Please try again.');
  }
}

/**
 * Print worksheet pages
 * @param pageElements - Array of HTML elements to print
 */
export function printWorksheet(pageElements: HTMLElement[]): void {
  const printWindow = window.open('', '_blank');
  
  if (!printWindow) {
    throw new Error('Failed to open print window. Please allow popups.');
  }

  // Build print HTML
  const printHTML = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Print Worksheet</title>
        <style>
          @page {
            size: A4;
            margin: 0;
          }
          body {
            margin: 0;
            padding: 0;
            font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          }
          .page {
            page-break-after: always;
            width: 210mm;
            min-height: 297mm;
            padding: 20mm;
            box-sizing: border-box;
            background: white;
          }
          .page:last-child {
            page-break-after: auto;
          }
          @media print {
            body {
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
          }
        </style>
      </head>
      <body>
        ${pageElements.map(el => `<div class="page">${el.innerHTML}</div>`).join('')}
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

