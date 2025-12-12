import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import type { DocumentItem } from '../../store/slices/documentsSlice';
import { useAppSelector } from '../../store';
import { loadPdf, renderPageToImage } from '../../utilities/pdfUtils';
import { useSelectionBox } from '../../hooks/useSelectionBox';
// View Components
import { NotesView } from './views/NotesView';
import { QuizView } from './views/QuizView';
import { MCQView } from './views/MCQView';
import { PersonalTricksView } from './views/PersonalTricksView';
import { MindmapView } from './views/MindmapView';
import { LoadingComponent } from '../molecules/LoadingComponent';

interface DocumentModalProps {
  doc: DocumentItem;
  onClose: () => void;
  setSelectedData?: (data: string | null) => void;
  selectedData?: string | null;
  setSelectedDocument?: (data: string | null) => void;
  selectedDocument?: string | null;
  initialPage?: number;
  onPageChange?: (page: number) => void;
}

type ViewMode = 'pdf' | 'notes' | 'quiz' | 'mcq' | 'personalTricks' | 'mindmap';

const DocumentModal: React.FC<DocumentModalProps> = ({
  doc,
  onClose,
  setSelectedData,

  setSelectedDocument,
  initialPage = 1,
  onPageChange,
}) => {
  const navigate = useNavigate();
  const imageRef = useRef<HTMLImageElement>(null);

  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState<number>(initialPage);
  const [viewMode, setViewMode] = useState<ViewMode>('pdf');

  // PDF Rendering & Selection State
  const [pdfDocument, setPdfDocument] = useState<any>(null);
  const [pageImage, setPageImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { user } = useAppSelector((state) => state.auth);

  if (!doc) return null;

  const fileExt = doc.filename?.split('.').pop()?.toLowerCase();
  const isPDF = fileExt === 'pdf';

  // Get valid pages for students (those with transcriptions)
  const validPages = React.useMemo(() => {
    if (user?.role !== 'student') return null;

    if (Array.isArray(doc.notes_description) && doc.notes_description.length > 0) {
      return doc.notes_description
        .map((n: any) => n.page)
        .sort((a: number, b: number) => a - b);
    }
    return [];
  }, [doc.notes_description, user?.role]);

  // Initialize or adjust page number if it's not valid for student
  React.useEffect(() => {
    if (user?.role === 'student' && validPages && validPages.length > 0) {
      if (!validPages.includes(pageNumber)) {
        setPageNumber(validPages[0]);
      }
    }
  }, [validPages, user?.role, pageNumber]);

  // Load PDF Document
  useEffect(() => {
    const loadDocument = async () => {
      if (!doc?.s3_url || !isPDF) {
        setPdfDocument(null);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(doc.s3_url);
        const blob = await response.blob();
        const file = new File([blob], doc.filename, { type: 'application/pdf' });

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
  }, [doc.s3_url, doc.filename, isPDF]);

  // Sync page number with parent
  useEffect(() => {
    if (onPageChange) {
      onPageChange(pageNumber);
    }
  }, [pageNumber, onPageChange]);

  // Render Page to Image
  useEffect(() => {
    const renderPage = async () => {
      if (!pdfDocument || !pageNumber) return;

      setIsLoading(true);
      try {
        const imageUrl = await renderPageToImage(pdfDocument, pageNumber);
        setPageImage(imageUrl);
        setSelectedDocument?.(doc?.notes_description?.[pageNumber - 1]?.transcription as string);
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

  const handleAddSelection = () => {
    const data = getSelectionData();
    if (!data) return;

    const { box_2d, image } = data;

    if (setSelectedData) {
      // Format the selection data as a string or JSON to pass back
      const selectionData = JSON.stringify({
        box_2d,
        page: pageNumber,
        docId: doc.id,
        filename: "page" + pageNumber + "selectedarea" + JSON.stringify(box_2d) + "_" + doc.filename?.split(".").join("_"),
        image
      });
      setSelectedData(selectionData);
    }

    clearSelection();
  };

  const handleClearSelection = (e: React.MouseEvent) => {
    e.stopPropagation();
    clearSelection();
  };

  const goToPrevPage = () => {
    if (user?.role === 'student' && validPages) {
      const currentIndex = validPages.indexOf(pageNumber);
      if (currentIndex > 0) {
        setPageNumber(validPages[currentIndex - 1]);
      }
    } else {
      setPageNumber((prev) => Math.max(1, prev - 1));
    }
  };

  const goToNextPage = () => {
    if (user?.role === 'student' && validPages && validPages.length > 0) {
      const currentIndex = validPages.indexOf(pageNumber);
      if (currentIndex !== -1) {
        if (currentIndex < validPages.length - 1) {
          setPageNumber(validPages[currentIndex + 1]);
        } else {
          // Loop back to first valid page
          setPageNumber(validPages[0]);
        }
      }
    } else {
      setPageNumber((prev) => {
        if (prev >= (numPages || 1)) {
          return 1; // Loop back to first page
        }
        return prev + 1;
      });
    }
  };

  const noteForPage = Array.isArray(doc.notes_description)
    ? doc.notes_description.find((n: any) => n.page === pageNumber)
    : null;

  const renderContentView = () => {
    switch (viewMode) {
      case 'notes':
        return <NotesView pageNumber={pageNumber} noteForPage={noteForPage} onBack={() => setViewMode('pdf')} />;
      case 'quiz':
        return <QuizView pageNumber={pageNumber} noteForPage={noteForPage} onBack={() => setViewMode('pdf')} />;
      case 'mcq':
        return <MCQView pageNumber={pageNumber} noteForPage={noteForPage} onBack={() => setViewMode('pdf')} />;
      case 'personalTricks':
        return <PersonalTricksView pageNumber={pageNumber} noteForPage={noteForPage} onBack={() => setViewMode('pdf')} />;
      case 'mindmap':
        return <MindmapView pageNumber={pageNumber} doc={doc} onBack={() => setViewMode('pdf')} />;
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-white/60 dark:bg-black/80 backdrop-blur-xl" onClick={onClose}>
      <div className="bg-white dark:bg-slate-900 rounded-3xl w-full h-full sm:h-[96vh] max-w-7xl overflow-hidden shadow-2xl flex flex-col border border-white dark:border-slate-800" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="p-3 sm:p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white/80 dark:bg-slate-900/80 backdrop-blur-md flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-logoSky to-logoPurple flex items-center justify-center text-white shadow-md flex-shrink-0">
              <i className="fi fi-rr-document-signed flex items-center justify-center text-lg"></i>
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base truncate">{doc.filename}</h3>
              <p className="text-xs text-slate-500 font-medium">{new Date(doc.created_at).toLocaleDateString()}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-10 h-10 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors text-slate-500 dark:text-slate-400 flex items-center justify-center flex-shrink-0">
            <i className="fi fi-rr-cross-small text-xl flex"></i>
          </button>
        </div>

        {/* Content Area */}
        <div
          className="flex-1 bg-slate-50 dark:bg-black flex overflow-hidden relative min-h-0"
        >
          {viewMode !== 'pdf' ? (
            renderContentView()
          ) : isPDF ? (
            <>
              <div className="flex flex-col items-center justify-center h-full w-full p-2 sm:p-4 relative">

                {isLoading && (
                  <LoadingComponent size="sm" message="Loading..." />
                )}

                {error && (
                  <div className="flex flex-col items-center justify-center h-64 text-red-500">
                    <i className="fi fi-rr-exclamation text-3xl mb-3" />
                    <p className="text-sm font-bold">{error}</p>
                  </div>
                )}

                {!isLoading && !error && pageImage && (
                  <div
                    className="relative"
                    style={{ maxWidth: '100%', maxHeight: '100%', display: 'flex' }}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                  >
                    <img
                      ref={imageRef}
                      src={pageImage}
                      alt={`Page ${pageNumber}`}
                      className={`max-w-full max-h-full object-contain shadow-2xl rounded-lg ${isSelecting ? 'cursor-crosshair' : 'cursor-default'}`}
                      draggable={false}
                    />
                    {selection && (
                      <div
                        className="absolute border-2 border-logoBlue bg-logoBlue/20 z-20 pointer-events-none"
                        style={{
                          left: selection.x,
                          top: selection.y,
                          width: selection.w,
                          height: selection.h
                        }}
                      >
                        {/* Resize Handles */}
                        <div
                          className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-white border border-logoBlue cursor-nw-resize pointer-events-auto z-10 rounded-full"
                          onMouseDown={(e) => handleResizeStart(e, 'nw')}
                          onTouchStart={(e) => handleResizeStart(e, 'nw')}
                        />
                        <div
                          className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-white border border-logoBlue cursor-ne-resize pointer-events-auto z-10 rounded-full"
                          onMouseDown={(e) => handleResizeStart(e, 'ne')}
                          onTouchStart={(e) => handleResizeStart(e, 'ne')}
                        />
                        <div
                          className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-white border border-logoBlue cursor-sw-resize pointer-events-auto z-50 rounded-full"
                          onMouseDown={(e) => handleResizeStart(e, 'sw')}
                          onTouchStart={(e) => handleResizeStart(e, 'sw')}
                        />
                        <div
                          className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-white border border-logoBlue cursor-se-resize pointer-events-auto z-50 rounded-full"
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

              {/* Page Navigation Controls */}
              {numPages && numPages > 1 && (
                <>
                  <button
                    onClick={goToPrevPage}
                    disabled={pageNumber <= 1}
                    className="absolute left-2 lg:left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 hover:bg-white rounded-full shadow-lg flex items-center justify-center text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all hover:scale-110 z-30 ring-1 ring-slate-100"
                  >
                    <i className="fi fi-rr-angle-left text-xl flex items-center justify-center"></i>
                  </button>
                  <button
                    onClick={goToNextPage}
                    disabled={pageNumber >= (numPages || 1)}
                    className="absolute right-2 lg:right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 hover:bg-white rounded-full shadow-lg flex items-center justify-center text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all hover:scale-110 z-30 ring-1 ring-slate-100"
                  >
                    <i className="fi fi-rr-angle-right text-xl flex items-center justify-center"></i>
                  </button>
                  <div className="absolute bottom-1 left-1 text-logoViolet px-2 py-1 rounded-full text-sm font-bold backdrop-blur-md z-10 shadow">
                    {pageNumber}/{numPages}
                  </div>
                </>
              )}

              {/* Floating Action Buttons */}
              <div className="absolute top-2 right-2 lg:right-4 lg:right-4 flex flex-col gap-3 z-30">
                {/* Notes Button */}
                <button
                  onClick={() => setViewMode('notes')}
                  className="w-11 h-11 hover:bg-white text-logoBlue rounded-xl shadow-lg flex items-center justify-center transition-all hover:scale-105 group relative border border-logoBlue"
                >
                  <i className="fi fi-sr-journal-alt text-lg flex items-center justify-center"></i>
                  <span className="absolute right-14 bg-logoBlue text-white text-xs font-bold px-2 py-1.5 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    Notes
                  </span>
                </button>
                {/* Quiz Button */}
                <button
                  onClick={() => setViewMode('quiz')}
                  className="w-11 h-11 hover:bg-white text-logoSky rounded-xl shadow-lg flex items-center justify-center transition-all hover:scale-105 group relative border border-logoSky"
                >
                  <i className="fi fi-sr-test text-lg flex items-center justify-center"></i>
                  <span className="absolute right-14 bg-logoSky text-white text-xs font-bold px-2 py-1.5 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    Quiz
                  </span>
                </button>
                {/* MCQ Button */}
                <button
                  onClick={() => setViewMode('mcq')}
                  className="w-11 h-11 hover:bg-white text-logoPink rounded-xl shadow-lg flex items-center justify-center transition-all hover:scale-105 group relative border border-logoPink"
                >
                  <i className="fi fi-sr-quiz-alt text-lg flex items-center justify-center"></i>
                  <span className="absolute right-14 bg-logoPink text-white text-xs font-bold px-2 py-1.5 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    MCQ
                  </span>
                </button>
                {/* Personal Tricks Button */}
                <button
                  onClick={() => setViewMode('personalTricks')}
                  className="w-11 h-11 hover:bg-white text-logoPurple rounded-xl shadow-lg flex items-center justify-center transition-all hover:scale-105 group relative border border-logoPurple"
                >
                  <i className="fi fi-sr-guide-alt text-lg flex items-center justify-center"></i>
                  <span className="absolute right-14 bg-logoPurple text-white text-xs font-bold px-2 py-1.5 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    Tricks
                  </span>
                </button>
                {/* Mindmap Button */}
                <button
                  onClick={() => setViewMode('mindmap')}
                  className="w-11 h-11 hover:bg-white text-logoViolet rounded-xl shadow-lg flex items-center justify-center transition-all hover:scale-105 group relative border border-logoViolet"
                >
                  <i className="fi fi-sr-network text-lg flex items-center justify-center"></i>
                  <span className="absolute right-14 bg-logoViolet text-white text-xs font-bold px-2 py-1.5 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    Mindmap
                  </span>
                </button>
              </div>
            </>
          ) : (
            <div className="text-center">
              <i className="fi fi-rr-document text-4xl text-slate-300 mb-3 block"></i>
              <p className="text-slate-500 text-sm font-medium">Only PDF files can be previewed</p>
              <button
                onClick={() => navigate(`/documents/${doc.id}`)}
                className="mt-6 px-6 py-2.5 bg-logoBlue text-white rounded-xl text-sm font-bold shadow-lg hover:shadow-logoBlue/30 transition-all hover:-translate-y-0.5"
              >
                Open Full Document
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentModal;
