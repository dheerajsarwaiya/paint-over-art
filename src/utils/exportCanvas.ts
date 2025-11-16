/**
 * Exports the canvas as an image by combining layers
 * @param sketchImageDataUrl - The sketch image data URL
 * @param paintLayerImageData - The paint layer ImageData
 * @param options - Export options
 * @param options.includeOriginal - Whether to include the original/grayscale image as background
 * @param options.originalImageDataUrl - The original/grayscale image data URL (required if includeOriginal is true)
 * @param options.filename - Optional filename for the exported image
 */
export async function exportCanvasAsImage(
  sketchImageDataUrl: string,
  paintLayerImageData: ImageData,
  options: {
    includeOriginal?: boolean;
    originalImageDataUrl?: string;
    filename?: string;
  } = {}
): Promise<void> {
  const { includeOriginal = false, originalImageDataUrl, filename = 'my-painting.png' } = options;

  try {
    // Create a temporary canvas to combine layers
    const exportCanvas = document.createElement('canvas');
    const ctx = exportCanvas.getContext('2d');
    
    if (!ctx) {
      throw new Error('Failed to get canvas context');
    }

    // Load the sketch image
    const sketchImage = new Image();
    await new Promise<void>((resolve, reject) => {
      sketchImage.onload = () => resolve();
      sketchImage.onerror = () => reject(new Error('Failed to load sketch image'));
      sketchImage.src = sketchImageDataUrl;
    });

    // Set canvas dimensions to match the sketch image
    exportCanvas.width = sketchImage.width;
    exportCanvas.height = sketchImage.height;

    // Layer 1: Background - either original colored image or grayscale sketch
    if (includeOriginal && originalImageDataUrl) {
      // Draw the original colored/posterized image as background
      const originalImage = new Image();
      await new Promise<void>((resolve, reject) => {
        originalImage.onload = () => resolve();
        originalImage.onerror = () => reject(new Error('Failed to load original image'));
        originalImage.src = originalImageDataUrl;
      });
      ctx.drawImage(originalImage, 0, 0);
    } else {
      // Draw the grayscale sketch as background (when not including original)
      ctx.drawImage(sketchImage, 0, 0);
    }

    // Layer 2: User's painting (transparent where not painted)
    const paintCanvas = document.createElement('canvas');
    paintCanvas.width = paintLayerImageData.width;
    paintCanvas.height = paintLayerImageData.height;
    const paintCtx = paintCanvas.getContext('2d');
    
    if (paintCtx) {
      paintCtx.putImageData(paintLayerImageData, 0, 0);
      // Draw the paint canvas onto the export canvas
      ctx.drawImage(paintCanvas, 0, 0);
    }

    // Convert to blob and download
    exportCanvas.toBlob((blob) => {
      if (!blob) {
        throw new Error('Failed to create image blob');
      }

      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up
      URL.revokeObjectURL(url);
    }, 'image/png');
  } catch (error) {
    console.error('Export failed:', error);
    throw error;
  }
}
