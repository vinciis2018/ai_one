
import React, { useState, useEffect, useCallback, useRef } from "react";
import type { BlockSettings, ContentBlock, SelectionBox } from "../../../types";
import { cropImage } from "../../../utilities/filesUtils";

interface TranscriptionTabProps {
  pageNumber: number;
  selectedDocument: any;
  notesDescription: any[];
  sentences: string[]; // Kept for compatibility but we use notesDescription source of truth
  updateTranscriptionFromSentences: (newSentences: string[]) => void;
  handleTranscribe: () => void;
  transcriptionStatus: string;
  pageImage?: string | null;
}

export const TranscriptionTab: React.FC<TranscriptionTabProps> = ({
  pageNumber,
  selectedDocument,
  notesDescription,
  updateTranscriptionFromSentences,
  handleTranscribe,
  transcriptionStatus,
  pageImage
}) => {
  const [blocks, setBlocks] = useState<ContentBlock[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [draggedIndices, setDraggedIndices] = useState<number[] | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);

  // Re-crop Modal State
  const [recropBlockId, setRecropBlockId] = useState<string | null>(null);
  const [selection, setSelection] = useState<SelectionBox | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [isSavingCrop, setIsSavingCrop] = useState(false);

  const recropImageRef = useRef<HTMLImageElement>(null);
  const startPosRef = useRef<{ x: number, y: number } | null>(null);

  // Initialize blocks from transcription data
  useEffect(() => {
    const initializeBlocks = async () => {
      setIsInitializing(true);
      const currentPageData = notesDescription.find((note: any) => note.page === pageNumber);

      if (!currentPageData?.transcription) {
        setBlocks([]);
        setIsInitializing(false);
        return;
      }

      try {
        let parsedData: any[] = [];
        const textData = currentPageData.transcription;

        try {
          // Try parsing as JSON first (new format)
          parsedData = JSON.parse(textData);
          if (!Array.isArray(parsedData)) throw new Error("Not array");
        } catch (e) {
          // Fallback: If not JSON, treat as plain text or legacy format
          parsedData = [{ type: 'text', content: textData }];
        }

        const processedBlocks: (ContentBlock | null)[] = await Promise.all(
          parsedData.map(async (item, index) => {
            // Generate a stable-ish ID based on content hash or index to avoid remounts if possible
            const blockId = item.id || `block-${pageNumber}-${index}-${Date.now().toString(36)}`;

            const defaultSettings: BlockSettings = item.type === 'drawing'
              ? { width: 50, align: 'center', ...item.settings }
              : { width: 100, align: 'flex-start', ...item.settings };

            // If it's a drawing with coordinates, we try to crop
            if (item.type === 'drawing' && item.box_2d) {
              // Logic to safely determine the source image for cropping
              let sourceToCrop: string | null = null;

              // 1. Prefer the rendered page image (Base64) passed from parent.
              // This works for both PDFs (rendered page) and Images (loaded base64).
              if (pageImage && typeof pageImage === 'string' && pageImage.startsWith('data:image')) {
                sourceToCrop = pageImage;
              }
              // 2. Fallback to S3 URL ONLY if it is NOT a PDF.
              // cropImage cannot handle PDF URLs.
              else if (selectedDocument?.s3_url) {
                const filename = selectedDocument.filename || "";
                const isPdf = filename.toLowerCase().endsWith('.pdf') ||
                  selectedDocument.s3_url.toLowerCase().endsWith('.pdf');

                if (!isPdf) {
                  sourceToCrop = selectedDocument.s3_url;
                }
              }

              // Only attempt crop if we have a valid image source and don't already have the cropped URL
              if (sourceToCrop && !item.imageUrl) {
                try {
                  const imageUrl = await cropImage(sourceToCrop, item.box_2d);
                  return {
                    id: blockId,
                    type: 'drawing',
                    content: item.content || '',
                    box_2d: item.box_2d,
                    imageUrl: imageUrl,
                    settings: defaultSettings
                  };
                } catch (err) {
                  console.warn("Failed to crop image block", err);
                  // Return block without image if crop fails (placeholder will show)
                  return { ...item, id: blockId, imageUrl: null, settings: defaultSettings };
                }
              }
            }

            return {
              id: blockId,
              type: item.type || 'text',
              content: item.content || '',
              imageUrl: item.imageUrl, // Persist existing imageUrl if present
              box_2d: item.box_2d,
              settings: defaultSettings
            };
          })
        );

        setBlocks(processedBlocks.filter((b): b is ContentBlock => b !== null));
      } catch (err) {
        console.error("Error initializing blocks", err);
        setBlocks([]);
      } finally {
        setIsInitializing(false);
      }
    };

    initializeBlocks();
    // Re-run when pageNumber, transcription content, or pageImage changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageNumber, notesDescription.find((n: any) => n.page === pageNumber)?.transcription, pageImage]);


  // Sync changes back to parent
  const syncToParent = useCallback((newBlocks: ContentBlock[]) => {
    // Serialize blocks to JSON string
    const jsonString = JSON.stringify(newBlocks);
    updateTranscriptionFromSentences([jsonString]);
  }, [updateTranscriptionFromSentences]);


  // --- SELECTION HANDLERS ---
  const toggleSelection = (id: string, multi: boolean) => {
    setSelectedIds(prev => {
      const newSet = new Set(multi ? prev : []);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const selectAll = () => {
    if (selectedIds.size === blocks.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(blocks.map(b => b.id)));
    }
  };

  const deleteSelected = () => {
    if (selectedIds.size === 0) return;
    if (confirm(`Delete ${selectedIds.size} items?`)) {
      const newBlocks = blocks.filter(b => !selectedIds.has(b.id));
      setBlocks(newBlocks);
      setSelectedIds(new Set());
      syncToParent(newBlocks);
    }
  };

  // --- DRAG AND DROP ---
  const handleDragStart = (e: React.DragEvent, index: number, id: string) => {
    let indicesToDrag = [];
    if (!selectedIds.has(id)) {
      setSelectedIds(new Set([id]));
      indicesToDrag = [index];
    } else {
      indicesToDrag = blocks
        .map((b, i) => selectedIds.has(b.id) ? i : -1)
        .filter(i => i !== -1);
    }

    setDraggedIndices(indicesToDrag);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!draggedIndices || dragOverIndex === null) return;

    const targetId = blocks[dragOverIndex].id;
    if (selectedIds.has(targetId)) {
      setDraggedIndices(null);
      setDragOverIndex(null);
      return;
    }

    const itemsToMove = draggedIndices.map(i => blocks[i]);
    const remainingBlocks = blocks.filter((_, i) => !draggedIndices.includes(i));

    let newIndex = remainingBlocks.findIndex(b => b.id === targetId);
    if (newIndex === -1) newIndex = remainingBlocks.length;

    const newBlocks = [...remainingBlocks];
    newBlocks.splice(newIndex, 0, ...itemsToMove);

    setBlocks(newBlocks);
    setDraggedIndices(null);
    setDragOverIndex(null);
    syncToParent(newBlocks);
  };

  // --- BLOCK EDITING ---
  const updateBlockContent = (id: string, text: string) => {
    const newBlocks = blocks.map(b => b.id === id ? { ...b, content: text } : b);
    setBlocks(newBlocks);
    syncToParent(newBlocks);
  };

  const updateBlockSettings = (id: string, updates: Partial<BlockSettings>) => {
    const newBlocks = blocks.map(b => b.id === id ? { ...b, settings: { ...b.settings, ...updates } } : b);
    setBlocks(newBlocks);
    syncToParent(newBlocks);
  };


  // --- RE-CROP LOGIC ---
  const handleInitiateRecrop = (blockId: string) => {
    if (!pageImage) {
      alert("Cannot re-crop: Original page image is missing.");
      return;
    }
    setRecropBlockId(blockId);
    setSelection(null);
  };

  const handleRecropMouseDown = (e: React.MouseEvent) => {
    if (!recropImageRef.current) return;
    e.preventDefault();
    const rect = recropImageRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    startPosRef.current = { x, y };
    setIsSelecting(true);
    setSelection({ x, y, w: 0, h: 0 });
  };

  const handleRecropMouseMove = (e: React.MouseEvent) => {
    if (!isSelecting || !startPosRef.current || !recropImageRef.current) return;
    e.preventDefault();

    const rect = recropImageRef.current.getBoundingClientRect();
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

  const handleRecropMouseUp = () => {
    setIsSelecting(false);
  };

  const saveRecrop = async () => {
    if (!selection || !recropImageRef.current || !recropBlockId || !pageImage) return;
    setIsSavingCrop(true);

    try {
      const rect = recropImageRef.current.getBoundingClientRect();
      const ymin = Math.floor((selection.y / rect.height) * 1000);
      const xmin = Math.floor((selection.x / rect.width) * 1000);
      const ymax = Math.floor(((selection.y + selection.h) / rect.height) * 1000);
      const xmax = Math.floor(((selection.x + selection.w) / rect.width) * 1000);

      const box_2d = [ymin, xmin, ymax, xmax];

      const newImageUrl = await cropImage(pageImage, box_2d);

      const newBlocks = blocks.map(b => b.id === recropBlockId ? {
        ...b,
        imageUrl: newImageUrl,
        box_2d: box_2d
      } : b);

      setBlocks(newBlocks);
      syncToParent(newBlocks);

      setRecropBlockId(null);
      setSelection(null);
    } catch (err) {
      console.error("Failed to re-crop", err);
      alert("Failed to crop image.");
    } finally {
      setIsSavingCrop(false);
    }
  };


  return (
    <div className="flex flex-col h-full " onClick={() => setSelectedIds(new Set())}>
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-white border-b border-gray-200 shrink-0">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-semibold text-gray-700">Page {pageNumber}</h3>
          <button
            onClick={(e) => { e.stopPropagation(); selectAll(); }}
            className="text-xs font-medium text-gray-600 hover:text-blue-600 flex items-center gap-1.5 px-2 py-1 rounded hover:bg-gray-50 transition-colors"
          >
            {selectedIds.size > 0 && selectedIds.size === blocks.length ?
              <i className="fi fi-rr-checkbox flex text-sm"></i> :
              <i className="fi fi-rr-square flex text-sm"></i>
            }
            <span>Select All</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleTranscribe}
            disabled={transcriptionStatus === 'loading'}
            className="px-3 py-1.5 flex items-center gap-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-xs font-medium"
          >
            {transcriptionStatus === 'loading' ? (
              <>
                <i className="fi fi-br-circle animate-spin text-xs"></i>
              </>
            ) : (
              <>
                <i className="fi fi-rr-refresh flex"></i>
              </>
            )}
          </button>
        </div>
      </div>



      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 scroll-smooth rounded-lg">
        {blocks.length > 0 ? (
          <div
            className="mx-auto p-1 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            {blocks.map((block, index) => {
              const isSelected = selectedIds.has(block.id);
              const isDragging = draggedIndices?.includes(index);
              const isDragOver = dragOverIndex === index && !isDragging;

              return (
                <div
                  key={block.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, index, block.id)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDrop={handleDrop}
                  className={`
                      group relative transition-all duration-200 rounded-lg
                      ${isSelected ? 'ring-2 ring-blue-500 bg-blue-50/30' : 'hover:bg-slate-50 ring-1 ring-transparent hover:ring-slate-200'}
                      ${isDragging ? 'opacity-30' : 'opacity-100'}
                      ${isDragOver ? 'border-t-4 border-blue-400 pt-4' : ''}
                    `}
                >
                  {/* Hover Controls */}
                  <div className="absolute -left-8 top-2 bottom-0 w-8 flex flex-col items-end opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="cursor-move p-1 text-slate-300 hover:text-slate-600" title="Drag to move">
                      <i className="fi fi-rr-menu-dots-vertical flex text-lg"></i>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleSelection(block.id, true); }}
                      className={`mt-2 p-1 ${isSelected ? 'text-blue-600' : 'text-slate-300 hover:text-slate-600'}`}
                    >
                      {isSelected ? <i className="fi fi-rr-checkbox flex text-lg"></i> : <i className="fi fi-rr-square flex text-lg"></i>}
                    </button>
                  </div>

                  {/* Floating Action Bar for Selected Block */}
                  {isSelected && (
                    <div className="absolute -bottom-10 right-1 z-50 bg-slate-900 text-white px-3 py-2 rounded-full shadow-xl flex items-center gap-2 lg:gap-4 animate-in fade-in slide-in-from-bottom-2">
                      <span className="font-medium text-xs">
                        {selectedIds.size} <span className="hidden lg:inline">selected</span>
                      </span>
                      <button onClick={(e) => { e.stopPropagation(); deleteSelected(); }} className="flex items-center gap-1 hover:text-red-400 transition-colors text-xs font-medium">
                        <i className="fi fi-rr-trash flex items-center"></i> <span className="hidden lg:inline">Delete</span>
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); setSelectedIds(new Set()); }} className="text-slate-400 hover:text-white text-xs flex items-center gap-1">
                        <i className="fi fi-rr-x flex items-center"></i> <span className="hidden lg:inline">Cancel</span>
                      </button>
                    </div>
                  )}

                  {/* Block Content */}
                  <div className="p-1">
                    {block.type === 'text' ? (
                      <textarea
                        value={block.content}
                        onChange={(e) => updateBlockContent(block.id, e.target.value)}
                        placeholder="Write something..."
                        className="w-full text-sm resize-none bg-transparent outline-none border-none p-2 rounded text-slate-800 leading-relaxed font-normal focus:bg-white focus:ring-1 focus:ring-blue-200"
                        style={{
                          minHeight: '1.5em',
                          height: 'auto',
                          fieldSizing: 'content'
                        } as any}
                        onInput={(e) => {
                          const target = e.target as HTMLTextAreaElement;
                          target.style.height = 'auto';
                          target.style.height = target.scrollHeight + 'px';
                        }}
                      />
                    ) : (
                      <div
                        className="flex flex-col w-full transition-all duration-300"
                        style={{ alignItems: block.settings?.align || 'center' }}
                      >
                        {/* Image Toolbar */}
                        <div className={`
                             mb-2 flex items-center gap-1 border border-slate-200 rounded-lg p-1 scale-90 origin-bottom transition-opacity
                             ${isSelected || isDragging ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}
                          `}>
                          <div className="flex border-r border-slate-100 pr-1 mr-1">
                            {['flex-start', 'center', 'flex-end'].map((align) => (
                              <button
                                key={align}
                                onClick={() => updateBlockSettings(block.id, { align: align as any })}
                                className={`p-1.5 rounded hover:bg-slate-100 ${block.settings?.align === align ? 'text-blue-600 bg-blue-50' : 'text-slate-500'}`}
                              >
                                <i className={`fi fi-rr-align-${align === 'flex-start' ? 'left' : align === 'flex-end' ? 'right' : 'center'} flex text-xs`}></i>
                              </button>
                            ))}
                          </div>
                          <div className="flex items-center gap-1 px-1">
                            {[30, 50, 100].map((width) => (
                              <button
                                key={width}
                                onClick={() => updateBlockSettings(block.id, { width })}
                                className={`p-1 text-xs font-medium rounded hover:bg-slate-100 ${block.settings?.width === width ? 'text-blue-600 bg-blue-50' : 'text-slate-500'}`}
                              >
                                {width === 30 ? 'S' : width === 50 ? 'M' : 'Full'}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div
                          className="relative group/img cursor-pointer"
                          title="Double-click to re-crop"
                          onDoubleClick={() => handleInitiateRecrop(block.id)}
                        >
                          {block.imageUrl ? (
                            <img
                              src={block.imageUrl}
                              alt="Visual"
                              className="rounded-lg shadow-sm border border-slate-100 transition-all duration-300"
                              style={{ width: `${block.settings?.width || 50}%`, maxWidth: '100%' }}
                            />
                          ) : (
                            <div className="w-full h-32 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400">
                              <i className="fi fi-rr-picture text-2xl"></i>
                              <span className="ml-2 text-sm">Waiting for page render...</span>
                            </div>
                          )}
                          {block.content?.includes("Analyzing") && (
                            <div className="absolute top-2 right-2 bg-white/90 p-1.5 rounded-full shadow-sm animate-pulse flex items-center justify-center">
                              <i className="fi fi-rr-magic-wand text-blue-600 text-sm"></i>
                            </div>
                          )}
                          <div className="absolute top-2 left-2 opacity-0 group-hover/img:opacity-100 transition-opacity bg-black/50 text-white text-[10px] px-2 py-0.5 rounded">
                            Double-click to Crop
                          </div>
                        </div>

                        <textarea
                          value={block.content || ''}
                          onChange={(e) => updateBlockContent(block.id, e.target.value)}
                          placeholder="Diagram explanation..."
                          className="w-full mt-3 text-xs bg-transparent text-slate-600 p-3 rounded-lg border border-transparent focus:border-blue-200 outline-none resize-none transition-colors hover:bg-slate-50 text-center"
                          style={{ fieldSizing: 'content', minHeight: '2em' } as any}
                          onInput={(e) => {
                            const target = e.target as HTMLTextAreaElement;
                            target.style.height = 'auto';
                            target.style.height = target.scrollHeight + 'px';
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 border-2 border-dashed border-gray-200 rounded-xl p-8 bg-white/50">
            <div className="p-4 bg-gray-50 rounded-full mb-4">
              <i className="fi fi-rr-document-signed text-3xl opacity-30"></i>
            </div>
            <p className="text-sm font-medium mb-1">Page Empty</p>
            <p className="text-xs text-gray-400 mb-6 max-w-xs text-center">
              No content has been digitized for this page yet.
            </p>
            <button
              onClick={handleTranscribe}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-2"
            >
              <i className="fi fi-rr-magic-wand"></i> Transcribe Page
            </button>
          </div>
        )}
      </div>

      {/* RE-CROP MODAL */}
      {recropBlockId && pageImage && (
        <div className="fixed inset-0 z-50 bg-black/80 flex flex-col animate-in fade-in">
          {/* Header */}
          <div className="bg-slate-900 p-4 flex items-center justify-between text-white border-b border-slate-800">
            <div className="flex items-center gap-3">
              <button onClick={() => setRecropBlockId(null)} className="hover:text-slate-300">
                <i className="fi fi-rr-arrow-small-left text-2xl"></i>
              </button>
              <h3 className="font-semibold">Modify Crop Area</h3>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-400 mr-4">Draw a new box around the area</span>
              <button onClick={() => setRecropBlockId(null)} className="px-4 py-2 text-sm text-slate-300 hover:text-white">Cancel</button>
              <button
                onClick={saveRecrop}
                disabled={!selection || isSavingCrop}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-500 rounded-full font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSavingCrop ? <i className="fi fi-rr-spinner animate-spin"></i> : <i className="fi fi-rr-check"></i>}
                Save Crop
              </button>
            </div>
          </div>

          {/* Editor Area */}
          <div className="flex-1 overflow-auto flex items-center justify-center p-8 cursor-crosshair" onMouseDown={() => setSelection(null)}>
            <div className="relative inline-block shadow-2xl" onMouseDown={(e) => e.stopPropagation()}>
              <img
                ref={recropImageRef}
                src={pageImage}
                alt="Original"
                draggable={false}
                className="max-h-[85vh] max-w-full object-contain"
                onMouseDown={handleRecropMouseDown}
                onMouseMove={handleRecropMouseMove}
                onMouseUp={handleRecropMouseUp}
                onMouseLeave={handleRecropMouseUp}
              />

              {/* Selection Box */}
              {selection && (
                <div
                  className="absolute border-2 border-blue-400 bg-blue-400/20 pointer-events-none"
                  style={{
                    left: selection.x,
                    top: selection.y,
                    width: selection.w,
                    height: selection.h
                  }}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
