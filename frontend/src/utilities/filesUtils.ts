export function pdfBuffersToUrl(buffers: Array<{ data: number[] } | Buffer>): string {
  // flatten into one big Uint8Array
  const parts = buffers.map(b =>
    b instanceof Uint8Array
      ? b
      : new Uint8Array(b.data) // socket.io often sends Buffers as { type: 'Buffer', data: [...] }
  );
  const totalLength = parts.reduce((acc, p) => acc + p.length, 0);
  const merged = new Uint8Array(totalLength);

  let offset = 0;
  for (const part of parts) {
    merged.set(part, offset);
    offset += part.length;
  }

  // create Blob and Object URL
  const blob = new Blob([merged], { type: "application/pdf" });
  return URL.createObjectURL(blob);
}


export const cleanFilename = (filename: string): string => {
  // Remove leading numbers and dots (e.g., "1. " or "3. ")
  let cleaned = filename.replace(/^\d+\.\s*/, '');
  
  // Remove file extensions
  cleaned = cleaned.replace(/\.(pdf|jpe?g|png)$/i, '');
  
  return cleaned.trim();
};




export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to convert file to base64'));
      }
    };
    reader.onerror = (error) => reject(error);
  });
};

export const stripBase64Prefix = (base64: string): string => {
  return base64.replace(/^data:image\/[a-z]+;base64,/, '');
};

export const getMimeTypeFromBase64 = (base64: string): string => {
  const match = base64.match(/^data:(image\/[a-z]+);base64,/);
  return match ? match[1] : 'image/jpeg';
};

export const cropImage = (base64Image: string, cropRegion: number[]): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!base64Image || typeof base64Image !== 'string') {
        reject(new Error('Invalid image source for cropping'));
        return;
    }

    const img = new Image();
    img.crossOrigin = "anonymous"; 
    
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        
        // Input: [ymin, xmin, ymax, xmax] 0-1000
        let [y1, x1, y2, x2] = cropRegion;

        // Normalize coordinates to ensure min < max
        const ymin = Math.min(y1, y2);
        const ymax = Math.max(y1, y2);
        const xmin = Math.min(x1, x2);
        const xmax = Math.max(x1, x2);

        const naturalWidth = img.naturalWidth;
        const naturalHeight = img.naturalHeight;

        // Calculate pixel coordinates with boundary checks
        const realX = Math.max(0, Math.floor((xmin / 1000) * naturalWidth));
        const realY = Math.max(0, Math.floor((ymin / 1000) * naturalHeight));
        
        // Calculate width/height, ensuring we don't go outside image bounds
        let realW = Math.floor(((xmax - xmin) / 1000) * naturalWidth);
        let realH = Math.floor(((ymax - ymin) / 1000) * naturalHeight);

        // Cap width/height if they exceed image dimensions
        if (realX + realW > naturalWidth) realW = naturalWidth - realX;
        if (realY + realH > naturalHeight) realH = naturalHeight - realY;

        // Safety check for empty crop
        if (realW <= 0 || realH <= 0) {
          console.warn("Invalid crop dimensions, returning original");
          resolve(base64Image); 
          return;
        }

        canvas.width = realW;
        canvas.height = realH;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        // Draw the specific region
        ctx.drawImage(
          img,
          realX, realY, realW, realH, // Source
          0, 0, realW, realH          // Destination
        );

        const quality = 1.0; // High quality for diagrams
        resolve(canvas.toDataURL('image/png', quality));
      } catch (err) {
        reject(err);
      }
    };
    
    img.onerror = (err) => {
        console.error("Image loading failed during crop. Source start:", base64Image.substring(0, 50));
        reject(new Error('Failed to load image for cropping'));
    };
    
    img.src = base64Image;
  });
};
