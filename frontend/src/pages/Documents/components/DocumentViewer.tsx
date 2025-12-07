import React, { useEffect, useState, useRef } from "react";

import 'katex/dist/katex.min.css';
import { loadPdf, renderPageToImage } from "../../../utilities/pdfUtils";
import { useSelectionBox } from "../../../hooks/useSelectionBox";

interface DocumentViewerProps {
  selectedDocument: any; // Using any to match existing flexibility, or strict DocumentItem
  pageNumber: number;
  onPageChange: (page: number) => void;
  onImageSelection?: (selection: { box_2d: number[], pageNumber: number }) => void;
  onPageRendered?: (base64: string) => void;
}

export const DocumentViewer: React.FC<DocumentViewerProps> = ({
  selectedDocument,
  pageNumber,
  onPageChange,
  onImageSelection,
  onPageRendered
}) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pdfDocument, setPdfDocument] = useState<any>(null);
  const [pageImage, setPageImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const imageRef = useRef<HTMLImageElement>(null);

  const {
    selection,
    isSelecting,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    getSelectionData,
    clearSelection,
    handleResizeStart
  } = useSelectionBox({ imageRef });

  // Load PDF Document
  useEffect(() => {
    const loadDocument = async () => {
      if (!selectedDocument?.s3_url) {
        setPdfDocument(null);
        return;
      }

      const fileName = selectedDocument.filename || "";
      const isPdf = fileName.toLowerCase().endsWith('.pdf');

      if (!isPdf) {
        // It's an image, just use it directly
        setPageImage(selectedDocument.s3_url);
        setNumPages(1);
        if (onPageRendered) onPageRendered(selectedDocument.s3_url);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(selectedDocument.s3_url);
        const blob = await response.blob();
        const file = new File([blob], fileName, { type: 'application/pdf' });

        const pdf = await loadPdf(file);
        setPdfDocument(pdf);
        setNumPages(pdf.numPages);
      } catch (err) {
        console.error("Error loading PDF:", err);
        setError("Failed to load PDF document");
      } finally {
        setIsLoading(false);
      }
    };

    loadDocument();
  }, [selectedDocument]);

  // Render Page to Image (only for PDFs)
  useEffect(() => {
    const renderPage = async () => {
      if (!pdfDocument || !pageNumber) return;

      setIsLoading(true);
      try {
        const imageUrl = await renderPageToImage(pdfDocument, pageNumber);
        setPageImage(imageUrl);
        if (onPageRendered) onPageRendered(imageUrl);
      } catch (err) {
        console.error("Error rendering page:", err);
        setError(`Failed to render page ${pageNumber}`);
      } finally {
        setIsLoading(false);
      }
    };

    if (pdfDocument) {
      renderPage();
    }
  }, [pdfDocument, pageNumber]);

  const handleAddSelection = () => {
    if (!onImageSelection) return;
    const data = getSelectionData();
    if (!data) return;

    onImageSelection({ box_2d: data.box_2d, pageNumber });
    clearSelection();
  };

  const handleClearSelection = (e: React.MouseEvent) => {
    e.stopPropagation();
    clearSelection();
  };

  return (
    <div className="w-full h-full bg-slate-900 flex flex-col rounded-xl overflow-hidden border border-slate-700 shadow-sm">
      {/* Toolbar */}
      <div className="p-2 flex items-center justify-center text-white text-xs shadow-md shrink-0">

        {/* PDF Controls */}
        {numPages && numPages > 1 && (
          <div className="flex items-center gap-3 bg-slate-700 rounded-full px-3 py-1">
            <button
              onClick={() => onPageChange(pageNumber - 1)}
              disabled={pageNumber <= 1}
              className="hover:text-blue-300 disabled:opacity-30 disabled:hover:text-white flex items-center transition-colors"
            >
              <i className="fi fi-rr-angle-small-left text-base"></i>
            </button>
            <span className="font-mono text-xs text-slate-200">
              {pageNumber} / {numPages}
            </span>
            <button
              onClick={() => onPageChange(pageNumber + 1)}
              disabled={pageNumber >= numPages}
              className="hover:text-blue-300 disabled:opacity-30 disabled:hover:text-white flex items-center transition-colors"
            >
              <i className="fi fi-rr-angle-small-right text-base"></i>
            </button>
          </div>
        )}

      </div>

      {/* Main Content Area */}
      <div className="flex-1 relative flex items-center justify-center bg-slate-900 overflow-hidden">
        {!selection && !isLoading && !error && (
          <div className="absolute top-4 left-4 z-10 bg-black/50 text-white text-xs px-3 py-1 rounded-full flex items-center gap-2 backdrop-blur-md pointer-events-none transition-opacity hover:opacity-0">
            <i className="fi fi-rr-crosshairs text-sm"></i> Drag to add snippet
          </div>
        )}

        {isLoading && (
          <div className="flex flex-col items-center justify-center text-slate-400">
            <i className="fi fi-br-circle animate-spin text-2xl mb-3" />
            <p className="text-sm">Loading document...</p>
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center justify-center text-red-400 text-center p-4">
            <i className="fi fi-rr-exclamation text-2xl mb-2" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {!isLoading && !error && pageImage && (
          <div
            className="relative"
            style={{ maxWidth: '100%', maxHeight: '100%', display: 'flex' }}
            onMouseDown={onImageSelection ? handleMouseDown : undefined}
            onMouseMove={onImageSelection ? handleMouseMove : undefined}
            onMouseUp={onImageSelection ? handleMouseUp : undefined}
            onMouseLeave={onImageSelection ? handleMouseUp : undefined}
            onTouchStart={onImageSelection ? handleTouchStart : undefined}
            onTouchMove={onImageSelection ? handleTouchMove : undefined}
            onTouchEnd={onImageSelection ? handleTouchEnd : undefined}
          >
            <img
              ref={imageRef}
              src={pageImage}
              alt={`Page ${pageNumber}`}
              className={`max-w-full max-h-full object-contain shadow-2xl transition-opacity duration-300 ${isSelecting ? 'cursor-crosshair' : 'cursor-default'}`}
              draggable={false}
            />

            {/* Selection Overlay */}
            {selection && (
              <div
                className="absolute border-2 border-green-400 bg-green-400/20 z-20 pointer-events-none"
                style={{
                  left: selection.x,
                  top: selection.y,
                  width: selection.w,
                  height: selection.h
                }}
              >
                {/* Resize Handles */}
                <div
                  className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-white border border-green-500 cursor-nw-resize pointer-events-auto z-10"
                  onMouseDown={(e) => handleResizeStart(e, 'nw')}
                  onTouchStart={(e) => handleResizeStart(e, 'nw')}
                />
                <div
                  className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-white border border-green-500 cursor-ne-resize pointer-events-auto z-10"
                  onMouseDown={(e) => handleResizeStart(e, 'ne')}
                  onTouchStart={(e) => handleResizeStart(e, 'ne')}
                />
                <div
                  className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-white border border-green-500 cursor-sw-resize pointer-events-auto z-50"
                  onMouseDown={(e) => handleResizeStart(e, 'sw')}
                  onTouchStart={(e) => handleResizeStart(e, 'sw')}
                />
                <div
                  className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-white border border-green-500 cursor-se-resize pointer-events-auto z-50"
                  onMouseDown={(e) => handleResizeStart(e, 'se')}
                  onTouchStart={(e) => handleResizeStart(e, 'se')}
                />

                {!isSelecting && (
                  <>
                    <button
                      className="absolute -top-3 -left-3 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow-md pointer-events-auto transition-transform hover:scale-110 z-40 flex items-center justify-center w-6 h-6"
                      onClick={handleClearSelection}
                      onMouseDown={(e) => e.stopPropagation()}
                      onTouchStart={(e) => e.stopPropagation()}
                      title="Cancel Selection"
                    >
                      <i className="fi fi-rr-cross text-xs leading-none flex items-center justify-center"></i>
                    </button>
                    <button
                      className="absolute -top-3 -right-3 bg-green-500 hover:bg-green-600 text-white rounded-full p-1 shadow-md pointer-events-auto transition-transform hover:scale-110 z-40 flex items-center justify-center w-6 h-6"
                      onClick={(e) => { e.stopPropagation(); handleAddSelection(); }}
                      onMouseDown={(e) => e.stopPropagation()}
                      onTouchStart={(e) => e.stopPropagation()}
                      title="Add Selection"
                    >
                      <i className="fi fi-rr-plus text-xs leading-none flex items-center justify-center"></i>
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
