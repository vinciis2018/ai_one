
import * as pdfjsLib from 'pdfjs-dist';

// Set the worker source. 
// We use the same CDN version as in the import map.
// pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://aistudiocdn.com/pdfjs-dist@5.4.296/build/pdf.min.js';
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

export const loadPdf = async (file: File): Promise<any> => {
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  return loadingTask.promise;
};

export const renderPageToImage = async (pdfDoc: any, pageNum: number): Promise<string> => {
  try {
    const page = await pdfDoc.getPage(pageNum);
    
    // Set a reasonable scale for quality (e.g., 2.0 for retina-like sharpness)
    const scale = 2.0;
    const viewport = page.getViewport({ scale });

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    
    if (!context) throw new Error('Canvas context not available');

    canvas.height = viewport.height;
    canvas.width = viewport.width;

    const renderContext = {
      canvasContext: context,
      viewport: viewport,
    };

    await page.render(renderContext).promise;
    
    // Return base64 image
    return canvas.toDataURL('image/jpeg', 0.9);
  } catch (error) {
    console.error(`Error rendering page ${pageNum}:`, error);
    throw error;
  }
};
