import { useState, useRef, useCallback } from 'react';
import type { SelectionBox } from '../types';

interface UseSelectionBoxProps {
  imageRef: React.RefObject<HTMLImageElement | null>;
  onSelectionChange?: (selection: SelectionBox | null) => void;
}

export const useSelectionBox = ({ imageRef, onSelectionChange }: UseSelectionBoxProps) => {
  const [selection, setSelection] = useState<SelectionBox | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const startPosRef = useRef<{ x: number; y: number } | null>(null);

  const [resizingHandle, setResizingHandle] = useState<string | null>(null);

  const updateSelection = useCallback((newSelection: SelectionBox | null) => {
    setSelection(newSelection);
    if (onSelectionChange) {
      onSelectionChange(newSelection);
    }
  }, [onSelectionChange]);

  const handleResizeStart = useCallback((e: React.MouseEvent | React.TouchEvent, handle: string) => {
    e.stopPropagation();
    e.preventDefault();
    setResizingHandle(handle);
    setIsSelecting(true); // Treat resizing as selecting state to capture moves
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!imageRef?.current) return;
    // If clicking on a handle (handled by handleResizeStart), don't start new selection
    if (resizingHandle) return;

    e.preventDefault();
    const rect = imageRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    startPosRef.current = { x, y };
    setIsSelecting(true);
    updateSelection({ x, y, w: 0, h: 0 });
  }, [imageRef, updateSelection, resizingHandle]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isSelecting || !imageRef?.current) return;
    e.preventDefault();

    const rect = imageRef.current.getBoundingClientRect();
    const currentX = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const currentY = Math.max(0, Math.min(e.clientY - rect.top, rect.height));

    if (resizingHandle && selection) {
      // Resizing logic
      let newX = selection.x;
      let newY = selection.y;
      let newW = selection.w;
      let newH = selection.h;

      if (resizingHandle.includes('w')) { // West (Left)
        const deltaX = currentX - selection.x;
        const maxDelta = selection.w;
        // Prevent width from going negative
        if (deltaX < maxDelta) {
          newX = currentX;
          newW = selection.w - deltaX;
        }
      } else if (resizingHandle.includes('e')) { // East (Right)
        newW = currentX - selection.x;
      }

      if (resizingHandle.includes('n')) { // North (Top)
        const deltaY = currentY - selection.y;
        const maxDelta = selection.h;
        if (deltaY < maxDelta) {
          newY = currentY;
          newH = selection.h - deltaY;
        }
      } else if (resizingHandle.includes('s')) { // South (Bottom)
        newH = currentY - selection.y;
      }

      // Normalize negative width/height if user dragged past opposite edge
      if (newW < 0) {
        newX += newW;
        newW = Math.abs(newW);
      }
      if (newH < 0) {
        newY += newH;
        newH = Math.abs(newH);
      }

      updateSelection({ x: newX, y: newY, w: newW, h: newH });

    } else if (startPosRef.current) {
      // Creating new selection logic
      const startX = startPosRef.current.x;
      const startY = startPosRef.current.y;

      const width = Math.abs(currentX - startX);
      const height = Math.abs(currentY - startY);
      const x = Math.min(currentX, startX);
      const y = Math.min(currentY, startY);

      updateSelection({ x, y, w: width, h: height });
    }
  }, [isSelecting, imageRef, updateSelection, resizingHandle, selection]);

  const handleMouseUp = useCallback(() => {
    setIsSelecting(false);
    setResizingHandle(null);
    if (selection && (selection.w < 10 || selection.h < 10)) {
      updateSelection(null);
    }
  }, [selection, updateSelection]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (!imageRef?.current) return;
    if (resizingHandle) return;

    const touch = e.touches[0];
    const rect = imageRef.current.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    startPosRef.current = { x, y };
    setIsSelecting(true);
    updateSelection({ x, y, w: 0, h: 0 });
  }, [imageRef, updateSelection, resizingHandle]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isSelecting || !imageRef?.current) return;
    e.preventDefault(); // Prevent scrolling while selecting

    const touch = e.touches[0];
    const rect = imageRef.current.getBoundingClientRect();
    const currentX = Math.max(0, Math.min(touch.clientX - rect.left, rect.width));
    const currentY = Math.max(0, Math.min(touch.clientY - rect.top, rect.height));

    if (resizingHandle && selection) {
      // Resizing logic for touch (same as mouse)
      let newX = selection.x;
      let newY = selection.y;
      let newW = selection.w;
      let newH = selection.h;

      if (resizingHandle.includes('w')) {
        const deltaX = currentX - selection.x;
        if (deltaX < selection.w) {
          newX = currentX;
          newW = selection.w - deltaX;
        }
      } else if (resizingHandle.includes('e')) {
        newW = currentX - selection.x;
      }

      if (resizingHandle.includes('n')) {
        const deltaY = currentY - selection.y;
        if (deltaY < selection.h) {
          newY = currentY;
          newH = selection.h - deltaY;
        }
      } else if (resizingHandle.includes('s')) {
        newH = currentY - selection.y;
      }

      if (newW < 0) { newX += newW; newW = Math.abs(newW); }
      if (newH < 0) { newY += newH; newH = Math.abs(newH); }

      updateSelection({ x: newX, y: newY, w: newW, h: newH });

    } else if (startPosRef.current) {
      const startX = startPosRef.current.x;
      const startY = startPosRef.current.y;

      const width = Math.abs(currentX - startX);
      const height = Math.abs(currentY - startY);
      const x = Math.min(currentX, startX);
      const y = Math.min(currentY, startY);

      updateSelection({ x, y, w: width, h: height });
    }
  }, [isSelecting, imageRef, updateSelection, resizingHandle, selection]);

  const handleTouchEnd = useCallback(() => {
    setIsSelecting(false);
    setResizingHandle(null);
    if (selection && (selection.w < 10 || selection.h < 10)) {
      updateSelection(null);
    }
  }, [selection, updateSelection]);

  const getSelectionData = useCallback(() => {
    if (!selection || !imageRef?.current) return null;

    const rect = imageRef.current.getBoundingClientRect();

    // Convert to normalized coordinates (0-1000)
    const ymin = Math.floor((selection.y / rect.height) * 1000);
    const xmin = Math.floor((selection.x / rect.width) * 1000);
    const ymax = Math.floor(((selection.y + selection.h) / rect.height) * 1000);
    const xmax = Math.floor(((selection.x + selection.w) / rect.width) * 1000);

    const box_2d = [ymin, xmin, ymax, xmax];

    // Create a canvas to crop the image
    const canvas = document.createElement('canvas');
    const scaleX = imageRef.current.naturalWidth / rect.width;
    const scaleY = imageRef.current.naturalHeight / rect.height;

    canvas.width = selection.w * scaleX;
    canvas.height = selection.h * scaleY;

    const ctx = canvas.getContext('2d');
    let base64Image = null;

    if (ctx) {
      ctx.drawImage(
        imageRef.current,
        selection.x * scaleX,
        selection.y * scaleY,
        selection.w * scaleX,
        selection.h * scaleY,
        0,
        0,
        canvas.width,
        canvas.height
      );
      base64Image = canvas.toDataURL('image/jpeg');
    }

    return {
      box_2d,
      image: base64Image
    };
  }, [selection, imageRef]);

  const clearSelection = useCallback(() => {
    updateSelection(null);
  }, [updateSelection]);

  return {
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
    setSelection: updateSelection,
    handleResizeStart
  };
};
