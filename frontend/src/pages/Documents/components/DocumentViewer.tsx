import React, { useEffect, useState, useRef } from "react";

import 'katex/dist/katex.min.css';
import type { SelectionBox } from "../../../types";
import { loadPdf, renderPageToImage } from "../../../utilities/pdfUtils";

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
  const [selection, setSelection] = useState<SelectionBox | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [pdfDocument, setPdfDocument] = useState<any>(null);
  const [pageImage, setPageImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const imageRef = useRef<HTMLImageElement>(null);
  const startPosRef = useRef<{ x: number, y: number } | null>(null);

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

  // --- MANUAL IMAGE CROPPING LOGIC ---

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!imageRef.current || !onImageSelection) return;
    e.preventDefault();
    const rect = imageRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    startPosRef.current = { x, y };
    setIsSelecting(true);
    setSelection({ x, y, w: 0, h: 0 });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isSelecting || !startPosRef.current || !imageRef.current) return;
    e.preventDefault();

    const rect = imageRef.current.getBoundingClientRect();
    const currentX = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const currentY = Math.max(0, Math.min(e.clientY - rect.top, rect.height));

    const startX = startPosRef.current.x;
    const startY = startPosRef.current.y;

    const width = Math.abs(currentX - startX);
    const height = Math.abs(currentY - startY);
    const x = Math.min(currentX, startX);
    const y = Math.min(currentY, startY);

    setSelection({ x, y, w: width, h: height });
  };

  const handleMouseUp = () => {
    setIsSelecting(false);
    if (selection && (selection.w < 10 || selection.h < 10)) {
      setSelection(null);
    }
  };

  // Touch event handlers for mobile support
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!imageRef.current || !onImageSelection) return;
    e.preventDefault();
    const touch = e.touches[0];
    const rect = imageRef.current.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    startPosRef.current = { x, y };
    setIsSelecting(true);
    setSelection({ x, y, w: 0, h: 0 });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isSelecting || !startPosRef.current || !imageRef.current) return;
    e.preventDefault();

    const touch = e.touches[0];
    const rect = imageRef.current.getBoundingClientRect();
    const currentX = Math.max(0, Math.min(touch.clientX - rect.left, rect.width));
    const currentY = Math.max(0, Math.min(touch.clientY - rect.top, rect.height));

    const startX = startPosRef.current.x;
    const startY = startPosRef.current.y;

    const width = Math.abs(currentX - startX);
    const height = Math.abs(currentY - startY);
    const x = Math.min(currentX, startX);
    const y = Math.min(currentY, startY);

    setSelection({ x, y, w: width, h: height });
  };

  const handleTouchEnd = () => {
    setIsSelecting(false);
    if (selection && (selection.w < 10 || selection.h < 10)) {
      setSelection(null);
    }
  };

  const handleAddSelection = () => {
    if (!selection || !imageRef.current || !onImageSelection) return;

    const rect = imageRef.current.getBoundingClientRect();

    // Convert to normalized coordinates (0-1000)
    const ymin = Math.floor((selection.y / rect.height) * 1000);
    const xmin = Math.floor((selection.x / rect.width) * 1000);
    const ymax = Math.floor(((selection.y + selection.h) / rect.height) * 1000);
    const xmax = Math.floor(((selection.x + selection.w) / rect.width) * 1000);

    const box_2d = [ymin, xmin, ymax, xmax];

    onImageSelection({ box_2d, pageNumber });
    setSelection(null);
  };

  const handleClearSelection = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelection(null);
  };
  console.log(selection, isLoading, error);

  return (
    <div className="w-full h-full bg-slate-900 flex flex-col rounded-xl overflow-hidden border border-slate-700 shadow-sm">
      {/* Toolbar */}
      <div className="bg-slate-800 p-2 flex items-center justify-center text-white text-xs z-20 shadow-md shrink-0">

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
          <>
            <img
              ref={imageRef}
              src={pageImage}
              alt={`Page ${pageNumber}`}
              className={`max-w-full max-h-full object-contain shadow-2xl transition-opacity duration-300 ${isSelecting ? 'cursor-crosshair' : 'cursor-default'}`}
              draggable={false}
              onMouseDown={onImageSelection ? handleMouseDown : undefined}
              onMouseMove={onImageSelection ? handleMouseMove : undefined}
              onMouseUp={onImageSelection ? handleMouseUp : undefined}
              onMouseLeave={onImageSelection ? handleMouseUp : undefined}
              onTouchStart={onImageSelection ? handleTouchStart : undefined}
              onTouchMove={onImageSelection ? handleTouchMove : undefined}
              onTouchEnd={onImageSelection ? handleTouchEnd : undefined}
            />

            {/* Selection Overlay */}
            {selection && (
              <div
                className="absolute border-2 border-blue-400 bg-blue-400/20 z-20 pointer-events-none"
                style={{
                  left: selection.x,
                  top: selection.y,
                  width: selection.w,
                  height: selection.h
                }}
              >
                {!isSelecting && (
                  <>
                    <button
                      className="absolute -top-3 -right-3 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow-md pointer-events-auto transition-transform hover:scale-110 z-40 flex items-center justify-center w-6 h-6"
                      onClick={handleClearSelection}
                      title="Cancel Selection"
                    >
                      <i className="fi fi-rr-cross text-[10px] leading-none"></i>
                    </button>

                    <button
                      className="absolute -bottom-10 right-0 bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-full shadow-lg flex items-center gap-2 text-xs font-bold pointer-events-auto transform hover:scale-105 transition-all z-30 whitespace-nowrap"
                      onClick={(e) => { e.stopPropagation(); handleAddSelection(); }}
                    >
                      <i className="fi fi-rr-plus text-xs"></i>
                      Add to Board
                    </button>
                  </>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
