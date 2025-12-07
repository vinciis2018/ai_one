import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import type { DocumentItem } from '../../../store/slices/documentsSlice';
import { useAppSelector } from '../../../store';
import { loadPdf, renderPageToImage } from '../../../utilities/pdfUtils';
import { useSelectionBox } from '../../../hooks/useSelectionBox';

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

type ViewMode = 'pdf' | 'notes' | 'quiz' | 'mcq' | 'personalTricks';

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

    console.log("Selected Box:", box_2d, "Page:", pageNumber);

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
    if (viewMode === 'notes') {
      return (
        <div className="h-full w-full bg-gradient-to-br from-orange-50/50 to-white overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                  <i className="fi fi-rr-magic-wand text-white text-lg"></i>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-400">Quick Notes</h2>
                  <p className="text-sm text-gray-500">Page {pageNumber}</p>
                </div>
              </div>
              <button
                onClick={() => setViewMode('pdf')}
                className="px-4 py-2 bg-white hover:bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors flex items-center gap-2 shadow-sm"
              >
                <i className="fi fi-rr-arrow-left text-xs"></i>
                Back to PDF
              </button>
            </div>
            {noteForPage?.notes ? (
              <div className="bg-white rounded-2xl border border-orange-100 shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-orange-50 to-orange-100/50 px-6 py-3 border-b border-orange-200">
                  <p className="text-xs font-semibold text-orange-800 uppercase tracking-wide">Educational Notes</p>
                </div>
                <div className="p-6">
                  <div className="prose prose-sm max-w-none text-gray-700 prose-headings:text-gray-900 prose-p:leading-relaxed prose-li:leading-relaxed prose-strong:text-gray-900">
                    <ReactMarkdown>
                      {noteForPage.notes}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-orange-200">
                <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fi fi-rr-magic-wand text-3xl text-orange-400"></i>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Notes Available</h3>
                <p className="text-gray-500 text-sm">Notes haven't been generated for this page yet.</p>
              </div>
            )}
          </div>
        </div>
      );
    }

    if (viewMode === 'quiz') {
      const quiz = noteForPage?.quiz;
      return (
        <div className="h-full w-full bg-white overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-violet-100 rounded-lg flex items-center justify-center">
                  <i className="fi fi-rr-list-check text-violet-600"></i>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Quiz Questions</h2>
                  <p className="text-sm text-gray-500">Page {pageNumber}</p>
                </div>
              </div>
              <button
                onClick={() => setViewMode('pdf')}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors flex items-center gap-2"
              >
                <i className="fi fi-rr-arrow-left text-xs"></i>
                Back to PDF
              </button>
            </div>
            {quiz && (quiz.easy?.length > 0 || quiz.medium?.length > 0 || quiz.hard?.length > 0) ? (
              <div className="space-y-6">
                {quiz.easy && quiz.easy.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-green-700 mb-3 flex items-center gap-2">
                      <span className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center text-xs">E</span>
                      Easy Questions
                    </h3>
                    <div className="space-y-3">
                      {quiz.easy.map((q: string, i: number) => (
                        <div key={i} className="bg-green-50 border border-green-200 rounded-lg p-4">
                          <p className="text-sm font-medium text-gray-800">{i + 1}. {q}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {quiz.medium && quiz.medium.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-yellow-700 mb-3 flex items-center gap-2">
                      <span className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center text-xs">M</span>
                      Medium Questions
                    </h3>
                    <div className="space-y-3">
                      {quiz.medium.map((q: string, i: number) => (
                        <div key={i} className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                          <p className="text-sm font-medium text-gray-800">{i + 1}. {q}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {quiz.hard && quiz.hard.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-red-700 mb-3 flex items-center gap-2">
                      <span className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center text-xs">H</span>
                      Hard Questions
                    </h3>
                    <div className="space-y-3">
                      {quiz.hard.map((q: string, i: number) => (
                        <div key={i} className="bg-red-50 border border-red-200 rounded-lg p-4">
                          <p className="text-sm font-medium text-gray-800">{i + 1}. {q}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                <i className="fi fi-rr-list-check text-4xl text-gray-300 mb-3 block"></i>
                <p className="text-gray-500">No quiz questions available for this page</p>
              </div>
            )}
          </div>
        </div>
      );
    }

    if (viewMode === 'mcq') {
      const mcq = noteForPage?.mcq;
      return (
        <div className="h-full w-full bg-white overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <i className="fi fi-rr-checkbox text-indigo-600"></i>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Multiple Choice Questions</h2>
                  <p className="text-sm text-gray-500">Page {pageNumber}</p>
                </div>
              </div>
              <button
                onClick={() => setViewMode('pdf')}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors flex items-center gap-2"
              >
                <i className="fi fi-rr-arrow-left text-xs"></i>
                Back to PDF
              </button>
            </div>
            {mcq && (mcq.easy?.length > 0 || mcq.medium?.length > 0 || mcq.hard?.length > 0) ? (
              <div className="space-y-6">
                {mcq.easy && mcq.easy.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-green-700 mb-3 flex items-center gap-2">
                      <span className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center text-xs">E</span>
                      Easy Questions
                    </h3>
                    <div className="space-y-4">
                      {mcq.easy.map((q: any, i: number) => (
                        <div key={i} className="bg-green-50 border border-green-200 rounded-lg p-4">
                          <p className="text-sm font-semibold text-gray-900 mb-3">{i + 1}. {q.question}</p>
                          <div className="space-y-2 ml-4">
                            {q.options?.map((opt: string, j: number) => (
                              <div key={j} className={`text-sm p-2 rounded ${opt === q.answer ? 'bg-green-200 font-medium' : 'bg-white'}`}>
                                {String.fromCharCode(65 + j)}. {opt}
                              </div>
                            ))}
                          </div>
                          <p className="text-xs text-green-700 mt-2 font-medium">✓ Answer: {q.answer}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {mcq.medium && mcq.medium.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-yellow-700 mb-3 flex items-center gap-2">
                      <span className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center text-xs">M</span>
                      Medium Questions
                    </h3>
                    <div className="space-y-4">
                      {mcq.medium.map((q: any, i: number) => (
                        <div key={i} className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                          <p className="text-sm font-semibold text-gray-900 mb-3">{i + 1}. {q.question}</p>
                          <div className="space-y-2 ml-4">
                            {q.options?.map((opt: string, j: number) => (
                              <div key={j} className={`text-sm p-2 rounded ${opt === q.answer ? 'bg-yellow-200 font-medium' : 'bg-white'}`}>
                                {String.fromCharCode(65 + j)}. {opt}
                              </div>
                            ))}
                          </div>
                          <p className="text-xs text-yellow-700 mt-2 font-medium">✓ Answer: {q.answer}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {mcq.hard && mcq.hard.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-red-700 mb-3 flex items-center gap-2">
                      <span className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center text-xs">H</span>
                      Hard Questions
                    </h3>
                    <div className="space-y-4">
                      {mcq.hard.map((q: any, i: number) => (
                        <div key={i} className="bg-red-50 border border-red-200 rounded-lg p-4">
                          <p className="text-sm font-semibold text-gray-900 mb-3">{i + 1}. {q.question}</p>
                          <div className="space-y-2 ml-4">
                            {q.options?.map((opt: string, j: number) => (
                              <div key={j} className={`text-sm p-2 rounded ${opt === q.answer ? 'bg-red-200 font-medium' : 'bg-white'}`}>
                                {String.fromCharCode(65 + j)}. {opt}
                              </div>
                            ))}
                          </div>
                          <p className="text-xs text-red-700 mt-2 font-medium">✓ Answer: {q.answer}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                <i className="fi fi-rr-checkbox text-4xl text-gray-300 mb-3 block"></i>
                <p className="text-gray-500">No MCQ questions available for this page</p>
              </div>
            )}
          </div>
        </div>
      );
    }

    if (viewMode === 'personalTricks') {
      const tricks = noteForPage?.personal_tricks;
      return (
        <div className="h-full w-full bg-white overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <i className="fi fi-rr-lightbulb text-blue-600"></i>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Personal Tricks</h2>
                  <p className="text-sm text-gray-500">Page {pageNumber}</p>
                </div>
              </div>
              <button
                onClick={() => setViewMode('pdf')}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors flex items-center gap-2"
              >
                <i className="fi fi-rr-arrow-left text-xs"></i>
                Back to PDF
              </button>
            </div>
            {tricks && tricks.length > 0 ? (
              <div className="space-y-3">
                {tricks.map((trick: string, i: number) => (
                  <div key={i} className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                      <i className="fi fi-rr-lightbulb text-blue-600 text-sm"></i>
                    </div>
                    <p className="flex-1 text-sm text-gray-800 leading-relaxed">{trick}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                <i className="fi fi-rr-lightbulb text-4xl text-gray-300 mb-3 block"></i>
                <p className="text-gray-500">No personal tricks available for this page</p>
              </div>
            )}
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full h-full sm:h-[96vh] max-w-6xl overflow-hidden shadow-2xl flex flex-col" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="p-2 sm:p-3 border-b border-gray-100 flex items-center justify-between bg-gray-50 flex-shrink-0">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600 flex-shrink-0">
              <i className="fi fi-rr-document-signed text-xs sm:text-sm"></i>
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-gray-900 text-xs sm:text-sm truncate">{doc.filename}</h3>
              <p className="text-[10px] sm:text-xs text-gray-500">{new Date(doc.created_at).toLocaleDateString()}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 sm:p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500 flex-shrink-0">
            <i className="fi fi-rr-cross-small text-lg sm:text-xl flex"></i>
          </button>
        </div>

        {/* Content Area */}
        <div
          className="flex-1 bg-gray-900 flex items-center justify-center overflow-hidden relative min-h-0"
        >
          {viewMode !== 'pdf' ? (
            renderContentView()
          ) : isPDF ? (
            <>
              <div className="flex flex-col items-center justify-center h-full w-full p-2 sm:p-4 relative">

                {isLoading && (
                  <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                    <i className="fi fi-br-circle animate-spin text-3xl mb-3" />
                    <p className="text-sm">Loading PDF...</p>
                  </div>
                )}

                {error && (
                  <div className="flex flex-col items-center justify-center h-64 text-red-500">
                    <i className="fi fi-rr-exclamation text-3xl mb-3" />
                    <p className="text-sm">{error}</p>
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
                      className={`max-w-full max-h-full object-contain shadow-2xl ${isSelecting ? 'cursor-crosshair' : 'cursor-default'}`}
                      draggable={false}
                    />
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

              {/* Page Navigation Controls */}
              {numPages && numPages > 1 && (
                <>
                  <button
                    onClick={goToPrevPage}
                    disabled={pageNumber <= 1}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 hover:bg-white rounded-full shadow-lg flex items-center justify-center text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all hover:scale-110 z-30"
                  >
                    <i className="fi fi-rr-angle-left text-xl flex"></i>
                  </button>
                  <button
                    onClick={goToNextPage}
                    disabled={pageNumber >= (numPages || 1)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 hover:bg-white rounded-full shadow-lg flex items-center justify-center text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all hover:scale-110 z-30"
                  >
                    <i className="fi fi-rr-angle-right text-xl flex"></i>
                  </button>
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm z-30">
                    Page {pageNumber} of {numPages}
                  </div>
                </>
              )}

              {/* Floating Action Buttons */}
              <div className="absolute top-4 right-4 flex flex-col gap-3 z-30">
                {/* Notes Button */}
                <button
                  onClick={() => setViewMode('notes')}
                  className="w-14 h-14 bg-orange-500 hover:bg-orange-600 text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110 group relative"
                  title="View Notes"
                >
                  <i className="fi fi-rr-magic-wand text-lg flex"></i>
                  <span className="absolute right-16 bg-black/80 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                    Notes
                  </span>
                </button>
                {/* Quiz Button */}
                <button
                  onClick={() => setViewMode('quiz')}
                  className="w-14 h-14 bg-violet-500 hover:bg-violet-600 text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110 group relative"
                  title="View Quiz"
                >
                  <i className="fi fi-rr-list-check text-lg flex"></i>
                  <span className="absolute right-16 bg-black/80 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                    Quiz
                  </span>
                </button>
                {/* MCQ Button */}
                <button
                  onClick={() => setViewMode('mcq')}
                  className="w-14 h-14 bg-indigo-500 hover:bg-indigo-600 text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110 group relative"
                  title="View MCQ"
                >
                  <i className="fi fi-rr-checkbox text-lg flex"></i>
                  <span className="absolute right-16 bg-black/80 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                    MCQ
                  </span>
                </button>
                {/* Personal Tricks Button */}
                <button
                  onClick={() => setViewMode('personalTricks')}
                  className="w-14 h-14 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110 group relative"
                  title="View Personal Tricks"
                >
                  <i className="fi fi-rr-lightbulb text-lg flex"></i>
                  <span className="absolute right-16 bg-black/80 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                    Personal Tricks
                  </span>
                </button>
                {/* Full View Button */}
                {user?.role === "teacher" && (
                  <button
                    onClick={() => navigate(`/documents/${doc.id}`)}
                    className="w-14 h-14 bg-gray-800 hover:bg-black text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110 group relative"
                    title="Open Full Document"
                  >
                    <i className="fi fi-rr-expand text-lg flex"></i>
                    <span className="absolute right-16 bg-black/80 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                      Full View
                    </span>
                  </button>
                )}

              </div>
            </>
          ) : (
            <div className="text-center">
              <i className="fi fi-rr-document text-4xl text-gray-300 mb-3 block"></i>
              <p className="text-gray-500 text-sm">Only PDF files can be previewed</p>
              <button
                onClick={() => navigate(`/documents/${doc.id}`)}
                className="mt-4 px-4 py-2 bg-white text-gray-800 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors"
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
